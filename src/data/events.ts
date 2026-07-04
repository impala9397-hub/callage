import type { CalEvent } from "../types";
import { nyFromUtc } from "../lib/date";

// UTC 절대시각 → { utc, date, time } (뉴욕 기준 자동 환산). 시각 있는 이벤트는 이걸로 펼쳐 넣는다.
function at(utc: string): { utc: string; date: string; time: string } {
  const ny = nyFromUtc(utc);
  if (!ny) throw new Error(`잘못된 UTC 타임스탬프: ${utc}`);
  return { utc, date: ny.date, time: ny.time };
}

// 시드 데이터 — 실제 일정 기반.
// 기간: 2026년 6월 ~ 2027년 1월. 제목·장소는 다국어(LocalizedText).
//
// ⏰⏰ 타임존(권장: `utc` 필드 사용) ⏰⏰
//   타임존이 다른 경기(해외·미 서부 등)는 **절대시각 `utc`**(예 "2026-06-28T19:00:00Z")로 적고
//   `at(utc)`로 펼쳐 넣는다 → date·time이 뉴욕(America/New_York)으로 자동 환산된다.
//   서머타임(EST/EDT)·날짜경계를 코드가 알아서 처리하므로 사람이 −4/−5 암산할 일이 없다(실수 원천 제거).
//   UTC 구하는 법: 출처가 ET 시각이면 ET+offset(여름 ET+4), KST면 KST−9, 현지면 현지+offset. 또는
//     node -e 'console.log(new Date("2026-06-28T19:00:00Z").toLocaleString("en-US",{timeZone:"America/New_York"}))'로 검산.
//   ⚠️ 표시는 앱이 "ET"로 라벨(i18n.tsx DISPLAY_TZ) — `time`은 뉴욕 벽시계여야 한다. `utc`를 쓰면 자동 보장됨.
//   뉴욕 현지 행사(콘서트·MSG 등)는 타임존 변환이 없으니 date+time 직접 써도 된다.
//   원래 현지·한국 시각은 description에 함께 적어 사람이 교차확인하게 한다. (과거 32강을 현지시각으로 잘못 넣은 적 있음.)
// ✅ 검증: 월드컵 32강 대진 + MSI 일정/팀 = Wikipedia 확인 (2026-06-28).
// ✅ 32강 결과 — Wikipedia·ESPN 교차 확인 (2026-07-02, 10경기/16 완료).
//    결과 확인: 남아공→캐나다 ✅, 브라질→일본 ✅, 파라과이→독일(PSO) ✅, 모로코→네덜란드(PSO) ✅,
//    노르웨이→코트디부아르 ✅, 프랑스→스웨덴 ✅, 멕시코→에콰도르 ✅,
//    영국→DR콩고 ✅(케인 2골 역전), 벨기에→세네갈 ✅(연장, 티엘레만스 125분 PK), 미국→보스니아 ✅(발로군·틸먼).
// ⚠️ 대한민국은 조별리그 탈락 → 32강 명단에 없음(32강 16경기 모두 한국 없음, Wikipedia).
// ✅ 32강 결과 추가 5경기 — CBS·ESPN 교차 확인 (2026-07-03): 스페인→오스트리아 3-0 ✅, 포르투갈→크로아티아 2-1 ✅,
//    스위스→알제리 2-0 ✅, 이집트→호주(PSO 4-2) ✅, 아르헨티나→카보베르데(연장) 3-2 ✅. 콜롬비아vs가나만 미완(7/4 01:30Z 예정).
// ✅ 16강 대진 7/8 확정 — 포르투갈vs스페인(7/6), 아르헨티나vs이집트(7/7) 신규 확정. 스위스vs(콜롬비아/가나 승자)만 미정.
//    미국vs벨기에 시각 오류 정정: 8pm ET가 맞음(21:00Z→00:00Z, CBS 크로스체크).
// ✅ MSI 플레이인 전 라운드(6.28~7.1 KST) 결과 반영 완료 — Liquipedia·Wikipedia 교차 확인 (2026-07-01).
//    T1 브래킷 직행 확정(플레이인 최종 진출전 T1 3-0 팀 리퀴드 ✅). 브래킷 R1(7.3~4) 대진 공식 확정 → msi-br1-1~4.
// ✅ 브래킷 R1 첫 2경기 결과 + R2 확정 — Wikipedia·GosuGamers·Liquipedia 교차 확인 (2026-07-03):
//    한화생명 3-0 시크릿웨일스 ✅, G2 3-2 탑e스포츠(리버스스윕) ✅ → 어퍼 2라운드 한화생명vsG2 신규 추가(msi-br2-1, 7/5).
//    어퍼/로어 파이널·결승 시각 Liquipedia로 확정 반영(결승 16:00→15:00 KST 정정, 06:00Z).
const NBA_FINALS = { en: "Finals", ko: "파이널" };
const WC_GROUP = { en: "Group Stage", ko: "조별리그" };
const WC_R32 = { en: "Round of 32", ko: "32강" };
const WC_R16 = { en: "Round of 16", ko: "16강" };
const WC_QF = { en: "Quarter-final", ko: "8강" };
const WC_SF = { en: "Semi-final", ko: "준결승" };
const WC_3P = { en: "Third Place", ko: "3-4위전" };
const WC_FINAL = { en: "Final", ko: "결승" };

// 팀/국가 (다국어)
const T = {
  knicks: { en: "Knicks", ko: "닉스" },
  spurs: { en: "Spurs", ko: "스퍼스" },
  korea: { en: "Korea", ko: "대한민국" },
  czechia: { en: "Czechia", ko: "체코" },
  mexico: { en: "Mexico", ko: "멕시코" },
  southAfrica: { en: "South Africa", ko: "남아공" },
};

// 월드컵 조별리그 전체 (ESPN 일정 기반 · 대진/날짜 확인됨 · 시간·경기장 미표기).
// A조 개막전(멕시코vs남아공)·대한민국 3경기는 아래 EVENTS에 상세 항목으로 따로 둠.
const WC_FIXTURES: [string, string, string][] = [
  // A조 (나머지 2경기)
  ["2026-06-18", "Czechia", "South Africa"], ["2026-06-24", "Czechia", "Mexico"],
  // B조
  ["2026-06-12", "Canada", "Bosnia & Herzegovina"], ["2026-06-13", "Qatar", "Switzerland"],
  ["2026-06-18", "Switzerland", "Bosnia & Herzegovina"], ["2026-06-18", "Canada", "Qatar"],
  ["2026-06-24", "Switzerland", "Canada"], ["2026-06-24", "Bosnia & Herzegovina", "Qatar"],
  // C조
  ["2026-06-13", "Brazil", "Morocco"], ["2026-06-13", "Haiti", "Scotland"],
  ["2026-06-19", "Scotland", "Morocco"], ["2026-06-19", "Brazil", "Haiti"],
  ["2026-06-24", "Scotland", "Brazil"], ["2026-06-24", "Morocco", "Haiti"],
  // D조
  ["2026-06-12", "United States", "Paraguay"], ["2026-06-13", "Australia", "Turkey"],
  ["2026-06-19", "United States", "Australia"], ["2026-06-19", "Turkey", "Paraguay"],
  ["2026-06-25", "Turkey", "United States"], ["2026-06-25", "Paraguay", "Australia"],
  // E조
  ["2026-06-14", "Germany", "Curaçao"], ["2026-06-14", "Ivory Coast", "Ecuador"],
  ["2026-06-20", "Germany", "Ivory Coast"], ["2026-06-20", "Ecuador", "Curaçao"],
  ["2026-06-25", "Ecuador", "Germany"], ["2026-06-25", "Curaçao", "Ivory Coast"],
  // F조
  ["2026-06-14", "Netherlands", "Japan"], ["2026-06-14", "Sweden", "Tunisia"],
  ["2026-06-20", "Netherlands", "Sweden"], ["2026-06-20", "Tunisia", "Japan"],
  ["2026-06-25", "Japan", "Sweden"], ["2026-06-25", "Tunisia", "Netherlands"],
  // G조
  ["2026-06-15", "Belgium", "Egypt"], ["2026-06-15", "Iran", "New Zealand"],
  ["2026-06-21", "Belgium", "Iran"], ["2026-06-21", "New Zealand", "Egypt"],
  ["2026-06-26", "Egypt", "Iran"], ["2026-06-26", "New Zealand", "Belgium"],
  // H조
  ["2026-06-15", "Spain", "Cape Verde"], ["2026-06-15", "Saudi Arabia", "Uruguay"],
  ["2026-06-21", "Spain", "Saudi Arabia"], ["2026-06-21", "Uruguay", "Cape Verde"],
  ["2026-06-26", "Cape Verde", "Saudi Arabia"], ["2026-06-26", "Uruguay", "Spain"],
  // I조
  ["2026-06-16", "France", "Senegal"], ["2026-06-16", "Iraq", "Norway"],
  ["2026-06-22", "France", "Iraq"], ["2026-06-22", "Norway", "Senegal"],
  ["2026-06-26", "Norway", "France"], ["2026-06-26", "Senegal", "Iraq"],
  // J조
  ["2026-06-16", "Argentina", "Algeria"], ["2026-06-16", "Austria", "Jordan"],
  ["2026-06-22", "Argentina", "Austria"], ["2026-06-22", "Jordan", "Algeria"],
  ["2026-06-27", "Algeria", "Austria"], ["2026-06-27", "Jordan", "Argentina"],
  // K조
  ["2026-06-17", "Portugal", "DR Congo"], ["2026-06-17", "Uzbekistan", "Colombia"],
  ["2026-06-23", "Portugal", "Uzbekistan"], ["2026-06-23", "Colombia", "DR Congo"],
  ["2026-06-27", "Colombia", "Portugal"], ["2026-06-27", "DR Congo", "Uzbekistan"],
  // L조
  ["2026-06-17", "England", "Croatia"], ["2026-06-17", "Ghana", "Panama"],
  ["2026-06-23", "England", "Ghana"], ["2026-06-23", "Panama", "Croatia"],
  ["2026-06-27", "Panama", "England"], ["2026-06-27", "Croatia", "Ghana"],
];

const WC_GROUP_EVENTS: CalEvent[] = WC_FIXTURES.map(([date, home, away], i) => ({
  id: `wc-grp-${i}`,
  title: `${home} vs ${away}`,
  category: "sports",
  sub: "worldcup",
  round: WC_GROUP,
  match: { home, away },
  date,
  emoji: "⚽",
}));

// 월드컵 32강 — 조별리그 결과로 확정된 16경기 (Wikipedia·ESPN 교차검증, 2026-06-28).
// ⏰ 시각은 UTC(절대시각)로 저장 → at()이 뉴욕 시각으로 자동 환산(서머타임 자동). [UTC, home, away, 경기장]
//    (예: 남아공vs캐나다 = SoFi LA 정오 → 19:00Z → 뉴욕 3:00 PM. 손 환산 불필요.)
const WC_R32_FIXTURES: [string, string, string, string][] = [
  ["2026-06-28T19:00:00Z", "South Africa", "Canada", "SoFi Stadium, Inglewood"],
  ["2026-06-29T17:00:00Z", "Brazil", "Japan", "NRG Stadium, Houston"],
  ["2026-06-29T20:30:00Z", "Germany", "Paraguay", "Gillette Stadium, Foxborough"],
  ["2026-06-30T01:00:00Z", "Netherlands", "Morocco", "Estadio BBVA, Guadalupe"],
  ["2026-06-30T17:00:00Z", "Ivory Coast", "Norway", "AT&T Stadium, Arlington"],
  ["2026-06-30T21:00:00Z", "France", "Sweden", "MetLife Stadium, East Rutherford"],
  ["2026-07-01T01:00:00Z", "Mexico", "Ecuador", "Estadio Azteca, Mexico City"],
  ["2026-07-01T16:00:00Z", "England", "DR Congo", "Mercedes-Benz Stadium, Atlanta"],
  ["2026-07-01T20:00:00Z", "Belgium", "Senegal", "Lumen Field, Seattle"],
  ["2026-07-02T00:00:00Z", "United States", "Bosnia and Herzegovina", "Levi's Stadium, Santa Clara"],
  ["2026-07-02T19:00:00Z", "Spain", "Austria", "SoFi Stadium, Inglewood"],
  ["2026-07-02T23:00:00Z", "Portugal", "Croatia", "BMO Field, Toronto"],
  ["2026-07-03T03:00:00Z", "Switzerland", "Algeria", "BC Place, Vancouver"],
  ["2026-07-03T18:00:00Z", "Australia", "Egypt", "AT&T Stadium, Arlington"],
  ["2026-07-03T22:00:00Z", "Argentina", "Cape Verde", "Hard Rock Stadium, Miami Gardens"],
  ["2026-07-04T01:30:00Z", "Colombia", "Ghana", "Arrowhead Stadium, Kansas City"],
];

// 32강 경기 결과 (인덱스는 WC_R32_FIXTURES 배열 순서 기준) — Wikipedia·ESPN 교차 확인
const WC_R32_RESULTS: Partial<Record<number, { en: string; ko: string }>> = {
  0: { en: "Result: South Africa 0–1 Canada ✅ (Eustáquio 90+2')", ko: "결과: 남아공 0–1 캐나다 ✅ (Eustáquio 90+2')" },
  1: { en: "Result: Brazil 2–1 Japan ✅ (Casemiro 56', Martinelli 90+5' | Sano 29')", ko: "결과: 브라질 2–1 일본 ✅ (카세미로 56', 마르티넬리 90+5' | 사노 29')" },
  2: { en: "Result: Germany 1–1 Paraguay a.e.t., Paraguay 4–3 pens ✅ (Havertz 54' | Enciso 42')", ko: "결과: 독일 1–1 파라과이 연장, 파라과이 승부차기 4–3 ✅ (하버츠 54' | 엔시소 42')" },
  3: { en: "Result: Netherlands 1–1 Morocco a.e.t., Morocco 3–2 pens ✅ (Gakpo 72' | Issa Diop 90+1')", ko: "결과: 네덜란드 1–1 모로코 연장, 모로코 승부차기 3–2 ✅ (하크포 72' | 이사 디옵 90+1')" },
  4: { en: "Result: Ivory Coast 1–2 Norway ✅ (Diallo 74' | Nusa 39', Haaland 86') · Norway advance to face Brazil in R16", ko: "결과: 코트디부아르 1–2 노르웨이 ✅ (디알로 74' | 누사 39', 홀란 86') · 노르웨이 16강 진출, 브라질과 대결" },
  5: { en: "Result: France 3–0 Sweden ✅ (Mbappé 45', 74', Barcola 53') · France advance to face Paraguay in R16", ko: "결과: 프랑스 3–0 스웨덴 ✅ (음바페 45', 74', 바르콜라 53') · 프랑스 16강 진출, 파라과이와 대결" },
  6: { en: "Result: Mexico 2–0 Ecuador ✅ (Quiñones 22', Jiménez 31')", ko: "결과: 멕시코 2–0 에콰도르 ✅ (키뇨네스 22', 히메네스 31')" },
  7: { en: "Result: England 2–1 DR Congo ✅ (Kane x2 2nd half | Cipenga 7') · advance to face Mexico in R16", ko: "결과: 잉글랜드 2–1 DR콩고 ✅ (케인 후반 2골 | 시펭가 7') · 16강 멕시코전" },
  8: { en: "Result: Belgium 3–2 Senegal a.e.t. ✅ (Lukaku 86', Tielemans 89'+125' pen | Diarra, Sarr) · advance to face USA in R16", ko: "결과: 벨기에 3–2 세네갈 연장 ✅ (루카쿠 86', 티엘레만스 89'+연장 125' PK | 디아라, 사르) · 16강 미국전" },
  9: { en: "Result: United States 2–0 Bosnia and Herzegovina ✅ (Balogun, Tillman) · advance to face Belgium in R16 (Seattle)", ko: "결과: 미국 2–0 보스니아 ✅ (발로군, 틸먼) · 16강 벨기에전 (시애틀)" },
  10: { en: "Result: Spain 3–0 Austria ✅ · advance to face Portugal in R16", ko: "결과: 스페인 3–0 오스트리아 ✅ · 16강 포르투갈전" },
  11: { en: "Result: Portugal 2–1 Croatia ✅ · advance to face Spain in R16", ko: "결과: 포르투갈 2–1 크로아티아 ✅ · 16강 스페인전" },
  12: { en: "Result: Switzerland 2–0 Algeria ✅ · advance to face Colombia/Ghana winner in R16", ko: "결과: 스위스 2–0 알제리 ✅ · 16강 콜롬비아/가나 승자전" },
  13: { en: "Result: Egypt 1–1 Australia a.e.t., Egypt 4–2 pens ✅ · advance to face Argentina in R16", ko: "결과: 이집트 1–1 호주 연장, 이집트 승부차기 4–2 ✅ · 16강 아르헨티나전" },
  14: { en: "Result: Argentina 3–2 Cape Verde a.e.t. ✅ (Messi 29') · advance to face Egypt in R16", ko: "결과: 아르헨티나 3–2 카보베르데 연장 ✅ (메시 29') · 16강 이집트전" },
};

const WC_R32_EVENTS: CalEvent[] = WC_R32_FIXTURES.map(([utc, home, away, location], i) => ({
  id: `wc-r32-${i}`,
  title: `${home} vs ${away}`,
  category: "sports",
  sub: "worldcup",
  round: WC_R32,
  match: { home, away },
  ...at(utc),
  location,
  ...(WC_R32_RESULTS[i] ? { description: WC_R32_RESULTS[i] } : {}),
  emoji: "⚽",
}));

// 월드컵 16강 — R32 결과로 확정된 매치업 (ESPN·Wikipedia 교차검증, 2026-07-02). 4/8 확정, 나머지 4경기는 R32 진행 중이라 TBD.
const WC_R16_FIXTURES: [string, string, string, string][] = [
  ["2026-07-04T17:00:00Z", "Canada", "Morocco", "NRG Stadium, Houston"],
  ["2026-07-04T21:00:00Z", "Paraguay", "France", "Lincoln Financial Field, Philadelphia"],
  ["2026-07-05T20:00:00Z", "Brazil", "Norway", "MetLife Stadium, East Rutherford"],
  ["2026-07-06T00:00:00Z", "Mexico", "England", "Estadio Azteca, Mexico City"],
  ["2026-07-06T19:00:00Z", "Portugal", "Spain", "AT&T Stadium, Arlington"],
  ["2026-07-07T00:00:00Z", "United States", "Belgium", "Lumen Field, Seattle"],
  ["2026-07-07T16:00:00Z", "Argentina", "Egypt", "Mercedes-Benz Stadium, Atlanta"],
  ["2026-07-07T20:00:00Z", "Switzerland", "TBD", "BC Place, Vancouver"],
];

// 미정 매치업의 소스(승자 미정) — 추측 대신 원본 대진 표기
// ✅ 2026-07-03 갱신: 포르투갈vs스페인·아르헨티나vs이집트 대진 확정(양쪽 R32 결과 모두 나옴). 미국vs벨기에 시각 오류 수정(8pm ET가 맞음, 21:00Z→00:00Z).
const WC_R16_PENDING: Partial<Record<number, { en: string; ko: string }>> = {
  7: { en: "Pending: Colombia/Ghana winner (Switzerland side confirmed)", ko: "대진 미정: 콜롬비아/가나 승자 (스위스는 확정)" },
};

const WC_R16_EVENTS: CalEvent[] = WC_R16_FIXTURES.map(([utc, home, away, location], i) => ({
  id: `wc-r16-${i}`,
  title: `${home} vs ${away}`,
  category: "sports",
  sub: "worldcup",
  round: WC_R16,
  match: { home, away },
  ...at(utc),
  location,
  ...(WC_R16_PENDING[i] ? { description: WC_R16_PENDING[i] } : {}),
  emoji: "⚽",
}));

// MSI 2026 — 대전 경기장 + 팀 (다국어). 플레이인 4팀 = 각 리그 2번 시드.
const DJ = { en: "Daejeon Convention Center II", ko: "대전컨벤션센터 II" };
const MT = {
  t1: { en: "T1", ko: "T1" },
  liquid: { en: "Team Liquid", ko: "팀 리퀴드" },
  kc: { en: "Karmine Corp", ko: "카민 코프" },
  relove: { en: "Relove DCG", ko: "릴러브 DCG" },
  hanwha: { en: "Hanwha Life Esports", ko: "한화생명e스포츠" },
  secretWhales: { en: "Team Secret Whales", ko: "시크릿 웨일스" },
  g2: { en: "G2 Esports", ko: "G2 e스포츠" },
  tes: { en: "Top Esports", ko: "탑 e스포츠" },
  lyon: { en: "LYON", ko: "리옹" },
  furia: { en: "FURIA", ko: "퓨리아" },
  blg: { en: "Bilibili Gaming", ko: "빌리빌리 게이밍" },
  tbd: { en: "TBD", ko: "미정" },
};

export const EVENTS: CalEvent[] = [
  // 🏀 NBA Finals 2026 — Knicks vs Spurs (스퍼스 홈코트 우위: 닉스 1·2 원정 / 3·4 홈 / 5 원정 / 6 홈 / 7 원정)
  { id: "nba-g1", title: { en: "NBA Finals G1", ko: "NBA 파이널 G1" }, category: "sports", sub: "nba", round: NBA_FINALS, homeAway: "away", starred: true, match: { home: T.spurs, away: T.knicks }, date: "2026-06-03", time: "20:00", location: { en: "Frost Bank Center", ko: "프로스트 뱅크 센터" }, emoji: "🏀" },
  { id: "nba-g2", title: { en: "NBA Finals G2", ko: "NBA 파이널 G2" }, category: "sports", sub: "nba", round: NBA_FINALS, homeAway: "away", starred: true, match: { home: T.spurs, away: T.knicks }, date: "2026-06-05", time: "20:00", location: { en: "Frost Bank Center", ko: "프로스트 뱅크 센터" }, emoji: "🏀" },
  { id: "nba-g3", title: { en: "NBA Finals G3", ko: "NBA 파이널 G3" }, category: "sports", sub: "nba", round: NBA_FINALS, homeAway: "home", starred: true, match: { home: T.knicks, away: T.spurs }, date: "2026-06-08", time: "20:30", location: { en: "Madison Square Garden", ko: "매디슨 스퀘어 가든" }, emoji: "🏀" },
  { id: "nba-g4", title: { en: "NBA Finals G4", ko: "NBA 파이널 G4" }, category: "sports", sub: "nba", round: NBA_FINALS, homeAway: "home", starred: true, match: { home: T.knicks, away: T.spurs }, date: "2026-06-10", time: "20:30", location: { en: "Madison Square Garden", ko: "매디슨 스퀘어 가든" }, emoji: "🏀" },
  { id: "nba-g5", title: { en: "NBA Finals G5", ko: "NBA 파이널 G5" }, category: "sports", sub: "nba", round: NBA_FINALS, homeAway: "away", starred: true, match: { home: T.spurs, away: T.knicks }, date: "2026-06-13", time: "20:30", location: { en: "Frost Bank Center", ko: "프로스트 뱅크 센터" }, description: { en: "If necessary", ko: "필요시" }, emoji: "🏀" },
  { id: "nba-g6", title: { en: "NBA Finals G6", ko: "NBA 파이널 G6" }, category: "sports", sub: "nba", round: NBA_FINALS, homeAway: "home", match: { home: T.knicks, away: T.spurs }, date: "2026-06-16", time: "20:30", location: { en: "Madison Square Garden", ko: "매디슨 스퀘어 가든" }, description: { en: "If necessary", ko: "필요시" }, emoji: "🏀" },
  { id: "nba-g7", title: { en: "NBA Finals G7", ko: "NBA 파이널 G7" }, category: "sports", sub: "nba", round: NBA_FINALS, homeAway: "away", match: { home: T.spurs, away: T.knicks }, date: "2026-06-19", time: "20:30", location: { en: "Frost Bank Center", ko: "프로스트 뱅크 센터" }, description: { en: "If necessary", ko: "필요시" }, emoji: "🏀" },

  // ⚽ FIFA World Cup 2026 (USA·Canada·Mexico, 6.11~7.19) — 대한민국 A조 + 결선 일정
  { id: "wc-open", title: { en: "Mexico vs South Africa (Opening)", ko: "멕시코 vs 남아공 (개막전)" }, category: "sports", sub: "worldcup", round: WC_GROUP, match: { home: T.mexico, away: T.southAfrica }, date: "2026-06-11", time: "16:00", location: { en: "Estadio Azteca, Mexico City", ko: "아즈테카 스타디움 (멕시코시티)" }, description: { en: "2026 FIFA World Cup opening match", ko: "2026 FIFA 월드컵 개막전" }, emoji: "⚽" },
  { id: "wc-kr1", title: { en: "Korea vs Czechia", ko: "대한민국 vs 체코" }, category: "sports", sub: "worldcup", round: WC_GROUP, starred: true, match: { home: T.korea, away: T.czechia }, date: "2026-06-11", time: "22:00", location: { en: "Estadio Akron, Guadalajara", ko: "아크론 스타디움 (과달라하라)" }, description: { en: "Group A · Match 1", ko: "A조 1차전" }, emoji: "⚽" },
  { id: "wc-kr2", title: { en: "Mexico vs Korea", ko: "멕시코 vs 대한민국" }, category: "sports", sub: "worldcup", round: WC_GROUP, starred: true, match: { home: T.mexico, away: T.korea }, date: "2026-06-18", time: "21:00", location: { en: "Estadio Akron, Guadalajara", ko: "아크론 스타디움 (과달라하라)" }, description: { en: "Group A · Match 2", ko: "A조 2차전" }, emoji: "⚽" },
  { id: "wc-kr3", title: { en: "South Africa vs Korea", ko: "남아공 vs 대한민국" }, category: "sports", sub: "worldcup", round: WC_GROUP, starred: true, match: { home: T.southAfrica, away: T.korea }, date: "2026-06-24", time: "21:00", location: { en: "Estadio BBVA, Monterrey", ko: "BBVA 스타디움 (몬테레이)" }, description: { en: "Group A · Match 3", ko: "A조 3차전" }, emoji: "⚽" },
  // 조별리그 나머지 전체 (68경기, ESPN 일정)
  ...WC_GROUP_EVENTS,
  // 32강 — 조별리그 결과로 확정된 실제 16경기 (Wikipedia 검증)
  ...WC_R32_EVENTS,
  // 16강 — R32 결과로 확정된 매치업 (4/8, 나머지는 TBD)
  ...WC_R16_EVENTS,
  // 8강 이후 — 대진은 결과에 따라 정해짐(팀 미정), 일정만
  { id: "wc-qf", title: { en: "World Cup · Quarter-finals", ko: "월드컵 · 8강" }, category: "sports", sub: "worldcup", round: WC_QF, date: "2026-07-11", description: { en: "Quarter-finals · Jul 9 – 11", ko: "8강 · 7.9~11" }, emoji: "⚽" },
  { id: "wc-sf1", title: { en: "World Cup · Semi-final 1", ko: "월드컵 · 준결승 1" }, category: "sports", sub: "worldcup", round: WC_SF, date: "2026-07-14", time: "20:00", location: { en: "AT&T Stadium, Dallas", ko: "AT&T 스타디움 (댈러스)" }, emoji: "⚽" },
  { id: "wc-sf2", title: { en: "World Cup · Semi-final 2", ko: "월드컵 · 준결승 2" }, category: "sports", sub: "worldcup", round: WC_SF, date: "2026-07-15", time: "20:00", location: { en: "Mercedes-Benz Stadium, Atlanta", ko: "메르세데스-벤츠 스타디움 (애틀랜타)" }, emoji: "⚽" },
  { id: "wc-3rd", title: { en: "World Cup · Third Place", ko: "월드컵 · 3-4위전" }, category: "sports", sub: "worldcup", round: WC_3P, date: "2026-07-18", location: { en: "Hard Rock Stadium, Miami", ko: "하드록 스타디움 (마이애미)" }, emoji: "⚽" },
  { id: "wc-final", title: { en: "World Cup Final", ko: "월드컵 결승" }, category: "sports", sub: "worldcup", round: WC_FINAL, starred: true, date: "2026-07-19", time: "15:00", location: { en: "MetLife Stadium, NJ", ko: "메트라이프 스타디움 (뉴저지)" }, description: { en: "2026 FIFA World Cup Final", ko: "2026 FIFA 월드컵 결승" }, emoji: "🏆" },

  // 🎮 LoL MSI 2026 — 대전컨벤션센터 II, 한국 (6.28~7.12). 11팀/6지역 (Wikipedia 검증, 2026-06-28).
  // 플레이인 = 각 리그 2번 시드 4팀(T1·카민코프·팀리퀴드·릴러브DCG) 더블엘리미네이션 Bo5.
  // ⏰ 시각은 UTC(절대시각)로 저장 → at()이 뉴욕 시각으로 자동 환산. 한국 경기라 KST−9h가 UTC.
  //    (예: 한국 6/28 12:00 KST = 03:00Z → 뉴욕 6/27 23:00.) 원래 한국 시각은 description에 'KST'로 보존.
  // ✅ 플레이인 종료(7/1) → T1 최종 진출. 브래킷 R1(7.3~4) 8강 대진 공식 확정 (msi-br1-*).
// ⚠️ 브래킷 R1 이후(어퍼/로어 파이널·결승) 대진은 결과 의존 → 팀 TBD(미정).
  // -- 플레이인 1라운드 (한국 6.28, 종료) --
  { id: "msi-pi-1", title: { en: "T1 vs Team Liquid", ko: "T1 vs 팀 리퀴드" }, category: "esports", sub: "msi", round: { en: "Play-In R1", ko: "플레이인 R1" }, starred: true, match: { home: MT.t1, away: MT.liquid }, ...at("2026-06-28T03:00:00Z"), location: DJ, description: { en: "Play-In Upper R1 · 12:00 KST (Jun 28) · Result: T1 3–0 ✅", ko: "플레이인 상위 R1 · 한국 6/28 12:00 KST · 결과: T1 3–0 승 ✅" }, emoji: "🎮" },
  { id: "msi-pi-2", title: { en: "Karmine Corp vs Relove DCG", ko: "카민 코프 vs 릴러브 DCG" }, category: "esports", sub: "msi", round: { en: "Play-In R1", ko: "플레이인 R1" }, match: { home: MT.kc, away: MT.relove }, ...at("2026-06-28T08:00:00Z"), location: DJ, description: { en: "Play-In Upper R1 · 17:00 KST (Jun 28) · Result: Karmine Corp 3–0 ✅", ko: "플레이인 상위 R1 · 한국 6/28 17:00 KST · 결과: 카민 코프 3–0 승 ✅" }, emoji: "🎮" },
  // -- 플레이인 2일차 (한국 6.29, 대진 확정·결과 미정) --
  { id: "msi-pi-3", title: { en: "T1 vs Karmine Corp", ko: "T1 vs 카민 코프" }, category: "esports", sub: "msi", round: { en: "Play-In Winners", ko: "플레이인 승자전" }, starred: true, match: { home: MT.t1, away: MT.kc }, ...at("2026-06-29T03:00:00Z"), location: DJ, description: { en: "Play-In Winners' Match · 12:00 KST (Jun 29) · Result: T1 3–0 ✅ · T1 advances to Bracket Stage", ko: "플레이인 승자전 · 한국 6/29 12:00 KST · 결과: T1 3–0 승 ✅ · T1 브래킷 진출" }, emoji: "🎮" },
  { id: "msi-pi-4", title: { en: "Team Liquid vs Relove DCG", ko: "팀 리퀴드 vs 릴러브 DCG" }, category: "esports", sub: "msi", round: { en: "Play-In Elim", ko: "플레이인 탈락전" }, match: { home: MT.liquid, away: MT.relove }, ...at("2026-06-29T08:00:00Z"), location: DJ, description: { en: "Play-In Lower R1 · 17:00 KST (Jun 29) · Result: Team Liquid 3–0 ✅ · Relove DCG eliminated", ko: "플레이인 하위 R1 · 한국 6/29 17:00 KST · 결과: 팀 리퀴드 3–0 승 ✅ · 릴러브 DCG 탈락" }, emoji: "🎮" },
  // -- 플레이인 마무리 (한국 6.30~7.1) --
  { id: "msi-pi-5", title: { en: "Karmine Corp vs Team Liquid", ko: "카민 코프 vs 팀 리퀴드" }, category: "esports", sub: "msi", round: { en: "Play-In Lower R2", ko: "플레이인 하위 R2" }, match: { home: MT.kc, away: MT.liquid }, ...at("2026-06-30T08:00:00Z"), location: DJ, description: { en: "Lower Round 2 · 17:00 KST (Jun 30) · Result: Team Liquid 3–0 ✅ · Karmine Corp eliminated", ko: "하위 2라운드 · 한국 6/30 17:00 KST · 결과: 팀 리퀴드 3–0 승 ✅ · 카민 코프 탈락" }, emoji: "🎮" },
  { id: "msi-pi-6", title: { en: "T1 vs Team Liquid · Play-In Qualification", ko: "T1 vs 팀 리퀴드 · 플레이인 진출전" }, category: "esports", sub: "msi", round: { en: "Play-In Qual", ko: "플레이인 진출전" }, match: { home: MT.t1, away: MT.liquid }, ...at("2026-07-01T08:00:00Z"), location: DJ, description: { en: "Qualification Match · 17:00 KST (Jul 1) · Result: T1 3–0 ✅ · T1 takes last Bracket spot", ko: "진출전 · 한국 7/1 17:00 KST · 결과: T1 3–0 승 ✅ · T1 브래킷 마지막 자리 확보" }, emoji: "🎮" },
  // -- 브래킷 스테이지 Round 1 (7.3~4) — Play-In 종료, 8팀 대진 공식 확정 (Liquipedia·Wikipedia 교차 확인, 2026-07-01) --
  { id: "msi-br1-1", title: { en: "Hanwha Life Esports vs Team Secret Whales", ko: "한화생명e스포츠 vs 시크릿 웨일스" }, category: "esports", sub: "msi", round: { en: "Bracket R1", ko: "브래킷 1라운드" }, starred: true, match: { home: MT.hanwha, away: MT.secretWhales }, ...at("2026-07-03T03:00:00Z"), location: DJ, description: { en: "Upper Bracket R1 · 12:00 KST (Jul 3) · Result: Hanwha Life Esports 3–0 ✅ · advance to Upper R2 vs G2 Esports", ko: "어퍼 브래킷 1라운드 · 한국 7/3 12:00 KST · 결과: 한화생명e스포츠 3–0 승 ✅ · 어퍼 2라운드 G2전" }, emoji: "🎮" },
  { id: "msi-br1-2", title: { en: "G2 Esports vs Top Esports", ko: "G2 e스포츠 vs 탑 e스포츠" }, category: "esports", sub: "msi", round: { en: "Bracket R1", ko: "브래킷 1라운드" }, starred: true, match: { home: MT.g2, away: MT.tes }, ...at("2026-07-03T08:00:00Z"), location: DJ, description: { en: "Upper Bracket R1 · 17:00 KST (Jul 3) · Result: G2 Esports 3–2 ✅ (reverse sweep after 0–2) · advance to Upper R2 vs Hanwha Life Esports", ko: "어퍼 브래킷 1라운드 · 한국 7/3 17:00 KST · 결과: G2 e스포츠 3–2 승 ✅ (0–2에서 리버스 스윕) · 어퍼 2라운드 한화생명전" }, emoji: "🎮" },
  { id: "msi-br1-3", title: { en: "LYON vs FURIA", ko: "리옹 vs 퓨리아" }, category: "esports", sub: "msi", round: { en: "Bracket R1", ko: "브래킷 1라운드" }, match: { home: MT.lyon, away: MT.furia }, ...at("2026-07-04T03:00:00Z"), location: DJ, description: { en: "Upper Bracket R1 · 12:00 KST (Jul 4) · Bo5", ko: "어퍼 브래킷 1라운드 · 한국 7/4 12:00 KST · Bo5" }, emoji: "🎮" },
  { id: "msi-br1-4", title: { en: "Bilibili Gaming vs T1", ko: "빌리빌리 게이밍 vs T1" }, category: "esports", sub: "msi", round: { en: "Bracket R1", ko: "브래킷 1라운드" }, starred: true, match: { home: MT.blg, away: MT.t1 }, ...at("2026-07-04T08:00:00Z"), location: DJ, description: { en: "Upper Bracket R1 · 17:00 KST (Jul 4) · Bo5", ko: "어퍼 브래킷 1라운드 · 한국 7/4 17:00 KST · Bo5" }, emoji: "🎮" },
  { id: "msi-br2-1", title: { en: "Hanwha Life Esports vs G2 Esports", ko: "한화생명e스포츠 vs G2 e스포츠" }, category: "esports", sub: "msi", round: { en: "Bracket R2", ko: "브래킷 2라운드" }, starred: true, match: { home: MT.hanwha, away: MT.g2 }, ...at("2026-07-05T03:00:00Z"), location: DJ, description: { en: "Upper Bracket R2 · 12:00 KST (Jul 5) · Bo5", ko: "어퍼 브래킷 2라운드 · 한국 7/5 12:00 KST · Bo5" }, emoji: "🎮" },
  { id: "msi-upper-final", title: { en: "MSI · Upper Final (TBD)", ko: "MSI · 어퍼 파이널 (미정)" }, category: "esports", sub: "msi", round: { en: "Upper Final", ko: "어퍼 파이널" }, match: { home: MT.tbd, away: MT.tbd }, ...at("2026-07-09T08:00:00Z"), location: DJ, description: { en: "Upper Final · 17:00 KST (Jul 9)", ko: "어퍼 파이널 · 한국 7/9 17:00 KST" }, emoji: "🎮" },
  { id: "msi-lower-final", title: { en: "MSI · Lower Final (TBD)", ko: "MSI · 로어 파이널 (미정)" }, category: "esports", sub: "msi", round: { en: "Lower Final", ko: "로어 파이널" }, match: { home: MT.tbd, away: MT.tbd }, ...at("2026-07-11T08:00:00Z"), location: DJ, description: { en: "Lower Final · 17:00 KST (Jul 11)", ko: "로어 파이널 · 한국 7/11 17:00 KST" }, emoji: "🎮" },
  { id: "msi-final", title: { en: "MSI · Grand Final (TBD)", ko: "MSI · 결승 (미정)" }, category: "esports", sub: "msi", round: { en: "Final", ko: "결승" }, starred: true, match: { home: MT.tbd, away: MT.tbd }, ...at("2026-07-12T06:00:00Z"), location: DJ, description: { en: "Grand Final · 15:00 KST (Jul 12)", ko: "MSI 결승 · 한국 7/12 15:00 KST" }, emoji: "🏆" },

  // 🎮 LoL Worlds 2026 (10.15~11.14) — 결승은 뉴욕 바클레이스!
  { id: "worlds-playin", title: { en: "Worlds · Play-In", ko: "Worlds · 플레이인" }, category: "esports", sub: "worlds", round: { en: "Play-In", ko: "플레이인" }, date: "2026-10-15", location: { en: "Riot Games Arena, LA", ko: "라이엇 게임즈 아레나 (LA)" }, description: { en: "Play-In · Oct 15 – 18", ko: "플레이인 · 10.15~18" }, emoji: "🎮" },
  { id: "worlds-swiss", title: { en: "Worlds · Swiss Stage", ko: "Worlds · 스위스 스테이지" }, category: "esports", sub: "worlds", round: { en: "Swiss", ko: "스위스" }, date: "2026-10-23", location: { en: "Allen, Texas", ko: "앨런 (텍사스)" }, description: { en: "Swiss · Oct 23 – 31", ko: "스위스 · 10.23~31" }, emoji: "🎮" },
  { id: "worlds-knockout", title: { en: "Worlds · Knockouts", ko: "Worlds · 녹아웃" }, category: "esports", sub: "worlds", round: { en: "Knockout", ko: "녹아웃" }, date: "2026-11-03", location: { en: "Allen, Texas", ko: "앨런 (텍사스)" }, description: { en: "Knockouts · Nov 3 – 8", ko: "녹아웃 · 11.3~8" }, emoji: "🎮" },
  { id: "worlds-final", title: { en: "Worlds Final", ko: "Worlds 결승" }, category: "esports", sub: "worlds", round: { en: "Final", ko: "결승" }, starred: true, date: "2026-11-14", time: "17:00", location: { en: "Barclays Center, Brooklyn NY", ko: "바클레이스 센터 (브루클린 뉴욕)" }, description: { en: "Worlds 2026 Final · New York", ko: "Worlds 2026 결승 · 뉴욕" }, emoji: "🏆" },

  // 🎤 콘서트 (Jongwon 큐레이션 · 뉴욕/뉴저지)
  { id: "con-cortis", title: { en: "CORTIS", ko: "CORTIS 콘서트" }, category: "music", sub: "concert", date: "2026-08-06", time: "20:00", location: { en: "Infosys Theater at MSG, NY", ko: "인포시스 시어터 @ MSG (뉴욕)" }, emoji: "🎤" },
  { id: "con-bensonboone", title: { en: "Benson Boone — Wanted Man Tour", ko: "벤슨 분 — Wanted Man 투어" }, category: "music", sub: "concert", date: "2026-07-10", location: { en: "Barclays Center, Brooklyn NY", ko: "바클레이스 센터 (브루클린 뉴욕)" }, description: { en: "Jul 10–11", ko: "7/10–11" }, emoji: "🎤" },
  { id: "con-jcole", title: { en: "J. Cole — The Fall-Off", ko: "제이콜 — The Fall-Off" }, category: "music", sub: "concert", date: "2026-07-31", location: { en: "Barclays Center, Brooklyn NY", ko: "바클레이스 센터 (브루클린 뉴욕)" }, description: { en: "Jul 31 – Aug 1", ko: "7/31–8/1" }, emoji: "🎤" },
  { id: "con-harry", title: { en: "Harry Styles — MSG Residency", ko: "해리 스타일스 — MSG 잔류공연" }, category: "music", sub: "concert", date: "2026-08-26", location: { en: "Madison Square Garden, NY", ko: "매디슨 스퀘어 가든 (뉴욕)" }, description: { en: "Residency Aug 26 – Oct 31 (Wed/Fri/Sat)", ko: "잔류공연 8/26~10/31 (수·금·토)" }, emoji: "🎸" },
  { id: "con-aespa", title: { en: "aespa", ko: "에스파" }, category: "music", sub: "concert", date: "2026-09-18", location: { en: "UBS Arena, Belmont Park NY", ko: "UBS 아레나 (벨몬트파크 뉴욕)" }, emoji: "🎤" },
  { id: "con-bruno", title: { en: "Bruno Mars — The Romantic Tour", ko: "브루노 마스 — 로맨틱 투어" }, category: "music", sub: "concert", date: "2026-08-21", location: { en: "MetLife Stadium, NJ", ko: "메트라이프 스타디움 (뉴저지)" }, description: { en: "Aug 21–26", ko: "8/21–26" }, emoji: "🎤" },
  { id: "con-epikhigh", title: { en: "Epik High — 3.0 Tour", ko: "에픽하이 — 3.0 투어" }, category: "music", sub: "concert", date: "2026-09-30", time: "20:00", location: { en: "Terminal 5, NY", ko: "터미널 5 (뉴욕)" }, emoji: "🎤" },
  { id: "con-katseye", title: { en: "KATSEYE — Wildworld Tour", ko: "캣츠아이 — Wildworld 투어" }, category: "music", sub: "concert", date: "2026-10-24", location: { en: "UBS Arena, Belmont Park NY", ko: "UBS 아레나 (벨몬트파크 뉴욕)" }, emoji: "🎤" },
  { id: "con-doja", title: { en: "Doja Cat — Tour Ma Vie", ko: "도자 캣 — Tour Ma Vie" }, category: "music", sub: "concert", date: "2026-12-01", location: { en: "Madison Square Garden, NY", ko: "매디슨 스퀘어 가든 (뉴욕)" }, emoji: "🎤" },
  { id: "con-ariana", title: { en: "Ariana Grande — Eternal Sunshine", ko: "아리아나 그란데 — Eternal Sunshine" }, category: "music", sub: "concert", date: "2026-07-12", location: { en: "Barclays Center, Brooklyn NY", ko: "바클레이스 센터 (브루클린 뉴욕)" }, description: { en: "Jul 12·13·16·18·19", ko: "7/12·13·16·18·19 (5밤)" }, emoji: "🎤" },
];
