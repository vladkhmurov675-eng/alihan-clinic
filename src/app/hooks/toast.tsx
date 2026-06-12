'use client';

import { useState, useCallback } from 'react';

export interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const ToastComponent = toast ? (
    <div style={{
      position: 'fixed', top: '80px', right: '20px', zIndex: 9999,
      padding: '0.75rem 1.25rem', borderRadius: '10px',
      background: toast.type === 'success' ? 'var(--color-primary)' : 'var(--color-danger)',
      color: '#fff', fontWeight: 600, fontSize: '0.9rem',
      boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
      animation: 'fadeIn 0.3s ease',
    }}>
      {toast.message}
    </div>
  ) : null;

  return { showToast, ToastComponent };
}
