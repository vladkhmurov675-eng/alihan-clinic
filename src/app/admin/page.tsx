import { redirect } from 'next/navigation';
import { isAdminLoggedIn, getDoctors, getSettings, getProcedures, getAppointments } from '../actions';
import AdminDashboard from '../components/AdminDashboard';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Панель администратора | Клиника Алихан',
  description: 'Административная панель клиники Алихан.',
};

interface Doctor {
  id: number; name: string; phone: string; specialization: string;
  avatar: string | null; slotDuration: number; workStartTime: string;
  workEndTime: string; weekends: string; disabledDates: string;
  password: string; education: string | null; experienceYears: number | null;
  description: string | null; createdAt: Date;
}

interface Procedure {
  id: number; name: string; doctorId: number; duration: number; price: number;
}

interface Appointment {
  id: number; doctorId: number; patientName: string; patientPhone: string;
  complaint: string; date: string; time: string; filePath: string | null;
  status: string; price: number | null; procedureId: number | null; createdAt: Date;
  doctor: { id: number; name: string; specialization: string };
  procedure: { id: number; name: string; price: number } | null;
}

export default async function AdminPage() {
  const isAdmin = await isAdminLoggedIn();
  if (!isAdmin) redirect('/login');

  let doctors: Doctor[] = [];
  let procedures: Procedure[] = [];
  let appointments: Appointment[] = [];
  let settings: Record<string, string> = {};
  let dbError = false;

  try {
    doctors     = (await getDoctors())     as Doctor[];
    procedures  = (await getProcedures())  as Procedure[];
    appointments = (await getAppointments()) as Appointment[];
    settings    = await getSettings();
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

  return (
    <AdminDashboard
      doctors={doctors}
      procedures={procedures}
      appointments={appointments}
      settings={settings}
    />
  );
}
