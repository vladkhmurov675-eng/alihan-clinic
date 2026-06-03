'use client';

import { useState, type SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { login } from '../actions';

export default function LoginPage() {
    const router = useRouter();

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);

    async function handleSubmit(
        e: SyntheticEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setLoggingIn(true);
        setError('');

        try {
            const result = await login(phone, password);

            if (!result.success) {
                setError(result.error || 'Ошибка входа');
                return;
            }

            if (result.role === 'doctor') {
                router.push('/doctor');
                return;
            }

            if (result.role === 'admin') {
                router.push('/admin');
                return;
            }
        } catch (err) {
            console.error(err);
            setError('Ошибка сервера');
        } finally {
            setLoggingIn(false);
        }
    }

    return (
        <div
            className="container"
            style={{
                paddingTop: '4rem',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <div
                className="glass-panel animate-fade-in"
                style={{
                    padding: '3rem',
                    maxWidth: '420px',
                    width: '100%',
                }}
            >
                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: '2rem',
                    }}
                >
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background:
                                'linear-gradient(135deg, var(--color-accent-glow) 0%, var(--color-primary-glow) 100%)',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem auto',
                        }}
                    >
                        <Lock
                            size={28}
                            style={{ color: 'var(--color-accent)' }}
                        />
                    </div>

                    <h2
                        style={{
                            fontSize: '1.5rem',
                            marginBottom: '0.5rem',
                        }}
                    >
                        Вход в систему для сотрудников
                    </h2>

                    <p
                        style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                        }}
                    >
                        Введите телефонный номер и пароль
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">
                            Номер телефона
                        </label>

                        <input
                            type="phone"
                            className="form-control"
                            style={{ width: '100%' }}
                            placeholder="+77001234567"
                            value={phone}
                            onChange={e =>
                                setPhone(e.target.value)
                            }
                            autoFocus
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            Пароль
                        </label>

                        <input
                            type="password"
                            className="form-control"
                            style={{ width: '100%' }}
                            placeholder="Введите пароль"
                            value={password}
                            onChange={e =>
                                setPassword(e.target.value)
                            }
                        />
                    </div>

                    {error && (
                        <div
                            style={{
                                background:
                                    'var(--color-danger-glow)',
                                border:
                                    '1px solid var(--color-danger)',
                                color: '#f87171',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                marginBottom: '1rem',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={
                            loggingIn ||
                            !phone ||
                            !password
                        }
                        className={`btn ${loggingIn ||
                            !phone ||
                            !password
                            ? 'btn-disabled'
                            : 'btn-accent'
                            }`}
                        style={{
                            width: '100%',
                            padding: '0.85rem',
                        }}
                    >
                        {loggingIn
                            ? 'Входим...'
                            : 'Войти'}
                    </button>
                </form>
            </div>
        </div>
    );
}