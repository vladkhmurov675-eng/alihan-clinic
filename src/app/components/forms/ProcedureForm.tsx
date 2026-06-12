'use client';

import React from 'react';
import { Save, X } from 'lucide-react';

export interface ProcedureFormData {
  name: string;
  doctorId: number;
  duration: number;
  price: number;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
}

interface Props {
  form: ProcedureFormData;
  onChange: (form: ProcedureFormData) => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isEditing: boolean;
  saving: boolean;
  doctors: Doctor[];
}

export default function ProcedureForm({ form, onChange, onSubmit, onCancel, isEditing, saving, doctors }: Props) {
  const set = (field: keyof ProcedureFormData, value: string | number) =>
    onChange({ ...form, [field]: value });

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem', borderColor: 'var(--color-accent)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>{isEditing ? 'Редактировать услугу' : 'Добавить новую услугу'}</h3>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Название услуги *</label>
            <input className="form-control" style={{ width: '100%' }} required
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Например: Общий анализ крови"
            />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Врач *</label>
            <select className="form-control" style={{ width: '100%' }} required
              value={form.doctorId || ''}
              onChange={e => set('doctorId', Number(e.target.value))}
            >
              <option value="">— Выберите врача —</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Длительность (мин) *</label>
            <input type="number" min={5} step={5}
              className="form-control" style={{ width: '100%' }} required
              value={form.duration || ''}
              onChange={e => set('duration', Number(e.target.value))}
              placeholder="30"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Цена (тенге) *</label>
            <input type="number" min={0} step={100}
              className="form-control" style={{ width: '100%' }} required
              value={form.price || ''}
              onChange={e => set('price', Number(e.target.value))}
              placeholder="5000"
            />
          </div>

        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" disabled={saving} className={`btn ${saving ? 'btn-disabled' : 'btn-primary'}`}>
            <Save size={16} /> {saving ? 'Сохранение...' : isEditing ? 'Обновить' : 'Создать'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
