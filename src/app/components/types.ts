interface Doctor {
  id: number; name: string; phone: string; specialization: string;
  avatar: string | null; slotDuration: number; workStartTime: string;
  workEndTime: string; weekends: string; disabledDates: string;
  education: string | null; experienceYears: number | null;
  description: string | null; createdAt: Date;
}

interface Procedure {
  id: number; name: string; doctorId: number; duration: number; price: number;
}

interface Appointment {
  id: number; doctorId: number; patientName: string; patientPhone: string;
  complaint: string; date: string; time: string; filePath: string | null;
  status: string; price: number | null; procedureId: number | null; createdAt: Date;
  doctor: { id: number; name: string; specialization: string };
  procedure: { id: number; name: string; price: number } | null;
};

interface Setting {
  id: number; key: string; value: string;
}

interface WhatsAppLog {
    id: number; sentAt: Date; recipientName: string; recipientPhone: string;
    message: string; status: string;
}


export type DoctorFormData = Omit<Doctor, 'id' | 'createdAt' | 'avatar'> & {
  password?: string;
};

export type ProcedureFormData = Pick<Procedure, 'name' | 'doctorId' | 'duration' | 'price'>;

export type AppointmentFormData = Omit<Appointment, 'id' | 'createdAt' | 'doctor' | 'procedure'> & {
  procedureId: number | null;
  filePath: string;
};

export type { Doctor, Procedure, Appointment, Setting, WhatsAppLog };