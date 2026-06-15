'use client';

import { useState } from 'react';
import DisabledDatesPicker from '../DisabledDatesPicker';
import { useToast } from '../../hooks/toast';
import { DoctorFormData } from '../types';


interface Props {
  isAdmin: boolean;
  form: DoctorFormData;
  onChange: (form: DoctorFormData) => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isEditing: boolean;
  saving: boolean;


}


export default function DoctorForm({ isAdmin, form, onChange, onSubmit, onCancel, isEditing, saving }: Props) {

  const { showToast, ToastComponent } = useToast();

 const set = (field: keyof DoctorFormData, value: string | number) =>
    onChange({ ...form, [field]: value });

  const [status, setStatus] = useState<{
  type: 'idle' | 'success' | 'error';
  message: string;
 }>({ type: 'idle', message: '' });


  return (
    <>
      {ToastComponent}
      <form onSubmit={onSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">ФИО</label>
            <input
              className="form-control" style={{ width: '100%' }}
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Телефон</label>
            <input
              className="form-control" style={{ width: '100%' }}
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Специализация</label>
            <input
              className="form-control" style={{ width: '100%' }}
              value={form.specialization}
              onChange={e => set('specialization', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Образование</label>
            <input
              className="form-control" style={{ width: '100%' }}
              value={form.education}
              onChange={e => set('education', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Опыт (лет)</label>
            <input
              type="number" className="form-control" style={{ width: '100%' }}
              value={form.experienceYears}
              onChange={e => set('experienceYears', Number(e.target.value))}
            />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Описание / Краткая биография</label>
            <textarea
              className="form-control"
              style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Длительность приёма (мин)</label>
            <select
              className="form-control" style={{ width: '100%' }}
              value={form.slotDuration}
              onChange={e => set('slotDuration', Number(e.target.value))}
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
              value={form.workStartTime}
              onChange={e => set('workStartTime', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Конец работы</label>
            <input
              type="time" className="form-control" style={{ width: '100%' }}
              value={form.workEndTime}
              onChange={e => set('workEndTime', e.target.value)}
            />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Выходные дни (0=Вс, 1=Пн … 6=Сб, через запятую)</label>
            <input
              className="form-control" style={{ width: '100%' }}
              value={form.weekends}
              onChange={e => set('weekends', e.target.value)}
              placeholder="6,0"
            />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Нерабочие дни (выберите в календаре)</label>
            <DisabledDatesPicker
              value={form.disabledDates}
              onChange={v => set('disabledDates', v)}
            />
          </div>
          {isAdmin && (
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Новый пароль (оставьте пустым, чтобы не менять)</label>
              <input
                type="password" className="form-control" style={{ width: '100%' }}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Не менять"
              />
            </div>
          )}

        </div>

        {status && (
          <p style={{
            marginTop: '1rem', fontSize: '0.85rem', fontWeight: 600,
            color: status.type === 'error' ? 'var(--color-danger)' : 'var(--color-primary)',
          }}>
            {status.message == 'error' ? 'Ошибка при сохранении. Попробуйте ещё раз.' : status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`btn ${saving ? 'btn-disabled' : 'btn-primary'}`}
          style={{ marginTop: '1.5rem', padding: '0.75rem 2rem' }}
        >
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </form>
    </>
  );
}
