/**
 * Phase 3 RED — Header 레이아웃 컴포넌트
 * 대응 체크: TEST-P3.4 · TEST-P3.5
 *
 * Header 책임:
 *   1. 루트 태그는 `<header>`, sticky (또는 fixed) 포지셔닝으로 스크롤 고정
 *   2. 좌측 로고/제품명 + 중앙 4개 네비 + 우측 LanguageSwitcher + Primary CTA
 *   3. 네비 4개: #features / #scenarios / #differentiation / #roadmap
 *      — 라벨은 i18n.t('header.nav.*') 로 렌더
 *   4. Primary CTA 는 공통 `Button` 을 재사용하고 `CHROME_WEB_STORE_URL` 을 href 로
 *      — Phase 2 §14.2.4 의 자동 external 감지로 target/rel 자동 부여
 *
 * 설계 계약 (향후 Phase 가 의존):
 *   - 4개 앵커 href 집합이 정확해야 Header 네비에서 각 섹션으로 점프 가능
 *   - Primary CTA href 가 CHROME_WEB_STORE_URL 이어야 브랜드 CTA 일관성 유지
 *   - 외부 링크 보안 속성(noopener + noreferrer)은 Button 자동 감지에 의존
 *     또는 명시적 external prop — 둘 다 결과는 동일하므로 검증도 결과 기반
 *
 * RED 기대 동작:
 *   `./Header` 모듈 + `../../i18n` 모듈 + `../../lib/constants` 모듈이 모두
 *   존재하지 않으므로 Vitest 가 "Failed to resolve import" 로 본 파일 전체를
 *   FAIL 처리해야 한다.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import '../../i18n';
import { CHROME_WEB_STORE_URL } from '../../lib/constants';

describe('Header 공통 레이아웃 (TEST-P3.4 + TEST-P3.5)', () => {
  // ─────────────────────────────────────────────────────────
  // TEST-P3.4 — 4개 네비 링크 렌더
  // ─────────────────────────────────────────────────────────
  describe('TEST-P3.4 — 4개 네비 링크', () => {
    it('nav 영역에 features/scenarios/differentiation/roadmap 4개 앵커가 존재한다', () => {
      render(<Header />);
      // i18n 라벨은 언어에 따라 바뀌므로 **href 집합** 으로 안정적으로 검증.
      // 컨테이너가 아닌 nav role 안에서만 찾아야 Primary CTA(외부 URL) 와
      // 섞이지 않는다.
      const nav = screen.getByRole('navigation');
      const anchors = Array.from(nav.querySelectorAll('a[href^="#"]'));
      const hrefs = anchors.map((a) => a.getAttribute('href'));
      expect(hrefs).toEqual(
        expect.arrayContaining(['#features', '#scenarios', '#differentiation', '#roadmap'])
      );
      expect(anchors.length).toBe(4);
    });

    it('nav 앵커 4개가 모두 i18n 라벨을 렌더한다 (빈 텍스트 금지)', () => {
      render(<Header />);
      const nav = screen.getByRole('navigation');
      const anchors = Array.from(nav.querySelectorAll('a[href^="#"]'));
      for (const a of anchors) {
        const label = a.textContent?.trim() ?? '';
        expect(label.length).toBeGreaterThan(0);
      }
    });

    it('nav 앵커의 순서가 features → scenarios → differentiation → roadmap 이다', () => {
      // 시각 순서 = 사용자 인지 순서. 설계 문서 01_landing_page_plan.md 의
      // 섹션 순서를 따라야 하므로 명시적으로 pinning.
      render(<Header />);
      const nav = screen.getByRole('navigation');
      const hrefs = Array.from(nav.querySelectorAll('a[href^="#"]')).map((a) =>
        a.getAttribute('href')
      );
      expect(hrefs).toEqual(['#features', '#scenarios', '#differentiation', '#roadmap']);
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P3.5 — Primary CTA
  // ─────────────────────────────────────────────────────────
  describe('TEST-P3.5 — Primary CTA (Chrome Web Store)', () => {
    it('Primary CTA 가 CHROME_WEB_STORE_URL 을 href 로 갖는다', () => {
      render(<Header />);
      const cta = screen
        .getAllByRole('link')
        .find((el) => el.getAttribute('href') === CHROME_WEB_STORE_URL);
      expect(cta).toBeDefined();
    });

    it('Primary CTA 는 외부 링크 보안 속성을 갖는다 (target + noopener + noreferrer)', () => {
      // Phase 2 §14.2.4 의 Button 자동 external 감지에 의존 또는 명시적 external.
      // 어느 방식을 쓰든 결과는 동일해야 한다.
      render(<Header />);
      const cta = screen
        .getAllByRole('link')
        .find((el) => el.getAttribute('href') === CHROME_WEB_STORE_URL);
      expect(cta).toBeDefined();
      expect(cta).toHaveAttribute('target', '_blank');
      const rel = cta?.getAttribute('rel') ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });

    it('Primary CTA 는 내부 앵커 네비와 구분된 별도 요소이다 (nav 외부)', () => {
      // CTA 가 실수로 <nav> 내부에 들어가면 "네비 링크" 로 오인될 수 있다.
      // Header 의 구조상 CTA 는 nav 옆 영역에 있어야 함.
      render(<Header />);
      const nav = screen.getByRole('navigation');
      const ctaInsideNav = Array.from(nav.querySelectorAll('a')).find(
        (a) => a.getAttribute('href') === CHROME_WEB_STORE_URL
      );
      expect(ctaInsideNav).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────
  // 구조 계약 — 루트 태그 + sticky 포지셔닝
  // ─────────────────────────────────────────────────────────
  describe('구조 계약', () => {
    it('루트 요소가 <header> 태그이다', () => {
      const { container } = render(<Header />);
      const root = container.firstElementChild;
      expect(root?.tagName).toBe('HEADER');
    });

    it('루트에 sticky 또는 fixed 포지셔닝 클래스가 적용되어 있다', () => {
      // 스크롤 시 상단 고정 — sticky top-0 또는 fixed top-0 중 하나.
      // 이 계약이 없으면 사용자 스크롤 중 CTA 접근성이 떨어진다.
      const { container } = render(<Header />);
      const root = container.firstElementChild;
      expect(root?.className).toMatch(/\b(sticky|fixed)\b/);
    });

    it('정확히 하나의 <nav> 랜드마크를 포함한다', () => {
      // 단일 nav = 단일 primary navigation. 접근성 가이드라인.
      const { container } = render(<Header />);
      expect(container.querySelectorAll('nav').length).toBe(1);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 레이아웃 계약 — 로고/제품명 + LanguageSwitcher 포함
  // ─────────────────────────────────────────────────────────
  describe('레이아웃 계약 — 좌측 로고 + 우측 LanguageSwitcher', () => {
    // 리뷰 피드백 반영 (Medium): 기존 테스트는 nav 와 CTA 만 검증하여
    // Header 에서 LanguageSwitcher 가 완전히 빠져도 통과했다. phase03 §3.3
    // TASK-007 이 요구하는 "좌측 로고/제품명 + 우측 LanguageSwitcher + CTA"
    // 중 두 요소가 검증 밖에 있었음. 아래 describe 로 통합 가드 추가.

    it('제품명 "Web AI Assistant" 텍스트가 Header 내부에 렌더된다', () => {
      // 로고 이미지 대신 텍스트로 제품명을 노출 (1차는 디자인 최소화).
      // 이미지 + alt 로 구현해도 `getByText` 대신 `getByAltText` 로 전환하면 됨.
      // 두 경로 모두 허용하려면 text 기반 검색.
      const { container } = render(<Header />);
      const text = container.textContent ?? '';
      expect(text).toMatch(/Web AI Assistant/i);
    });

    it('LanguageSwitcher 가 Header 내부에 렌더된다 (data-testid 계약 의존)', () => {
      // LanguageSwitcher.test.tsx §공개 계약 — data-testid 와 동일한 selector.
      // 두 테스트가 같은 testid 를 공유하므로 LanguageSwitcher 가 Header 에서
      // 누락되면 본 테스트가 즉시 FAIL.
      const { container } = render(<Header />);
      const switcher = container.querySelector('[data-testid="language-switcher"]');
      expect(switcher).not.toBeNull();
    });

    it('LanguageSwitcher 내부의 ko / en 토글 버튼이 Header 에서 접근 가능하다', () => {
      // LanguageSwitcher 를 Header 에 import 하지 않고 빈 div 만 testid 로
      // 위장하는 회귀를 방지. 실제 ko/en 토글이 DOM 에 있는지 확인.
      const { container } = render(<Header />);
      expect(container.querySelector('[data-testid="lang-toggle-ko"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="lang-toggle-en"]')).not.toBeNull();
    });

    it('LanguageSwitcher 가 <nav> 외부에 위치한다 (레이아웃 분리)', () => {
      // Header 구조: [로고] [nav 4링크] [LanguageSwitcher + CTA]
      // LanguageSwitcher 가 실수로 nav 안에 들어가면 네비 링크로 오인됨.
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav).not.toBeNull();
      const switcherInsideNav = nav?.querySelector('[data-testid="language-switcher"]');
      expect(switcherInsideNav).toBeNull();
    });
  });
});
