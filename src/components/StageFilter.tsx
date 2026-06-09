import type { LocalizedText } from "../i18n";
import { useI18n, loc } from "../i18n";

export interface RoundOption {
  key: string;
  label: LocalizedText;
}

interface Props {
  rounds: RoundOption[];
  /** 선택된 단계 키. null이면 전체. */
  active: string | null;
  onPick: (key: string | null) => void;
}

export function StageFilter({ rounds, active, onPick }: Props) {
  const { t, lang } = useI18n();

  return (
    <div className="stage-bar">
      <span className="stage-label">{t("stagesLabel")}</span>
      <button
        className={`stage-chip all ${active === null ? "on" : ""}`}
        onClick={() => onPick(null)}
      >
        {t("allStages")}
      </button>
      {rounds.map((r) => (
        <button
          key={r.key}
          className={`stage-chip ${active === r.key ? "on" : ""}`}
          onClick={() => onPick(active === r.key ? null : r.key)}
        >
          {loc(r.label, lang)}
        </button>
      ))}
    </div>
  );
}
