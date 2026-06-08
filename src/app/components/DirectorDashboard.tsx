'use client';

import { useState, useMemo } from 'react';
import { getDirectorStats } from '../actions';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign, Filter, RefreshCw } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────
interface Doctor { id: number; name: string; specialization: string; }
interface Procedure { id: number; name: string; price: number; }
interface Appointment {
  id: number; date: string; time: string;
  patientName: string; patientPhone: string;
  status: string; price: number;
  doctor: Doctor;
  procedure: Procedure | null;
}

// ── Constants ──────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидает', CONFIRMED: 'Подтверждён',
  COMPLETED: 'Завершён', CANCELLED: 'Отменён',
};
const STATUS_BADGE: Record<string, string> = {
  PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed',
  COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled',
};
const CHART_COLORS = ['#2d6a2d', '#4a9e4a', '#c8a96e', '#6aab9e', '#a06a2d', '#6a2d6a'];

const REVENUE_STATUSES = ['CONFIRMED', 'COMPLETED'];

// ── Helpers ────────────────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString('ru-RU') + ' ₸'; }
function fmtShort(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'М ₸';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'К ₸';
  return n + ' ₸';
}

// Custom tooltip
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border-color)',
      borderRadius: 8, padding: '0.6rem 1rem',
      boxShadow: 'var(--shadow-md)', fontSize: '0.85rem',
    }}>
      <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{typeof p.value === 'number' && p.name.includes('₸')
            ? fmt(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ── Preset buttons ─────────────────────────────────────────────
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}
const today = new Date().toISOString().split('T')[0];

const PRESETS = [
  { label: 'Сегодня', from: today, to: today },
  { label: '7 дней', from: daysAgo(6), to: today },
  { label: '30 дней', from: daysAgo(29), to: today },
  { label: '3 месяца', from: daysAgo(89), to: today },
];

// ── Main Component ─────────────────────────────────────────────
export default function DirectorDashboard({
  initialAppointments, doctors, procedures, initialFrom, initialTo,
}: {
  initialAppointments: Appointment[];
  doctors: Doctor[];
  procedures: Procedure[];
  initialFrom: string;
  initialTo: string;
}) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterProcedure, setFilterProcedure] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // ── Fetch new range ──
  async function fetchRange(f: string, t: string) {
    setLoading(true);
    try {
      const data = await getDirectorStats(f, t);
      setAppointments(data as Appointment[]);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  function applyPreset(p: { from: string; to: string }) {
    setFrom(p.from); setTo(p.to);
    fetchRange(p.from, p.to);
  }

  function applyCustomRange() { fetchRange(from, to); }

  // ── Filtered appointments ──
  const filtered = useMemo(() => appointments.filter(a => {
    if (filterDoctor && a.doctor.id !== Number(filterDoctor)) return false;
    if (filterProcedure && a.procedure?.id !== Number(filterProcedure)) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    return true;
  }), [appointments, filterDoctor, filterProcedure, filterStatus]);

  // ── Summary stats ──
  const stats = useMemo(() => {
    const revenue = filtered
      .filter(a => REVENUE_STATUSES.includes(a.status))
      .reduce((s, a) => s + (a.price || 0), 0);
    const completed = filtered.filter(a => a.status === 'COMPLETED').length;
    const avgRevenue = completed ? Math.round(revenue / completed) : 0;
    return { total: filtered.length, revenue, completed, avgRevenue };
  }, [filtered]);

  // ── Revenue by date ──
  const revenueByDate = useMemo(() => {
    const map: Record<string, { date: string; 'Выручка ₸': number; Записей: number }> = {};
    filtered.filter(a => REVENUE_STATUSES.includes(a.status)).forEach(a => {
      if (!map[a.date]) map[a.date] = { date: a.date, 'Выручка ₸': 0, Записей: 0 };
      map[a.date]['Выручка ₸'] += a.price || 0;
      map[a.date]['Записей']++;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  // ── By doctor ──
  const byDoctor = useMemo(() => {
    const map: Record<number, { name: string; Записей: number; 'Выручка ₸': number }> = {};
    filtered.forEach(a => {
      if (!map[a.doctor.id]) map[a.doctor.id] = {
        name: a.doctor.name.split(' ').slice(0, 2).join(' '),
        Записей: 0, 'Выручка ₸': 0,
      };
      map[a.doctor.id].Записей++;
      if (REVENUE_STATUSES.includes(a.status)) map[a.doctor.id]['Выручка ₸'] += a.price || 0;
    });
    return Object.values(map).sort((a, b) => b['Выручка ₸'] - a['Выручка ₸']);
  }, [filtered]);

  // ── By procedure (pie) ──
  const byProcedure = useMemo(() => {
    const map: Record<string, { name: string; value: number }> = {};
    filtered.forEach(a => {
      const key = a.procedure?.name || 'Без процедуры';
      if (!map[key]) map[key] = { name: key, value: 0 };
      map[key].value++;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [filtered]);

  // ── By status (pie) ──
  const byStatus = useMemo(() => [
    { name: 'Ожидает', value: filtered.filter(a => a.status === 'PENDING').length, color: '#d97706' },
    { name: 'Подтверждён', value: filtered.filter(a => a.status === 'CONFIRMED').length, color: '#4a9e4a' },
    { name: 'Завершён', value: filtered.filter(a => a.status === 'COMPLETED').length, color: '#2d6a2d' },
    { name: 'Отменён', value: filtered.filter(a => a.status === 'CANCELLED').length, color: '#dc2626' },
  ].filter(s => s.value > 0), [filtered]);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary), #1a4a1a)',
        padding: '2.5rem 1.5rem', color: '#fff',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.15)',
            padding: '3px 12px', borderRadius: 20,
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '0.75rem',
          }}>Кабинет руководителя</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            Аналитика клиники
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* ── Date range controls ── */}
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>

            {/* Presets */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.4rem 0.9rem', fontSize: '0.82rem',
                    background: from === p.from && to === p.to ? 'var(--color-primary)' : undefined,
                    color: from === p.from && to === p.to ? '#fff' : undefined,
                  }}
                >{p.label}</button>
              ))}
            </div>

            <div style={{ width: 1, height: 28, background: 'var(--border-color)' }} />

            {/* Custom range */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input type="date" className="form-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                value={from} max={to} onChange={e => setFrom(e.target.value)} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
              <input type="date" className="form-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                value={to} min={from} onChange={e => setTo(e.target.value)} />
              <button onClick={applyCustomRange} className="btn btn-primary"
                style={{ padding: '0.4rem 1rem', fontSize: '0.82rem', gap: '0.3rem' }}
                disabled={loading}>
                <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                {loading ? 'Загрузка...' : 'Применить'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { icon: <Calendar size={22} />, label: 'Всего записей', value: stats.total, color: 'var(--color-primary)' },
            { icon: <DollarSign size={22} />, label: 'Выручка за период', value: fmt(stats.revenue), color: 'var(--color-accent)' },
            { icon: <TrendingUp size={22} />, label: 'Завершено приёмов', value: stats.completed, color: '#c8a96e' },
            { icon: <Users size={22} />, label: 'Средний чек', value: fmt(stats.avgRevenue), color: 'var(--color-primary)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: `${s.color}15`, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Revenue area chart ── */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
            📈 Выручка по дням
          </h3>
          {revenueByDate.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Нет данных за выбранный период
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueByDate} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={fmtShort} width={60} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone" dataKey="Выручка ₸"
                  stroke="var(--color-primary)" strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Bar + Pie row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>

          {/* Bar: by doctor */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
              👨‍⚕️ По врачам
            </h3>
            {byDoctor.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Нет данных</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: byDoctor.length * 80, width: '100%' }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={byDoctor} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis
                        dataKey="name"
                        angle={0}
                        textAnchor="middle"
                        interval={0}
                        tick={{ fontSize: 12 }}
                        height={30}
                      />
                      <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={fmtShort} width={60} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} verticalAlign="bottom" height={0} align="center" />
                      <Bar yAxisId="right" dataKey="Выручка ₸" fill="var(--color-primary)" radius={[4, 4, 0, 0]} height={10} />
                      <Bar yAxisId="left" dataKey="Записей" fill="var(--color-accent)" radius={[4, 4, 0, 0]} height={10} />

                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Pie: by status */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
              📊 По статусам
            </h3>
            {byStatus.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Нет данных</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    } labelLine={true}>
                    {byStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v ?? 0, 'Записей']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie: by procedure */}
        {byProcedure.length > 0 && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
              💉 По процедурам
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byProcedure} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={85} innerRadius={40}>
                    {byProcedure.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v ?? 0, 'Записей']} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {byProcedure.map((p, i) => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{p.name}</span>
                    <span style={{ fontWeight: 700 }}>{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Appointments table with filters ── */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-primary)', margin: 0 }}>
              📋 Записи ({filtered.length})
            </h3>

            {/* Filters */}
            <div className="filter-bar" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />

              <select className="form-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
                value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)}>
                <option value="">Все врачи</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name.split(' ').slice(0, 2).join(' ')}</option>)}
              </select>

              <select className="form-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
                value={filterProcedure} onChange={e => setFilterProcedure(e.target.value)}>
                <option value="">Все процедуры</option>
                {procedures.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <select className="form-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
                value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Все статусы</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>

              {(filterDoctor || filterProcedure || filterStatus) && (
                <button className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
                  onClick={() => { setFilterDoctor(''); setFilterProcedure(''); setFilterStatus(''); }}>
                  Сбросить
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Нет записей по выбранным фильтрам
            </div>
          ) : (
            <div className="table-scroll" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    {['Дата', 'Время', 'Пациент', 'Врач', 'Процедура', 'Цена', 'Статус'].map(h => (
                      <th key={h} style={{
                        padding: '0.6rem 0.75rem', textAlign: 'left',
                        fontSize: '0.75rem', fontWeight: 700,
                        letterSpacing: '0.05em', textTransform: 'uppercase',
                        color: 'var(--text-muted)', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 100).map((a, i) => (
                    <tr key={a.id} style={{
                      borderBottom: '1px solid var(--border-color)',
                      background: i % 2 === 0 ? '#fff' : 'var(--bg-primary)',
                    }}>
                      <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>{a.date}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>{a.time}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <div style={{ fontWeight: 600 }}>{a.patientName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.patientPhone}</div>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {a.doctor.name.split(' ').slice(0, 2).join(' ')}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)' }}>
                        {a.procedure?.name || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                        {a.price ? fmt(a.price) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <span className={`badge ${STATUS_BADGE[a.status]}`}>
                          {STATUS_LABELS[a.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 100 && (
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  Показано первые 100 из {filtered.length} записей. Сузьте фильтры для точного поиска.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
