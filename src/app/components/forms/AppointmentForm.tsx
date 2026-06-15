'use client';

import React from 'react';
import { Save, X } from 'lucide-react';
import { AppointmentFormData, Doctor, Procedure } from '../types';

interface Props {
  form: AppointmentFormData;
  onChange: (form: AppointmentFormData) => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  saving: boolean;
  doctors: Doctor[];
  procedures: Procedure[];
}

export default function AppointmentForm({ form, onChange, onSubmit, onCancel, saving, doctors, procedures }: Props) {
  const set = (field: keyof AppointmentFormData, value: string | number) =>
    onChange({ ...form, [field]: value });

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem', borderColor: 'var(--color-accent)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Редактировать запись</h3>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>

          <div className="input-group">
            <label className="input-label">ФИО пациента *</label>
            <input className="form-control" style={{ width: '100%' }} required
              value={form.patientName}
              onChange={e => set('patientName', e.target.value)}
              placeholder="Иванов Иван Иванович"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Телефон *</label>
            <input type="tel" className="form-control" style={{ width: '100%' }} required
              value={form.patientPhone}
              onChange={e => {
                const digits = e.target.value.replace(/\D/g, '');
                const normalized = digits.startsWith('7') ? digits.slice(0, 11) : `7${digits}`.slice(0, 11);
                set('patientPhone', `+${normalized}`);
              }}
              placeholder="+77001234567"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Врач *</label>
            <select className="form-control" style={{ width: '100%' }} required
              value={form.doctorId}
              onChange={e => set('doctorId', Number(e.target.value))}
            >
              <option value={0}>— Выберите врача —</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Процедура</label>
            <select className="form-control" style={{ width: '100%' }}
              value={form.procedureId}
              onChange={e => set('procedureId', Number(e.target.value))}
            >
              <option value={0}>— Без процедуры —</option>
              {procedures.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.price.toLocaleString('ru-RU')} ₸</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Дата *</label>
            <input type="date" className="form-control" style={{ width: '100%' }} required
              value={form.date}
              onChange={e => set('date', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Время *</label>
            <input type="time" className="form-control" style={{ width: '100%' }} required
              value={form.time}
              onChange={e => set('time', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Статус *</label>
            <select className="form-control" style={{ width: '100%' }} required
              value={form.status}
              onChange={e => set('status', e.target.value)}
            >
              <option value="PENDING">Ожидает</option>
              <option value="CONFIRMED">Подтверждён</option>
              <option value="COMPLETED">Завершён</option>
              <option value="CANCELLED">Отменён</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Цена (тенге)</label>
            <input type="number" min={0} step={100}
              className="form-control" style={{ width: '100%' }}
              value={form.price || ''}
              onChange={e => set('price', Number(e.target.value))}
              placeholder="5000"
            />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Жалоба</label>
            <textarea className="form-control" style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
              value={form.complaint}
              onChange={e => set('complaint', e.target.value)}
              placeholder="Опишите симптомы..."
            />
          </div>

        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" disabled={saving} className={`btn ${saving ? 'btn-disabled' : 'btn-primary'}`}>
            <Save size={16} /> {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
