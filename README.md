# Callage

**calendar + collage** — 스포츠·e스포츠 등 흩어진 이벤트 일정을 한 화면에 모아 보는 캘린더.
나중엔 친구와 공유·태깅·그룹·투표하는 소셜 캘린더로 확장.

라이트 테마 고정. 디자인 토큰은 상위 [BRAND.md](../BRAND.md)를 따른다.

## 실행
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 타입체크 + 프로덕션 번들
```

## 구조
```
src/
├── App.tsx              상태(현재 월·필터·선택) + 레이아웃 조립
├── types.ts            CalEvent 타입 · 카테고리 정의
├── data/events.ts      시드 이벤트 (월드컵·NBA·LoL MSI 등) — 추후 외부 소스로 교체
├── lib/date.ts         TZ 안전 날짜 헬퍼 (문자열 기반)
└── components/
    ├── Sidebar.tsx         브랜드 · 카테고리 필터 · 다가오는 일정
    ├── CalendarHeader.tsx  월 이동 / 오늘
    ├── MonthGrid.tsx       6주 월간 그리드
    └── EventDetail.tsx     이벤트 상세 드로어 (+ v2 소셜 버튼 자리)
```

## 제품 방향 (2026-06-05 전환 · 근거: 상위 [LEARNINGS.md](../LEARNINGS.md))
핵심 통찰: **범용 월간 그리드 < 도메인 네이티브 뷰.** 사람들은 "언제 다 있지?"(수집)보다
"내가 사랑하는 그게 어떻게 돼가지?"(팔로우)를 원한다. 그리드는 hero가 아니라 여러 렌더 중 하나.

베팅 순서 (토대 → 표현):
1. **C. 데이터 모델을 풍부하게** ← 모든 뷰의 토대.
   `CalEvent`에 competition · round · group · home/away · participants · series-game-no 같은 구조화 필드.
   (이미 `round` / `homeAway` 필드는 들어감 — 첫 삽 완료.)
2. **A. 도메인 네이티브 뷰**: 대회별 스윔레인 타임라인 / 시리즈 뷰(G1–G5, 홈·원정) / 브래킷.
3. **B. 팔로우 중심**: 좋아하는 팀·대회를 follow → 맨 위 focal strip("닉스: G2까지 2일, 홈").
   평등한 알약 대신 위계.

다음 작은 슬라이스(검증): 월드컵 데이터에 round/group/home-away 채우고,
**스윔레인 타임라인 1개**를 붙여 "확 들어옴"이 우리 데이터로 재현되는지 확인.

## 로드맵
- [x] **v1** 월간 캘린더 뷰 · 카테고리/서브카테고리 필터 · 이벤트 상세
- [x] **v1.1** 타임라인 뷰 · 이벤트 추가/편집/삭제 · i18n(EN/한국어)
- [ ] **v1.5 (방향 전환 핵심)** 풍부한 데이터 모델(C) → 도메인 네이티브 뷰(A, 스윔레인부터)
- [ ] v1.6 팔로우 + focal strip (B)
- [ ] v1.7 외부 일정 소스 연동 (스포츠/e스포츠 API)
- [ ] v2 소셜 — 공유, 친구 태깅, 그룹, "같이 가기" 투표

## 메모
- 시드 데이터 기준 "오늘"은 `App.tsx`의 `TODAY` 상수 (`2026-06-05`). 실데이터 연동 시 `new Date()`로 교체.
