import { getDoctors, getSettings } from '../actions';
import AdminDashboard from '../components/AdminDashboard';

export const revalidate = 0;

export const metadata = {
  title: 'Панель администратора | Клиника Алихан',
  description: 'Административная панель клиники Алихан. Управление врачами, настройками и журналом уведомлений.',
};

export default async function AdminPage() {
  let doctors: any[] = [];
  let settings: Record<string, string> = {};
  let dbError = false;

  try {
    doctors = await getDoctors();
    settings = await getSettings();
  } catch (error) {
    console.error('Error fetching admin data:', error);
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

  return <AdminDashboard doctors={doctors} settings={settings} />;
}
