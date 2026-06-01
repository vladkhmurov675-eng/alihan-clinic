import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.appointment.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.whatsAppLog.deleteMany({});
  await prisma.setting.deleteMany({});

  // Seed Doctors
  const therapist = await prisma.doctor.create({
    data: {
      name: 'Иванова Алия Сериковна',
      specialization: 'Терапевт',
      phone: '+77011112233',
      avatar: '/images/doctor-aliia.png',
      slotDuration: 30, // 30 minutes
      workStartTime: '07:00',
      workEndTime: '11:00',
      weekends: '6,0', // Saturday, Sunday
      disabledDates: '',
      pin: '1111',
    },
  });

  const neurologist = await prisma.doctor.create({
    data: {
      name: 'Петров Тимур Владимирович',
      specialization: 'Невропатолог',
      phone: '+77022223344',
      avatar: '/images/doctor-timur.png',
      slotDuration: 20, // 20 minutes
      workStartTime: '08:00',
      workEndTime: '12:00',
      weekends: '6,0', // Saturday, Sunday
      disabledDates: '',
      pin: '2222',
    },
  });

  const procedureRoom = await prisma.doctor.create({
    data: {
      name: 'Алиханов Алихан Бауыржанович',
      specialization: 'Процедурный кабинет',
      phone: '+77033334455',
      avatar: '/images/doctor-alihan.png',
      slotDuration: 30,
      workStartTime: '07:00',
      workEndTime: '11:00',
      weekends: '0', // Sunday only
      disabledDates: '',
      pin: '3333',
    },
  });

  console.log('Doctors seeded successfully.');

  // Create initial appointments for tomorrow: 2026-06-02
  const tomorrow = '2026-06-02';
  
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
      }
    ]
  });

  // Seed default settings
  await prisma.setting.create({
    data: {
      key: 'clinic_name',
      value: 'Алихан',
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
