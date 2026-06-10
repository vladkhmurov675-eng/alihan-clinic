import { redirect } from 'next/navigation';
import { getSessionRole, getDoctors, getProcedures, getDirectorStats } from '../actions';
import DirectorDashboard from '../components/DirectorDashboard';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Руководитель | Клиника Алихан',
  description: 'Аналитика клиники — записи, выручка, загрузка врачей.',
};

interface Doctor {
  id: number;
  name: string;
  specialization: string;
}

interface Procedure {
  id: number;
  name: string;
  price: number;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  status: string;
  price: number;
  doctor: Doctor;
  procedure: Procedure | null;
}

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

  const { from, to } = getDateRange(30);

  const [appointments, doctors, procedures] = await Promise.all([
    getDirectorStats(from, to),
    getDoctors(),
    getProcedures(),
  ]);

  return (
    <DirectorDashboard
      initialAppointments={appointments as Appointment[]}
      doctors={doctors as Doctor[]}
      procedures={procedures as Procedure[]}
      initialFrom={from}
      initialTo={to}
    />
  );
}
