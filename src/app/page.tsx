import { getDoctors, getSettings } from './actions';
import BookingWizard from './components/BookingWizard';
import { ShieldCheck, UserCheck, PhoneCall, MapPin, CalendarRange } from 'lucide-react';

export const revalidate = 0; // Disable server caching to ensure schedules are always fresh

export default async function Home() {
  let doctors: any[] = [];
  let settings: Record<string, string> = {};
  let dbError = false;

  try {
    doctors = await getDoctors();
    settings = await getSettings();
  } catch (error) {
    console.error('Error fetching landing page data:', error);
    dbError = true;
  }

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '5rem 1.5rem',
        background: 'radial-gradient(circle at top right, rgba(6, 182, 212, 0.1) 0%, rgba(10, 15, 29, 0) 50%), linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            color: 'var(--color-accent)',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldCheck size={14} /> Медицинский центр
          </span>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            lineHeight: 1.1,
            background: 'linear-gradient(to right, #ffffff, #a5f3fc, #e0f2fe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em'
          }}>
            Здоровье вашей семьи — наш главный приоритет
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '650px'
          }}>
            Запишитесь на прием к ведущим специалистам клиники «{settings.clinic_name || 'Алихан'}» за несколько секунд. Выберите врача, дату и удобное время онлайн.
          </p>
        </div>
      </section>

      {/* Info Cards Grid */}
      <section className="container" style={{ marginTop: '-2.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'rgba(18, 24, 41, 0.9)' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--color-accent-glow)', color: 'var(--color-accent)' }}>
              <MapPin size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Адрес клиники</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>пр. Аль-Фараби 77, Алматы</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'rgba(18, 24, 41, 0.9)' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}>
              <CalendarRange size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>График работы</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Понедельник — Суббота<br />С 07:00 до 20:00</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'rgba(18, 24, 41, 0.9)' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <PhoneCall size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Контакты</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>+7 (727) 333-4455<br />info@alihan-clinic.kz</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Booking Wizard Section */}
      <section className="container" id="booking" style={{ marginTop: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Онлайн-запись на прием</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Пройдите простые шаги для бронирования своего визита</p>
        </div>

        {dbError ? (
          <div className="glass-panel" style={{
            padding: '2.5rem',
            textAlign: 'center',
            borderColor: 'var(--color-danger)',
            background: 'var(--color-danger-glow)',
            marginTop: '2rem'
          }}>
            <h3 style={{ color: '#f87171', marginBottom: '1rem' }}>База данных временно недоступна</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
              Не удалось подключиться к серверу базы данных. Пожалуйста, убедитесь, что вы настроили корректный адрес подключения в файле <strong>`.env`</strong> и запустили PostgreSQL сервер.
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '1rem',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              textAlign: 'left',
              maxWidth: '550px',
              margin: '0 auto',
              wordBreak: 'break-all'
            }}>
              DATABASE_URL="postgresql://username:password@localhost:5432/alihan_clinic"
            </div>
          </div>
        ) : (
          <BookingWizard doctors={doctors} settings={settings} />
        )}
      </section>

      {/* Why Choose Us */}
      <section className="container" style={{ marginTop: '4rem' }}>
        <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '2.5rem' }}>Почему выбирают нас?</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', fontWeight: 700 }}>
              <UserCheck size={18} /> Квалифицированные врачи
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Наши специалисты имеют многолетний опыт работы и постоянно повышают квалификацию в ведущих медицинских учреждениях.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', fontWeight: 700 }}>
              <CalendarRange size={18} /> Удобное онлайн-расписание
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Записывайтесь на прием в любое время суток, видя актуальную занятость врачей в реальном времени. Без звонков и очередей.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', fontWeight: 700 }}>
              <ShieldCheck size={18} /> Современное оборудование
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Клиника оснащена современным диагностическим оборудованием, что гарантирует высокую точность результатов обследований.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
