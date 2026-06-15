'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '../components/SearchBar';
import DoctorAvatar from '.././components/DoctorAvatar';
import DoctorCard from '../components/DoctorCard';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  avatar: string | null;
  education: string;
  experienceYears: number;
  description: string;
  workStartTime: string;
  workEndTime: string;
  slotDuration: number;
}

function getDoctorColor(spec: string) {
  if (spec.includes('Терап')) return '#1a4a6b';
  if (spec.includes('Невро')) return '#2d7a5f';
  if (spec.includes('Процедур')) return '#7a5c2e';
  return '#4f46e5';
}

// Group specializations into broader categories
function getCategory(spec: string): string {
  const s = spec.toLowerCase();
  if (s.includes('терап') || s.includes('педиатр') || s.includes('семейн')) return 'Терапия';
  if (s.includes('невр') || s.includes('невропатол')) return 'Неврология';
  if (s.includes('процедур') || s.includes('медсестр')) return 'Процедурный';
  if (s.includes('хирург')) return 'Хирургия';
  if (s.includes('кардио')) return 'Кардиология';
  if (s.includes('стоматол') || s.includes('зубн')) return 'Стоматология';
  if (s.includes('гинекол') || s.includes('акушер')) return 'Гинекология';
  if (s.includes('эндокрин')) return 'Эндокринология';
  if (s.includes('офтальм') || s.includes('окулист')) return 'Офтальмология';
  if (s.includes('лор') || s.includes('отоларинг')) return 'ЛОР';
  if (s.includes('уролог')) return 'Урология';
  if (s.includes('дерматол')) return 'Дерматология';
  return 'Другое';
}

export default function DoctorsListClient({ doctors }: { doctors: Doctor[] }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('Все');

  // Build unique category list from actual doctors
  const categories = useMemo(() => {
    const cats = new Set(doctors.map(d => getCategory(d.specialization)));
    return ['Все', ...Array.from(cats).sort()];
  }, [doctors]);

  const filtered = useMemo(() =>
    activeCategory === 'Все' ? doctors : doctors.filter(d => getCategory(d.specialization) === activeCategory),
    [doctors, activeCategory]
  );

  return (
    <div style={{ background: 'var(--bg-primary)' }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1a4a6b, #2d7a5f)',
        padding: '3.5rem 1.5rem', textAlign: 'center', color: '#000000',
      }}>
        <div className="section-label" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.75rem', display: 'block' }}>
          Наша команда
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>
          Врачи клиники «Алихан»
        </h1>
        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', maxWidth: 500, margin: '0 auto' }}>
          Опытные специалисты с многолетней практикой. Запишитесь онлайн прямо сейчас.
        </p>

        {/* Search inside hero */}
        <div style={{ maxWidth: 480, margin: '1.5rem auto 0' }}>
          <SearchBar
            items={doctors}
            placeholder="Поиск врача по имени или специализации..."
            searchFn={(doc, q) =>
              doc.name.toLowerCase().includes(q) ||
              doc.specialization.toLowerCase().includes(q)
            }
            renderItem={doc => (
              <div
                style={{ padding: '0.75rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                onClick={() => router.push(`/booking?doctorId=${doc.id}`)}
              >
                <DoctorAvatar avatar={doc.avatar} name={doc.name} size={36} color={getDoctorColor(doc.specialization)} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{doc.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.specialization}</div>
                </div>
              </div>
            )}
          />
        </div>
      </section>

      {/* Category tabs */}
      <div style={{
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-primary)',
        position: 'relative', top: 60, zIndex: 10,
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex', gap: '0.25rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {categories.map(cat => {
            const count = cat === 'Все' ? doctors.length : doctors.filter(d => getCategory(d.specialization) === cat).length;
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0,
                  padding: '0.85rem 1.1rem',
                  background: 'none', border: 'none',
                  borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
                  color: active ? 'var(--color-primary)' : 'var(--text-muted)',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.88rem', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                  marginBottom: -1,
                }}
              >
                {cat}
                <span style={{
                  marginLeft: '0.4rem',
                  fontSize: '0.75rem',
                  background: active ? 'var(--color-primary)' : 'var(--bg-secondary)',
                  color: active ? '#fff' : 'var(--text-muted)',
                  borderRadius: 20, padding: '1px 7px',
                  transition: 'all 0.15s',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Doctors grid */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Врачи в этой категории не найдены
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {filtered.map(d => (
              <DoctorCard key={d.id} doctor={d} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section style={{
        background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)',
        padding: '3rem 1.5rem', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Не знаете, к какому врачу идти?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Позвоните нам или напишите в WhatsApp — мы поможем выбрать специалиста.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="tel:+77273217788" className="btn btn-primary">📞 Позвонить</a>
          <a href="https://wa.me/77019998877" className="btn btn-outline">💬 WhatsApp</a>
        </div>
      </section>
    </div>
  );
}