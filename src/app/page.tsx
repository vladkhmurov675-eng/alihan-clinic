import Link from 'next/link';
import { getSettings } from './actions';
import { ShieldCheck, UserCheck, CalendarRange, MapPin, PhoneCall, Clock } from 'lucide-react';

export const revalidate = 0;

export default async function Home() {
  let settings: Record<string, string> = {};

  try {
    settings = await getSettings();
  } catch {
    // settings will fall back to defaults
  }

  const clinicName = settings.clinic_name || 'Алихан';

  return (
    <div style={{ background: 'var(--bg-primary)' }}>

      {/* ── HERO — split layout ── */}
      <section style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: 'clamp(3rem, 8vw, 6rem) 1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '3rem',
        alignItems: 'center',
      }}>

        {/* Left — text */}
        <div>
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
            <ShieldCheck size={13} /> Медицинский центр · Алматы
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: '1.1rem',
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

          <p style={{
            fontSize: '1.05rem',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            maxWidth: 460,
          }}>
            Запишитесь к специалистам клиники «{clinicName}» онлайн — без очередей, без звонков. Выберите врача и удобное время за пару минут.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/booking" className="btn btn-primary" style={{
              fontSize: '1rem', padding: '0.85rem 2rem',
            }}>
              Записаться онлайн →
            </Link>
            <Link href="/doctors" className="btn btn-outline" style={{
              fontSize: '1rem', padding: '0.85rem 2rem',
            }}>
              Наши врачи
            </Link>
          </div>

          {/* Quick stats */}
          <div style={{
            display: 'flex', gap: '2rem', marginTop: '2.5rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--border-color)',
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

        {/* Right — info card */}
        <div style={{ position: 'relative' }}>
          {/* Decorative background blob */}
          <div style={{
            position: 'absolute', inset: -20,
            background: 'radial-gradient(ellipse at center, rgba(45,106,45,0.08) 0%, transparent 70%)',
            borderRadius: '50%', zIndex: 0,
          }} />

          <div className="card" style={{
            position: 'relative', zIndex: 1,
            padding: '2rem',
            borderColor: 'rgba(45,106,45,0.2)',
          }}>
            {/* Clinic badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              marginBottom: '1.5rem', paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(120deg, var(--color-primary), var(--color-accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '1.2rem',
                flexShrink: 0,
              }}>А</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Клиника «{clinicName}»</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>г. Алматы</div>
              </div>
              <div style={{
                marginLeft: 'auto',
                width: 10, height: 10, borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
              }} />
            </div>

            {/* Info rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {[
                { icon: <MapPin size={16} />, text: settings.clinic_address || 'пр. Аль-Фараби, 140А' },
                { icon: <Clock size={16} />, text: 'Пн–Пт: 07:00–19:00 · Сб: 07:00–13:00' },
                { icon: <PhoneCall size={16} />, text: settings.clinic_phone || '+7 (727) 321-77-88' },
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  fontSize: '0.9rem', color: 'var(--text-secondary)',
                  background: 'var(--bg-secondary)',
                  padding: '0.65rem 0.9rem', borderRadius: 8,
                }}>
                  <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>

            {/* WhatsApp row */}
            <a
              href={`https://wa.me/${(settings.clinic_whatsapp || '+77019998877').replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                marginTop: '0.9rem',
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                color: '#166534',
                padding: '0.65rem 0.9rem', borderRadius: 8,
                fontSize: '0.9rem', fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>💬</span>
              Написать в WhatsApp
            </a>

            {/* Book button */}
            <Link href="/booking" className="btn btn-primary" style={{
              width: '100%', marginTop: '1.25rem',
              justifyContent: 'center', fontSize: '0.95rem',
            }}>
              Записаться онлайн →
            </Link>
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
            {[
              { emoji: '🩺', title: 'Терапевт', desc: 'Первичный приём, лечение общих заболеваний, выдача справок и рецептов.', href: '/services' },
              { emoji: '🧠', title: 'Невропатолог', desc: 'Головные боли, нарушения сна, болезни позвоночника и нервной системы.', href: '/services' },
              { emoji: '💉', title: 'Процедурный кабинет', desc: 'Капельницы, инъекции, забор анализов, перевязки и ЭКГ.', href: '/procedures' },
            ].map((s) => (
              <div key={s.title} className="card" style={{ padding: '1.75rem' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{s.emoji}</div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '1rem' }}>{s.desc}</p>
                <Link href={s.href} style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 600 }}>
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
