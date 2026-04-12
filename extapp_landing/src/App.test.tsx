/**
 * App.test.tsx — Phase 2 전환
 *
 * Phase 1 의 "Bootstrap OK" 텍스트 기반 테스트를 대체한다. App 이 데모 페이지
 * 로 전환됐으므로 테스트도 데모 페이지의 안정된 요소들을 종합적으로 검증한다.
 *
 * 본 파일의 존재 자체가 Phase 1 P1.10 (App.test.tsx + describe/it 존재) 가드
 * 를 만족시키며, `npm test` (P1.16) PASS 가 이 파일의 assertion 에 의존한다.
 *
 * 리뷰 피드백 반영 (Deep Dive ② App.test.tsx 포괄 검증):
 *   App 이 데모 페이지라면 공통 컴포넌트의 모든 변형(Section 4종, Button 2종,
 *   Badge 3종, FeatureCard 2 케이스) 이 App.test 에서 종합적으로 다뤄져야 한다.
 *   아래 테스트는 그 요구를 반영한다.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { NAV_ANCHORS } from './lib/constants';
import i18n from './i18n';

describe('App demo page (Phase 2 공통 컴포넌트 종합 검증)', () => {
  // Phase 5 리뷰 반영: 데모 섹션이 i18n 전환되었으므로 각 케이스 전
  // ko 로 리셋해 테스트 간 독립 보장 (happy-dom 의 navigator.language 가
  // en-US 이므로 별도 리셋 없이는 en 으로 init 될 수 있음).
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });
  it('Section 배경이 canvas/surface/surface-alt 3종 이상 고유하게 렌더된다', () => {
    // v2: 리뷰 피드백 반영 — 각 배경 클래스의 실제 존재를 개별 검증.
    //
    // Phase 5 전환 (리뷰 피드백 반영 Medium): 데모 `<Section id="features"
    // background="accent-soft">` 가 Phase 5 GREEN 에서 삭제되고 FeaturesSection
    // (background="surface") 으로 대체된다. 이 시점에 accent-soft 를 사용하는
    // 섹션이 전체 App 에서 사라지므로, 4종 가드를 3종으로 축소한다.
    // accent-soft 는 Phase 8 FinalCTA(§5.11) 에서 다시 등장하므로 그 시점에
    // 4종 가드로 복구한다.
    const { container } = render(<App />);
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThanOrEqual(4);

    const allClassNames = Array.from(sections).map((s) => s.className);
    const combined = allClassNames.join(' ');

    // Phase 5 시점 실제 존재하는 3종 배경
    expect(combined).toMatch(/\bbg-canvas\b/);
    expect(combined).toMatch(/\bbg-surface\b/);
    expect(combined).toMatch(/\bbg-surface-alt\b/);
    // accent-soft 는 Phase 5 에서 소멸. Phase 8 FinalCTA 에서 부활 예정.
    // expect(combined).toMatch(/\bbg-accent-soft\b/);

    const uniqueBgs = new Set(
      allClassNames
        .map((c) => c.match(/\bbg-[a-z-]+\b/)?.[0])
        .filter((c): c is string => Boolean(c))
    );
    expect(uniqueBgs.size).toBeGreaterThanOrEqual(3);
  });

  it('Section id="features" 가 Anchor Link 대상으로 존재한다', () => {
    // "Anchor Link" 버튼이 #features 를 가리키므로 대응 섹션이 DOM 에 있어야 함.
    // 이 테스트가 없으면 데모 페이지의 앵커 네비가 silently broken 상태로
    // 회귀할 수 있다.
    const { container } = render(<App />);
    expect(container.querySelector('#features')).not.toBeNull();
    expect(container.querySelector('section#features')).not.toBeNull();
  });

  it('NAV_ANCHORS 의 4개 ID 가 App DOM 에 모두 존재한다 (Header 네비 앵커 유효성 가드)', () => {
    // 리뷰 피드백 반영 (Medium): Header 가 #features/#scenarios/#differentiation/
    // #roadmap 을 렌더하지만 App.tsx 에는 #features 만 있어 나머지 3개가 dead
    // anchor 상태였음. NAV_ANCHORS 를 반복하며 "모든 ID 가 DOM 에 존재" 를
    // 강제하여 Header 와 Section 의 계약 불일치를 차단.
    //
    // 본 가드는 Phase 4~8 에서 실제 섹션이 추가될 때도 유지된다. 섹션이
    // NAV_ANCHORS 와 일치하는 id 를 부여하지 않으면 즉시 FAIL 로 드러남.
    const { container } = render(<App />);
    for (const anchor of NAV_ANCHORS) {
      const target = container.querySelector(`#${anchor.id}`);
      expect(
        target,
        `NAV_ANCHORS 의 "${anchor.id}" 에 대응하는 DOM 요소가 없음 — Header href 가 dead anchor`
      ).not.toBeNull();
    }
  });

  it('4개 anchor ID 가 모두 <section> 태그에 부여되어 있다 (앵커 점프 의미)', () => {
    // ID 가 section 태그에 있어야 브라우저 앵커 네비가 섹션 시작점으로 점프.
    // div/span 등에 id 만 붙어있으면 시각적 점프 위치가 어긋날 수 있음.
    const { container } = render(<App />);
    for (const anchor of NAV_ANCHORS) {
      const target = container.querySelector(`section#${anchor.id}`);
      expect(target, `#${anchor.id} 가 <section> 태그에 부여되지 않음`).not.toBeNull();
    }
  });

  it('섹션 렌더 순서가 NAV_ANCHORS 배열 순서와 일치한다 (스크롤 흐름 일관성)', () => {
    // 리뷰 피드백 반영 (Low): NAV_ANCHORS 와 Header 는
    //   features → scenarios → differentiation → roadmap
    // 순서를 전제로 하지만, 이전 App.tsx 는 데모 Section 을
    //   scenarios → differentiation → roadmap → features
    // 순서로 렌더해 Header 네비 1번 클릭 시 사용자가 맨 아래로 점프하는
    // 기묘한 UX 가 있었다. 이 가드는 **DOM 에 등장하는 id 순서** 가
    // NAV_ANCHORS 배열 순서와 정확히 일치함을 강제한다.
    //
    // 구현: querySelectorAll('section[id]') 로 id 를 가진 모든 section 을
    // **DOM 순서** 로 수집 (HeroSection/ProblemSection 은 id 없으므로 제외) →
    // id 배열을 만든 뒤 NAV_ANCHORS 의 id 배열과 비교.
    const { container } = render(<App />);
    const renderedIds = Array.from(container.querySelectorAll('section[id]'))
      .map((s) => s.id)
      .filter((id) => NAV_ANCHORS.some((a) => a.id === id));
    const expectedIds = NAV_ANCHORS.map((a) => a.id);
    expect(renderedIds).toEqual(expectedIds);
  });

  it('Button primary / secondary 버튼이 각각 존재한다', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Primary Button/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Secondary Button/ })).toBeInTheDocument();
  });

  it('Button anchor 링크는 내부 앵커, 명시적/자동 external 링크는 target="_blank"', () => {
    render(<App />);
    const anchor = screen.getByRole('link', { name: /Anchor Link/ });
    expect(anchor).toHaveAttribute('href', '#features');
    expect(anchor.getAttribute('target')).toBeNull();

    // 명시적 external={true}
    const external = screen.getByRole('link', { name: /External Link/ });
    expect(external).toHaveAttribute('target', '_blank');
    const extRel = external.getAttribute('rel') ?? '';
    expect(extRel).toContain('noopener');
    expect(extRel).toContain('noreferrer');

    // 자동 external 감지 (external prop 없이 http(s) URL 만 전달)
    const auto = screen.getByRole('link', { name: /Auto External/ });
    expect(auto).toHaveAttribute('target', '_blank');
    const autoRel = auto.getAttribute('rel') ?? '';
    expect(autoRel).toContain('noopener');
    expect(autoRel).toContain('noreferrer');
  });

  it('Badge 3종(done/wip/planned) 라벨이 App 전체에 모두 렌더된다', () => {
    // Phase 5: FeaturesSection 이 done/wip/planned 카드를 렌더하고,
    // roadmap 데모 섹션도 standalone Badge 3종을 유지.
    // 데모 Badge 가 i18n 전환되었으므로 기본 ko 상태의 t() 값으로 검증.
    render(<App />);
    expect(screen.getAllByText('구현됨').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('보강 중').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('계획·검토 중').length).toBeGreaterThanOrEqual(1);
  });

  it('roadmap 데모 섹션의 standalone Badge 가 3개 존재한다', () => {
    // Phase 5 전환 (리뷰 피드백 반영 Medium): 이전 "FeatureCard 2 케이스" 와
    // "BusinessSection 프리뷰" 테스트는 데모 `<Section id="features">` 내부의
    // 2개 FeatureCard 를 검증하고 있었으나, Phase 5 GREEN 에서 이 데모 섹션이
    // 삭제되고 실제 FeaturesSection 으로 대체된다. 기존 테스트의 scope
    // (section#features 내부 article 2개, badge 1개, BusinessSection 프리뷰) 가
    // 모두 무효화된다.
    //
    // 수정:
    //   - "FeatureCard 2 케이스" / "BusinessSection 프리뷰" 테스트 삭제
    //   - FeaturesSection 내부 가드(9 article + 9 badge) 는 Phase 5 구조 가드
    //     describe 블록에서 별도 검증 (위 Phase 5 가드 참조)
    //   - roadmap 데모 섹션의 3 standalone Badge 만 독립적으로 유지
    //
    // BusinessSection Badge 부재 가드는 Phase 8 에서 실제 구현 시 재도입.
    const { container } = render(<App />);
    const roadmapSection = container.querySelector('section#roadmap');
    expect(roadmapSection).not.toBeNull();
    const roadmapBadges = roadmapSection?.querySelectorAll('[data-testid="status-badge"]') ?? [];
    expect(roadmapBadges.length).toBe(3);
  });
});

// ─────────────────────────────────────────────────────────────
// Phase 4 구조 가드 (TEST-P4.10 + P4.11 + 데모 h2 다운그레이드)
// ─────────────────────────────────────────────────────────────
//
// NAV_ANCHORS 4개 ID 유지 (TEST-P4.9) 는 이미 위 describe 블록의 기존 가드가 커버하므로
// Phase 4 에서는 중복 추가하지 않는다.
//
// 본 describe 의 가드는 Phase 4 GREEN 완료 후 전부 PASS 여야 한다. RED 시점의
// 기대 상태 (현재 vs Phase 4 이후) 는 각 테스트 주석에 명시.
describe('Phase 4 구조 가드 — HeroSection + ProblemSection 추가', () => {
  it('HeroSection 이 data-testid="hero-section" 으로 App 에 직접 렌더된다 (TEST-P4.10)', () => {
    // 리뷰 피드백 반영 (High): 이전 버전은 `h1.length === 1` 만 검사해서
    // 데모 첫 Section 의 기존 h1 덕분에 HeroSection 이 없어도 **우연히 PASS**
    // 상태였다. HeroSection 이 실제로 App 트리에 삽입되었는지 직접 확인할 수
    // 없는 간접 가드였던 셈.
    //
    // 수정: HeroSection.test.tsx 에서 정의한 공개 계약
    //   `<section data-testid="hero-section">` 을 App 루트에서 직접 찾아
    //   확실히 렌더되는지 검증한다. RED 시점엔 HeroSection 자체가 없으므로 FAIL.
    //
    // Phase 4 GREEN 이후 기대 상태:
    //   App.tsx 가 <HeroSection /> 을 Header 직후 삽입 + HeroSection 구현이
    //   data-testid="hero-section" 을 Section 루트에 부여 → PASS.
    const { container } = render(<App />);
    const hero = container.querySelector('[data-testid="hero-section"]');
    expect(hero, 'HeroSection data-testid 가 App 루트에 없음 — 섹션 미삽입').not.toBeNull();
    expect(hero?.tagName).toBe('SECTION');
  });

  it('App 루트의 <h1> 이 정확히 1개 존재한다 (h1 유일성 가드)', () => {
    // 보조 가드: HeroSection 의 h1 이 페이지 내 유일한 h1 인지 확인.
    //
    // 이 가드는 TEST-P4.10 의 data-testid 확인과 함께 작동한다:
    //   (1) hero-section 존재 ← 섹션 삽입 검증
    //   (2) h1 = 1 ← h1 유일성 검증
    // 두 가드가 따로 작동하므로 RED 시점 우연한 PASS 문제는 해결됨.
    //
    // Phase 4 GREEN 이후: HeroSection h1 유일 + 데모 첫 Section 은 h2 다운그레이드 → PASS.
    const { container } = render(<App />);
    const h1s = container.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
  });

  it('ProblemSection 이 data-testid="problem-section" 으로 App 에 직접 렌더된다 (TEST-P4.11)', () => {
    // 리뷰 피드백 반영 (Medium): 이전 버전은 전역 `article.length >= 6` 만 검사해
    // ProblemSection 이 아닌 다른 섹션이 article 을 추가해도 통과하는 간접 가드였다.
    // data-testid 공개 계약으로 ProblemSection 자체의 존재를 직접 검증.
    //
    // Phase 4 GREEN 이후 기대 상태:
    //   App.tsx 가 <ProblemSection /> 을 HeroSection 직후 삽입 + ProblemSection
    //   구현이 data-testid="problem-section" 을 Section 루트에 부여 → PASS.
    const { container } = render(<App />);
    const problem = container.querySelector('[data-testid="problem-section"]');
    expect(problem, 'ProblemSection data-testid 가 App 루트에 없음 — 섹션 미삽입').not.toBeNull();
    expect(problem?.tagName).toBe('SECTION');
  });

  it('ProblemSection 내부에 정확히 4개의 article 이 존재한다 (4 카드 가드)', () => {
    // 리뷰 피드백 반영 (Medium): 전역 `allArticles.length >= 6` 간접 가드 대체.
    // ProblemSection scope 내부에서만 article 을 세어 "문제 카드 4개" 계약을 직접 검증.
    //
    // Phase 4 GREEN 이후 기대 상태:
    //   FeatureCard 데모 2 (section#features scope) + ProblemSection 4 (problem-section
    //   scope) = 두 scope 가 독립적으로 검증됨 → PASS.
    const { container } = render(<App />);
    const problem = container.querySelector('[data-testid="problem-section"]');
    expect(problem).not.toBeNull();
    const problemArticles = problem?.querySelectorAll('article') ?? [];
    expect(problemArticles.length).toBe(4);
  });

  it('데모 Design System 섹션의 h2 가 렌더된다 (h1 아닌 h2 — Phase 4 다운그레이드)', () => {
    // Phase 5 리뷰 반영: 데모 헤딩이 i18n 전환되었으므로 ko t() 값으로 검색.
    render(<App />);
    const demoHeading = screen.getByText(/디자인 시스템 데모/);
    expect(demoHeading.tagName).toBe('H2');
  });
});

// ─────────────────────────────────────────────────────────────
// Phase 5 구조 가드 (TEST-P5.10 + P5.11 + P5.12)
// ─────────────────────────────────────────────────────────────
//
// Phase 5 의 핵심 전환: 데모 `<Section id="features" background="accent-soft">`
// 를 삭제하고 실제 `<FeaturesSection />` (id="features", background="surface") 으로
// 대체한다. SolutionSection 도 Problem 뒤에 추가.
//
// 본 describe 의 가드는 Phase 5 GREEN 완료 후 전부 PASS 여야 한다. RED 시점엔
// Solution/Features 컴포넌트 자체가 없으므로 App 에 삽입도 안 된 상태 → FAIL.
describe('Phase 5 구조 가드 — SolutionSection + FeaturesSection 추가', () => {
  it('SolutionSection 이 data-testid="solution-section" 으로 App 에 렌더된다 (TEST-P5.10)', () => {
    // Phase 5 GREEN 이후 기대 상태:
    //   App.tsx 가 <SolutionSection /> 을 ProblemSection 직후 삽입 +
    //   구현 컴포넌트가 data-testid="solution-section" 부여 → PASS.
    const { container } = render(<App />);
    const solution = container.querySelector('[data-testid="solution-section"]');
    expect(solution, 'SolutionSection data-testid 가 App 에 없음 — 섹션 미삽입').not.toBeNull();
    expect(solution?.tagName).toBe('SECTION');
  });

  it('FeaturesSection 이 data-testid="features-section" 으로 App 에 렌더된다 (TEST-P5.11)', () => {
    // Phase 5 GREEN 이후: 데모 `<Section id="features">` 삭제 → `<FeaturesSection />` 대체.
    const { container } = render(<App />);
    const features = container.querySelector('[data-testid="features-section"]');
    expect(features, 'FeaturesSection data-testid 가 App 에 없음 — 섹션 미삽입').not.toBeNull();
    expect(features?.tagName).toBe('SECTION');
  });

  it('FeaturesSection scope 내부에 정확히 9개 article + 9개 status badge 가 존재한다', () => {
    // 데모 features 섹션은 FeatureCard 2개 + badge 1개였다.
    // Phase 5 실제 FeaturesSection 은 9 카드 × badge = 9 badge.
    const { container } = render(<App />);
    const features = container.querySelector('[data-testid="features-section"]');
    expect(features).not.toBeNull();
    const articles = features?.querySelectorAll('article') ?? [];
    expect(articles.length).toBe(9);
    const badges = features?.querySelectorAll('[data-testid="status-badge"]') ?? [];
    expect(badges.length).toBe(9);
  });

  it('SolutionSection scope 내부에 정확히 3개 article 이 존재한다', () => {
    const { container } = render(<App />);
    const solution = container.querySelector('[data-testid="solution-section"]');
    expect(solution).not.toBeNull();
    const articles = solution?.querySelectorAll('article') ?? [];
    expect(articles.length).toBe(3);
  });

  it('섹션 렌더 순서가 Hero → Problem → Solution → Features 이다 (TEST-P5.12)', () => {
    // 리뷰 피드백 반영 (High): 이전 버전은 data-testid 존재와 내부 카드 수만
    // 확인해서, 순서가 바뀌어도 통과할 수 있었다. data-testid 를 가진 모든
    // section 을 DOM 등장 순서대로 수집해 Phase 5 시점의 정확한 순서를 강제.
    const { container } = render(<App />);
    const allTestIds = Array.from(container.querySelectorAll('section[data-testid]'))
      .map((s) => s.getAttribute('data-testid'))
      .filter(Boolean);
    expect(allTestIds).toEqual([
      'hero-section',
      'problem-section',
      'solution-section',
      'features-section',
    ]);
  });
});
