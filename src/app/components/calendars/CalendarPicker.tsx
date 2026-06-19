import React, { useState, useMemo } from 'react';

interface Props {
  onSubmit: (dateParam: string) => void; // "2026" | "2026-03" | "2026-03-15"
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

export default function CalendarPicker({ onSubmit, onClose, initialStep = 'year' }: Props) {
  const [step, setStep] = useState<Step>(initialStep);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(1);
  const [index, setIndex] = useState(0);

  const options = useMemo<(number | MonthOption)[]>(() => {
    switch (step) {
      case 'year':  return YEARS;
      case 'month': return MONTHS;
      case 'day':   return getDaysInMonth(year, month);
      default:      return [];
    }
  }, [step, year, month]);

  const currentValue = () => getOptionValue(options[index]);

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIndex(prev => {
      const next = e.deltaY > 0 ? prev + 1 : prev - 1;
      return Math.max(0, Math.min(options.length - 1, next));
    });
  };

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

  // Advances to the next step, or submits a full "YYYY-MM-DD" string on the last step
  const handleAdvance = () => {
    const value = currentValue();

    if (step === 'year') {
      setYear(value);
      setIndex(0);
      setStep('month');
      return;
    }

    if (step === 'month') {
      setMonth(value);
      setIndex(0);
      setStep('day');
      return;
    }

    onSubmit(`${year}-${pad(month)}-${pad(value)}`);
  };

  // Lets the user stop early — submits a partial "YYYY" or "YYYY-MM" string
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

      <div className="wheel" onWheel={handleScroll} onClick={handleClick}>
        <div
          className="wheel-inner"
          style={{ transform: `translateY(${-index * ITEM_HEIGHT + VISIBLE_OFFSET}px)` }}
        >
          {options.map((opt, i) => (
            <div
              key={getOptionValue(opt)}
              className={`wheel-item ${i === index ? 'active' : ''}`}
            >
              {getOptionLabel(opt)}
            </div>
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
