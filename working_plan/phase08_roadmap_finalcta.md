# Phase 8: Roadmap + Business + Final CTA 섹션

> **목표**: 확장 방향 3개(RoadmapSection), **B2B 대상 BusinessSection** *(v2 신규)*, 최종 CTA(FinalCTASection)를 구현하여 랜딩 페이지 본문을 완성한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1~1.5일 *(v2: BusinessSection 추가로 +0.5일)*
> **E2E 확인 단위**: **11개 섹션**이 모두 순서대로 렌더되며, 최종 CTA 클릭이 Chrome Web Store로 이동하고, Business CTA가 `mailto:` 로 열린다.
> **파일명 참고**: `phase08_roadmap_finalcta.md`는 v1 시점 파일명이며, v2 스코프에는 BusinessSection이 포함된다 (참조 안정성을 위해 파일명은 유지).

---

## 8.1 사전 작업

- [ ] **[REVIEW]** 이전 Phase 결과서 검토
  - 파일: `working_history/v1.0/Phase7_AIModesSafety_*.md`

- [ ] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 §5.9 Roadmap / §5.10 **Business** *(v2)* / §5.11 FinalCTA 스펙
  - 기획서 `01_landing_page_plan.md` §5.10 (B2B 섹션 메시지 방향)
  - extension_intro.md 8장(현재 진행 중인 확장 방향)
  - **중요**:
    - 로드맵 항목은 절대 `done`이 아닌 `wip` 또는 `planned`로만 표기
    - **BusinessSection 카드에는 상태 배지를 쓰지 않는다** (기술 재사용 **제안**이므로 구현 상태 주장과 섞이면 안 됨)
    - FinalCTA는 **일반 사용자 설치 유도**에만 집중 — B2B 파트너십 문의는 BusinessSection이 전담 (두 CTA가 섞이면 둘 다 약해짐)

- [ ] **[ANALYSIS]** 로드맵 3개 매핑
  | # | 항목 | 상태 | 비고 |
  |---|------|------|------|
  | 1 | Floating Helper | planned | UX 준비 중 |
  | 2 | Session Script Continuity | wip | 보강 진행 |
  | 3 | Extension App Studio | planned | 장기 |

- [ ] **[ANALYSIS]** BusinessSection 가치 카드 3개 매핑 *(v2 신규)*
  | # | 제목 | 핵심 메시지 | 기반 기술 |
  |---|------|-------------|----------|
  | 1 | 페이지 문맥 기반 AI | 사용자 컨텍스트를 잃지 않는 AI 파이프라인 | Page context API · selection/field capture |
  | 2 | Action Tools 에이전트 | 브라우저를 직접 조작하는 안전 경계 기반 자동화 | Action Tools · 승인 경계 |
  | 3 | 스크립트 실행/등록 인프라 | 사이트별 확장 자산을 안전하게 운영 | 영구 스크립트 · 세션 스크립트 |

- [ ] **[ANALYSIS]** `PARTNERSHIP_CONTACT` 값 결정
  - 1차: mailto 대상 이메일 주소 (예: `partnership@…`)
  - `src/lib/constants.ts`에 단일 출처로 관리 (Phase 2/3에서 생성된 파일에 추가)
  - 값이 확정되지 않았다면 placeholder 이메일로 두되 FIXME 주석 남김

---

## 8.2 RED Phase: 검증 체크리스트 + 실패 테스트

- [ ] **[RED]** 검증 체크리스트
  ```
  TEST-P8.1:  RoadmapSection이 3개 로드맵 카드 렌더
  TEST-P8.2:  RoadmapSection의 id="roadmap"
  TEST-P8.3:  3개 로드맵 카드 모두 status가 'wip' 또는 'planned' (절대 'done' 금지)
  TEST-P8.4:  FinalCTASection이 H2 + Primary CTA + Secondary CTA 렌더
  TEST-P8.5:  FinalCTASection의 Primary CTA href = CHROME_WEB_STORE_URL
  TEST-P8.6:  ko/en locale에 roadmap.*, business.*, finalCta.* 키 동기화 (v2: business 추가)

  -- v2 신규 (BusinessSection) --
  TEST-P8.7:  BusinessSection이 3개 가치 카드 렌더
  TEST-P8.8:  BusinessSection의 id="business"
  TEST-P8.9:  BusinessSection 내부에 Badge가 **단 하나도 렌더되지 않음** (상태 배지 금지)
  TEST-P8.10: BusinessSection의 Primary CTA href가 mailto:${PARTNERSHIP_CONTACT} 로 시작
  TEST-P8.11: constants.ts의 PARTNERSHIP_CONTACT 값이 유효한 이메일 형식
  TEST-P8.12: BusinessSection이 "구현됨" / "보강 중" / "계획" 텍스트를 렌더하지 않음 (일반 기능 카피와 혼동 방지)
  TEST-P8.13: FinalCTASection이 mailto: 또는 파트너십 문구를 포함하지 않음 (전환 메시지 중복 금지)
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

    // v2: 파트너십 메시지 분리 강제
    it('does not leak partnership/mailto messaging', () => {
      const { container } = render(<FinalCTASection />);
      const hasMailto = Array.from(container.querySelectorAll('a'))
        .some((a) => (a.getAttribute('href') ?? '').startsWith('mailto:'));
      expect(hasMailto).toBe(false);
    });
  });
  ```

- [ ] **[RED]** BusinessSection 테스트 *(v2 신규)*
  - 파일: `src/components/sections/BusinessSection.test.tsx`
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { BusinessSection } from './BusinessSection';
  import '../../i18n';
  import { PARTNERSHIP_CONTACT } from '../../lib/constants';

  describe('BusinessSection', () => {
    it('renders 3 value cards', () => {
      render(<BusinessSection />);
      expect(screen.getAllByRole('article').length).toBe(3);
    });

    it('has anchor id="business"', () => {
      const { container } = render(<BusinessSection />);
      expect(container.querySelector('#business')).toBeInTheDocument();
    });

    it('renders NO status badge (기술 재사용 제안이므로 구현 상태 표기 금지)', () => {
      const { container } = render(<BusinessSection />);
      // Badge 컴포넌트는 data-testid="status-badge" 규약 가정 (Phase 2에서 정의)
      expect(container.querySelectorAll('[data-testid="status-badge"]').length).toBe(0);
    });

    it('primary CTA opens mailto:PARTNERSHIP_CONTACT', () => {
      const { container } = render(<BusinessSection />);
      const mailto = Array.from(container.querySelectorAll('a'))
        .map((a) => a.getAttribute('href') ?? '')
        .find((href) => href.startsWith('mailto:'));
      expect(mailto).toBe(`mailto:${PARTNERSHIP_CONTACT}`);
    });

    it('does not leak product-feature status copy', () => {
      render(<BusinessSection />);
      const text = screen.getByRole('region').textContent ?? '';
      expect(text).not.toMatch(/구현됨|보강 중|계획|planned|wip/i);
    });
  });
  ```

- [ ] **[RED]** constants 확장 테스트 *(v2)*
  - 파일: `src/lib/constants.test.ts` 에 케이스 추가
  ```ts
  import { PARTNERSHIP_CONTACT } from './constants';

  describe('PARTNERSHIP_CONTACT', () => {
    it('is a valid email address', () => {
      expect(PARTNERSHIP_CONTACT).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });
  ```

- [ ] **[RED-VERIFY]** FAIL 확인
  ```bash
  npm run test
  ```

---

## 8.3 GREEN Phase: 최소 코드 구현

- [ ] **[TASK-001]** locale 키 추가 *(v2: business 네임스페이스 포함)*
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
  "business": {
    "eyebrow": "For Businesses",
    "title": "이 확장앱의 기술을 자사 서비스에 적용할 수 있습니다",
    "subtitle": "페이지 문맥 이해, Action Tools 에이전트, 스크립트 실행 인프라는 단일 제품에 묶여 있지 않습니다. 파트너십·기술 내재화·공동 개발 등 다양한 방식으로 논의가 가능합니다.",
    "cards": {
      "context": {
        "title": "페이지 문맥 기반 AI",
        "desc": "사용자 컨텍스트를 잃지 않는 AI 파이프라인"
      },
      "actionTools": {
        "title": "Action Tools 에이전트",
        "desc": "브라우저를 직접 조작하는 안전 경계 기반 자동화"
      },
      "scripts": {
        "title": "스크립트 실행/등록 인프라",
        "desc": "사이트별 확장 자산을 안전하게 운영"
      }
    },
    "cta_primary": "파트너십 문의",
    "cta_secondary": "기술 문서 보기"
  },
  "finalCta": {
    "title": "지금 Chrome에서 바로 시작하세요",
    "subtitle": "설치 후 바로 페이지 문맥 기반 AI를 사용할 수 있습니다.",
    "primary": "Chrome에 추가하기",
    "secondary": "문서 보기"
  }
  ```
  - 파일: `src/i18n/locales/en.json` — 동일 키 구조, 영문 값 (business 포함)
  - **검증**: Phase 3의 i18n 키 동기화 테스트가 business.* 까지 포함해 자동 검증하므로 ko/en 중 하나라도 누락 시 즉시 FAIL

- [ ] **[TASK-002]** RoadmapSection 컴포넌트
  - 파일: `src/components/sections/RoadmapSection.tsx`
  - `Section id="roadmap" background="canvas"`
  - `<section role="region">` 또는 wrapper에 role 부여 (테스트 호환)
  - H2 + subtitle + 3개 카드 (`<article>`)
  - 각 카드는 Badge로 wip/planned 표시
  - 카드 데이터: `roadmap.items.{floating,continuity,studio}` 매핑

- [ ] **[TASK-003]** `constants.ts`에 `PARTNERSHIP_CONTACT` 추가 *(v2)*
  - 파일: `src/lib/constants.ts`
  ```ts
  // 1차: 단일 파트너십 문의 이메일.
  // 실제 도메인 확정 시 교체. 테스트는 이메일 형식만 강제 (PHASE8 TEST-P8.11).
  export const PARTNERSHIP_CONTACT = 'partnership@example.com'; // FIXME: 실제 주소 확정 시 교체
  ```

- [ ] **[TASK-004]** BusinessSection 컴포넌트 *(v2 신규)*
  - 파일: `src/components/sections/BusinessSection.tsx`
  - `Section id="business" background="surface-alt"` *(FinalCTA의 `accent-soft`와 충돌 금지)*
  - `<section role="region">` wrapper
  - Eyebrow 라벨 + H2 + subtitle
  - 3개 `<article>` 가치 카드 — `FeatureCard` 재사용 가능하나 **Badge prop은 절대 전달하지 않음**
  - CTA 2개:
    - Primary: `<a href={\`mailto:${PARTNERSHIP_CONTACT}\`}>` — `target="_blank"` 안 함 (mailto는 탭 이동 불필요)
    - Secondary: `<a href="#">` — 기술 문서 링크 (1차 placeholder)
  - **구현 주의**: "구현됨"/"보강 중"/"planned" 같은 문자열을 이 컴포넌트의 JSX에 포함하지 않는다 (TEST-P8.12로 강제).

- [ ] **[TASK-005]** FinalCTASection 컴포넌트 *(구 TASK-003)*
  - 파일: `src/components/sections/FinalCTASection.tsx`
  - `Section background="accent-soft"` (액센트 옅은 배경)
  - 중앙 정렬 H2 + subtitle
  - Primary `Button` (CHROME_WEB_STORE_URL, external)
  - Secondary `Button` (`href="#"`, 1차엔 placeholder)
  - **주의**: 이 컴포넌트에는 `mailto:`, "파트너십", "문의" 같은 문자열을 쓰지 않는다 (TEST-P8.13으로 강제).

- [ ] **[TASK-006]** App.tsx 최종 섹션 조립 *(v2: 11개 섹션)*
  - 순서 (11개 모두):
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
    11. **BusinessSection (`#business`)** *(v2 신규)*
    12. FinalCTASection
    13. Footer
  - **Header 네비 앵커에는 `#business`를 추가하지 않는다** — B2B 전환 메시지가 일반 네비에 섞이면 묻힌다. 페이지 하단 스크롤 도달로만 노출.

- [ ] **[GREEN-VERIFY]** 검증
  ```bash
  npm run test && npm run typecheck && npm run build
  npm run dev   # 11개 섹션 전체 시각 확인 (v2)
  ```
  - BusinessSection 시각 점검: Roadmap/FinalCTA와 배경이 구분되고, 카드에 배지가 **보이지 않으며**, Primary CTA 클릭 시 메일 클라이언트가 열림
  - FinalCTA 시각 점검: 파트너십 문구 없음, Primary만 Chrome Web Store로 이동

---

## 8.4 REFACTOR Phase: 코드 개선

### 8.4.1 구조 개선

- [ ] **[REFACTOR-STRUCTURE]** App.tsx 섹션 import 정리
  - `src/components/sections/index.ts` barrel export 추가
  - `App.tsx`는 단일 import 라인으로 정리

- [ ] **[REFACTOR-STRUCTURE]** 로드맵 카드 데이터화
- [ ] **[REFACTOR-STRUCTURE]** 비즈니스 가치 카드 데이터화 *(v2)*
  - 3개 카드 데이터를 `business.cards.*` 로부터 배열로 매핑
- [ ] **[REFACTOR-STRUCTURE]** Header 네비 앵커와 섹션 id 일치 재검증
  - features / scenarios / differentiation / roadmap 4개 모두 매칭 확인
  - `#business`는 네비에 **없어야** 함 (의도 검증)

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

- [ ] **[VERIFY]** E2E 시각 회귀 확인 (**11개 섹션 전체**, v2)
  - 위에서 아래로 스크롤하며 섹션 순서, 배경 교차, 카드 일관성, 배지 정확성 확인
  - 한↔영 전환 시 모든 섹션 텍스트 변경 (business.* 포함)
  - **CTA 경로 검증**:
    | # | 위치 | 동작 | 대상 |
    |---|------|------|------|
    | 1 | Header CTA | 새 탭 | CHROME_WEB_STORE_URL |
    | 2 | Hero Primary CTA | 새 탭 | CHROME_WEB_STORE_URL |
    | 3 | Hero Secondary CTA | 앵커 | `#features` |
    | 4 | **Business Primary CTA** *(v2)* | mailto | `PARTNERSHIP_CONTACT` |
    | 5 | Business Secondary CTA *(v2)* | — | `#` placeholder |
    | 6 | FinalCTA Primary CTA | 새 탭 | CHROME_WEB_STORE_URL |
  - Header 네비 4개 앵커 (features/scenarios/differentiation/roadmap) 모두 정확한 섹션으로 스크롤 — **`#business`는 네비에 없음을 재확인**
  - BusinessSection의 카드·본문에 "구현됨/보강 중/계획" 문구가 **전혀** 안 보임
  - FinalCTA에 "파트너십/문의/mailto" 문구가 **전혀** 안 보임

- [ ] **[DOC]** 작업 결과서 작성
  - 파일: `working_history/v1.0/Phase8_RoadmapBusinessFinalCta_2026MMDD.md`
  - **마일스톤**: **11개 섹션 본문 완성** — 다음 Phase는 품질/배포

- [ ] **[COMMIT]** 커밋
  ```bash
  git add extapp_landing/src
  git commit -m "[P8] RoadmapSection + BusinessSection + FinalCTASection — 본문 11개 섹션 완성"
  ```

---

## Phase 8 완료 조건 (Definition of Done)

- [ ] RoadmapSection 3개 카드 + id="roadmap"
- [ ] 로드맵 카드에 "구현됨" 배지 미포함 (테스트로 강제)
- [ ] **BusinessSection 3개 가치 카드 + id="business"** *(v2)*
- [ ] **BusinessSection에 Badge가 단 하나도 렌더되지 않음** (TEST-P8.9로 강제)
- [ ] **BusinessSection Primary CTA = `mailto:${PARTNERSHIP_CONTACT}`**
- [ ] **`PARTNERSHIP_CONTACT`가 `constants.ts` 단일 출처 + 이메일 형식 검증**
- [ ] **BusinessSection에 "구현됨/보강 중/계획" 문구 부재** (TEST-P8.12)
- [ ] **FinalCTASection에 "mailto/파트너십" 문구 부재** (TEST-P8.13)
- [ ] FinalCTASection Primary CTA = Chrome Web Store URL
- [ ] App.tsx에 **11개 섹션**이 기획서 순서대로 배치 *(v2)*
- [ ] Header 네비 4개 앵커 모두 정확 (`#business`는 네비에 없음 — 의도된 배제)
- [ ] roadmap.*, **business.*** *(v2)*, finalCta.* 키 ko/en 동기화
- [ ] 단위 테스트 PASS (13개 TEST-P8.*)
- [ ] `npm run build` 통과
- [ ] **E2E 마일스톤**: 11개 섹션 본문 완성
- [ ] 작업 결과서 작성 및 커밋 완료
