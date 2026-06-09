import type { ViewMode, Density, SourceStatus } from "../App";
import { useI18n, MONTHS } from "../i18n";

interface Props {
  year: number;
  month: number;
  status: SourceStatus;
  view: ViewMode;
  onView: (v: ViewMode) => void;
  density: Density;
  onDensity: (d: Density) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAdd: () => void;
}

export function CalendarHeader({
  year, month, status, view, onView, density, onDensity, onPrev, onNext, onToday, onAdd,
}: Props) {
  const { t, lang } = useI18n();
  const monthName = MONTHS[lang][month];
  const statusText =
    status === "live" ? t("status_live") : status === "demo" ? t("status_demo") : t("status_loading");

  return (
    <header className="cal-header">
      <div className="title-group">
        <h1 className="cal-title">
          {view === "competition" ? (
            <span className="cal-month">{lang === "ko" ? "대회별 보기" : "Competitions"}</span>
          ) : lang === "ko" ? (
            <>{year}년 <span className="cal-month">{monthName}</span></>
          ) : (
            <><span className="cal-month">{monthName}</span> {year}</>
          )}
        </h1>
        <span className={`data-status ${status}`}>
          <span className="data-dot" />
          {statusText}
        </span>
      </div>
      <div className="nav-group">
        <div className="view-switch">
          <button
            className={`view-opt ${view === "month" ? "on" : ""}`}
            onClick={() => onView("month")}
          >
            {t("view_month")}
          </button>
          <button
            className={`view-opt ${view === "timeline" ? "on" : ""}`}
            onClick={() => onView("timeline")}
          >
            {t("view_timeline")}
          </button>
          <button
            className={`view-opt ${view === "competition" ? "on" : ""}`}
            onClick={() => onView("competition")}
          >
            {t("view_competition")}
          </button>
        </div>
        {view === "month" && (
          <div className="view-switch">
            <button
              className={`view-opt ${density === "minimal" ? "on" : ""}`}
              onClick={() => onDensity("minimal")}
            >
              {t("density_minimal")}
            </button>
            <button
              className={`view-opt ${density === "rich" ? "on" : ""}`}
              onClick={() => onDensity("rich")}
            >
              {t("density_rich")}
            </button>
          </div>
        )}
        <button className="btn primary" onClick={onAdd}>{t("addEvent")}</button>
        {view !== "competition" && (
          <>
            <button className="btn ghost" onClick={onToday}>{t("today")}</button>
            <div className="arrows">
              <button className="btn icon" onClick={onPrev} aria-label={t("prevMonth")}>‹</button>
              <button className="btn icon" onClick={onNext} aria-label={t("nextMonth")}>›</button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
