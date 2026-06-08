import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // ── Clean existing data (order matters due to foreign keys) ──
  if (prisma.appointment !== undefined) {
    await prisma.appointment.deleteMany({});
  }
  if (prisma.procedure !== undefined) {
    await prisma.procedure.deleteMany({});
  }
  if (prisma.doctor !== undefined) {
    await prisma.doctor.deleteMany({});
  }
  if (prisma.admin !== undefined) {
    await prisma.admin.deleteMany({});
  }
  if (prisma.whatsAppLog !== undefined) {
    await prisma.whatsAppLog.deleteMany({});
  }
  if (prisma.setting !== undefined) {
    await prisma.setting.deleteMany({});
  }

  // ── Admins ──
  const adminPassword = await bcrypt.hash('ClinicAdmin2025!', 10);
  const directorPassword = await bcrypt.hash('ClinicDirector2025!', 10);

  await prisma.admin.createMany({
    data: [
      {
        name: 'Администратор',
        phone: '+77471852674',
        password: adminPassword,
        role: 'ADMIN',
        isActive: true,
      },
      {
        name: 'Руководитель',
        phone: '+77776707356',
        password: directorPassword,
        role: 'DIRECTOR',
        isActive: true,
      },
    ],
  });

  console.log('Admins seeded.');

  // ── Doctors ──
  const therapistPassword = await bcrypt.hash('Doctor1111!', 10);
  const neurologistPassword = await bcrypt.hash('Doctor2222!', 10);
  const procedurePassword = await bcrypt.hash('Doctor3333!', 10);

  const therapist = await prisma.doctor.create({
    data: {
      name: 'Иванова Алия Сериковна',
      specialization: 'Терапевт',
      phone: '+77011112233',
      password: therapistPassword,
      avatar: '/images/doctor-aliia.png',
      slotDuration: 30,
      workStartTime: '07:00',
      workEndTime: '11:00',
      weekends: '6,0',
      disabledDates: '',
      education: 'КазНМУ им. С.Д. Асфендиярова',
      experienceYears: 18,
      description: 'Специализируется на диагностике и лечении внутренних болезней, профилактике хронических заболеваний, ведёт пациентов всех возрастов.',
    },
  });

  const neurologist = await prisma.doctor.create({
    data: {
      name: 'Петров Тимур Владимирович',
      specialization: 'Невропатолог',
      phone: '+77022223344',
      password: neurologistPassword,
      avatar: '/images/doctor-timur.png',
      slotDuration: 20,
      workStartTime: '08:00',
      workEndTime: '12:00',
      weekends: '6,0',
      disabledDates: '',
      education: 'Медицинский университет Астана',
      experienceYears: 12,
      description: 'Лечение головных болей, мигреней, нарушений сна, заболеваний позвоночника и периферической нервной системы.',
    },
  });

  const procedureRoom = await prisma.doctor.create({
    data: {
      name: 'Алиханов Алихан Бауыржанович',
      specialization: 'Процедурный кабинет',
      phone: '+77033334455',
      password: procedurePassword,
      avatar: '/images/doctor-alihan.png',
      slotDuration: 30,
      workStartTime: '07:00',
      workEndTime: '11:00',
      weekends: '0',
      disabledDates: '',
      education: 'Алматинский медицинский колледж',
      experienceYears: 9,
      description: 'Проведение капельниц, внутримышечных и внутривенных инъекций, забор анализов, перевязки и другие процедуры.',
    },
  });

  console.log('Doctors seeded.');

  // ── Procedures ──
  const primaryTherapistProc = await prisma.procedure.create({
    data: { doctorId: therapist.id, name: 'Прием терапевта (первичный)', duration: 30, price: 5000 }
  });
  const secondaryTherapistProc = await prisma.procedure.create({
    data: { doctorId: therapist.id, name: 'Прием терапевта (повторный)', duration: 30, price: 4000 }
  });

  const primaryNeurologistProc = await prisma.procedure.create({
    data: { doctorId: neurologist.id, name: 'Прием невропатолога (первичный)', duration: 30, price: 7000 }
  });
  const secondaryNeurologistProc = await prisma.procedure.create({
    data: { doctorId: neurologist.id, name: 'Прием невропатолога (повторный)', duration: 20, price: 5000 }
  });

  const dripProc = await prisma.procedure.create({
    data: { doctorId: procedureRoom.id, name: 'Капельница (стандартная)', duration: 60, price: 4000 }
  });

  // Additional procedures for the Procedure Room to align with the list on the page
  await prisma.procedure.createMany({
    data: [
      { doctorId: procedureRoom.id, name: 'Внутримышечная инъекция', duration: 10, price: 1500 },
      { doctorId: procedureRoom.id, name: 'Внутривенная инъекция', duration: 15, price: 2000 },
      { doctorId: procedureRoom.id, name: 'Забор крови из вены', duration: 10, price: 1500 },
      { doctorId: procedureRoom.id, name: 'Забор крови из пальца', duration: 5, price: 800 },
      { doctorId: procedureRoom.id, name: 'Перевязка (простая)', duration: 15, price: 2500 },
      { doctorId: procedureRoom.id, name: 'Перевязка (сложная)', duration: 25, price: 4000 },
      { doctorId: procedureRoom.id, name: 'ЭКГ с расшифровкой', duration: 20, price: 5000 },
      { doctorId: procedureRoom.id, name: 'Обработка раны', duration: 20, price: 3000 },
    ],
  });

  console.log('Procedures seeded.');

  // ── Appointments ──
  const tomorrow = '2026-06-03';

  await prisma.appointment.createMany({
    data: [
      {
        doctorId: therapist.id,
        procedureId: primaryTherapistProc.id,
        patientName: 'Иванова Алия',
        patientPhone: '+77771234567',
        complaint: 'Головная боль, слабость, повышенная температура',
        date: tomorrow,
        time: '07:00',
        filePath: '/uploads/mrt_head.pdf',
        status: 'CONFIRMED',
        price: primaryTherapistProc.price,
      },
      {
        doctorId: therapist.id,
        procedureId: secondaryTherapistProc.id,
        patientName: 'Петров Тимур',
        patientPhone: '+77789876543',
        complaint: 'Высокое давление в течение недели, головокружение',
        date: tomorrow,
        time: '07:30',
        filePath: null,
        status: 'CONFIRMED',
        price: secondaryTherapistProc.price,
      },
      {
        doctorId: neurologist.id,
        procedureId: primaryNeurologistProc.id,
        patientName: 'Смирнов Дмитрий',
        patientPhone: '+77051112233',
        complaint: 'Боли в спине, остеохондроз',
        date: tomorrow,
        time: '08:00',
        filePath: '/uploads/uzi_back.jpg',
        status: 'PENDING',
        price: primaryNeurologistProc.price,
      },
      {
        doctorId: procedureRoom.id,
        procedureId: dripProc.id,
        patientName: 'Ахметова Мадина',
        patientPhone: '+77479998877',
        complaint: 'Капельница по назначению врача',
        date: tomorrow,
        time: '07:00',
        filePath: null,
        status: 'CONFIRMED',
        price: dripProc.price,
      },
    ],
  });

  console.log('Appointments seeded.');

  // ── Settings ──
  await prisma.setting.createMany({
    data: [
      { key: 'clinic_name', value: 'Алихан' },
      { key: 'clinic_phone', value: '+77273217788' },
      { key: 'clinic_whatsapp', value: '+77019998877' },
      { key: 'clinic_address', value: 'г. Алматы, пр. Аль-Фараби, 140А' },
    ],
  });

  console.log('Settings seeded.');
  console.log('\nSeed completed successfully!');

  console.log('\n--- Login Credentials ---');
  console.log('Admins:');
  console.log('  Администратор (+77471852674) → ClinicAdmin2025!');
  console.log('  Руководитель  (+77776707356) → ClinicDirector2025!');
  console.log('Doctors:');
  console.log('  Иванова Алия Сериковна (+77011112233) → Doctor1111!');
  console.log('  Петров Тимур Владимирович (+77022223344) → Doctor2222!');
  console.log('  Алиханов Алихан Бауыржанович (+77033334455) → Doctor3333!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });