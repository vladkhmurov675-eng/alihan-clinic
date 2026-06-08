import { redirect } from 'next/navigation';
import { isAdminLoggedIn, getDoctors, getSettings, getProcedures, getAppointments } from '../actions';
import AdminDashboard from '../components/AdminDashboard';

export const revalidate = 0;

export const metadata = {
  title: 'Панель администратора | Клиника Алихан',
  description: 'Административная панель клиники Алихан.',
};

export const dynamic = 'force-dynamic';


export default async function AdminPage() {
  // Auth check — redirect to login if not admin
  const isAdmin = await isAdminLoggedIn();
  if (!isAdmin) {
    redirect('/login');
  }

  let doctors: any[] = [];
  let procedures: any[] = [];
  let appointments: any[] = [];
  let settings: Record<string, string> = {};
  let dbError = false;

  try {
    doctors = await getDoctors();
    procedures = await getProcedures();
    appointments = await getAppointments();
    settings = await getSettings();
  } catch (error) {
    console.error('Error fetching admin data:', error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{
          padding: '3rem', maxWidth: '600px', margin: '0 auto',
          borderColor: 'var(--color-danger)', background: 'var(--color-danger-glow)',
        }}>
          <h2 style={{ color: '#f87171', marginBottom: '1rem' }}>Ошибка подключения к базе данных</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Проверьте настройки PostgreSQL в файле <code>.env</code></p>
        </div>
      </div>
    );
  }

  return <AdminDashboard doctors={doctors} procedures={procedures} appointments={appointments} settings={settings} />;
}
