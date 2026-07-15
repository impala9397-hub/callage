#!/usr/bin/env node
// 시각 교차검증 — events.ts의 모든 리터럴 at("UTC", "src") 호출을 찾아
// UTC ↔ 출처 현지시각(src)이 일치하는지 Intl(IANA tzdata)로 검증한다.
//
// 왜: 일정 시각 오류의 근본 원인은 "출처 현지시각 → UTC" 손 환산 실수였다.
// 출처가 표기한 시각을 src로 함께 저장하게 강제하고, 여기서 기계 검증해
// 틀리면 빌드를 실패시킨다(→ 커밋 불가). npm run build 맨 앞에서 실행됨.
//
// src 형식: "YYYY-MM-DD HH:mm IANA타임존"  예) "2026-07-29 19:00 Asia/Seoul"
import { readFileSync } from "node:fs";

const file = new URL("../src/data/events.ts", import.meta.url);
const lines = readFileSync(file, "utf8").split("\n");

const fmtCache = new Map();
function localFromUtc(utc, tz) {
  const d = new Date(utc);
  if (isNaN(d.getTime())) return null;
  let fmt = fmtCache.get(tz);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
    fmtCache.set(tz, fmt);
  }
  const p = {};
  for (const part of fmt.formatToParts(d)) p[part.type] = part.value;
  const hour = p.hour === "24" ? "00" : p.hour;
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${hour}:${p.minute}` };
}

const errors = [];
let checked = 0;

lines.forEach((line, idx) => {
  const n = idx + 1;
  const code = line.split("//")[0]; // 주석 제외
  // 리터럴 UTC로 시작하는 at() 호출만 매칭 — at(변수)는 대상 아님(과거 fixture 배열).
  const re = /at\(\s*"([^"]+)"\s*(?:,\s*"([^"]+)")?\s*\)/g;
  let m;
  while ((m = re.exec(code))) {
    const [, utc, src] = m;
    if (!src) {
      errors.push(`${n}행: src(출처 현지시각) 누락 — at("${utc}", "YYYY-MM-DD HH:mm TZ") 형태로 쓸 것`);
      continue;
    }
    const sm = src.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) (\S+)$/);
    if (!sm) {
      errors.push(`${n}행: src 형식 오류 "${src}" — "YYYY-MM-DD HH:mm IANA타임존" 필요`);
      continue;
    }
    let local;
    try {
      local = localFromUtc(utc, sm[3]);
    } catch {
      errors.push(`${n}행: 알 수 없는 타임존 "${sm[3]}"`);
      continue;
    }
    if (!local) {
      errors.push(`${n}행: 잘못된 UTC "${utc}"`);
      continue;
    }
    checked++;
    if (local.date !== sm[1] || local.time !== sm[2]) {
      errors.push(
        `${n}행: ⛔ 시각 불일치 — ${utc}는 ${sm[3]} 기준 ${local.date} ${local.time}, 출처 표기는 ${sm[1]} ${sm[2]}`,
      );
    }
  }
});

if (errors.length) {
  console.error(`✖ check-times 실패 (검증 ${checked}건 중 오류 ${errors.length}건):\n`);
  for (const e of errors) console.error(`  ${e}`);
  console.error("\n출처의 현지 시각을 src에 그대로 옮겨 적고, UTC를 다시 구하세요.");
  process.exit(1);
}
console.log(`✓ check-times 통과 — UTC↔출처 현지시각 ${checked}건 모두 일치`);
