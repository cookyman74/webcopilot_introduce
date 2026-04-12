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
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { NAV_ANCHORS } from './lib/constants';

describe('App demo page (Phase 2 공통 컴포넌트 종합 검증)', () => {
  it('Section 4종 배경이 모두 고유하게 렌더된다 (canvas/surface/surface-alt/accent-soft)', () => {
    // v2: 리뷰 피드백 반영 — 이전 버전은 sections.length >= 4 만 검사해서
    // 모든 섹션이 같은 배경으로 회귀해도 통과했다. 각 배경 클래스의 **실제
    // 존재** 를 개별 검증하여 배경 회귀를 차단한다.
    const { container } = render(<App />);
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThanOrEqual(4);

    const allClassNames = Array.from(sections).map((s) => s.className);
    const combined = allClassNames.join(' ');

    // 4종 배경 클래스가 각각 1개 이상 존재해야 함
    expect(combined).toMatch(/\bbg-canvas\b/);
    expect(combined).toMatch(/\bbg-surface\b/);
    expect(combined).toMatch(/\bbg-surface-alt\b/);
    expect(combined).toMatch(/\bbg-accent-soft\b/);

    // 중복 배경 회귀 방지: 각 섹션에서 bg-* 클래스를 추출해 고유값 4개 이상
    const uniqueBgs = new Set(
      allClassNames
        .map((c) => c.match(/\bbg-[a-z-]+\b/)?.[0])
        .filter((c): c is string => Boolean(c))
    );
    expect(uniqueBgs.size).toBeGreaterThanOrEqual(4);
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

  it('Badge 3종(done/wip/planned) 라벨이 standalone 섹션에 모두 렌더된다', () => {
    // 데모 페이지에는 standalone Badge 3개 + FeatureCard(with status) 내부
    // Badge 1개 = 총 4개가 존재한다. 총 개수 검증은 아래 "FeatureCard 2 케이스"
    // 테스트에서 수행하고, 여기서는 3종 라벨이 모두 렌더됨을 확인한다.
    render(<App />);
    // "구현됨" 은 Badge 섹션과 FeatureCard 양쪽에 등장하므로 getAllByText 로
    // 최소 1개 이상 존재를 확인.
    expect(screen.getAllByText('구현됨').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('보강 중')).toBeInTheDocument();
    expect(screen.getByText('계획·검토 중')).toBeInTheDocument();
  });

  it('FeatureCard 2 케이스: 배지 포함 1개 + 배지 없음 1개 (BusinessSection 프리뷰)', () => {
    const { container } = render(<App />);
    // Phase 4+ 대비 scope 격리: ProblemSection(4 article) · Features/Roadmap 등이
    // 추가되면 글로벌 article 카운트가 바뀌므로 features 섹션 내부로 한정.
    // 이렇게 하면 Phase 4 이후에도 이 가드는 정확히 FeatureCard 2 케이스만 검증.
    const featureSection = container.querySelector('section#features');
    expect(featureSection).not.toBeNull();
    const articles = featureSection?.querySelectorAll('article') ?? [];
    expect(articles.length).toBe(2);

    // 리뷰 피드백 반영 (Low): 이전 버전은 `container.querySelectorAll(...) === 4`
    // 로 전체 문서 범위의 배지 총 카운트를 검사해, Phase 5 FeaturesSection 이
    // 실제 Feature Card 배지 여러 개를 추가하면 unrelated failure 가 나는
    // 구조였다. 수정: 배지를 **섹션 scope 로 분리** 해 각 섹션이 독립적으로
    // 검증되도록 한다.
    //
    //   (a) features 섹션 내부 → 정확히 1개 (첫 번째 FeatureCard with status)
    //   (b) roadmap 섹션 내부 → 정확히 3개 (standalone Badge 데모)
    //
    // Phase 5 FeaturesSection 이 features 섹션을 실제 콘텐츠로 교체하면 (a) 만
    // 조정하면 되고, roadmap 섹션의 (b) 는 Phase 6+ 까지 안정적으로 유지된다.
    const featureSectionBadges =
      featureSection?.querySelectorAll('[data-testid="status-badge"]') ?? [];
    expect(featureSectionBadges.length).toBe(1);

    const roadmapSection = container.querySelector('section#roadmap');
    expect(roadmapSection).not.toBeNull();
    const roadmapBadges = roadmapSection?.querySelectorAll('[data-testid="status-badge"]') ?? [];
    expect(roadmapBadges.length).toBe(3);
  });

  it('BusinessSection 프리뷰 카드가 상태 배지 관련 텍스트를 포함하지 않는다', () => {
    // 데모 페이지의 두 번째 FeatureCard 는 status 없이 렌더되어야 하며,
    // 그 article 내부에는 status-badge testid 가 없어야 한다 (Phase 8
    // TEST-P8.9 의 선행 가드).
    //
    // Phase 4+ 대비 scope 격리: section#features 내부에서만 찾아 ProblemSection
    // 등 다른 article 에 영향받지 않도록 함.
    const { container } = render(<App />);
    const featureSection = container.querySelector('section#features');
    expect(featureSection).not.toBeNull();
    const articles = Array.from(featureSection?.querySelectorAll('article') ?? []);
    const previewArticle = articles.find((a) => a.textContent?.includes('페이지 문맥 기반 AI'));
    expect(previewArticle).toBeTruthy();
    expect(previewArticle?.querySelectorAll('[data-testid="status-badge"]').length).toBe(0);
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

  it('데모 첫 Section 의 "Design System Demo" 텍스트가 <h2> 로 렌더된다', () => {
    // Phase 4 TASK-004 의 h1 → h2 다운그레이드 정책을 런타임으로 검증.
    //
    // RED 시점 (Phase 4 GREEN 전):
    //   데모 첫 Section 이 아직 <h1> 을 사용 중 → getByText 로 찾은 요소의 tagName
    //   이 "H1" → expect(...).toBe('H2') 가 **FAIL**.
    //
    // Phase 4 GREEN 이후 기대 상태:
    //   데모 첫 Section 이 <h2> 로 다운그레이드 → PASS.
    //
    // 이 테스트가 GREEN 후 PASS 하려면 반드시 데모 h1→h2 변경이 App.tsx 에 반영되어야 함.
    render(<App />);
    const demoHeading = screen.getByText(/Design System Demo/);
    expect(demoHeading.tagName).toBe('H2');
  });
});
