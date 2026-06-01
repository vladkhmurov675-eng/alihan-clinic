'use server';

import { prisma } from '../db';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

// Helper to check doctor authentication
export async function getSessionDoctorId(): Promise<number | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('doctor-session');
  if (!sessionCookie) return null;
  try {
    const data = JSON.parse(sessionCookie.value);
    return data.doctorId || null;
  } catch {
    return null;
  }
}

// Doctor Login Action
export async function loginDoctor(doctorId: number, pin: string): Promise<{ success: boolean; error?: string }> {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return { success: false, error: 'Доктор не найден' };
    }

    if (doctor.pin !== pin) {
      return { success: false, error: 'Неверный PIN-код' };
    }

    const cookieStore = await cookies();
    cookieStore.set('doctor-session', JSON.stringify({ doctorId, loggedIn: true }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return { success: true };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: 'Ошибка сервера при авторизации' };
  }
}

// Doctor Logout Action
export async function logoutDoctor() {
  const cookieStore = await cookies();
  cookieStore.delete('doctor-session');
  return { success: true };
}

// Check if admin
export async function isAdminLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('admin-session');
  return !!adminCookie;
}

// Admin Login
export async function loginAdmin(pin: string): Promise<{ success: boolean; error?: string }> {
  if (pin === '8888') { // Default admin PIN
    const cookieStore = await cookies();
    cookieStore.set('admin-session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    return { success: true };
  }
  return { success: false, error: 'Неверный PIN-код администратора' };
}

// Admin Logout
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-session');
  return { success: true };
}

// Get all doctors
export async function getDoctors() {
  return await prisma.doctor.findMany({
    orderBy: { name: 'asc' },
  });
}

// Get doctor by ID
export async function getDoctorById(id: number) {
  return await prisma.doctor.findUnique({
    where: { id },
  });
}

// Get global clinic settings
export async function getSettings() {
  const settings = await prisma.setting.findMany();
  const settingsMap: Record<string, string> = {};
  settings.forEach(s => {
    settingsMap[s.key] = s.value;
  });
  return settingsMap;
}

// Save global clinic settings
export async function saveSettings(settings: Record<string, string>) {
  if (!(await isAdminLoggedIn())) {
    throw new Error('Access denied');
  }

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  return { success: true };
}

// Get occupied slots for a doctor on a specific date
export async function getOccupiedSlots(doctorId: number, date: string): Promise<string[]> {
  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date,
      status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] }, // Exclude cancelled ones
    },
    select: {
      time: true,
    },
  });
  return appointments.map(a => a.time);
}

// Book Appointment Server Action (handles File upload natively)
export async function bookAppointment(formData: FormData): Promise<{ success: boolean; appointment?: any; error?: string }> {
  try {
    const doctorIdStr = formData.get('doctorId') as string;
    const patientName = formData.get('patientName') as string;
    const patientPhone = formData.get('patientPhone') as string;
    const complaint = formData.get('complaint') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const file = formData.get('file') as File | null;

    if (!doctorIdStr || !patientName || !patientPhone || !date || !time) {
      return { success: false, error: 'Заполните все обязательные поля' };
    }

    const doctorId = parseInt(doctorIdStr);

    // Verify slot is still available
    const occupied = await getOccupiedSlots(doctorId, date);
    if (occupied.includes(time)) {
      return { success: false, error: 'Это время уже занято, выберите другое' };
    }

    // Process file upload if any
    let filePath: string | null = null;
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const fullPath = path.join(uploadDir, filename);
      await fs.writeFile(fullPath, buffer);
      filePath = `/uploads/${filename}`;
    }

    // Save appointment
    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientName,
        patientPhone,
        complaint: complaint || 'Жалобы отсутствуют',
        date,
        time,
        filePath,
        status: 'PENDING',
      },
      include: {
        doctor: true,
      },
    });

    // Create WhatsApp Log (Simulated)
    const clinicNameSetting = await prisma.setting.findUnique({ where: { key: 'clinic_name' } });
    const clinicName = clinicNameSetting?.value || 'Алихан';
    
    const message = `Здравствуйте, ${patientName}! Вы записаны к врачу ${appointment.doctor.name} (${appointment.doctor.specialization}) на ${date} в ${time}. Клиника "${clinicName}".`;
    
    await prisma.whatsAppLog.create({
      data: {
        recipientPhone: patientPhone,
        recipientName: patientName,
        message,
        status: 'SIMULATED',
      },
    });

    return { success: true, appointment };
  } catch (error: any) {
    console.error('Booking error:', error);
    return { success: false, error: 'Произошла ошибка при бронировании' };
  }
}

// Get Appointments for Doctor (secured by doctor session)
export async function getDoctorAppointments(date: string) {
  const doctorId = await getSessionDoctorId();
  if (!doctorId) {
    throw new Error('Unauthorized');
  }

  return await prisma.appointment.findMany({
    where: {
      doctorId,
      date,
    },
    orderBy: {
      time: 'asc',
    },
  });
}

// Update Appointment Status (secured by doctor session or admin session)
export async function updateAppointmentStatus(appointmentId: number, status: string) {
  const doctorId = await getSessionDoctorId();
  const admin = await isAdminLoggedIn();
  
  if (!doctorId && !admin) {
    throw new Error('Unauthorized');
  }

  // If it's a doctor, verify this appointment belongs to them
  if (doctorId && !admin) {
    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!appt || appt.doctorId !== doctorId) {
      throw new Error('Unauthorized access to appointment');
    }
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    include: { doctor: true },
  });

  // Log WhatsApp notification for confirmation / completion / cancellation
  let notificationMessage = '';
  if (status === 'CONFIRMED') {
    notificationMessage = `Ваша запись на ${updated.date} в ${updated.time} к врачу ${updated.doctor.name} подтверждена.`;
  } else if (status === 'CANCELLED') {
    notificationMessage = `Ваша запись на ${updated.date} в ${updated.time} к врачу ${updated.doctor.name} отменена клиникой.`;
  } else if (status === 'COMPLETED') {
    notificationMessage = `Прием у врача ${updated.doctor.name} успешно завершен. Благодарим за визит!`;
  }

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

// Update Doctor Settings (secured by doctor session)
export async function updateDoctorSettings(data: {
  name: string;
  phone: string;
  specialization: string;
  slotDuration: number;
  workStartTime: string;
  workEndTime: string;
  weekends: string;
  disabledDates: string;
  pin: string;
}) {
  const doctorId = await getSessionDoctorId();
  if (!doctorId) {
    throw new Error('Unauthorized');
  }

  const updated = await prisma.doctor.update({
    where: { id: doctorId },
    data: {
      name: data.name,
      phone: data.phone,
      specialization: data.specialization,
      slotDuration: data.slotDuration,
      workStartTime: data.workStartTime,
      workEndTime: data.workEndTime,
      weekends: data.weekends,
      disabledDates: data.disabledDates,
      pin: data.pin,
    },
  });

  return { success: true, doctor: updated };
}

// Admin: CRUD Doctors
export async function createDoctor(data: {
  name: string;
  phone: string;
  specialization: string;
  slotDuration: number;
  workStartTime: string;
  workEndTime: string;
  weekends: string;
  disabledDates: string;
  pin: string;
}) {
  if (!(await isAdminLoggedIn())) {
    throw new Error('Access denied');
  }

  const newDoc = await prisma.doctor.create({
    data: {
      ...data,
      avatar: '/images/default-doctor.png',
    },
  });

  return { success: true, doctor: newDoc };
}

export async function updateDoctorByAdmin(id: number, data: any) {
  if (!(await isAdminLoggedIn())) {
    throw new Error('Access denied');
  }

  const updated = await prisma.doctor.update({
    where: { id },
    data,
  });

  return { success: true, doctor: updated };
}

export async function deleteDoctor(id: number) {
  if (!(await isAdminLoggedIn())) {
    throw new Error('Access denied');
  }

  await prisma.doctor.delete({
    where: { id },
  });

  return { success: true };
}

// Get WhatsApp Logs
export async function getWhatsAppLogs() {
  const doctorId = await getSessionDoctorId();
  const admin = await isAdminLoggedIn();
  
  if (!doctorId && !admin) {
    throw new Error('Unauthorized');
  }

  return await prisma.whatsAppLog.findMany({
    orderBy: { sentAt: 'desc' },
    take: 100, // Limit to last 100 logs
  });
}
