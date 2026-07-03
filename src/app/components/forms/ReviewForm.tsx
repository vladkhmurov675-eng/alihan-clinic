'use client'

import { useState, useRef } from 'react';
import { useToast } from '@/app/hooks/toast';
import { ReviewFormData } from '../types';
import { Star } from 'lucide-react';
import AvatarUploadForm  from './AvatarUploadForm';
import Image from 'next/image';

interface Props {
    form: ReviewFormData; 
    onChange: (form: ReviewFormData) => void;
    onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
    saving: boolean;
}

const HALF_STAR = 36;
const RATING_LENGTH = 36 * 10;

export default function ReviewForm({ form, onChange, onSubmit, saving }: Props) {
    const [showAvatarForm, setShowAvatarForm] = useState(false);
    const { showToast, ToastComponent } = useToast();

    const set = (field: keyof ReviewFormData, value: string | number) =>
        onChange({ ...form, [field]: value });
    
    const barRef = useRef<HTMLDivElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = barRef.current?.getBoundingClientRect();
        console.log(rect);
        const x = e.clientX;
        console.log(rect);
        const distance = x - rect.left;
        console.log(distance);
        const percentage = distance/rect.width;
        console.log(percentage); 
        const value = Math.round((percentage * 5)*2)/2;
        console.log(value);
        set('rating', value);
    }
    
    return (
        <div>
            {ToastComponent}
            <form onSubmit={onSubmit} className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem', borderColor: 'var(--color-accent)' }}>
                <div>
                    <Image src={form.avatar || '/avatar-default.svg'} alt={form.name} width={100} height={100} />
                    <button type="button" onClick={() => setShowAvatarForm(true)}>Загрузить фото</button>
                    {showAvatarForm && (
                        <AvatarUploadForm
                            onUpload={(url) => {
                                setShowAvatarForm(false);
                                set('avatar', url);
                            }}
                            onClose={() => setShowAvatarForm(false)}
                        />
                    )}
                </div>
                
                <div className="input-group">
                    <label className="input-label">Имя *</label>
                    <input className="form-control" style={{ width: '100%' }} required
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder="Иванов Иван"
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">Отзыв *</label>
                    <textarea className="form-control" style={{ width: '100%' }} required
                        value={form.reviewText}
                        onChange={e => set('reviewText', e.target.value)}
                        placeholder="Напишите ваш отзыв здесь..."
                    />
                </div>
                <div ref = {barRef} onClick={(e) => handleClick(e)} style = {{display: 'flex', width: 180}}>
                    {[...Array(5)].map(index => 
                        <div key = {index}> <Star size = {36}/> </div>
                    )}
                    <div>{form.rating}</div>
                </div>
            </form>
        </div>
    )
}