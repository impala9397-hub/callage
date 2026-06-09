import { useState } from "react";
import type { Category, CalEvent } from "../types";
import { CATEGORIES, SUBCATEGORIES } from "../types";
import { useI18n, loc } from "../i18n";

interface Props {
  /** 편집 대상. null이면 새 이벤트. */
  initial: CalEvent | null;
  /** 새 이벤트의 기본 날짜 (셀 클릭 등). */
  defaultDate: string;
  onSave: (event: CalEvent) => void;
  onClose: () => void;
}

// 카테고리별 기본 이모지 — 유저가 직접 지정하지 않았을 때.
const FALLBACK_EMOJI: Record<Category, string> = {
  sports: "🏟️",
  esports: "🎮",
  music: "🎵",
  personal: "📌",
  other: "•",
};

export function EventForm({ initial, defaultDate, onSave, onClose }: Props) {
  const { t, lang } = useI18n();
  const editing = initial !== null;
  const [title, setTitle] = useState(loc(initial?.title, lang));
  const [category, setCategory] = useState<Category>(initial?.category ?? "sports");
  const [sub, setSub] = useState<string>(initial?.sub ?? "");
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [time, setTime] = useState(initial?.time ?? "");
  const [location, setLocation] = useState(loc(initial?.location, lang));
  const [emoji, setEmoji] = useState(initial?.emoji ?? "");
  const [description, setDescription] = useState(loc(initial?.description, lang));

  const subs = SUBCATEGORIES[category];
  const canSave = title.trim() !== "" && date !== "";

  function pickCategory(key: Category) {
    setCategory(key);
    // 새 카테고리에 없는 서브카테고리면 초기화
    if (!SUBCATEGORIES[key].some((s) => s.key === sub)) setSub("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    onSave({
      id: initial?.id ?? "", // App에서 새 id 부여
      title: title.trim(),
      category,
      sub: sub || undefined,
      date,
      time: time || undefined,
      location: location.trim() || undefined,
      emoji: emoji.trim() || FALLBACK_EMOJI[category],
      description: description.trim() || undefined,
    });
  }

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal" role="dialog" aria-label={editing ? t("form_edit") : t("form_new")}>
        <div className="modal-head">
          <h2 className="modal-title">{editing ? t("form_edit") : t("form_new")}</h2>
          <button className="btn icon" onClick={onClose} aria-label={t("closeLabel")}>✕</button>
        </div>

        <form className="form" onSubmit={submit}>
          <label className="field">
            <span className="field-label">{t("f_title")}</span>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("ph_title")}
              autoFocus
            />
          </label>

          <label className="field">
            <span className="field-label">{t("f_category")}</span>
            <div className="cat-picker">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.key}
                  className={`cat-chip ${category === c.key ? "on" : ""}`}
                  onClick={() => pickCategory(c.key)}
                >
                  <span className="dot" style={{ background: `var(${c.colorVar})` }} />
                  {loc(c.label, lang)}
                </button>
              ))}
            </div>
          </label>

          {subs.length > 0 && (
            <div className="field">
              <span className="field-label">
                {t("f_subcategory")} <span className="opt">{t("optional")}</span>
              </span>
              <div className="cat-picker">
                <button
                  type="button"
                  className={`cat-chip ${sub === "" ? "on" : ""}`}
                  onClick={() => setSub("")}
                >
                  {t("sub_none")}
                </button>
                {subs.map((s) => (
                  <button
                    type="button"
                    key={s.key}
                    className={`cat-chip ${sub === s.key ? "on" : ""}`}
                    onClick={() => setSub(s.key)}
                  >
                    {loc(s.label, lang)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="field-row">
            <label className="field">
              <span className="field-label">{t("f_date")}</span>
              <input
                className="input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">{t("f_time")} <span className="opt">{t("optional")}</span></span>
              <input
                className="input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>
          </div>

          <div className="field-row">
            <label className="field grow">
              <span className="field-label">{t("f_location")} <span className="opt">{t("optional")}</span></span>
              <input
                className="input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("ph_location")}
              />
            </label>
            <label className="field emoji-field">
              <span className="field-label">{t("f_emoji")}</span>
              <input
                className="input"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder={FALLBACK_EMOJI[category]}
                maxLength={2}
              />
            </label>
          </div>

          <label className="field">
            <span className="field-label">{t("f_note")} <span className="opt">{t("optional")}</span></span>
            <textarea
              className="input textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t("ph_note")}
            />
          </label>

          <div className="form-actions">
            <button type="button" className="btn ghost" onClick={onClose}>{t("cancel")}</button>
            <button type="submit" className="btn primary" disabled={!canSave}>
              {editing ? t("save") : t("add")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
