'use client';

import React from 'react';
import { TooltipProps } from 'recharts';

export default function DoctorBarTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div style={{ background: 'var(--bg-primary)', padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', minWidth: 150 }}>
      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{data.name}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Записей: {data.records}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Выручка: {data.revenue}</div>
    </div>
  );
}
