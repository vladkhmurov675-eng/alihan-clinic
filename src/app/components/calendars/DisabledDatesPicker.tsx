"use client";

import { useState, useCallback, useEffect } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const currentDecade = Array.from({ length: 10 }, (_, i) => 2020 + i);

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const DOWS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function calendarDateToStr(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function datesInRange(a: string, b: string): string[] {
  const start = new Date(Math.min(+new Date(a), +new Date(b)));
  const end = new Date(Math.max(+new Date(a), +new Date(b)));
  const out: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    out.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function groupDisabledDates(dates: Set<string>) {
  const oneDay = 24 * 60 * 60 * 1000;
  const d = Array.from(dates).map((dates) => new Date(dates));

  type periodsAndDays = {
    periods: Array<{ start: Date; end: Date }>;
    days: Date[];
  };
  const disabledDates: periodsAndDays = {
    periods: [],
    days: [],
  };

  if (d.length === 0) return disabledDates;
  let start = d[0];
  let previous = d[0];

  const flush = () => {
    if (start.getTime() === previous.getTime()) {
      disabledDates.days.push(start);
    } else {
      disabledDates.periods.push({ start: start, end: previous });
    }
  };

  for (let i = 1; i < d.length; i++) {
    const current = d[i];
    const gap = current.getTime() - previous.getTime();

    if (gap === oneDay) {
      previous = current;
    } else {
      flush();
      start = current;
      previous = current;
    }
  }

  flush();
  return disabledDates;
}

export default function DisabledDatesPicker({ value, onChange }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [step, setStep] = useState<"year" | "month">("year");
  const [decade, setDecade] = useState<number[]>(currentDecade);

  // Drag-select state: anchor is the day mousedown started on, mode is
  // decided right then (remove if that day was already disabled, add
  // otherwise), cursor tracks the day currently under the pointer.
  const [dragAnchor, setDragAnchor] = useState<string | null>(null);
  const [dragCursor, setDragCursor] = useState<string | null>(null);
  const [dragMode, setDragMode] = useState<"add" | "remove" | null>(null);

  const disabled = new Set(value ? value.split(",").filter(Boolean) : []);
  const groupedDates = groupDisabledDates(disabled);

  const commit = useCallback(
    (set: Set<string>) => {
      onChange([...set].sort().join(","));
    },
    [onChange],
  );

  const handleMouseDown = (ds: string) => {
    setDragAnchor(ds);
    setDragCursor(ds);
    setDragMode(disabled.has(ds) ? "remove" : "add");
  };

  const handleMouseEnter = (ds: string) => {
    if (dragAnchor) setDragCursor(ds);
  };

  // Finalize on mouseup anywhere on the page — not just inside the grid —
  // so a drag that ends outside the calendar (or the window) still commits.
  useEffect(() => {
    if (!dragAnchor) return;

    const finish = () => {
      const end = dragCursor ?? dragAnchor;
      const range = datesInRange(dragAnchor, end);
      const next = new Set(disabled);
      if (dragMode === "remove") {
        range.forEach((d) => next.delete(d));
      } else {
        range.forEach((d) => next.add(d));
      }
      commit(next);
      setDragAnchor(null);
      setDragCursor(null);
      setDragMode(null);
    };

    window.addEventListener("mouseup", finish);
    return () => window.removeEventListener("mouseup", finish);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragAnchor, dragCursor, dragMode]);

  const removeDate = (d: Date) => {
    const day = d.toISOString().split("T")[0];
    const next = new Set(disabled);
    next.delete(day);
    commit(next);
  };
  const removeRange = (start: Date, end: Date) => {
    const splitStart = start.toISOString().split("T");
    const splitEnd = end.toISOString().split("T");
    const next = new Set(disabled);
    let isInRange: boolean = false;
    outer: for (const date of next.values()) {
      if (isInRange) {
        next.delete(date);
      }
      switch (date) {
        case splitStart[0]:
          isInRange = true;
          next.delete(date);
          break;
        case splitEnd[0]:
          isInRange = false;
          next.delete(date);
          break outer;
      }
    }
    commit(next);
  };
  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();

  const previewDates = new Set<string>();
  if (dragAnchor && dragCursor) {
    datesInRange(dragAnchor, dragCursor).forEach((d) => previewDates.add(d));
  }

  return (
    <div
      className="form-container"
      style={{ maxWidth: 320, userSelect: "none" }}
    >
      {/* Year grid */}
      {step === "year" && (
        <>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              type="button"
              className="btn-text"
              onClick={() => setDecade(decade.map((d) => d - 10))}
            >
              {" "}
              ‹{" "}
            </button>

            <div
              style={{
                position: "relative",
                display: "grid",
                gridAutoFlow: "column",
                gridTemplateRows: "repeat(5, 1fr)",
                gap: 4,
                height: "auto",
                width: "inherit",
                marginBottom: 8,
                border: "1px solid var(--border-color)",
                borderRadius: 0,
                padding: 6,
              }}
            >
              {decade.toReversed().map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setYear(y);
                    setStep("month");
                  }}
                  className="btn-text"
                  style={{
                    backgroundColor: y === year ? "var(--color-primary)" : "",
                    color: y === year ? "white" : "",
                    justifyContent: "center",
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn-text"
              onClick={() => setDecade(decade.map((d) => d + 10))}
            >
              {" "}
              ›{" "}
            </button>
          </div>
        </>
      )}

      {step === "month" && (
        <>
          {/* Month nav */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <button type="button" onClick={prevMonth} style={navBtnStyle}>
              ‹
            </button>
            <button
              onClick={() => setStep("year")}
              title="Изменить год"
              className="btn-text"
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: "var(--text-primary)",
                justifyContent: "center",
                borderRadius: 2,
                padding: 6,
                cursor: "pointer",
              }}
            >
              {MONTHS[month]} {year}
            </button>
            <button type="button" onClick={nextMonth} style={navBtnStyle}>
              ›
            </button>
          </div>

          {/* Calendar grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
            }}
          >
            {DOWS.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  color: "var(--text-muted)",
                  padding: "2px 0",
                  fontWeight: 600,
                }}
              >
                {d}
              </div>
            ))}
            {Array.from({ length: firstDow }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
              const ds = calendarDateToStr(year, month, d);
              const isDisabled = disabled.has(ds);
              const inPreview = dragAnchor !== null && previewDates.has(ds);
              const previewAdding = inPreview && dragMode === "add";
              const previewRemoving = inPreview && dragMode === "remove";

              let bg = "transparent";
              let color = "var(--text-primary)";
              let fw: number | string = 400;
              let border = "none";

              if (isDisabled && !inPreview) {
                bg = "rgba(220,38,38,0.15)";
                color = "#b91c1c";
                fw = 600;
              }
              if (previewAdding) {
                bg = "var(--color-primary)";
                color = "#fff";
                fw = 700;
              } else if (previewRemoving) {
                bg = "rgba(220,38,38,0.35)";
                color = "#fff";
                fw = 700;
                border = "1px dashed #b91c1c";
              }

              return (
                <div
                  key={ds}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMouseDown(ds);
                  }}
                  onMouseEnter={() => handleMouseEnter(ds)}
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    padding: "5px 2px",
                    cursor: "pointer",
                    background: bg,
                    color,
                    fontWeight: fw,
                    border,
                    transition: "background 0.1s",
                    userSelect: "none",
                  }}
                >
                  {d}
                </div>
              );
            })}
          </div>

          {/* Hint */}
          <p
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
              marginTop: 10,
              lineHeight: 1.4,
            }}
          >
            Клик — добавить или убрать день. Зажмите и проведите мышью по
            дням, чтобы выбрать период — если начать с уже отмеченного дня,
            период снимается.
          </p>
        </>
      )}

      {groupedDates.periods.map((p, i) => (
        <div key={i}>
          {" "}
          <h3>Период {i + 1}</h3>
          <button
            className="btn-accent"
            style={{
              backgroundColor: "rgba(220,38,38,0.15)",
              color: "#b91c1c",
              fontWeight: "600",
              padding: "8px",
              marginBlock: "4px",
              border: "2px",
              borderRadius: "10px",
            }}
            type="button"
            onClick={() => removeRange(p.start, p.end)}
          >
            {p.start.toLocaleDateString("ru-RU")}-
            {p.end.toLocaleDateString("ru-RU")}
          </button>
        </div>
      ))}
      {groupedDates.days.length > 0 && (
        <>
          <h3>Дни</h3>
          {groupedDates.days.map((d, i) => (
            <button
              className="btn-accent"
              style={{
                backgroundColor: "rgba(220,38,38,0.15)",
                color: "#b91c1c",
                fontWeight: "600",
                padding: "8px",
                marginBlock: "4px",
                border: "2px",
                borderRadius: "10px",
              }}
              key={i}
              type="button"
              onClick={() => removeDate(d)}
            >
              {d.toLocaleDateString("ru-RU")}
            </button>
          ))}
        </>
      )}
      <div>
        Нажмите &quot;Сохранить настройки&quot;, чтобы сохранить изменения в
        календаре и профиле
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--border-color)",
  borderRadius: 5,
  width: 26,
  height: 26,
  cursor: "pointer",
  fontSize: 16,
  lineHeight: 1,
  color: "var(--text-primary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};
