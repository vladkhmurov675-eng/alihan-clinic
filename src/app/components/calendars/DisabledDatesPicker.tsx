"use client";

import { useState, useCallback } from "react";

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
function toStr(y: number, m: number, d: number) {
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

export default function DisabledDatesPicker({ value, onChange }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [step, setStep] = useState<"year" | "month">("year");
  const [mode, setMode] = useState<"single" | "period">("single");
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [hoverDay, setHoverDay] = useState<string | null>(null);
  const [isDeleteMode, setDeleteMode] = useState(false);
  const [decade, setDecade] = useState<number[]>(currentDecade); 
  const disabled = new Set(value ? value.split(",").filter(Boolean) : []);
  
  const getPeriods = (dates: string[]) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const d = dates.map(date => new Date(date))
    const periods = [];
    let start = d[0];
    let previous = d[0];
    for (let i: number = 1; i < d.length; i++){
      const  current = d[i];
      if(current.getTime() - previous.getTime() > oneDay ){
        periods.push({
        start: start,
        end: previous
    });
        start = current;
      }
      previous = current;
      }
      periods.push({start: start, end: previous});
    
    return periods;
    }

  const commit = useCallback(
    (set: Set<string>) => {
      onChange([...set].sort().join(","));
    },
    [onChange],
  );

  const handleClick = (ds: string) => {
    if (mode === "single") {
      const next = new Set(disabled);

      if (isDeleteMode) {
        next.delete(ds);
      } else {
        if (next.has(ds)) next.delete(ds);
        else next.add(ds);
      }

      commit(next);
      return;
    }

    // Period mode
    if (!rangeStart) {
      setRangeStart(ds);
      setHoverDay(ds);
      return;
    }

    const next = new Set(disabled);

    if (isDeleteMode) {
      datesInRange(rangeStart, ds).forEach((d) => next.delete(d));
      setDeleteMode(false);
    } else {
      datesInRange(rangeStart, ds).forEach((d) => next.add(d));
    }

    commit(next);
    setRangeStart(null);
    setHoverDay(null);
  };

  const removeDate = (d: string) => {
    const next = new Set(disabled);
    next.delete(d);
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
  if (mode === "period" && rangeStart && hoverDay) {
    datesInRange(rangeStart, hoverDay).forEach((d) => previewDates.add(d));
  }

  const sorted = [...disabled].sort();

  return (
    <div className = "form-container" style={{maxWidth: 320}}>
      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {(["single", "period"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setRangeStart(null);
              setHoverDay(null);
            }}
            style={{
              flex: 1,
              padding: "5px 8px",
              border: "1px solid",
              borderColor: mode === m ? "var(--color-primary)" : "var(--border-color)",
              borderRadius: 7,
              background: mode === m ? "rgba(45,106,45,0.1)" : "transparent",
              color: mode === m ? "var(--color-primary)" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: mode === m ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            {m === "single" ? "📅 Один день" : "📆 Период"}
          </button>
        ))}
      </div>
      
      {/* Year grid */}
      {step === "year" && ( <>
      <div style={{display: "flex", alignItems: "center"}}>
      <button type = "button" className = "btn-text" onClick = {() => setDecade(decade.map(d => d - 10))}> ‹ </button>

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
            borderRadius: 7,
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
              className = "btn-text"
              style = {{backgroundColor: y === year ?  "var(--color-primary)" : '',
                color: y === year ? "white" : '',
                justifyContent: "center"
               }}
            >
              {y}
            </button>
          ))}
        </div>
       <button type = "button" className="btn-text" onClick={() => setDecade(decade.map(d => d + 10))}> › </button>
      </div>
      </>)}

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
              className = "btn-text"
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: "var(--text-primary)",
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
              const ds = toStr(year, month, d);
              const isDisabled = disabled.has(ds);
              const isStart = mode === "period" && rangeStart === ds;
              const isPreview =
                mode === "period" && previewDates.has(ds) && ds !== rangeStart;
              const isEnd = isPreview && ds === hoverDay;

              let bg = "transparent";
              let color = "var(--text-primary)";
              let fw: number | string = 400;
              const borderRadius = "5px";

              if (isDisabled && !isStart && !isEnd) {
                bg = "rgba(220,38,38,0.15)";
                color = "#b91c1c";
                fw = 600;
              }
              if (isStart) {
                bg = "var(--color-primary)";
                color = "#fff";
                fw = 700;
              } else if (isEnd) {
                bg = "var(--color-primary)";
                color = "#fff";
                fw = 700;
              } else if (isPreview) {
                bg = "rgba(45,106,45,0.12)";
                color = "var(--color-primary)";
              }

              return (
                <div
                  key={ds}
                  onClick={() => handleClick(ds)}
                  onMouseEnter={() =>
                    mode === "period" && rangeStart && setHoverDay(ds)
                  }
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    padding: "5px 2px",
                    borderRadius,
                    cursor: "pointer",
                    background: bg,
                    color,
                    fontWeight: fw,
                    transition: "background 0.1s",
                    userSelect: "none",
                  }}
                >
                  {d}
                </div>
              );
            })}
          </div>
 
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 10 }}>
            <button
              type="button"
              onClick={() => setDeleteMode((v) => !v)}
              style={{
                padding: "8px 12px",
                border: "1px solid var(--border-color)",
                borderRadius: 6,
                cursor: "pointer",
                background: isDeleteMode ? "rgba(220,38,38,0.1)" : "transparent",
                color: isDeleteMode ? "#b91c1c" : "var(--text-primary)",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {isDeleteMode ? "🗑 Удаление" : "✏️ Редактирование"}
            </button>
          </div>
          {/* Hint */}
          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 6,
              lineHeight: 1.4,
            }}
          >
            {mode === "single"
              ? "Нажмите на день чтобы добавить/убрать."
              : rangeStart
                ? "Выберите конечный день периода."
                : "Выберите начальный день периода."}
          </p>

        </>
      )}
      {Array.from(disabled).map((v) => (<>
          <h1>Периоды </h1>
          <div></div>
      </>))}
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