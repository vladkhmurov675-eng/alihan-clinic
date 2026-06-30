'use server'
import 'server-only';
import bcrypt from 'bcrypt';
import { prisma } from '../db';
import { cookies } from 'next/headers';
import { sendWhatsAppMessage } from '@/app/lib/whatsapp';
import { uploadFile } from '@/app/lib/r2';
import * as crypto from 'crypto';
import {Appointment, Procedure, Doctor} from './components/types';
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


export async function changePassword(phone: string, password: string) {
    if (await hasFoundPhoneNumber(phone)){
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.admin.update({where: {phone: phone}, 
    data: {password: hashedPassword}}) 
    }
    else {
      throw new Error(
        "Ошибка! Пароль не смог быть изменен, так как не был найден номер телефона в базе данных, или было найдено несколько админов с одним и тем же номером телефона",
      );
    }
}

export async function hasFoundPhoneNumber(phone:string){
  return (await prisma.admin.findUnique({where: {phone: phone}}) !== null); 
  
}

// ─────────────────────────────────────────
// OTP
// ─────────────────────────────────────────
const OTP_LENGTH = 4;
const OTP_TTL_MS = 90 * 1000;           // 90 seconds
const RESEND_COOLDOWN_MS = 30 * 1000;   // can't request a new code more than once every 30s
const MAX_ATTEMPTS = 5;                 // wrong guesses allowed before the code is locked
 
export async function generateOTP(
  phone: string
): Promise<{ success: boolean; error?: string; cooldownMs?: number }> {
 
  // Prevent spamming — check for a recent, still-valid code for this phone
  const recent = await prisma.otpCode.findFirst({
    where: { phone, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
 
  if (recent) {
    const age = Date.now() - recent.createdAt.getTime();
    if (age < RESEND_COOLDOWN_MS) {
      return {
        success: false,
        error: 'Код уже отправлен. Подождите перед повторной отправкой.',
        cooldownMs: RESEND_COOLDOWN_MS - age,
      };
    }
  }
 
  // Invalidate any previous unused codes for this phone so only the
  // newest one is ever valid — fixes the "two valid codes at once" bug
  await prisma.otpCode.updateMany({
    where: { phone, used: false },
    data: { used: true },
  });
 
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + OTP_TTL_MS);
 
  let code = '';
  while (code.length < OTP_LENGTH) {
    code += crypto.randomInt(0, 10).toString();
  }
 
  const hashed = await bcrypt.hash(code, 10);
 
  await prisma.otpCode.create({
    data: { phone, code: hashed, createdAt, expiresAt, used: false, attempts: 0 },
  });
 
  await sendOTP(phone, code);
 
  return { success: true };
}
 
export async function getOTP(phone: string) {
  return prisma.otpCode.findFirst({
    where: { phone, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' }, // always the newest valid code
  });
}
 
export async function verifyOTP(
  phone: string,
  input: string
): Promise<{ success: boolean; error?: string }> {
 
  const otp = await getOTP(phone);
 
  if (!otp) {
    return { success: false, error: 'Код не найден или истёк. Запросите новый.' };
  }
 
  if (otp.attempts >= MAX_ATTEMPTS) {
    // Lock it out permanently so it can't keep being guessed against
    await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
    return { success: false, error: 'Превышено количество попыток. Запросите новый код.' };
  }
 
  const matches = await bcrypt.compare(input, otp.code);
 
  if (!matches) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: otp.attempts + 1 },
    });
    const remaining = MAX_ATTEMPTS - (otp.attempts + 1);
    return {
      success: false,
      error: remaining > 0
        ? `Неверный код. Осталось попыток: ${remaining}`
        : 'Превышено количество попыток. Запросите новый код.',
    };
  }
 
  // Correct — mark used immediately so this code can never be replayed
  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
 
  return { success: true };
}
 
export async function sendOTP(phone: string, code: string) {
  await sendWhatsAppMessage(phone, `Здравствуйте! Ваш код подтверждения: ${code}\nКод действителен 90 секунд.`);
}


// ─────────────────────────────────────────
// DOCTORS
// ─────────────────────────────────────────

export async function getCurrentDoctor() {
  const doctorId = await getSessionDoctorId();
  if (!doctorId) return null;
  return prisma.doctor.findUnique({ where: { id: doctorId }, omit: {password: true}});
}

export async function getDoctors() {
  return prisma.doctor.findMany({ orderBy: { name: 'asc' }, omit: {password:  true}});
}

export async function getDoctorById(id: number) {
  return prisma.doctor.findUnique({ where: { id }, omit: {password: true} });
}

export async function createDoctor(data: {
  name: string; phone: string; specialization: string;
  slotDuration: number; workStartTime: string; workEndTime: string;
  weekends: string; disabledDates: string; password: string;
  education?: string | null;
  experienceYears?: number | null;
  description?: string | null;
}) {
  if (!(await isAdminLoggedIn())) throw new Error('Access denied');
  const hashed = await bcrypt.hash(data.password, 10);
  const newDoc = await prisma.doctor.create({
    data: { ...data, password: hashed, avatar: '/images/default-doctor.png' },
  });
  return { success: true, doctor: newDoc };
}

export async function updateDoctorByAdmin(id: number, data: Record<string, any>) {
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

export async function uploadAndSaveAvatar(formData: FormData, doctorId?: number): Promise<string> {
  const sessionDoctorId = await getSessionDoctorId();
  const admin = await isAdminLoggedIn();

  if (!sessionDoctorId && !admin) throw new Error('Unauthorized');

  // Admin updating a specific doctor
  if (doctorId !== undefined) {
    if (!admin) throw new Error('Access denied');
  }

  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const url = await uploadFile(file);

  const targetId = doctorId ?? sessionDoctorId!;
  await prisma.doctor.update({
    where: { id: targetId },
    data: { avatar: url },
  });

  return url;
}

export async function updateDoctorSettings(data: {
  name: string; phone: string; specialization: string;
  slotDuration: number; workStartTime: string; workEndTime: string;
  weekends: string; disabledDates: string; password?: string;
  education?: string | null;
  experienceYears?: number | null;
  description?: string | null;
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
  settings.forEach((s: { key: string; value: string }) => { map[s.key] = s.value; });
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
// PROCEDURES
// ─────────────────────────────────────────
export async function getProcedureById(id: number) {
  return prisma.procedure.findUnique({ where: { id } });
}

export async function getProcedures() {
  return prisma.procedure.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function getProceduresByDoctor(doctorId: number) {
  return prisma.procedure.findMany({
    where: { doctorId },
    orderBy: { name: 'asc' },
  });
}

export async function createProcedure(data: {
  name: string;
  doctorId: number;
  duration: number;
  price: number;
}) {
  if (!(await isAdminLoggedIn())) throw new Error('Access denied');
  const newProcedure = await prisma.procedure.create({
    data,
  });
  return { success: true, procedure: newProcedure };
}

export async function updateProcedure(id: number, data: {
  name: string;
  doctorId: number;
  duration: number;
  price: number;
}) {
  if (!(await isAdminLoggedIn())) throw new Error('Access denied');
  const updated = await prisma.procedure.update({
    where: { id },
    data,
  });
  return { success: true, procedure: updated };
}

export async function deleteProcedure(id: number) {
  if (!(await isAdminLoggedIn())) throw new Error('Access denied');
  await prisma.procedure.delete({ where: { id } });
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
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  try {
    const doctorIdStr = formData.get('doctorId') as string;
    const patientName = formData.get('patientName') as string;
    const patientPhone = formData.get('patientPhone') as string;
    const complaint = formData.get('complaint') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const file = formData.get('file') as File | null;
    const procedureIdStr = formData.get('procedureId') as string;
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
      filePath = await uploadFile(file);
    }

    let procedureId: number | null = null;
    let price = 5000;

    procedureId = parseInt(procedureIdStr);
    const proc = await prisma.procedure.findUnique({ where: { id: procedureId } });
      if (proc) {
        price = proc.price;
      }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId, procedureId, patientName, patientPhone,
        complaint: complaint || 'Жалобы отсутствуют',
        date, time, filePath, status: 'PENDING', price
      },
      include: { doctor: true, procedure: true },
    });

    await sendWhatsAppNotification(appointment)

    const clinicSetting = await prisma.setting.findUnique({ where: { key: 'clinic_name' } });
    const clinicName = clinicSetting?.value || 'Алихан';

    const detailsStr = appointment.procedure
      ? ` на процедуру "${appointment.procedure.name}"`
      : ` (${appointment.doctor.specialization})`;

    await prisma.whatsAppLog.create({
      data: {
        recipientPhone: patientPhone,
        recipientName: patientName,
        message: `Здравствуйте, ${patientName}! Вы записаны к врачу ${appointment.doctor.name}${detailsStr} на ${date} в ${time}. Клиника "${clinicName}".`,
        status: 'SIMULATED',
      },
    });

    return { success: true, appointment };
  } catch (error: unknown) {
    console.error('Booking error:', error);
    return { success: false, error: 'Произошла ошибка при бронировании' };
  }
}

export async function sendWhatsAppNotification(appointment: { patientName: string; patientPhone: string; date: string; time: string; doctor: { name: string } }) {
  const message = `Здравствуйте, ${appointment.patientName}! Вы записаны к врачу ${appointment.doctor.name} на ${appointment.date} в ${appointment.time}. Клиника "Алихан".`;

  await sendWhatsAppMessage(appointment.patientPhone, message);
}

export async function getDoctorAppointments(filters?: {
  status?: string;
  date?: string;
  time?: string;
  from?: string;
  to?: string;
  search?: string;
  sortBy?: "date" | "time" | "status";
  sortDir?: "asc" | "desc";
}) {
  const doctorId = await getSessionDoctorId();

  if (!doctorId) {
    throw new Error('Unauthorized');
  }

  const sortBy = filters?.sortBy ?? "date";
  const sortDir = filters?.sortDir ?? "desc";

   const orderBy =
    sortBy === "status"
      ? { status: sortDir }
      : sortBy === "time"
        ? { time: sortDir }
        : { date: sortDir };


  return prisma.appointment.findMany({
    where: {
      doctorId,
      ...(filters?.status && {status: filters.status}),
      ...(filters?.date && {date: {contains: filters.date}}),
      ...(filters?.from && filters.to && {date: { gte: filters.from, lte: filters.to}}),
      ...(filters?.time && {time: filters.time}),
      ...(filters?.search && {
        OR: [
          { patientName: { contains: filters.search, mode: 'insensitive'}},
          { patientPhone: { contains: filters.search}}
        ]
      })
    },
    include: { doctor: true, procedure: true },
    orderBy
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

export async function getAppointmentsByDoctor(){
  const sessionid = await getSessionDoctorId();
  if (!sessionid) throw new Error('Unauthorized');
  return prisma.appointment.findMany({
    where: { doctorId: sessionid },
    include: { doctor: true, procedure: true },
    orderBy: [{ date: 'desc' }, { time: 'asc' }],
  });
}

export async function getAppointmentsByAdmin(){
  const adminloggedin = await isAdminLoggedIn();
  if (!adminloggedin) throw new Error('Unauthorized');
  return prisma.appointment.findMany({
    include: { doctor: true, procedure: true },
    orderBy: [{ date: 'desc' }, { time: 'asc' }],
    take: 500,
  });
}

export async function updateAppointment(appointmentId: number, data: {
  patientName?: string;
  patientPhone?: string;
  date?: string;
  time?: string;
  status?: string;
  doctorId?: number;
  procedureId?: number;
  complaint?: string;
  price?: number;
  filePath?: string;
}) {
  if (!(await isAdminLoggedIn())) throw new Error('Unauthorized');
  try {
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data,
      include: { doctor: true, procedure: true },
    });
    return { success: true, appointment: updated };
  } catch (error: unknown) {
    console.error('Update appointment error:', error);
    return { success: false, error: 'Произошла ошибка при обновлении записи' };
  }
}

export async function deleteAppointment(appointmentId: number) {
  if (!(await isAdminLoggedIn())) throw new Error('Unauthorized');
  try {
    const deleted = await prisma.appointment.delete({
      where: { id: appointmentId },
    });
    return { success: true, appointment: deleted };
  } catch (error: unknown) {
    console.error('Delete appointment error:', error);
    return { success: false, error: 'Произошла ошибка при удалении записи' };
  }
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

// ─────────────────────────────────────────
// DIRECTOR STATS
// ─────────────────────────────────────────

export async function getDirectorStats(from: string, to: string) {
  if (!(await isAdminLoggedIn())) throw new Error('Access denied');

  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: from, lte: to },
    },
    include: {
      doctor: { select: { id: true, name: true, specialization: true } },
      procedure: { select: { id: true, name: true, price: true } },
    },
    orderBy: { date: 'asc' },
  });

  return appointments;
}

export async function getAllAppointmentsForAdmin() {
  if (!(await isAdminLoggedIn())) throw new Error('Access denied');
  return prisma.appointment.findMany({
    include: {
      doctor: { select: { id: true, name: true, specialization: true } },
      procedure: { select: { id: true, name: true, price: true } },
    },
    orderBy: [{ date: 'desc' }, { time: 'asc' }],
    take: 500,
  });
}