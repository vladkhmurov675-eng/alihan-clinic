'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchBar  from '../components/SearchBar';
import DoctorAvatar from '.././components/DoctorAvatar';
import DoctorCard from '../components/DoctorCard';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  avatar: string;
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

export default function DoctorsListClient({ doctors }: { doctors: Doctor[] }) {
  const router = useRouter();

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

      {/* Doctors list */}
<section style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {doctors.map(d => (
          <DoctorCard key={d.id} doctor={d} />
        ))}
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