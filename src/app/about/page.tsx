export const metadata = {
  title: "О клинике | Клиника Алихан",
  description: "История, ценности и команда клиники Алихан в Алматы.",
};

const VALUES = [
  { icon: "🤝", title: "Доверие", desc: "Открытость и честность с каждым пациентом — основа нашей работы." },
  { icon: "🔬", title: "Качество", desc: "Современные методы диагностики и лечения, регулярное повышение квалификации." },
  { icon: "❤️", title: "Забота", desc: "Тёплый семейный подход, индивидуальное внимание к каждому." },
  { icon: "⏱️", title: "Время пациента", desc: "Онлайн-запись и чёткое расписание — без очередей и ожидания." },
];

const STATS = [
  { value: "2018", label: "год основания" },
  { value: "3", label: "специалиста" },
  { value: "5 000+", label: "пациентов" },
  { value: "07:00", label: "начало приёма" },
];

export default function AboutPage() {
  return (
    <div style={{ background: "var(--bg-primary)" }}>

      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg, #1a4a6b 0%, #2d7a5f 100%)",
        padding: "4rem 1.5rem",
        textAlign: "center",
        color: "#fff",
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{
            display: "inline-block", background: "rgba(255,255,255,0.15)",
            padding: "4px 16px", borderRadius: 20, fontSize: "0.8rem",
            fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: "1rem",
          }}>О клинике</div>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#fff", marginBottom: "1rem" }}>
            Клиника «Алихан» — ваш семейный врач в Алматы
          </h1>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "rgba(255,255,255,0.85)" }}>
            С 2018 года мы помогаем жителям Алматы получать качественную медицинскую помощь рядом с домом — без очередей и лишних формальностей.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "#fff", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem",
          display: "grid", gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: "1rem",
        }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--color-primary)" }}>{s.value}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section >

      {/* Story */}
      < section style={{ maxWidth: 1100, margin: "0 auto", padding: "4rem 1.5rem" }
      }>
        <div style={{ display: "grid", gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: "3rem", alignItems: "center" }}>
          <div>
            <div className="section-label">Наша история</div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "1.25rem" }}>Начали с малого — выросли с доверием</h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Клиника «Алихан» была основана с простой идеей: дать жителям района доступ к хорошим врачам рядом с домом. Мы начали с одного кабинета терапевта и постепенно расширились до полноценного медицинского центра.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--text-secondary)" }}>
              Сегодня мы ведём приём терапевта, невропатолога и процедурного кабинета. Наша гордость — это доверие пациентов, многие из которых приходят к нам всей семьёй уже несколько лет.
            </p>
          </div>
          <div style={{
            background: "linear-gradient(135deg, #e8f2f8, #e8f5f0)",
            borderRadius: 16, padding: "2.5rem",
            border: "1px solid var(--border-color)",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏥</div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.75rem", color: "var(--color-primary)" }}>
              Миссия клиники
            </h3>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--text-secondary)" }}>
              Обеспечить каждому жителю Алматы доступ к качественной, тёплой и своевременной медицинской помощи — без бюрократии, без очередей, с уважением к времени и здоровью каждого пациента.
            </p>
          </div>
        </div>
      </section >

      {/* Values */}
      < section style={{ background: "#fff", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }
      }>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "4rem 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div className="section-label">Принципы</div>
            <h2 style={{ fontSize: "1.8rem" }}>Что для нас важно</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {VALUES.map((v) => (
              <div key={v.title} className="card" style={{ padding: "1.75rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{v.icon}</div>
                <h3 style={{ fontSize: "1.05rem", marginBottom: "0.5rem", color: "var(--color-primary)" }}>{v.title}</h3>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "var(--text-secondary)" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* CTA */}
      < section style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Запишитесь на приём сегодня</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Выберите удобное время и специалиста онлайн — это займёт меньше двух минут.
          </p>
          <a href="/booking" className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.85rem 2rem" }}>
            Онлайн-запись →
          </a>
        </div>
      </section >
    </div >
  );
}
