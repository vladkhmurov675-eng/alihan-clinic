import { getDoctors } from '../actions';
import DoctorDashboard from '../components/DoctorDashboard';

export const revalidate = 0;

export const metadata = {
  title: 'Кабинет врача | Клиника Алихан',
  description: 'Панель управления для врачей клиники Алихан. Просмотр записей, управление расписанием.',
};

export default async function DoctorPage() {
  let doctors: any[] = [];
  let dbError = false;

  try {
    doctors = await getDoctors();
  } catch (error) {
    console.error('Error fetching doctors:', error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{
          padding: '3rem',
          maxWidth: '600px',
          margin: '0 auto',
          borderColor: 'var(--color-danger)',
          background: 'var(--color-danger-glow)',
        }}>
          <h2 style={{ color: '#f87171', marginBottom: '1rem' }}>Ошибка подключения к базе данных</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Проверьте настройки подключения к PostgreSQL в файле <code>.env</code></p>
        </div>
      </div>
    );
  }

  return <DoctorDashboard doctors={doctors} />;
}
