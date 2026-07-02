import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Generate slots based on start time, end time, and duration
function generateSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let cur = sh * 60 + sm;
  const finish = eh * 60 + em;
  while (cur + duration <= finish) {
    slots.push(`${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`);
    cur += duration;
  }
  return slots;
}

// Check if a date is a weekend for a doctor
function isWeekend(dateStr: string, weekendsStr: string): boolean {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 is Sunday, 6 is Saturday
  const weekends = weekendsStr.split(',').map(s => s.trim()).filter(Boolean).map(Number);
  return weekends.includes(day);
}

// List of realistic patients (mix of Kazakh and Russian names)
const patients = [
  { name: 'Алихан Маратов', phone: '+77011234567' },
  { name: 'Мадина Ахметова', phone: '+77771234567' },
  { name: 'Дмитрий Смирнов', phone: '+77051112233' },
  { name: 'Аружан Нурланова', phone: '+77479998877' },
  { name: 'Александр Петров', phone: '+77028887766' },
  { name: 'Елена Иванова', phone: '+77073334455' },
  { name: 'Бауыржан Сабитов', phone: '+77085554433' },
  { name: 'Айдана Ибрагимова', phone: '+77756667788' },
  { name: 'Сергей Козлов', phone: '+77001119988' },
  { name: 'Ольга Кузнецова', phone: '+77012228899' },
  { name: 'Арман Каримов', phone: '+77719992211' },
  { name: 'Диана Салихова', phone: '+77053331122' },
  { name: 'Игорь Сидоров', phone: '+77475556677' },
  { name: 'Асель Успанова', phone: '+77076662288' },
  { name: 'Нуртас Жолдасов', phone: '+77764445566' },
  { name: 'Татьяна Морозова', phone: '+77029991122' },
  { name: 'Амир Султанов', phone: '+77783334455' },
  { name: 'Камила Калиева', phone: '+77052223311' },
  { name: 'Михаил Федоров', phone: '+77014445566' },
  { name: 'Анна Павлова', phone: '+77775551122' },
  { name: 'Ерлан Толегенов', phone: '+77787771122' },
  { name: 'Амина Оспанова', phone: '+77071112244' },
  { name: 'Тимур Сулейменов', phone: '+77025556677' },
  { name: 'Сауле Бекбаева', phone: '+77013334455' },
  { name: 'Данияр Сатпаев', phone: '+77751119900' },
  { name: 'Юлия Васильева', phone: '+77472223344' },
  { name: 'Санжар Жаксылыков', phone: '+77089998877' },
  { name: 'Екатерина Соколова', phone: '+77015557788' },
  { name: 'Руслан Ахметов', phone: '+77773335566' },
  { name: 'Алина Цой', phone: '+77054442211' }
];

const complaintsMap: Record<string, string[]> = {
  'Терапевт': [
    'Головная боль, повышенная температура до 38.5, слабость',
    'Сильный кашель, першение в горле, насморк',
    'Быстрая утомляемость, плохой аппетит в последнее время',
    'Профилактический осмотр, консультация терапевта',
    'Давление поднимается до 140/90, периодические головные боли',
    'Боль в суставах при изменении погоды, дискомфорт в коленях',
    'Изжога после еды, тяжесть в желудке, тошнота',
    'Консультация по результатам анализов крови и мочи'
  ],
  'Невропатолог': [
    'Острые боли в пояснице, тяжело нагибаться и долго сидеть',
    'Частые мигрени, головокружения при резком подъеме',
    'Онемение пальцев на правой руке, дискомфорт в шейном отделе',
    'Бессонница, повышенная тревожность, панические атаки',
    'Тянущая боль в ноге вдоль седалищного нерва',
    'Шум в ушах, тяжесть в затылочной области головы',
    'Реабилитация и осмотр после перенесенного сотрясения мозга',
    'Дрожь в руках при волнении, мышечные спазмы в шее'
  ],
  'Процедурный кабинет': [
    'Капельница по назначению лечащего врача',
    'Курс внутримышечных инъекций препарата',
    'Внутривенная инъекция по назначению кардиолога',
    'Сдача крови из вены на биохимический анализ',
    'Сдача крови из пальца на общий анализ и сахар',
    'Перевязка послеоперационного шва, контроль заживления',
    'Снятие швов и обработка антисептиком',
    'Сделать ЭКГ с расшифровкой перед плановой операцией',
    'Промывание и обработка раны'
  ]
};

function getComplaint(specialization: string, procedureName: string): string {
  if (procedureName.includes('терапевта')) {
    const list = complaintsMap['Терапевт'];
    return list[Math.floor(Math.random() * list.length)];
  }
  if (procedureName.includes('невропатолога')) {
    const list = complaintsMap['Невропатолог'];
    return list[Math.floor(Math.random() * list.length)];
  }
  if (procedureName.includes('Капельница')) {
    return 'Капельница по назначению лечащего врача (физраствор + витамины)';
  }
  if (procedureName.includes('Внутримышечная')) {
    return 'Курс внутримышечных инъекций препарата';
  }
  if (procedureName.includes('Внутривенная')) {
    return 'Внутривенная инъекция по назначению';
  }
  if (procedureName.includes('из вены')) {
    return 'Сдача крови из вены на биохимический анализ и гормоны';
  }
  if (procedureName.includes('из пальца')) {
    return 'Сдача крови из пальца на общий анализ и сахар';
  }
  if (procedureName.includes('Перевязка')) {
    return 'Перевязка послеоперационного шва, контроль заживления';
  }
  if (procedureName.includes('ЭКГ')) {
    return 'Сделать ЭКГ с расшифровкой перед плановой операцией';
  }
  if (procedureName.includes('Обработка раны')) {
    return 'Промывание и антисептическая обработка резаной раны';
  }
  const list = complaintsMap[specialization] || ['Консультация специалиста'];
  return list[Math.floor(Math.random() * list.length)];
}

async function main() {
  console.log('Seeding database with a realistic clinic workload...');

  // ── Clean existing data (order matters due to foreign keys) ──
  if (prisma.whatsAppLog !== undefined) {
    await prisma.whatsAppLog.deleteMany({});
  }
  if (prisma.otpCode !== undefined) {
    await prisma.otpCode.deleteMany({});
  }
  if (prisma.review !== undefined) {
    await prisma.review.deleteMany({});
  }
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
  const proceduresData = [
    // Therapist
    { doctorId: therapist.id, name: 'Прием терапевта (первичный)', duration: 30, price: 5000 },
    { doctorId: therapist.id, name: 'Прием терапевта (повторный)', duration: 30, price: 4000 },
    // Neurologist
    { doctorId: neurologist.id, name: 'Прием невропатолога (первичный)', duration: 30, price: 7000 },
    { doctorId: neurologist.id, name: 'Прием невропатолога (повторный)', duration: 20, price: 5000 },
    // Procedure Room
    { doctorId: procedureRoom.id, name: 'Капельница (стандартная)', duration: 60, price: 4000 },
    { doctorId: procedureRoom.id, name: 'Внутримышечная инъекция', duration: 10, price: 1500 },
    { doctorId: procedureRoom.id, name: 'Внутривенная инъекция', duration: 15, price: 2000 },
    { doctorId: procedureRoom.id, name: 'Забор крови из вены', duration: 10, price: 1500 },
    { doctorId: procedureRoom.id, name: 'Забор крови из пальца', duration: 5, price: 800 },
    { doctorId: procedureRoom.id, name: 'Перевязка (простая)', duration: 15, price: 2500 },
    { doctorId: procedureRoom.id, name: 'Перевязка (сложная)', duration: 25, price: 4000 },
    { doctorId: procedureRoom.id, name: 'ЭКГ с расшифровкой', duration: 20, price: 5000 },
    { doctorId: procedureRoom.id, name: 'Обработка раны', duration: 20, price: 3000 },
  ];

  const proceduresList: any[] = [];
  for (const proc of proceduresData) {
    const created = await prisma.procedure.create({ data: proc });
    proceduresList.push(created);
  }

  console.log('Procedures seeded.');

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

  // ── Workload Generation ──
  console.log('Generating dynamic workload...');
  const dates: string[] = [];
  const today = new Date();
  const todayStr = formatDate(today);
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // Let's generate from 30 days in the past to 14 days in the future
  for (let i = -30; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(formatDate(d));
  }

  const appointmentsToCreate: any[] = [];
  const whatsAppLogsToCreate: any[] = [];

  const mockFiles = [
    '/uploads/mrt_spine.pdf',
    '/uploads/blood_test_results.pdf',
    '/uploads/uzi_abdomen.jpg',
    '/uploads/xray_chest.png',
  ];

  for (const dateStr of dates) {
    const isPast = dateStr < todayStr;
    const isToday = dateStr === todayStr;

    for (const doc of [therapist, neurologist, procedureRoom]) {
      if (isWeekend(dateStr, doc.weekends)) {
        continue; // Weekend day, doctor does not work
      }

      const allSlots = generateSlots(doc.workStartTime, doc.workEndTime, doc.slotDuration);
      
      // Determine slot occupancy rate
      let occupancyRate = 0.7; // default
      if (isPast) {
        occupancyRate = 0.75;
      } else if (isToday) {
        occupancyRate = 0.70;
      } else {
        occupancyRate = 0.45;
      }

      // Shuffle slots to fill them randomly
      const shuffledSlots = [...allSlots].sort(() => Math.random() - 0.5);
      const slotsToFillCount = Math.min(Math.floor(allSlots.length * occupancyRate) + (Math.random() > 0.5 ? 1 : 0), allSlots.length);
      const slotsToFill = shuffledSlots.slice(0, slotsToFillCount);
      slotsToFill.sort(); // Sort sequentially for visual consistency

      for (const slotTime of slotsToFill) {
        // Pick random patient
        const patient = patients[Math.floor(Math.random() * patients.length)];

        // Get procedures for this doctor
        const docProcs = proceduresList.filter(p => p.doctorId === doc.id);
        if (docProcs.length === 0) continue;
        const procedure = docProcs[Math.floor(Math.random() * docProcs.length)];

        // Get complaint
        const complaint = getComplaint(doc.specialization, procedure.name);

        // Determine status
        let status = 'PENDING';
        if (isPast) {
          status = Math.random() < 0.9 ? 'COMPLETED' : 'CANCELLED';
        } else if (isToday) {
          const [sh, sm] = slotTime.split(':').map(Number);
          const slotTimeInMinutes = sh * 60 + sm;
          const isPastSlot = slotTimeInMinutes < currentTimeInMinutes;
          if (isPastSlot) {
            status = Math.random() < 0.9 ? 'COMPLETED' : 'CANCELLED';
          } else {
            const rand = Math.random();
            if (rand < 0.6) status = 'CONFIRMED';
            else if (rand < 0.9) status = 'PENDING';
            else status = 'CANCELLED';
          }
        } else {
          // Future
          const rand = Math.random();
          if (rand < 0.6) status = 'CONFIRMED';
          else if (rand < 0.95) status = 'PENDING';
          else status = 'CANCELLED';
        }

        // File path (some percentage of appointments get files attached)
        let filePath = null;
        const fileChance = doc.specialization === 'Процедурный кабинет' ? 0.05 : 0.15;
        if (Math.random() < fileChance) {
          filePath = mockFiles[Math.floor(Math.random() * mockFiles.length)];
        }

        // Calculate a realistic createdAt timestamp (1 to 5 days before the appointment)
        const apptDate = new Date(dateStr);
        const daysAgoCreated = Math.floor(Math.random() * 5) + 1; // 1 to 5 days ago
        const createdDate = new Date(apptDate);
        createdDate.setDate(apptDate.getDate() - daysAgoCreated);
        // Make sure it is not in the future relative to execution time
        if (createdDate > now) {
          createdDate.setTime(now.getTime() - Math.floor(Math.random() * 60 * 60 * 1000));
        }

        appointmentsToCreate.push({
          doctorId: doc.id,
          procedureId: procedure.id,
          patientName: patient.name,
          patientPhone: patient.phone,
          complaint,
          date: dateStr,
          time: slotTime,
          filePath,
          status,
          price: procedure.price,
          createdAt: createdDate,
        });
      }
    }

    // Daily Doctor schedule log (cron-like message generated daily at 7:00 AM)
    if (isPast) {
      const scheduleDate = new Date(dateStr);
      scheduleDate.setHours(7, 0, 0, 0);

      for (const doc of [therapist, neurologist, procedureRoom]) {
        // filter appointments for this doc on this date
        const docAppts = appointmentsToCreate.filter(
          a => a.doctorId === doc.id && a.date === dateStr && (a.status === 'CONFIRMED' || a.status === 'COMPLETED')
        );
        if (docAppts.length === 0) continue;

        const lines = docAppts.map(a => {
          const procName = proceduresList.find(p => p.id === a.procedureId)?.name || 'Консультация';
          const fileSym = a.filePath ? ' 📎' : '';
          return `${a.time} — ${a.patientName} (${a.patientPhone}) · ${procName}${fileSym}`;
        });

        const message = [
          `📅 Расписание на сегодня (${dateStr})`,
          ``,
          ...lines,
          ``,
          `Всего записей: ${docAppts.length}`,
        ].join('\n');

        whatsAppLogsToCreate.push({
          recipientPhone: doc.phone,
          recipientName: doc.name,
          message,
          status: 'SENT',
          sentAt: scheduleDate
        });
      }
    }
  }

  // Create all appointments in database sequentially to preserve relations
  console.log(`Inserting ${appointmentsToCreate.length} appointments...`);
  // Insert in batches of 50 for database health and performance
  const batchSize = 50;
  for (let i = 0; i < appointmentsToCreate.length; i += batchSize) {
    const batch = appointmentsToCreate.slice(i, i + batchSize);
    await Promise.all(
      batch.map(appt => prisma.appointment.create({ data: appt }))
    );
  }
  console.log('Appointments successfully created.');

  // Fetch created appointments so we can build realistic logs referencing actual database states
  const dbAppointments = await prisma.appointment.findMany({
    include: { doctor: true, procedure: true }
  });

  // Generate simulated patient notifications for about 150 random bookings
  console.log('Simulating WhatsApp log entries...');
  const apptsForLogs = [...dbAppointments].sort(() => Math.random() - 0.5).slice(0, 150);
  for (const appt of apptsForLogs) {
    const detailsStr = appt.procedure
      ? ` на процедуру "${appt.procedure.name}"`
      : ` (${appt.doctor.specialization})`;

    // 1. Initial Booking confirmation
    whatsAppLogsToCreate.push({
      recipientPhone: appt.patientPhone,
      recipientName: appt.patientName,
      message: `Здравствуйте, ${appt.patientName}! Вы записаны к врачу ${appt.doctor.name}${detailsStr} на ${appt.date} в ${appt.time}. Клиника "Алихан".`,
      status: 'SIMULATED',
      sentAt: appt.createdAt,
    });

    // 2. Status change notifications if completed or cancelled
    if ((appt.status === 'COMPLETED' || appt.status === 'CANCELLED') && appt.createdAt < now) {
      const updateTime = new Date(appt.createdAt);
      let logMsg = '';
      if (appt.status === 'COMPLETED') {
        logMsg = `Прием у врача ${appt.doctor.name} успешно завершен. Благодарим за визит!`;
        // Occurred 1 hour after slot start time
        const apptDate = new Date(`${appt.date}T${appt.time}:00`);
        updateTime.setTime(apptDate.getTime() + 60 * 60 * 1000);
      } else {
        logMsg = `Ваша запись на ${appt.date} в ${appt.time} к врачу ${appt.doctor.name} отменена клиникой.`;
        // Occurred 30 mins after booking
        updateTime.setTime(appt.createdAt.getTime() + 30 * 60 * 1000);
      }

      if (updateTime < now) {
        whatsAppLogsToCreate.push({
          recipientPhone: appt.patientPhone,
          recipientName: appt.patientName,
          message: logMsg,
          status: 'SIMULATED',
          sentAt: updateTime,
        });
      }
    }
  }

  // Insert all simulated logs
  console.log(`Inserting ${whatsAppLogsToCreate.length} WhatsApp log entries...`);
  for (let i = 0; i < whatsAppLogsToCreate.length; i += batchSize) {
    const batch = whatsAppLogsToCreate.slice(i, i + batchSize);
    await Promise.all(
      batch.map(log => prisma.whatsAppLog.create({ data: log }))
    );
  }

  console.log('WhatsApp logs successfully created.');

  // ── Reviews ──
  console.log('Seeding reviews...');
  const reviewsData = [
    {
      name: 'Алина Цой',
      phone: '+77054442211',
      rating: 5.0,
      reviewText: 'Очень приятная клиника! Доктор Иванова Алия Сериковна профессионал своего дела. Тщательно осмотрела, назначила лечение, которое помогло уже на второй день. Рекомендую!',
      avatar: '/avatar-default.svg',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      name: 'Мадина Ахметова',
      phone: '+77771234567',
      rating: 5.0,
      reviewText: 'Была на приеме у невропатолога Петрова Тимура. Мучали постоянные боли в шее. После первого же сеанса и назначенной терапии чувствую себя намного лучше. Спасибо!',
      avatar: '/avatar-default.svg',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
    {
      name: 'Дмитрий Смирнов',
      phone: '+77051112233',
      rating: 5.0,
      reviewText: 'Все отлично, вежливый персонал на ресепшене. В процедурном кабинете Алихан очень аккуратно берет кровь, даже не почувствовал.',
      avatar: '/avatar-default.svg',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      name: 'Аружан Нурланова',
      phone: '+77479998877',
      rating: 4.5,
      reviewText: 'Чистая и современная клиника, цены адекватные. Прием терапевта прошел вовремя, без задержек.',
      avatar: '/avatar-default.svg',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      name: 'Александр Петров',
      phone: '+77028887766',
      rating: 4.0,
      reviewText: 'Хороший сервис, но записаться на вечернее время бывает сложно, так как много пациентов. В остальном все супер!',
      avatar: '/avatar-default.svg',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
    {
      name: 'Елена Иванова',
      phone: '+77073334455',
      rating: 5.0,
      reviewText: 'Тимур Владимирович Петров — прекрасный специалист. Объясняет все простым языком, без лишних медицинских терминов.',
      avatar: '/avatar-default.svg',
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    },
    {
      name: 'Бауыржан Сабитов',
      phone: '+77085554433',
      rating: 5.0,
      reviewText: 'Ставила капельницы в процедурном кабинете. Медбрат Алихан — мастер своего дела, очень заботливый и внимательный.',
      avatar: '/avatar-default.svg',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
    {
      name: 'Айдана Ибрагимова',
      phone: '+77756667788',
      rating: 5.0,
      reviewText: 'Делала ЭКГ с расшифровкой. Результаты выдали быстро, терапевт сразу проконсультировал по ним.',
      avatar: '/avatar-default.svg',
      date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
    },
    {
      name: 'Сергей Козлов',
      phone: '+77001119988',
      rating: 4.8,
      reviewText: 'Проходил курс лечения у невропатолога. Отличный индивидуальный подход. Рекомендую клинику Алихан.',
      avatar: '/avatar-default.svg',
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    },
    {
      name: 'Ольга Кузнецова',
      phone: '+77012228899',
      rating: 5.0,
      reviewText: 'В клинике очень чисто и уютно. Весь персонал вежливый, соблюдаются все санитарные нормы. Оценка отлично.',
      avatar: '/avatar-default.svg',
      date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), // 22 days ago
    },
    {
      name: 'Арман Каримов',
      phone: '+77719992211',
      rating: 5.0,
      reviewText: 'Доктор Иванова помогла скорректировать лечение давления. До этого пил таблетки, которые не помогали. Сейчас все пришло в норму.',
      avatar: '/avatar-default.svg',
      date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    },
    {
      name: 'Диана Салихова',
      phone: '+77053331122',
      rating: 5.0,
      reviewText: 'Процедурный кабинет работает очень быстро и профессионально. Никаких синяков после забора крови из вены.',
      avatar: '/avatar-default.svg',
      date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
    }
  ];

  await prisma.review.createMany({
    data: reviewsData,
  });

  console.log('Reviews successfully created.');
  console.log('\nSeed completed successfully!');
  console.log(`\nStatistics generated:`);
  console.log(`- Created ${appointmentsToCreate.length} appointments across 45 days`);
  console.log(`- Simulated ${whatsAppLogsToCreate.length} WhatsApp logs (daily schedules, patient bookings, status updates)`);
  console.log(`- Created ${reviewsData.length} patient reviews`);

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