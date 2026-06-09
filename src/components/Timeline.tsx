import type { CSSProperties } from "react";
import type { CalEvent } from "../types";
import type { LocalizedText } from "../i18n";
import { CATEGORIES, SUBCATEGORIES } from "../types";
import { TODAY } from "../App";
import { useI18n, loc } from "../i18n";
import { daysInMonth, isSameMonth, dayOfMonth } from "../lib/date";

interface Props {
  year: number;
  month: number;
  events: CalEvent[];
  onSelect: (e: CalEvent) => void;
  selectedId: string | null;
}

interface Placed {
  e: CalEvent;
  day: number;
  row: number;
}

interface Lane {
  key: string;
  label: LocalizedText;
  colorVar: string;
  items: Placed[];
  rows: number;
}

const ROW_H = 28; // 한 줄 높이(px)
const LANE_PAD = 10; // 레인 상하 여백(px)
const CHIP_DAYS = 4; // 칩 폭 근사(일) — 이보다 가까우면 다음 줄로 쌓음

// 같은 레인에서 날짜가 가까운 칩들을 세로로 쌓아 겹침 방지(greedy row packing).
function packLane(events: CalEvent[]): { items: Placed[]; rows: number } {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const rowEnd: number[] = []; // 각 줄의 마지막 점유 day
  const items: Placed[] = sorted.map((e) => {
    const day = dayOfMonth(e.date);
    let row = rowEnd.findIndex((end) => day - end >= CHIP_DAYS);
    if (row === -1) {
      row = rowEnd.length;
      rowEnd.push(day);
    } else {
      rowEnd[row] = day;
    }
    return { e, day, row };
  });
  return { items, rows: Math.max(1, rowEnd.length) };
}

// 날짜(1..total)를 트랙 내 left%로. 칸 중앙에 배치.
function leftPct(day: number, total: number): number {
  return ((day - 0.5) / total) * 100;
}

export function Timeline({ year, month, events, onSelect, selectedId }: Props) {
  const { t, lang } = useI18n();
  const total = daysInMonth(year, month);
  const inMonth = events.filter((e) => isSameMonth(e.date, year, month));

  // 대회(서브카테고리) 레인 우선, 그다음 서브 없는 카테고리 레인.
  const lanes: Lane[] = [];
  for (const cat of CATEGORIES) {
    const catEvents = inMonth.filter((e) => e.category === cat.key);
    if (catEvents.length === 0) continue;
    for (const s of SUBCATEGORIES[cat.key]) {
      const se = catEvents.filter((e) => e.sub === s.key);
      if (se.length) {
        const { items, rows } = packLane(se);
        lanes.push({ key: `${cat.key}:${s.key}`, label: s.label, colorVar: cat.colorVar, items, rows });
      }
    }
    const noSub = catEvents.filter((e) => !e.sub);
    if (noSub.length) {
      const { items, rows } = packLane(noSub);
      lanes.push({ key: cat.key, label: cat.label, colorVar: cat.colorVar, items, rows });
    }
  }

  const todayDay = isSameMonth(TODAY, year, month) ? dayOfMonth(TODAY) : null;
  const ticks = Array.from(new Set([1, 5, 10, 15, 20, 25, total])).filter((d) => d <= total);

  if (lanes.length === 0) {
    return <div className="timeline empty-view">{t("noEventsMonth")}</div>;
  }

  return (
    <div className="timeline">
      <div className="tl-axis">
        <div className="tl-gutter" />
        <div className="tl-track tl-axis-track">
          {ticks.map((d) => (
            <span key={d} className="tl-tick" style={{ left: `${leftPct(d, total)}%` }}>
              {d}
            </span>
          ))}
          {todayDay !== null && (
            <span className="tl-today-label" style={{ left: `${leftPct(todayDay, total)}%` }}>
              {t("today")}
            </span>
          )}
        </div>
      </div>

      <div className="tl-lanes">
        {lanes.map((lane) => (
          <div
            key={lane.key}
            className="tl-lane"
            style={{ minHeight: LANE_PAD * 2 + lane.rows * ROW_H }}
          >
            <div className="tl-gutter tl-lane-head">
              <span className="dot" style={{ background: `var(${lane.colorVar})` }} />
              <span className="tl-lane-name">{loc(lane.label, lang)}</span>
            </div>
            <div className="tl-track">
              {todayDay !== null && (
                <span className="tl-today-line" style={{ left: `${leftPct(todayDay, total)}%` }} />
              )}
              {lane.items.map(({ e, day, row }) => (
                <button
                  key={e.id}
                  className={[
                    "tl-chip",
                    e.homeAway ? `ha-${e.homeAway}` : "",
                    e.starred ? "starred" : "",
                    selectedId === e.id ? "active" : "",
                  ].join(" ")}
                  style={{
                    left: `${leftPct(day, total)}%`,
                    top: LANE_PAD + row * ROW_H + ROW_H / 2,
                    "--pill": `var(${lane.colorVar})`,
                  } as CSSProperties}
                  onClick={() => onSelect(e)}
                  title={loc(e.title, lang)}
                >
                  {e.starred && <span className="tl-star">★</span>}
                  <span className="tl-emoji">{e.emoji ?? "•"}</span>
                  {e.round && <span className="tl-round">{loc(e.round, lang)}</span>}
                  {e.homeAway && (
                    <span className="tl-ha">{e.homeAway === "home" ? t("home") : t("away")}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
