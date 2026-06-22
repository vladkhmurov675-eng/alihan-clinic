import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';

interface Props {
  onSubmit: (dateParam: string) => void; // "2026" | "2026-03" | "2026-03-15"
  onNext: (dateParam: string) => void;
  onClose: () => void;
  initialStep?: Step;
}

type Step = 'year' | 'month' | 'day';

interface MonthOption {
  value: number;
  label: string;
}

const ITEM_HEIGHT = 40;
const VISIBLE_OFFSET = 80;
const VISIBLE_ROWS = 1;
const YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

const MONTHS: MonthOption[] = [
  { value: 1, label: 'Январь' }, { value: 2, label: 'Февраль' },
  { value: 3, label: 'Март' }, { value: 4, label: 'Апрель' },
  { value: 5, label: 'Май' }, { value: 6, label: 'Июнь' },
  { value: 7, label: 'Июль' }, { value: 8, label: 'Август' },
  { value: 9, label: 'Сентябрь' }, { value: 10, label: 'Октябрь' },
  { value: 11, label: 'Ноябрь' }, { value: 12, label: 'Декабрь' },
];

function getDaysInMonth(year: number, month: number): number[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function getOptionValue(option: number | MonthOption): number {
  return typeof option === 'number' ? option : option.value;
}

function getOptionLabel(option: number | MonthOption): string {
  return typeof option === 'number' ? String(option) : option.label;
}

export default function CalendarPicker({ onSubmit, onNext, onClose, initialStep = 'year' }: Props) {
  const [step, setStep] = useState<Step>(initialStep);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(1);
  const [index, setIndex] = useState(0); 
  const [isDragging, setIsDragging] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const options = useMemo<(number | MonthOption)[]>(() => {
    switch (step) {
      case 'year':  return YEARS;
      case 'month': return MONTHS;
      case 'day':   return getDaysInMonth(year, month);
      default:      return [];
    }
  }, [step, year, month]);

  const currentValue = () => getOptionValue(options[index]);

  // ── Wheel handling, attached manually as non-passive so preventDefault
  //    actually stops the underlying page from scrolling. React's synthetic
  //    onWheel prop registers a passive listener in modern browsers, which
  //    silently ignores preventDefault() — this is why scroll was bleeding
  //    through to the page before. ──



  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIndex(prev => {
        const next = e.deltaY > 0 ? prev + 1 : prev - 1;
        return Math.max(0, Math.min(options.length - 1, next));
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [options.length]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clickY = e.clientY;
    const element = e.currentTarget;
    const midpoint = element.getBoundingClientRect().top + element.clientHeight / 2;

    if (clickY < midpoint) {
      setIndex(prev => Math.max(0, prev - 1));
    } else {
      setIndex(prev => Math.min(options.length - 1, prev + 1));
    }
  };

    const dragState = useRef<{
    startY: number;
    startIndex: number;
    dragging: boolean;
    moved: boolean;
  }>({ startY: 0, startIndex: 0, dragging: false, moved: false });
 
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = {
      startY: e.clientY,
      startIndex: index,
      dragging: true,
      moved: false,
    };
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
 
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    if (!state.dragging) return;
 
    const deltaY = e.clientY - state.startY;
 
    // Below this threshold we treat it as a click, not a drag —
    // prevents a tiny accidental wobble from being read as a scroll
    if (Math.abs(deltaY) > 4) state.moved = true;
    if (!state.moved) return;
 
    const stepsDelta = Math.round(deltaY / ITEM_HEIGHT);
    const nextIndex = state.startIndex - stepsDelta;
    setIndex(Math.max(0, Math.min(options.length - 1, nextIndex)));
  };
 
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
 
    // If the pointer never moved past the threshold, fall back to
    // click-to-step behavior using the same up/down-of-center logic
    if (!state.moved) {
      handleClick(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
 
    state.dragging = false;
    setIsDragging(false);
  };



  const handleAdvance = () => {
    const value = currentValue();

    if (step === 'year') {
      setYear(value);
      onNext(String(year));
      setIndex(0);
      setStep('month');
      return;
    }

    if (step === 'month') {
      setMonth(value);
      onNext(`${year}-${month}`);
      setIndex(0);
      setStep('day');
      return;
    }

    onSubmit(`${year}-${pad(month)}-${pad(value)}`);
  };

  const handleSkipRest = () => {
    if (step === 'month') {
      onSubmit(String(year));
    } else if (step === 'day') {
      onSubmit(`${year}-${pad(month)}`);
    }
  };
  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClose();
  };

  const stepLabel = step === 'year' ? 'Год' : step === 'month' ? 'Месяц' : 'День';
  const advanceLabel = step === 'day' ? 'Подтвердить' : 'Далее';

  return (
    <div className="form-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 600 }}>{stepLabel}</span>
        <button onClick={handleClose} aria-label="Закрыть">×</button>
      </div>
 
      <div
        ref={wheelRef}
        className="wheel"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className="wheel-inner"
          style={{
            transform: `translateY(${-index * ITEM_HEIGHT + VISIBLE_OFFSET}px)`,
            transition: isDragging ? 'none' : undefined,
          }}
        >
          {/* Spacer rows so the first real item can be centered */}
          {Array.from({ length: Math.floor(VISIBLE_ROWS / 2) }).map((_, i) => (
            <div key={`spacer-top-${i}`} className="wheel-item" style={{ pointerEvents: 'none' }} />
          ))}
 
          {options.map((opt, i) => (
            <div
              key={getOptionValue(opt)}
              className={`wheel-item ${i === index ? 'active' : ''}`}
            >
              {getOptionLabel(opt)}
            </div>
          ))}
 
          {/* Spacer rows so the last real item can be centered */}
          {Array.from({ length: Math.floor(VISIBLE_ROWS / 2) }).map((_, i) => (
            <div key={`spacer-bottom-${i}`} className="wheel-item" style={{ pointerEvents: 'none' }} />
          ))}
        </div>
      </div>
 
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <button onClick={handleAdvance} style={{ flex: 1 }}>
          {advanceLabel}
        </button>
 
        {step !== 'year' && (
          <button onClick={handleSkipRest} style={{ flex: 1 }}>
            {step === 'month' ? `Готово: ${year}` : `Готово: ${year}-${pad(month)}`}
          </button>
        )}
      </div>
    </div>

  );
}
