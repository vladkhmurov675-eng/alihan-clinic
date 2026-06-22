import {useState, useRef, useEffect, TouchEvent, WheelEvent, MouseEvent} from 'react';

interface Props{
    onSubmit: (time: string) => void;
    onCancel: () => void;
    value: string;
}

const HOURS = Array.from({length: 24}, (_, i) => 
    i.toString().padStart(2,"0")
);

const MINUTES = Array.from({length: 60}, (_, i) => 
    i.toString().padStart(2,"0")
);

const ITEM_HEIGHT = 40;

export default function TimePicker({onSubmit, onCancel, value}: Props){
    const [hour, setHour] = useState('00');
    const [minutes, setMinutes] = useState('00');
    const [draggingWheel, setDraggingWheel] = useState<"hour" | "minute" | null>(null);
    const [isDragging, setDragging] = useState(false);
    const [translateY, setTranslateY] = useState(0);
    const [index, setIndex] = useState(0);
    const wheelRef = useRef<HTMLDivElement>;

    const handleMouseDown = (e: MouseEvent) => {
        const y = e.clientY;
        

    }




    useEffect(() => {

    })


}


