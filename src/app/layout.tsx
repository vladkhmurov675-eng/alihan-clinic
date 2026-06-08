import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import NavBar from './components/NavBar';

const outfit = Outfit({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Клиника Алихан | Запись на приём онлайн',
  description: 'Удобная онлайн-запись на приём к специалистам клиники Алихан. Терапевт, невропатолог, процедурный кабинет. Алматы.',
};

const PUBLIC_NAV = [
  { label: 'Главная', href: '/' },
  { label: 'О клинике', href: '/about' },
  { label: 'Врачи', href: '/doctors' },
  { label: 'Услуги', href: '/services' },
  { label: 'Процедурный кабинет', href: '/procedures' },
  { label: 'Онлайн-запись', href: '/booking' },
  { label: 'Контакты', href: '/contacts' },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${outfit.variable} ${inter.variable}`}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        <NavBar />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>

        {/* ── FOOTER ── */}
        <footer style={{
          background: '#0e1a2a',
          color: 'rgba(255,255,255,0.55)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            maxWidth: 1280, margin: '0 auto',
            padding: '2.5rem 1.5rem',
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem',
          }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                Клиника «Алихан»
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                Забота о здоровье вашей семьи.<br />
                г. Алматы, пр. Аль-Фараби, 140А
              </p>
            </div>

            <div>
              <div style={{
                color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '0.8rem',
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem',
              }}>Навигация</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {PUBLIC_NAV.map(l => (
                  <Link key={l.href} href={l.href} style={{
                    fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s',
                  }}>{l.label}</Link>
                ))}
              </div>
            </div>

            <div>
              <div style={{
                color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '0.8rem',
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem',
              }}>Контакты</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <span>📞 +7 (727) 321-77-88</span>
                <span>📱 +7 (701) 999-88-77</span>
                <a href="https://wa.me/77019998877" style={{ color: '#25d366' }}>💬 WhatsApp</a>
                <span>🕐 Пн–Сб: 07:00–18:00</span>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.78rem',
          }}>
            © {new Date().getFullYear()} ТОО «Клиника Алихан». Все права защищены.
          </div>
        </footer>
      </body>
    </html>
  );
}
