import { useState } from "react";
import type { Category, CalEvent } from "../types";
import { CATEGORIES, SUBCATEGORIES } from "../types";
import { TODAY } from "../App";
import { useI18n, loc, formatTime } from "../i18n";

interface Props {
  events: CalEvent[];
  active: Set<Category>;
  offSubs: Set<string>;
  onToggle: (key: Category) => void;
  onToggleSub: (key: string) => void;
  onSelect: (e: CalEvent) => void;
  selectedId: string | null;
}

export function Sidebar({
  events,
  active,
  offSubs,
  onToggle,
  onToggleSub,
  onSelect,
  selectedId,
}: Props) {
  const { t, lang, setLang } = useI18n();
  const [expanded, setExpanded] = useState<Set<Category>>(() => new Set());

  const upcoming = events
    .filter((e) => e.date >= TODAY)
    .sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")))
    .slice(0, 6);

  function toggleExpand(key: Category) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">◧</span>
        <span className="brand-name">Callage</span>
      </div>

      <nav className="filters">
        <p className="section-label">{t("categories")}</p>
        {CATEGORIES.map((c) => {
          const subs = SUBCATEGORIES[c.key];
          const hasSubs = subs.length > 0;
          const isOpen = expanded.has(c.key);
          return (
            <div key={c.key} className="filter-group">
              <div className="filter-row">
                <button
                  className={`filter ${active.has(c.key) ? "on" : "off"}`}
                  onClick={() => onToggle(c.key)}
                >
                  <span className="dot" style={{ background: `var(${c.colorVar})` }} />
                  {loc(c.label, lang)}
                </button>
                {hasSubs && (
                  <button
                    className={`filter-expand ${isOpen ? "open" : ""}`}
                    onClick={() => toggleExpand(c.key)}
                    aria-label={loc(c.label, lang)}
                    aria-expanded={isOpen}
                  >
                    <span className="chev">›</span>
                  </button>
                )}
              </div>
              {hasSubs && isOpen && (
                <div className="sub-list">
                  {subs.map((s) => (
                    <button
                      key={s.key}
                      className={`subfilter ${!offSubs.has(s.key) ? "on" : "off"}`}
                      onClick={() => onToggleSub(s.key)}
                    >
                      <span
                        className="dot sm"
                        style={{ background: `var(${c.colorVar})` }}
                      />
                      {loc(s.label, lang)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="upcoming">
        <p className="section-label">{t("upcoming")}</p>
        {upcoming.length === 0 && <p className="empty">{t("noUpcoming")}</p>}
        {upcoming.map((e) => (
          <button
            key={e.id}
            className={`up-item ${selectedId === e.id ? "active" : ""}`}
            onClick={() => onSelect(e)}
          >
            <span className="up-emoji">{e.emoji ?? "•"}</span>
            <span className="up-text">
              <span className="up-title">{loc(e.title, lang)}</span>
              <span className="up-meta">
                {e.date.slice(5).replace("-", "/")}
                {e.time ? ` · ${formatTime(e.time, lang)}` : ""}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="lang-switch">
        <button
          className={`lang-opt ${lang === "en" ? "on" : ""}`}
          onClick={() => setLang("en")}
        >
          EN
        </button>
        <button
          className={`lang-opt ${lang === "ko" ? "on" : ""}`}
          onClick={() => setLang("ko")}
        >
          한국어
        </button>
      </div>
    </aside>
  );
}
