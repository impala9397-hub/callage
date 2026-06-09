import type { CalEvent } from "../types";

// 시드 데이터 — 실제 일정 기반 (웹 검색, 2026-06 기준).
// 기간: 2026년 6월 ~ 2027년 1월. 제목·장소는 다국어(LocalizedText).
// ⚠️ 월드컵 결선 대진은 결과에 따라 정해지므로 "단계 일정"으로만 표기(팀 미정).
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
  // 결선 — 대진은 결과에 따라 정해짐(팀 미정), 일정만
  { id: "wc-r32", title: { en: "World Cup · Round of 32 begins", ko: "월드컵 · 32강 시작" }, category: "sports", sub: "worldcup", round: WC_R32, date: "2026-06-28", description: { en: "Round of 32 · Jun 28 – Jul 3", ko: "32강 · 6.28~7.3" }, emoji: "⚽" },
  { id: "wc-r16", title: { en: "World Cup · Round of 16 begins", ko: "월드컵 · 16강 시작" }, category: "sports", sub: "worldcup", round: WC_R16, date: "2026-07-04", description: { en: "Round of 16 · Jul 4 – 7", ko: "16강 · 7.4~7" }, emoji: "⚽" },
  { id: "wc-qf", title: { en: "World Cup · Quarter-finals", ko: "월드컵 · 8강" }, category: "sports", sub: "worldcup", round: WC_QF, date: "2026-07-11", description: { en: "Quarter-finals · Jul 9 – 11", ko: "8강 · 7.9~11" }, emoji: "⚽" },
  { id: "wc-sf1", title: { en: "World Cup · Semi-final 1", ko: "월드컵 · 준결승 1" }, category: "sports", sub: "worldcup", round: WC_SF, date: "2026-07-14", time: "20:00", location: { en: "AT&T Stadium, Dallas", ko: "AT&T 스타디움 (댈러스)" }, emoji: "⚽" },
  { id: "wc-sf2", title: { en: "World Cup · Semi-final 2", ko: "월드컵 · 준결승 2" }, category: "sports", sub: "worldcup", round: WC_SF, date: "2026-07-15", time: "20:00", location: { en: "Mercedes-Benz Stadium, Atlanta", ko: "메르세데스-벤츠 스타디움 (애틀랜타)" }, emoji: "⚽" },
  { id: "wc-3rd", title: { en: "World Cup · Third Place", ko: "월드컵 · 3-4위전" }, category: "sports", sub: "worldcup", round: WC_3P, date: "2026-07-18", location: { en: "Hard Rock Stadium, Miami", ko: "하드록 스타디움 (마이애미)" }, emoji: "⚽" },
  { id: "wc-final", title: { en: "World Cup Final", ko: "월드컵 결승" }, category: "sports", sub: "worldcup", round: WC_FINAL, starred: true, date: "2026-07-19", time: "15:00", location: { en: "MetLife Stadium, NJ", ko: "메트라이프 스타디움 (뉴저지)" }, description: { en: "2026 FIFA World Cup Final", ko: "2026 FIFA 월드컵 결승" }, emoji: "🏆" },

  // 🎮 LoL MSI 2026 — 대전, 한국 (6.28~7.12)
  { id: "msi-playin", title: { en: "LoL MSI · Play-in", ko: "LoL MSI · 플레이인" }, category: "esports", sub: "msi", round: { en: "Play-in", ko: "플레이인" }, date: "2026-06-28", time: "17:00", location: { en: "Daejeon Convention Center", ko: "대전컨벤션센터" }, description: { en: "Play-in · Jun 28 – Jul 1", ko: "플레이인 · 6.28~7.1" }, emoji: "🎮" },
  { id: "msi-bracket", title: { en: "LoL MSI · Bracket Stage", ko: "LoL MSI · 브래킷 스테이지" }, category: "esports", sub: "msi", round: { en: "Bracket", ko: "브래킷" }, date: "2026-07-03", time: "17:00", location: { en: "Daejeon Convention Center", ko: "대전컨벤션센터" }, emoji: "🎮" },
  { id: "msi-final", title: { en: "LoL MSI · Final", ko: "LoL MSI · 결승" }, category: "esports", sub: "msi", round: { en: "Final", ko: "결승" }, starred: true, date: "2026-07-12", time: "16:00", location: { en: "Daejeon Convention Center", ko: "대전컨벤션센터" }, description: { en: "Mid-Season Invitational final", ko: "Mid-Season Invitational 결승" }, emoji: "🏆" },

  // 🎮 LoL Worlds 2026 (10.15~11.14) — 결승은 뉴욕 바클레이스!
  { id: "worlds-playin", title: { en: "Worlds · Play-In", ko: "Worlds · 플레이인" }, category: "esports", sub: "worlds", round: { en: "Play-In", ko: "플레이인" }, date: "2026-10-15", location: { en: "Riot Games Arena, LA", ko: "라이엇 게임즈 아레나 (LA)" }, description: { en: "Play-In · Oct 15 – 18", ko: "플레이인 · 10.15~18" }, emoji: "🎮" },
  { id: "worlds-swiss", title: { en: "Worlds · Swiss Stage", ko: "Worlds · 스위스 스테이지" }, category: "esports", sub: "worlds", round: { en: "Swiss", ko: "스위스" }, date: "2026-10-23", location: { en: "Allen, Texas", ko: "앨런 (텍사스)" }, description: { en: "Swiss · Oct 23 – 31", ko: "스위스 · 10.23~31" }, emoji: "🎮" },
  { id: "worlds-knockout", title: { en: "Worlds · Knockouts", ko: "Worlds · 녹아웃" }, category: "esports", sub: "worlds", round: { en: "Knockout", ko: "녹아웃" }, date: "2026-11-03", location: { en: "Allen, Texas", ko: "앨런 (텍사스)" }, description: { en: "Knockouts · Nov 3 – 8", ko: "녹아웃 · 11.3~8" }, emoji: "🎮" },
  { id: "worlds-final", title: { en: "Worlds Final", ko: "Worlds 결승" }, category: "esports", sub: "worlds", round: { en: "Final", ko: "결승" }, starred: true, date: "2026-11-14", time: "17:00", location: { en: "Barclays Center, Brooklyn NY", ko: "바클레이스 센터 (브루클린 뉴욕)" }, description: { en: "Worlds 2026 Final · New York", ko: "Worlds 2026 결승 · 뉴욕" }, emoji: "🏆" },

  // 🎤 콘서트 — 한국 아티스트 (뉴욕)
  { id: "con-rose", title: { en: "The Rose — ROSETOPIA", ko: "The Rose 내한급 공연" }, category: "music", sub: "concert", starred: true, date: "2026-06-05", time: "20:00", location: { en: "Infosys Theater at MSG, NY", ko: "인포시스 시어터 @ MSG (뉴욕)" }, emoji: "🎸" },
  { id: "con-cortis", title: { en: "CORTIS", ko: "CORTIS 콘서트" }, category: "music", sub: "concert", date: "2026-08-06", time: "20:00", location: { en: "Infosys Theater at MSG, NY", ko: "인포시스 시어터 @ MSG (뉴욕)" }, emoji: "🎤" },
  { id: "con-monstax", title: { en: "MONSTA X", ko: "몬스타엑스 콘서트" }, category: "music", sub: "concert", date: "2026-10-06", time: "20:00", location: { en: "Infosys Theater at MSG, NY", ko: "인포시스 시어터 @ MSG (뉴욕)" }, emoji: "🎤" },
  { id: "con-lesserafim", title: { en: "LE SSERAFIM", ko: "르세라핌 콘서트" }, category: "music", sub: "concert", starred: true, date: "2026-10-08", time: "19:30", location: { en: "Prudential Center, Newark NJ", ko: "프루덴셜 센터 (뉴어크 NJ)" }, emoji: "🎤" },

  // 🎤 콘서트 — 미국 아티스트 (뉴욕)
  { id: "con-phoebe", title: { en: "Phoebe Bridgers", ko: "피비 브리저스" }, category: "music", sub: "concert", date: "2026-06-04", time: "19:00", location: { en: "Madison Square Garden, NY", ko: "매디슨 스퀘어 가든 (뉴욕)" }, emoji: "🎸" },
  { id: "con-groban", title: { en: "Josh Groban + Jennifer Hudson", ko: "조시 그로반 (제니퍼 허드슨 협연)" }, category: "music", sub: "concert", date: "2026-06-12", time: "20:00", location: { en: "Madison Square Garden, NY", ko: "매디슨 스퀘어 가든 (뉴욕)" }, emoji: "🎤" },
];
