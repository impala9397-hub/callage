import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { weekdayOf } from "./lib/date";

export type Lang = "en" | "ko";

/** 다국어 텍스트 — 시드/카테고리 라벨처럼 양쪽 언어를 다 가진 값. */
export type LocalizedText = { en: string; ko: string };
/** 유저가 만든 값은 단일 문자열, 시드 값은 LocalizedText. */
export type I18nString = string | LocalizedText;

/** 현재 언어로 문자열 해석. undefined는 빈 문자열. */
export function loc(value: I18nString | undefined, lang: Lang): string {
  if (value == null) return "";
  return typeof value === "string" ? value : value[lang];
}

const LANG_KEY = "callage.lang";

// ===== UI 문구 =====
const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    categories: "Categories",
    upcoming: "Upcoming",
    noUpcoming: "No upcoming events",
    today: "Today",
    addEvent: "+ Event",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    moreCount: "+{n} more",
    detail_date: "Date",
    detail_time: "Time",
    detail_location: "Place",
    detail_share: "Share with friends (soon)",
    edit: "Edit",
    delete: "Delete",
    deleteConfirm: 'Delete "{title}"?',
    form_new: "New event",
    form_edit: "Edit event",
    f_title: "Title",
    f_category: "Category",
    f_subcategory: "League",
    f_date: "Date",
    f_time: "Time",
    f_location: "Place",
    f_emoji: "Emoji",
    f_note: "Note",
    sub_none: "None",
    optional: "optional",
    cancel: "Cancel",
    add: "Add",
    save: "Save",
    ph_title: "e.g. World Cup quarter-final",
    ph_location: "e.g. SoFi Stadium",
    ph_note: "Details",
    addOnDay: "Add event on {d}",
    closeLabel: "Close",
    eventDetail: "Event detail",
    view_month: "Month",
    view_timeline: "Timeline",
    view_competition: "By event",
    noEventsMonth: "No events this month",
    detail_round: "Round",
    detail_homeaway: "Home / Away",
    home: "Home",
    away: "Away",
    stagesLabel: "Stages",
    allStages: "All",
    density_minimal: "Minimal",
    density_rich: "Detailed",
    vs: "vs",
    detail_match: "Match",
    status_live: "Live · TheSportsDB",
    status_demo: "Demo data",
    status_loading: "Loading…",
  },
  ko: {
    categories: "카테고리",
    upcoming: "다가오는 일정",
    noUpcoming: "표시할 일정이 없어요",
    today: "오늘",
    addEvent: "+ 이벤트",
    prevMonth: "이전 달",
    nextMonth: "다음 달",
    moreCount: "+{n}개 더",
    detail_date: "날짜",
    detail_time: "시간",
    detail_location: "장소",
    detail_share: "친구와 공유 (예정)",
    edit: "편집",
    delete: "삭제",
    deleteConfirm: '"{title}" 이벤트를 삭제할까요?',
    form_new: "새 이벤트",
    form_edit: "이벤트 편집",
    f_title: "제목",
    f_category: "카테고리",
    f_subcategory: "리그",
    f_date: "날짜",
    f_time: "시간",
    f_location: "장소",
    f_emoji: "이모지",
    f_note: "메모",
    sub_none: "없음",
    optional: "선택",
    cancel: "취소",
    add: "추가",
    save: "저장",
    ph_title: "예: 월드컵 8강전",
    ph_location: "예: 고척돔",
    ph_note: "상세 설명",
    addOnDay: "{d}일에 이벤트 추가",
    closeLabel: "닫기",
    eventDetail: "이벤트 상세",
    view_month: "월간",
    view_timeline: "타임라인",
    view_competition: "대회별",
    noEventsMonth: "이번 달 일정이 없어요",
    detail_round: "단계",
    detail_homeaway: "홈 / 원정",
    home: "홈",
    away: "원정",
    stagesLabel: "단계",
    allStages: "전체",
    density_minimal: "간단",
    density_rich: "자세히",
    vs: "vs",
    detail_match: "대진",
    status_live: "실시간 · TheSportsDB",
    status_demo: "데모 데이터",
    status_loading: "불러오는 중…",
  },
};

// ===== 날짜 라벨 =====
export const WEEKDAYS: Record<Lang, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ko: ["일", "월", "화", "수", "목", "금", "토"],
};

export const MONTHS: Record<Lang, string[]> = {
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  ko: [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
  ],
};

const MONTHS_SHORT_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatTime(time: string | undefined, lang: Lang): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = String(m).padStart(2, "0");
  if (lang === "en") {
    return `${h12}:${mm} ${h < 12 ? "AM" : "PM"}`;
  }
  return `${h < 12 ? "오전" : "오후"} ${h12}:${mm}`;
}

// 표시 타임존 — 일단 EST 고정. 추후 사용자 설정으로 바꿀 자리.
// (시드 시간은 ET 기준으로 간주. 다른 존 변환은 소스 존이 생기면 추가.)
export const DISPLAY_TZ = "EST";

/** 시간 + 타임존 라벨. 예: "8:30 PM EST" / "오후 8:30 EST". */
export function formatTimeTz(time: string | undefined, lang: Lang): string {
  const base = formatTime(time, lang);
  return base ? `${base} ${DISPLAY_TZ}` : "";
}

export function formatFullDate(dateStr: string, lang: Lang): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const wd = weekdayOf(dateStr);
  if (lang === "en") {
    return `${WEEKDAYS.en[wd]}, ${MONTHS_SHORT_EN[m - 1]} ${d}, ${y}`;
  }
  return `${y}년 ${m}월 ${d}일 (${WEEKDAYS.ko[wd]})`;
}

// ===== Context =====
interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function readLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "en" || saved === "ko") return saved;
  } catch {
    // ignore
  }
  return "en"; // 기본값: 영어
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      // ignore
    }
  }

  function t(key: string, params?: Record<string, string | number>): string {
    let s = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        s = s.replace(`{${k}}`, String(v));
      }
    }
    return s;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
