'use client';

import React, { useState, useEffect } from 'react';
import { getOccupiedSlots, bookAppointment } from '../actions';
import { Calendar as CalendarIcon, Clock, User, Phone, Clipboard, FileText, CheckCircle, ArrowLeft } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  phone: string;
  specialization: string;
  avatar: string;
  slotDuration: number;
  workStartTime: string;
  workEndTime: string;
  weekends: string;
  disabledDates: string;
}

interface BookingWizardProps {
  doctors: Doctor[];
  settings: Record<string, string>;
}

export default function BookingWizard({ doctors, settings }: BookingWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Form states
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('+7');
  const [complaint, setComplaint] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Success state
  const [successData, setSuccessData] = useState<any>(null);

  // Calendar states
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());

  // Phone masking/validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+7')) {
      value = '+7' + value.replace(/^\+?7?/, '');
    }
    setPatientPhone(value);
  };

  // Reset steps
  const handleBack = () => {
    if (step === 2) {
      setSelectedDate('');
      setSelectedTime('');
      setStep(1);
    } else if (step === 3) {
      setSelectedTime('');
      setStep(2);
    } else if (step === 4) {
      setStep(3);
    }
  };

  // Fetch occupied slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      setLoadingSlots(true);
      getOccupiedSlots(selectedDoctor.id, selectedDate)
        .then((slots) => {
          setOccupiedSlots(slots);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          setLoadingSlots(false);
        });
    }
  }, [selectedDoctor, selectedDate]);

  // Generate all potential slots for the doctor
  const availableSlots = React.useMemo(() => {
    if (!selectedDoctor) return [];
    
    const slots: string[] = [];
    let [startH, startM] = selectedDoctor.workStartTime.split(':').map(Number);
    const [endH, endM] = selectedDoctor.workEndTime.split(':').map(Number);
    const duration = selectedDoctor.slotDuration;
    
    let startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    while (startMinutes + duration <= endMinutes) {
      const h = Math.floor(startMinutes / 60);
      const m = startMinutes % 60;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      slots.push(timeStr);
      startMinutes += duration;
    }
    return slots;
  }, [selectedDoctor]);

  // Calendar Helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust so Monday = 0, Sunday = 6
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const isWeekend = (dateObj: Date, doctorWeekends: string) => {
    const day = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    const weekendArr = doctorWeekends.split(',').map(Number);
    return weekendArr.includes(day);
  };

  const isDisabledDate = (dateStr: string, doctorDisabledDates: string) => {
    if (!doctorDisabledDates) return false;
    const disabledArr = doctorDisabledDates.split(',');
    return disabledArr.includes(dateStr);
  };

  const isPastDate = (dateObj: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateObj < today;
  };

  const handleDateSelect = (day: number) => {
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
    setSelectedDate(dateStr);
    setStep(3);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setErrorMsg('Пожалуйста, введите ваше имя');
      return;
    }
    if (patientPhone.length < 11) {
      setErrorMsg('Пожалуйста, введите корректный номер телефона');
      return;
    }
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setErrorMsg('Не все параметры бронирования выбраны');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('doctorId', selectedDoctor.id.toString());
      formData.append('patientName', patientName);
      formData.append('patientPhone', patientPhone);
      formData.append('complaint', complaint);
      formData.append('date', selectedDate);
      formData.append('time', selectedTime);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await bookAppointment(formData);
      if (res.success) {
        setSuccessData(res.appointment);
        setStep(5);
      } else {
        setErrorMsg(res.error || 'Произошла ошибка при создании записи');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Внутренняя ошибка сервера. Пожалуйста, попробуйте еще раз.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render month calendar grid
  const renderCalendar = () => {
    if (!selectedDoctor) return null;

    const days = [];
    const totalDays = daysInMonth(currentYear, currentMonth);
    const startOffset = startDayOfWeek(currentYear, currentMonth);
    
    // Add empty elements for offset
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      const isPast = isPastDate(dateObj);
      const isDoctorWeekend = isWeekend(dateObj, selectedDoctor.weekends);
      const isCustomDisabled = isDisabledDate(dateStr, selectedDoctor.disabledDates);
      
      const disabled = isPast || isDoctorWeekend || isCustomDisabled;
      const isSelected = selectedDate === dateStr;

      days.push(
        <button
          key={`day-${day}`}
          type="button"
          disabled={disabled}
          onClick={() => handleDateSelect(day)}
          className={`calendar-day ${disabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
          style={{
            aspectRatio: '1',
            borderRadius: '10px',
            border: 'none',
            background: isSelected 
              ? 'var(--color-accent)' 
              : disabled 
                ? 'rgba(255, 255, 255, 0.02)' 
                : 'rgba(255, 255, 255, 0.05)',
            color: isSelected 
              ? '#fff' 
              : disabled 
                ? 'var(--text-muted)' 
                : 'var(--text-primary)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontWeight: isSelected ? '700' : '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.95rem'
          }}
        >
          {day}
        </button>
      );
    }

    return (
      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={handlePrevMonth}>&lt;</button>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{monthNames[currentMonth]} {currentYear}</span>
          <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={handleNextMonth}>&gt;</button>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.5rem',
          textAlign: 'center',
          marginBottom: '0.5rem'
        }}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
            <span key={d} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{d}</span>
          ))}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.5rem'
        }}>
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', marginTop: '2rem', minHeight: '400px' }}>
      
      {/* Header with back button */}
      {step > 1 && step < 5 && (
        <button 
          onClick={handleBack} 
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-accent)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            padding: 0
          }}
        >
          <ArrowLeft size={16} /> Назад
        </button>
      )}

      {/* Progress indicators */}
      {step < 5 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '2.5rem' }}>
          {[
            { n: 1, label: 'Врач' },
            { n: 2, label: 'Дата' },
            { n: 3, label: 'Время' },
            { n: 4, label: 'Данные' }
          ].map(s => {
            const active = step === s.n;
            const completed = step > s.n;
            return (
              <div key={s.n} style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: active 
                    ? 'var(--color-accent)' 
                    : completed 
                      ? 'var(--color-primary)' 
                      : 'rgba(255, 255, 255, 0.05)',
                  color: active || completed ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: active ? 'none' : completed ? 'none' : '1px solid var(--border-color)',
                  transition: 'all 0.3s ease'
                }}>
                  {completed ? '✓' : s.n}
                </div>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: active ? 'var(--color-accent)' : completed ? 'var(--color-primary)' : 'var(--text-muted)' 
                }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* STEP 1: Select Doctor */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Выбор специалиста
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {doctors.map(doc => {
              // Custom colors based on specialization
              const isProc = doc.specialization.includes('Процедурный');
              const specColor = isProc ? 'var(--color-accent)' : 'var(--color-primary)';
              const initials = doc.name.split(' ').map(n => n[0]).join('');

              return (
                <div 
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setStep(2);
                  }}
                  className="glass-panel"
                  style={{
                    padding: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    background: 'rgba(255,255,255,0.02)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = specColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  {/* Doctor Avatar - Initials Styled Icon */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${specColor}22 0%, ${specColor}55 100%)`,
                    border: `1px solid ${specColor}55`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1.4rem',
                    boxShadow: `0 4px 15px ${specColor}15`
                  }}>
                    {initials}
                  </div>
                  <div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: specColor,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>{doc.specialization}</span>
                    <h3 style={{ fontSize: '1.1rem', margin: '0.1rem 0 0.4rem 0' }}>{doc.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} /> Время приема: {doc.workStartTime} - {doc.workEndTime}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      Длительность приема: {doc.slotDuration} мин.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Choose Date */}
      {step === 2 && selectedDoctor && (
        <div className="animate-fade-in" style={{ maxWidth: '450px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            Выбор даты приема
          </h2>
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Специалист: <strong style={{ color: 'var(--color-accent)' }}>{selectedDoctor.name}</strong>
          </p>
          {renderCalendar()}
        </div>
      )}

      {/* STEP 3: Choose Time Slot */}
      {step === 3 && selectedDoctor && selectedDate && (
        <div className="animate-fade-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            Выбор времени приема
          </h2>
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Дата: <strong style={{ color: 'var(--color-primary)' }}>{selectedDate}</strong>, Врач: <strong style={{ color: 'var(--color-accent)' }}>{selectedDoctor.name}</strong>
          </p>

          {loadingSlots ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Загрузка свободных слотов...</div>
          ) : availableSlots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-danger)' }}>В этот день нет доступных приемов.</div>
          ) : (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                gap: '0.75rem',
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '0.5rem'
              }}>
                {availableSlots.map(time => {
                  const isOccupied = occupiedSlots.includes(time);
                  const isSelected = selectedTime === time;
                  
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => {
                        setSelectedTime(time);
                        setStep(4);
                      }}
                      className={`btn ${isSelected ? 'btn-accent' : 'btn-secondary'}`}
                      style={{
                        padding: '0.6rem 0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: isOccupied ? 'not-allowed' : 'pointer',
                        opacity: isOccupied ? 0.3 : 1,
                        background: isSelected ? 'var(--color-accent)' : isOccupied ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.05)',
                        color: isSelected ? '#fff' : isOccupied ? 'var(--text-muted)' : 'var(--text-primary)',
                        border: isSelected ? 'none' : '1px solid var(--border-color)',
                        borderRadius: '8px',
                        textDecoration: isOccupied ? 'line-through' : 'none'
                      }}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '3px' }}></span> Доступно
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.01)', opacity: 0.3, border: '1px solid var(--border-color)', borderRadius: '3px' }}></span> Занято
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Patient Info Form */}
      {step === 4 && selectedDoctor && selectedDate && selectedTime && (
        <form onSubmit={handleSubmit} className="animate-fade-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            Ваши контактные данные
          </h2>
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Запись на <strong style={{ color: 'var(--color-primary)' }}>{selectedDate}</strong> в <strong style={{ color: 'var(--color-accent)' }}>{selectedTime}</strong> к врачу <strong style={{ color: 'var(--color-accent)' }}>{selectedDoctor.name}</strong>
          </p>

          {errorMsg && (
            <div style={{
              background: 'var(--color-danger-glow)',
              border: '1px solid var(--color-danger)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              fontWeight: 500
            }}>
              {errorMsg}
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="patientName">ФИО Пациента *</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                id="patientName"
                type="text"
                required
                placeholder="Иванов Иван Иванович"
                className="form-control"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="patientPhone">Номер телефона *</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                id="patientPhone"
                type="tel"
                required
                placeholder="+77012345678"
                className="form-control"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                value={patientPhone}
                onChange={handlePhoneChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="complaint">Жалоба / Описание симптомов</label>
            <div style={{ position: 'relative' }}>
              <Clipboard size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
              <textarea
                id="complaint"
                rows={3}
                placeholder="Опишите ваши симптомы или жалобы..."
                className="form-control"
                style={{ width: '100%', paddingLeft: '2.5rem', resize: 'vertical' }}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="fileUpload">Прикрепить результаты обследований (МРТ, УЗИ, анализы)</label>
            <div style={{
              border: '2px dashed var(--border-color)',
              borderRadius: '8px',
              padding: '1.25rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.01)',
              position: 'relative'
            }}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setSelectedFile(e.dataTransfer.files[0]);
              }
            }}
            >
              <input
                id="fileUpload"
                type="file"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
                onChange={handleFileChange}
              />
              <FileText size={24} style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {selectedFile ? selectedFile.name : 'Выберите файл или перетащите его сюда'}
              </p>
              {selectedFile && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Размер: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', padding: '0.9rem' }}
          >
            {submitting ? 'Оформление записи...' : 'Подтвердить запись'}
          </button>
        </form>
      )}

      {/* STEP 5: Success Screen */}
      {step === 5 && successData && (
        <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '550px', margin: '0 auto' }}>
          <CheckCircle size={64} style={{ color: 'var(--color-primary)', marginBottom: '1.5rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Запись успешно оформлена!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Вы записаны на прием в клинику. Мы отправили вам WhatsApp-уведомление с деталями.
          </p>

          <div className="glass-panel" style={{
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '2rem',
            background: 'rgba(255,255,255,0.01)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontWeight: 700 }}>
              Детали записи #{successData.id}
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Пациент:</span> <strong>{successData.patientName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Врач:</span> <strong>{successData.doctor.name} ({successData.doctor.specialization})</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Дата и время:</span> <strong>{successData.date} в {successData.time}</strong>
            </div>
            {successData.filePath && (
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Прикрепленный файл:</span> <a href={successData.filePath} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>Просмотреть документ</a>
              </div>
            )}
          </div>

          <div style={{
            background: 'rgba(6, 182, 212, 0.05)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'left',
            fontSize: '0.85rem',
            marginBottom: '2rem'
          }}>
            <div style={{ color: 'var(--color-accent)', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              💬 Симуляция WhatsApp сообщения пациенту:
            </div>
            <p style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>
              "Здравствуйте, {successData.patientName}! Вы записаны к врачу {successData.doctor.name} ({successData.doctor.specialization}) на {successData.date} в {successData.time}. Клиника \"{settings.clinic_name || 'Алихан'}\"."
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setPatientName('');
              setPatientPhone('+7');
              setComplaint('');
              setSelectedFile(null);
              setSelectedDoctor(null);
              setSelectedDate('');
              setSelectedTime('');
              setSuccessData(null);
              setStep(1);
            }}
          >
            Записаться еще раз
          </button>
        </div>
      )}

    </div>
  );
}
