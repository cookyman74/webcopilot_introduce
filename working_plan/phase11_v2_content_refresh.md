# Phase 11 — v2 콘텐츠 리프레시 구현

> **Source of truth**: `working_plan/proposal_v2_content_refresh_20260516.md` (사용자 결정 완료)
> **Goal**: 신규 features overview (Work Memory · /do agentic · 다중탭 · UI 커스텀 등) 을 랜딩에 반영
> **Method**: Red → Green → Refactor (vitest)
> **확정된 결정**:
> - Hero: 후보 A 채택 (보수적, "AI 코파일럿" 키워드 유지)
> - Problem: p5 추가 **제외** (4개 유지)
> - Scenarios: **6 시나리오 전면 채택** + s4 = "사용자 UI/UX 커스텀 권한" 톤 + 메일발송 prompt 박스 노출
> - 그룹웨어 s3: **삭제** (Business 섹션과 분리)
> - Features: **카테고리 그루핑 도입** (9 → 13개에 카테고리 헤더)
> - Roadmap: **옵션 C 채택** — 핵심 기능은 Features (구현됨), Roadmap = 같은 영역 다음 진화
> - Roadmap 4번째 슬롯: **추가 안 함** (3슬롯 유지)

---

## 영향받는 파일

### 콘텐츠 (i18n)
- `src/i18n/locales/ko.json` — 전면 수정 (hero, solution, features, scenarios, differentiation, safety, roadmap)
- `src/i18n/locales/en.json` — 동일 키 영문 동기화

### 컴포넌트 (TSX)
- `src/components/sections/HeroSection.tsx` — 카피만 (구조 무변)
- `src/components/sections/SolutionSection.tsx` — 3축 → 4축, 그리드 재배치
- `src/components/sections/FeaturesSection.tsx` — 9 → 13개, **카테고리 그루핑** 도입
- `src/components/sections/ScenariosSection.tsx` — 4 → 6, s4 prompt 박스 특수 처리
- `src/components/sections/DifferentiationSection.tsx` — 3 → 5, 그리드 재배치
- `src/components/sections/SafetySection.tsx` — 4 → 5 (loop 추가)
- `src/components/sections/RoadmapSection.tsx` — items 키 재명명

### 테스트 (TSX) — 각 섹션 test 일괄 업데이트
- `*.test.tsx` 동반 수정

### 변경 없음
- `App.tsx` (섹션 순서 무변)
- `Header.tsx`, `Footer.tsx`
- `AIModesSection`, `BusinessSection`, `ProblemSection`, `FinalCTASection`
- `lib/constants.ts`
- `tailwind.config.js`

---

## Phase A (P0) — i18n + 시나리오 + Features

### A1. i18n 카피 일괄 추가/수정 (ko + en)

**Hero**
- `hero.title`: "웹페이지를 이해하고, 작성하고, 기억하는 AI 코파일럿"
- `hero.subtitle`: "단순 채팅 AI가 아닌 **웹페이지 = 작업 맥락 공간** 으로 인식하는 개인형 작업 파트너입니다. 페이지 본문, 다중 탭, 입력폼, 사이트 UI까지 — 자연어 한 줄로 자동화하고, 사이트별 작업 메모리는 다음 방문에 자동 복원됩니다."

**Solution (4번째 axes 추가)**
- `solution.axes.memory.title`: "사이트별 작업 메모리"
- `solution.axes.memory.desc`: "사이트별 독립 메모리(per-site IDB)에 작업 진행 상황·비교 결과를 영속 저장. 다음 방문 시 자동 복원되어 처음부터 다시 시작할 필요가 없습니다."
- `solution.axes.memory.example`: "쇼핑 비교 표·리서치 노트 자동 복원"

**Features (신규 키 + 기존 보강 + 카테고리 라벨)**
- 신규 카테고리 키: `features.categories.{absorb|write|automate|memory|interface}`
  - absorb = "정보 흡수·분석"
  - write = "작성·편집"
  - automate = "사이트 자동화"
  - memory = "작업 맥락 메모리"
  - interface = "인터페이스"
- 신규 features.items 키:
  - `workMemory`: "Work Memory" / "사이트별 독립 메모리에 작업 컨텍스트 영속 저장·자동 복원" / 예: "다음 방문 시 비교 표 자동 복원"
  - `doCommand`: "/do 에이전틱 명령" / "작업 의도 자동 분류 + LLM-tool-LLM 자동 반복" / 예: "탭 그룹화·종합 분석"
  - `multiTab`: "다중 탭 종합 분석" / "여러 탭을 한 번에 read → markdown 종합 표" / 예: "쇼핑 4-5개 탭 비교"
  - `tone`: "톤 변환" / "더 짧게·존댓말로·격식 있게 — 한 줄로 본문 톤 변환" / 예: "댓글 톤 즉시 조정"
  - `webSearch`: "웹 검색 통합" / "AI가 자동으로 자료 보강 검색 호출" / 예: "용어·인용 자동 검색"
  - `tabGroup`: "탭 그룹화" / "/do + chrome.tabGroups 자동 묶음" / 예: "쇼핑몰별 색 분류"
  - `scriptCRUD`: "자동화 자산 관리" / "/act_list로 등록 스크립트 조회, /act_edit으로 수정·삭제" / 예: "자동화를 자산으로 운영"
- 기존 보강:
  - `autofill.desc`: "그룹웨어 문서·요청서 작성 보조 (Lexical/Slate/Draft/ProseMirror 호환)"
  - `floating.title` 그대로, `floating.desc`: "선택 직후 옆에 뜨는 작업 메뉴 — 번역·검색·다국어 변환·요약을 한 클릭으로"
  - `script.desc`: "EXECUTE_SCRIPT/REGISTER_SCRIPT + 세션 추적", `script.example`: "다크 모드·플로팅 버튼 추가"
  - `select.desc`: "우클릭 + Floating Helper 양방향 진입"

**Scenarios (s1~s4 → s1~s6 전면 재작성)**
- `scenarios.items.s1` (커뮤니티 글쓰기)
  - step: "Scenario 1" (또는 단순 번호) / title: "긴 글·댓글 분위기 흡수 → 자연스러운 댓글 자동 작성" / desc: 본문 8000자 자동 요약 + 댓글 분위기 분석 + 입력칸 자동 채움
- `scenarios.items.s2` (영문 자료 분석): "FH 부분 번역·용어 검색·markdown 학습 노트"
- `scenarios.items.s3` (쇼핑 가격 비교 + ★ Work Memory): "다중 탭 종합 비교 표 + 다음 날 자동 복원"
- `scenarios.items.s4` (사이트 UI/UX 직접 커스터마이즈)
  - title: "사이트의 UI/UX를 내가 직접 만든다"
  - desc: 자연어 한 줄로 사이트 모양·동작·기능을 사용자가 직접 추가·변경. 코드 0줄.
  - 신규 필드: `examples` (3개 칩) — "🎨 테마 수정", "🚫 광고 차단", "📧 본문 번역 메일 발송 플로팅 버튼"
  - 신규 필드: `prompt` (verbatim 박스 내용) — 사용자가 제공한 메일 발송 플로팅 버튼 prompt 그대로
- `scenarios.items.s5` (AI 글쓰기 동반자)
- `scenarios.items.s6` (리서치 워크플로우 + ★ Work Memory)
- 공통: `scenarios.targetLabel` 신규 — "주요 대상 사이트:"
- 각 시나리오에 `targetSites` 필드 (콤마 구분 또는 배열) — Reddit · arxiv 등

**Differentiation (3 → 5)**
- `d4` 신규: before "단일 페이지 분석" / after "다중 탭 종합" / desc "4-5개 탭을 한 번에 read하고 markdown 비교 표로 정리"
- `d5` 신규: before "매번 처음부터" / after "사이트별 Work Memory" / desc "사이트별 작업 메모리가 다음 방문에 자동 복원"

**Safety (4 → 5)**
- `loop` 신규: title "에이전틱 무한 루프 자동 차단" / desc "동일 도구 반복 호출을 hard-stop으로 차단(sameToolGate). 다중 탭 read는 args-aware로 정상 허용."

**Roadmap (items 키 재명명)**
- `floating` → `floatingExpansion`: "Floating Helper 컨텍스트 확장" / "현재 텍스트 선택 중심 → 이미지·링크·표·코드 블록 등 다양한 selection 타입으로 확장"
- `continuity` → `scriptPromotion`: "세션 스크립트 → 영구 자산 승격" / "세션 EXECUTE_SCRIPT 이력을 한 번에 조회·되돌리기·REGISTER_SCRIPT로 승격"
- `studio` 유지: 설명만 다듬기

→ 검증: 모든 i18n 키 ko / en 동기화. 누락 시 i18next missing key warning.

### A2. HeroSection — 코드 변경 없음
- 카피는 ko.json 만 변경하면 자동 반영
- HeroSection.test.tsx 는 새 키워드 ("기억", "다음 방문") 검증 1~2개 추가

### A3. SolutionSection — 3축 → 4축
- `SOLUTION_AXES` 배열에 `{ key: 'memory', icon: <Database size={28} /> }` 추가
- lucide-react import에 `Database` 추가
- 그리드: `md:grid-cols-3` → `md:grid-cols-2 lg:grid-cols-4`
- test 업데이트: 4개 카드 검증, "memory" 키 텍스트 존재 확인

### A4. FeaturesSection — 카테고리 그루핑 도입 (9 → 13)

신규 데이터 구조:
```ts
const CATEGORIES = [
  {
    key: 'absorb',
    items: [
      { key: 'chat', status: 'done', icon: ... },
      { key: 'helper', status: 'done', icon: ... },
      { key: 'multiTab', status: 'done', icon: ... },
      { key: 'webSearch', status: 'done', icon: ... },
      { key: 'image', status: 'done', icon: ... },
    ],
  },
  {
    key: 'write',
    items: [
      { key: 'autofill', status: 'done', icon: ... },
      { key: 'tone', status: 'done', icon: ... },
      { key: 'improve', status: 'done', icon: ... },
      { key: 'select', status: 'done', icon: ... },
    ],
  },
  {
    key: 'automate',
    items: [
      { key: 'doCommand', status: 'done', icon: ... },
      { key: 'script', status: 'done', icon: ... },
      { key: 'scriptCRUD', status: 'done', icon: ... },
      { key: 'tabGroup', status: 'done', icon: ... },
    ],
  },
  {
    key: 'memory',
    items: [
      { key: 'workMemory', status: 'done', icon: ... },
    ],
  },
  {
    key: 'interface',
    items: [
      { key: 'floating', status: 'done', icon: ... },
    ],
  },
];
```

→ 총 5개 카테고리 × 카드 수 = 5+4+4+1+1 = **15개**. 제안서의 13~14개 범위 내.
→ 카테고리 헤더는 `<h3>` (Section h2 다음 단계). 각 카테고리 아래 grid.
→ aria-labelledby 패턴으로 카테고리별 sub-heading id 부여.
→ test: 카테고리 헤더 5개 검증, 카드 총 15개 검증, 각 신규 카드 (workMemory 등) 존재 검증.

신규 lucide 아이콘 import:
- `workMemory`: `Database` 또는 `Save`
- `doCommand`: `Bot` 또는 `Cog`
- `multiTab`: `Columns` 또는 `LayoutGrid`
- `tone`: `Languages` (이미 사용중) 또는 `Voicemail`/`SlidersHorizontal`
- `webSearch`: `Search`
- `tabGroup`: `FolderTree` 또는 `Group`
- `scriptCRUD`: `ListTodo` 또는 `Library`

### A5. ScenariosSection — 4 → 6 + s4 prompt 박스

신규 데이터 구조:
```ts
const SCENARIO_ITEMS = [
  { key: 's1', icon: <MessagesSquare size={24} />, videoId: 'E4r5CSlAjQA' },     // 커뮤니티 (기존 s1 영상 재활용)
  { key: 's2', icon: <Languages size={24} />, videoId: 'ZQkDGoBaCbo' },           // 영문 분석 (기존 s2 영상)
  { key: 's3', icon: <ShoppingCart size={24} /> },                                // 쇼핑 ★
  { key: 's4', icon: <Wand2 size={24} />, isCustom: true },                       // UI 커스텀 ★ (prompt 박스)
  { key: 's5', icon: <PenLine size={24} /> },                                     // 글쓰기 동반자
  { key: 's6', icon: <BookMarked size={24} /> },                                  // 리서치 ★
];
```

s4 카드 특수 렌더링:
- examples 칩 3개 (🎨 / 🚫 / 📧)
- prompt 박스 (`<pre><code>` 스타일, monospace, accent border, 메일발송 prompt verbatim)
- 영상 placeholder는 유지하되 prompt 박스가 우선 시각 비중

다른 카드:
- targetSites 배지 (목록을 칩으로 노출)
- 핵심 기능 칩 2~3개

그리드: `md:grid-cols-2` 유지 (6개 = 3 row × 2 col)
test:
- 6개 카드 검증
- s4: prompt 박스 존재 + verbatim 텍스트 ("cookyman@gmail.com" 포함) 검증
- s4: 예시 칩 3개 검증
- s3, s6: ★ Work Memory 표시 (옵션)

---

## Phase B (P1) — Differentiation

### B1. DifferentiationSection 3 → 5
- `DIFF_ITEMS` 배열: `['d1','d2','d3','d4','d5']`
- 그리드: `md:grid-cols-3` → `md:grid-cols-2 lg:grid-cols-3` (5개 = 3+2 또는 2+2+1)
  - 권장: `md:grid-cols-2 lg:grid-cols-3` (3+2 split)
- test 업데이트: 5개 카드, d4/d5 텍스트 검증

---

## Phase C (P2) — Safety + Roadmap

### C1. SafetySection 4 → 5
- `SAFETY_ITEMS` 에 `{ key: 'loop', icon: <Repeat size={28} /> }` 추가
- lucide import: `Repeat` 추가
- 그리드: `md:grid-cols-2` 유지 (5개 = 2+2+1)
- test: 5개 카드 검증

### C2. RoadmapSection 재정의
- `ROADMAP_ITEMS` 키 재명명:
  - `{ key: 'floatingExpansion', status: 'planned' }`
  - `{ key: 'scriptPromotion', status: 'wip' }`
  - `{ key: 'studio', status: 'planned' }`
- ko.json / en.json `roadmap.items` 키 동시 변경
- test: 새 키들의 텍스트 존재 검증

---

## Phase D — 검증 게이트

순서:
1. `npm run lint`
2. `npm run typecheck`
3. `npm test` — 전 테스트 통과
4. `npm run build` — 프로덕션 번들
5. `node working_plan/scripts/verify_phase1.mjs` — 18-check 회귀 가드

→ 통과 후 commit. 분리 commit 권장:
- commit 1 (Phase A): `content(v2): hero/solution/features/scenarios refresh`
- commit 2 (Phase B): `content(v2): expand differentiation to 5 axes`
- commit 3 (Phase C): `content(v2): safety + roadmap restructure`

---

## Risk & 주의사항

1. **i18n 키 재명명** (roadmap.items.floating → floatingExpansion 등) → 누락된 키 참조 시 vitest 에러. 일괄 grep 으로 사용처 확인 필요.
2. **카테고리 헤더 도입** → FeaturesSection 의 기존 `<h3>` 단일 레벨 가정에 의존하던 test 가 있다면 깨질 수 있음. test 우선 파악.
3. **s4 prompt 박스** → 코드 블록 안의 메일 주소 (`cookyman@gmail.com`) 가 raw text 로 노출. SEO 크롤러가 이를 contact email 로 오인할 가능성 → mailto 링크 X, 단순 텍스트로만.
4. **Scenarios s3 → 신규 s3** 는 의미가 완전히 다름 (그룹웨어 → 쇼핑). 기존 영상 video id 는 매칭이 끊기므로 s1/s2 만 영상 유지, s3~s6 는 placeholder.
5. **non-goals 준수**: ja/zh 번역 채우지 않음. 새 키는 ja/zh 빈 객체 그대로 (i18next fallback → en).
