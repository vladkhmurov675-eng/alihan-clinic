'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DisabledDatesCalendarProps {
  value: string; // comma-separated dates: "2026-01-01,2026-03-08"
  onChange: (value: string) => void;
}

export default function DisabledDatesCalendar({
  value,
  onChange,
}: DisabledDatesCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [mode, setMode] = useState<'single' | 'range'>('single');

  const disabledDates = useMemo(() => {
    if (!value) return new Set<string>();
    return new Set(value.split(',').map(d => d.trim()).filter(d => d));
  }, [value]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const dateToString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toggleDate = (dateStr: string) => {
    const newSet = new Set(disabledDates);
    if (newSet.has(dateStr)) {
      newSet.delete(dateStr);
    } else {
      newSet.add(dateStr);
    }
    const sorted = Array.from(newSet).sort();
    onChange(sorted.join(','));
  };

  const addDateRange = (start: string, end: string) => {
    const newSet = new Set(disabledDates);
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate > endDate) {
      [startDate, endDate] = [endDate, startDate];
    }

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      newSet.add(dateToString(d));
    }

    const sorted = Array.from(newSet).sort();
    onChange(sorted.join(','));
  };

  const handleDateClick = (day: number) => {
    const dateStr = dateToString(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));

    if (mode === 'single') {
      toggleDate(dateStr);
    } else if (mode === 'range') {
      if (!rangeStart) {
        setRangeStart(dateStr);
      } else {
        addDateRange(rangeStart, dateStr);
        setRangeStart(null);
      }
    }
  };

  const clearAll = () => {
    onChange('');
    setRangeStart(null);
  };

  const removeDate = (dateStr: string) => {
    const newSet = new Set(disabledDates);
    newSet.delete(dateStr);
    const sorted = Array.from(newSet).sort();
    onChange(sorted.join(','));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: firstDay }, (_, i) => i);

  const monthName = currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

  return (
    <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
      {/* Mode selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => { setMode('single'); setRangeStart(null); }}
          className="btn"
          style={{
            flex: 1,
            padding: '0.5rem',
            fontSize: '0.85rem',
            background: mode === 'single' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
            color: mode === 'single' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Отдельные дни
        </button>
        <button
          type="button"
          onClick={() => { setMode('range'); setRangeStart(null); }}
          className="btn"
          style={{
            flex: 1,
            padding: '0.5rem',
            fontSize: '0.85rem',
            background: mode === 'range' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
            color: mode === 'range' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Период
        </button>
      </div>

      {/* Month Navigator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <ChevronLeft size={20} />
        </button>
        <h4 style={{ textTransform: 'capitalize', margin: 0 }}>{monthName}</h4>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Range start indicator */}
      {mode === 'range' && rangeStart && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: 'var(--color-accent)15',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          color: 'var(--color-accent)',
        }}>
          Начало периода: <strong>{rangeStart}</strong>. Нажмите на конечную дату.
        </div>
      )}

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}>
        {/* Weekday headers */}
        {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
          <div key={day} style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            paddingBottom: '0.5rem',
            textTransform: 'uppercase',
          }}>
            {day}
          </div>
        ))}

        {/* Empty slots */}
        {emptySlots.map(i => (
          <div key={`empty-${i}`} />
        ))}

        {/* Days */}
        {days.map(day => {
          const dateStr = dateToString(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
          const isDisabled = disabledDates.has(dateStr);
          const isRangeStart = rangeStart === dateStr;

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDateClick(day)}
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                border: isRangeStart ? '2px solid var(--color-accent)' : '1px solid var(--border-color)',
                background: isDisabled ? 'var(--color-primary)' : isRangeStart ? 'var(--color-accent)15' : 'rgba(255,255,255,0.02)',
                color: isDisabled ? '#fff' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Selected dates list */}
      {disabledDates.size > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Выбрано: {disabledDates.size}
            </span>
            <button
              type="button"
              onClick={clearAll}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-danger)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                textDecoration: 'underline',
              }}
            >
              Очистить все
            </button>
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            maxHeight: '150px',
            overflowY: 'auto',
            paddingRight: '0.5rem',
          }}>
            {Array.from(disabledDates)
              .sort()
              .map(dateStr => (
                <div
                  key={dateStr}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.7rem',
                    background: 'var(--color-primary)22',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                  }}
                >
                  <span>{dateStr}</span>
                  <button
                    type="button"
                    onClick={() => removeDate(dateStr)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-danger)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
