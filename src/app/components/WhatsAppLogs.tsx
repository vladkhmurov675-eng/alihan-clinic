'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppLogs } from '../actions';

interface LogEntry {
  id: number;
  sentAt: Date;
  recipientPhone: string;
  recipientName: string;
  message: string;
  status: string;
}

export default function WhatsAppLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const result = await getWhatsAppLogs();
      setLogs(result as LogEntry[]);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on first render
  React.useEffect(() => { fetchLogs(); }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Загрузка логов...
      </div>
    );
  }

  if (loaded && logs.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <MessageCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h3 style={{ color: 'var(--text-secondary)' }}>Журнал пуст</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Уведомления появятся после первой записи на прием.
        </p>
      </div>
    );
  }

  return (
    <div className="table-scroll" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            {['Время', 'Получатель', 'Сообщение', 'Статус'].map(h => (
              <th key={h} style={{
                padding: '0.75rem 1rem', color: 'var(--text-muted)',
                fontSize: '0.8rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                {new Date(log.sentAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </td>
              <td style={{ padding: '0.75rem 1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{log.recipientName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.recipientPhone}</div>
              </td>
              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>
                {log.message}
              </td>
              <td style={{ padding: '0.75rem 1rem' }}>
                <span className={`badge ${
                  log.status === 'SIMULATED' ? 'badge-confirmed' :
                  log.status === 'SENT' ? 'badge-completed' : 'badge-cancelled'
                }`}>
                  {log.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
