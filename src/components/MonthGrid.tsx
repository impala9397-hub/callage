import type { CSSProperties } from "react";
import type { CalEvent } from "../types";
import type { Density } from "../App";
import { CATEGORIES } from "../types";
import { TODAY } from "../App";
import { useI18n, loc, formatTimeTz, WEEKDAYS } from "../i18n";
import type { Lang } from "../i18n";
import {
  monthGrid,
  isSameMonth,
  dayOfMonth,
  weekdayOf,
} from "../lib/date";

interface Props {
  year: number;
  month: number;
  events: CalEvent[];
  density: Density;
  onSelect: (e: CalEvent) => void;
  selectedId: string | null;
  onAddOn: (date: string) => void;
  /** 이벤트별 색 지정(대회 뷰용). 없으면 카테고리 색. */
  colorOf?: (e: CalEvent) => string | undefined;
}

function colorFor(cat: CalEvent["category"]): string {
  const meta = CATEGORIES.find((c) => c.key === cat);
  return meta ? `var(${meta.colorVar})` : "var(--cat-other)";
}

// 경기면 "A vs B", 아니면 제목.
function headline(e: CalEvent, lang: Lang, vs: string): string {
  if (e.match) return `${loc(e.match.home, lang)} ${vs} ${loc(e.match.away, lang)}`;
  return loc(e.title, lang);
}

export function MonthGrid({ year, month, events, density, onSelect, selectedId, onAddOn, colorOf }: Props) {
  const { t, lang } = useI18n();
  const cells = monthGrid(year, month);
  const rich = density === "rich";

  const byDate = new Map<string, CalEvent[]>();
  for (const e of events) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }
  for (const list of byDate.values()) {
    list.sort((a, b) => (a.time ?? "99").localeCompare(b.time ?? "99"));
  }

  return (
    <div className={`grid-wrap ${rich ? "rich" : ""}`}>
      <div className="weekday-row">
        {WEEKDAYS[lang].map((w, i) => (
          <div key={w} className={`weekday ${i === 0 ? "sun" : ""} ${i === 6 ? "sat" : ""}`}>
            {w}
          </div>
        ))}
      </div>

      <div className={`month-grid ${rich ? "rich" : ""}`}>
        {cells.map((date) => {
          const inMonth = isSameMonth(date, year, month);
          const isToday = date === TODAY;
          const wd = weekdayOf(date);
          const dayEvents = byDate.get(date) ?? [];
          // rich: 전부 표시(셀이 늘어남). minimal: 3개 + 더보기.
          const shown = rich ? dayEvents : dayEvents.slice(0, 3);
          const extra = dayEvents.length - shown.length;

          return (
            <div key={date} className={`cell ${inMonth ? "" : "muted"}`}>
              <div className="cell-head">
                <span
                  className={`daynum ${isToday ? "today" : ""} ${wd === 0 ? "sun" : ""} ${wd === 6 ? "sat" : ""}`}
                >
                  {dayOfMonth(date)}
                </span>
                <button
                  className="cell-add"
                  onClick={() => onAddOn(date)}
                  aria-label={t("addOnDay", { d: dayOfMonth(date) })}
                >
                  +
                </button>
              </div>
              <div className="cell-events">
                {shown.map((e) =>
                  rich ? (
                    <button
                      key={e.id}
                      className={`ev-card ${e.starred ? "starred" : ""} ${selectedId === e.id ? "active" : ""}`}
                      style={{ "--pill": colorOf?.(e) ?? colorFor(e.category) } as CSSProperties}
                      onClick={() => onSelect(e)}
                    >
                      {e.time && <span className="ev-time">{formatTimeTz(e.time, lang)}</span>}
                      <span className="ev-headline">
                        {e.starred && <span className="ev-star">★</span>}
                        {e.emoji ? `${e.emoji} ` : ""}
                        {headline(e, lang, t("vs"))}
                      </span>
                      {(e.round || e.location) && (
                        <span className="ev-sub">
                          {[e.round && loc(e.round, lang), e.location && loc(e.location, lang)]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </button>
                  ) : (
                    <button
                      key={e.id}
                      className={`pill ${e.starred ? "starred" : ""} ${selectedId === e.id ? "active" : ""}`}
                      style={{ "--pill": colorOf?.(e) ?? colorFor(e.category) } as CSSProperties}
                      onClick={() => onSelect(e)}
                      title={loc(e.title, lang)}
                    >
                      {e.starred ? <span className="pill-star">★</span> : <span className="pill-dot" />}
                      <span className="pill-label">
                        {e.emoji ? `${e.emoji} ` : ""}
                        {loc(e.title, lang)}
                      </span>
                    </button>
                  ),
                )}
                {extra > 0 && <span className="more">{t("moreCount", { n: extra })}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
