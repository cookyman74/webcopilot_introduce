# Phase 5: Solution + Features 섹션

> **목표**: 해결 방식 3축(SolutionSection)과 9개 기능 카드(FeaturesSection, 상태 배지 포함)를 구현한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일
> **E2E 확인 단위**: 3축 카드 + 9개 기능 카드가 시각적으로 노출되며, 각 카드의 상태 배지(`구현됨`/`보강 중`/`계획·검토 중`)가 정확히 표시된다. Hero Secondary CTA 가 실제 `FeaturesSection` 으로 스크롤된다.

---

## 5.1 사전 작업

- [x] **[REVIEW]** Phase 4 결과서 검토
  - 파일: [`Phase4_HeroProblem_20260412.md`](./working_history/v1.0/Phase4_HeroProblem_20260412.md) (§12 사후 리뷰 반영 포함)
  - 확인: Hero/Problem 정상, locale 키 동기화 깨짐 없음, `<html lang>` hotfix 반영 완료
  - Phase 4 인계 사항 §9 확인:
    - §9.1 `#features` 앵커 인수인계 — **이번 Phase 의 핵심 전환**
    - §9.2 Badge 카운트 가드 — scope 격리 완료, features scope 1줄만 갱신 필요
    - §9.3 `data-testid` 표준 확산 — Solution/Features 에도 적용
    - §9.5 sections barrel 확장

- [x] **[REGRESSION-BASELINE]** Phase 5 진입 전 기준선 확보
  ```bash
  cd extapp_landing
  npm test
  # 기대: Test Files 13 passed (13) · Tests 198 passed | 5 skipped (203)
  npm run build
  # 기대: JS 256.99 KB (gzip 81.36 KB) · CSS 10.46 KB (gzip 2.91 KB)
  ```

- [x] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 §5.3 (SolutionSection), §5.4 (FeaturesSection) 스펙
  - extension_intro.md 2장(핵심 가치), 3장(주요 기능) 표현 참조
  - 9개 기능 카드의 상태 매핑 확정:
    | # | 기능 | i18n key | 상태 |
    |---|------|----------|------|
    | 1 | AI 채팅 | `chat` | done |
    | 2 | 페이지 도우미 | `helper` | done |
    | 3 | 텍스트 선택 기반 | `select` | done |
    | 4 | 문서/폼 자동입력 | `autofill` | done |
    | 5 | Action Tools 에이전트 | `action` | done |
    | 6 | 이미지/스크린샷 | `image` | done |
    | 7 | 텍스트 개선 | `improve` | done |
    | 8 | 스크립트 실행/등록 | `script` | wip |
    | 9 | Floating Helper | `floating` | planned |

- [x] **[CONTEXT]** Phase 5 가 수정하는 파일과 Phase 1~4 가드의 상호작용
  | 수정 대상 | 영향 받는 가드 | 주의 |
  |----------|---------------|------|
  | `src/App.tsx` (Solution/Features 삽입 + 데모 `#features` 제거) | App.test.tsx 의 `Section id="features"` · `FeatureCard 2 케이스` · `featureSectionBadges === 1` · `4종 배경` · `accent-soft` | **핵심 전환**: 데모 `<Section id="features" background="accent-soft">` 를 삭제하고 `<FeaturesSection />` (id="features", background="surface") 로 대체. `accent-soft` 배경이 데모에서 사라지므로 4종 배경 가드에 영향 |
  | `src/App.test.tsx` (Phase 5 구조 가드 갱신) | P1.16 (test pass) | `FeatureCard 2 케이스` 테스트 삭제 → `FeaturesSection 9 카드` 테스트로 대체. `featuresSectionBadges === 1` → `=== 9`. `accent-soft` 배경 소멸 → 4종 배경 가드 조정 필요 |
  | `src/components/sections/` (신규 2파일 + barrel 확장) | P1.18 (src 전체 스캔) | SolutionSection.tsx / FeaturesSection.tsx + 각 테스트 진입 |
  | `src/i18n/locales/{ko,en}.json` | i18n.test.ts parity | `solution.*` + `features.*` 키를 ko/en 양쪽에 동시 추가 |

- [x] **[CONTEXT]** Phase 4 환경 가정 인계 *(Phase4_HeroProblem_20260412.md §7~9 기반)*
  - **`data-testid` 공개 계약**: hero-section / problem-section 패턴 → Phase 5: `solution-section` / `features-section` 으로 확장
  - **Section 공통 컴포넌트**: Phase 4 에서 `aria-labelledby` / `aria-label` / `data-testid` props 패스스루 추가 완료 — 그대로 활용
  - **FeatureCard 컴포넌트**: discriminated union (WithStatus | WithoutStatus), `icon?: ReactNode` prop 이미 존재 → lucide-react 아이콘을 icon prop 으로 전달 가능
  - **sections barrel**: `src/components/sections/index.ts` 에 HeroSection, ProblemSection 이미 export — TASK-006 에서 2줄 추가
  - **NAV_ANCHORS 순서**: `features → scenarios → differentiation → roadmap` — features 가 데모 세 번째에서 **첫 번째로 승격** 됨 (Phase 4 Fix #3). FeaturesSection 이 이 위치를 실제 컴포넌트로 대체
  - **`<html lang>` sync**: Phase 3 hotfix 완료 — Phase 5 에서 별도 처리 불필요

- [x] **[ANALYSIS]** lucide-react 아이콘 패키지
  - 현재 미설치 — `npm install lucide-react` 필요
  - tree-shaking: `import { MessageSquare } from 'lucide-react'` named import 방식으로 사용 → 사용한 아이콘만 번들에 포함
  - **금지**: `import * as Icons from 'lucide-react'` — 전체 아이콘 번들 포함으로 +500 KB 이상 증가
  - Phase 5 사용 아이콘 (12개):
    - SolutionSection: `BookOpen`, `MousePointerClick`, `Code2`
    - FeaturesSection: `MessageSquare`, `FileText`, `TextCursor`, `Edit3`, `Zap`, `Image`, `Wand2`, `Terminal`, `Sparkles`

### 5.1.1 Phase 4→5 전환 시 App.test.tsx 갱신 계획

Phase 5 GREEN 에서 데모 `#features` 제거 + 실제 `FeaturesSection` 삽입 시 **영향받는 App.test.tsx 가드 5건**:

| # | 가드 (line) | 영향 | 갱신 방법 |
|---|------------|------|-----------|
| 1 | "Section 4종 배경" (L21) — `accent-soft` 매칭 | 데모 features 삭제로 `accent-soft` 소멸. FeaturesSection 은 `bg-surface` 사용 | **`accent-soft` 부분 제거** 하거나, 남은 데모 섹션에서 유지 확인. 데모 scenarios(canvas)/differentiation(surface)/roadmap(surface-alt) 만 남으므로 **3종**으로 축소 — 또는 FeaturesSection 또는 SolutionSection 배경에 accent-soft 사용. 구현 계획서 §5.3 은 canvas, §5.4 는 surface → accent-soft 소멸. **가드 축소 필요** |
| 2 | "FeatureCard 2 케이스" (L143) — `articles.length === 2` + `featuresSectionBadges === 1` | 데모 FeatureCard 2개 삭제 → 실제 9 카드로 대체 | **삭제 후 FeaturesSection 전용 가드로 대체**: `articles === 9`, `badges(done) >= 7`, `badges(wip) >= 1`, `badges(planned) >= 1` |
| 3 | "BusinessSection 프리뷰" (L174) — `section#features` 내부에서 "페이지 문맥 기반 AI" 텍스트 검색 | 데모 FeatureCard("페이지 문맥 기반 AI") 삭제 | **삭제** — BusinessSection 프리뷰는 Phase 8 에서 실제 구현. 또는 FeaturesSection 에 동일 텍스트가 있으면 자연 통과 (features.items.helper.desc = "현재 페이지 요약, 입력 필드 분석") |
| 4 | "Button anchor Anchor Link" (L112) — `href="#features"` | 데모 Button `<Button href="#features">Anchor Link</Button>` 이 `section#differentiation` 내에 남아있으므로 영향 없음 | **유지** |
| 5 | "Badge 3종" (L131) — `getByText('보강 중')` + `getByText('계획·검토 중')` | FeaturesSection 이 `보강 중`(script) 과 `계획·검토 중`(floating) 카드를 포함하므로 자연 통과 | **유지** — 추가 수정 불필요 |

**결론**: 가드 #1 (배경 4종), #2 (FeatureCard 데모), #3 (BusinessSection 프리뷰) 총 3건을 Phase 5 GREEN 의 App.tsx 갱신 시점에 함께 수정.

**`accent-soft` 배경 소멸 문제 해결 방안**: Phase 5 에서 FeaturesSection 을 `bg-surface` 로 사용하면 `accent-soft` 가 어떤 섹션에도 없게 된다. 선택지:
- (a) FeaturesSection 의 배경을 `accent-soft` 로 변경 (구현 계획서 §5.4 는 `bg-surface` 지정이므로 계획서 위반)
- (b) 배경 4종 가드를 현 실정에 맞게 조정 — Phase 5 시점에 실제 존재하는 배경만 검증. `accent-soft` 는 Phase 8 FinalCTA(§5.11) 에서 다시 등장하므로 그 시점에 4종 복구
- **(b) 채택**: 계획서를 따르면서 가드만 현실에 맞춤. 테스트가 "있어야 하는 것" 만 검증하도록.

---

## 5.2 RED Phase: 검증 체크리스트 + 실패 테스트

### 검증 체크리스트

```
TEST-P5.1: SolutionSection이 3개 article 렌더 (3축 카드)
TEST-P5.2: SolutionSection 각 카드에 아이콘 + h3 + 설명 + 예시 존재
TEST-P5.3: FeaturesSection이 9개 FeatureCard(article) 렌더
TEST-P5.4: FeaturesSection 카드 #8(스크립트)가 status="wip" 배지
TEST-P5.5: FeaturesSection 카드 #9(Floating Helper)가 status="planned" 배지
TEST-P5.6: FeaturesSection 카드 #1~#7이 모두 status="done" 배지
TEST-P5.7: FeaturesSection의 id="features" (Hero secondary CTA 앵커 대상 + NAV_ANCHORS 첫 번째)
TEST-P5.8: ko/en locale에 solution.*, features.* 키 동기화 (i18n.test.ts required 가드)
TEST-P5.9: 언어 전환 시 Solution/Features 텍스트 변경
TEST-P5.10: SolutionSection에 data-testid="solution-section" 공개 계약
TEST-P5.11: FeaturesSection에 data-testid="features-section" 공개 계약
TEST-P5.12: App.tsx에 Solution + Features 가 Hero/Problem 뒤에 렌더
TEST-P5.13: FeaturesSection 반응형 3×3 grid (md:grid-cols-2 lg:grid-cols-3)
```

- [x] **[RED]** SolutionSection 테스트
  - 파일: `src/components/sections/SolutionSection.test.tsx`
  - 구조: Phase 4 HeroSection.test.tsx / ProblemSection.test.tsx 와 동일 패턴
  - 테스트:
    - TEST-P5.1: 3개 article 렌더
    - TEST-P5.2: 각 카드에 heading(h3) + 설명(p) + 예시(p) + 아이콘 placeholder
    - data-testid="solution-section" 공개 계약
    - h2 제목 존재 (비어있지 않음)
    - h1 부재 (HeroSection 전용)
    - id 미부여 (NAV_ANCHORS 대상 아님)
    - aria-labelledby 또는 aria-label 접근성
    - 언어 전환 시 h2 + 카드 제목 변경

- [x] **[RED]** FeaturesSection 테스트
  - 파일: `src/components/sections/FeaturesSection.test.tsx`
  - 테스트:
    - TEST-P5.3: 9개 article 렌더
    - TEST-P5.4/P5.5/P5.6: status badge 정확 매핑 (done×7 + wip×1 + planned×1)
    - TEST-P5.7: id="features" (Section prop 으로 전달)
    - data-testid="features-section" 공개 계약
    - h2 제목 존재
    - 반응형 grid (md:grid-cols-2 + lg:grid-cols-3)
    - 언어 전환 시 h2 + 카드 제목 변경
    - status badge 라벨이 i18n 적용 ("구현됨"/"보강 중"/"계획·검토 중" vs "Implemented"/"In Progress"/"Planned")

- [x] **[RED]** i18n.test.ts 보강
  - Phase 4 패턴 계승: `solution.*` / `features.*` 명시적 required 키 체크 2건 추가
  - solution: `solution.title` + 3×(`solution.axes.{context,action,script}.{title,desc,example}`) = 10키
  - features: `features.title` + `features.status.{done,wip,planned}` + 9×(`features.items.{key}.{title,desc,example}`) = 31키

- [x] **[RED]** App.test.tsx Phase 5 구조 가드
  - data-testid="solution-section" + "features-section" 직접 조회
  - FeaturesSection scope 내 article === 9 + badge === 9
  - 4종 배경 가드 → 현 실정 반영 (accent-soft 제거 시 3종으로 축소)

- [x] **[RED-VERIFY]** 테스트 FAIL 확인
  ```bash
  npm test
  # 기대:
  #   - SolutionSection.test.tsx → ./SolutionSection 미존재 FAIL
  #   - FeaturesSection.test.tsx → ./FeaturesSection 미존재 FAIL
  #   - App.test.tsx Phase 5 신규 가드 FAIL
  #   - i18n.test.ts Phase 5 required 키 FAIL
  ```

---

## 5.3 GREEN Phase: 최소 코드 구현

- [x] **[TASK-001]** lucide-react 설치
  ```bash
  npm install lucide-react
  ```
  - tree-shaking 확인: `import { MessageSquare } from 'lucide-react'` named import 만 사용
  - 번들 증가 예상: +15~30 KB (사용 아이콘 12개 × ~1~2 KB)

- [x] **[TASK-002]** locale 키 추가
  - 파일: `src/i18n/locales/ko.json`
    ```json
    "solution": {
      "title": "이렇게 해결합니다",
      "axes": {
        "context": {
          "title": "페이지 문맥 기반 AI",
          "desc": "현재 페이지, 선택 텍스트, 입력 필드, 스크린샷, 페이지 구조까지 함께 다룹니다.",
          "example": "기사 요약, 입력 필드 분석 후 자동입력"
        },
        "action": {
          "title": "브라우저 액션 자동화",
          "desc": "자연어 요청을 실제 브라우저 동작으로 옮깁니다.",
          "example": "탭 그룹 정리, 폼 입력, 댓글 추출"
        },
        "script": {
          "title": "스크립트 기반 확장성",
          "desc": "실행한 작업을 추적하고, 영구 스크립트로 발전시킵니다.",
          "example": "사이트 다크모드, 광고 영역 숨김"
        }
      }
    },
    "features": {
      "title": "주요 기능",
      "items": {
        "chat":     { "title": "AI 채팅",            "desc": "사이드 패널 기반 페이지 문맥 채팅", "example": "스트리밍 응답" },
        "helper":   { "title": "페이지 도우미",       "desc": "현재 페이지 요약, 입력 필드 분석",  "example": "보조 작성" },
        "select":   { "title": "텍스트 선택 기반",    "desc": "우클릭으로 선택 문장 처리",          "example": "번역, 설명, 가공" },
        "autofill": { "title": "문서·폼 자동입력",    "desc": "그룹웨어 문서/요청서 작성 보조",     "example": "Inwork 작성" },
        "action":   { "title": "Action Tools",        "desc": "GOTO·CLICK·FILL·EXTRACT 등",         "example": "탭 정리·기록 검색" },
        "image":    { "title": "이미지·스크린샷",     "desc": "드래그앤드롭 + 캡처 후 질문",        "example": "Vision 분석" },
        "improve":  { "title": "텍스트 개선",         "desc": "입력 필드에서 직접 다듬기",          "example": "초안 보정" },
        "script":   { "title": "스크립트 실행·등록",  "desc": "EXECUTE/REGISTER + 세션 추적",       "example": "다크모드 적용" },
        "floating": { "title": "Floating Helper",     "desc": "선택 직후 옆에 뜨는 빠른 진입",      "example": "번역·요약" }
      }
    }
    ```
  - 파일: `src/i18n/locales/en.json` — 동일 키 영문 번역

- [x] **[TASK-003]** SolutionSection 컴포넌트
  - 파일: `src/components/sections/SolutionSection.tsx`
  - **구조**: `<Section background="canvas" aria-labelledby="solution-heading" data-testid="solution-section">`
  - H2 `id="solution-heading"` + 3개 `<article>` 카드 (아이콘 + h3 + desc + example)
  - `SOLUTION_AXES = ['context', 'action', 'script'] as const` + `.map()` (Phase 4 ProblemSection 패턴)
  - lucide-react 아이콘: `BookOpen`, `MousePointerClick`, `Code2`
  - **id 부여 없음**: NAV_ANCHORS 앵커 대상 아님 (Solution 은 랜딩 흐름의 전환부)
  - 반응형: `grid gap-8 md:grid-cols-3` (모바일 1col → 태블릿+ 3col)

- [x] **[TASK-004]** FeaturesSection 컴포넌트
  - 파일: `src/components/sections/FeaturesSection.tsx`
  - **구조**: `<Section id="features" background="surface" data-testid="features-section">`
  - H2 + 9개 FeatureCard (3×3 grid: `grid gap-6 md:grid-cols-2 lg:grid-cols-3`)
  - 카드 데이터 배열 (Phase 4 ProblemSection `PROBLEM_ITEMS` 패턴 계승):
    ```ts
    const FEATURE_ITEMS = [
      { key: 'chat',     status: 'done' as const,    icon: <MessageSquare size={24} /> },
      { key: 'helper',   status: 'done' as const,    icon: <FileText size={24} /> },
      { key: 'select',   status: 'done' as const,    icon: <TextCursor size={24} /> },
      { key: 'autofill', status: 'done' as const,    icon: <Edit3 size={24} /> },
      { key: 'action',   status: 'done' as const,    icon: <Zap size={24} /> },
      { key: 'image',    status: 'done' as const,    icon: <Image size={24} /> },
      { key: 'improve',  status: 'done' as const,    icon: <Wand2 size={24} /> },
      { key: 'script',   status: 'wip' as const,     icon: <Terminal size={24} /> },
      { key: 'floating', status: 'planned' as const,  icon: <Sparkles size={24} /> },
    ];
    ```
  - FeatureCard props: `title={t(`features.items.${key}.title`)}` · `description={...desc}` · `example={...example}` · `status={item.status}` · `statusLabel={t(`features.status.${item.status}`)}` · `icon={item.icon}`
  - **id="features"**: Hero Secondary CTA `href="#features"` 앵커 대상 + NAV_ANCHORS 첫 번째 ID. 데모 `<Section id="features">` 를 완전 대체
  - **statusLabel i18n**: `features.status.done` / `features.status.wip` / `features.status.planned` 키를 t() 로 호출 → 언어 전환 시 배지 텍스트도 전환. 이전 데모에서는 하드코딩 "구현됨" 을 statusLabel 로 넘겼으나, Phase 5 부터는 i18n 기반으로 전환

- [x] **[TASK-005]** App.tsx 갱신 — **Solution/Features 삽입 + 데모 `#features` 제거**
  - **최종 구조**:
    ```tsx
    <Header />
    <main>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />    {/* 신규 Phase 5 */}
      <FeaturesSection />    {/* 신규 Phase 5 — id="features", 데모 대체 */}

      {/* Phase 2/3 데모 콘텐츠 (3개 — features 제거됨) */}
      <Section id="scenarios" background="canvas">...</Section>
      <Section id="differentiation" background="surface">...</Section>
      <Section id="roadmap" background="surface-alt">...</Section>
    </main>
    <Footer />
    ```
  - **핵심 변경점**:
    1. `<SolutionSection />` 과 `<FeaturesSection />` 을 ProblemSection 바로 뒤에 삽입
    2. 데모 `<Section id="features" background="accent-soft">` (Feature Cards 데모) **삭제** — FeaturesSection 이 `id="features"` 를 인수받음
    3. 나머지 데모 Section 3개 (scenarios/differentiation/roadmap) 는 수정 없음
  - **NAV_ANCHORS 가드 유지**: features ID 가 FeaturesSection 으로 이전되고, 나머지 3개 ID 는 데모 유지

- [x] **[TASK-006]** sections barrel 확장
  - 파일: `src/components/sections/index.ts`
  - 추가:
    ```ts
    export { SolutionSection } from './SolutionSection';
    export { FeaturesSection } from './FeaturesSection';
    ```

- [x] **[TASK-007]** App.test.tsx 갱신 — Phase 5 구조 가드 적용
  - `FeatureCard 2 케이스` 테스트 삭제 → FeaturesSection 전용 가드로 대체
  - `BusinessSection 프리뷰` 테스트 삭제 (Phase 8 에서 재구현)
  - `featuresSectionBadges === 1` → FeaturesSection scope 내 badge === 9 로 변경
  - 4종 배경 가드 → 현 실정에 맞게 조정
  - Solution/Features data-testid 직접 조회 가드 추가

- [x] **[TASK-008]** Prettier 일괄 포맷 적용

- [x] **[GREEN-VERIFY]** 검증
  ```bash
  npm run lint && npm run typecheck && npm run format:check && npm test && npm run build
  ```

---

## 5.4 REFACTOR Phase: 코드 개선

### 5.4.1 구조 개선

- [x] **[REFACTOR-STRUCTURE]** statusLabel i18n 자동 매핑 헬퍼 검토
  - FeaturesSection 이 `t(`features.status.${item.status}`)` 로 statusLabel 을 생성하는 패턴은 Phase 6+ Roadmap 에서도 동일하게 사용될 예정
  - 헬퍼 함수 `getStatusLabel(t, status)` 분리 여부 결정
  - **결정 기준**: Phase 6 에서 실제 재사용이 발생하면 그 시점에 추출 (YAGNI)

- [x] **[REFACTOR-STRUCTURE]** 기능 카드 데이터 외부화 검토
  - `FEATURE_ITEMS` 배열을 `src/lib/featureCatalog.ts` 로 분리할지 결정
  - Phase 6 Roadmap 이 동일 카드 데이터를 참조하면 분리, 아니면 컴포넌트 내부 유지
  - **1차 결정**: 컴포넌트 내부 유지 (YAGNI). 결과서에 결정 근거 명시

- [x] **[REFACTOR-VERIFY]** 리팩터링 후 테스트 재확인
  ```bash
  npm run format && npm run lint && npm run typecheck && npm test && npm run build
  ```

### 5.4.2 빌드 품질 점검

- [x] **[REFACTOR-PERF-MEASURE]** 번들 크기 변화 — Phase 4 → Phase 5
  | 파일 | Phase 4 베이스라인 | Phase 5 | Δ |
  |------|-------------------|---------|---|
  | `dist/assets/index-*.js` | **256.99 KB** (gzip 81.36 KB) | [측정] | [Δ] |
  | `dist/assets/index-*.css` | **10.46 KB** (gzip 2.91 KB) | [측정] | [Δ] |
  - **예상**: JS +15~30 KB (lucide-react 아이콘 12개 + Solution/Features 컴포넌트). CSS +1~2 KB
  - Phase 9 목표 (gzip JS < 300 KB) 대비 현재 gzip ~81 KB → +10~15 KB 예상 = 여유 충분

- [x] **[REFACTOR-PERF-ANALYZE]** lucide-react tree-shaking 확인
  - `npm run build` 후 `dist/assets/index-*.js` 크기 확인
  - 만약 +100 KB 이상이면 import 패턴 재확인 (barrel import 금지 위반 확인)

---

## 5.5 사후 작업

- [x] **[VERIFY]** 전체 검증
  ```bash
  npm run lint && npm run typecheck && npm run format:check && npm test && npm run build
  ```

- [x] **[VERIFY]** 기능/시각 회귀 확인 (수동 또는 Playwright MCP)
  - SolutionSection 3개 카드 가독성 (데스크톱 3col, 모바일 1col)
  - FeaturesSection 9개 카드 그리드 (데스크톱 3×3, 태블릿 3×2+3, 모바일 1×9)
  - 8번 카드(스크립트) `보강 중` 노란색 배지
  - 9번 카드(Floating Helper) `계획·검토 중` 회색 배지
  - Hero Secondary CTA 클릭 → **실제 `FeaturesSection`** 위치로 스크롤 (데모 아님)
  - 한↔영 전환 시 모든 카드 텍스트 + **배지 텍스트** 변경 ("구현됨" ↔ "Implemented")
  - Header 네비 "기능" 클릭 → FeaturesSection 위치로 스크롤

- [x] **[DOC]** 작업 결과서 작성
  - 파일: `working_history/v1.0/Phase5_SolutionFeatures_2026MMDD.md`

- [ ] **[COMMIT]** 커밋

---

## Phase 5 완료 조건 (Definition of Done)

- [x] SolutionSection 3개 축 카드 렌더 (TEST-P5.1)
- [x] 각 Solution 카드에 아이콘 + h3 + 설명 + 예시 (TEST-P5.2)
- [x] FeaturesSection 9개 FeatureCard 렌더 (TEST-P5.3)
- [x] 9개 카드 상태 배지 정확 (done×7, wip×1, planned×1) (TEST-P5.4/P5.5/P5.6)
- [x] FeaturesSection 의 id="features" 앵커 동작 (TEST-P5.7)
- [x] solution.*, features.* 키 ko/en 동기화 (TEST-P5.8)
- [x] 언어 전환 시 Solution/Features 텍스트 + 배지 라벨 변경 (TEST-P5.9)
- [x] data-testid="solution-section" / "features-section" 공개 계약 (TEST-P5.10/P5.11)
- [x] App.tsx 에 Solution/Features 삽입 + 데모 #features 제거 (TEST-P5.12)
- [x] FeaturesSection 반응형 grid md:grid-cols-2 + lg:grid-cols-3 (TEST-P5.13)
- [x] `npm run lint` / `typecheck` / `format:check` / `test` / `build` 전부 통과
- [x] Phase 1~4 회귀 가드 유지 (NAV_ANCHORS 4개 ID, h1 유일성, Hero/Problem data-testid)
- [x] lucide-react tree-shaking 동작 (번들 폭발 없음, +30 KB 이하)
- [x] 데모 `#features` Section 삭제 + 나머지 데모 3개 유지
- [ ] 작업 결과서 작성 및 커밋 완료
