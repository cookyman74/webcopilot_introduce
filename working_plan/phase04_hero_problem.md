# Phase 4: Hero + Problem 섹션

> **목표**: 첫 인상을 결정하는 HeroSection(2컬럼: 카피 + 브라우저 목업)과 ProblemSection(4개 문제 카드)을 구현한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일
> **E2E 확인 단위**: 두 섹션이 화면 상단에 차례로 보이고, 한↔영 토글로 텍스트가 바뀌며, Hero CTA가 Chrome Web Store로 이동하고, **Phase 2/3 데모 요소 + NAV_ANCHORS 4개 ID** 가 회귀 없이 유지된다.

---

## 4.1 사전 작업

- [ ] **[REVIEW]** Phase 1·2·3 결과서 **5건** 검토
  - 파일:
    1. [`Phase1_Bootstrap_RED_20260410.md`](./working_history/v1.0/Phase1_Bootstrap_RED_20260410.md) — v1 RED
    2. [`Phase1_Bootstrap_20260410.md`](./working_history/v1.0/Phase1_Bootstrap_20260410.md) — v1 GREEN (18 가드)
    3. [`Phase1_Bootstrap_TestGuardV2_20260411.md`](./working_history/v1.0/Phase1_Bootstrap_TestGuardV2_20260411.md) — v2/v2.1 (23 가드)
    4. [`Phase2_DesignSystem_20260411.md`](./working_history/v1.0/Phase2_DesignSystem_20260411.md) — 디자인 시스템 + §14 후속 개선
    5. [`Phase3_I18nLayout_20260411.md`](./working_history/v1.0/Phase3_I18nLayout_20260411.md) — i18n + Header/Footer + §12 후속 개선 (NAV_ANCHORS · 모바일 disclosure)
  - 확인: 공통 컴포넌트 5종(Section/Button/Badge/FeatureCard + barrel) PASS · 디자인 토큰 · i18n 동작 · Header/Footer 정상 · NAV_ANCHORS 단일 출처 · 모바일 disclosure · 23 Phase 1 가드 전체 PASS · tsconfig app/test 격리

- [ ] **[REGRESSION-BASELINE]** Phase 4 진입 전 **Phase 1 회귀 가드 + Phase 2/3 테스트** 기준선 확보
  ```bash
  cd 00_intro_web_landing_page
  node working_plan/scripts/verify_phase1.mjs
  # 기대: 23 PASS / 0 FAIL
  cd extapp_landing
  npm test
  # 기대: Test Files 11 passed (11) · Tests 154 passed | 5 skipped (159)
  ```
  **현재 두 기준선 값은 Phase 4 작업 동안 "회귀 금지" 의 상한선.** GREEN-VERIFY 및 사후 작업에서 다시 실행해 동일 값 유지 확인 (§4.3, §4.5).

- [ ] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 5.1, 5.2 (HeroSection / ProblemSection 스펙)
  - 기획서 `01_landing_page_plan.md` 5.1, 5.2 (메시지 톤)
  - `extension_intro.md` 1장(제품 개요), 2장(핵심 가치) 표현 참조

- [ ] **[CONTEXT]** Phase 3 환경 가정 인계 *(Phase3_I18nLayout_20260411.md §8 기반)*
  - **i18n 시스템**: `useTranslation()` 훅 + `t('hero.*')` 패턴으로 Hero/Problem 텍스트 렌더. i18n 은 App.tsx 상단의 `import './i18n';` 로 자동 초기화되어 테스트/프로덕션 모두에서 작동
  - **공통 컴포넌트 barrel**: `import { Section, Button, Badge, FeatureCard } from '../common';` + `import { Header, Footer } from '../layout';` — Phase 4 sections 도 동일 barrel 패턴으로 export 예정 (REFACTOR 에서 `src/components/sections/index.ts` 신설)
  - **`NAV_ANCHORS` 단일 출처** (constants.ts): Header 의 네비 href 와 App.tsx Section id 가 공유하는 4개 앵커. Phase 4 의 Hero/Problem 은 **NAV_ANCHORS 에 없으므로 ID 부여 대상 아님** — 데모 4개 Section 의 기존 ID (scenarios/differentiation/roadmap/features) 를 그대로 유지해야 함
  - **`data-testid` 공개 계약**: Badge `status-badge` / LanguageSwitcher `language-switcher`+`lang-toggle-{lang}` — Phase 4 에서 건드릴 일 없음
  - **Button 자동 external 감지**: http(s):// URL 은 `external` prop 없이도 `target="_blank" rel="noopener noreferrer"` 자동 부여 — Hero Primary CTA 가 이 동작에 의존
  - **tsconfig app/test 격리**: 새 test 파일은 `*.test.tsx` 패턴으로 두어야 test config 에 포함됨

- [ ] **[CONTEXT]** Phase 4 가 수정하는 파일과 Phase 1/2/3 가드의 상호작용
  | 수정 대상 | 영향 받는 가드 | 주의 |
  |----------|---------------|------|
  | `src/App.tsx` (Hero/Problem 추가 + 데모 h1 다운그레이드) | P1.9 · P1.18 · P1.16 (App.test.tsx) | **데모 4개 Section 은 유지**, Hero/Problem 을 데모 **앞에** 삽입. 데모 첫 Section 의 `<h1>` 을 `<h2>` 로 다운그레이드해 Hero h1 과 중복 방지 |
  | `src/App.test.tsx` | P1.16 | Phase 2 article 카운트 scope 격리는 선제적으로 완료됨 (78d9eaf 이후). 추가 변경 불필요 |
  | `src/components/sections/` (신규 디렉토리) | P1.18 (src 전체 스캔) | `.gitkeep` 제거 + `HeroSection.tsx` / `ProblemSection.tsx` / 각 테스트 진입 |
  | `src/i18n/locales/{ko,en}.json` | i18n 키 parity (i18n.test.ts) | `hero.*`, `problem.*` 키를 **ko/en 양쪽에 동시 추가**. 한쪽 누락 시 i18n.test.ts 가 즉시 FAIL |
  | `src/main.tsx` 건드릴 필요 없음 | P1.8 · P1.20 | Hero/Problem 은 main.tsx 체인에 영향 없음 |
  | `package.json` 건드릴 필요 없음 | P1.3 | 새 의존성 없음 (Section/Button/useTranslation 재사용) |

- [ ] **[ANALYSIS]** App.tsx 전환 정책 — **데모 유지 + Hero/Problem 선두 삽입 + 데모 h1 다운그레이드**
  - **데모 4개 Section 유지** (scenarios/differentiation/roadmap/features ID 유지) — NAV_ANCHORS 가드 충족
  - Hero/Problem 은 데모 **앞에** 삽입 (Header → Hero → Problem → 데모 4개 → Footer)
  - Hero/Problem 에는 **ID 부여하지 않음** — 랜딩 첫 화면이고 NAV_ANCHORS 앵커 대상 아님
  - 데모 첫 Section 의 `<h1>"Design System Demo"</h1>` 를 `<h2>` 로 다운그레이드 (시각 스타일 유지: `text-4xl font-bold` 그대로) — Hero 의 `<h1>` 이 페이지 내 유일한 h1 이 되도록 보장
  - Phase 5 이후 점진적으로 데모 Section 이 실제 Features/Scenarios/Differentiation/Roadmap 섹션으로 대체됨. 대체 시에도 NAV_ANCHORS ID 는 보존 필수

- [ ] **[ANALYSIS]** placeholder 이미지 경로 — Hero 우측 브라우저 목업
  - Phase 2 에서 `public/images/placeholder.svg` 생성 완료 (800×450 · Pretendard 폰트 · 점선 보더)
  - `public/images/hero-mock.png` 은 미생성 상태 → Phase 4 에서 `placeholder.svg` 를 재사용하거나 Hero 전용 placeholder 를 신규 생성
  - 1차 결정: **`placeholder.svg` 재사용** (Phase 9 Lighthouse 최적화 전까지 공통 placeholder 사용)

- [ ] **[ANALYSIS]** `src/components/sections/` 디렉토리 상태 확인
  - Phase 1 에서 `.gitkeep` 만 들어있는 상태 (확인됨)
  - Phase 4 에서 실제 파일 추가 시 `.gitkeep` 제거 (Phase 2 `common/`, Phase 3 `layout/` 에서 동일 처리 전례)

---

## 4.2 RED Phase: 검증 체크리스트 + 실패 테스트

- [ ] **[RED]** 검증 체크리스트
  ```
  TEST-P4.1:  HeroSection 이 H1, eyebrow, subtitle, primary/secondary CTA 렌더
  TEST-P4.2:  HeroSection 의 primary CTA href 가 CHROME_WEB_STORE_URL 과 일치 + target/rel 보안 속성
  TEST-P4.3:  HeroSection 의 secondary CTA href 가 '#features' (앵커 — 데모 4th 섹션 또는 Phase 5 FeaturesSection 을 가리킴)
  TEST-P4.4:  ProblemSection 이 4개 문제 카드 렌더 (role="article" × 4)
  TEST-P4.5:  ko/en locale 에 hero.*, problem.* 키 모두 존재 (i18n.test.ts 의 parity 자동 검증)
  TEST-P4.6:  언어 전환 시 Hero H1 / Problem H2 텍스트가 변경됨
  TEST-P4.7:  Phase 4 변경 후에도 verify_phase1.mjs 23개 가드 전부 PASS 유지 (회귀 금지)
  TEST-P4.8:  Phase 2/3 App.test.tsx 의 159개 assertion (140 passed + 14 from Phase 3 v2 + 5 skipped) 유지
  TEST-P4.9:  NAV_ANCHORS 4개 ID (features/scenarios/differentiation/roadmap) 가 App.tsx DOM 에 계속 존재
  TEST-P4.10: App.tsx 루트의 h1 태그가 정확히 1개 (HeroSection h1 만 — 데모 첫 Section h1 은 h2 로 다운그레이드)
  TEST-P4.11: ProblemSection article 이 4개 — features 섹션의 FeatureCard 2개와 scope 분리됨
  ```

- [ ] **[RED]** HeroSection 테스트 (TEST-P4.1 + TEST-P4.2 + TEST-P4.3 + TEST-P4.6)
  - 파일: `src/components/sections/HeroSection.test.tsx`
  ```tsx
  import { describe, it, expect, beforeEach } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import { HeroSection } from './HeroSection';
  import i18n from '../../i18n';
  import { CHROME_WEB_STORE_URL } from '../../lib/constants';

  describe('HeroSection (TEST-P4.1 + P4.2 + P4.3 + P4.6)', () => {
    beforeEach(async () => {
      // 각 케이스 전 ko 로 리셋 — 언어 감지에 따른 변동 제거
      await i18n.changeLanguage('ko');
    });

    it('루트에 정확히 1개의 <h1> 을 렌더한다 (TEST-P4.1)', () => {
      const { container } = render(<HeroSection />);
      const h1s = container.querySelectorAll('h1');
      expect(h1s.length).toBe(1);
    });

    it('eyebrow 라벨 · H1 title · subtitle 이 모두 i18n 문자열로 렌더된다', () => {
      render(<HeroSection />);
      // eyebrow (Chrome Extension · AI Copilot 류)
      expect(
        screen.getByText(/Chrome Extension|AI Copilot/i)
      ).toBeInTheDocument();
      // H1 (웹페이지를 이해하고... 류 — 한국어)
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1.textContent?.length ?? 0).toBeGreaterThan(10);
      // subtitle — H1 아닌 텍스트 노드
      // (정확한 문구는 locale 스펙에 고정되므로 길이만 검증)
    });

    it('Primary CTA 가 CHROME_WEB_STORE_URL 을 href 로 갖는다 (TEST-P4.2)', () => {
      render(<HeroSection />);
      const primary = screen
        .getAllByRole('link')
        .find((el) => el.getAttribute('href') === CHROME_WEB_STORE_URL);
      expect(primary).toBeDefined();
    });

    it('Primary CTA 는 외부 링크 보안 속성을 갖는다 (Button 자동 감지)', () => {
      // Phase 2 §14.2.4 Button 자동 external 감지 의존 — https:// URL 이면
      // target + noopener + noreferrer 자동 부여. Header Primary CTA 와 동일 패턴.
      render(<HeroSection />);
      const primary = screen
        .getAllByRole('link')
        .find((el) => el.getAttribute('href') === CHROME_WEB_STORE_URL);
      expect(primary).toBeDefined();
      expect(primary).toHaveAttribute('target', '_blank');
      const rel = primary?.getAttribute('rel') ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });

    it('Secondary CTA 는 내부 앵커 #features 를 가리킨다 (TEST-P4.3)', () => {
      render(<HeroSection />);
      const secondary = screen
        .getAllByRole('link')
        .find((el) => el.getAttribute('href') === '#features');
      expect(secondary).toBeDefined();
      // 내부 앵커이므로 external 감지 제외 — target 속성 없음
      expect(secondary?.getAttribute('target')).toBeNull();
    });

    it('언어를 en 으로 전환하면 H1 텍스트가 달라진다 (TEST-P4.6)', async () => {
      const { rerender } = render(<HeroSection />);
      const koH1 = screen.getByRole('heading', { level: 1 }).textContent;
      expect(koH1).toBeTruthy();

      await i18n.changeLanguage('en');
      rerender(<HeroSection />);
      const enH1 = screen.getByRole('heading', { level: 1 }).textContent;
      expect(enH1).toBeTruthy();
      expect(enH1).not.toBe(koH1);
    });

    it('신뢰 라벨 (지원 AI 모드) 이 렌더된다', () => {
      // 01_landing_page_plan.md §5.1 의 "OpenAI · Gemini · LM Studio · Didim 지원" 대응
      render(<HeroSection />);
      expect(
        screen.getByText(/OpenAI|Gemini|LM Studio|Didim/)
      ).toBeInTheDocument();
    });
  });
  ```

- [ ] **[RED]** ProblemSection 테스트 (TEST-P4.4 + TEST-P4.11)
  - 파일: `src/components/sections/ProblemSection.test.tsx`
  ```tsx
  import { describe, it, expect, beforeEach } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import { ProblemSection } from './ProblemSection';
  import i18n from '../../i18n';

  describe('ProblemSection (TEST-P4.4)', () => {
    beforeEach(async () => {
      await i18n.changeLanguage('ko');
    });

    it('정확히 4개의 <article> (문제 카드) 을 렌더한다', () => {
      const { container } = render(<ProblemSection />);
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBe(4);
    });

    it('4개 카드 각각에 제목(헤딩) 과 설명 텍스트가 존재한다', () => {
      // phase04 §4.3 TASK-001 locale 스펙:
      //   problem.items.{p1,p2,p3,p4}.{title,desc}
      // 제목은 비어있으면 안 되고, 설명도 비어있으면 안 됨.
      const { container } = render(<ProblemSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        // 카드 내부에 heading 요소 1개 이상 (h3 권장)
        const heading = article.querySelector('h3, h4, h5');
        expect(heading).not.toBeNull();
        expect(heading?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
        // 설명 텍스트도 존재
        const paragraphs = article.querySelectorAll('p');
        expect(paragraphs.length).toBeGreaterThan(0);
      }
    });

    it('섹션 최상위에 H2 (문제 정의 제목) 가 렌더된다', () => {
      // H1 은 HeroSection 이 사용하므로 ProblemSection 은 H2 로 고정.
      render(<ProblemSection />);
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toBeInTheDocument();
      expect(h2.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    });

    it('언어를 en 으로 전환하면 H2 텍스트가 달라진다 (TEST-P4.6)', async () => {
      const { rerender } = render(<ProblemSection />);
      const koH2 = screen.getByRole('heading', { level: 2 }).textContent;

      await i18n.changeLanguage('en');
      rerender(<ProblemSection />);
      const enH2 = screen.getByRole('heading', { level: 2 }).textContent;
      expect(enH2).not.toBe(koH2);
    });

    it('섹션 루트가 role="region" 으로 접근 가능하다 (landmarks)', () => {
      // <section> 루트가 aria-label 또는 aria-labelledby 를 갖추면 region 랜드마크.
      // 접근성 가드 — 스크린리더 사용자가 섹션을 건너뛰며 탐색 가능해야 함.
      const { container } = render(<ProblemSection />);
      const section = container.querySelector('section');
      expect(section).not.toBeNull();
      const hasLabel =
        section?.getAttribute('aria-label') !== null ||
        section?.getAttribute('aria-labelledby') !== null;
      expect(hasLabel).toBe(true);
    });
  });
  ```

- [ ] **[RED]** App.tsx 구조 가드 업데이트 (TEST-P4.8 + P4.9 + P4.10 + P4.11)
  - 파일: `src/App.test.tsx` — 기존 테스트 유지 + 다음 4건 신규 추가
  ```tsx
  // Phase 4 진입 후 App.tsx 에 추가되는 구조 가드.
  // 기존 Phase 2/3 가드 (159 assertion) 는 scope 격리 덕분에 그대로 유지됨.

  it('HeroSection 이 렌더되고 h1 이 정확히 1개 존재한다 (TEST-P4.10)', () => {
    // 데모 첫 Section 의 <h1> 을 <h2> 로 다운그레이드했으므로 HeroSection 의 h1 이 유일.
    const { container } = render(<App />);
    const h1s = container.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
  });

  it('ProblemSection 이 Hero 다음에 렌더되고 4개 article 을 포함한다 (TEST-P4.11)', () => {
    const { container } = render(<App />);
    // ProblemSection 내부 article — 각 ProblemSection 구현이 role="region"
    // 또는 특정 클래스로 식별되도록 함. 여기서는 problem 섹션을 구분하기 위해
    // aria-labelledby 또는 data-section="problem" 등 구현 자유.
    // 최소 보장: ProblemSection 의 article 수 + FeatureCard 2 = 6 개 이상
    const allArticles = container.querySelectorAll('article');
    expect(allArticles.length).toBeGreaterThanOrEqual(6);
  });

  it('NAV_ANCHORS 4개 ID 가 Phase 4 이후에도 유지된다 (TEST-P4.9)', () => {
    // Phase 3 §12 의 NAV_ANCHORS 가드가 Phase 4 에서도 그대로 작동.
    // 데모 Section 4개가 그대로 유지되어 ID 변경 없음.
    const { container } = render(<App />);
    for (const anchor of NAV_ANCHORS) {
      expect(container.querySelector(`section#${anchor.id}`)).not.toBeNull();
    }
  });

  it('데모 첫 Section 의 "Design System Demo" 가 h1 이 아닌 h2 로 렌더된다', () => {
    // Phase 4 에서 HeroSection 의 h1 과 충돌하지 않도록 다운그레이드됨을 강제.
    render(<App />);
    // "Design System Demo" 텍스트를 가진 요소가 h2 인지 확인
    const demoHeading = screen.getByText(/Design System Demo/);
    expect(demoHeading.tagName).toBe('H2');
  });
  ```

- [ ] **[RED]** locale 키 동기화 재검증
  - Phase 3 `i18n.test.ts` 의 `collectKeys(ko).sort() === collectKeys(en).sort()` 가 새로 추가된 `hero.*` / `problem.*` 키도 자동 검사한다 — Phase 4 에서는 별도 테스트 추가 불필요

- [ ] **[RED-VERIFY]** 테스트 FAIL 확인 — 실측 기대
  ```bash
  npm test
  # Test Files 2 failed | 11 passed (13)
  # Tests      (약 159 passed + 신규 약 10 failed)
  #
  # FAIL 원인:
  #   - src/components/sections/HeroSection.test.tsx → ./HeroSection 미존재
  #   - src/components/sections/ProblemSection.test.tsx → ./ProblemSection 미존재
  #   - App.test.tsx 의 Phase 4 신규 4건 → Hero/Problem 컴포넌트 부재
  ```
  - `verify_phase1.mjs` 는 **P1.15 (typecheck) 와 P1.16 (test) 만 일시 FAIL** — Phase 2/3 RED 패턴과 동일. P1.17 (build) 는 tsconfig 격리 덕분에 유지 (`21 PASS / 2 FAIL / 총 23`)

---

## 4.3 GREEN Phase: 최소 코드 구현

- [ ] **[TASK-001]** locale 키 추가
  - 파일: `src/i18n/locales/ko.json`
  ```json
  "hero": {
    "eyebrow": "Chrome Extension · AI Copilot",
    "title": "웹페이지를 이해하고, 질문하고, 자동화하는 AI 코파일럿",
    "subtitle": "단순한 채팅이 아니라, 페이지 문맥을 읽고 필요할 때 직접 브라우저를 조작하는 브라우저 생산성 도구입니다.",
    "cta_primary": "Chrome에 추가하기",
    "cta_secondary": "기능 살펴보기",
    "trust": "OpenAI · Gemini · LM Studio · Didim 지원"
  },
  "problem": {
    "title": "이런 경험, 한 번쯤 있으셨죠?",
    "items": {
      "p1": { "title": "페이지를 다시 정리해야 함", "desc": "긴 글을 읽고 요약을 또 만들어야 합니다." },
      "p2": { "title": "반복적인 웹 작업", "desc": "같은 양식, 같은 클릭이 매일 반복됩니다." },
      "p3": { "title": "AI는 답변만, 실행은 사용자", "desc": "결국 마지막 작업은 직접 해야 합니다." },
      "p4": { "title": "사이트별 자동화의 코드 장벽", "desc": "스크립트를 직접 짜는 건 부담이 큽니다." }
    }
  }
  ```
  - 파일: `src/i18n/locales/en.json` — 동일 키 영문

- [ ] **[TASK-002]** HeroSection 컴포넌트
  - 파일: `src/components/sections/HeroSection.tsx`
  - **구조**: `<Section background="canvas">` 래퍼 내부에 반응형 2컬럼 grid
    - 모바일 (`< md`): 1컬럼 (카피 위 → 이미지 아래)
    - 데스크톱 (`>= md`): 2컬럼 (좌 카피 · 우 이미지)
  - **좌측**: eyebrow 라벨 → h1 title → subtitle → Primary Button (CHROME_WEB_STORE_URL) + Secondary Button (`href="#features"`) + 신뢰 라벨
  - **우측**: `<img src="/images/placeholder.svg" alt="..." />` — Phase 2 placeholder 재사용
  - **i18n 적용**: `useTranslation()` 으로 `t('hero.eyebrow')` / `t('hero.title')` / `t('hero.subtitle')` / `t('hero.cta_primary')` / `t('hero.cta_secondary')` / `t('hero.trust')`
  - **Button 자동 external 감지 활용**: Primary CTA 는 `<Button href={CHROME_WEB_STORE_URL}>` 만으로 `external` 생략 가능 — https:// 감지로 target/rel 자동 부여
  - **id 부여 안 함**: Hero 는 랜딩 최상단, NAV_ANCHORS 앵커 대상 아님

- [ ] **[TASK-003]** ProblemSection 컴포넌트
  - 파일: `src/components/sections/ProblemSection.tsx`
  - **구조**: `<Section background="surface">` + h2 제목 + 4개 문제 카드 그리드
    - 모바일: 1컬럼
    - 태블릿 (`md`): 2컬럼 (2×2)
    - 데스크톱 (`lg`): 4컬럼 (1×4)
    - Tailwind 예: `grid gap-6 md:grid-cols-2 lg:grid-cols-4`
  - **각 카드는 `<article>`** (ProblemSection.test.tsx `querySelectorAll('article').length === 4` 충족)
  - 카드 내부: 아이콘 placeholder → `<h3>` 제목 → `<p>` 설명
  - **i18n 적용**: `problem.title` (섹션 h2) + `problem.items.{p1..p4}.{title,desc}` (4 × 2 = 8 키) 를 `['p1','p2','p3','p4'].map()` 으로 반복 렌더 (REFACTOR 대응 데이터화 선반영)
  - **role="region" 접근성**: `<Section>` 이 자체 `role` 을 제공하지 않으면 ProblemSection 루트에 `aria-labelledby` 지정 + h2 에 대응하는 id 부여
  - **id 부여 안 함**: NAV_ANCHORS 앵커 대상 아님

- [ ] **[TASK-004]** App.tsx 갱신 — **Hero/Problem 선두 삽입 + 데모 h1 다운그레이드**
  - **최종 구조**:
    ```tsx
    import './i18n';
    import { Section, Button, Badge, FeatureCard } from './components/common';
    import { Header, Footer } from './components/layout';
    import { HeroSection } from './components/sections/HeroSection';
    import { ProblemSection } from './components/sections/ProblemSection';

    export default function App() {
      return (
        <>
          <Header />
          <main>
            {/* Phase 4 실제 섹션 — 첫 화면 + 문제 정의 */}
            <HeroSection />
            <ProblemSection />

            {/* Phase 2 데모 콘텐츠 (4개) 는 Phase 5+ 에서 실제 섹션으로 대체 예정
               NAV_ANCHORS ID 는 유지 필수 (App.test.tsx 가드가 검증) */}
            <Section id="scenarios" background="canvas">
              {/* h1 → h2 다운그레이드: HeroSection h1 과 중복 방지 */}
              <h2 className="text-4xl font-bold text-ink-900">Design System Demo</h2>
              <p className="mt-4 text-ink-700">
                Phase 2 공통 컴포넌트 시각 확인 페이지
              </p>
            </Section>
            <Section id="differentiation" background="surface">...</Section>
            <Section id="roadmap" background="surface-alt">...</Section>
            <Section id="features" background="accent-soft">...</Section>
          </main>
          <Footer />
        </>
      );
    }
    ```
  - **핵심 변경점**:
    1. `<HeroSection />` 과 `<ProblemSection />` 을 `<Header />` 바로 뒤에 삽입
    2. 데모 첫 Section 의 `<h1>"Design System Demo"</h1>` 를 `<h2>` 로 변경 (스타일 `text-4xl font-bold` 유지)
    3. 나머지 데모 Section 3개는 수정 없음
  - **NAV_ANCHORS 가드 유지**: 데모 4개 Section 의 ID (scenarios/differentiation/roadmap/features) 전부 유지 — App.test.tsx 의 `NAV_ANCHORS 4개 ID 존재` 가드 충족

- [ ] **[TASK-005]** `src/components/sections/.gitkeep` 제거
  - Phase 2 `common/`, Phase 3 `layout/` 과 동일 패턴 — 실제 파일 진입 시 `.gitkeep` 제거

- [ ] **[TASK-006]** `public/images/hero-mock.png` 경로 결정
  - 1차 결정: `public/images/placeholder.svg` 재사용 (별도 파일 생성 안 함)
  - Phase 9 Lighthouse 최적화 시점에 실제 hero 이미지로 교체

- [ ] **[TASK-007]** Prettier 일괄 포맷 적용 *(P1.21 회귀 방지)*
  ```bash
  cd extapp_landing
  npm run format
  npm run format:check
  ```

- [ ] **[GREEN-VERIFY]** 검증 — **Phase 4 자체 + Phase 1 회귀 + Phase 2/3 호환성**
  ```bash
  cd extapp_landing
  npm run lint          # 0 errors
  npm run typecheck     # 0 errors (app + test)
  npm run format:check  # 규범 준수
  npm test              # Phase 2/3 의 159 + Phase 4 신규 전부 PASS
  npm run build         # 성공

  cd ..
  node working_plan/scripts/verify_phase1.mjs
  # 기대: 23 PASS / 0 FAIL (TEST-P4.7)

  cd extapp_landing
  npx vitest run src/App.test.tsx
  # 기대: Phase 2/3 의 App.test 전부 + Phase 4 신규 4건 PASS (TEST-P4.8/P4.9/P4.10/P4.11)

  npm run dev
  # 수동 시각 확인:
  #   - HeroSection 첫 화면 노출 (Header 아래, 스크롤 없이)
  #   - 한↔영 토글로 Hero + Problem 텍스트 전환
  #   - Hero Primary CTA → Chrome Web Store 새 탭
  #   - Hero Secondary CTA → #features 앵커 스크롤 (features 섹션 = 데모 4번째)
  #   - ProblemSection 4개 카드 가독성 (mobile/tablet/desktop 3 브레이크포인트)
  #   - 데모 첫 Section "Design System Demo" 가 h2 로 렌더됨 (브라우저 Inspect 로 확인)
  ```
  - **흔한 Phase 4 회귀 패턴**:
    * **P1.16 FAIL**: App.test.tsx 의 기존 가드가 Hero/Problem 추가 후 깨짐 → scope 격리는 이미 완료 (78d9eaf), 남은 이슈는 h1 중복 → 데모 첫 Section h1→h2 다운그레이드 재확인
    * **i18n.test.ts FAIL**: hero.* 또는 problem.* 키를 ko 에만 추가 → en 에도 동일 키 추가 필수
    * **Hero Primary CTA 가 external 속성 부재**: Button 자동 감지 의존했는데 href 가 https://  아닌 상대 경로로 잘못 입력됨 → `CHROME_WEB_STORE_URL` 상수 import 재확인
    * **ProblemSection article 카운트 != 4**: 데이터 배열에서 누락 또는 중복 → locale `problem.items` 키 4개 확인

---

## 4.4 REFACTOR Phase: 코드 개선

### 4.4.1 구조 개선

- [ ] **[REFACTOR-STRUCTURE]** 문제 카드 데이터화 *(GREEN 에서 선반영 권장)*
  - ProblemSection 내 4개 카드를 `['p1','p2','p3','p4'].map()` 형태로 정리
  - 향후 추가/수정 용이. Phase 3 Header 의 `NAV_ANCHORS.map()` 패턴과 동일
  - TASK-003 에서 이미 지시된 구조이므로 REFACTOR 는 확인만

- [ ] **[REFACTOR-STRUCTURE]** sections barrel export
  - 파일: `src/components/sections/index.ts` 신규
  - Phase 2 `common/index.ts`, Phase 3 `layout/index.ts` 와 동일 패턴:
    ```ts
    export { HeroSection } from './HeroSection';
    export { ProblemSection } from './ProblemSection';
    ```
  - App.tsx import 를 barrel 로 정리:
    ```diff
    - import { HeroSection } from './components/sections/HeroSection';
    - import { ProblemSection } from './components/sections/ProblemSection';
    + import { HeroSection, ProblemSection } from './components/sections';
    ```

- [ ] **[REFACTOR-STRUCTURE]** Hero 이미지 placeholder 컴포넌트화 검토
  - 추후 모든 섹션에서 재사용할 가능성 → `common/Placeholder.tsx` 로 분리 검토
  - **결정 기록**: Phase 4 1차는 `<img src="/images/placeholder.svg">` 직접 사용 (YAGNI). Phase 5+ 에서 ScenariosSection / FeaturesSection 도 동일 placeholder 를 쓰면 그 시점에 컴포넌트화. 결과서에 결정 근거 명시

- [ ] **[REFACTOR-VERIFY]** 리팩터링 후 테스트 재확인
  ```bash
  npm run format && npm run lint && npm run typecheck && npm test && npm run build
  cd .. && node working_plan/scripts/verify_phase1.mjs
  ```
  - 기대: 번들 크기 변화 없음 (REFACTOR 는 구조 개선만), 모든 테스트 PASS, 23 PASS 유지

### 4.4.2 빌드 품질 점검

- [ ] **[REFACTOR-PERF-MEASURE]** 번들 크기 변화 — Phase 3 → Phase 4
  | 파일 | Phase 3 v2 베이스라인 | Phase 4 | Δ |
  |------|----------------------|---------|---|
  | `dist/assets/index-*.js` | **253.01 KB** (gzip 79.89 KB) | [측정] | [Δ] |
  | `dist/assets/index-*.css` | **9.82 KB** (gzip 2.76 KB) | [측정] | [Δ] |
  - **예상**: JS +5~10 KB (HeroSection/ProblemSection 로직), CSS +1~2 KB (새 Tailwind 유틸)
  - Phase 9 품질 목표 (gzip JS < 300 KB) 대비 현재 gzip 79.89 KB → 약 +2~3 KB 예상 = 여유 충분

- [ ] **[REFACTOR-PERF-ANALYZE]** Lighthouse 간이 측정 (선택)
  - `npm run build && npm run preview` 후 http://localhost:4173 에서 DevTools Lighthouse
  - 관찰 대상: LCP (Hero 이미지/텍스트 렌더 시점), CLS (이미지 차원 고정 여부), Accessibility score
  - Phase 9 최종 최적화 전 베이스라인으로 기록만

---

## 4.5 사후 작업

- [ ] **[VERIFY]** 전체 검증 — **Phase 4 + Phase 1 회귀 + Phase 2/3 호환성**
  ```bash
  cd extapp_landing
  npm run lint && npm run typecheck && npm run format:check && npm test && npm run build

  cd ..
  node working_plan/scripts/verify_phase1.mjs
  # 기대: 23 PASS / 0 FAIL (TEST-P4.7)
  ```

- [ ] **[VERIFY]** 기능/시각 회귀 확인 (수동, 브라우저)
  - HeroSection 첫 화면 노출 (Header 아래, 스크롤 없이 완전히 보임)
  - 한국어 → 영어 전환 시 **Hero H1 + Problem H2 + 4개 Problem 카드 텍스트** 전환
  - Hero Primary CTA → Chrome Web Store 새 탭 (target=_blank 확인)
  - Hero Secondary CTA → `#features` 앵커 스크롤 (features 섹션 = 데모 4번째 Feature Cards 로 이동)
  - ProblemSection 4개 카드 가독성 (모바일 1컬럼 / 태블릿 2×2 / 데스크톱 1×4)
  - **데모 첫 Section "Design System Demo" 가 h2 로 렌더됨** — DevTools Inspect 에서 `<h2>` 태그 확인
  - Header 네비 4개 앵커 (#features/#scenarios/#differentiation/#roadmap) 모두 **클릭 시 해당 섹션으로 스크롤 성공** (데모 Section ID 유지 덕분)
  - Header 모바일 메뉴 버튼 클릭 → 4개 링크 토글 (Phase 3 disclosure 패턴 회귀 없음)

- [ ] **[DOC]** 작업 결과서 작성
  - 파일: `working_history/v1.0/Phase4_HeroProblem_2026MMDD.md`
  - 포함 내용:
    - 설치 패키지 변화 (본 Phase 에서는 신규 없음)
    - 번들 크기 변화 (Phase 3 베이스라인 JS 253.01 KB / CSS 9.82 KB 대비)
    - Phase 1 회귀 가드 재실행 결과 (23 PASS 유지)
    - Phase 2/3 App.test.tsx 호환성 (159 assertion + Phase 4 신규 약 15 건)
    - 데모 h1→h2 다운그레이드 경위와 H1 유일성 검증
    - HeroSection 2컬럼 레이아웃 결정 및 placeholder 재사용 근거
    - ProblemSection 4 카드 responsive grid (mobile/tablet/desktop)
    - 발생한 이슈와 해결 방법
    - Phase 5 (Solution + Features) 인계 사항:
      * Features 섹션이 데모 `#features` ID 를 인수받아 대체
      * FeatureCard 9개 배치 시 badge 총 카운트 변경 예상 — App.test.tsx 의 badge 카운트 `=== 4` 가드를 scope 격리 또는 `>= 4` 로 전환 필요
      * FeatureStatus 타입 활용 (Phase 2 REFACTOR 산출물)

- [ ] **[COMMIT]** 변경사항 커밋
  ```bash
  cd 00_intro_web_landing_page
  git add extapp_landing/src \
          working_plan/phase04_hero_problem.md \
          working_plan/working_history/v1.0/Phase4_HeroProblem_2026MMDD.md
  git commit -m "[P4] HeroSection + ProblemSection — Hero 2컬럼 + Problem 4카드 · 데모 유지"
  ```

---

## Phase 4 완료 조건 (Definition of Done)

- [ ] HeroSection 렌더 — H1 · eyebrow · subtitle · Primary/Secondary CTA · 신뢰 라벨 (TEST-P4.1)
- [ ] Primary CTA href = CHROME_WEB_STORE_URL + target=_blank + noopener + noreferrer (TEST-P4.2, Button 자동 external 감지 활용)
- [ ] Secondary CTA href = `#features` 내부 앵커 (TEST-P4.3)
- [ ] ProblemSection 4개 `<article>` 카드 렌더 (TEST-P4.4)
- [ ] 각 Problem 카드는 `<h3>` 제목 + 설명 `<p>` 포함
- [ ] ProblemSection h2 + region 접근성 (aria-label / aria-labelledby)
- [ ] hero.*, problem.* 키 ko/en 동기화 (i18n.test.ts parity 가드 통과, TEST-P4.5)
- [ ] 언어 전환 시 Hero H1 · Problem H2 · 4개 카드 텍스트 정상 변경 (TEST-P4.6)
- [ ] `npm run lint` / `typecheck` / `format:check` / `test` / `build` 전부 통과
- [ ] **TEST-P4.7**: Phase 1 회귀 가드 재실행 → 23 PASS / 0 FAIL 유지
- [ ] **TEST-P4.8**: Phase 2/3 App.test.tsx 의 159 assertion 전부 유지
- [ ] **TEST-P4.9**: NAV_ANCHORS 4개 ID (features/scenarios/differentiation/roadmap) 가 DOM 에 계속 존재
- [ ] **TEST-P4.10**: App.tsx 루트의 `<h1>` 이 정확히 1개 (HeroSection 만)
- [ ] **TEST-P4.11**: ProblemSection article 4개 + FeatureCard article 2개 = 총 6개 이상, scope 분리 검증
- [ ] 데모 첫 Section 의 "Design System Demo" 텍스트가 `<h2>` 로 렌더 (h1→h2 다운그레이드 완료)
- [ ] `src/components/sections/.gitkeep` 제거 + `HeroSection.tsx` / `ProblemSection.tsx` + barrel `index.ts` 배치
- [ ] 모바일/태블릿/데스크톱 3개 브레이크포인트에서 Hero 2컬럼 + Problem 그리드 시각 확인 완료
- [ ] 작업 결과서 작성 및 커밋 완료
