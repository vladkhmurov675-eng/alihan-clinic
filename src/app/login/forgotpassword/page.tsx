'use client'
import {useState} from 'react';
import { changePassword, hasFoundPhoneNumber } from '../../actions';
import OTPForm from '../../components/forms/OTPForm';
import { useToast } from '@/app/hooks/toast';
import Link from 'next/link';
import { Eye, EyeOff, Phone, Lock } from 'lucide-react';
const Shell = ({ children }: { children: React.ReactNode }) => (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--bg-primary)',
        }}>
            <div className="card" style={{ padding: '2.5rem', width: '100%', maxWidth: 420 }}>
                {children}
            </div>
        </div>
    );
export default function ForgotPassword() {
    const [phone, setPhone] = useState<string>('+7');
    const [step, setStep] = useState<'phone'|'otp'|'change'|'success'>('phone');
    const [password, setPassword] = useState<string>('');
    const [passwordRepeat, setPasswordRepeat] = useState<string>('');
    const [showPass, setShowPass] = useState<boolean>(false);
    const {showToast, ToastComponent} = useToast(); 
    
    const handlePhoneSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(await hasFoundPhoneNumber(phone) === true){
            setStep('otp');
        } else {
            showToast('Ошибка! Не найден телефонный номер в базе данных', 'error')
        }
    }
    
    const handlePasswordChange = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password === passwordRepeat){
            await changePassword(phone, password);
            setStep('success');
        } else {
            showToast('Ошибка! Пароли не совпадают', 'error');
        }
    }

    // ── Shared page shell ──
    

    if (step === 'phone') {
        return (
            <Shell>
                {ToastComponent}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 14, margin: '0 auto 1rem',
                        background: 'var(--color-primary-glow)',
                        border: '1px solid rgba(45,106,45,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Phone size={24} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>Восстановление пароля</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Только для администраторов и директоров.
                        Если вы — врач, обратитесь к вашему администратору.
                    </p>
                </div>

                <form onSubmit={(e) => handlePhoneSubmit(e)}>
                    <div className="input-group">
                        <label className="input-label">Номер телефона</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={15} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="form-control"
                                style={{ width: '100%', paddingLeft: '2.25rem' }}
                                placeholder="+77001234567"
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
                        Далее →
                    </button>
                </form>
            </Shell>
        );
    }

    if (step === 'otp') {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                background: 'var(--bg-primary)',
            }}>
                <OTPForm
                    phone={phone}
                    onVerified={() => setStep('change')}
                    onCancel={() => setStep('phone')}
                />
            </div>
        );
    }

    if (step === 'change') {
        return (
            <Shell>
                {ToastComponent}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 14, margin: '0 auto 1rem',
                        background: 'var(--color-primary-glow)',
                        border: '1px solid rgba(45,106,45,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Lock size={24} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>Новый пароль</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Введите и повторите новый пароль
                    </p>
                </div>

                <form onSubmit={(e) => handlePasswordChange(e)}>
                    <div className="input-group">
                        <label className="input-label">Новый пароль</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-control"
                                style={{ width: '100%', paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                                placeholder="Новый пароль"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(p => !p)}
                                style={{ position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Повторите пароль</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={passwordRepeat}
                                onChange={(e) => setPasswordRepeat(e.target.value)}
                                className="form-control"
                                style={{ width: '100%', paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                                placeholder="Повторите пароль"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(p => !p)}
                                style={{ position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
                        Сохранить пароль
                    </button>
                </form>
            </Shell>
        );
    }

    if (step === 'success') {
        return (
            <Shell>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%', margin: '0 auto 1.25rem',
                        background: 'var(--color-primary-glow)',
                        border: '2px solid var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.75rem',
                    }}>
                        ✓
                    </div>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Пароль изменён</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Вы можете войти в систему с новым паролем.
                    </p>
                    <Link href="." className="btn btn-primary" style={{ display: 'inline-block', padding: '0.75rem 2rem' }}>
                        ← На страницу входа
                    </Link>
                </div>
            </Shell>
        );
    }
}