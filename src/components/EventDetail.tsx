import type { CalEvent } from "../types";
import { CATEGORIES } from "../types";
import { useI18n, loc, formatFullDate, formatTimeTz } from "../i18n";

interface Props {
  event: CalEvent | null;
  onClose: () => void;
  onEdit: (e: CalEvent) => void;
  onDelete: (id: string) => void;
}

export function EventDetail({ event, onClose, onEdit, onDelete }: Props) {
  const { t, lang } = useI18n();
  if (!event) return null;
  const meta = CATEGORIES.find((c) => c.key === event.category);

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="detail" role="dialog" aria-label={t("eventDetail")}>
        <div className="detail-head">
          <span
            className="detail-cat"
            style={{ background: `var(${meta?.colorVar})` }}
          >
            {loc(meta?.label, lang)}
          </span>
          <button className="btn icon" onClick={onClose} aria-label={t("closeLabel")}>✕</button>
        </div>

        <h2 className="detail-title">
          {event.emoji ? `${event.emoji} ` : ""}
          {loc(event.title, lang)}
        </h2>

        <dl className="detail-meta">
          {event.match && (
            <div>
              <dt>{t("detail_match")}</dt>
              <dd>{loc(event.match.home, lang)} {t("vs")} {loc(event.match.away, lang)}</dd>
            </div>
          )}
          <div>
            <dt>{t("detail_date")}</dt>
            <dd>{formatFullDate(event.date, lang)}</dd>
          </div>
          {event.time && (
            <div>
              <dt>{t("detail_time")}</dt>
              <dd>{formatTimeTz(event.time, lang)}</dd>
            </div>
          )}
          {event.location && (
            <div>
              <dt>{t("detail_location")}</dt>
              <dd>{loc(event.location, lang)}</dd>
            </div>
          )}
          {event.round && (
            <div>
              <dt>{t("detail_round")}</dt>
              <dd>{loc(event.round, lang)}</dd>
            </div>
          )}
          {event.homeAway && (
            <div>
              <dt>{t("detail_homeaway")}</dt>
              <dd>{event.homeAway === "home" ? t("home") : t("away")}</dd>
            </div>
          )}
        </dl>

        {event.description && <p className="detail-desc">{loc(event.description, lang)}</p>}

        <div className="detail-actions">
          <div className="detail-edit-row">
            <button className="btn ghost" onClick={() => onEdit(event)}>{t("edit")}</button>
            <button
              className="btn ghost danger"
              onClick={() => {
                if (confirm(t("deleteConfirm", { title: loc(event.title, lang) }))) {
                  onDelete(event.id);
                }
              }}
            >
              {t("delete")}
            </button>
          </div>
          {/* 소셜 기능 자리 — v2에서 공유·투표·그룹 */}
          <button className="btn primary" disabled>{t("detail_share")}</button>
        </div>
      </aside>
    </>
  );
}
