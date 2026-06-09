import { useEffect, useMemo, useState } from "react";
import type { Category, CalEvent } from "./types";
import { CATEGORIES } from "./types";
import { EVENTS } from "./data/events";
import { loadUserLayer, saveUserLayer, newEventId, resolveEvents } from "./lib/storage";
import { isSameMonth } from "./lib/date";
import { useI18n } from "./i18n";
import type { I18nString } from "./i18n";
import { Sidebar } from "./components/Sidebar";
import { CalendarHeader } from "./components/CalendarHeader";
import { MonthGrid } from "./components/MonthGrid";
import { Timeline } from "./components/Timeline";
import { CompetitionView } from "./components/CompetitionView";
import { EventDetail } from "./components/EventDetail";
import { EventForm } from "./components/EventForm";
import "./App.css";

// "오늘" — 미 동부(ET) 기준 실제 현재 날짜. (소스 시간도 ET로 변환해 맞춤)
const ET_TODAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
});
export const TODAY = ET_TODAY.format(new Date());
const [TODAY_Y, TODAY_M] = TODAY.split("-").map(Number);

// 검색용 — 이벤트의 모든 텍스트(제목·팀·장소·단계·카테고리)를 합쳐 소문자로.
function eventText(e: CalEvent): string {
  const parts: string[] = [e.category, e.sub ?? ""];
  const add = (v?: I18nString) => {
    if (!v) return;
    if (typeof v === "string") parts.push(v);
    else parts.push(v.en, v.ko);
  };
  add(e.title);
  add(e.location);
  add(e.round);
  if (e.match) { add(e.match.home); add(e.match.away); }
  return parts.join(" ").toLowerCase();
}

export type ViewMode = "month" | "timeline" | "competition";
export type Density = "minimal" | "rich";
export type SourceStatus = "loading" | "live" | "demo";

// 폼 상태: 닫힘 | 새 이벤트(기본 날짜) | 기존 이벤트 편집
type FormState =
  | { mode: "closed" }
  | { mode: "create"; date: string }
  | { mode: "edit"; event: CalEvent };

export default function App() {
  const [year, setYear] = useState(TODAY_Y);
  const [month, setMonth] = useState(TODAY_M - 1); // 0-indexed
  const [active, setActive] = useState<Set<Category>>(
    () => new Set(CATEGORIES.map((c) => c.key)),
  );
  // 개별로 꺼둔 서브카테고리(리그) 키. 비어 있으면 전부 표시.
  const [offSubs, setOffSubs] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<CalEvent | null>(null);
  // 레이어 1: 소스 — 지금은 시드(events.ts)를 사용. (외부 API 연동은 sources.ts에 보존, 추후 재활성화)
  const [source, setSource] = useState<CalEvent[]>([]);
  const [status, setStatus] = useState<SourceStatus>("loading");
  const sourceIds = useMemo(() => new Set(source.map((e) => e.id)), [source]);
  // 레이어 2: 유저 변경분 — localStorage에 영속화.
  const [layer, setLayer] = useState(loadUserLayer);
  const [form, setForm] = useState<FormState>({ mode: "closed" });
  const [view, setView] = useState<ViewMode>("competition"); // 기본: 대회별
  const [density, setDensity] = useState<Density>("rich");
  const [query, setQuery] = useState("");
  const { lang } = useI18n();

  // 유저 레이어만 영속화 (소스는 저장하지 않음).
  useEffect(() => {
    saveUserLayer(layer);
  }, [layer]);

  // 보는 달이 바뀌면 시드(events.ts)에서 그 달 일정을 로드.
  useEffect(() => {
    setSource(EVENTS.filter((e) => isSameMonth(e.date, year, month)));
    setStatus("demo");
  }, [year, month]);

  // 소스 + 유저 레이어 → 전체 이벤트.
  const allEvents = useMemo(() => resolveEvents(source, layer), [source, layer]);

  // 대회별 뷰용 — 달에 상관없이 시드 전체(+유저 변경분).
  const fullEvents = useMemo(() => resolveEvents(EVENTS, layer), [layer]);

  // 카테고리·리그 필터까지 통과한 표시 집합.
  const visibleEvents = useMemo(
    () =>
      allEvents.filter(
        (e) => active.has(e.category) && !(e.sub && offSubs.has(e.sub)),
      ),
    [allEvents, active, offSubs],
  );

  // 검색어 필터 — 월간/타임라인(visibleEvents)과 대회별(fullEvents) 모두에 적용.
  const q = query.trim().toLowerCase();
  const displayEvents = useMemo(
    () => (q ? visibleEvents.filter((e) => eventText(e).includes(q)) : visibleEvents),
    [visibleEvents, q],
  );
  const compEvents = useMemo(
    () => (q ? fullEvents.filter((e) => eventText(e).includes(q)) : fullEvents),
    [fullEvents, q],
  );

  function toggleCategory(key: Category) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleSub(key: string) {
    setOffSubs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }


  function goToday() {
    setYear(TODAY_Y);
    setMonth(TODAY_M - 1);
  }

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
  }

  function saveEvent(draft: CalEvent) {
    if (!draft.id) {
      // 신규 → 유저 레이어에 추가
      const created = { ...draft, id: newEventId() };
      setLayer((l) => ({ ...l, added: [...l.added, created] }));
    } else if (sourceIds.has(draft.id)) {
      // 소스 이벤트 편집 → override로 기록 (시드 원본은 그대로)
      setLayer((l) => ({ ...l, overrides: { ...l.overrides, [draft.id]: draft } }));
      setSelected((cur) => (cur?.id === draft.id ? draft : cur));
    } else {
      // 내가 추가한 이벤트 편집
      setLayer((l) => ({ ...l, added: l.added.map((e) => (e.id === draft.id ? draft : e)) }));
      setSelected((cur) => (cur?.id === draft.id ? draft : cur));
    }
    setForm({ mode: "closed" });
  }

  function deleteEvent(id: string) {
    if (sourceIds.has(id)) {
      // 소스 이벤트 → 숨김 목록에 추가 (override도 정리)
      setLayer((l) => {
        const overrides = { ...l.overrides };
        delete overrides[id];
        return { ...l, hidden: [...l.hidden, id], overrides };
      });
    } else {
      // 내가 추가한 이벤트 → 그냥 제거
      setLayer((l) => ({ ...l, added: l.added.filter((e) => e.id !== id) }));
    }
    setSelected((cur) => (cur?.id === id ? null : cur));
  }

  return (
    <div className="app">
      <Sidebar
        events={visibleEvents}
        active={active}
        offSubs={offSubs}
        onToggle={toggleCategory}
        onToggleSub={toggleSub}
        onSelect={setSelected}
        selectedId={selected?.id ?? null}
      />
      <main className="main">
        <CalendarHeader
          year={year}
          month={month}
          status={status}
          view={view}
          onView={setView}
          density={density}
          onDensity={setDensity}
          onPrev={() => shiftMonth(-1)}
          onNext={() => shiftMonth(1)}
          onToday={goToday}
          onAdd={() => setForm({ mode: "create", date: TODAY })}
        />
        <div className="searchbar">
          <span className="searchbar-icon">🔎</span>
          <input
            className="searchbar-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === "ko" ? "검색 — 대한민국, 닉스, MSG…" : "Search — Korea, Knicks, MSG…"}
          />
          {query && (
            <button className="searchbar-clear" onClick={() => setQuery("")} aria-label="clear">✕</button>
          )}
        </div>
        {view === "month" ? (
          <MonthGrid
            year={year}
            month={month}
            events={displayEvents}
            density={density}
            onSelect={setSelected}
            selectedId={selected?.id ?? null}
            onAddOn={(date) => setForm({ mode: "create", date })}
          />
        ) : view === "timeline" ? (
          <Timeline
            year={year}
            month={month}
            events={displayEvents}
            onSelect={setSelected}
            selectedId={selected?.id ?? null}
          />
        ) : (
          <CompetitionView
            events={compEvents}
            onSelect={setSelected}
            selectedId={selected?.id ?? null}
            onAddOn={(date) => setForm({ mode: "create", date })}
          />
        )}
      </main>
      <EventDetail
        event={selected}
        onClose={() => setSelected(null)}
        onEdit={(e) => setForm({ mode: "edit", event: e })}
        onDelete={deleteEvent}
      />
      {form.mode !== "closed" && (
        <EventForm
          initial={form.mode === "edit" ? form.event : null}
          defaultDate={form.mode === "create" ? form.date : TODAY}
          onSave={saveEvent}
          onClose={() => setForm({ mode: "closed" })}
        />
      )}
    </div>
  );
}
