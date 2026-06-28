// TZ 안전한 날짜 헬퍼 — 문자열 "YYYY-MM-DD" 기준으로만 다룬다.
// 언어별 라벨·포맷(WEEKDAYS/MONTHS/formatTime/formatFullDate)은 i18n.tsx로 이동.

export function ymd(y: number, m: number, d: number): string {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** 월 그리드(6주 × 7일)를 날짜 문자열 배열로. 일요일 시작. */
export function monthGrid(year: number, month: number): string[] {
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=일
  const total = daysInMonth(year, month);
  const cells: string[] = [];

  // 앞쪽 이전 달
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevTotal = daysInMonth(prevYear, prevMonth);
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push(ymd(prevYear, prevMonth, prevTotal - i));
  }
  // 이번 달
  for (let d = 1; d <= total; d++) cells.push(ymd(year, month, d));
  // 뒤쪽 다음 달 — 42칸 채우기
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  let d = 1;
  while (cells.length < 42) cells.push(ymd(nextYear, nextMonth, d++));

  return cells;
}

export function isSameMonth(dateStr: string, year: number, month: number): boolean {
  const [y, m] = dateStr.split("-").map(Number);
  return y === year && m - 1 === month;
}

/**
 * 그 달 6주 그리드에 "실제로 보이는" 날짜 범위 안인가.
 * 앞뒤로 걸친 인접 달 칸(예: 6월 뷰의 7/1~4)도 포함 → 그 칸에도 일정이 뜨게.
 * 날짜가 "YYYY-MM-DD"라 문자열 비교로 충분.
 */
export function inMonthGrid(dateStr: string, year: number, month: number): boolean {
  const cells = monthGrid(year, month);
  return dateStr >= cells[0] && dateStr <= cells[cells.length - 1];
}

export function dayOfMonth(dateStr: string): number {
  return Number(dateStr.split("-")[2]);
}

export function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}
