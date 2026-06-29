import type { I18nString, LocalizedText } from "./i18n";

export type Category = "sports" | "esports" | "music" | "personal" | "other";

export interface CalEvent {
  id: string;
  /** 유저 입력은 문자열, 시드는 다국어. */
  title: I18nString;
  category: Category;
  /** 서브카테고리(리그) 키 — SUBCATEGORIES 참조. 없으면 분류 안 함. */
  sub?: string;
  /** 대회 내 단계 — 조별리그/16강/G1 등. 도메인 뷰·필터의 핵심. */
  round?: LocalizedText;
  /** 홈/원정 (스포츠 경기). */
  homeAway?: "home" | "away";
  /** 대진 — 누가 누구랑. home 팀을 앞에 두는 관례. */
  match?: { home: I18nString; away: I18nString };
  /** 내가 따라가는 핵심 일정 — 강조 표시. */
  starred?: boolean;
  /**
   * 절대 시각(UTC ISO, 예 "2026-06-28T19:00:00Z"). 있으면 이게 진실의 원천 —
   * date·time을 America/New_York로 자동 도출(서머타임·날짜경계 자동, 사람 환산 불필요).
   * 타임존 다른 경기(해외·미 서부 등)는 utc로 넣을 것. 뉴욕 현지 행사면 date+time 직접 써도 됨.
   */
  utc?: string;
  /** ISO date, "YYYY-MM-DD" (뉴욕 기준). utc가 있으면 거기서 자동 도출됨. */
  date: string;
  /** "HH:MM" 24h, 뉴욕 기준, optional. utc가 있으면 자동 도출됨. */
  time?: string;
  location?: I18nString;
  description?: I18nString;
  emoji?: string;
}

export interface CategoryMeta {
  key: Category;
  label: LocalizedText;
  /** CSS variable name holding the color */
  colorVar: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "sports", label: { en: "Sports", ko: "스포츠" }, colorVar: "--cat-sports" },
  { key: "esports", label: { en: "E-sports", ko: "e스포츠" }, colorVar: "--cat-esports" },
  { key: "music", label: { en: "Music", ko: "음악" }, colorVar: "--cat-music" },
  { key: "personal", label: { en: "Personal", ko: "개인" }, colorVar: "--cat-personal" },
  { key: "other", label: { en: "Other", ko: "기타" }, colorVar: "--cat-other" },
];

export interface SubMeta {
  key: string;
  label: LocalizedText;
}

/** 카테고리별 서브카테고리(리그/대회). 사이드바 드롭다운 · 폼 선택에 사용. */
export const SUBCATEGORIES: Record<Category, SubMeta[]> = {
  sports: [
    { key: "worldcup", label: { en: "World Cup", ko: "월드컵" } },
    { key: "nba", label: { en: "NBA", ko: "NBA" } },
  ],
  esports: [
    { key: "msi", label: { en: "LoL MSI", ko: "LoL MSI" } },
    { key: "worlds", label: { en: "LoL Worlds", ko: "LoL 월드챔피언십" } },
  ],
  music: [
    { key: "concert", label: { en: "Concert", ko: "콘서트" } },
  ],
  personal: [],
  other: [],
};
