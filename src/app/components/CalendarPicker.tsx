import React, { useState, useMemo, useRef } from 'react';


interface Props {
    submit: (date: string) => void;
}

const YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = [
  { value: 1, label: 'Январь' },
  { value: 2, label: 'Февраль' },
  { value: 3, label: 'Март' },
  { value: 4, label: 'Апрель' },
  { value: 5, label: 'Май' },
  { value: 6, label: 'Июнь' },
  { value: 7, label: 'Июль' },
  { value: 8, label: 'Август' },
  { value: 9, label: 'Сентябрь' },
  { value: 10, label: 'Октябрь' },
  { value: 11, label: 'Ноябрь' },
  { value: 12, label: 'Декабрь' },
];

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function getDaysInMonth(year: number, month: number) {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
}

function stringifyDate(year: number, month: number, day: number) {
    const date = new Date(year, month - 1, day);
    return date.toISOString().split('T')[0];
}


export const CalendarPicker = ({ submit }: Props) => {
    const [step, setStep] = useState<'year' | 'month' | 'day'>('year');
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(1);
    const [day, setDay] = useState(1);
    const [index, setIndex] = useState(0);
    const [date, setDate] = useState<string>('');

    const options = useMemo(() => {
        switch (step) {
            case 'year':
                return YEARS;
            case 'month':
                return MONTHS;
            case 'day':
                return getDaysInMonth(year, month);
            default:
                return [];
        }
    }, [step, year, month]);

    const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
     e.preventDefault();

        setIndex(prev => {
            const next = e.deltaY > 0 ? prev + 1 : prev - 1;

            return Math.max(0, Math.min(options.length - 1, next));
        });
        };
    

    const handleSelect = (value: number) => {
        switch (step) {
            case 'year':        
                setYear(value);
                setIndex(0);
                setStep('month');
                break;
            case 'month':
                setMonth(value);
                setIndex(0);
                setStep('day');
                break;
            case 'day':
                setDay(value);
                const selectedDate = stringifyDate(year, month, value);
                setDate(selectedDate);
                submit(date);
                break;
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        const clickposition = e.clientY;
        const element = e.currentTarget;
        if (clickposition < element.clientHeight / 2) {
            setIndex(prev => Math.max(0, prev - 1));
        } else {
            setIndex(prev => Math.min(options.length - 1, prev + 1));
        }
    }


    return (
        <div className = 'form-container'>
            
        </div>
    )

}
