'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { generateOTP, verifyOTP } from '../../actions';
import { useToast } from '../../hooks/toast';

interface OTPFormProps {
  phone: string;
  onVerified: (success: boolean) => void;
  onCancel?: () => void;
  /** Label shown above the input — lets the caller explain context
   *  ("Подтвердите запись" vs "Подтвердите смену пароля") without
   *  this component knowing anything about *why* it's being shown. */
  title?: string;
  description?: string;
}

const CODE_LENGTH = 4;
const RESEND_COOLDOWN_SECONDS = 30;

/**
 * Purely presentational + self-contained OTP entry flow.
 *
 * On mount: requests a code be sent to `phone` via generateOTP().
 * On submit: calls verifyOTP() and reports the boolean result up
 * through onVerified — the caller decides what success/failure means
 * (confirm a booking, allow a password change, etc). This component
 * has zero knowledge of that context, by design — it's reusable
 * anywhere a phone needs to be verified.
 */
export default function OTPForm({ phone, onVerified, onCancel, title, description }: OTPFormProps) {
  const { showToast, ToastComponent } = useToast();

  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [sentOnce, setSentOnce] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback((seconds: number) => {
    setCooldown(seconds);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const requestCode = useCallback(async () => {
    setSending(true);
    setError('');
    try {
      const result = await generateOTP(phone);
      if (result.success) {
        setSentOnce(true);
        startCooldown(RESEND_COOLDOWN_SECONDS);
        showToast('Код отправлен в WhatsApp');
        inputRef.current?.focus();
      } else {
        setError(result.error || 'Не удалось отправить код');
        if (result.cooldownMs) {
          startCooldown(Math.ceil(result.cooldownMs / 1000));
        }
      }
    } catch {
      setError('Ошибка сервера. Попробуйте ещё раз.');
    } finally {
      setSending(false);
    }
  }, [phone, showToast, startCooldown]);

  // Send a code automatically the first time this form appears
  useEffect(() => {
    requestCode();
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digitsOnly);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== CODE_LENGTH) {
      setError(`Введите ${CODE_LENGTH}-значный код`);
      return;
    }

    setVerifying(true);
    setError('');
    try {
      const result = await verifyOTP(phone, code);
      if (result.success) {
        showToast('Подтверждено');
        onVerified(true);
      } else {
        setError(result.error || 'Неверный код');
        setCode('');
        inputRef.current?.focus();
      }
    } catch {
      setError('Ошибка сервера. Попробуйте ещё раз.');
    } finally {
      setVerifying(false);
    }
  };

  const canResend = sentOnce && cooldown === 0 && !sending;

  return (
    <div className="card" style={{ padding: '2rem', maxWidth: 380, width: '100%', alignItems: 'center' }}>
      {ToastComponent}

      <h3 style={{ marginBottom: '0.4rem' }}>{title || 'Подтверждение по коду'}</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {description || `Мы отправили код подтверждения на WhatsApp номер ${phone}`}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="form-control"
            style={{
              width: '100%',
              textAlign: 'center',
              fontSize: '1.4rem',
              fontWeight: 700,
              letterSpacing: '0.5rem',
              borderColor: error ? 'var(--color-danger)' : undefined,
            }}
            placeholder={'•'.repeat(CODE_LENGTH)}
            value={code}
            onChange={e => handleCodeChange(e.target.value)}
            disabled={sending}
            maxLength={CODE_LENGTH}
            autoFocus
          />
        </div>

        {error && (
          <p style={{ color: 'var(--color-danger)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
            ⚠ {error}
          </p>
        )}

        <button
          type="submit"
          disabled={verifying || sending || code.length !== CODE_LENGTH}
          className={`btn ${verifying || sending || code.length !== CODE_LENGTH ? 'btn-disabled' : 'btn-primary'}`}
          style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }}
        >
          {verifying ? 'Проверка...' : 'Подтвердить'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={requestCode}
            disabled={!canResend}
            style={{
              background: 'none', border: 'none', cursor: canResend ? 'pointer' : 'default',
              color: canResend ? 'var(--color-primary)' : 'var(--text-muted)',
              fontSize: '0.82rem', fontWeight: 600, padding: 0,
            }}
          >
            {sending
              ? 'Отправка...'
              : cooldown > 0
              ? `Отправить новый код (${cooldown}с)`
              : 'Отправить новый код'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', padding: 0 }}
            >
              Отмена
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
