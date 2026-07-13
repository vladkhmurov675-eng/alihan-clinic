'use client';

import { useState, useEffect } from 'react';
import DisabledDatesPicker from '../calendars/DisabledDatesPicker';
import { useToast } from '../../hooks/toast';
import { DoctorFormData } from '../types';
import DoctorAvatar from '../DoctorAvatar';
import AvatarUploadForm from './AvatarUploadForm';

const specialties = ['Терапевт', 'Кардиолог', 'Невролог', 'Педиатр', 'Дерматолог', 'Гинеколог', 'Ортопед', 'Психиатр', 'Эндокринолог'];

interface Props {
  isAdmin: boolean;
  form: DoctorFormData;
  onChange: (form: DoctorFormData) => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  saving: boolean;
  doctorId?: number;
  currentAvatar?: string | null;
  onAvatarUpdate?: (url: string) => void;
}

// ── Responsive helper ──────────────────────────────────────────
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

export default function DoctorForm({
  isAdmin,
  form,
  onChange,
  onSubmit,
  saving,
  doctorId,
  currentAvatar,
  onAvatarUpdate,
}: Props) {
  const isMobile = useIsMobile();
  const { showToast, ToastComponent } = useToast();
  const [showAvatarForm, setShowAvatarForm] = useState(false);

  const set = (field: keyof DoctorFormData, value: string | number) =>
    onChange({ ...form, [field]: value });

  return (
    <>
      {ToastComponent}
      <div className = 'form-container' style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
        gap: isMobile ? '1.25rem' : '1.5rem',
        alignItems: 'start',
      }}>

        {/* ── Avatar section (shown first on mobile, right column on desktop) ── */}
        <div style={{
          order: isMobile ? -1 : 1,
          height: 'auto', width: '100%',
          backgroundColor: 'white',
          padding: 10,
          border: '3px solid #e0e0e0',
          borderRadius: 10,
          flexShrink: 0,
          float: isMobile ? 'none' : 'right',
          boxSizing: 'border-box',
        }}>

          <div style={{ width: '100%', height: 450, margin: 'auto' }}>
          <DoctorAvatar
            name={form.name || 'Н И'}
            avatar={currentAvatar}
            size={100}
          />
          </div>
          {doctorId ? (
            <>
              <button
                type="button"
                onClick={() => setShowAvatarForm(v => !v)}
                className="btn btn-secondary"
                style={{ display: 'block', width: '100%', marginTop: '0.75rem', fontSize: '0.85rem' }}
              >
                {showAvatarForm ? 'Скрыть' : 'Изменить фото'}
              </button>

              {showAvatarForm && (
                <AvatarUploadForm
                  doctorId={doctorId}
                  onUpload={(newUrl: string) => {
                    onAvatarUpdate?.(newUrl);
                    showToast('Аватар обновлён', 'success');
                    setShowAvatarForm(false);
                  }}
                  onClose={() => setShowAvatarForm(false)}
                />
              )}
            </>
          ) : (
            <p style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginTop: '0.75rem',
              textAlign: 'center',
              lineHeight: 1.5,
            }}>
              Фото можно добавить после создания врача
            </p>
          )}
        </div>

        {/* ── Main form ── */}
        <form onSubmit={onSubmit} style={{ order: isMobile ? 2 : 0 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '0.85rem' : '1rem',
          }}>

            <div className="input-group" style={{ gridColumn: isMobile ? undefined : '1 / 2' }}>
              <label className="input-label">ФИО</label>
              <input
                className="form-control"
                style={{ width: '100%' }}
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Телефон</label>
              <input
                className="form-control"
                style={{ width: '100%' }}
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Специализация</label>
              <select
                className="form-control"
                style={{ width: '100%' }}
                value={form.specialization}
                onChange={e => set('specialization', e.target.value)}
              >
                <option value="">--Выберите специализацию--</option>
                {specialties.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Образование</label>
              <input
                className="form-control"
                style={{ width: '100%' }}
                value={form.education ?? ''}
                onChange={e => set('education', e.target.value)}
              />
            </div>

            <div className="input-group" style = {{gridColumn: '1 / -1'}}>
              <label className="input-label">Опыт (лет)</label>
              <input
                  type="number"
                  min={0}
                  className="form-control"
                  style={{ width: '100%' }}
                  value={form.experienceYears ?? 0}
                  onChange={e => set('experienceYears', Math.max(0, Number(e.target.value) || 0))}
                  />
            </div>

            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Описание / Краткая биография</label>
              <textarea
                className="form-control"
                style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
                value={form.description ?? ''}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Длительность приёма (мин)</label>
              <select
                className="form-control"
                style={{ width: '100%' }}
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
                type="time"
                lang="ru-RU"
                className="form-control"
                style={{ width: '100%' }}
                value={form.workStartTime}
                onChange={e => set('workStartTime', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Конец работы</label>
              <input
                type="time"
                lang="ru-RU"
                className="form-control"
                style={{ width: '100%' }}
                value={form.workEndTime}
                onChange={e => set('workEndTime', e.target.value)}
              />
            </div>

            <div className="input-group" style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
              <label className="input-label">
                Выходные дни (0=Вс, 1=Пн … 6=Сб, через запятую)
              </label>
              <input
                className="form-control"
                style={{ width: '100%' }}
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
              <div className="input-group" style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
                <label className="input-label">
                  Новый пароль (оставьте пустым, чтобы не менять)
                </label>
                <input
                  type="password"
                  className="form-control"
                  style={{ width: '100%' }}
                  value={form.password ?? ''}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Не менять"
                />
              </div>
            )}

          </div>

          <button
            type="submit"
            disabled={saving}
            className={`btn ${saving ? 'btn-disabled' : 'btn-primary'}`}
            style={{
              marginTop: '1.5rem', padding: '0.75rem 2rem',
              width: isMobile ? '100%' : undefined,
            }}
          >
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </form>

      </div>
    </>
  );
}