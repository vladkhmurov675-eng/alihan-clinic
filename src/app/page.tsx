import Link from 'next/link';
import { getSettings, getDoctors } from './actions';
import { ShieldCheck, UserCheck, CalendarRange, MapPin, PhoneCall, Clock } from 'lucide-react';
import { Doctor } from './components/types';
import DoctorAvatar from './components/DoctorAvatar';
export const revalidate = 0;

export default async function Home() {
  let settings: Record<string, string> = {};
  let doctors: Doctor[] = [];

  try {
    settings = await getSettings();
  } catch {
    // settings will fall back to defaults
  }

  try {
    doctors = await getDoctors();
  } catch {
    // doctors will fall back to defaults
  }

  const top3Doctors = doctors.filter(d => d.avatar).sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0)).slice(0, 3);

  const clinicName = settings.clinic_name || 'Алихан';

  return (
    <div style={{ background: 'var(--bg-primary)' }}>

      {/* ── HERO — split layout ── */}
<section style={{
  maxWidth: 1200,
  margin: '0 auto',
  padding: 'clamp(3rem, 8vw, 6rem) 1.5rem',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '3rem',
  alignItems: 'center',
}}>

  {/* Left — text, fades up on load */}
  <div className="animate-fade-up">
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'var(--color-primary-glow)',
      border: '1px solid rgba(45,106,45,0.2)',
      color: 'var(--color-primary)',
      padding: '0.35rem 0.9rem',
      borderRadius: 9999,
      fontSize: '0.8rem', fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      marginBottom: '1.25rem',
    }}>
      🛡️ Медицинский центр · Алматы
    </div>

    <h1 style={{
      fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
      fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em',
      color: 'var(--text-primary)', marginBottom: '1.1rem',
    }}>
      Здоровье вашей семьи —{' '}
      <span style={{
        color: 'var(--color-primary)',
        borderBottom: '3px solid var(--color-accent)',
        paddingBottom: 2,
      }}>
        наш приоритет
      </span>
    </h1>

    <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: 460 }}>
      Запишитесь к специалистам клиники «Алихан» онлайн — без очередей, без звонков.
      Выберите врача и удобное время за пару минут.
    </p>

    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Link href="/booking" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
        Записаться онлайн →
      </Link>
      <Link href="/doctors" className="btn btn-outline" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
        Наши врачи
      </Link>
    </div>

    <div style={{
      display: 'flex', gap: '2rem', marginTop: '2.5rem',
      paddingTop: '2rem', borderTop: '1px solid var(--border-color)',
    }}>
      {[
        { value: '3', label: 'специалиста' },
        { value: '5 000+', label: 'пациентов' },
        { value: '07:00', label: 'начало приёма' },
      ].map(({ value, label }) => (
        <div key={label}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
        </div>
      ))}
    </div>
  </div>

  {/* Right — real photo instead of icon card, fades up with slight delay */}
  <div className="animate-fade-up hover-lift" style={{ animationDelay: '120ms', position: 'relative' }}>
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(45,106,45,0.18)',
      border: '1px solid var(--border-color)',
      position: 'relative',
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=900&h=700&fit=crop&q=80"
        alt="Клиника Алихан — приём пациентов"
        style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }}
      />

      {/* Floating info chip over the photo */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16, right: 16,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(6px)',
        borderRadius: 14, padding: '0.9rem 1.1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: '#22c55e', flexShrink: 0,
        }} className="animate-pulse-soft" />
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Принимаем сегодня · Пн–Сб 07:00–19:00
        </div>
      </div>
    </div>

    {/* Decorative accent badge */}
    <div style={{
      position: 'absolute', top: -14, right: -14,
      background: 'var(--color-gold)', color: '#fff',
      borderRadius: 9999, padding: '6px 16px',
      fontSize: '0.78rem', fontWeight: 700,
      boxShadow: '0 4px 16px rgba(200,169,110,0.4)',
    }}>
      ✓ Онлайн-запись
    </div>
  </div>
</section>

      {/* ── SERVICES ── */}
      <section style={{
        background: '#fff',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3.5rem 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="section-label">Специализации</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Наши услуги</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {top3Doctors.map((d) => (
              <div key={d.id} className="card" style={{ padding: '1.75rem' }}>
                <div style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid var(--border-color)',
                    margin: '0 0 1.25rem',
                    }}>
                <DoctorAvatar name={d.name} avatar={d.avatar} size={64} />
                </div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{d.specialization}</h3>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '1rem' }}>{d.description}</p>
                <Link href={`/doctors/${d.id}`} style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                  Подробнее →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="section-label">Преимущества</div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Почему выбирают нас</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: <UserCheck size={22} />, title: 'Опытные врачи', desc: 'Специалисты с многолетней практикой и постоянным повышением квалификации.' },
            { icon: <CalendarRange size={22} />, title: 'Удобная запись', desc: 'Онлайн-запись 24/7 — видите реальную занятость врача и выбираете слот.' },
            { icon: <ShieldCheck size={22} />, title: 'Без очередей', desc: 'Принимаем строго по записи — ваше время ценно так же, как и ваше здоровье.' },
            { icon: <Clock size={22} />, title: 'Ранний приём', desc: 'Начинаем с 07:00 — удобно до работы или учёбы.' },
          ].map((f) => (
            <div key={f.title} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ color: 'var(--color-primary)', marginBottom: '0.25rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{f.title}</h3>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-primary), #1a4a1a)',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#fff', marginBottom: '0.75rem' }}>
            Запишитесь прямо сейчас
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Онлайн-запись занимает 2 минуты. Выберите врача, дату и время — мы подтвердим запись.
          </p>
          <Link href="/booking" style={{
            display: 'inline-block',
            background: '#fff', color: 'var(--color-primary)',
            padding: '0.9rem 2.5rem', borderRadius: 8,
            fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}>
            Онлайн-запись →
          </Link>
        </div>
      </section>

    </div>
  );
}
