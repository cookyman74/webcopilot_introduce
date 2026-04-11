# Phase 8: Roadmap + Final CTA 섹션

> **목표**: 확장 방향 3개(RoadmapSection, 모두 wip 또는 planned)와 최종 CTA(FinalCTASection)를 구현하여 랜딩 페이지 본문을 완성한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일
> **E2E 확인 단위**: 10개 섹션이 모두 순서대로 렌더되며, 최종 CTA 클릭이 Chrome Web Store로 이동한다.

---

## 8.1 사전 작업

- [ ] **[REVIEW]** 이전 Phase 결과서 검토
  - 파일: `working_history/v1.0/Phase7_AIModesSafety_*.md`

- [ ] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 5.9, 5.10 (Roadmap / FinalCTA 스펙)
  - extension_intro.md 8장(현재 진행 중인 확장 방향)
  - **중요**: 로드맵 항목은 절대 `done`이 아닌 `wip` 또는 `planned`로만 표기

- [ ] **[ANALYSIS]** 로드맵 3개 매핑
  | # | 항목 | 상태 | 비고 |
  |---|------|------|------|
  | 1 | Floating Helper | planned | UX 준비 중 |
  | 2 | Session Script Continuity | wip | 보강 진행 |
  | 3 | Extension App Studio | planned | 장기 |

---

## 8.2 RED Phase: 검증 체크리스트 + 실패 테스트

- [ ] **[RED]** 검증 체크리스트
  ```
  TEST-P8.1: RoadmapSection이 3개 로드맵 카드 렌더
  TEST-P8.2: RoadmapSection의 id="roadmap"
  TEST-P8.3: 3개 로드맵 카드 모두 status가 'wip' 또는 'planned' (절대 'done' 금지)
  TEST-P8.4: FinalCTASection이 H2 + Primary CTA + Secondary CTA 렌더
  TEST-P8.5: FinalCTASection의 Primary CTA href = CHROME_WEB_STORE_URL
  TEST-P8.6: ko/en locale에 roadmap.*, finalCta.* 키 동기화
  ```

- [ ] **[RED]** RoadmapSection 테스트
  - 파일: `src/components/sections/RoadmapSection.test.tsx`
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { RoadmapSection } from './RoadmapSection';
  import '../../i18n';

  describe('RoadmapSection', () => {
    it('renders 3 roadmap cards', () => {
      render(<RoadmapSection />);
      expect(screen.getAllByRole('article').length).toBe(3);
    });
    it('has anchor id="roadmap"', () => {
      const { container } = render(<RoadmapSection />);
      expect(container.querySelector('#roadmap')).toBeInTheDocument();
    });
    it('does not show "구현됨" badge in roadmap', () => {
      render(<RoadmapSection />);
      const text = screen.getByRole('region').textContent ?? '';
      expect(text).not.toMatch(/구현됨/);
    });
  });
  ```

- [ ] **[RED]** FinalCTASection 테스트
  - 파일: `src/components/sections/FinalCTASection.test.tsx`
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { FinalCTASection } from './FinalCTASection';
  import '../../i18n';
  import { CHROME_WEB_STORE_URL } from '../../lib/constants';

  describe('FinalCTASection', () => {
    it('renders primary CTA pointing to web store', () => {
      render(<FinalCTASection />);
      const cta = screen.getAllByRole('link').find(a =>
        a.getAttribute('href') === CHROME_WEB_STORE_URL
      );
      expect(cta).toBeDefined();
    });
  });
  ```

- [ ] **[RED-VERIFY]** FAIL 확인
  ```bash
  npm run test
  ```

---

## 8.3 GREEN Phase: 최소 코드 구현

- [ ] **[TASK-001]** locale 키 추가
  - 파일: `src/i18n/locales/ko.json`
  ```json
  "roadmap": {
    "title": "앞으로의 방향",
    "subtitle": "현재 구현된 기능을 넘어서 준비 중인 방향들입니다.",
    "items": {
      "floating": {
        "title": "Floating Helper",
        "desc": "선택한 문장 옆에서 번역·질문·요약으로 즉시 이어지는 빠른 진입 UX",
        "status": "planned"
      },
      "continuity": {
        "title": "Session Script Continuity",
        "desc": "EXECUTE_SCRIPT 이력을 세션 단위로 조회·되돌리기·승격",
        "status": "wip"
      },
      "studio": {
        "title": "Extension App Studio",
        "desc": "사이트별 스크립트를 조회·편집·버전 관리하는 라이브러리 형태로 확장",
        "status": "planned"
      }
    }
  },
  "finalCta": {
    "title": "지금 Chrome에서 바로 시작하세요",
    "subtitle": "설치 후 바로 페이지 문맥 기반 AI를 사용할 수 있습니다.",
    "primary": "Chrome에 추가하기",
    "secondary": "문서 보기"
  }
  ```
  - 파일: `src/i18n/locales/en.json` — 동일 키 영문

- [ ] **[TASK-002]** RoadmapSection 컴포넌트
  - 파일: `src/components/sections/RoadmapSection.tsx`
  - `Section id="roadmap" background="canvas"`
  - `<section role="region">` 또는 wrapper에 role 부여 (테스트 호환)
  - H2 + subtitle + 3개 카드 (`<article>`)
  - 각 카드는 Badge로 wip/planned 표시
  - 카드 데이터: `roadmap.items.{floating,continuity,studio}` 매핑

- [ ] **[TASK-003]** FinalCTASection 컴포넌트
  - 파일: `src/components/sections/FinalCTASection.tsx`
  - `Section background="accent-soft"` (액센트 옅은 배경)
  - 중앙 정렬 H2 + subtitle
  - Primary `Button` (CHROME_WEB_STORE_URL, external)
  - Secondary `Button` (`href="#"`, 1차엔 placeholder)

- [ ] **[TASK-004]** App.tsx 최종 섹션 조립
  - 순서 (10개 모두):
    1. Header
    2. HeroSection
    3. ProblemSection
    4. SolutionSection
    5. FeaturesSection (`#features`)
    6. ScenariosSection (`#scenarios`)
    7. DifferentiationSection (`#differentiation`)
    8. AIModesSection
    9. SafetySection
    10. RoadmapSection (`#roadmap`)
    11. FinalCTASection
    12. Footer

- [ ] **[GREEN-VERIFY]** 검증
  ```bash
  npm run test && npm run typecheck && npm run build
  npm run dev   # 10개 섹션 전체 시각 확인
  ```

---

## 8.4 REFACTOR Phase: 코드 개선

### 8.4.1 구조 개선

- [ ] **[REFACTOR-STRUCTURE]** App.tsx 섹션 import 정리
  - `src/components/sections/index.ts` barrel export 추가
  - `App.tsx`는 단일 import 라인으로 정리

- [ ] **[REFACTOR-STRUCTURE]** 로드맵 카드 데이터화
- [ ] **[REFACTOR-STRUCTURE]** Header 네비 앵커와 섹션 id 일치 재검증
  - features / scenarios / differentiation / roadmap 4개 모두 매칭 확인

- [ ] **[REFACTOR-VERIFY]** 테스트 재확인
  ```bash
  npm run test && npm run typecheck
  ```

### 8.4.2 빌드 품질 점검

- [ ] **[REFACTOR-PERF-MEASURE]** 본문 완성 시점 번들 크기 측정
  | 파일 | P5 | P8 | 변화 |
  |------|----|----|------|
  | dist/assets/index-*.js | [P5 값] | [측정] | [Δ] |
  | dist/assets/index-*.css | [P5 값] | [측정] | [Δ] |
  - 본문 완성 후 첫 번들 크기 베이스라인 기록 → P9에서 최적화 비교 기준

---

## 8.5 사후 작업

- [ ] **[VERIFY]** 전체 검증
  ```bash
  npm run typecheck && npm run test && npm run build
  ```

- [ ] **[VERIFY]** E2E 시각 회귀 확인 (10개 섹션 전체)
  - 위에서 아래로 스크롤하며 섹션 순서, 배경 교차, 카드 일관성, 배지 정확성 확인
  - 한↔영 전환 시 모든 섹션 텍스트 변경
  - **CTA 4곳** 모두 Chrome Web Store로 이동 검증:
    1. Header CTA
    2. Hero Primary CTA
    3. (Hero Secondary CTA → `#features` 스크롤만)
    4. FinalCTA Primary CTA
  - Header 네비 4개 앵커 모두 정확한 섹션으로 스크롤

- [ ] **[DOC]** 작업 결과서 작성
  - 파일: `working_history/v1.0/Phase8_RoadmapFinalCta_2026MMDD.md`
  - **마일스톤**: 10개 섹션 본문 완성 — 다음 Phase는 품질/배포

- [ ] **[COMMIT]** 커밋
  ```bash
  git add extapp_landing/src
  git commit -m "[P8] RoadmapSection + FinalCTASection — 본문 10개 섹션 완성"
  ```

---

## Phase 8 완료 조건 (Definition of Done)

- [ ] RoadmapSection 3개 카드 + id="roadmap"
- [ ] 로드맵 카드에 "구현됨" 배지 미포함 (테스트로 강제)
- [ ] FinalCTASection Primary CTA = Chrome Web Store URL
- [ ] App.tsx에 10개 섹션이 기획서 순서대로 배치
- [ ] Header 네비 4개 앵커 모두 정확
- [ ] roadmap.*, finalCta.* 키 ko/en 동기화
- [ ] 단위 테스트 PASS
- [ ] `npm run build` 통과
- [ ] **E2E 마일스톤**: 10개 섹션 본문 완성
- [ ] 작업 결과서 작성 및 커밋 완료
