"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  type SyntheticEvent,
} from "react";
import {
  loginDoctor,
  logoutDoctor,
  getDoctorAppointments,
  updateAppointmentStatus,
  updateDoctorSettings,
  getWhatsAppLogs,
  getCurrentDoctor,
} from "../actions";
import {
  LogOut,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  FileText,
  Settings,
  MessageCircle,
  Activity,
  ClipboardList,
} from "lucide-react";
import { Doctor, Appointment, WhatsAppLog, DoctorFormData } from "./types";
import DoctorForm from "./forms/DoctorForm";
import SearchBar from "./SearchBar";


export default function DoctorDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<
    "appointments" | "settings" | "logs"
  >("appointments");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "time" | "status">("date");
  const [filterMode, setFilterMode] = useState<
    "all" | "date" | "month" | "year"
  >("date");
  const [monthFilter, setMonthFilter] = useState(""); // "2026-06"
  const [yearFilter, setYearFilter] = useState(""); // "2026"
  const [timeFilter, setTimeFilter] = useState(""); // "07:00"
  const [statusFilter, setStatusFilter] = useState(""); // "CONFIRMED" | ""
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<DoctorFormData>({
    name: "",
    phone: "",
    specialization: "",
    slotDuration: 30,
    workStartTime: "07:00",
    workEndTime: "11:00",
    weekends: "6,0",
    disabledDates: "",
    education: "",
    experienceYears: 0,
    description: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  // WhatsApp logs
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const result = await loginDoctor(phone, password);
      if (result.success) {
        setIsLoggedIn(true);
        showToast("Вход выполнен успешно");
      } else {
        setLoginError(result.error || "Ошибка входа");
      }
    } catch {
      setLoginError("Ошибка сервера");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutDoctor();
    setIsLoggedIn(false);
    setPassword("");
    setAppointments([]);
    setDoctorProfile(null);
    setActiveTab("appointments");
  };

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      // Only pass a specific date to the server when in 'date' mode
      const serverDate =
        filterMode === "date" ? dateFilter || undefined : undefined;
      const appts = await getDoctorAppointments(serverDate);
      let data = [...(appts as Appointment[])];

      // Client-side month filter
      if (filterMode === "month" && monthFilter) {
        data = data.filter((a) => a.date.startsWith(monthFilter)); // e.g. "2026-06"
      }

      // Client-side year filter
      if (filterMode === "year" && yearFilter) {
        data = data.filter((a) => a.date.startsWith(yearFilter)); // e.g. "2026"
      }

      // Client-side time filter
      if (timeFilter) {
        data = data.filter((a) => a.time.startsWith(timeFilter));
      }

      // Client-side status filter
      if (statusFilter) {
        data = data.filter((a) => a.status === statusFilter);
      }

      // Sorting (keep your existing switch)
      switch (sortBy) {
        case "status":
          data.sort((a, b) => a.status.localeCompare(b.status));
          break;

        case "time":
          data.sort((a, b) => a.time.localeCompare(b.time));
          break;

        case "date":
        default:
          data.sort(
            (a, b) =>
              b.date.localeCompare(a.date) || a.time.localeCompare(b.time),
          );
      }

      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      showToast("Ошибка загрузки записей", "error");
    } finally {
      setLoading(false);
    }
  }, [
    dateFilter,
    filterMode,
    monthFilter,
    yearFilter,
    timeFilter,
    statusFilter,
    sortBy,
  ]);

  const fetchDoctorProfile = useCallback(async () => {
    try {
      const doc = await getCurrentDoctor();
      if (doc) {
        setDoctorProfile(doc as Doctor);
        setSettingsForm({
          name: doc.name,
          phone: doc.phone,
          specialization: doc.specialization,
          slotDuration: doc.slotDuration,
          workStartTime: doc.workStartTime,
          workEndTime: doc.workEndTime,
          weekends: doc.weekends,
          disabledDates: doc.disabledDates,
          education: doc.education ?? "",
          experienceYears: doc.experienceYears ?? 0,
          description: doc.description ?? "",
        });
      }
    } catch (err) {
      console.error("Error fetching doctor profile:", err);
    }
  }, []);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const result = await getWhatsAppLogs();
      setLogs(result as WhatsAppLog[]);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const filteredAppointments = React.useMemo(() => {
    return appointments.filter(appt => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return appt.patientName.toLowerCase().includes(q) ||
             appt.patientPhone.toLowerCase().includes(q) ||
             (appt.complaint && appt.complaint.toLowerCase().includes(q));
    });
  }, [appointments, searchQuery]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!cancelled) await fetchAppointments();
      if (!cancelled) await fetchDoctorProfile();
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fetchAppointments, fetchDoctorProfile]);
  const handleStatusChange = async (
    appointmentId: number,
    newStatus: string,
  ) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      showToast(`Статус записи обновлен: ${newStatus}`);
      fetchAppointments();
    } catch {
      showToast("Ошибка при обновлении статуса", "error");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg("");
    try {
      await updateDoctorSettings({
        name: settingsForm.name,
        phone: settingsForm.phone,
        specialization: settingsForm.specialization,
        slotDuration: settingsForm.slotDuration,
        workStartTime: settingsForm.workStartTime,
        workEndTime: settingsForm.workEndTime,
        weekends: settingsForm.weekends,
        disabledDates: settingsForm.disabledDates,
        education: settingsForm.education ?? '',
        experienceYears: settingsForm.experienceYears ?? 0,
        description: settingsForm.description ?? '',
      });
      setSettingsMsg("Настройки сохранены");
      showToast("Настройки профиля сохранены");
      fetchDoctorProfile();
    } catch {
      setSettingsMsg("Ошибка сохранения");
      showToast("Ошибка сохранения настроек", "error");
    } finally {
      setSavingSettings(false);
    }
  };



  const statusLabels: Record<string, string> = {
    PENDING: "Ожидает",
    CONFIRMED: "Подтверждён",
    COMPLETED: "Завершён",
    CANCELLED: "Отменён",
  };

  const statusBadgeClass: Record<string, string> = {
    PENDING: "badge-pending",
    CONFIRMED: "badge-confirmed",
    COMPLETED: "badge-completed",
    CANCELLED: "badge-cancelled",
  };

  // ────────────────── LOGIN SCREEN ──────────────────

  // ────────────────── DASHBOARD ──────────────────
  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "PENDING").length,
    confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
  };

  return (
    <div
      className="container"
      style={{ paddingTop: "2rem", paddingBottom: "3rem" }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            right: "20px",
            zIndex: 9999,
            padding: "0.75rem 1.25rem",
            borderRadius: "10px",
            background:
              toast.type === "success"
                ? "var(--color-primary)"
                : "var(--color-danger)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.9rem",
            boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}>
            Добро пожаловать, {doctorProfile?.name?.split(" ")[0] || "Доктор"}
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ gap: "0.4rem" }}
        >
          <LogOut size={16} /> Выйти
        </button>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[
          {
            label: "Всего записей",
            value: stats.total,
            color: "var(--color-info)",
            icon: <ClipboardList size={20} />,
          },
          {
            label: "Ожидают",
            value: stats.pending,
            color: "var(--color-warning)",
            icon: <Clock size={20} />,
          },
          {
            label: "Подтверждено",
            value: stats.confirmed,
            color: "var(--color-accent)",
            icon: <Activity size={20} />,
          },
          {
            label: "Завершено",
            value: stats.completed,
            color: "var(--color-primary)",
            icon: <CheckCircle size={20} />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-panel"
            style={{
              padding: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                padding: "0.6rem",
                borderRadius: "10px",
                background: `${stat.color}15`,
                color: stat.color,
              }}
            >
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          marginBottom: "1.5rem",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "12px",
          padding: "0.25rem",
          border: "1px solid var(--border-color)",
        }}
      >
        {[
          {
            key: "appointments" as const,
            label: "Записи",
            icon: <Calendar size={16} />,
          },
          {
            key: "settings" as const,
            label: "Настройки",
            icon: <Settings size={16} />,
          },
          {
            key: "logs" as const,
            label: "WhatsApp Логи",
            icon: <MessageCircle size={16} />,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSearchQuery("");
              if (tab.key === "logs") fetchLogs();
            }}
            className="btn"
            style={{
              flex: 1,
              padding: "0.65rem 1rem",
              background:
                activeTab === tab.key
                  ? "rgba(255,255,255,0.08)"
                  : "transparent",
              color:
                activeTab === tab.key
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
              border: "none",
              borderRadius: "10px",
              fontWeight: activeTab === tab.key ? 700 : 500,
              transition: "all 0.2s ease",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: Appointments ─── */}
      {activeTab === "appointments" && (
        <div className="animate-fade-in">
          {/* Date selector */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {/* Mode selector */}
            <select
              className="form-control"
              style={{ width: "auto" }}
              value={filterMode}
              onChange={(e) =>
                setFilterMode(
                  e.target.value as "all" | "date" | "month" | "year",
                )
              }
            >
              <option value="all">Все записи</option>
              <option value="date">По дате</option>
              <option value="month">По месяцу</option>
              <option value="year">По году</option>
            </select>

            {/* Conditional date/month/year input */}
            {filterMode === "date" && (
              <input
                type="date"
                className="form-control"
                style={{ width: "auto" }}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            )}
            {filterMode === "month" && (
              <>
                <select
                  className="form-control"
                  style={{ width: "auto" }}
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(e.target.value);
                    setMonthFilter(""); // reset month when year changes
                  }}
                >
                  <option value="">Выберите год</option>
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - 2 + i,
                  ).map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>

                <select
                  className="form-control"
                  style={{ width: "auto" }}
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                >
                  <option value="">Выберите месяц</option>
                  {[
                    "Январь",
                    "Февраль",
                    "Март",
                    "Апрель",
                    "Май",
                    "Июнь",
                    "Июль",
                    "Август",
                    "Сентябрь",
                    "Октябрь",
                    "Ноябрь",
                    "Декабрь",
                  ].map((name, i) => {
                    const val = `${yearFilter || new Date().getFullYear()}-${String(i + 1).padStart(2, "0")}`;
                    return (
                      <option key={val} value={val}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </>
            )}
            {filterMode === "year" && (
              <select
                className="form-control"
                style={{ width: "auto" }}
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="">Выберите год</option>
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - 2 + i,
                ).map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            )}
            {/* Time filter */}
            <input
              type="time"
              className="form-control"
              style={{ width: "auto" }}
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              title="Фильтр по времени"
            />

            {/* Status filter */}
            <select
              className="form-control"
              style={{ width: "auto" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Все статусы</option>
              <option value="PENDING">Ожидает</option>
              <option value="CONFIRMED">Подтверждён</option>
              <option value="COMPLETED">Завершён</option>
              <option value="CANCELLED">Отменён</option>
            </select>

            {/* Sort */}
            <select
              className="form-control"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "date" | "time" | "status")
              }
              style={{ width: "auto" }}
            >
              <option value="date">Сортировать по дате</option>
              <option value="time">Сортировать по времени</option>
              <option value="status">Сортировать по статусу</option>
            </select>

            <button
              onClick={fetchAppointments}
              className="btn btn-accent"
              style={{ padding: "0.6rem 1.2rem" }}
            >
              Обновить
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: "1.5rem", maxWidth: "480px" }}>
            <SearchBar<Appointment>
              key="doctor-search-appointments"
              items={appointments}
              placeholder="Поиск по имени, телефону или жалобе... (Enter)"
              getSearchText={appt => `${appt.patientName} ${appt.patientPhone} ${appt.complaint || ''}`}
              getDisplayValue={appt => appt.patientName}
              onSearch={setSearchQuery}
              onQueryChange={q => { if (!q) setSearchQuery(''); }}
              onSelect={appt => {}}
              renderItem={(appt, active) => (
                <div style={{ padding: '0.6rem 1rem', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{appt.patientName}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {appt.date} {appt.time} · {appt.patientPhone}
                  </span>
                </div>
              )}
            />
          </div>

          {searchQuery && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Результаты для: <strong>«{searchQuery}»</strong>
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', fontSize: '0.82rem', padding: 0 }}
              >
                × Сбросить
              </button>
            </div>
          )}

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "var(--text-muted)",
              }}
            >
              Загрузка записей...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div
              className="glass-panel"
              style={{ padding: "3rem", textAlign: "center" }}
            >
              <Calendar
                size={48}
                style={{ color: "var(--text-muted)", marginBottom: "1rem" }}
              />
              <h3 style={{ color: "var(--text-secondary)" }}>
                {searchQuery ? "Ничего не найдено" : "Нет записей"}
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  marginTop: "0.5rem",
                }}
              >
                {searchQuery ? "Попробуйте изменить поисковый запрос" : "Попробуйте выбрать другую дату"}
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {filteredAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="glass-panel"
                  style={{
                    padding: "1.5rem",
                    borderLeft: `3px solid ${
                      appt.status === "CONFIRMED"
                        ? "var(--color-accent)"
                        : appt.status === "COMPLETED"
                          ? "var(--color-primary)"
                          : appt.status === "CANCELLED"
                            ? "var(--color-danger)"
                            : "var(--color-warning)"
                    }`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    {/* Left side: patient info */}
                    <div style={{ flex: 1, minWidth: "250px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <Clock
                          size={14}
                          style={{ color: "var(--color-accent)" }}
                        />
                        <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                          {appt.date},{appt.time}
                        </span>
                        <span
                          className={`badge ${statusBadgeClass[appt.status]}`}
                        >
                          {statusLabels[appt.status]}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.35rem",
                        }}
                      >
                        <User
                          size={14}
                          style={{ color: "var(--text-muted)" }}
                        />
                        <span style={{ fontWeight: 600 }}>
                          {appt.patientName}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.35rem",
                        }}
                      >
                        <Phone
                          size={14}
                          style={{ color: "var(--text-muted)" }}
                        />
                        <span
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.9rem",
                          }}
                        >
                          {appt.patientPhone}
                        </span>
                      </div>
                      <div
                        style={{
                          marginTop: "0.5rem",
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <strong>Жалоба:</strong> {appt.complaint}
                      </div>
                      {appt.filePath && (
                        <a
                          href={appt.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            marginTop: "0.5rem",
                            color: "var(--color-accent)",
                            fontSize: "0.85rem",
                            textDecoration: "underline",
                          }}
                        >
                          <FileText size={14} /> Прикрепленный файл
                        </a>
                      )}
                    </div>

                    {/* Right side: action buttons */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        minWidth: "150px",
                      }}
                    >
                      {appt.status === "PENDING" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(appt.id, "CONFIRMED")
                            }
                            className="btn btn-accent"
                            style={{
                              padding: "0.5rem 1rem",
                              fontSize: "0.85rem",
                            }}
                          >
                            <CheckCircle size={14} /> Подтвердить
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(appt.id, "CANCELLED")
                            }
                            className="btn btn-danger"
                            style={{
                              padding: "0.5rem 1rem",
                              fontSize: "0.85rem",
                            }}
                          >
                            <XCircle size={14} /> Отменить
                          </button>
                        </>
                      )}
                      {appt.status === "CONFIRMED" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(appt.id, "COMPLETED")
                            }
                            className="btn btn-primary"
                            style={{
                              padding: "0.5rem 1rem",
                              fontSize: "0.85rem",
                            }}
                          >
                            <CheckCircle size={14} /> Завершить
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(appt.id, "CANCELLED")
                            }
                            className="btn btn-danger"
                            style={{
                              padding: "0.5rem 1rem",
                              fontSize: "0.85rem",
                            }}
                          >
                            <XCircle size={14} /> Отменить
                          </button>
                        </>
                      )}
                      {(appt.status === "COMPLETED" ||
                        appt.status === "CANCELLED") && (
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            textAlign: "center",
                          }}
                        >
                          Завершено
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: Settings ─── */}
      {activeTab === "settings" && (
        <div className="animate-fade-in">
          <DoctorForm
            isAdmin={false}
            form={settingsForm}
            onChange={setSettingsForm}
            onSubmit={handleSaveSettings}
            saving={savingSettings}
          />
        </div>
      )}

      {/* ─── TAB: WhatsApp Logs ─── */}
      {activeTab === "logs" && (
        <div className="animate-fade-in">
          {loadingLogs ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "var(--text-muted)",
              }}
            >
              Загрузка логов...
            </div>
          ) : logs.length === 0 ? (
            <div
              className="glass-panel"
              style={{ padding: "3rem", textAlign: "center" }}
            >
              <MessageCircle
                size={48}
                style={{ color: "var(--text-muted)", marginBottom: "1rem" }}
              />
              <h3 style={{ color: "var(--text-secondary)" }}>
                Нет отправленных сообщений
              </h3>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="glass-panel"
                  style={{
                    padding: "1.25rem",
                    borderLeft: `3px solid ${
                      log.status === "SIMULATED"
                        ? "var(--color-accent)"
                        : log.status === "SENT"
                          ? "var(--color-primary)"
                          : "var(--color-danger)"
                    }`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <MessageCircle
                        size={14}
                        style={{ color: "var(--color-accent)" }}
                      />
                      <span style={{ fontWeight: 600 }}>
                        {log.recipientName}
                      </span>
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {log.recipientPhone}
                      </span>
                    </div>
                    <span
                      className={`badge ${log.status === "SIMULATED" ? "badge-confirmed" : log.status === "SENT" ? "badge-completed" : "badge-cancelled"}`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.4,
                    }}
                  >
                    {log.message}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      marginTop: "0.5rem",
                    }}
                  >
                    {new Date(log.sentAt).toLocaleString("ru-RU")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
