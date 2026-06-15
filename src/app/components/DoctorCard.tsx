import Link from 'next/link';
import DoctorAvatar from './DoctorAvatar';
import {Doctor} from '../components/types'; 

interface Props {
    doctor: Doctor;
    color?: string;
    showBookingButton?: boolean;
    onClick?: () => void;
}

function getDoctorColor(spec: string) {
  if (spec.includes('Терап')) return '#1a4a6b';
  if (spec.includes('Невро')) return '#2d7a5f';
  if (spec.includes('Процедур')) return '#7a5c2e';
  return '#4f46e5';
}


export default function DoctorCard({ doctor: d, color, showBookingButton = true, onClick }: Props) {
    const specColor = color || getDoctorColor(d.specialization);

    return (
  <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      {/* Photo banner */}
      <div style={{
        width: '100%', height: 180,
        background: `linear-gradient(160deg, ${specColor}33, ${specColor}99)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <DoctorAvatar avatar={d.avatar} name={d.name} size={180} color={specColor} />
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem' }}>
        <span style={{
          background: 'var(--color-primary-glow)', color: specColor,
          fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px',
          borderRadius: 20, display: 'inline-block', marginBottom: '0.5rem',
        }}>
          {d.specialization}
        </span>

        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{d.name}</h3>

        {(d.education || d.experienceYears) && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
            {d.education}{d.education && d.experienceYears ? ' · ' : ''}{d.experienceYears ? `${d.experienceYears} лет опыта` : ''}
          </div>
        )}

        {d.description && (
          <p style={{
            fontSize: '0.85rem', lineHeight: 1.6,
            color: 'var(--text-secondary)', marginBottom: '0.75rem',
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {d.description}
          </p>
        )}

        {(d.workStartTime || d.slotDuration) && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {d.workStartTime && (
              <span style={{ background: 'var(--bg-secondary)', borderRadius: 6, padding: '3px 8px', fontSize: '0.78rem' }}>
                📅 {d.workStartTime}–{d.workEndTime}
              </span>
            )}
            {d.slotDuration && (
              <span style={{ background: 'var(--bg-secondary)', borderRadius: 6, padding: '3px 8px', fontSize: '0.78rem' }}>
                ⏱️ {d.slotDuration} мин
              </span>
            )}
          </div>
        )}

        {showBookingButton && (
          <Link href={`/booking?doctorId=${d.id}`} className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
            onClick={e => e.stopPropagation()}>
            Записаться →
          </Link>
        )}
      </div>
    </div>
    );
}