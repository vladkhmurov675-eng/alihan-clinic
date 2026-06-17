'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '../components/SearchBar';
import DoctorAvatar from '.././components/DoctorAvatar';
import DoctorCard from '../components/DoctorCard';
import { Doctor } from '../components/types';

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
  const [searchQuery, setSearchQuery] = useState('');

  // Build unique category list from actual doctors
  const categories = useMemo(() => {
    const cats = new Set(doctors.map(d => getCategory(d.specialization)));
    return ['Все', ...Array.from(cats).sort()];
  }, [doctors]);

  // Category filter first
  const categoryFiltered = useMemo(() =>
    activeCategory === 'Все' ? doctors : doctors.filter(d => getCategory(d.specialization) === activeCategory),
    [doctors, activeCategory]
  );

  // Then search filter on top of category filter
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return categoryFiltered;
    const q = searchQuery.trim().toLowerCase();
    return categoryFiltered.filter(d =>
      d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q)
    );
  }, [categoryFiltered, searchQuery]);

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
          <SearchBar<Doctor>
            items={doctors}
            placeholder="Поиск врача по имени или специализации..."
            getSearchText={doc => `${doc.name} ${doc.specialization}`}
            getDisplayValue={doc => doc.name}
            onSelect={doc => router.push(`/booking?doctorId=${doc.id}`)}
            onSearch={q => setSearchQuery(q)}
            onQueryChange={q => { if (!q) setSearchQuery(''); }}
            renderItem={(doc, active) => (
              <div
                style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <div style={{ width: 40, height: 40, flexShrink: 0 }}>
                  <DoctorAvatar avatar={doc.avatar} name={doc.name} color={getDoctorColor(doc.specialization)} />
                </div>
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
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0rem  ',
          display: 'flex', gap: '0.25rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
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
      <section style={{ maxWidth: 1200, margin: '1rem auto', padding: '1rem 1.5rem' }}>
        {searchQuery && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Результаты для: <strong>«{searchQuery}»</strong>
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', fontSize: '0.85rem', padding: 0 }}
            >
              × Сбросить
            </button>
          </div>
        )}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            {searchQuery ? `По запросу «${searchQuery}» ничего не найдено` : 'Врачи в этой категории не найдены'}
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