'use client';

import React, { useState, type SyntheticEvent } from 'react';
import {
  loginAdmin,
  logoutAdmin,
  createDoctor,
  updateDoctorByAdmin,
  deleteDoctor,
  saveSettings,
  getWhatsAppLogs,
  createProcedure,
  updateProcedure,
  deleteProcedure,
} from '../actions';
import {
  Lock, LogOut, Users, Settings as SettingsIcon,
  Plus, Trash2, Edit3, Save, X, MessageCircle,
  ShieldCheck, UserPlus, Phone, Clock, Calendar, HeartHandshake
} from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  phone: string;
  specialization: string;
  avatar: string;
  slotDuration: number;
  workStartTime: string;
  workEndTime: string;
  weekends: string;
  disabledDates: string;
  password: string;
  education: string;
  description: string;
  experienceYears: number;
}

interface Procedure {
  id: number;
  name: string;
  doctorId: number;
  duration: number;
  price: number;
}

interface WhatsAppLogEntry {
  id: number;
  sentAt: Date;
  recipientPhone: string;
  recipientName: string;
  message: string;
  status: string;
}

export default function AdminDashboard({
  doctors: initialDoctors,
  procedures: initialProcedures,
  settings: initialSettings,
}: {
  doctors: Doctor[];
  procedures: Procedure[];
  settings: Record<string, string>;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'doctors' | 'procedures' | 'settings' | 'logs'>('doctors');
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [procedures, setProcedures] = useState<Procedure[]>(initialProcedures);
  const [clinicSettings, setClinicSettings] = useState(initialSettings);
  const [logs, setLogs] = useState<WhatsAppLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Doctor form state
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '', phone: '', specialization: '',
    slotDuration: 30, workStartTime: '07:00', workEndTime: '11:00',
    weekends: '6,0', disabledDates: '', password: '', education: '', experienceYears: 0, description: '',
  });
  const [savingDoctor, setSavingDoctor] = useState(false);

  // Procedure form state
  const [showProcedureForm, setShowProcedureForm] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [procedureForm, setProcedureForm] = useState({
    name: '', doctorId: 0, duration: 0, price: 0,
  });
  const [savingProcedure, setSavingProcedure] = useState(false);

  // Settings form
  const [settingsForm, setSettingsForm] = useState({ clinic_name: clinicSettings.clinic_name || 'Алихан' });
  const [savingSettingsFlag, setSavingSettingsFlag] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };


  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const result = await loginAdmin(phone, password);
      if (result.success) {
        setIsLoggedIn(true);
        showToast('Вход в панель администратора');
      } else {
        setLoginError(result.error || 'Ошибка входа');
      }
    } catch {
      setLoginError('Ошибка сервера');
    }
    finally {
      setLoggingIn(false);
    };
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsLoggedIn(false);
    setPassword('');
  };

  const resetDoctorForm = () => {
    setDoctorForm({
      name: '', phone: '', specialization: '',
      slotDuration: 30, workStartTime: '07:00', workEndTime: '11:00',
      weekends: '6,0', disabledDates: '', password: '', education: '', experienceYears: 0, description: '',
    });
    setEditingDoctor(null);
    setShowDoctorForm(false);
  };

  const openEditDoctor = (doc: Doctor) => {
    setEditingDoctor(doc);
    setDoctorForm({
      name: doc.name, phone: doc.phone, specialization: doc.specialization,
      slotDuration: doc.slotDuration, workStartTime: doc.workStartTime,
      workEndTime: doc.workEndTime, weekends: doc.weekends,
      disabledDates: doc.disabledDates, password: '', education: doc.education,
      experienceYears: doc.experienceYears, description: doc.description,
    });
    setShowDoctorForm(true);
  };

  const handleSaveDoctor = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const phoneRegex = /^\+7\d{10}$/;

    if (!phoneRegex.test(doctorForm.phone)) {
      setLoginError('Введите номер врача в формате +77012345678');
      return;
    }
    setSavingDoctor(true);
    try {
      if (editingDoctor) {
        const { password, ...rest } = doctorForm;
        const payload = password.trim() ? { ...rest, password } : rest;
        const result = await updateDoctorByAdmin(editingDoctor.id, payload);
        if (result.success) {
          setDoctors(prev => prev.map(d => d.id === editingDoctor.id ? result.doctor as Doctor : d));
          showToast('Врач обновлен');
          resetDoctorForm();
        }
      } else {
        const result = await createDoctor(doctorForm);
        if (result.success) {
          setDoctors(prev => [...prev, result.doctor as Doctor]);
          showToast('Врач добавлен');
          resetDoctorForm();
        }
      }
    } catch {
      showToast('Ошибка сохранения', 'error');
    } finally {
      setSavingDoctor(false);
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    if (!confirm('Удалить этого врача? Все записи к нему будут удалены.')) return;
    try {
      await deleteDoctor(id);
      setDoctors(prev => prev.filter(d => d.id !== id));
      showToast('Врач удален');
    } catch {
      showToast('Ошибка удаления', 'error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettingsFlag(true);
    try {
      await saveSettings(settingsForm);
      setClinicSettings(prev => ({ ...prev, ...settingsForm }));
      showToast('Настройки клиники сохранены');
    } catch {
      showToast('Ошибка сохранения настроек', 'error');
    } finally {
      setSavingSettingsFlag(false);
    }
  };

  const resetProcedureForm = () => {
    setProcedureForm({
      name: '', doctorId: 0, duration: 0, price: 0,
    });
    setEditingProcedure(null);
    setShowProcedureForm(false);
  };

  const openEditProcedure = (proc: Procedure) => {
    setEditingProcedure(proc);
    setProcedureForm({
      name: proc.name, doctorId: proc.doctorId, duration: proc.duration,
      price: proc.price,
    });
    setShowProcedureForm(true);
  };

  const handleSaveProcedure = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingProcedure(true);
    try {
      if (editingProcedure) {
        const result = await updateProcedure(editingProcedure.id, procedureForm);
        if (result.success) {
          setProcedures(prev => prev.map(d => d.id === editingProcedure.id ? result.procedure as Procedure : d));
          showToast('Процедура обновлена');
          resetProcedureForm();
        }
      } else {
        const result = await createProcedure(procedureForm);
        if (result.success) {
          setProcedures(prev => [...prev, result.procedure as Procedure]);
          showToast('Процедура добавлена');
          resetProcedureForm();
        }
      }
    } catch {
      showToast('Ошибка сохранения', 'error');
    } finally {
      setSavingProcedure(false);
    }
  };

  const handleDeleteProcedure = async (id: number) => {
    if (!confirm('Удалить эту процедуру? Все записи к ней будут удалены.')) return;
    try {
      await deleteProcedure(id);
      setProcedures(prev => prev.filter(d => d.id !== id));
      showToast('Процедура удалена');
    } catch {
      showToast('Ошибка удаления', 'error');
    }
  };



  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const result = await getWhatsAppLogs();
      setLogs(result as WhatsAppLogEntry[]);
    } catch {
      showToast('Ошибка загрузки логов', 'error');
    } finally {
      setLoadingLogs(false);
    }
  };


  // ────────────────── ADMIN DASHBOARD ──────────────────
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      {/*    */}
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '20px', zIndex: 9999,
          padding: '0.75rem 1.25rem', borderRadius: '10px',
          background: toast.type === 'success' ? 'var(--color-primary)' : 'var(--color-danger)',
          color: '#fff', fontWeight: 600, fontSize: '0.9rem',
          boxShadow: '0 8px 25px rgba(0,0,0,0.4)', animation: 'fadeIn 0.3s ease',
        }}>
          {toast.message}
        </div>
      )}

      {/* Top Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Панель администратора</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Управление клиникой «{clinicSettings.clinic_name || 'Алихан'}»
          </p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ gap: '0.4rem' }}>
          <LogOut size={16} /> Выйти
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{
        display: 'flex', gap: '0.25rem', marginBottom: '1.5rem',
        background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '0.25rem',
        border: '1px solid var(--border-color)',
      }}>
        {[
          { key: 'doctors' as const, label: 'Врачи', icon: <Users size={16} /> },
          { key: 'procedures' as const, label: 'Услуги и процедуры', icon: <HeartHandshake size={16} /> },
          { key: 'settings' as const, label: 'Настройки клиники', icon: <SettingsIcon size={16} /> },
          { key: 'logs' as const, label: 'Журнал WhatsApp', icon: <MessageCircle size={16} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key === 'logs') fetchLogs();
            }}
            className="btn"
            style={{
              flex: 1, padding: '0.65rem 1rem',
              background: activeTab === tab.key ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none', borderRadius: '10px',
              fontWeight: activeTab === tab.key ? 700 : 500, transition: 'all 0.2s ease',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: Doctors ─── */}
      {activeTab === 'doctors' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Список врачей ({doctors.length})</h2>
            <button
              onClick={() => { resetDoctorForm(); setShowDoctorForm(true); }}
              className="btn btn-primary"
              style={{ gap: '0.4rem' }}
            >
              <UserPlus size={16} /> Добавить врача
            </button>
          </div>

          {/* Doctor Form Modal */}
          {showDoctorForm && (
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem', borderColor: 'var(--color-accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>{editingDoctor ? 'Редактировать врача' : 'Добавить нового врача'}</h3>
                <button
                  onClick={resetDoctorForm}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveDoctor}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">ФИО врача *</label>
                    <input
                      className="form-control" style={{ width: '100%' }} required
                      value={doctorForm.name}
                      onChange={e => setDoctorForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Иванов Иван Иванович"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Специализация *</label>
                    <input
                      className="form-control" style={{ width: '100%' }} required
                      value={doctorForm.specialization}
                      onChange={e => setDoctorForm(prev => ({ ...prev, specialization: e.target.value }))}
                      placeholder="Терапевт"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Телефон *</label>
                    <input
                      className="form-control" style={{ width: '100%' }} required
                      value={doctorForm.phone}
                      onChange={(e) => {
                        let value = e.target.value;

                        const digits = value.replace(/\D/g, '');

                        const normalized = digits.startsWith('7')
                          ? digits.slice(0, 11)
                          : `7${digits}`.slice(0, 11);

                        setDoctorForm(prev => ({ ...prev, phone: `+${normalized}` }));
                      }}
                      placeholder="+77001234567"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Образование</label>
                    <input
                      className="form-control" style={{ width: '100%' }}
                      value={doctorForm.education}
                      onChange={e => setDoctorForm(prev => ({ ...prev, education: e.target.value }))}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Опыт (лет)</label>
                    <input
                      type="number"
                      className="form-control" style={{ width: '100%' }}
                      value={doctorForm.experienceYears}
                      onChange={e => setDoctorForm(prev => ({ ...prev, experienceYears: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">Описание / Краткая биография</label>
                    <textarea
                      className="form-control" style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                      value={doctorForm.description}
                      onChange={e => setDoctorForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Длительность приема</label>
                    <select
                      className="form-control" style={{ width: '100%' }}
                      value={doctorForm.slotDuration}
                      onChange={e => setDoctorForm(prev => ({ ...prev, slotDuration: Number(e.target.value) }))}
                    >
                      <option value={20}>20 мин</option>
                      <option value={30}>30 мин</option>
                      <option value={40}>40 мин</option>
                      <option value={60}>60 мин</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">
                      Пароль {editingDoctor ? '(оставьте пустым, чтобы не менять)' : '*'}
                    </label>
                    <input
                      type="password"
                      className="form-control" style={{ width: '100%' }}
                      required={!editingDoctor}       // ← required only when creating
                      value={doctorForm.password}
                      onChange={e => setDoctorForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder={editingDoctor ? 'Новый пароль (необязательно)' : 'Пароль'}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Начало работы</label>
                    <input
                      type="time" className="form-control" style={{ width: '100%' }}
                      value={doctorForm.workStartTime}
                      onChange={e => setDoctorForm(prev => ({ ...prev, workStartTime: e.target.value }))}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Конец работы</label>
                    <input
                      type="time" className="form-control" style={{ width: '100%' }}
                      value={doctorForm.workEndTime}
                      onChange={e => setDoctorForm(prev => ({ ...prev, workEndTime: e.target.value }))}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Выходные дни (через запятую: 0=Вс, 1=Пн, ..., 6=Сб)</label>
                    <input
                      className="form-control" style={{ width: '100%' }}
                      value={doctorForm.weekends}
                      onChange={e => setDoctorForm(prev => ({ ...prev, weekends: e.target.value }))}
                      placeholder="6,0"
                    />
                  </div>
                  <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">Нерабочие дни</label>
                    <input
                      className="form-control" style={{ width: '100%' }}
                      value={doctorForm.disabledDates}
                      onChange={e => setDoctorForm(prev => ({ ...prev, disabledDates: e.target.value }))}
                      placeholder="2026-01-01,2026-03-08"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    type="submit"
                    disabled={savingDoctor}
                    className={`btn ${savingDoctor ? 'btn-disabled' : 'btn-primary'}`}
                  >
                    <Save size={16} /> {savingDoctor ? 'Сохранение...' : editingDoctor ? 'Обновить' : 'Создать'}
                  </button>
                  <button type="button" onClick={resetDoctorForm} className="btn btn-secondary">
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Doctors List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {doctors.map(doc => {
              const initials = doc.name.split(' ').map(n => n[0]).join('');
              const isProc = doc.specialization.includes('Процедурный');
              const specColor = isProc ? 'var(--color-accent)' : 'var(--color-primary)';

              return (
                <div key={doc.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '14px',
                        background: `linear-gradient(135deg, ${specColor}22 0%, ${specColor}55 100%)`,
                        border: `1px solid ${specColor}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '1.2rem',
                      }}>
                        {initials}
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: specColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {doc.specialization}
                        </span>
                        <h3 style={{ fontSize: '1rem', margin: '0.1rem 0' }}>{doc.name}</h3>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Phone size={11} /> {doc.phone}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={11} /> {doc.workStartTime}–{doc.workEndTime}
                          </span>
                          <span>{doc.slotDuration} мин</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditDoctor(doc)}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        <Edit3 size={14} /> Изменить
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        <Trash2 size={14} /> Удалить
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB: Procedures ─── */}
      {activeTab === 'procedures' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Услуги и процедуры ({procedures.length})</h2>
            <button
              onClick={() => { resetProcedureForm(); setShowProcedureForm(true); }}
              className="btn btn-primary"
              style={{ gap: '0.4rem' }}
            >
              <Plus size={16} /> Добавить услугу
            </button>
          </div>

          {/* Procedure Form */}
          {showProcedureForm && (
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem', borderColor: 'var(--color-accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>{editingProcedure ? 'Редактировать услугу' : 'Добавить новую услугу'}</h3>
                <button
                  onClick={resetProcedureForm}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveProcedure}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {/* Name — full width */}
                  <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">Название услуги *</label>
                    <input
                      className="form-control" style={{ width: '100%' }} required
                      value={procedureForm.name}
                      onChange={e => setProcedureForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Например: Общий анализ крови"
                    />
                  </div>

                  {/* Assigned doctor */}
                  <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">Врач *</label>
                    <select
                      className="form-control" style={{ width: '100%' }} required
                      value={procedureForm.doctorId || ''}
                      onChange={e => setProcedureForm(prev => ({ ...prev, doctorId: Number(e.target.value) }))}
                    >
                      <option value="">— Выберите врача —</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="input-group">
                    <label className="input-label">Длительность (мин) *</label>
                    <input
                      type="number" min={5} step={5}
                      className="form-control" style={{ width: '100%' }} required
                      value={procedureForm.duration || ''}
                      onChange={e => setProcedureForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      placeholder="30"
                    />
                  </div>

                  {/* Price */}
                  <div className="input-group">
                    <label className="input-label">Цена (тенге) *</label>
                    <input
                      type="number" min={0} step={100}
                      className="form-control" style={{ width: '100%' }} required
                      value={procedureForm.price || ''}
                      onChange={e => setProcedureForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    type="submit"
                    disabled={savingProcedure}
                    className={`btn ${savingProcedure ? 'btn-disabled' : 'btn-primary'}`}
                  >
                    <Save size={16} /> {savingProcedure ? 'Сохранение...' : editingProcedure ? 'Обновить' : 'Создать'}
                  </button>
                  <button type="button" onClick={resetProcedureForm} className="btn btn-secondary">
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Procedures List */}
          {procedures.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <HeartHandshake size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-secondary)' }}>Нет услуг</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Добавьте первую услугу или процедуру.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {procedures.map(proc => {
                const assignedDoctor = doctors.find(d => d.id === proc.doctorId);
                return (
                  <div key={proc.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '52px', height: '52px', borderRadius: '14px',
                          background: 'linear-gradient(135deg, var(--color-accent)22 0%, var(--color-accent)55 100%)',
                          border: '1px solid var(--color-accent)44',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--color-accent)', fontWeight: 700, fontSize: '1.3rem',
                        }}>
                          ✦
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1rem', margin: '0 0 0.2rem' }}>{proc.name}</h3>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Users size={11} />
                              {assignedDoctor ? `${assignedDoctor.name} — ${assignedDoctor.specialization}` : `Врач #${proc.doctorId}`}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={11} /> {proc.duration} мин
                            </span>
                            <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                              {proc.price.toLocaleString('ru-RU')} ₸
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => openEditProcedure(proc)}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          <Edit3 size={14} /> Изменить
                        </button>
                        <button
                          onClick={() => handleDeleteProcedure(proc.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          <Trash2 size={14} /> Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: Clinic Settings ─── */}
      {activeTab === 'settings' && (
        <div className="animate-fade-in">
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '550px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Настройки клиники</h3>
            <form onSubmit={handleSaveSettings}>
              <div className="input-group">
                <label className="input-label">Название клиники</label>
                <input
                  className="form-control" style={{ width: '100%' }}
                  value={settingsForm.clinic_name}
                  onChange={e => setSettingsForm(prev => ({ ...prev, clinic_name: e.target.value }))}
                  placeholder="Алихан"
                />
              </div>

              <button
                type="submit"
                disabled={savingSettingsFlag}
                className={`btn ${savingSettingsFlag ? 'btn-disabled' : 'btn-primary'}`}
                style={{ marginTop: '1rem', padding: '0.75rem 2rem' }}
              >
                {savingSettingsFlag ? 'Сохранение...' : 'Сохранить настройки'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB: WhatsApp Logs ─── */}
      {activeTab === 'logs' && (
        <div className="animate-fade-in">
          <h2 style={{ marginBottom: '1.5rem' }}>Журнал WhatsApp уведомлений</h2>
          {loadingLogs ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Загрузка логов...
            </div>
          ) : logs.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <MessageCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-secondary)' }}>Журнал пуст</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Уведомления появятся после первой записи на прием.
              </p>
            </div>
          ) : (
            <div className="table-scroll" style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem',
              }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Время</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Получатель</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Сообщение</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(log.sentAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{log.recipientName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.recipientPhone}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>
                        {log.message}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${log.status === 'SIMULATED' ? 'badge-confirmed' : log.status === 'SENT' ? 'badge-completed' : 'badge-cancelled'}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 