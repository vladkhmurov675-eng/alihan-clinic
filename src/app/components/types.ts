interface Doctor {
  id: number; name: string; phone: string; specialization: string;
  avatar: string | null; slotDuration: number; workStartTime: string;
  workEndTime: string; weekends: string; disabledDates: string;
  education: string | ''; experienceYears: number | '';
  description: string | ''; createdAt: Date;
}

interface Procedure {
  id: number; name: string; doctorId: number; duration: number; price: number;
}

interface Appointment {
  id: number; doctorId: number; patientName: string; patientPhone: string;
  complaint: string; date: string; time: string; filePath: string | null;
  status: string; price: number; procedureId: number; createdAt: Date;
  doctor: { id: number; name: string; specialization: string };
  procedure: { id: number; name: string; price: number };
};

interface Setting {
  id: number; key: string; value: string;
}

interface WhatsAppLog {
    id: number; sentAt: Date; recipientName: string; recipientPhone: string;
    message: string; status: string;
}


type DoctorFormData = Omit<Doctor, 'id' | 'createdAt' | 'avatar'> & {
  password?: string | null;
};

type ProcedureFormData = Pick<Procedure, 'name' | 'doctorId' | 'duration' | 'price'>;

type AppointmentFormData = Omit<Appointment, 'id' | 'createdAt' | 'doctor' | 'procedure'> & {
  procedureId: number | null;
  filePath: string;
};

export type { Doctor, Procedure, Appointment, Setting, WhatsAppLog, DoctorFormData, ProcedureFormData, AppointmentFormData };