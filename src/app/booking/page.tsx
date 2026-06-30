'use client';

import { Suspense } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { getDoctors, getOccupiedSlots, bookAppointment, getProceduresByDoctor } from '../actions';
import OTPForm from '../components/forms/OTPForm';
import { User, Phone, Clipboard, FileText, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { Appointment, Doctor, Procedure} from '../components/types';

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

function isDateDisabled(dateStr: string, doctor: Doctor): boolean {
    const date = new Date(dateStr);
    const day = date.getDay();
    const weekends = doctor.weekends.split(',').map(Number);
    if (weekends.includes(day)) return true;
    if (doctor.disabledDates && doctor.disabledDates.split(',').includes(dateStr)) return true;
    return false;
}

const todayStr = new Date().toISOString().split('T')[0];

function BookingForm() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [doctorId, setDoctorId] = useState<number | ''>('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [slots, setSlots] = useState<string[]>([]);
    const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [dateError, setDateError] = useState('');
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [procedureId, setProcedureId] = useState<number | ''>('');
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('+7');
    const [complaint, setComplaint] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<Appointment | null>(null);
    const [step, setStep] = useState<'form' | 'otp' | 'done'>('form');
    const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
    const searchParams = useSearchParams();
    // Load doctors once on mount
    useEffect(() => {
        getDoctors().then(d => setDoctors(d as Doctor[]));
    }, []);

    // Set doctorId from URL param — only after doctors are loaded
    useEffect(() => {
        if (doctors.length === 0) return;
        const id = searchParams.get('doctorId');
        if (id) setDoctorId(Number(id));
    }, [searchParams, doctors]);

    // Load slots when doctor + date change
    const loadSlots = useCallback(async (dId: number, d: string, doctorList: Doctor[]) => {
        const doctor = doctorList.find(doc => doc.id === dId);
        if (!doctor) return;

        if (isDateDisabled(d, doctor)) {
            setDateError('Врач не принимает в этот день. Выберите другую дату.');
            setSlots([]);
            setOccupiedSlots([]);
            return;
        }

        setDateError('');
        setLoadingSlots(true);
        const occupied = await getOccupiedSlots(dId, d);
        setOccupiedSlots(occupied);
        setSlots(generateSlots(doctor.workStartTime, doctor.workEndTime, doctor.slotDuration));
        setLoadingSlots(false);
    }, []);

    useEffect(() => {
        setTime('');
        setSlots([]);
        setOccupiedSlots([]);
        setDateError('');
        if (!doctorId || !date || doctors.length === 0) return;
        loadSlots(Number(doctorId), date, doctors);
    }, [doctorId, date, doctors, loadSlots]);

    // Load procedures when doctor changes
    useEffect(() => {
        setProcedures([]);
        setProcedureId('');
        if (!doctorId) return;
        getProceduresByDoctor(Number(doctorId)).then(procs => {
            setProcedures(procs as Procedure[]);
        });
    }, [doctorId]);

    const availableSlots = slots.filter(s => !occupiedSlots.includes(s));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        const phoneRegex = /^\+7\d{10}$/;

        if (!doctorId) return setError('Выберите врача');
        if (procedures.length > 0 && !procedureId) return setError('Выберите процедуру');
        if (!date) return setError('Выберите дату');
        if (!time) return setError('Выберите время');
        if (!patientName.trim()) return setError('Введите ваше ФИО');
        if (!phoneRegex.test(patientPhone)) return setError('Введите номер в формате +77012345678');

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('doctorId', doctorId.toString());
            if (procedureId) formData.append('procedureId', procedureId.toString());
            formData.append('date', date);
            formData.append('time', time);
            formData.append('patientName', patientName);
            formData.append('patientPhone', patientPhone);
            formData.append('complaint', complaint);
            if (file) formData.append('file', file);

            setPendingFormData(formData);
            setPatientPhone(formData.get('patientPhone') as string);
            setStep('otp');
        } catch {
            setError('Ошибка сервера. Попробуйте ещё раз.');
        } 
    }


    const handleOtpResult = async (verified: boolean) => {
        if (!verified || !pendingFormData) return;

    // OTP passed — now actually create the appointment
    const result = await bookAppointment(pendingFormData);
    if (result.success) {
      setSubmitting(false);
      setSuccess(result.appointment)   
      setStep('done');
    }
    };

    function resetForm() {
        setSuccess(null);
        setDoctorId(''); setDate(''); setTime('');
        setPatientName(''); setPatientPhone('+7');
        setComplaint(''); setFile(null);
        setProcedureId('');
    }

    if (step === 'done') {
        return (
            <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="card animate-fade-in" style={{ padding: '2.5rem', maxWidth: 480, width: '100%', textAlign: 'center' }}>
                    <CheckCircle size={56} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '0.5rem' }}>Запись оформлена!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                        Ждём вас в клинике. Если понадобится изменить время — позвоните нам.
                    </p>

                    <div style={{
                        background: 'var(--bg-secondary)', borderRadius: 10,
                        padding: '1.25rem', textAlign: 'left',
                        marginBottom: '1.75rem',
                        display: 'flex', flexDirection: 'column', gap: '0.6rem',
                        fontSize: '0.92rem',
                    }}>
                        {[
                            { label: 'Пациент', value: success?.patientName },
                            { label: 'Врач', value: `${success?.doctor.name} · ${success?.doctor.specialization}` },
                            ...(success?.procedure ? [{ label: 'Процедура', value: success.procedure.name }] : []),
                            { label: 'Стоимость', value: `${success?.price ?? 5000} ₸` },
                            { label: 'Дата и время', value: `${success?.date} в ${success?.time}` },
                            { label: 'Статус', value: 'Ожидает подтверждения' },
                        ].map(({ label, value }) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
                            </div>
                        ))}
                    </div>

                    <button className="btn btn-outline" style={{ width: '100%' }} onClick={resetForm}>
                        Записаться ещё раз
                    </button>
                </div>
            </div>
        );
    }

        if (step === 'otp') {
            return ( <div style={{minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "2rem",
                    background: "var(--bg-primary)",}}>
            <OTPForm
                phone={patientPhone}
                title="Подтвердите запись"
                description={`Введите код, отправленный на ${patientPhone}, чтобы подтвердить бронирование`}
                onVerified={handleOtpResult}
                onCancel={() => setStep('form')}
            />
            </div>
            );
        }

   if (step === 'form') {     
    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <section style={{
                background: 'linear-gradient(135deg, var(--color-primary), #1a4a1a)',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                color: '#fff',
            }}>
                <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                    Онлайн-запись на приём
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                    Заполните форму ниже — мы подтвердим запись в ближайшее время.
                </p>
            </section>

            <div style={{ maxWidth: 620, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
                <div className="card animate-fade-in" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit}>

                        <div className="input-group">
                            <label className="input-label">Специалист *</label>
                            <select
                                className="form-control"
                                value={doctorId}
                                onChange={e => { setDoctorId(Number(e.target.value)); setDate(''); setTime(''); }}
                                style={{ width: '100%' }}
                            >
                                <option value="">Выберите врача</option>
                                {doctors.map(d => (
                                    <option key={d.id} value={d.id}>
                                        {d.name} — {d.specialization}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {procedures.length > 0 && (
                            <div className="input-group">
                                <label className="input-label">Процедура *</label>
                                <select
                                    className="form-control"
                                    value={procedureId}
                                    onChange={e => setProcedureId(Number(e.target.value))}
                                    style={{ width: '100%' }}
                                >
                                    <option value="">Выберите процедуру</option>
                                    {procedures.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — {p.price} ₸
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Дата *</label>
                                <input suppressHydrationWarning
                                    type="date"
                                    className="form-control"
                                    style={{ width: '100%' }}
                                    min={todayStr}
                                    value={date}
                                    disabled={!doctorId}
                                    onChange={e => setDate(e.target.value)}
                                     
                                />
                                {dateError && (
                                    <span style={{ fontSize: '0.78rem', color: 'var(--color-danger)', marginTop: 4 }}>
                                        {dateError}
                                    </span>
                                )}
                            </div>

                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Время *</label>
                                <select suppressHydrationWarning
                                    className="form-control"
                                    style={{ width: '100%' }}
                                    value={time}
                                    disabled={!date || !!dateError || loadingSlots}
                                    onChange={e => setTime(e.target.value)}
                                >
                                    <option value="">
                                        {loadingSlots ? 'Загрузка...' : availableSlots.length === 0 && date ? 'Нет слотов' : 'Выберите время'}
                                    </option>
                                    {availableSlots.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {doctorId && (() => {
                            const doc = doctors.find(d => d.id === Number(doctorId));
                            return doc ? (
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.25rem' }}>
                                    Приём: {doc.workStartTime}–{doc.workEndTime}, слот {doc.slotDuration} мин
                                </p>
                            ) : null;
                        })()}

                        <div style={{ height: '0.25rem' }} />
                        <div style={{ borderTop: '1px solid var(--border-color)', margin: '1rem 0 1.25rem' }} />

                        <div className="input-group">
                            <label className="input-label">ФИО пациента *</label>
                            <div style={{ position: 'relative' }}>
                                <User size={15} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ width: '100%', paddingLeft: '2.25rem' }}
                                    placeholder="Иванов Иван Иванович"
                                    value={patientName}
                                    onChange={e => setPatientName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Номер телефона *</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={15} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)' }} />
                                <input
                                    type="tel"
                                    className="form-control"
                                    style={{ width: '100%', paddingLeft: '2.25rem' }}
                                    placeholder="+77012345678"
                                    value={patientPhone}
                                    onChange={e => {
                                        const digits = e.target.value.replace(/\D/g, '');
                                        const normalized = digits.startsWith('7')
                                            ? digits.slice(0, 11)
                                            : `7${digits}`.slice(0, 11);
                                        setPatientPhone(`+${normalized}`);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Жалоба / симптомы</label>
                            <div style={{ position: 'relative' }}>
                                <Clipboard size={15} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)' }} />
                                <textarea
                                    className="form-control"
                                    style={{ width: '100%', paddingLeft: '2.25rem', resize: 'vertical' }}
                                    rows={3}
                                    placeholder="Опишите ваши симптомы..."
                                    value={complaint}
                                    onChange={e => setComplaint(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Прикрепить файл (МРТ, УЗИ, анализы)</label>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                border: '1.5px dashed var(--border-color)',
                                borderRadius: 8, padding: '0.85rem 1rem',
                                cursor: 'pointer', background: 'var(--bg-secondary)',
                                transition: 'border-color 0.2s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                            >
                                <FileText size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.88rem', color: file ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                    {file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)` : 'Нажмите чтобы выбрать файл'}
                                </span>
                                <input type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
                            </label>
                        </div>

                        {error && (
                            <div style={{
                                background: 'var(--color-danger-glow)',
                                border: '1px solid var(--color-danger)',
                                color: 'var(--color-danger)',
                                padding: '0.75rem 1rem',
                                borderRadius: 8, fontSize: '0.88rem',
                                marginBottom: '1rem',
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`btn ${submitting ? 'btn-disabled' : 'btn-primary'}`}
                            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
                        >
                            {submitting ? 'Оформляем запись...' : 'Записаться →'}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                            После отправки мы свяжемся с вами для подтверждения
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
}

export default function BookingPage() {
    return (
        <Suspense fallback={
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '60vh', color: 'var(--text-muted)', fontSize: '1rem',
            }}>
                Загрузка...
            </div>
        }>
            <BookingForm />
        </Suspense>
    );
}
