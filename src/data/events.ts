import type { CalEvent } from "../types";

// 시드 데이터 — 실제 일정 기반.
// 기간: 2026년 6월 ~ 2027년 1월. 제목·장소는 다국어(LocalizedText).
// ✅ 검증: 월드컵 32강 대진 + MSI 일정/팀 = Wikipedia 확인 (2026-06-28).
// ⚠️ 32강 이후(16강~결승) 대진은 결과 의존 → "단계 일정"으로만 표기(팀 미정).
// ⚠️ 대한민국은 조별리그 탈락 → 32강 명단에 없음(32강 16경기 모두 한국 없음, Wikipedia).
// ⚠️ MSI 경기별 시각·플레이인 대진은 미공개(플레이인 6.28 시작) → 시각 생략, 단계 일정만.
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

// 월드컵 32강 — 조별리그 결과로 확정된 16경기 (Wikipedia 검증, 2026-06-28).
// 시각은 현지 킥오프(현지 시간대), 경기장 포함. [date, home, away, 현지시각, 경기장]
const WC_R32_FIXTURES: [string, string, string, string, string][] = [
  ["2026-06-28", "South Africa", "Canada", "12:00", "SoFi Stadium, Inglewood"],
  ["2026-06-29", "Brazil", "Japan", "12:00", "NRG Stadium, Houston"],
  ["2026-06-29", "Germany", "Paraguay", "16:30", "Gillette Stadium, Foxborough"],
  ["2026-06-29", "Netherlands", "Morocco", "19:00", "Estadio BBVA, Guadalupe"],
  ["2026-06-30", "Ivory Coast", "Norway", "12:00", "AT&T Stadium, Arlington"],
  ["2026-06-30", "France", "Sweden", "17:00", "MetLife Stadium, East Rutherford"],
  ["2026-06-30", "Mexico", "Ecuador", "19:00", "Estadio Azteca, Mexico City"],
  ["2026-07-01", "England", "DR Congo", "12:00", "Mercedes-Benz Stadium, Atlanta"],
  ["2026-07-01", "Belgium", "Senegal", "13:00", "Lumen Field, Seattle"],
  ["2026-07-01", "United States", "Bosnia and Herzegovina", "17:00", "Levi's Stadium, Santa Clara"],
  ["2026-07-02", "Spain", "Austria", "12:00", "SoFi Stadium, Inglewood"],
  ["2026-07-02", "Portugal", "Croatia", "19:00", "BMO Field, Toronto"],
  ["2026-07-02", "Switzerland", "Algeria", "20:00", "BC Place, Vancouver"],
  ["2026-07-03", "Australia", "Egypt", "13:00", "AT&T Stadium, Arlington"],
  ["2026-07-03", "Argentina", "Cape Verde", "18:00", "Hard Rock Stadium, Miami Gardens"],
  ["2026-07-03", "Colombia", "Ghana", "20:30", "Arrowhead Stadium, Kansas City"],
];

const WC_R32_EVENTS: CalEvent[] = WC_R32_FIXTURES.map(([date, home, away, time, location], i) => ({
  id: `wc-r32-${i}`,
  title: `${home} vs ${away}`,
  category: "sports",
  sub: "worldcup",
  round: WC_R32,
  match: { home, away },
  date,
  time,
  location,
  emoji: "⚽",
}));

// MSI 2026 — 대전 경기장 + 팀 (다국어). 플레이인 4팀 = 각 리그 2번 시드.
const DJ = { en: "Daejeon Convention Center II", ko: "대전컨벤션센터 II" };
const MT = {
  t1: { en: "T1", ko: "T1" },
  liquid: { en: "Team Liquid", ko: "팀 리퀴드" },
  kc: { en: "Karmine Corp", ko: "카민 코프" },
  relove: { en: "Relove DCG", ko: "릴러브 DCG" },
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
  // 16강 이후 — 대진은 결과에 따라 정해짐(팀 미정), 일정만
  { id: "wc-r16", title: { en: "World Cup · Round of 16 begins", ko: "월드컵 · 16강 시작" }, category: "sports", sub: "worldcup", round: WC_R16, date: "2026-07-04", description: { en: "Round of 16 · Jul 4 – 7", ko: "16강 · 7.4~7" }, emoji: "⚽" },
  { id: "wc-qf", title: { en: "World Cup · Quarter-finals", ko: "월드컵 · 8강" }, category: "sports", sub: "worldcup", round: WC_QF, date: "2026-07-11", description: { en: "Quarter-finals · Jul 9 – 11", ko: "8강 · 7.9~11" }, emoji: "⚽" },
  { id: "wc-sf1", title: { en: "World Cup · Semi-final 1", ko: "월드컵 · 준결승 1" }, category: "sports", sub: "worldcup", round: WC_SF, date: "2026-07-14", time: "20:00", location: { en: "AT&T Stadium, Dallas", ko: "AT&T 스타디움 (댈러스)" }, emoji: "⚽" },
  { id: "wc-sf2", title: { en: "World Cup · Semi-final 2", ko: "월드컵 · 준결승 2" }, category: "sports", sub: "worldcup", round: WC_SF, date: "2026-07-15", time: "20:00", location: { en: "Mercedes-Benz Stadium, Atlanta", ko: "메르세데스-벤츠 스타디움 (애틀랜타)" }, emoji: "⚽" },
  { id: "wc-3rd", title: { en: "World Cup · Third Place", ko: "월드컵 · 3-4위전" }, category: "sports", sub: "worldcup", round: WC_3P, date: "2026-07-18", location: { en: "Hard Rock Stadium, Miami", ko: "하드록 스타디움 (마이애미)" }, emoji: "⚽" },
  { id: "wc-final", title: { en: "World Cup Final", ko: "월드컵 결승" }, category: "sports", sub: "worldcup", round: WC_FINAL, starred: true, date: "2026-07-19", time: "15:00", location: { en: "MetLife Stadium, NJ", ko: "메트라이프 스타디움 (뉴저지)" }, description: { en: "2026 FIFA World Cup Final", ko: "2026 FIFA 월드컵 결승" }, emoji: "🏆" },

  // 🎮 LoL MSI 2026 — 대전컨벤션센터 II, 한국 (6.28~7.12). 11팀/6지역 (Wikipedia 검증, 2026-06-28).
  // 플레이인 = 각 리그 2번 시드 4팀(T1·카민코프·팀리퀴드·릴러브DCG) 더블엘리미네이션 Bo5.
  // ⚠️ 앱 시각이 EST 고정 → 한국(KST) 경기는 시각을 description에 'KST'로 명시하고 time 필드는 비움.
  // ⚠️ 6/30~7/1 플레이인·브래킷 대진은 결과 의존 → 팀 TBD(미정).
  // -- 플레이인 1라운드 (6.28, 종료) --
  { id: "msi-pi-1", title: { en: "T1 vs Team Liquid", ko: "T1 vs 팀 리퀴드" }, category: "esports", sub: "msi", round: { en: "Play-In R1", ko: "플레이인 R1" }, starred: true, match: { home: MT.t1, away: MT.liquid }, date: "2026-06-28", location: DJ, description: { en: "Play-In Upper R1 · 12:00 KST · Result: T1 3–0 ✅", ko: "플레이인 상위 R1 · 12:00 KST · 결과: T1 3–0 승 ✅" }, emoji: "🎮" },
  { id: "msi-pi-2", title: { en: "Karmine Corp vs Relove DCG", ko: "카민 코프 vs 릴러브 DCG" }, category: "esports", sub: "msi", round: { en: "Play-In R1", ko: "플레이인 R1" }, match: { home: MT.kc, away: MT.relove }, date: "2026-06-28", location: DJ, description: { en: "Play-In Upper R1 · 17:00 KST · Result: Karmine Corp 3–0 ✅", ko: "플레이인 상위 R1 · 17:00 KST · 결과: 카민 코프 3–0 승 ✅" }, emoji: "🎮" },
  // -- 플레이인 2일차 (6.29, 대진 확정·결과 미정) --
  { id: "msi-pi-3", title: { en: "T1 vs Karmine Corp", ko: "T1 vs 카민 코프" }, category: "esports", sub: "msi", round: { en: "Play-In Winners", ko: "플레이인 승자전" }, starred: true, match: { home: MT.t1, away: MT.kc }, date: "2026-06-29", location: DJ, description: { en: "Play-In Winners' Match · 12:00 KST · winner advances to Bracket Stage", ko: "플레이인 승자전 · 12:00 KST · 승자 브래킷 진출" }, emoji: "🎮" },
  { id: "msi-pi-4", title: { en: "Team Liquid vs Relove DCG", ko: "팀 리퀴드 vs 릴러브 DCG" }, category: "esports", sub: "msi", round: { en: "Play-In Elim", ko: "플레이인 탈락전" }, match: { home: MT.liquid, away: MT.relove }, date: "2026-06-29", location: DJ, description: { en: "Play-In Lower R1 · 17:00 KST · loser eliminated", ko: "플레이인 하위 R1 · 17:00 KST · 패자 탈락" }, emoji: "🎮" },
  // -- 플레이인 마무리 (6.30~7.1, 대진 미정) --
  { id: "msi-pi-5", title: { en: "Play-In · Lower R2 (TBD)", ko: "플레이인 · 하위 R2 (미정)" }, category: "esports", sub: "msi", round: { en: "Play-In Lower R2", ko: "플레이인 하위 R2" }, match: { home: MT.tbd, away: MT.tbd }, date: "2026-06-30", location: DJ, description: { en: "Lower Round 2 · 17:00 KST · 승자전 패자 vs 탈락전 승자", ko: "하위 2라운드 · 17:00 KST · 승자전 패자 vs 탈락전 승자" }, emoji: "🎮" },
  { id: "msi-pi-6", title: { en: "Play-In · Qualification (TBD)", ko: "플레이인 · 진출전 (미정)" }, category: "esports", sub: "msi", round: { en: "Play-In Qual", ko: "플레이인 진출전" }, match: { home: MT.tbd, away: MT.tbd }, date: "2026-07-01", location: DJ, description: { en: "Qualification Match · 17:00 KST · winner takes last Bracket spot", ko: "진출전 · 17:00 KST · 승자 브래킷 마지막 자리" }, emoji: "🎮" },
  // -- 브래킷 스테이지 (7.3~12) — 8팀 더블엘리. 직행 시드 확정, 대진은 추첨·플레이인 결과 후 --
  { id: "msi-bracket", title: { en: "MSI · Bracket Stage begins", ko: "MSI · 브래킷 스테이지 시작" }, category: "esports", sub: "msi", round: { en: "Bracket", ko: "브래킷" }, date: "2026-07-03", location: DJ, description: { en: "Bracket · Jul 3–8 · 8 teams Bo5. Direct seeds: G2, Hanwha Life, FURIA, LYON, Top Esports, Bilibili Gaming, Team Secret Whales (+ Play-In qualifiers)", ko: "브래킷 · 7.3~8 · 8팀 Bo5. 직행: G2·한화생명·FURIA·LYON·TES·BLG·시크릿웨일스 (+플레이인 통과팀)" }, emoji: "🎮" },
  { id: "msi-upper-final", title: { en: "MSI · Upper Final (TBD)", ko: "MSI · 어퍼 파이널 (미정)" }, category: "esports", sub: "msi", round: { en: "Upper Final", ko: "어퍼 파이널" }, match: { home: MT.tbd, away: MT.tbd }, date: "2026-07-09", location: DJ, emoji: "🎮" },
  { id: "msi-lower-final", title: { en: "MSI · Lower Final (TBD)", ko: "MSI · 로어 파이널 (미정)" }, category: "esports", sub: "msi", round: { en: "Lower Final", ko: "로어 파이널" }, match: { home: MT.tbd, away: MT.tbd }, date: "2026-07-11", location: DJ, emoji: "🎮" },
  { id: "msi-final", title: { en: "MSI · Grand Final (TBD)", ko: "MSI · 결승 (미정)" }, category: "esports", sub: "msi", round: { en: "Final", ko: "결승" }, starred: true, match: { home: MT.tbd, away: MT.tbd }, date: "2026-07-12", location: DJ, description: { en: "Mid-Season Invitational Grand Final · 16:00 KST", ko: "MSI 결승 · 16:00 KST" }, emoji: "🏆" },

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
