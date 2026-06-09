// 2-레이어 영속화.
//  레이어 1 (소스): 시드/외부 API — 코드·네트워크에서 매번 새로. localStorage에 안 박음.
//  레이어 2 (유저 레이어): 내 변경분만 저장 — 추가/수정(override)/삭제(hidden).
// 화면 = 소스(삭제분 빼고, 수정분 덮어쓰고) + 내가 추가한 것.
// 이렇게 하면 소스(시드/API)가 갱신돼도 자동 반영되고, 내 변경분은 보존된다.
import type { CalEvent } from "../types";

const KEY = "callage.userlayer.v1";

export interface UserLayer {
  /** 내가 새로 만든 이벤트 */
  added: CalEvent[];
  /** 소스 이벤트를 수정한 것 (id → 덮어쓸 이벤트) */
  overrides: Record<string, CalEvent>;
  /** 소스 이벤트 중 숨긴(삭제한) id */
  hidden: string[];
}

export const EMPTY_LAYER: UserLayer = { added: [], overrides: {}, hidden: [] };

export function loadUserLayer(): UserLayer {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_LAYER };
    const p = JSON.parse(raw);
    return {
      added: Array.isArray(p.added) ? p.added : [],
      overrides: p.overrides && typeof p.overrides === "object" ? p.overrides : {},
      hidden: Array.isArray(p.hidden) ? p.hidden : [],
    };
  } catch {
    return { ...EMPTY_LAYER };
  }
}

export function saveUserLayer(layer: UserLayer): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(layer));
  } catch {
    // 저장 실패는 조용히 무시 (시크릿 모드 등)
  }
}

export function newEventId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `evt-${rand}`;
}

/** 소스 + 유저 레이어 → 화면에 보일 최종 이벤트 목록. */
export function resolveEvents(source: CalEvent[], layer: UserLayer): CalEvent[] {
  const hidden = new Set(layer.hidden);
  const base = source
    .filter((e) => !hidden.has(e.id))
    .map((e) => layer.overrides[e.id] ?? e);
  return [...base, ...layer.added];
}
