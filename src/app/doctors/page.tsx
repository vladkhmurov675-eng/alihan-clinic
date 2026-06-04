import { getDoctors } from '../actions';
import Link from "next/link";

export const metadata = {
  title: "Врачи | Клиника Алихан",
  description: "Специалисты клиники Алихан — терапевт, невропатолог, процедурный кабинет.",
};

function getDoctorColor(spec: string) {
  if (spec.includes('Терап')) return '#1a4a6b';
  if (spec.includes('Невро')) return '#2d7a5f';
  if (spec.includes('Процедур')) return '#7a5c2e';

  return '#4f46e5';
}

function Initials({ name, color }: { name: string; color: string }) {
  const parts = name.split(" ").slice(0, 2).map((n) => n[0]);
  return (
    <div style={{
      width: 80, height: 80, borderRadius: "50%",
      background: color, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "1.6rem", fontWeight: 800, letterSpacing: 1,
      flexShrink: 0,
    }}>
      {parts.join("")}
    </div>
  );
}

export default async function DoctorsPage() {
  const doctors = await getDoctors();
  return (
    <div style={{ background: "var(--bg-primary)" }}>

      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg, #1a4a6b, #2d7a5f)",
        padding: "3.5rem 1.5rem",
        textAlign: "center",
        color: "#fff",
      }}>
        <div className="section-label" style={{ color: "rgba(255,255,255,0.7)", marginBottom: "0.75rem", display: "block" }}>
          Наша команда
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "#fff", marginBottom: "0.75rem" }}>
          Врачи клиники «Алихан»
        </h1>
        <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.8)", maxWidth: 500, margin: "0 auto" }}>
          Опытные специалисты с многолетней практикой. Запишитесь онлайн к нужному врачу прямо сейчас.
        </p>
      </section>

      {/* Doctors */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "3rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {doctors.map((d) => (
          <div key={d.id} className="card" style={{ padding: "2rem", display: "flex", gap: "2rem", alignItems: "flex-start" }}>
            <Initials name={d.name} color={getDoctorColor(d.specialization)} />

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{d.name}</h2>
                <span style={{
                  background: "var(--color-primary-glow)", color: "var(--color-primary)",
                  border: "1px solid rgba(26,74,107,0.2)",
                  fontSize: "0.75rem", fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                }}>{d.specialization}</span>
              </div>

              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                {d.education} · {d.experienceYears}
              </div>

              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: "1rem" }}>
                {d.description}
              </p>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                {[
                  { icon: "📅", text: d.workStartTime },
                  { icon: "⏱️", text: `Приём: ${d.slotDuration}` },
                ].map(({ icon, text }) => (
                  <div key={text} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "var(--bg-secondary)", borderRadius: 8,
                    padding: "6px 12px", fontSize: "0.85rem", color: "var(--text-secondary)",
                  }}>
                    <span>{icon}</span>{text}
                  </div>
                ))}
              </div>

              <Link href={`/booking?doctorId=${d.id}`} className="btn btn-primary" style={{ fontSize: "0.9rem", padding: "0.6rem 1.4rem" }}>
                Записаться к врачу →
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{
        background: "var(--bg-secondary)", borderTop: "1px solid var(--border-color)",
        padding: "3rem 1.5rem", textAlign: "center",
      }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>Не знаете, к какому врачу идти?</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          Позвоните нам или напишите в WhatsApp — мы поможем выбрать специалиста.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="tel:+77273217788" className="btn btn-primary">📞 Позвонить</a>
          <a href="https://wa.me/77019998877" className="btn btn-outline">💬 WhatsApp</a>
        </div>
      </section>
    </div>
  );
}
