import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
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
  title: "Клиника Алихан | Запись на прием онлайн",
  description: "Удобная онлайн-запись на прием к специалистам клиники Алихан. Просмотр расписания, выбор времени и управление записями.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${outfit.variable} ${inter.variable}`}>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <header style={{
          borderBottom: "1px solid var(--border-color)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(10, 15, 29, 0.8)"
        }}>
          <div className="container" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.5rem"
          }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{
                background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%)",
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1.25rem",
                boxShadow: "0 0 15px rgba(6, 182, 212, 0.3)"
              }}>
                A
              </span>
              <span style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                background: "linear-gradient(to right, #ffffff, #a5f3fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                АЛИХАН
              </span>
            </Link>
            <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <Link href="/" style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-secondary)" }} className="nav-link">
                Запись к врачу
              </Link>
              <Link href="/doctor" style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-secondary)" }} className="nav-link">
                Кабинет врача
              </Link>
              <Link href="/admin" style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-secondary)" }} className="nav-link">
                Панель админа
              </Link>
            </nav>
          </div>
        </header>

        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </main>

        <footer style={{
          borderTop: "1px solid var(--border-color)",
          padding: "2rem 1.5rem",
          background: "var(--bg-secondary)",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.85rem"
        }}>
          <div className="container" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <p>© {new Date().getFullYear()} Клиника «Алихан». Все права защищены.</p>
            <p style={{ fontSize: "0.75rem" }}>Разработано с заботой о вашем здоровье.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
