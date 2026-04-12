# Phase 8: Roadmap + Business + Final CTA 섹션

> **목표**: 확장 방향 3개(RoadmapSection), **B2B 대상 BusinessSection** *(v2 신규)*, 최종 CTA(FinalCTASection)를 구현하여 랜딩 페이지 본문을 완성한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1~1.5일
> **E2E 확인 단위**: **11개 섹션**이 모두 순서대로 렌더되며, 최종 CTA 클릭이 Chrome Web Store로 이동하고, Business CTA가 `mailto:` 로 열린다.

---

## 8.1 사전 작업

- [x] **[REVIEW]** Phase 7 결과서 검토
  - 파일: [`Phase7_AIModesSafety_20260412.md`](./working_history/v1.0/Phase7_AIModesSafety_20260412.md) (§7 사후 수정 + 리뷰 반영 포함)
  - 확인: AI 모드 6종(클라우드 3 + 로컬 3) + 안전 원칙 4종 정상, Hero trust "Claude" 교체 완료, 과장 금지 가드 동작

- [x] **[REGRESSION-BASELINE]** Phase 8 진입 전 기준선 확보
  ```bash
  cd extapp_landing
  npm test
  # 기대: Test Files 20 passed (20) · Tests 326 passed | 5 skipped (331)
  npm run build
  # 기대: JS 279.86 KB (gzip 88.71 KB) · CSS 11.90 KB (gzip 3.22 KB)
  ```

- [x] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 §5.9 (RoadmapSection), §5.10 (BusinessSection), §5.11 (FinalCTASection)
  - 기획서 `01_landing_page_plan.md` §5.10 (B2B 메시지 방향)
  - extension_intro.md 8장(확장 방향)
  - **핵심 제약**:
    - 로드맵 카드는 절대 `done` 금지 — `wip` 또는 `planned` 만
    - BusinessSection 카드에 Badge **사용 금지** — 기술 재사용 제안이므로
    - FinalCTA는 일반 사용자 설치 유도 전용 — mailto/파트너십 문구 금지
    - Header 네비에 `#business` 추가 금지

- [x] **[CONTEXT]** Phase 8 핵심 전환
  | 수정 대상 | 영향 | 주의 |
  |----------|------|------|
  | App.tsx (Roadmap/Business/FinalCTA 삽입 + 데모 roadmap 제거) | 마지막 데모 섹션 소멸 → `Section`/`Badge`/`demo.*` import 제거 가능 | `accent-soft` 배경 FinalCTA 로 복구 → 배경 가드 3종→4종 |
  | App.test.tsx | 렌더 순서 11섹션 확장 + roadmap Badge 데모 테스트 삭제 + accent-soft 가드 복구 + data-testid 3건 추가 | 배경 4종 가드 주석 해제 |
  | constants.ts | `PARTNERSHIP_CONTACT` 추가 | 이메일 형식 테스트로 검증 |
  | i18n locales | `roadmap.*` + `business.*` + `finalCta.*` + `demo.*` 삭제 | parity 가드가 자동 검증 |

- [x] **[CONTEXT]** Roadmap 항목 매핑 (Floating Helper 는 FeaturesSection 에서 done 이지만 Roadmap 에서는 UX 준비 방향이므로 별도 `planned`)
  | # | 항목 | 상태 | i18n key |
  |---|------|------|----------|
  | 1 | Floating Helper | planned | `floating` |
  | 2 | Session Script Continuity | wip | `continuity` |
  | 3 | Extension App Studio | planned | `studio` |

- [x] **[CONTEXT]** BusinessSection 가치 카드 3개
  | # | 제목 | i18n key |
  |---|------|----------|
  | 1 | 페이지 문맥 기반 AI | `context` |
  | 2 | Action Tools 에이전트 | `actionTools` |
  | 3 | 스크립트 실행/등록 인프라 | `scripts` |

- [x] **[ANALYSIS]** `PARTNERSHIP_CONTACT` 값 결정
  - 1차: `partnership@example.com` (FIXME 주석)
  - `src/lib/constants.ts` 에 단일 출처

---

## 8.2 RED Phase: 검증 체크리스트 + 실패 테스트

### 검증 체크리스트

```
TEST-P8.1:  RoadmapSection이 3개 article 렌더
TEST-P8.2:  RoadmapSection의 id="roadmap" (NAV_ANCHORS 앵커)
TEST-P8.3:  3개 로드맵 카드 모두 status가 'wip' 또는 'planned' (done 금지)
TEST-P8.4:  FinalCTASection이 H2 + Primary CTA + Secondary CTA 렌더
TEST-P8.5:  FinalCTASection의 Primary CTA href = CHROME_WEB_STORE_URL
TEST-P8.6:  ko/en locale에 roadmap.*, business.*, finalCta.* 키 동기화
TEST-P8.7:  BusinessSection이 3개 가치 카드(article) 렌더
TEST-P8.8:  BusinessSection의 id="business"
TEST-P8.9:  BusinessSection 내부에 Badge 단 하나도 렌더 안 됨
TEST-P8.10: BusinessSection Primary CTA href가 mailto:${PARTNERSHIP_CONTACT}
TEST-P8.11: PARTNERSHIP_CONTACT 값이 유효한 이메일 형식
TEST-P8.12: BusinessSection에 "구현됨"/"보강 중"/"계획" 텍스트 부재
TEST-P8.13: FinalCTASection에 mailto/파트너십 문구 부재
TEST-P8.14: data-testid 3종 (roadmap-section / business-section / finalcta-section)
TEST-P8.15: 11개 섹션 렌더 순서 완전 고정
TEST-P8.16: accent-soft 배경 복구 (FinalCTA) → 배경 가드 4종 복구
```

- [x] **[RED]** RoadmapSection 테스트
- [x] **[RED]** BusinessSection 테스트
- [x] **[RED]** FinalCTASection 테스트
- [x] **[RED]** constants.test.ts PARTNERSHIP_CONTACT 가드
- [x] **[RED]** i18n.test.ts required-key 보강 (roadmap + business + finalCta)
- [x] **[RED]** App.test.tsx Phase 8 구조 가드 (data-testid + 11섹션 렌더 순서 + 배경 4종)
- [x] **[RED-VERIFY]** 테스트 FAIL 확인

---

## 8.3 GREEN Phase: 최소 코드 구현

- [x] **[TASK-001]** locale 키 추가 (roadmap + business + finalCta)
- [x] **[TASK-002]** `PARTNERSHIP_CONTACT` 상수 추가 (`constants.ts`)
- [x] **[TASK-003]** RoadmapSection 컴포넌트
  - `Section id="roadmap" background="canvas" aria-labelledby data-testid="roadmap-section"`
  - 3개 FeatureCard (status=wip/planned + statusLabel i18n)
- [x] **[TASK-004]** BusinessSection 컴포넌트
  - `Section id="business" background="surface-alt" data-testid="business-section"`
  - Eyebrow + H2 + subtitle + 3개 FeatureCard (**Badge 없이**) + B2B CTA
- [x] **[TASK-005]** FinalCTASection 컴포넌트
  - `Section background="accent-soft" data-testid="finalcta-section"`
  - H2 + subtitle + Primary Button(CHROME_WEB_STORE_URL) + Secondary Button
- [x] **[TASK-006]** App.tsx 최종 조립 (11개 섹션 + 데모 roadmap 삭제 + demo.* import 제거)
- [x] **[TASK-007]** App.test.tsx 갱신 (배경 4종 복구 + roadmap Badge 테스트 삭제 + 렌더 순서 11개)
- [x] **[TASK-008]** sections barrel 확장 (8→11개 export)
- [x] **[TASK-009]** demo.* i18n 키 삭제 (orphan cleanup)
- [x] **[TASK-010]** Prettier 포맷
- [x] **[GREEN-VERIFY]** 5종 게이트

---

## 8.4 REFACTOR Phase

- [x] **[REFACTOR-STRUCTURE]** App.tsx Section/Badge import 제거 확인 (데모 소멸)
- [x] **[REFACTOR-STRUCTURE]** Header 네비에 #business 미포함 검증
- [x] **[REFACTOR-VERIFY]** 테스트 재확인
- [x] **[REFACTOR-PERF-MEASURE]** 본문 완성 시점 번들 크기

---

## 8.5 사후 작업

- [x] **[VERIFY]** 전체 검증 (5종 게이트)
- [x] **[VERIFY]** E2E 시각/기능 회귀 확인 (11개 섹션 전체)
- [x] **[DOC]** 작업 결과서 — `working_history/v1.0/Phase8_RoadmapBusinessFinalCta_2026MMDD.md`
- [ ] **[COMMIT]** 커밋

---

## Phase 8 완료 조건 (Definition of Done)

- [x] RoadmapSection 3개 카드 + id="roadmap" + done 배지 금지 (TEST-P8.1~P8.3)
- [x] BusinessSection 3개 카드 + id="business" + Badge 부재 + mailto CTA (TEST-P8.7~P8.12)
- [x] FinalCTASection + Chrome Web Store CTA + mailto 문구 부재 (TEST-P8.4/P8.5/P8.13)
- [x] PARTNERSHIP_CONTACT 이메일 형식 (TEST-P8.11)
- [x] roadmap.*, business.*, finalCta.* 키 ko/en 동기화 (TEST-P8.6)
- [x] data-testid 3종 공개 계약 (TEST-P8.14)
- [x] 11개 섹션 렌더 순서 완전 고정 (TEST-P8.15)
- [x] accent-soft 배경 복구 → 4종 가드 (TEST-P8.16)
- [x] `npm run lint` / `typecheck` / `format:check` / `test` / `build` 전부 통과
- [x] Phase 1~7 회귀 가드 유지
- [x] 데모 섹션 전부 소멸 + demo.* i18n 키 삭제
- [x] **마일스톤: 11개 섹션 본문 완성**
- [ ] 작업 결과서 작성 및 커밋 완료
