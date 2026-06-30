'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { login } from '../actions';
import OTPForm from '../components/forms/OTPForm';
import Link from 'next/link';

const KZ_PHONE_REGEX = /^\+7\d{10}$/;

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const trimmed = digits.startsWith('7') ? digits.slice(0, 11) : `7${digits}`.slice(0, 11);
  return `+${trimmed}`;
}

function validatePhone(value: string): string | null {
  if (!value || value === '+7') return 'Введите номер телефона';
  if (!KZ_PHONE_REGEX.test(value)) return 'Формат: +7XXXXXXXXXX (11 цифр)';
  return null;
}

export default function LoginPage() {
  const router = useRouter();

  const [phone,      setPhone]      = useState('+7');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [error,      setError]      = useState('');
  const [loggingIn,  setLoggingIn]  = useState(false);
  
  
  function handlePhoneChange(raw: string) {
    const normalized = normalizePhone(raw);
    setPhone(normalized);
    setPhoneError('');
    setError('');
  }

  function handlePhoneBlur() {
    const err = validatePhone(phone);
    if (err) setPhoneError(err);
  }

  const isPhoneComplete = KZ_PHONE_REGEX.test(phone);
  const canSubmit = isPhoneComplete && password.length > 0 && !loggingIn;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const phoneErr = validatePhone(phone);
    if (phoneErr) { setPhoneError(phoneErr); return; }
    if (!password) { setError('Введите пароль'); return; }

    setLoggingIn(true);
    try {
      const result = await login(phone, password);

      if (!result.success) {
        setError(result.error || 'Неверный номер телефона или пароль');
        return;
      }

      router.refresh();
      if (result.role === 'doctor')   { router.push('/doctor');   return; }
      if (result.role === 'admin')    { router.push('/admin');     return; }
      if (result.role === 'director') { router.push('/director');  return; }

    } catch {
      setError('Ошибка сервера. Попробуйте ещё раз.');
    } finally {
      setLoggingIn(false);
    }
  }

  // Live digit counter
  const digitCount = phone.replace(/\D/g, '').length;

  return (
    <div style={{
      background: 'var(--bg-primary)', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div className="card animate-fade-in" style={{ padding: '2.5rem', maxWidth: 420, width: '100%' }}>

        {/* Icon + title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'var(--color-primary-glow)',
            border: '1px solid rgba(45,106,45,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <Lock size={26} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>Вход для сотрудников</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Введите номер телефона и пароль
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Phone */}
          <div className="input-group">
            <label className="input-label">Номер телефона</label>
            <div style={{ position: 'relative' }}>
              <Phone size={15} style={{
                position: 'absolute', left: 12, top: 14,
                color: phoneError ? 'var(--color-danger)' : 'var(--text-muted)',
              }} />
              <input
                type="tel"
                className="form-control"
                style={{
                  width: '100%',
                  paddingLeft: '2.25rem',
                  paddingRight: '3rem',
                  borderColor: phoneError ? 'var(--color-danger)' : isPhoneComplete ? 'var(--color-primary)' : undefined,
                  boxShadow: phoneError
                    ? '0 0 0 3px var(--color-danger-glow)'
                    : isPhoneComplete
                    ? '0 0 0 3px var(--color-primary-glow)'
                    : undefined,
                }}
                placeholder="+77001234567"
                value={phone}
                onChange={e => handlePhoneChange(e.target.value)}
                onBlur={handlePhoneBlur}
                autoFocus
                autoComplete="tel"
                maxLength={12}
              />
              {/* Digit counter */}
              <span style={{
                position: 'absolute', right: 12, top: 14,
                fontSize: '0.72rem', fontWeight: 600,
                color: isPhoneComplete ? 'var(--color-primary)' : 'var(--text-muted)',
              }}>
                {digitCount}/11
              </span>
            </div>

            {phoneError ? (
              <span style={{ fontSize: '0.78rem', color: 'var(--color-danger)', marginTop: 4 }}>
                ⚠ {phoneError}
              </span>
            ) : isPhoneComplete ? (
              <span style={{ fontSize: '0.78rem', color: 'var(--color-primary)', marginTop: 4 }}>
                ✓ Номер введён корректно
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Формат: +7XXXXXXXXXX
              </span>
            )}
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label">Пароль</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control"
                style={{ width: '100%', paddingLeft: '2.25rem', paddingRight: '2.75rem' }}
                placeholder="Введите пароль"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: 10, top: 11,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 4,
                }}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <Link href='login/forgotpassword'>Забыли пароль?</Link>

            </div>
          </div>

          {/* Server error */}
          {error && (
            <div style={{
              background: 'var(--color-danger-glow)',
              border: '1px solid var(--color-danger)',
              color: 'var(--color-danger)',
              padding: '0.75rem 1rem', borderRadius: 8,
              fontSize: '0.85rem', marginBottom: '1rem',
            }}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`btn ${canSubmit ? 'btn-primary' : 'btn-disabled'}`}
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
          >
            {loggingIn ? 'Входим...' : 'Войти →'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', fontSize: '0.78rem',
          color: 'var(--text-muted)', marginTop: '1.25rem', lineHeight: 1.5,
        }}>
          Только для сотрудников клиники.<br />
          Если забыли пароль — обратитесь к администратору.
        </p>
      </div>
    </div>
  );
}



