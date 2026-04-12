# Phase 6: Scenarios + Differentiation 섹션

> **목표**: 4개 사용 시나리오(ScenariosSection)와 3개 차별화 비교 카드(DifferentiationSection)를 구현한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일
> **E2E 확인 단위**: 시나리오 4개와 비교 카드 3개가 시각적으로 노출되며 한/영 토글이 정상 동작한다. Header 네비 "시나리오"/"차별점" 클릭 → 해당 섹션으로 스크롤.

---

## 6.1 사전 작업

- [ ] **[REVIEW]** Phase 5 결과서 검토
  - 파일: [`Phase5_SolutionFeatures_20260412.md`](./working_history/v1.0/Phase5_SolutionFeatures_20260412.md) (§9 사후 리뷰 반영 포함)
  - 확인: 9개 카드 + 상태 배지 정상, "예:" 접두사 i18n 전환 완료, demo 섹션 i18n 전환 완료
  - Phase 5 인계 사항 §8 확인:
    - §8.1 데모 섹션 교체 대상 — scenarios/differentiation 이 **이번 Phase 의 핵심 전환**
    - §8.2 App.test.tsx 전환 패턴 (data-testid + scope 검증 + 렌더 순서 가드 확장)
    - §8.3 sections barrel 확장

- [ ] **[REGRESSION-BASELINE]** Phase 6 진입 전 기준선 확보
  ```bash
  cd extapp_landing
  npm test
  # 기대: Test Files 15 passed (15) · Tests 241 passed | 5 skipped (246)
  npm run build
  # 기대: JS 266.79 KB (gzip 85.00 KB) · CSS 10.62 KB (gzip 2.93 KB)
  ```

- [ ] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 §5.5 (ScenariosSection), §5.6 (DifferentiationSection)
  - extension_intro.md 9장(대표 사용 예시), 6장(차별화 포인트)
  - 시나리오 4개:
    | # | 시나리오 | i18n key |
    |---|---------|----------|
    | 1 | 기사 문장 선택 → 번역·질문 | `s1` |
    | 2 | 그룹웨어 문서 작성 보조 | `s2` |
    | 3 | 탭 정리·페이지 탐색 자동화 | `s3` |
    | 4 | 사이트 다크모드·광고 숨김 | `s4` |
  - 차별화 비교 3쌍:
    | # | before | after | i18n key |
    |---|--------|-------|----------|
    | 1 | 답변형 AI | 행동형 AI | `d1` |
    | 2 | 단발성 자동화 | 재사용 가능한 자산 | `d2` |
    | 3 | 텍스트 중심 AI | 페이지·필드·스크립트까지 | `d3` |

- [ ] **[CONTEXT]** Phase 6 가 수정하는 파일과 Phase 1~5 가드의 상호작용
  | 수정 대상 | 영향 받는 가드 | 주의 |
  |----------|---------------|------|
  | `src/App.tsx` (Scenarios/Diff 삽입 + 데모 scenarios/differentiation 제거) | App.test.tsx 의 `Button primary/secondary` · `Button anchor/external` · `Design System Demo h2` · `roadmap Badge` | **핵심 전환**: 데모 scenarios 제거로 "Design System Demo" h2 테스트 무효, 데모 differentiation 제거로 Button 데모 5종 테스트 무효. roadmap 데모만 잔존 |
  | `src/App.test.tsx` (Phase 6 구조 가드 + 데모 테스트 삭제/이관) | P1.16 | Button primary/secondary · anchor/external 테스트 삭제. Design System Demo h2 테스트 삭제. Scenarios/Diff data-testid 가드 신규. 렌더 순서 가드 확장 |
  | `src/components/sections/` (신규 2파일 + barrel 확장) | P1.18 | ScenariosSection.tsx + DifferentiationSection.tsx + 각 테스트 |
  | `src/i18n/locales/{ko,en}.json` | i18n.test.ts parity | `scenarios.*` + `differentiation.*` 키를 ko/en 양쪽에 동시 추가 |

### 6.1.1 Phase 5→6 전환 시 App.test.tsx 갱신 계획

Phase 6 GREEN 에서 데모 scenarios + differentiation 제거 시 **영향받는 App.test.tsx 가드 6건**:

| # | 가드 | 영향 | 갱신 방법 |
|---|------|------|-----------|
| 1 | "Button primary / secondary" (L118) | 데모 differentiation 섹션에 Button 데모가 있음 → 삭제됨 | **삭제** — Button 컴포넌트 자체의 테스트는 `Button.test.tsx` 에서 별도 검증 중. App 레벨 Button 데모 검증은 Phase 2 전용이었으므로 실제 섹션 교체 시 소멸이 자연스러움 |
| 2 | "Button anchor / external" (L110-133) | 동일 — 데모 differentiation 내부의 Button 5종 테스트 | **삭제** — 동일 사유 |
| 3 | "Section id=features Anchor Link" (L59) | `<Button href="#features">Anchor Link</Button>` 이 differentiation 데모에 있었음 → 삭제됨 | **삭제** — id="features" 자체는 FeaturesSection 이 이미 보유. Hero Secondary CTA 의 `#features` 앵커 동작은 Hero 테스트에서 별도 검증 |
| 4 | "Design System Demo h2" (L242) | 데모 scenarios 제거로 해당 텍스트 소멸 | **삭제** — Phase 4 h1→h2 다운그레이드 가드였으나, 이제 HeroSection 이 유일한 h1 이고 데모 자체가 소멸하므로 존재 의의 없음 |
| 5 | "렌더 순서 가드" (L324) | 현재: `[hero, problem, solution, features]`. Phase 6: scenarios + differentiation 추가 | **확장**: `[hero, problem, solution, features, scenarios, differentiation]` |
| 6 | "Badge 3종" (L136) | FeaturesSection 이 done/wip/planned 을 렌더하므로 영향 없음 | **유지** |

**결론**: 가드 #1~#4 (데모 전용) 를 Phase 6 GREEN 에서 삭제. 가드 #5 (렌더 순서) 확장. 가드 #6 유지.

**데모 roadmap 섹션 (1개) 잔존**: Phase 8 RoadmapSection 이 교체할 때까지 유지. 이 섹션의 `roadmap standalone Badge 3개` 가드도 유지.

- [ ] **[CONTEXT]** Phase 5 환경 가정 인계
  - `data-testid` 패턴: hero/problem/solution/features → Phase 6: `scenarios-section` / `differentiation-section`
  - `aria-labelledby` 패턴: Problem/Solution/Features 모두 적용됨 → Scenarios/Differentiation 도 동일
  - sections barrel: 4개 export → TASK 에서 2줄 추가
  - `common.examplePrefix` i18n 키: ScenariosSection 에서도 사용 가능
  - lucide-react named import 패턴 유지

---

## 6.2 RED Phase: 검증 체크리스트 + 실패 테스트

### 검증 체크리스트

```
TEST-P6.1:  ScenariosSection이 4개 article 렌더 (시나리오 카드)
TEST-P6.2:  ScenariosSection 각 카드에 step 라벨 + h3 + 설명 존재
TEST-P6.3:  ScenariosSection의 id="scenarios" (NAV_ANCHORS 앵커)
TEST-P6.4:  DifferentiationSection이 3개 article 렌더 (비교 카드)
TEST-P6.5:  각 비교 카드에 "before"와 "after" 두 영역이 모두 존재
TEST-P6.6:  DifferentiationSection의 id="differentiation" (NAV_ANCHORS 앵커)
TEST-P6.7:  ko/en locale에 scenarios.*, differentiation.* 키 동기화
TEST-P6.8:  언어 전환 시 Scenarios/Differentiation 텍스트 변경
TEST-P6.9:  data-testid="scenarios-section" / "differentiation-section" 공개 계약
TEST-P6.10: App.tsx에 Scenarios + Differentiation 이 Features 뒤에 렌더
TEST-P6.11: 4개 시나리오 카드의 정체성이 i18n 키 매핑과 일치 (s1/s2/s3/s4)
TEST-P6.12: 3개 비교 카드의 정체성이 i18n 키 매핑과 일치 (d1/d2/d3)
```

- [ ] **[RED]** ScenariosSection 테스트
  - 파일: `src/components/sections/ScenariosSection.test.tsx`
  - Phase 4/5 패턴 계승: article 카운트 + 카드 정체성 + 내부 구조 + data-testid + aria-labelledby + id + h2 + h1 부재 + 언어 전환

- [ ] **[RED]** DifferentiationSection 테스트
  - 파일: `src/components/sections/DifferentiationSection.test.tsx`
  - 추가 검증: 각 비교 카드에 before/after 두 영역 + 시각 대비 (서로 다른 텍스트)

- [ ] **[RED]** i18n.test.ts 보강
  - `scenarios.*` 필수 키 9개 (title + 4×(title+desc+step))
  - `differentiation.*` 필수 키 10개 (title + 3×(before+after+desc))

- [ ] **[RED]** App.test.tsx Phase 6 구조 가드
  - data-testid="scenarios-section" / "differentiation-section" 직접 조회
  - 렌더 순서 확장: `[hero, problem, solution, features, scenarios, differentiation]`
  - Scenarios scope article === 4, Differentiation scope article === 3

- [ ] **[RED-VERIFY]** 테스트 FAIL 확인

---

## 6.3 GREEN Phase: 최소 코드 구현

- [ ] **[TASK-001]** locale 키 추가
  - ko.json: `scenarios.*` 9키 + `differentiation.*` 10키 = 19키
  - en.json: 동일 19키 영문

- [ ] **[TASK-002]** ScenariosSection 컴포넌트
  - `<Section id="scenarios" background="canvas" aria-labelledby="scenarios-heading" data-testid="scenarios-section">`
  - H2 + 4개 `<article>` 카드 (step 라벨 + h3 + 설명 + placeholder 이미지 영역)
  - `SCENARIO_ITEMS = ['s1','s2','s3','s4'].map()` 데이터화
  - lucide-react 아이콘: `Languages`, `FileEdit`, `LayoutGrid`, `Moon`
  - 반응형: `grid gap-8 md:grid-cols-2` (모바일 1col → 태블릿+ 2×2)

- [ ] **[TASK-003]** DifferentiationSection 컴포넌트
  - `<Section id="differentiation" background="surface-alt" aria-labelledby="diff-heading" data-testid="differentiation-section">`
  - H2 + 3개 `<article>` 비교 카드
  - 각 카드 내부: before(회색) → `ArrowRight` 아이콘 → after(액센트) + 설명
  - `DIFF_ITEMS = ['d1','d2','d3'].map()` 데이터화
  - 반응형: `grid gap-8 md:grid-cols-3` (모바일 1col → 데스크톱 3col)

- [ ] **[TASK-004]** App.tsx 갱신 — Scenarios/Diff 삽입 + 데모 2개 제거
  - `<ScenariosSection />` + `<DifferentiationSection />` 을 FeaturesSection 바로 뒤에 삽입
  - 데모 `<Section id="scenarios">` (Design System Demo) 삭제
  - 데모 `<Section id="differentiation">` (Buttons) 삭제
  - 데모 `<Section id="roadmap">` (Status Badges) 만 잔존
  - `Section`, `Button` import 유지 (roadmap 데모에서 아직 사용? — Badge 만 사용. Button import 불필요 시 제거)

- [ ] **[TASK-005]** App.test.tsx 갱신
  - Button primary/secondary/anchor/external 4건 삭제
  - "Section id=features Anchor Link" 테스트 삭제
  - "Design System Demo h2" 테스트 삭제
  - 렌더 순서 가드 확장: `[hero, problem, solution, features, scenarios, differentiation]`

- [ ] **[TASK-006]** sections barrel 확장
- [ ] **[TASK-007]** Prettier 포맷

- [ ] **[GREEN-VERIFY]** 검증
  ```bash
  npm run lint && npm run typecheck && npm run format:check && npm test && npm run build
  ```

---

## 6.4 REFACTOR Phase: 코드 개선

- [ ] **[REFACTOR-STRUCTURE]** 시나리오/비교 카드 데이터화 확인
- [ ] **[REFACTOR-STRUCTURE]** 화살표 아이콘 일관성 (lucide `ArrowRight`)
- [ ] **[REFACTOR-STRUCTURE]** App.tsx 에서 Button import 제거 가능 여부 확인
- [ ] **[REFACTOR-VERIFY]** 테스트 재확인
- [ ] **[REFACTOR-PERF-MEASURE]** 번들 크기 변화

---

## 6.5 사후 작업

- [ ] **[VERIFY]** 전체 검증 (5종 게이트)
- [ ] **[VERIFY]** 기능/시각 회귀 확인
- [ ] **[DOC]** 작업 결과서 작성 — `working_history/v1.0/Phase6_ScenariosDiff_2026MMDD.md`
- [ ] **[COMMIT]** 커밋

---

## Phase 6 완료 조건 (Definition of Done)

- [ ] ScenariosSection 4개 카드 + id="scenarios" (TEST-P6.1/P6.3)
- [ ] 각 시나리오 카드에 step + h3 + 설명 (TEST-P6.2)
- [ ] DifferentiationSection 3개 비교 카드 + id="differentiation" (TEST-P6.4/P6.6)
- [ ] 각 비교 카드에 before/after 두 영역 (TEST-P6.5)
- [ ] scenarios.*, differentiation.* 키 ko/en 동기화 (TEST-P6.7)
- [ ] 언어 전환 정상 (TEST-P6.8)
- [ ] data-testid="scenarios-section" / "differentiation-section" 공개 계약 (TEST-P6.9)
- [ ] 섹션 렌더 순서 정확 (TEST-P6.10)
- [ ] 4개 시나리오 + 3개 비교 카드 정체성 i18n 고정 (TEST-P6.11/P6.12)
- [ ] `npm run lint` / `typecheck` / `format:check` / `test` / `build` 전부 통과
- [ ] Phase 1~5 회귀 가드 유지 (NAV_ANCHORS, h1 유일성, data-testid 4종, FeaturesSection badge)
- [ ] 데모 scenarios/differentiation 삭제 + roadmap 1개 잔존
- [ ] App.test.tsx 데모 전용 테스트 6건 삭제 (Button 4건 + Anchor Link + Design System Demo h2)
- [ ] 작업 결과서 작성 및 커밋 완료
