export const metadata = {
  title: "Руководитель | Клиника Алихан",
  description: "Панель руководителя — загрузка врачей и статистика записей.",
};

// In MVP this is a static view — hook up to real DB queries in next phase
const MOCK_STATS = {
  totalAppointments: 142,
  thisWeek: 34,
  today: 8,
  doctors: [
    { name: "Сейткали А.Б.", role: "Терапевт", todayCount: 4, weekCount: 18, totalCount: 76, load: 80 },
    { name: "Әбенова Г.С.", role: "Невропатолог", todayCount: 3, weekCount: 12, totalCount: 48, load: 60 },
    { name: "Жұмабеков Д.Е.", role: "Процедурный", todayCount: 1, weekCount: 4, totalCount: 18, load: 25 },
  ],
};

function LoadBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ background: "var(--bg-secondary)", borderRadius: 99, height: 8, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: 99, transition: "width 0.4s" }} />
    </div>
  );
}

export default function DirectorPage() {
  const { totalAppointments, thisWeek, today, doctors } = MOCK_STATS;

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a4a6b, #2d7a5f)",
        padding: "2.5rem 1.5rem",
        color: "#fff",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "inline-block", background: "rgba(255,255,255,0.15)",
            padding: "3px 12px", borderRadius: 20,
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", marginBottom: "0.75rem",
          }}>Кабинет руководителя</div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", margin: 0 }}>
            Панель управления клиникой
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "2rem" }}>
          {[
            { label: "Всего записей", value: totalAppointments, icon: "📋", color: "#1a4a6b" },
            { label: "На этой неделе", value: thisWeek, icon: "📅", color: "#2d7a5f" },
            { label: "Сегодня", value: today, icon: "🕐", color: "#c8a96e" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${color}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.5rem", flexShrink: 0,
              }}>{icon}</div>
              <div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 4 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Doctor load */}
        <div className="card" style={{ padding: "1.75rem", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1.5rem", color: "var(--color-primary)" }}>
            📊 Загрузка врачей
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {doctors.map((d) => {
              const color = d.load > 70 ? "#dc2626" : d.load > 40 ? "#d97706" : "#2d7a5f";
              return (
                <div key={d.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{d.name}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>{d.role}</span>
                    </div>
                    <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      <span>Сегодня: <strong style={{ color: "var(--text-primary)" }}>{d.todayCount}</strong></span>
                      <span>Неделя: <strong style={{ color: "var(--text-primary)" }}>{d.weekCount}</strong></span>
                      <span>Всего: <strong style={{ color: "var(--text-primary)" }}>{d.totalCount}</strong></span>
                      <span style={{ fontWeight: 700, color }}>{d.load}%</span>
                    </div>
                  </div>
                  <LoadBar pct={d.load} color={color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div style={{
          background: "#fff9ec", border: "1px solid #fcd97044",
          borderRadius: 12, padding: "1.25rem 1.5rem",
          fontSize: "0.88rem", color: "#92600a",
        }}>
          ℹ️ <strong>MVP-режим:</strong> статистика выше — демонстрационные данные. После подключения базы данных здесь будут отображаться реальные показатели клиники в режиме реального времени.
        </div>
      </div>
    </div>
  );
}
