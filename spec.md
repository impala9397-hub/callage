# spec.md — Callage (calendar + collage)

> 흩어진 이벤트 일정을 한 화면에 모아 "내가 사랑하는 그게 어떻게 돼가지?"를 한눈에 보는 도메인 네이티브 캘린더.
> 코드 전에 이 문서로 **무엇을·왜 → 어떻게 → task**를 합의한다. (작업 규칙은 [AGENTS.md](AGENTS.md))
> 상태: 🟡 방향 전환 진행 중 (v1 완료 → v1.5 도메인 네이티브 뷰로)

---

## 1. 무엇을 · 왜 (What & Why)

스포츠·e스포츠 팬은 좋아하는 팀·대회 일정이 리그마다 흩어져 있어 따라가기 번거롭다.

핵심 통찰(2026-06-05 전환, 근거: 상위 `../LEARNINGS.md`):
**범용 월간 그리드 < 도메인 네이티브 뷰.** 사람들은 "언제 다 있지?"(수집)보다
**"내가 사랑하는 그게 어떻게 돼가지?"(팔로우)**를 원한다. 월간 그리드는 hero가 아니라 여러 렌더 중 하나일 뿐.

해결: 이벤트를 풍부하게 구조화한 데이터 위에, **대회/시리즈에 맞는 전용 뷰**(스윔레인 타임라인, 시리즈 G1–G5, 브래킷)와 **팔로우 중심 상단 strip**을 얹는다.

성공 기준: 종원님이 좋아하는 팀/대회를 follow 하면, 앱을 열자마자 맨 위에서 **"닉스: G2까지 2일, 홈"** 같은 한 줄을 보고 — 흩어진 일정을 뒤지지 않고 진행 상황을 즉시 파악한다.

---

## 2. 어떻게 (How — 구조 & 데이터 모델)

### 2.1 기술/구조
- Vite + React 19 + TypeScript. 라이트 테마 고정(`../BRAND.md` 토큰). 포트 5173.
- 데이터와 표현 분리: 이벤트는 데이터(`src/data/events.ts`, 추후 외부 소스), 로직은 컴포넌트.
- 날짜는 `src/lib/date.ts` TZ 안전 문자열 헬퍼만 사용.

### 2.2 베팅 순서 (토대 → 표현)
1. **C. 데이터 모델을 풍부하게** ← 모든 뷰의 토대. `CalEvent`에 competition · round · group · home/away · participants · series-game-no 등 구조화 필드. (`round`/`homeAway`는 이미 들어감 — 첫 삽 완료.)
2. **A. 도메인 네이티브 뷰:** 대회별 스윔레인 타임라인 / 시리즈 뷰(G1–G5, 홈·원정) / 브래킷.
3. **B. 팔로우 중심:** 좋아하는 팀·대회 follow → 맨 위 focal strip. 평등한 알약 대신 위계.

### 2.3 데이터 모델 (확장 방향)
```ts
// src/types.ts — CalEvent (풍부화 대상)
interface CalEvent {
  id: string
  title: string
  date: string            // TZ 안전 문자열 (lib/date.ts)
  category: string        // 스포츠 · e스포츠 등
  subcategory?: string
  competition?: string    // 대회/리그 (예: LoL MSI, NBA Finals)
  round?: string          // 라운드/단계
  group?: string          // 조
  homeAway?: 'home' | 'away'
  participants?: string[] // 팀/선수
  seriesGameNo?: number   // 시리즈 내 G1..G5
  source?: string         // 검증 출처 (사실 데이터 필수)
}
```

### 2.4 현재 컴포넌트
`App.tsx`(상태·레이아웃) · `Sidebar`(필터·다가오는 일정) · `CalendarHeader`(월 이동) · `MonthGrid`(6주 그리드) · `EventDetail`(상세 드로어, v2 소셜 버튼 자리).

---

## 3. Task 분해 / 로드맵

- [x] v1 — 월간 캘린더 뷰 · 카테고리/서브카테고리 필터 · 이벤트 상세
- [x] v1.1 — 타임라인 뷰 · 이벤트 추가/편집/삭제 · i18n(EN/한국어)
- [ ] **v1.5 (방향 전환 핵심)** 풍부한 데이터 모델(C) → 도메인 네이티브 뷰(A, 스윔레인부터)
  - [ ] 다음 작은 슬라이스: 월드컵 데이터에 round/group/home-away 채우고 **스윔레인 타임라인 1개** 붙여 "확 들어옴"이 우리 데이터로 재현되는지 검증
- [ ] v1.6 — 팔로우 + focal strip (B)
- [ ] v1.7 — 외부 일정 소스 연동 (스포츠/e스포츠 API)
- [ ] v2 — 소셜: 공유 · 친구 태깅 · 그룹 · "같이 가기" 투표

---

## 4. 규칙 / 제약 (Non-negotiables)

1. **사실(일정·점수·홈/원정·장소)은 추론 금지, 출처로 필드마다 검증.** 불확실하면 표시. 각 사실 데이터에 `source`.
2. 신뢰 출처 우선(공식 리그/팀/대회, ESPN, Wikipedia). SEO 스팸·리세일 금지.
3. 홈/원정·시드·시간(타임존)은 틀리기 쉬움 — 종원님이 스폿체크하게 불확실성을 드러낼 것.
4. 라이트 테마 고정, 다크모드 금지. 날짜는 TZ 안전 헬퍼만.

---

## 5. 결정된 사항 (Decided)

- ✅ **저장소:** GitHub **PUBLIC** `impala9397-hub/callage` (git 세팅 2026-06-08).
- ✅ **방향:** 범용 월간 그리드 → 도메인 네이티브 뷰 + 팔로우 중심. 그리드는 여러 렌더 중 하나.
- ✅ **다음 검증 슬라이스:** 스윔레인 타임라인 1개로 가치 가설 확인 후 확장.
- ⏳ 시드 데이터 → 외부 API 교체는 v1.7로. 그 전까진 `events.ts` 시드 + `TODAY` 상수.
