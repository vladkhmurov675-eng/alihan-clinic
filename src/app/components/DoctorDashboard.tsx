"use client";

import React, {
  useState,
  useEffect,
  useCallback, useMemo,
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
  CheckCircle,
  Settings,
  MessageCircle,
  Activity,
  ClipboardList, ArrowDown 
} from "lucide-react";
import {useRouter, usePathname, useSearchParams} from 'next/navigation';
import { Doctor, Appointment, WhatsAppLog, DoctorFormData } from "./types";
import DoctorForm from "./forms/DoctorForm";
import SearchBar from "./SearchBar";
import AppointmentList from "./AppointmentList";


export default function DoctorDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, setIsLoggedIn] = useState(false);
  const [phone,] = useState("");
  const [password, setPassword] = useState("");
  const [, setLoginError] = useState("");
  const [, setLoggingIn] = useState(false);

  // Dashboard state
  const params = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

    const {
      tab = 'appointments',
      search = '',
      status = '',
      date = '',
      time = '',
      from = '',
      to = '',
      sortBy = '',
      range = '',
    } = params;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [showFilter, setShowFilter] = useState(false); // Settings form state
  const [settingsForm, setSettingsForm] = useState<DoctorFormData>({
    name: "",
    avatar: "",
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
  };


  const setFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, pathname, router]);

  const switchTab = (newTab: string) => {
  const newParams = new URLSearchParams();
  newParams.set('tab', newTab);
  router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
};

 const getTimeSlots = (start: string, end: string, duration: number): string[] => {
    const slots: string[] = [];
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let cur = sh * 60 + sm;
    const finish = eh * 60 + em;
    while (cur + duration <= finish) {
        slots.push(`${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`);
        cur += duration;
    }
    return slots;
}


  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const appts = await getDoctorAppointments({ status, search, date, time, from, to, sortBy: sortBy as 'status' | 'date' | 'time' | undefined });
        setAppointments(appts);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      showToast("Ошибка загрузки записей", "error");
    } finally {
      setLoading(false);
    }
  }, [status, search, date, time, from, to, sortBy]);

  const fetchDoctorProfile = useCallback(async () => {
    try {
      const doc = await getCurrentDoctor();
      if (doc) {
        setDoctorProfile(doc as Doctor);
        setSettingsForm({
          name: doc.name,
          phone: doc.phone,
          avatar: doc.avatar,
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
        setTimeSlots(getTimeSlots(doc.workStartTime, doc.workEndTime, doc.slotDuration));
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

    useEffect(() => {
      let cancelled = false;
      const run = async () => {
        if (!cancelled) await fetchDoctorProfile();
      };
      run();
      return () => { cancelled = true; };
    }, [fetchDoctorProfile]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!cancelled) await fetchAppointments();
    };
    load();
    return () => { cancelled = true; };
  }, [fetchAppointments]);


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

  const handleRangeModeChange = (mode: string) => {
  const params = new URLSearchParams(searchParams.toString());
  params.set('range', mode);

  if (mode === 'range') {
    // entering range mode — clear the single-date filter so it can't collide
    params.delete('date');
  } else {
    // leaving range mode — clear from/to so they don't linger
    params.delete('from');
    params.delete('to');
  }

  router.push(`${pathname}?${params.toString()}`, { scroll: false });
};

  const handleSaveSettings = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg("");
    try {
      await updateDoctorSettings({
        name: settingsForm.name,
        phone: settingsForm.phone,
        avatar: settingsForm.avatar,
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
        className="tab-bar"
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
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              switchTab(t.key);
              setSearchQuery("");
              if (t.key === "logs") fetchLogs();
            }}
            className="btn"
            style={{
              flex: 1,
              padding: "0.65rem 1rem",
              background: t.key ? "rgba(255,255,255,0.08)" : "transparent",
              color: t.key ? "var(--text-primary)" : "var(--text-muted)",
              border: "none",
              borderRadius: "10px",
              fontWeight: t.key ? 700 : 500,
              transition: "all 0.2s ease",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: Appointments ─── */}
      {tab === "appointments" && (
        <div className="animate-fade-in">
          <button
            className="btn-icon"
            style={{ marginBottom: "16px" }}
            onClick={() => setShowFilter(!showFilter)}
          >
            Фильтры
            <ArrowDown
              style={{
                transform: showFilter ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </button>
          {/* Filters */}
          {/* Date selector */}
          {showFilter && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px"
                }}
              >
                <button
                  value="date"
                  className="btn-text"
                  style={{ backgroundColor: range === 'date' ? 'var(--color-primary)' : '',
                          color: range === 'date' ? 'white' : ''
                  }}
                  onClick={() => handleRangeModeChange("date")}
                >
                  Дата
                </button>
                <div
                  style={{
                    backgroundColor: "black",
                    height: "20px",
                    width: "1px",
                  }}
                ></div>
                <button
                  value="range"
                  className="btn-text"
                  style={{ backgroundColor: range === 'range' ? 'var(--color-primary)' : '',
                          color: range === 'range' ? 'white' : ''
                  }}
                  onClick={() => handleRangeModeChange("range")}
                >
                  Период
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                  flexWrap: "wrap",
                }}
              >
                {range !== "range" && (
                  <input className = 'form-control'
                    type = "date"
                    value={date}
                    onChange={(v) => setFilter("date", v.target.value)}
                  />
                )}

                {range === "range" && (
                  <>
                    С:
                    <input
                      className="form-control"
                      type="date"
                      value={from}
                      onChange={(e) => setFilter("from", e.target.value)}
                    />
                    По:
                    <input
                      className="form-control"
                      type="date"
                      value={to}
                      onChange={(e) => setFilter("to", e.target.value)}
                    />
                    {(from || to) && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setFilter("from", "");
                          setFilter("to", "");
                        }}
                      >
                        Сбросить
                      </button>
                    )}
                  </>
                )}

                {/* Time filter */}
                <select
                  className="form-control"
                  style={{ width: "auto" }}
                  value={time}
                  onChange={(e) => setFilter("time", e.target.value)}
                  title="Фильтр по времени"
                >
                  <option value="">Время</option>
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>
                      {" "}
                      {t}
                    </option>
                  ))}
                </select>

                {/* Status filter */}
                <select
                  className="form-control"
                  style={{ width: "auto" }}
                  value={status}
                  onChange={(e) => setFilter("status", e.target.value)}
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
                    setFilter(
                      "sortBy",
                      e.target.value as "date" | "time" | "status",
                    )
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
            </>
          )}

          {/* Search Bar */}

          <div style={{ marginBottom: "1.5rem", maxWidth: "480px" }}>
            <SearchBar<Appointment>
              key="doctor-search-appointments"
              items={appointments}
              placeholder="Поиск по имени, телефону или жалобе... (Enter)"
              getSearchText={(appt) =>
                `${appt.patientName} ${appt.patientPhone} ${appt.complaint || ""}`
              }
              getDisplayValue={(appt) => appt.patientName}
              onSearch={(q) => setFilter("search", q)}
              onSelect={(appt) => {}}
              renderItem={(appt, active) => (
                <div
                  style={{
                    padding: "0.6rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    {appt.patientName}
                  </span>
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    {appt.date} {appt.time} · {appt.patientPhone}
                  </span>
                </div>
              )}
            />
          </div>

          {searchQuery && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "1.25rem",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
              }}
            >
              Результаты для: <strong>«{searchQuery}»</strong>
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-danger)",
                  fontSize: "0.82rem",
                  padding: 0,
                }}
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
          ) : appointments.length === 0 ? (
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
                {searchQuery
                  ? "Попробуйте изменить поисковый запрос"
                  : "Попробуйте выбрать другую дату"}
              </p>
            </div>
          ) : (
            <AppointmentList
              appointments={appointments}
              onStatusChange={handleStatusChange}
            ></AppointmentList>
          )}
        </div>
      )}

      {/* ─── TAB: Settings ─── */}
      {tab === "settings" && (
        <div className="animate-fade-in">
          <DoctorForm
            isAdmin={false}
            doctorId={doctorProfile?.id}
            currentAvatar={doctorProfile?.avatar}
            form={settingsForm}
            onChange={setSettingsForm}
            onSubmit={handleSaveSettings}
            saving={savingSettings}
            onAvatarUpdate={fetchDoctorProfile}
          />
        </div>
      )}

      {/* ─── TAB: WhatsApp Logs ─── */}
      {tab === "logs" && (
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
