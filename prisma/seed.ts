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
  await prisma.appointment.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.whatsAppLog.deleteMany({});
  await prisma.setting.deleteMany({});

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
  console.log('  admin@alihan-clinic.kz     → ClinicAdmin2025!');
  console.log('  director@alihan-clinic.kz  → ClinicDirector2025!');

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
    },
  });

  console.log('Doctors seeded.');
  console.log('  aliia@alihan-clinic.kz      → Doctor1111!');
  console.log('  timur@alihan-clinic.kz      → Doctor2222!');
  console.log('  procedure@alihan-clinic.kz  → Doctor3333!');

  // ── Appointments ──
  const tomorrow = '2026-06-03';

  await prisma.appointment.createMany({
    data: [
      {
        doctorId: therapist.id,
        patientName: 'Иванова Алия',
        patientPhone: '+77771234567',
        complaint: 'Головная боль, слабость, повышенная температура',
        date: tomorrow,
        time: '07:00',
        filePath: '/uploads/mrt_head.pdf',
        status: 'CONFIRMED',
      },
      {
        doctorId: therapist.id,
        patientName: 'Петров Тимур',
        patientPhone: '+77789876543',
        complaint: 'Высокое давление в течение недели, головокружение',
        date: tomorrow,
        time: '07:30',
        filePath: null,
        status: 'CONFIRMED',
      },
      {
        doctorId: neurologist.id,
        patientName: 'Смирнов Дмитрий',
        patientPhone: '+77051112233',
        complaint: 'Боли в спине, остеохондроз',
        date: tomorrow,
        time: '08:00',
        filePath: '/uploads/uzi_back.jpg',
        status: 'PENDING',
      },
      {
        doctorId: procedureRoom.id,
        patientName: 'Ахметова Мадина',
        patientPhone: '+77479998877',
        complaint: 'Капельница по назначению врача',
        date: tomorrow,
        time: '07:00',
        filePath: null,
        status: 'CONFIRMED',
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });