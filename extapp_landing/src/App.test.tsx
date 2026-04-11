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
    const articles = container.querySelectorAll('article');
    expect(articles.length).toBe(2);

    // 데모 페이지에는 전체 Badge 3개(status section) + FeatureCard 내부 1개
    // = 총 4개 Badge 가 존재한다. FeatureCard without status 가 Badge 를
    // 추가로 렌더했다면 이 카운트가 5 이상이 된다.
    const badges = container.querySelectorAll('[data-testid="status-badge"]');
    expect(badges.length).toBe(4);
  });

  it('BusinessSection 프리뷰 카드가 상태 배지 관련 텍스트를 포함하지 않는다', () => {
    // 데모 페이지의 두 번째 FeatureCard 는 status 없이 렌더되어야 하며,
    // 그 article 내부에는 status-badge testid 가 없어야 한다 (Phase 8
    // TEST-P8.9 의 선행 가드).
    const { container } = render(<App />);
    const articles = Array.from(container.querySelectorAll('article'));
    const previewArticle = articles.find((a) => a.textContent?.includes('페이지 문맥 기반 AI'));
    expect(previewArticle).toBeTruthy();
    expect(previewArticle?.querySelectorAll('[data-testid="status-badge"]').length).toBe(0);
  });
});
