import DoctorsListClient from './DoctorsListClient';
import { getDoctors } from '../actions';

export const metadata = {
  title: 'Врачи | Клиника Алихан',
  description: 'Специалисты клиники Алихан — терапевт, невропатолог, процедурный кабинет.',
};

export default async function DoctorsPage() {
  const doctors = await getDoctors();
  return <DoctorsListClient doctors={doctors} />;
}
