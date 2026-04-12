# Phase 7: AI Modes + Safety 섹션

> **목표**: 지원 AI 모드 4종 + 검토 중 1종(AIModesSection)과 4개 안전·운영 원칙(SafetySection)을 구현한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일
> **E2E 확인 단위**: AI 모드 배지가 지원/검토 중으로 명확히 구분되고, 안전 원칙 4개가 신뢰감 있는 톤으로 노출된다. 한↔영 전환 정상.

---

## 7.1 사전 작업

- [x] **[REVIEW]** Phase 6 결과서 검토
  - 파일: [`Phase6_ScenariosDiff_20260412.md`](./working_history/v1.0/Phase6_ScenariosDiff_20260412.md) (§7 사후 콘텐츠 수정 + §8 리뷰 반영 포함)
  - 확인: Scenarios 4카드 + Differentiation 3카드 정상, VideoModal 동작, 시나리오 순서 재배치, 데모 roadmap 1개만 잔존

- [x] **[REGRESSION-BASELINE]** Phase 7 진입 전 기준선 확보
  ```bash
  cd extapp_landing
  npm test
  # 기대: Test Files 18 passed (18) · Tests 287 passed | 5 skipped (292)
  npm run build
  # 기대: JS 274.08 KB (gzip 87.23 KB) · CSS 11.72 KB (gzip 3.18 KB)
  ```

- [x] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 §5.7 (AIModesSection), §5.8 (SafetySection)
  - extension_intro.md 4장(지원 AI 제공 방식), 7장(안전 및 운영 원칙)
  - **주의**: 안전 섹션 톤은 과장 금지 — "보수적으로 처리" / "사용자 확인 중심"
  - AI 모드 6종 *(사후 수정: Didim 제거, Claude · GpuStack 추가)*:
    | # | 모드 | 카테고리 | 상태 | i18n key |
    |---|------|----------|------|----------|
    | 1 | OpenAI | 클라우드 | done | `openai` |
    | 2 | Gemini | 클라우드 | done | `gemini` |
    | 3 | Claude | 클라우드 | done | `claude` |
    | 4 | LM Studio | 로컬 SLM | done | `lmstudio` |
    | 5 | Ollama | 로컬 SLM | planned | `ollama` |
    | 6 | GpuStack | 로컬 SLM | planned | `gpustack` |
  - 안전 원칙 4개:
    | # | 원칙 | i18n key |
    |---|------|----------|
    | 1 | 승인 기반 위험 작업 제어 | `approval` |
    | 2 | 명시적 영구 스크립트 등록 | `register` |
    | 3 | 추적 가능한 세션 스크립트 | `session` |
    | 4 | 민감 사이트 보수적 처리 | `sensitive` |

- [x] **[CONTEXT]** Phase 7 가 수정하는 파일과 기존 가드의 상호작용
  | 수정 대상 | 영향 받는 가드 | 주의 |
  |----------|---------------|------|
  | `src/App.tsx` (AIModes/Safety 삽입) | 렌더 순서 가드 확장 필요 | AIModes/Safety 는 NAV_ANCHORS 에 **없음** — 데모 교체 이슈 없음 |
  | `src/App.test.tsx` | 렌더 순서 가드 확장 + data-testid 가드 신규 | 데모 roadmap 은 유지 (Phase 8 교체) |
  | `src/i18n/locales/{ko,en}.json` | i18n.test.ts parity | `aiModes.*` + `safety.*` 키 |
  | `src/components/sections/` | P1.18 | 신규 2파일 + barrel 확장 |

  **핵심 포인트**: Phase 7 은 NAV_ANCHORS 앵커 대상이 아닌 두 섹션을 추가하므로, 데모 섹션 교체/삭제가 발생하지 않는다. Phase 4~6 대비 전환 리스크가 낮다. 단, 렌더 순서 가드와 data-testid 가드는 확장 필요.

- [x] **[CONTEXT]** Phase 6 환경 가정 인계
  - `data-testid` 패턴: hero/problem/solution/features/scenarios/differentiation → Phase 7: `aimodes-section` / `safety-section`
  - `aria-labelledby` 패턴: 전 섹션 적용 → AIModes/Safety 도 동일
  - sections barrel: 6개 export → +2줄
  - lucide-react named import: Phase 7 에서 `ShieldCheck`, `FileCheck2`, `History`, `Lock` + AI 모드 아이콘 추가
  - Badge 컴포넌트: AIModesSection 에서 "지원됨"/"검토 중" 표시에 기존 Badge(done/planned) 재사용. `aiModes.status.supported`/`aiModes.status.reviewing` i18n 키로 라벨 분리

---

## 7.2 RED Phase: 검증 체크리스트 + 실패 테스트

### 검증 체크리스트

```
TEST-P7.1:  AIModesSection이 5개 모드 항목 렌더
TEST-P7.2:  AIModesSection 각 항목에 모드명 + type 라벨 + 상태 배지 존재
TEST-P7.3:  Ollama 항목이 구체적으로 planned(검토 중) 배지를 가짐
TEST-P7.4:  나머지 4개 항목이 모두 done(지원됨) 배지를 가짐
TEST-P7.5:  SafetySection이 4개 원칙 카드(article) 렌더
TEST-P7.6:  SafetySection 각 카드에 아이콘 + h3 + 설명 존재
TEST-P7.7:  SafetySection 문구에 과장 표현 미포함 ("100%", "완전 자동", "absolute", "never fails")
TEST-P7.8:  ko/en locale에 aiModes.*, safety.* 키 동기화
TEST-P7.9:  언어 전환 시 AIModes/Safety 텍스트 변경
TEST-P7.10: data-testid="aimodes-section" / "safety-section" 공개 계약
TEST-P7.11: App.tsx에 AIModes + Safety 가 Differentiation 뒤에 렌더
TEST-P7.12: 5개 AI 모드 정체성 i18n 키 매핑 일치 (openai/gemini/lmstudio/didim/ollama)
TEST-P7.13: 4개 안전 원칙 정체성 i18n 키 매핑 일치 (approval/register/session/sensitive)
```

- [x] **[RED]** AIModesSection 테스트
  - 파일: `src/components/sections/AIModesSection.test.tsx`
  - 5개 모드 항목 + 카드별 status 매핑 (done×4 + planned×1) + 정체성 고정
  - data-testid + aria-labelledby + h2 + h1 부재 + 언어 전환

- [x] **[RED]** SafetySection 테스트
  - 파일: `src/components/sections/SafetySection.test.tsx`
  - 4개 article + 내부 구조 (아이콘 + h3 + desc) + 정체성 고정
  - 과장 표현 금지 가드 (ko + en 양쪽)
  - data-testid + aria-labelledby + h2 + h1 부재 + 언어 전환

- [x] **[RED]** i18n.test.ts 보강
  - `aiModes.*` 필수 키: title + subtitle + status.supported + status.reviewing + 5×(name+type) = 14키
  - `safety.*` 필수 키: title + subtitle + 4×(title+desc) = 10키

- [x] **[RED]** App.test.tsx Phase 7 구조 가드
  - data-testid 직접 조회 (aimodes-section + safety-section)
  - 렌더 순서 확장: `[hero, problem, solution, features, scenarios, differentiation, aimodes, safety]`

- [x] **[RED-VERIFY]** 테스트 FAIL 확인

---

## 7.3 GREEN Phase: 최소 코드 구현

- [x] **[TASK-001]** locale 키 추가
  - ko.json: `aiModes.*` 14키 + `safety.*` 10키 = 24키
  - en.json: 동일 24키 영문

- [x] **[TASK-002]** AIModesSection 컴포넌트
  - `<Section background="canvas" aria-labelledby="aimodes-heading" data-testid="aimodes-section">`
  - H2 + subtitle + 5개 모드 항목 그리드
  - 각 항목: 모드명 + type 라벨 + Badge(done→"지원됨" / planned→"검토 중")
  - `AI_MODES` 상수 배열 `.map()` 데이터화
  - id 부여 없음 (NAV_ANCHORS 대상 아님)
  - 반응형: `grid gap-4 md:grid-cols-5` 또는 `flex flex-wrap` (5개 항목 가로 배치)

- [x] **[TASK-003]** SafetySection 컴포넌트
  - `<Section background="surface" aria-labelledby="safety-heading" data-testid="safety-section">`
  - H2 + subtitle + 4개 `<article>` 카드 (2×2 grid)
  - lucide 아이콘: `ShieldCheck`, `FileCheck2`, `History`, `Lock`
  - `SAFETY_ITEMS` 상수 배열 `.map()` 데이터화
  - id 부여 없음 (NAV_ANCHORS 대상 아님)
  - 반응형: `grid gap-8 md:grid-cols-2`

- [x] **[TASK-004]** App.tsx 갱신
  - `<AIModesSection />` + `<SafetySection />` 을 DifferentiationSection 뒤에 삽입
  - 데모 roadmap 은 유지 (Phase 8 교체)

- [x] **[TASK-005]** sections barrel 확장
- [x] **[TASK-006]** App.test.tsx 갱신 (렌더 순서 + data-testid 가드)
- [x] **[TASK-007]** Prettier 포맷

- [x] **[GREEN-VERIFY]** 검증
  ```bash
  npm run lint && npm run typecheck && npm run format:check && npm test && npm run build
  ```

---

## 7.4 REFACTOR Phase: 코드 개선

- [x] **[REFACTOR-STRUCTURE]** Badge 라벨 일관성 확인
  - AIModesSection: `aiModes.status.supported` / `aiModes.status.reviewing`
  - FeaturesSection: `features.status.done` / `features.status.wip` / `features.status.planned`
  - 두 네임스페이스의 Badge 라벨이 의미 충돌 없이 공존하는지 확인
- [x] **[REFACTOR-VERIFY]** 테스트 재확인
- [x] **[REFACTOR-PERF-MEASURE]** 번들 크기 변화

---

## 7.5 사후 작업

- [x] **[VERIFY]** 전체 검증 (5종 게이트)
- [x] **[VERIFY]** 기능/시각/문구 회귀 확인
- [x] **[DOC]** 작업 결과서 — `working_history/v1.0/Phase7_AIModesSafety_2026MMDD.md`
- [ ] **[COMMIT]** 커밋

---

## Phase 7 완료 조건 (Definition of Done)

- [x] AIModesSection 5개 항목 (done×4 + planned×1) (TEST-P7.1~P7.4)
- [x] SafetySection 4개 원칙 카드 + 아이콘 + h3 + 설명 (TEST-P7.5/P7.6)
- [x] 과장 표현 미포함 (TEST-P7.7)
- [x] aiModes.*, safety.* 키 ko/en 동기화 (TEST-P7.8)
- [x] 언어 전환 정상 (TEST-P7.9)
- [x] data-testid="aimodes-section" / "safety-section" 공개 계약 (TEST-P7.10)
- [x] 섹션 렌더 순서 정확 — Differentiation 뒤 (TEST-P7.11)
- [x] 5개 AI 모드 + 4개 안전 원칙 정체성 i18n 고정 (TEST-P7.12/P7.13)
- [x] `npm run lint` / `typecheck` / `format:check` / `test` / `build` 전부 통과
- [x] Phase 1~6 회귀 가드 유지 (NAV_ANCHORS 4개 ID, h1 유일성, data-testid 6종)
- [x] 데모 roadmap 1개 유지 (Phase 8 교체)
- [ ] 작업 결과서 작성 및 커밋 완료
