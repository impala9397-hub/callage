// 레이어 1 소스 — TheSportsDB 무료 API.
// eventsday.php(무료)로 월의 각 날짜를 받아, 화이트리스트 리그만 골라 CalEvent로 변환.
// 시간은 UTC → 미 동부(ET)로 변환해 날짜·시간을 ET 기준으로 배치한다.
import type { CalEvent } from "../types";
import { daysInMonth, ymd } from "./date";

// 무료 공용 테스트 키. 레이트리밋이 빡세므로 개인 무료 키로 교체 권장.
// (thesportsdb.com 가입 → 본인 키로 "123" 자리만 바꾸면 됨)
const API_KEY = "123";
const API = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;
// 무료 티어 레이트리밋 때문에 일단 Soccer만 (월드컵). Basketball/NBA는 추후.
const SPORTS = ["Soccer"];

// 월 단위 결과를 localStorage에 캐시 — 무료 키 호출량 절약. (TTL 6시간)
const CACHE_TTL = 6 * 60 * 60 * 1000;

export function getCachedMonth(year: number, month: number): CalEvent[] | null {
  try {
    const raw = localStorage.getItem(`callage.src.${year}-${month}`);
    if (!raw) return null;
    const { ts, events } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return events as CalEvent[];
  } catch {
    return null;
  }
}

function setCachedMonth(year: number, month: number, events: CalEvent[]): void {
  try {
    localStorage.setItem(
      `callage.src.${year}-${month}`,
      JSON.stringify({ ts: Date.now(), events }),
    );
  } catch {
    // ignore
  }
}

// TheSportsDB strLeague → 우리 서브카테고리 + 이모지
const LEAGUES: Record<string, { sub: string; emoji: string }> = {
  "FIFA World Cup": { sub: "worldcup", emoji: "⚽" },
  "UEFA Champions League": { sub: "ucl", emoji: "⚽" },
  "English Premier League": { sub: "epl", emoji: "⚽" },
  "Spanish La Liga": { sub: "laliga", emoji: "⚽" },
  "Major League Soccer": { sub: "mls", emoji: "⚽" },
  "NBA": { sub: "nba", emoji: "🏀" },
};

const etDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
});
const etTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hour12: false,
});

function toET(ts: string): { date: string; time: string } | null {
  // 타임존 표기 없으면 UTC로 간주.
  const iso = /[zZ]|[+-]\d\d:?\d\d$/.test(ts) ? ts : `${ts}Z`;
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return null;
  return { date: etDate.format(dt), time: etTime.format(dt) };
}

interface RawEvent {
  idEvent?: string;
  strEvent?: string;
  strLeague?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  strVenue?: string;
  strTimestamp?: string;
  dateEvent?: string;
  strTime?: string;
}

function mapEvent(ev: RawEvent): CalEvent | null {
  const lg = ev.strLeague ? LEAGUES[ev.strLeague] : undefined;
  if (!lg || !ev.idEvent) return null;
  const ts =
    ev.strTimestamp ||
    (ev.dateEvent && ev.strTime ? `${ev.dateEvent}T${ev.strTime}` : "");
  const et = ts ? toET(ts) : ev.dateEvent ? { date: ev.dateEvent, time: "" } : null;
  if (!et) return null;
  const home = ev.strHomeTeam;
  const away = ev.strAwayTeam;
  return {
    id: `tsdb-${ev.idEvent}`,
    title: ev.strEvent || (home && away ? `${home} vs ${away}` : "Event"),
    category: "sports",
    sub: lg.sub,
    date: et.date,
    time: et.time || undefined,
    location: ev.strVenue || undefined,
    emoji: lg.emoji,
    ...(home && away ? { match: { home, away } } : {}),
  };
}

async function fetchDay(date: string, sport: string): Promise<RawEvent[] | null> {
  try {
    const r = await fetch(`${API}/eventsday.php?d=${date}&s=${sport}`);
    if (!r.ok) return null;
    const j = await r.json();
    return Array.isArray(j.events) ? j.events : [];
  } catch {
    return null;
  }
}

// 동시 요청 수 제한(레이트리밋 회피).
async function pool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return out;
}

/** 한 달치 이벤트를 TheSportsDB에서. 모든 요청 실패 시 throw(→ 호출부가 시드로 폴백). */
export async function fetchMonthEvents(year: number, month: number): Promise<CalEvent[]> {
  const n = daysInMonth(year, month);
  const dates = Array.from({ length: n }, (_, i) => ymd(year, month, i + 1));
  const jobs: { date: string; sport: string }[] = [];
  for (const sport of SPORTS) for (const d of dates) jobs.push({ date: d, sport });
  // 동시 4개씩만 — 무료 티어 레이트리밋 회피.
  const lists = await pool(jobs, 4, (j) => fetchDay(j.date, j.sport));
  if (lists.every((l) => l === null)) throw new Error("all requests failed");

  const seen = new Set<string>();
  const events: CalEvent[] = [];
  for (const list of lists) {
    if (!list) continue;
    for (const raw of list) {
      const mapped = mapEvent(raw);
      if (mapped && !seen.has(mapped.id)) {
        seen.add(mapped.id);
        events.push(mapped);
      }
    }
  }
  setCachedMonth(year, month, events);
  return events;
}
