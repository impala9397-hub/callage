import { Fragment, useMemo, useState } from "react";
import type { CalEvent } from "../types";
import type { I18nString, LocalizedText } from "../i18n";
import { useI18n, loc, MONTHS, formatTimeTz, WEEKDAYS } from "../i18n";
import { inMonthGrid, weekdayOf } from "../lib/date";
import { MonthGrid } from "./MonthGrid";

// ===== 이벤트별 색 (대회 안에서 의미를 갖게) =====
const TEAM_COLOR: Record<string, string> = {
  Knicks: "#1e66c7", // 닉스 블루
  Spurs: "#4b5563",  // 스퍼스 차콜
};
const WC_STAGE_COLOR: Record<string, string> = {
  "Group Stage": "#3fa796",
  "Round of 32": "#5c7aea",
  "Round of 16": "#8b5cf6",
  "Quarter-final": "#ec8c3c",
  "Semi-final": "#e8643b",
  "Third Place": "#9ca3af",
  "Final": "#e0a92e",
};
const LOL_COLOR: Record<string, string> = {
  msi: "#6d5cf0",
  worlds: "#c026d3",
};
const FALLBACK_COLOR = "#d6336c";

function enOf(v: I18nString): string {
  return typeof v === "string" ? v : v.en;
}

function md(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${m}/${d}`;
}

// 대회별 이벤트 색 — 없으면 undefined(→ MonthGrid가 카테고리 색 사용)
function compColor(comp: Comp, e: CalEvent): string | undefined {
  if (comp.key === "nba" && e.match) return TEAM_COLOR[enOf(e.match.home)];
  if (comp.key === "worldcup" && e.round) return WC_STAGE_COLOR[e.round.en];
  if (comp.key === "lol" && e.sub) return LOL_COLOR[e.sub];
  return undefined;
}

// 대회 정의 — "하나하나 집중해서 보기"의 단위.
interface Comp {
  key: string;
  emoji: string;
  label: LocalizedText;
  blurb?: LocalizedText;
  match: (e: CalEvent) => boolean;
  format?: { note?: LocalizedText; stages?: { label: LocalizedText; color?: string }[] };
  legend?: { color: string; label: LocalizedText }[];
}

const COMPETITIONS: Comp[] = [
  {
    key: "nba", emoji: "🏀", label: { en: "NBA Finals", ko: "NBA 파이널" }, blurb: { en: "Knicks vs Spurs", ko: "닉스 vs 스퍼스" },
    match: (e) => e.sub === "nba",
    format: { note: { en: "Best-of-7 · first to 4 wins · venues 2-2-1-1-1", ko: "7전 4선승제 · 홈/원정 2-2-1-1-1" } },
    legend: [
      { color: TEAM_COLOR.Knicks, label: { en: "Knicks home", ko: "닉스 홈" } },
      { color: TEAM_COLOR.Spurs, label: { en: "Spurs home", ko: "스퍼스 홈" } },
    ],
  },
  {
    key: "worldcup", emoji: "⚽", label: { en: "World Cup 2026", ko: "월드컵 2026" },
    match: (e) => e.sub === "worldcup",
    format: {
      note: { en: "48 teams · 12 groups", ko: "48개국 · 12개 조" },
      stages: [
        { label: { en: "Groups", ko: "조별리그" }, color: WC_STAGE_COLOR["Group Stage"] },
        { label: { en: "R32", ko: "32강" }, color: WC_STAGE_COLOR["Round of 32"] },
        { label: { en: "R16", ko: "16강" }, color: WC_STAGE_COLOR["Round of 16"] },
        { label: { en: "QF", ko: "8강" }, color: WC_STAGE_COLOR["Quarter-final"] },
        { label: { en: "SF", ko: "준결승" }, color: WC_STAGE_COLOR["Semi-final"] },
        { label: { en: "Final", ko: "결승" }, color: WC_STAGE_COLOR["Final"] },
      ],
    },
  },
  {
    key: "lol", emoji: "🎮", label: { en: "LoL Internationals", ko: "LoL 국제대회" },
    match: (e) => e.category === "esports",
    format: {
      note: { en: "MSI (Jun) · Worlds (Oct–Nov)", ko: "MSI(6월) · Worlds(10~11월)" },
      stages: [
        { label: { en: "Play-In", ko: "플레이인" } }, { label: { en: "Swiss/Bracket", ko: "스위스/브래킷" } },
        { label: { en: "Knockout", ko: "녹아웃" } }, { label: { en: "Final", ko: "결승" } },
      ],
    },
    legend: [
      { color: LOL_COLOR.msi, label: { en: "MSI", ko: "MSI" } },
      { color: LOL_COLOR.worlds, label: { en: "Worlds", ko: "Worlds" } },
    ],
  },
  { key: "concert", emoji: "🎤", label: { en: "Concerts", ko: "콘서트" }, match: (e) => e.category === "music" },
];

function sortedFor(events: CalEvent[], comp: Comp): CalEvent[] {
  return events
    .filter(comp.match)
    .sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
}

function firstYm(events: CalEvent[], comp: Comp): { y: number; m: number } {
  const evs = sortedFor(events, comp);
  if (!evs.length) return { y: 2026, m: 5 };
  const [y, m] = evs[0].date.split("-").map(Number);
  return { y, m: m - 1 };
}

interface Props {
  events: CalEvent[];
  onSelect: (e: CalEvent) => void;
  selectedId: string | null;
  onAddOn: (date: string) => void;
}

export function CompetitionView({ events, onSelect, selectedId, onAddOn }: Props) {
  const { lang } = useI18n();
  const [compKey, setCompKey] = useState(COMPETITIONS[0].key);
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const [ym, setYm] = useState(() => firstYm(events, COMPETITIONS[0]));

  const comp = COMPETITIONS.find((c) => c.key === compKey) ?? COMPETITIONS[0];

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of COMPETITIONS) m[c.key] = events.filter(c.match).length;
    return m;
  }, [events]);

  // 전체(모든 달) — 리스트용
  const allCompEvents = useMemo(() => sortedFor(events, comp), [events, comp]);
  // 이번 달만 — 그리드용
  const monthEvents = useMemo(
    () => events.filter((e) => comp.match(e) && inMonthGrid(e.date, ym.y, ym.m)),
    [events, comp, ym],
  );

  function pickComp(k: string) {
    const c = COMPETITIONS.find((x) => x.key === k) ?? COMPETITIONS[0];
    setCompKey(k);
    setYm(firstYm(events, c));
  }

  function shiftMonth(delta: number) {
    setYm((cur) => {
      let m = cur.m + delta;
      let y = cur.y;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { y, m };
    });
  }

  const monthLabel =
    lang === "ko" ? `${ym.y}년 ${MONTHS.ko[ym.m]}` : `${MONTHS.en[ym.m]} ${ym.y}`;

  return (
    <div className="comp-view">
      {/* 대회 선택 */}
      <div className="comp-tabs">
        {COMPETITIONS.map((c) => (
          <button
            key={c.key}
            className={`comp-tab ${c.key === compKey ? "on" : ""}`}
            onClick={() => pickComp(c.key)}
          >
            <span className="comp-tab-emoji">{c.emoji}</span>
            <span className="comp-tab-label">{loc(c.label, lang)}</span>
            <span className="comp-tab-count">{counts[c.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* 헤더 + 그리드/리스트 토글 + 월 이동 */}
      <div className="comp-head">
        <h2 className="comp-title">{comp.emoji} {loc(comp.label, lang)}</h2>
        {comp.blurb && <span className="comp-blurb">{loc(comp.blurb, lang)}</span>}
        <div className="comp-head-right">
          <div className="view-switch">
            <button
              className={`view-opt ${mode === "grid" ? "on" : ""}`}
              onClick={() => setMode("grid")}
              aria-label="grid"
            >📅</button>
            <button
              className={`view-opt ${mode === "list" ? "on" : ""}`}
              onClick={() => setMode("list")}
              aria-label="list"
            >☰</button>
          </div>
          {mode === "grid" && (
            <div className="comp-monthnav">
              <button className="btn icon" onClick={() => shiftMonth(-1)} aria-label="prev">‹</button>
              <span className="comp-monthlabel">{monthLabel}</span>
              <button className="btn icon" onClick={() => shiftMonth(1)} aria-label="next">›</button>
            </div>
          )}
        </div>
      </div>

      {/* 진행 방식 + 색 범례 */}
      {(comp.format || comp.legend) && (
        <div className="comp-format">
          {comp.format?.note && <span className="comp-format-note">{loc(comp.format.note, lang)}</span>}
          {comp.format?.stages && (
            <div className="comp-format-flow">
              {comp.format.stages.map((s, i) => (
                <Fragment key={i}>
                  {i > 0 && <span className="comp-format-arrow">→</span>}
                  <span
                    className="comp-format-stage"
                    style={s.color ? { borderLeftColor: s.color, borderLeftWidth: "3px" } : undefined}
                  >
                    {loc(s.label, lang)}
                  </span>
                </Fragment>
              ))}
            </div>
          )}
          {comp.legend && (
            <div className="comp-legend">
              {comp.legend.map((l, i) => (
                <span className="comp-legend-item" key={i}>
                  <span className="comp-legend-dot" style={{ background: l.color }} />
                  {loc(l.label, lang)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 그리드(달력) 또는 리스트 */}
      {mode === "grid" ? (
        <MonthGrid
          year={ym.y}
          month={ym.m}
          events={monthEvents}
          density="rich"
          onSelect={onSelect}
          selectedId={selectedId}
          onAddOn={onAddOn}
          colorOf={(e) => compColor(comp, e)}
        />
      ) : (
        <ul className="comp-list">
          {allCompEvents.map((e) => (
            <li key={e.id}>
              <button
                className={`comp-row ${e.id === selectedId ? "active" : ""}`}
                style={{ borderLeftColor: compColor(comp, e) ?? FALLBACK_COLOR }}
                onClick={() => onSelect(e)}
              >
                <span className="comp-row-date">
                  <span className="cr-md">{md(e.date)}</span>
                  <span className="cr-wd">{WEEKDAYS[lang][weekdayOf(e.date)]}</span>
                </span>
                <span className="comp-row-main">
                  <span className="comp-row-title">
                    {e.starred && <span className="cr-star">⭐</span>}
                    {e.emoji ? `${e.emoji} ` : ""}
                    {loc(e.title, lang)}
                  </span>
                  {e.match && (
                    <span className="comp-row-match">
                      {loc(e.match.home, lang)} vs {loc(e.match.away, lang)}
                    </span>
                  )}
                  {e.location && <span className="comp-row-loc">{loc(e.location, lang)}</span>}
                </span>
                <span className="comp-row-right">
                  {e.round && <span className="comp-row-round">{loc(e.round, lang)}</span>}
                  {e.time && <span className="comp-row-time">{formatTimeTz(e.time, lang)}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
