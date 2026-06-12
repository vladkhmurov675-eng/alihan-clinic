'use client';

import { useState, useEffect, SyntheticEvent } from 'react';
import { getCurrentDoctor, updateDoctorSettings } from '../../actions';
import DisabledDatesPicker from '../DisabledDatesPicker';
import { useToast } from '../../hooks/toast';

export  interface DoctorFormData {
  id: number;
  name: string;
  phone: string;
  specialization: string;
  education: string;
  experienceYears: number;
  description: string;
  slotDuration: number;
  workStartTime: string;
  workEndTime: string;
  weekends: string; // e.g. "6,0"
  disabledDates: string; // e.g. "2024-12-24,2024-12-25"
  password?: string; // Only used when admin wants to change doctor's password. Ignored otherwise.
}


interface Props {
  isAdmin: boolean;

}


export default function DoctorForm({ isAdmin }: Props) {

  const { showToast, ToastComponent } = useToast();

  const [settingsForm, setSettingsForm] = useState({
    name: '',
    phone: '',
    specialization: '',
    education: '',
    experienceYears: 0,
    description: '',
    slotDuration: 30,
    workStartTime: '09:00',
    workEndTime: '18:00',
    weekends: '6,0',
    disabledDates: '',
    password: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  // ── Fetch doctor profile on mount ──
  const fetchDoctorProfile = async () => {
    try {
      const doctor = await getCurrentDoctor();
      if (!doctor) return;
      setSettingsForm({
        name: doctor.name,
        phone: doctor.phone,
        specialization: doctor.specialization,
        education: doctor.education ?? '',
        experienceYears: doctor.experienceYears ?? 0,
        description: doctor.description ?? '',
        slotDuration: doctor.slotDuration,
        workStartTime: doctor.workStartTime,
        workEndTime: doctor.workEndTime,
        weekends: doctor.weekends,
        disabledDates: doctor.disabledDates,
        password: '',
      });
    } catch {
      showToast('Ошибка загрузки профиля врача', 'error');
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save settings ──
  const handleSaveSettings = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg('');
    try {
      await updateDoctorSettings(settingsForm);
      setSettingsMsg('Настройки сохранены');
      showToast('Настройки профиля сохранены');
      fetchDoctorProfile();
    } catch {
      setSettingsMsg('Ошибка сохранения');
      showToast('Ошибка сохранения настроек', 'error');
    } finally {
      setSavingSettings(false);
    }
  };



  return (
    <>
      {ToastComponent}
      <form onSubmit={handleSaveSettings}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">ФИО</label>
            <input
              className="form-control" style={{ width: '100%' }}
              value={settingsForm.name}
              onChange={e => setSettingsForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Телефон</label>
            <input
              className="form-control" style={{ width: '100%' }}
              value={settingsForm.phone}
              onChange={e => setSettingsForm(p => ({ ...p, phone: e.target.value }))}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Специализация</label>
            <input
              className="form-control" style={{ width: '100%' }}
              value={settingsForm.specialization}
              onChange={e => setSettingsForm(p => ({ ...p, specialization: e.target.value }))}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Образование</label>
            <input
              className="form-control" style={{ width: '100%' }}
              value={settingsForm.education}
              onChange={e => setSettingsForm(p => ({ ...p, education: e.target.value }))}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Опыт (лет)</label>
            <input
              type="number" className="form-control" style={{ width: '100%' }}
              value={settingsForm.experienceYears}
              onChange={e => setSettingsForm(p => ({ ...p, experienceYears: Number(e.target.value) }))}
            />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Описание / Краткая биография</label>
            <textarea
              className="form-control"
              style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
              value={settingsForm.description}
              onChange={e => setSettingsForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Длительность приёма (мин)</label>
            <select
              className="form-control" style={{ width: '100%' }}
              value={settingsForm.slotDuration}
              onChange={e => setSettingsForm(p => ({ ...p, slotDuration: Number(e.target.value) }))}
            >
              <option value={20}>20 минут</option>
              <option value={30}>30 минут</option>
              <option value={40}>40 минут</option>
              <option value={60}>60 минут</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Начало работы</label>
            <input
              type="time" className="form-control" style={{ width: '100%' }}
              value={settingsForm.workStartTime}
              onChange={e => setSettingsForm(p => ({ ...p, workStartTime: e.target.value }))}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Конец работы</label>
            <input
              type="time" className="form-control" style={{ width: '100%' }}
              value={settingsForm.workEndTime}
              onChange={e => setSettingsForm(p => ({ ...p, workEndTime: e.target.value }))}
            />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Выходные дни (0=Вс, 1=Пн … 6=Сб, через запятую)</label>
            <input
              className="form-control" style={{ width: '100%' }}
              value={settingsForm.weekends}
              onChange={e => setSettingsForm(p => ({ ...p, weekends: e.target.value }))}
              placeholder="6,0"
            />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Нерабочие дни (выберите в календаре)</label>
            <DisabledDatesPicker
              value={settingsForm.disabledDates}
              onChange={v => setSettingsForm(p => ({ ...p, disabledDates: v }))}
            />
          </div>
          {isAdmin && (
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Новый пароль (оставьте пустым, чтобы не менять)</label>
              <input
                type="password" className="form-control" style={{ width: '100%' }}
                value={settingsForm.password}
                onChange={e => setSettingsForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Не менять"
              />
            </div>
          )}

        </div>

        {settingsMsg && (
          <p style={{
            marginTop: '1rem', fontSize: '0.85rem', fontWeight: 600,
            color: settingsMsg.includes('Ошибка') ? 'var(--color-danger)' : 'var(--color-primary)',
          }}>
            {settingsMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={savingSettings}
          className={`btn ${savingSettings ? 'btn-disabled' : 'btn-primary'}`}
          style={{ marginTop: '1.5rem', padding: '0.75rem 2rem' }}
        >
          {savingSettings ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </form>
    </>
  );
}
