'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { getDirectorStats } from '../actions';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign, Filter, RefreshCw, Download,  } from 'lucide-react';
import { Appointment, Doctor, Procedure } from './types';
import SearchBar from './SearchBar';


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

// ── Responsive helper ──────────────────────────────────────────
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

// Custom tooltip
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border-color)',
      borderRadius: 8, padding: '0.6rem 1rem',
      boxShadow: 'var(--shadow-md)', fontSize: '0.85rem',
      maxWidth: 220, wordBreak: 'break-word',
    }}>
      <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{typeof p.value === 'number' && p.name.includes('₸')
            ? fmt(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  );
}

function DoctorBarTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border-color)',
      borderRadius: 8, padding: '0.6rem 0.9rem',
      boxShadow: 'var(--shadow-md)', fontSize: '0.8rem',
      maxWidth: 200, wordBreak: 'break-word',
    }}>
      <p style={{ fontWeight: 700, marginBottom: 4 }}>{data.name}</p>
      {data.specialization && <p>Специализация: {data.specialization}</p>}
      {data.education && <p>Образование: {data.education}</p>}
      <p>Записей: {data.records}</p>
      <p>Выручка: {fmt(data.revenue)}</p>
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
  doctors?: Doctor[];
  procedures?: Procedure[];
  initialFrom: string;
  initialTo: string;
}) {
  const isMobile = useIsMobile();

  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Filters
  const [searchMode, setSearchMode] = useState<
  'doctor' | 'patient' | 'procedure'
  >('doctor');

  const [searchQuery, setSearchQuery] = useState('');  
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
  const tableFiltered = useMemo(() => {
  return appointments.filter(a => {
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      switch (searchMode) {
        case 'doctor':
          if (!a.doctor.name.toLowerCase().includes(q))
            return false;
          break;

        case 'patient':
          if (!a.patientName.toLowerCase().includes(q))
            return false;
          break;

        case 'procedure':
          if (!(a.procedure?.name ?? '').toLowerCase().includes(q))
            return false;
          break;
      }
    }

    if (
      filterProcedure &&
      a.procedure?.id !== Number(filterProcedure)
    )
      return false;

    if (
      filterStatus &&
      a.status !== filterStatus
    )
      return false;

    return true;
  });
}, [
  appointments,
  searchMode,
  searchQuery,
  filterProcedure,
  filterStatus,
]);
  // ── Summary stats ──
  const stats = useMemo(() => {
    const revenue = appointments
      .filter(a => REVENUE_STATUSES.includes(a.status))
      .reduce((s, a) => s + (a.price || 0), 0);
    const completed = appointments.filter(a => a.status === 'COMPLETED').length;
    const avgRevenue = completed ? Math.round(revenue / completed) : 0;
    return { total: appointments.length, revenue, completed, avgRevenue };
  }, [appointments]);

  // ── Revenue by date ──
  const revenueByDate = useMemo(() => {
    const map: Record<string, { date: string; 'Выручка ₸': number; Записей: number }> = {};
    appointments.filter(a => REVENUE_STATUSES.includes(a.status)).forEach(a => {
      if (!map[a.date]) map[a.date] = { date: a.date, 'Выручка ₸': 0, Записей: 0 };
      map[a.date]['Выручка ₸'] += a.price || 0;
      map[a.date]['Записей']++;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [appointments]);

  // ── By doctor ──
  const byDoctor = useMemo(() => {
    const map: Record<number, { id: number; name: string; records: number; revenue: number; specialization?: string | null; education?: string | null }> = {};
    appointments.forEach(a => {
      const doc = a.doctor;
      if (!map[doc.id]) {
        map[doc.id] = {
          id: doc.id,
          name: doc.name.split(' ').slice(0, 2).join(' '),
          records: 0,
          revenue: 0,
          specialization: doc.specialization,
        };
      }
      map[doc.id].records++;
      if (REVENUE_STATUSES.includes(a.status)) map[doc.id].revenue += a.price || 0;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [appointments]);

  // ── By procedure (pie) ──
  const byProcedure = useMemo(() => {
    const map: Record<string, { name: string; value: number }> = {};
    appointments.forEach(a => {
      const key = a.procedure?.name || 'Без процедуры';
      if (!map[key]) map[key] = { name: key, value: 0 };
      map[key].value++;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [appointments]);

  // ── By status (pie) ──
  const byStatus = useMemo(() => [
    { name: 'Ожидает', value: appointments.filter(a => a.status === 'PENDING').length, color: '#d97706' },
    { name: 'Подтверждён', value: appointments.filter(a => a.status === 'CONFIRMED').length, color: '#4a9e4a' },
    { name: 'Завершён', value: appointments.filter(a => a.status === 'COMPLETED').length, color: '#2d6a2d' },
    { name: 'Отменён', value: appointments.filter(a => a.status === 'CANCELLED').length, color: '#dc2626' },
  ].filter(s => s.value > 0), [appointments]);

  // ── Dedupe by whatever the current search mode is keyed on ──
const searchItems = useMemo(() => {
  const seen = new Set<string>();
  const result: Appointment[] = [];
  for (const a of appointments) {
    const key =
      searchMode === 'doctor' ? String(a.doctor.id) :
      searchMode === 'patient' ? a.patientPhone :
      a.procedure ? String(a.procedure.id) : '__none__';
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(a);
  }
  return result;
}, [appointments, searchMode]);

  const exportPDF = useCallback(async() => {
    setPdfLoading(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { DirectorPDFDocument } = await import('./DirectorPDFReport');
      const blob = await pdf(
        <DirectorPDFDocument
          from={from}
          to={to}
          stats={stats}
          byDoctor={byDoctor}
          byProcedure={byProcedure}
          byStatus={byStatus}
          appointments={tableFiltered}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `отчет_клиники_${from}_${to}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setPdfLoading(false);
    }
  }, [from, to, stats, byDoctor, byProcedure, byStatus, tableFiltered]);


  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary), #1a4a1a)',
        padding: isMobile ? '1.75rem 1.25rem' : '2.5rem 1.5rem', color: '#fff',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.15)',
            padding: '3px 12px', borderRadius: 20,
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '0.75rem',
          }}>Кабинет руководителя</div>
          <h1 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            Аналитика клиники
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '1.5rem 1rem 3rem' : '2rem 1.5rem 4rem' }}>

        {/* ── Date range controls ── */}
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
            alignItems: isMobile ? 'stretch' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
          }}>

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
            {/* Custom range */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
              width: isMobile ? '100%' : 'auto',
            }}>
              <input type="date" className="form-control" style={{ width: isMobile ? 0 : 'auto', flex: isMobile ? 1 : undefined, padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                value={from} max={to} onChange={e => setFrom(e.target.value)} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
              <input type="date" className="form-control" style={{ width: isMobile ? 0 : 'auto', flex: isMobile ? 1 : undefined, padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                value={to} min={from} onChange={e => setTo(e.target.value)} />
              <button onClick={applyCustomRange} className="btn btn-primary"
                style={{ padding: '0.4rem 1rem', fontSize: '0.82rem', gap: '0.3rem', width: isMobile ? '100%' : undefined, justifyContent: 'center' }}
                disabled={loading}>
                <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                {loading ? 'Загрузка...' : 'Применить'}
              </button>
            </div>

            {/* PDF Export Button */}
            <button
              onClick={exportPDF}
              className="btn btn-accent"
              style={{
                padding: '0.4rem 1rem', fontSize: '0.82rem', gap: '0.4rem',
                marginLeft: isMobile ? 0 : 'auto',
                width: isMobile ? '100%' : undefined,
                justifyContent: 'center',
              }}
              disabled={pdfLoading}
            >
              {pdfLoading ? (
                <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Download size={14} />
              )}
              {pdfLoading ? 'Формирование PDF...' : 'Экспорт PDF'}
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: isMobile ? '0.75rem' : '1rem', marginBottom: '1.5rem',
        }}>
          {[
            { icon: <Calendar size={22} />, label: 'Всего записей', value: stats.total, color: 'var(--color-primary)' },
            { icon: <DollarSign size={22} />, label: 'Выручка за период', value: fmt(stats.revenue), color: 'var(--color-accent)' },
            { icon: <TrendingUp size={22} />, label: 'Завершено приёмов', value: stats.completed, color: '#c8a96e' },
            { icon: <Users size={22} />, label: 'Средний чек', value: fmt(stats.avgRevenue), color: 'var(--color-primary)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: isMobile ? '1rem' : '1.25rem', display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1rem' }}>
              <div style={{
                width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: 12, flexShrink: 0,
                background: `${s.color}15`, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{s.icon}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: isMobile ? '1.1rem' : '1.4rem', fontWeight: 800, color: s.color, lineHeight: 1.15 }}>{s.value}</div>
                <div style={{ fontSize: isMobile ? '0.72rem' : '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Revenue area chart ── */}
        <div className="card" style={{ padding: isMobile ? '1.1rem' : '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
            📈 Выручка по дням
          </h3>
          {revenueByDate.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Нет данных за выбранный период
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 240}>
              <AreaChart data={revenueByDate} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" tick={{ fontSize: isMobile ? 9 : 11 }} tickFormatter={d => d.slice(5)} interval={isMobile ? 'preserveStartEnd' : 0} />
                <YAxis tick={{ fontSize: isMobile ? 9 : 11 }} tickFormatter={fmtShort} width={isMobile ? 46 : 60} />
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
          <div className="card" style={{ padding: isMobile ? '1.1rem' : '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
              👨‍⚕️ По врачам
            </h3>
            {byDoctor.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Нет данных</div>
            ) : (
              <div style={{ overflowX: isMobile && byDoctor.length <= 4 ? 'visible' : 'auto' }}>
                <div style={{
                  minWidth: isMobile && byDoctor.length <= 4 ? '100%' : byDoctor.length * 80,
                  width: '100%',
                }}>
                  <ResponsiveContainer width="100%" height={isMobile ? 240 : 220}>
                    <BarChart data={byDoctor} margin={{ top: 5, right: 10, left: 0, bottom: isMobile ? 45 : 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis
                        dataKey="name"
                        angle={isMobile ? -35 : 0}
                        textAnchor={isMobile ? 'end' : 'middle'}
                        interval={0}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        height={isMobile ? 55 : 30}
                      />
                      <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11 }} width={isMobile ? 28 : undefined} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={fmtShort} width={isMobile ? 46 : 60} />
                      <Tooltip content={<DoctorBarTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} verticalAlign="bottom" height={0} align="center" />
                      <Bar yAxisId="right" dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} height={10} />
                      <Bar yAxisId="left" dataKey="records" fill="var(--color-accent)" radius={[4, 4, 0, 0]} height={10} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Pie: by status */}
          <div className="card" style={{ padding: isMobile ? '1.1rem' : '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
              📊 По статусам
            </h3>
            {byStatus.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Нет данных</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={isMobile ? 70 : 80}
                      label={isMobile ? false : ({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      } labelLine={!isMobile}>
                      {byStatus.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [v ?? 0, 'Записей']} />
                  </PieChart>
                </ResponsiveContainer>
                {isMobile && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem' }}>
                    {byStatus.map(s => (
                      <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                        <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{s.name}</span>
                        <span style={{ fontWeight: 700 }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Pie: by procedure */}
        {byProcedure.length > 0 && (
          <div className="card" style={{ padding: isMobile ? '1.1rem' : '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
              💉 По процедурам
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem', alignItems: 'center',
            }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byProcedure} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={isMobile ? 75 : 85} innerRadius={isMobile ? 35 : 40}>
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
        <div className="card" style={{ padding: isMobile ? '1.1rem' : '1.5rem' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem',
          }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-primary)', margin: 0 }}>
              📋 Записи ({appointments.length})
            </h3>

            {/* Filters */}
            <div className="filter-bar" style={{
              display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center',
              width: isMobile ? '100%' : undefined,
            }}>
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />

              {/* Search */}
              <div style={{
                display: 'flex', gap: '0.5rem', alignItems: 'center',
                width: isMobile ? '100%' : undefined,
                flexDirection: isMobile ? 'column' : 'row',
              }}>

  {/* Mode selector */}
  <select
    className="form-control"
    value={searchMode}
    onChange={(e) => setSearchMode(e.target.value as 'doctor' | 'patient' | 'procedure')}
    style={{
      width: isMobile ? '100%' : 140,
      padding: '0.4rem 0.6rem',
      fontSize: '0.82rem'
    }}
  >
    <option value="doctor">По врачам</option>
    <option value="patient">По пациентам</option>
    <option value="procedure">По процедурам</option>
  </select>

  {/* Your existing SearchBar */}
  <div style={{ position: 'relative', width: isMobile ? '100%' : '220px', zIndex: 5 }}>
    <SearchBar<Appointment>
      items={searchItems}
      placeholder={
        searchMode === 'doctor'
          ? 'Поиск врача...'
          : searchMode === 'patient'
          ? 'Поиск пациента...'
          : 'Поиск процедуры...'
      }
      query={searchQuery}
      onQueryChange={setSearchQuery}
      getSearchText={(a) => {
        if (searchMode === 'doctor')
          return a.doctor.name + ' ' + (a.doctor.specialization ?? '');
        if (searchMode === 'patient')
          return a.patientName + ' ' + a.patientPhone;
        return a.procedure?.name ?? '';
      }}
      getDisplayValue={(a) => {
        if (searchMode === 'doctor') return a.doctor.name;
        if (searchMode === 'patient') return a.patientName;
        return a.procedure?.name ?? '—';
      }}
      onSelect={() => {
        // IMPORTANT: no more filterDoctor logic
        // selection is optional now, not a filter lock
      }}
    />
  </div>
</div>

              <select className="form-control" style={{ width: isMobile ? '100%' : 'auto', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
                value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Все статусы</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>

              {(filterProcedure || filterStatus || searchQuery) && (
                <button className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem', width: isMobile ? '100%' : undefined }}
                  onClick={() => { setSearchQuery(''); setFilterProcedure(''); setFilterStatus(''); }}>
                  Сбросить
                </button>
              )}
            </div>
            {tableFiltered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Нет записей по выбранным фильтрам
              </div>
            ) : isMobile ? (
              /* ── Mobile: stacked cards instead of a table ── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tableFiltered.slice(0, 100).map(a => (
                  <div key={a.id} style={{
                    padding: '0.9rem', borderRadius: 10,
                    border: '1px solid var(--border-color)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700 }}>{a.patientName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.patientPhone}</div>
                      </div>
                      <span className={`badge ${STATUS_BADGE[a.status]}`} style={{ flexShrink: 0 }}>
                        {STATUS_LABELS[a.status]}
                      </span>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {a.date} · {a.time}
                    </div>
                    <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {a.doctor.name.split(' ').slice(0, 2).join(' ')}
                      {a.procedure?.name && <> · {a.procedure.name}</>}
                    </div>
                    {a.price ? (
                      <div style={{ marginTop: '0.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {fmt(a.price)}
                      </div>
                    ) : null}
                  </div>
                ))}
                {tableFiltered.length > 100 && (
                  <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Показано первые 100 из {tableFiltered.length} записей. Сузьте фильтры для точного поиска.
                  </p>
                )}
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
                    {tableFiltered.slice(0, 100).map((a, i) => (
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
                {tableFiltered.length > 100 && (
                  <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                    Показано первые 100 из {tableFiltered.length} записей. Сузьте фильтры для точного поиска.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}