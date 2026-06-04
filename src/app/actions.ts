'use server';
import bcrypt from 'bcrypt';
import { prisma } from '../db';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

// ─────────────────────────────────────────
// SESSION HELPERS
// ─────────────────────────────────────────

export async function getSessionDoctorId(): Promise<number | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie) return null;
  try {
    const data = JSON.parse(sessionCookie.value);
    if (data.role === 'doctor') return data.doctorId || null;
    return null;
  } catch {
    return null;
  }
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie) return false;
  try {
    const data = JSON.parse(sessionCookie.value);
    return data.role === 'admin' || data.role === 'director';
  } catch {
    return false;
  }
}

export async function getSessionRole(): Promise<'doctor' | 'admin' | 'director' | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie) return null;
  try {
    const data = JSON.parse(sessionCookie.value);
    return data.role || null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────
// UNIFIED LOGIN — checks doctors then admins in DB
// ─────────────────────────────────────────

export async function login(
  phone: string,
  password: string
): Promise<{ success: boolean; role?: 'doctor' | 'admin' | 'director'; error?: string }> {

  // 1. Check doctors table
  const doctor = await prisma.doctor.findUnique({ where: { phone } });

  if (doctor) {
    const valid = await bcrypt.compare(password, doctor.password);
    if (!valid) return { success: false, error: 'Неверный логин или пароль' };

    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify({ role: 'doctor', doctorId: doctor.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return { success: true, role: 'doctor' };
  }

  // 2. Check admins table
  const admin = await prisma.admin.findUnique({ where: { phone } });

  if (admin && admin.isActive) {
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return { success: false, error: 'Неверный логин или пароль' };

    const role = admin.role === 'DIRECTOR' ? 'director' : 'admin';

    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify({ role, adminId: admin.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return { success: true, role };
  }

  return { success: false, error: 'Неверный логин или пароль' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return { success: true };
}

// Keep legacy exports so existing components don't break
export async function loginDoctor(phone: string, password: string) {
  return login(phone, password);
}

export async function loginAdmin(phone: string, password: string) {
  return login(phone, password);
}

export async function logoutDoctor() { return logout(); }
export async function logoutAdmin() { return logout(); }

// ─────────────────────────────────────────
// DOCTORS
// ─────────────────────────────────────────

export async function getCurrentDoctor() {
  const doctorId = await getSessionDoctorId();
  if (!doctorId) return null;
  return prisma.doctor.findUnique({ where: { id: doctorId } });
}

export async function getDoctors() {
  return prisma.doctor.findMany({ orderBy: { name: 'asc' } });
}

export async function getDoctorById(id: number) {
  return prisma.doctor.findUnique({ where: { id } });
}

export async function createDoctor(data: {
  name: string; phone: string; specialization: string;
  slotDuration: number; workStartTime: string; workEndTime: string;
  weekends: string; disabledDates: string; password: string;
  education: string;
  experienceYears: number;
  description: string;
}) {
  if (!(await isAdminLoggedIn())) throw new Error('Access denied');
  const hashed = await bcrypt.hash(data.password, 10);
  const newDoc = await prisma.doctor.create({
    data: { ...data, password: hashed, avatar: '/images/default-doctor.png' },
  });
  return { success: true, doctor: newDoc };
}

export async function updateDoctorByAdmin(id: number, data: any) {
  if (!(await isAdminLoggedIn())) throw new Error('Access denied');
  // Hash password if it's being updated and isn't already hashed
  if (data.password && !data.password.startsWith('$2')) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  const updated = await prisma.doctor.update({ where: { id }, data });
  return { success: true, doctor: updated };
}

export async function deleteDoctor(id: number) {
  if (!(await isAdminLoggedIn())) throw new Error('Access denied');
  await prisma.doctor.delete({ where: { id } });
  return { success: true };
}

export async function updateDoctorSettings(data: {
  name: string; phone: string; specialization: string;
  slotDuration: number; workStartTime: string; workEndTime: string;
  weekends: string; disabledDates: string; password: string;
  education: string;
  experienceYears: number;
  description: string;
}) {
  const doctorId = await getSessionDoctorId();
  if (!doctorId) throw new Error('Unauthorized');
  // Only hash if new password provided and not already hashed
  const password = data.password && !data.password.startsWith('$2')
    ? await bcrypt.hash(data.password, 10)
    : data.password;
  const updated = await prisma.doctor.update({
    where: { id: doctorId },
    data: { ...data, password },
  });
  return { success: true, doctor: updated };
}

// ─────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  settings.forEach(s => { map[s.key] = s.value; });
  return map;
}

export async function saveSettings(settings: Record<string, string>) {
  if (!(await isAdminLoggedIn())) throw new Error('Access denied');
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  return { success: true };
}

// ─────────────────────────────────────────
// APPOINTMENTS
// ─────────────────────────────────────────

export async function getOccupiedSlots(doctorId: number, date: string): Promise<string[]> {
  const appointments = await prisma.appointment.findMany({
    where: { doctorId, date, status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] } },
    select: { time: true },
  });
  return appointments.map(a => a.time);
}

export async function bookAppointment(
  formData: FormData
): Promise<{ success: boolean; appointment?: any; error?: string }> {
  try {
    const doctorIdStr = formData.get('doctorId') as string;
    const patientName = formData.get('patientName') as string;
    const patientPhone = formData.get('patientPhone') as string;
    const complaint = formData.get('complaint') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const file = formData.get('file') as File | null;
    const phoneRegex = /^\+7\d{10}$/;

    if (!doctorIdStr || !patientName || !patientPhone || !date || !time) {
      return { success: false, error: 'Заполните все обязательные поля' };
    }

    if (!phoneRegex.test(patientPhone)) {
      return { success: false, error: 'Введите номер в формате +77012345678' };
    }

    const doctorId = parseInt(doctorIdStr);
    const occupied = await getOccupiedSlots(doctorId, date);
    if (occupied.includes(time)) {
      return { success: false, error: 'Это время уже занято, выберите другое' };
    }

    let filePath: string | null = null;
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      filePath = `/uploads/${filename}`;
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId, patientName, patientPhone,
        complaint: complaint || 'Жалобы отсутствуют',
        date, time, filePath, status: 'PENDING',
      },
      include: { doctor: true },
    });

    const clinicSetting = await prisma.setting.findUnique({ where: { key: 'clinic_name' } });
    const clinicName = clinicSetting?.value || 'Алихан';

    await prisma.whatsAppLog.create({
      data: {
        recipientPhone: patientPhone,
        recipientName: patientName,
        message: `Здравствуйте, ${patientName}! Вы записаны к врачу ${appointment.doctor.name} (${appointment.doctor.specialization}) на ${date} в ${time}. Клиника "${clinicName}".`,
        status: 'SIMULATED',
      },
    });

    return { success: true, appointment };
  } catch (error: any) {
    console.error('Booking error:', error);
    return { success: false, error: 'Произошла ошибка при бронировании' };
  }
}
export async function getDoctorAppointments(date?: string) {
  const doctorId = await getSessionDoctorId();

  if (!doctorId) {
    throw new Error('Unauthorized');
  }

  return prisma.appointment.findMany({
    where: {
      doctorId,
      ...(date ? { date } : {}),
    },
    orderBy: [
      { date: 'desc' },
      { time: 'asc' },
    ],
  });
}

export async function updateAppointmentStatus(appointmentId: number, status: string) {
  const doctorId = await getSessionDoctorId();
  const admin = await isAdminLoggedIn();
  if (!doctorId && !admin) throw new Error('Unauthorized');

  if (doctorId && !admin) {
    const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appt || appt.doctorId !== doctorId) throw new Error('Unauthorized access to appointment');
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    include: { doctor: true },
  });

  let notificationMessage = '';
  if (status === 'CONFIRMED') notificationMessage = `Ваша запись на ${updated.date} в ${updated.time} к врачу ${updated.doctor.name} подтверждена.`;
  else if (status === 'CANCELLED') notificationMessage = `Ваша запись на ${updated.date} в ${updated.time} к врачу ${updated.doctor.name} отменена клиникой.`;
  else if (status === 'COMPLETED') notificationMessage = `Прием у врача ${updated.doctor.name} успешно завершен. Благодарим за визит!`;

  if (notificationMessage) {
    await prisma.whatsAppLog.create({
      data: {
        recipientPhone: updated.patientPhone,
        recipientName: updated.patientName,
        message: notificationMessage,
        status: 'SIMULATED',
      },
    });
  }

  return { success: true, appointment: updated };
}

// ─────────────────────────────────────────
// WHATSAPP LOGS
// ─────────────────────────────────────────

export async function getWhatsAppLogs() {
  const doctorId = await getSessionDoctorId();
  const admin = await isAdminLoggedIn();
  if (!doctorId && !admin) throw new Error('Unauthorized');
  return prisma.whatsAppLog.findMany({ orderBy: { sentAt: 'desc' }, take: 100 });
}
