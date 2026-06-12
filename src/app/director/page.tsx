import { redirect } from 'next/navigation';
import { getSessionRole, getDoctors, getProcedures, getDirectorStats } from '../actions';
import DirectorDashboard from '../components/DirectorDashboard';

export const revalidate = 0;

export const metadata = {
  title: 'Руководитель | Клиника Алихан',
  description: 'Аналитика клиники — записи, выручка, загрузка врачей.',
};

function getDateRange(days: number) {
  const to   = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split('T')[0],
    to:   to.toISOString().split('T')[0],
  };
}

export default async function DirectorPage() {
  const role = await getSessionRole();
  if (role !== 'director' && role !== 'admin') {
    redirect('/login');
  }

  // Default: last 30 days
  const { from, to } = getDateRange(30);

  const [appointments, doctors, procedures] = await Promise.all([
    getDirectorStats(from, to),
    getDoctors(),
    getProcedures(),
  ]);

  return (
    <DirectorDashboard
      initialAppointments={appointments as any}
      doctors={doctors as any}
      procedures={procedures as any}
      initialFrom={from}
      initialTo={to}
    />
  );
}
