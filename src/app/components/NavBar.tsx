'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { logout, getSessionRole } from '../actions';
import { LogOut, Stethoscope, ShieldCheck, BarChart2, LogIn, Menu, X } from 'lucide-react';

const PUBLIC_NAV = [
  { label: 'Главная', href: '/' },
  { label: 'О клинике', href: '/about' },
  { label: 'Врачи', href: '/doctors' },
  { label: 'Услуги', href: '/services' },
  { label: 'Процедурный кабинет', href: '/procedures' },
  { label: 'Онлайн-запись', href: '/booking' },
  { label: 'Контакты', href: '/contacts' },
];

const ROLE_META = {
  doctor: { label: 'Кабинет врача', href: '/doctor?tab=settings', icon: <Stethoscope size={15} />, bg: '#dcfce7', color: '#166534' },
  admin: { label: 'Администратор', href: '/admin', icon: <ShieldCheck size={15} />, bg: '#dbeafe', color: '#1e40af' },
  director: { label: 'Руководитель', href: '/director', icon: <BarChart2 size={15} />, bg: '#fef9c3', color: '#854d0e' },
} as const;

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<'doctor' | 'admin' | 'director' | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getSessionRole().then(r => { setRole(r); setLoading(false); });
  }, [pathname]);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  async function handleLogout() {
    await logout();
    setRole(null);
    router.push('/');
    router.refresh();
  }

  const meta = role ? ROLE_META[role] : null;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(244,248,244,0.97)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
    }}>
      {/* ── Top bar ── */}
      <div style={{
        background: 'var(--color-primary)',
        padding: '0 1.5rem',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '0.75rem',
        height: 32,
      }}>
        {!loading && (
          meta ? (
            <>
              <Link href={meta.href} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: meta.bg, color: meta.color,
                padding: '2px 10px', borderRadius: 9999,
                fontSize: '0.85rem', fontWeight: 700,
                letterSpacing: '0.04em', textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}>
                {meta.icon}{meta.label}
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>|</span>
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.85rem', fontWeight: 700,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                padding: 0,
              }}>
                <LogOut size={15} /> Выйти
              </button>
            </>
          ) : (
            <Link href="/login" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.85rem', fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              textDecoration: 'none',
            }}>
              <LogIn size={12} /> Вход для сотрудников
            </Link>
          )
        )}
      </div>

      {/* ── Main nav ── */}
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        height: 60,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <span style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '1.1rem',
            boxShadow: '0 2px 10px rgba(0,175,190,0.25)',
            flexShrink: 0,
          }}>🇨🇭</span>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Клиника <span style={{ color: 'var(--color-primary)' }}>«Алихан»</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: '0.15rem', alignItems: 'center' }}>
          {PUBLIC_NAV.map(l => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} className="nav-link" style={{
                fontSize: '0.85rem',
                fontWeight: active ? 700 : 500,
                color: 'var(--text-secondary)',
                padding: '0.4rem 0.75rem',
                borderRadius: 6,
                background: active ? 'var(--color-primary-glow)' : 'transparent',
                transition: 'background 0.15s, color 0.15s',
                whiteSpace: 'nowrap',
              }}>
                {l.label}
              </Link>
            );
          })}
          <Link href="/booking" className="btn btn-primary" style={{
            marginLeft: '0.5rem', padding: '0.5rem 1.2rem',
            fontSize: '0.85rem', borderRadius: 7,
          }}>
            Записаться →
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(v => !v)}
          style={{
            display: 'none',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-primary)', padding: '0.25rem',
          }}
          aria-label="Меню"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* ── Mobile dropdown menu ── */}
      {menuOpen && (
        <div className="mobile-menu" style={{
          background: 'rgba(244,248,244,0.99)',
          borderTop: '1px solid var(--border-color)',
          padding: '1rem 1.5rem 1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.25rem',
        }}>
          {PUBLIC_NAV.map(l => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} style={{
                fontSize: '1rem', fontWeight: active ? 700 : 500,
                color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                padding: '0.75rem 0.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'block',
              }}>
                {l.label}
              </Link>
            );
          })}
          <Link href="/booking" className="btn btn-primary" style={{
            marginTop: '0.75rem', justifyContent: 'center',
            fontSize: '1rem', padding: '0.8rem',
          }}>
            Записаться →
          </Link>
        </div>
      )}
    </header>
  );
}
