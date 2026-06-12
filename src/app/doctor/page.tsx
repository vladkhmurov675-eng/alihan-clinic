import { redirect } from 'next/navigation';
import { getSessionDoctorId } from '../actions';
import DoctorDashboard from '../components/DoctorDashboard';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Кабинет врача | Клиника Алихан',
  description: 'Панель управления для врачей клиники Алихан.',
};

export default async function DoctorPage() {
  const doctorId = await getSessionDoctorId();
  if (!doctorId) {
    redirect('/login?error=unauthorized');
  }

  return <DoctorDashboard />;
}