'use client';

import React, { useState } from 'react';
import {
  logoutAdmin,
  createDoctor,
  updateDoctorByAdmin,
  updateDoctorAvatarByAdmin,
  deleteDoctor,
  saveSettings,
  createProcedure,
  updateProcedure,
  deleteProcedure,
  updateAppointment,
  deleteAppointment,
} from '../actions';
import { uploadFile } from '../lib/r2';
import {
  LogOut, Users, Settings as SettingsIcon,
  Plus, Trash2, Edit3, Save, MessageCircle,
  UserPlus, Phone, Clock, Calendar, HeartHandshake, Camera,
} from 'lucide-react';
import DoctorForm, { DoctorFormData } from './forms/DoctorForm';
import ProcedureForm, { ProcedureFormData } from './forms/ProcedureForm';
import AppointmentForm, { AppointmentFormData } from './forms/AppointmentForm';
import WhatsAppLogs from './WhatsAppLogs';

interface Doctor {
  id: number; name: string; phone: string; specialization: string;
  avatar: string | null; slotDuration: number; workStartTime: string;
  workEndTime: string; weekends: string; disabledDates: string;
  password?: string; education: string | null; description: string | null; experienceYears: number | null;
}
interface Procedure { id: number; name: string; doctorId: number; duration: number; price: number; }
interface Appointment {
  id: number; patientName: string; patientPhone: string;
  date: string; time: string; status: string;
  doctorId: number; procedureId: number | null; complaint: string; price: number | null; filePath: string | null;
}

const BLANK_DOCTOR: DoctorFormData = {
  name: '', phone: '', specialization: '',
  slotDuration: 30, workStartTime: '07:00', workEndTime: '11:00',
  weekends: '6,0', disabledDates: '', password: '', education: '', experienceYears: 0, description: '',
};
const BLANK_PROCEDURE: ProcedureFormData = { name: '', doctorId: 0, duration: 0, price: 0 };
const BLANK_APPOINTMENT: AppointmentFormData = {
  patientName: '', patientPhone: '', date: '', time: '',
  status: 'PENDING', doctorId: 0, procedureId: 0, complaint: '', price: 0, filePath: '',
};

export default function AdminDashboard({
  doctors: initialDoctors,
  procedures: initialProcedures,
  appointments: initialAppointments,
  settings: initialSettings,
}: {
  doctors: Doctor[];
  procedures: Procedure[];
  appointments: Appointment[];
  settings: Record<string, string>;
}) {
  const [activeTab, setActiveTab] = useState<'doctors' | 'procedures' | 'appointments' | 'settings' | 'logs'>('doctors');
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors ?? []);
  const [procedures, setProcedures] = useState<Procedure[]>(initialProcedures ?? []);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments ?? []);
  const [clinicSettings, setClinicSettings] = useState(initialSettings);

  // Doctor form
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorForm, setDoctorForm] = useState<DoctorFormData>(BLANK_DOCTOR);
  const [savingDoctor, setSavingDoctor] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Procedure form
  const [showProcedureForm, setShowProcedureForm] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [procedureForm, setProcedureForm] = useState<ProcedureFormData>(BLANK_PROCEDURE);
  const [savingProcedure, setSavingProcedure] = useState(false);

  // Appointment form
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormData>(BLANK_APPOINTMENT);
  const [savingAppointment, setSavingAppointment] = useState(false);

  // Settings
  const [settingsForm, setSettingsForm] = useState({ clinic_name: initialSettings?.clinic_name || 'Алихан' });
  const [savingSettingsFlag, setSavingSettingsFlag] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Handlers: Doctor ──
  const handleLogout = async () => { await logoutAdmin(); };

  const openEditDoctor = (doc: Doctor) => {
    setEditingDoctor(doc);
    setDoctorForm({
      name: doc.name, phone: doc.phone, specialization: doc.specialization,
      slotDuration: doc.slotDuration, workStartTime: doc.workStartTime,
      workEndTime: doc.workEndTime, weekends: doc.weekends,
      disabledDates: doc.disabledDates, password: '',
      education: doc.education ?? '', experienceYears: doc.experienceYears ?? 0, description: doc.description ?? '',
    });
    setShowDoctorForm(true);
  };

  const resetDoctorForm = () => { setDoctorForm(BLANK_DOCTOR); setEditingDoctor(null); setShowDoctorForm(false); };

  const handleSaveDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^\+7\d{10}$/.test(doctorForm.phone)) {
      showToast('Введите номер врача в формате +77012345678', 'error'); return;
    }
    setSavingDoctor(true);
    try {
      if (editingDoctor) {
        const { password, ...rest } = doctorForm;
        const payload = password.trim() ? { ...rest, password } : rest;
        const result = await updateDoctorByAdmin(editingDoctor.id, payload);
        if (result.success) {
          setDoctors(prev => prev.map(d => d.id === editingDoctor.id ? result.doctor as Doctor : d));
          showToast('Врач обновлен'); resetDoctorForm();
        }
      } else {
        const result = await createDoctor(doctorForm);
        if (result.success) {
          setDoctors(prev => [...prev, result.doctor as Doctor]);
          showToast('Врач добавлен'); resetDoctorForm();
        }
      }
    } catch { showToast('Ошибка сохранения', 'error'); }
    finally { setSavingDoctor(false); }
  };

  const handleDeleteDoctor = async (id: number) => {
    if (!confirm('Удалить врача? Все записи к нему будут удалены.')) return;
    try { await deleteDoctor(id); setDoctors(prev => prev.filter(d => d.id !== id)); showToast('Врач удален'); }
    catch { showToast('Ошибка удаления', 'error'); }
  };

  const handleAdminAvatarUpload = async (doctorId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadFile(file);
      await updateDoctorAvatarByAdmin(doctorId, url);
      setDoctors(prev => prev.map(d => d.id === doctorId ? { ...d, avatar: url } : d));
      showToast('Фото обновлено');
    } catch { showToast('Ошибка загрузки фото', 'error'); }
    finally { setUploadingAvatar(false); }
  };

  // ── Handlers: Procedure ──
  const openEditProcedure = (proc: Procedure) => {
    setEditingProcedure(proc);
    setProcedureForm({ name: proc.name, doctorId: proc.doctorId, duration: proc.duration, price: proc.price });
    setShowProcedureForm(true);
  };
  const resetProcedureForm = () => { setProcedureForm(BLANK_PROCEDURE); setEditingProcedure(null); setShowProcedureForm(false); };

  const handleSaveProcedure = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingProcedure(true);
    try {
      if (editingProcedure) {
        const result = await updateProcedure(editingProcedure.id, procedureForm);
        if (result.success) {
          setProcedures(prev => prev.map(p => p.id === editingProcedure.id ? result.procedure as Procedure : p));
          showToast('Процедура обновлена'); resetProcedureForm();
        }
      } else {
        const result = await createProcedure(procedureForm);
        if (result.success) {
          setProcedures(prev => [...prev, result.procedure as Procedure]);
          showToast('Процедура добавлена'); resetProcedureForm();
        }
      }
    } catch { showToast('Ошибка сохранения', 'error'); }
    finally { setSavingProcedure(false); }
  };

  const handleDeleteProcedure = async (id: number) => {
    if (!confirm('Удалить процедуру?')) return;
    try { await deleteProcedure(id); setProcedures(prev => prev.filter(p => p.id !== id)); showToast('Процедура удалена'); }
    catch { showToast('Ошибка удаления', 'error'); }
  };

  // ── Handlers: Appointment ──
  const openEditAppointment = (appt: Appointment) => {
    setEditingAppointment(appt);
    setAppointmentForm({
      patientName: appt.patientName, patientPhone: appt.patientPhone,
      date: appt.date, time: appt.time, status: appt.status,
      doctorId: appt.doctorId, procedureId: appt.procedureId ?? 0,
      complaint: appt.complaint, price: appt.price ?? 5000, filePath: appt.filePath ?? '',
    });
    setShowAppointmentForm(true);
  };
  const resetAppointmentForm = () => { setAppointmentForm(BLANK_APPOINTMENT); setEditingAppointment(null); setShowAppointmentForm(false); };

  const handleSaveAppointment = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAppointment) return;
    setSavingAppointment(true);
    try {
      const result = await updateAppointment(editingAppointment.id, appointmentForm);
      if (result.success) {
        setAppointments(prev => prev.map(a => a.id === editingAppointment.id ? result.appointment as Appointment : a));
        showToast('Запись обновлена'); resetAppointmentForm();
      }
    } catch { showToast('Ошибка сохранения', 'error'); }
    finally { setSavingAppointment(false); }
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!confirm('Удалить запись?')) return;
    try { await deleteAppointment(id); setAppointments(prev => prev.filter(a => a.id !== id)); showToast('Запись удалена'); }
    catch { showToast('Ошибка удаления', 'error'); }
  };

  // ── Handlers: Settings ──
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettingsFlag(true);
    try {
      await saveSettings(settingsForm);
      setClinicSettings(prev => ({ ...prev, ...settingsForm }));
      showToast('Настройки клиники сохранены');
    } catch { showToast('Ошибка сохранения настроек', 'error'); }
    finally { setSavingSettingsFlag(false); }
  };

  const TABS = [
    { key: 'doctors' as const, label: 'Врачи', icon: <Users size={16} /> },
    { key: 'procedures' as const, label: 'Услуги', icon: <HeartHandshake size={16} /> },
    { key: 'appointments' as const, label: 'Записи', icon: <Calendar size={16} /> },
    { key: 'settings' as const, label: 'Настройки', icon: <SettingsIcon size={16} /> },
    { key: 'logs' as const, label: 'WhatsApp', icon: <MessageCircle size={16} /> },
  ];

  const statusColors: Record<string, string> = {
    PENDING: 'var(--color-warning)', CONFIRMED: 'var(--color-accent)',
    COMPLETED: 'var(--color-primary)', CANCELLED: 'var(--color-danger)',
  };
  const statusLabels: Record<string, string> = {
    PENDING: 'Ожидает', CONFIRMED: 'Подтверждён', COMPLETED: 'Завершён', CANCELLED: 'Отменён',
  };
  const statusBadge: Record<string, string> = {
    PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed',
    COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled',
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '20px', zIndex: 9999,
          padding: '0.75rem 1.25rem', borderRadius: '10px',
          background: toast.type === 'success' ? 'var(--color-primary)' : 'var(--color-danger)',
          color: '#fff', fontWeight: 600, fontSize: '0.9rem',
          boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
        }}>
          {toast.message}
        </div>
      )}

      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Панель администратора</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Управление клиникой «{clinicSettings?.clinic_name || 'Алихан'}»
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
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="btn" style={{
            flex: 1, padding: '0.65rem 1rem',
            background: activeTab === tab.key ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
            border: 'none', borderRadius: '10px',
            fontWeight: activeTab === tab.key ? 700 : 500,
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Doctors ─── */}
      {activeTab === 'doctors' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Список врачей ({doctors.length})</h2>
            <button onClick={() => { resetDoctorForm(); setShowDoctorForm(true); }} className="btn btn-primary" style={{ gap: '0.4rem' }}>
              <UserPlus size={16} /> Добавить врача
            </button>
          </div>

          {showDoctorForm && (
            <DoctorForm
              form={doctorForm}
              onChange={setDoctorForm}
              onSubmit={handleSaveDoctor}
              onCancel={resetDoctorForm}
              isEditing={!!editingDoctor}
              saving={savingDoctor}
            />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {doctors.map(doc => {
              const initials = doc.name.split(' ').map((n: string) => n[0]).join('');
              const isProc = doc.specialization.includes('Процедурный');
              const specColor = isProc ? 'var(--color-accent)' : 'var(--color-primary)';
              return (
                <div key={doc.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: '50%', overflow: 'hidden',
                          background: `linear-gradient(135deg, ${specColor}22 0%, ${specColor}55 100%)`,
                          border: `1.5px solid ${specColor}44`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: specColor, fontWeight: 700, fontSize: '1.1rem',
                        }}>
                          {doc.avatar && doc.avatar !== '/images/default-doctor.png'
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={doc.avatar} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span>{initials}</span>
                          }
                        </div>
                        <label title="Изменить фото" style={{
                          position: 'absolute', bottom: -2, right: -2,
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'var(--color-primary)', border: '2px solid white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: uploadingAvatar ? 'wait' : 'pointer', color: '#fff',
                        }}>
                          <Camera size={10} />
                          <input type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={e => handleAdminAvatarUpload(doc.id, e)} />
                        </label>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: specColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {doc.specialization}
                        </span>
                        <h3 style={{ fontSize: '1rem', margin: '0.1rem 0' }}>{doc.name}</h3>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={11} /> {doc.phone}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={11} /> {doc.workStartTime}–{doc.workEndTime}</span>
                          <span>{doc.slotDuration} мин</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditDoctor(doc)} className="btn btn-secondary" style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}>
                        <Edit3 size={14} /> Изменить
                      </button>
                      <button onClick={() => handleDeleteDoctor(doc.id)} className="btn btn-danger" style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}>
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

      {/* ─── Procedures ─── */}
      {activeTab === 'procedures' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Услуги и процедуры ({procedures.length})</h2>
            <button onClick={() => { resetProcedureForm(); setShowProcedureForm(true); }} className="btn btn-primary" style={{ gap: '0.4rem' }}>
              <Plus size={16} /> Добавить услугу
            </button>
          </div>

          {showProcedureForm && (
            <ProcedureForm
              form={procedureForm}
              onChange={setProcedureForm}
              onSubmit={handleSaveProcedure}
              onCancel={resetProcedureForm}
              isEditing={!!editingProcedure}
              saving={savingProcedure}
              doctors={doctors}
            />
          )}

          {procedures.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <HeartHandshake size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-secondary)' }}>Нет услуг</h3>
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
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--color-accent)', fontWeight: 700, fontSize: '1.3rem',
                        }}>✦</div>
                        <div>
                          <h3 style={{ fontSize: '1rem', margin: '0 0 0.2rem' }}>{proc.name}</h3>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                            <span>{assignedDoctor ? `${assignedDoctor.name} — ${assignedDoctor.specialization}` : `Врач #${proc.doctorId}`}</span>
                            <span><Clock size={11} /> {proc.duration} мин</span>
                            <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{proc.price.toLocaleString('ru-RU')} ₸</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openEditProcedure(proc)} className="btn btn-secondary" style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}>
                          <Edit3 size={14} /> Изменить
                        </button>
                        <button onClick={() => handleDeleteProcedure(proc.id)} className="btn btn-danger" style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}>
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

      {/* ─── Appointments ─── */}
      {activeTab === 'appointments' && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2>Записи ({appointments.length})</h2>
          </div>

          {showAppointmentForm && editingAppointment && (
            <AppointmentForm
              form={appointmentForm}
              onChange={setAppointmentForm}
              onSubmit={handleSaveAppointment}
              onCancel={resetAppointmentForm}
              saving={savingAppointment}
              doctors={doctors}
              procedures={procedures}
            />
          )}

          {appointments.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-secondary)' }}>Нет записей</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {appointments.map(appt => {
                const doctor = doctors.find(d => d.id === appt.doctorId);
                const procedure = appt.procedureId ? procedures.find(p => p.id === appt.procedureId) : null;
                return (
                  <div key={appt.id} className="glass-panel" style={{
                    padding: '1.25rem 1.5rem',
                    borderLeft: `3px solid ${statusColors[appt.status] || 'var(--border-color)'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <Clock size={13} style={{ color: 'var(--color-accent)' }} />
                          <span style={{ fontWeight: 700 }}>{appt.date} · {appt.time}</span>
                          <span className={`badge ${statusBadge[appt.status]}`}>{statusLabels[appt.status]}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                          <Users size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{appt.patientName}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{appt.patientPhone}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          {doctor && <span>{doctor.name} — {doctor.specialization}</span>}
                          {procedure && <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{procedure.name} · {procedure.price.toLocaleString('ru-RU')} ₸</span>}
                        </div>
                        {appt.complaint && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                            <strong>Жалоба:</strong> {appt.complaint}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button onClick={() => openEditAppointment(appt)} className="btn btn-secondary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem' }}>
                          <Edit3 size={13} /> Изменить
                        </button>
                        <button onClick={() => handleDeleteAppointment(appt.id)} className="btn btn-danger" style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem' }}>
                          <Trash2 size={13} /> Удалить
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

      {/* ─── Settings ─── */}
      {activeTab === 'settings' && (
        <div className="animate-fade-in">
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '550px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Настройки клиники</h3>
            <form onSubmit={handleSaveSettings}>
              <div className="input-group">
                <label className="input-label">Название клиники</label>
                <input className="form-control" style={{ width: '100%' }}
                  value={settingsForm.clinic_name}
                  onChange={e => setSettingsForm(prev => ({ ...prev, clinic_name: e.target.value }))}
                  placeholder="Алихан"
                />
              </div>
              <button type="submit" disabled={savingSettingsFlag}
                className={`btn ${savingSettingsFlag ? 'btn-disabled' : 'btn-primary'}`}
                style={{ marginTop: '1rem', padding: '0.75rem 2rem' }}>
                {savingSettingsFlag ? 'Сохранение...' : <><Save size={16} /> Сохранить</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── WhatsApp Logs ─── */}
      {activeTab === 'logs' && (
        <div className="animate-fade-in">
          <h2 style={{ marginBottom: '1.5rem' }}>Журнал WhatsApp уведомлений</h2>
          <WhatsAppLogs />
        </div>
      )}
    </div>
  );
}
