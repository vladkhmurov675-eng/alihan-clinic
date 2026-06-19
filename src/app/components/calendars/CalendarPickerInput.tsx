'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import CalendarPicker from './CalendarPicker';

interface Props {
  value: string;          // current "YYYY" | "YYYY-MM" | "YYYY-MM-DD" or "" if unset
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CalendarPickerInput({ value, onChange, placeholder = 'Выбрать дату' }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click — same pattern used in SearchBar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (dateParam: string) => {
    onChange(dateParam);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(v => !v)}
        className="form-control"
        style={{
          width: 'auto',
          minWidth: 160,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
        }}
      >
        <CalendarIcon size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <span style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)', flex: 1 }}>
          {value || placeholder}
        </span>
        {value && (
          <button
            onClick={handleClear}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            aria-label="Очистить дату"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100 }}>
          <CalendarPicker
            onSubmit={handleSubmit}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
