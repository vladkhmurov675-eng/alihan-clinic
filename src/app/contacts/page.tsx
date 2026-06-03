"use client";

export default function ContactsPage() {
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
        }}>Контакты</div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "#fff", marginBottom: "0.75rem" }}>
          Как нас найти
        </h1>
        <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.8)", maxWidth: 480, margin: "0 auto" }}>
          Мы находимся в Алматы. Позвоните, напишите в WhatsApp или запишитесь онлайн.
        </p>
      </section>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>

          {/* Contact cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Address */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "#e8f2f8", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0,
                }}>📍</div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Адрес</div>
                  <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    г. Алматы, пр. Аль-Фараби, 140А<br />
                    (рядом с остановкой «Ботанический сад»)
                  </div>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "#e8f2f8", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0,
                }}>📞</div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Телефон</div>
                  <a href="tel:+77273217788" style={{
                    fontSize: "1.1rem", fontWeight: 700,
                    color: "var(--color-primary)", display: "block", marginBottom: 4,
                  }}>+7 (727) 321-77-88</a>
                  <a href="tel:+77019998877" style={{
                    fontSize: "1rem", color: "var(--text-secondary)",
                  }}>+7 (701) 999-88-77</a>
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="card" style={{ padding: "1.5rem", borderColor: "#25d36640" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "#e8f8ee", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0,
                }}>💬</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>WhatsApp</div>
                  <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                    Пишите в любое время — отвечаем в рабочие часы
                  </div>
                  <a
                    href="https://wa.me/77019998877?text=Здравствуйте!%20Хочу%20записаться%20на%20приём."
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.5rem",
                      background: "#25d366", color: "#fff",
                      padding: "0.55rem 1.2rem", borderRadius: 8,
                      fontWeight: 600, fontSize: "0.9rem", textDecoration: "none",
                    }}
                  >
                    <span>💬</span> Написать в WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "#e8f2f8", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0,
                }}>🕐</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: "0.75rem" }}>Режим работы</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.9rem" }}>
                    {[
                      { day: "Понедельник – Пятница", time: "07:00 – 19:00" },
                      { day: "Суббота", time: "07:00 – 13:00" },
                      { day: "Воскресенье", time: "Выходной" },
                    ].map(({ day, time }) => (
                      <div key={day} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-secondary)" }}>{day}</span>
                        <span style={{
                          fontWeight: 600,
                          color: time === "Выходной" ? "var(--color-danger)" : "var(--text-primary)",
                        }}>{time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Book CTA */}
            <a href="/booking" className="btn btn-primary" style={{
              width: "100%", justifyContent: "center",
              fontSize: "1rem", padding: "0.85rem",
            }}>
              Записаться онлайн →
            </a>
          </div>

          {/* Map */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="card" style={{ overflow: "hidden", padding: 0 }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2907.7!2d76.9286!3d43.2220!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDEzJzE5LjIiTiA3NsKwNTUnNDMuMCJF!5e0!3m2!1sru!2skz!4v1700000000000!5m2!1sru!2skz"
                width="100%"
                height="380"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Карта клиники Алихан"
              />
            </div>

            {/* How to get there */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--color-primary)" }}>
                🚌 Как добраться
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", fontSize: "0.9rem" }}>
                {[
                  { icon: "🚌", text: "Автобус: маршруты 28, 65, 79 — остановка «Ботанический сад»" },
                  { icon: "🚇", text: "Метро: ст. «Бостандыкская», далее 10 мин пешком" },
                  { icon: "🚗", text: "Автомобиль: бесплатная парковка перед зданием" },
                  { icon: "🚕", text: "Такси: скажите водителю — Аль-Фараби 140А" },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0 }}>{icon}</span>
                    <span style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
