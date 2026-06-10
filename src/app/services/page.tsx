import Link from "next/link";

export const metadata = {
  title: "Услуги | Клиника Алихан",
  description: "Услуги клиники Алихан: терапевт, невропатолог, процедурный кабинет.",
};

const SERVICES = [
  {
    emoji: "🩺",
    title: "Терапевт",
    color: "#1a4a6b",
    lightBg: "#e8f2f8",
    desc: "Первичный приём, диагностика и лечение общих заболеваний. Выдача справок, направлений и рецептов.",
    items: [
      "Осмотр и консультация",
      "Лечение ОРВИ, гриппа, бронхита",
      "Контроль артериального давления",
      "Ведение хронических заболеваний",
      "Выдача справок и рецептов",
      "Профилактические осмотры",
    ],
    price: "от 5 000 ₸",
    duration: "20–40 мин",
  },
  {
    emoji: "🧠",
    title: "Невропатолог",
    color: "#2d7a5f",
    lightBg: "#e8f5f0",
    desc: "Диагностика и лечение заболеваний нервной системы. Головные боли, нарушения сна, болезни позвоночника.",
    items: [
      "Головные боли и мигрени",
      "Нарушения сна",
      "Остеохондроз и радикулит",
      "Болезни позвоночника",
      "Синдром хронической усталости",
      "Неврозы и тревожные состояния",
    ],
    price: "от 7 000 ₸",
    duration: "30–45 мин",
  },
  {
    emoji: "💉",
    title: "Процедурный кабинет",
    color: "#7a5c2e",
    lightBg: "#f5efe8",
    desc: "Медицинские процедуры и манипуляции. Капельницы, инъекции, перевязки, забор анализов.",
    items: [
      "Внутривенные и внутримышечные инъекции",
      "Капельницы и инфузионная терапия",
      "Забор крови для анализов",
      "Перевязки",
      "Обработка ран",
      "ЭКГ",
    ],
    price: "от 1 500 ₸",
    duration: "15–60 мин",
  },
];

export default function ServicesPage() {
  return (
    <div style={{ background: "var(--bg-primary)" }}>

      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg, #1a4a6b, #2d7a5f)",
        padding: "3.5rem 1.5rem",
        textAlign: "center",
        color: "#fff",
      }}>
        <div style={{
          display: "inline-block", background: "rgba(255,255,255,0.15)",
          padding: "4px 16px", borderRadius: 20,
          fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", marginBottom: "1rem",
        }}>Что мы лечим</div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "#fff", marginBottom: "0.75rem" }}>
          Услуги клиники
        </h1>
        <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.8)", maxWidth: 500, margin: "0 auto" }}>
          Три специализации под одной крышей — всё необходимое для семейного здоровья.
        </p>
      </section>

      {/* Services */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {SERVICES.map((s) => (
            <div key={s.title} className="card" style={{ padding: "2rem", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>

                {/* Left */}
                <div>
                  <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: s.lightBg, fontSize: "2rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "1rem", border: `1px solid ${s.color}22`,
                  }}>{s.emoji}</div>

                  <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color, marginBottom: "0.5rem" }}>
                    {s.title}
                  </h2>
                  <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                    {s.desc}
                  </p>

                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                    <div style={{
                      background: s.lightBg, borderRadius: 8,
                      padding: "6px 14px", fontSize: "0.85rem",
                      color: s.color, fontWeight: 600,
                      border: `1px solid ${s.color}22`,
                    }}>💰 {s.price}</div>
                    <div style={{
                      background: "var(--bg-secondary)", borderRadius: 8,
                      padding: "6px 14px", fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                    }}>⏱️ {s.duration}</div>
                  </div>

                  <Link href="/booking" className="btn btn-primary" style={{
                    background: s.color, fontSize: "0.9rem",
                  }}>
                    Записаться →
                  </Link>
                </div>

                {/* Right — what's included */}
                <div style={{
                  background: "var(--bg-secondary)", borderRadius: 12,
                  padding: "1.5rem", border: "1px solid var(--border-color)",
                }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>
                    Что входит
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {s.items.map((item) => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.9rem" }}>
                        <span style={{ color: s.color, fontWeight: 700, fontSize: "1rem", flexShrink: 0 }}>✓</span>
                        <span style={{ color: "var(--text-secondary)" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: "linear-gradient(135deg, #1a4a6b, #0e2d45)",
        padding: "3.5rem 1.5rem",
        textAlign: "center",
        color: "#fff",
      }}>
        <h2 style={{ fontSize: "1.8rem", color: "#fff", marginBottom: "0.75rem" }}>
          Готовы записаться?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: "1.75rem", fontSize: "1rem" }}>
          Онлайн-запись занимает 2 минуты. Выберите врача и удобное время.
        </p>
        <Link href="/booking" className="btn btn-gold" style={{ fontSize: "1rem", padding: "0.85rem 2.5rem" }}>
          Онлайн-запись →
        </Link>
      </section>
    </div>
  );
}
