import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const outfit = Outfit({
  subsets: ["latin", "cyrillic"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Клиника Алихан | Запись на приём онлайн",
  description:
    "Удобная онлайн-запись на приём к специалистам клиники Алихан. Терапевт, невропатолог, процедурный кабинет. Алматы.",
};

const PUBLIC_NAV = [
  { label: "Главная", href: "/" },
  { label: "О клинике", href: "/about" },
  { label: "Врачи", href: "/doctors" },
  { label: "Услуги", href: "/services" },
  { label: "Процедурный кабинет", href: "/procedures" },
  { label: "Онлайн-запись", href: "/booking" },
  { label: "Контакты", href: "/contacts" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${outfit.variable} ${inter.variable}`}>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* ── HEADER ── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(250,249,246,0.97)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--border-color)",
          boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
        }}>
          {/* Top bar — role access links */}
          <div style={{
            background: "var(--color-primary)",
            padding: "0 1.5rem",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "1.5rem",
            height: 32,
          }}>
            <Link href="/login" style={{
              fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.05em", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 5,
              transition: "color 0.15s",
            }}>
              <span style={{ fontSize: 12 }}>🩺</span> ВОЙТИ
            </Link>
          </div>

          {/* Main nav */}
          <div style={{
            maxWidth: 1280, margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 60,
          }}>
            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
              <span style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "linear-gradient(135deg, #1a4a6b, #2d7a5f)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 800, fontSize: "1.1rem",
                boxShadow: "0 2px 10px rgba(26,74,107,0.25)",
              }}>А</span>
              <span style={{
                fontSize: "1.15rem", fontWeight: 800,
                letterSpacing: "-0.03em", color: "var(--text-primary)",
              }}>
                Клиника <span style={{ color: "var(--color-primary)" }}>«Алихан»</span>
              </span>
            </Link>

            {/* Nav links */}
            <nav style={{ display: "flex", gap: "0.15rem", alignItems: "center" }}>
              {PUBLIC_NAV.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="nav-link"
                  style={{
                    fontSize: "0.85rem", fontWeight: 500,
                    color: "var(--text-secondary)",
                    padding: "0.4rem 0.75rem",
                    borderRadius: 6,
                    transition: "background 0.15s, color 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {l.label}
                </Link>
              ))}

              <Link href="/booking" className="btn btn-primary" style={{
                marginLeft: "0.5rem",
                padding: "0.5rem 1.2rem",
                fontSize: "0.85rem",
                borderRadius: 7,
              }}>
                Записаться →
              </Link>
            </nav>
          </div>
        </header>

        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </main>

        {/* ── FOOTER ── */}
        <footer style={{
          background: "#0e1a2a",
          color: "rgba(255,255,255,0.55)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            maxWidth: 1280, margin: "0 auto",
            padding: "2.5rem 1.5rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "2rem",
          }}>
            {/* Brand */}
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.75rem" }}>
                Клиника «Алихан»
              </div>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
                Забота о здоровье вашей семьи.<br />
                г. Алматы, пр. Аль-Фараби, 140А
              </p>
            </div>

            {/* Site links */}
            <div>
              <div style={{
                color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: "0.8rem",
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem"
              }}>
                Навигация
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {PUBLIC_NAV.map((l) => (
                  <Link key={l.href} href={l.href} style={{
                    fontSize: "0.85rem", color: "rgba(255,255,255,0.5)",
                    transition: "color 0.15s",
                  }}>{l.label}</Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <div style={{
                color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: "0.8rem",
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem"
              }}>
                Контакты
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
                <span>📞 +7 (727) 321-77-88</span>
                <span>📱 +7 (701) 999-88-77</span>
                <a href="https://wa.me/77019998877" style={{ color: "#25d366" }}>💬 WhatsApp</a>
                <span>🕐 Пн–Сб: 07:00–18:00</span>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "1rem 1.5rem",
            textAlign: "center",
            fontSize: "0.78rem",
          }}>
            © {new Date().getFullYear()} ТОО «Клиника Алихан». Все права защищены.
          </div>
        </footer>
      </body>
    </html>
  );
}
