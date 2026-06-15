import Link from "next/link";
import { getProcedures } from "../actions";
import { Procedure } from "../components/types";
export const metadata = {
  title: "Процедурный кабинет | Клиника Алихан",
  description: "Процедурный кабинет клиники Алихан. Капельницы, инъекции, перевязки, забор анализов.",
};

const RULES = [
  "Приходите за 10 минут до назначенного времени",
  "Возьмите направление от врача или результаты предыдущих анализов",
  "При заборе крови — приходите натощак (от 8 часов без еды)",
  "Наденьте одежду с удобным доступом к руке",
  "При необходимости капельницы — возьмите рецепт с препаратами",
];


export default async function ProceduresPage() {
  const procedures: Procedure[] = await getProcedures();
  return (
    <div style={{ background: "var(--bg-primary)" }}>

      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg, #7a5c2e, #a07840)",
        padding: "3.5rem 1.5rem",
        textAlign: "center",
        color: "#fff",
      }}>
        <div style={{
          display: "inline-block", background: "rgba(255,255,255,0.15)",
          padding: "4px 16px", borderRadius: 20,
          fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", marginBottom: "1rem",
        }}>Медицинские процедуры</div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "#fff", marginBottom: "0.75rem" }}>
          Процедурный кабинет
        </h1>
        <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.85)", maxWidth: 540, margin: "0 auto" }}>
          Инъекции, капельницы, перевязки и забор анализов. Опытный персонал, стерильные условия, быстрое обслуживание.
        </p>
      </section>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", alignItems: "start" }}>

          {/* procedures table */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div className="section-label" style={{ margin: 0 }}>Прайс-лист</div>
            </div>

            <div className="card" style={{ overflow: "hidden", padding: 0 }}>
              {/* Table header */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 120px 120px",
                background: "var(--bg-secondary)",
                padding: "0.75rem 1.25rem",
                borderBottom: "1px solid var(--border-color)",
                fontSize: "0.78rem", fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase",
                color: "var(--text-muted)",
              }}>
                <span>Процедура</span>
                <span style={{ textAlign: "center" }}>Длительность</span>
                <span style={{ textAlign: "right" }}>Цена</span>
              </div>

              {procedures.filter(p => p.doctorId === 3).map((p, i) => (
                <div key={p.name} style={{
                  display: "grid", gridTemplateColumns: "1fr 120px 120px",
                  padding: "0.9rem 1.25rem",
                  borderBottom: i < procedures.length - 1 ? "1px solid var(--border-color)" : "none",
                  background: i % 2 === 0 ? "#fff" : "var(--bg-primary)",
                  alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontSize: "0.92rem", color: "var(--text-primary)" }}>{p.name}</span>
                  </div>
                  <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>{p.duration} мин</div>
                  <div style={{ textAlign: "right", fontSize: "0.92rem", fontWeight: 700, color: "var(--color-primary)" }}>{p.price} ₸</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.75rem", textAlign: "right" }}>
              * Цены могут отличаться в зависимости от сложности процедуры
            </p>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Schedule */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--color-primary)" }}>
                📅 Режим работы
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                {[
                  { day: "Пн–Пт", time: "07:00 – 14:00" },
                  { day: "Суббота", time: "07:00 – 12:00" },
                  { day: "Воскресенье", time: "Выходной" },
                ].map(({ day, time }) => (
                  <div key={day} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>{day}</span>
                    <span style={{ fontWeight: 600, color: time === "Выходной" ? "var(--color-danger)" : "var(--text-primary)" }}>
                      {time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--color-primary)" }}>
                📋 Как подготовиться
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {RULES.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.5rem", fontSize: "0.85rem" }}>
                    <span style={{ color: "var(--color-gold)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    <span style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{
              background: "linear-gradient(135deg, #7a5c2e, #a07840)",
              borderRadius: 14, padding: "1.5rem",
              textAlign: "center", color: "#fff",
            }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>💉</div>
              <h3 style={{ fontSize: "1rem", color: "#fff", marginBottom: "0.5rem" }}>Записаться в процедурный</h3>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", marginBottom: "1rem", lineHeight: 1.5 }}>
                Онлайн-запись или WhatsApp — выберите удобный способ.
              </p>
              <Link href="/booking" style={{
                display: "block", background: "#fff",
                color: "#7a5c2e", fontWeight: 700,
                padding: "0.6rem 1rem", borderRadius: 8,
                fontSize: "0.9rem", textDecoration: "none",
              }}>
                Записаться онлайн
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
