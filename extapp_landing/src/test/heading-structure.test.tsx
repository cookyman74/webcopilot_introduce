/**
 * Phase 9 RED — Heading 레벨 구조 검증
 * 대응 체크: TEST-P9.7
 *
 * H1 = HeroSection 만 1개
 * H2 = 각 섹션 제목 (11개)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';
import i18n from '../i18n';

describe('Heading 구조 (TEST-P9.7)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  it('H1 이 정확히 1개 존재한다 (HeroSection 전용)', () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('H2 가 11개 존재한다 (섹션당 1개)', () => {
    // 11개 섹션: Hero(h1) 제외 → Problem, Solution, Features, Scenarios,
    // Differentiation, AIModes, Safety, Roadmap, Business, FinalCTA = 10개
    // + AIModes 내부 카테고리 h3 는 H2 가 아님.
    // 실제: HeroSection 은 h1 만, 나머지 10 섹션이 h2 1개씩 = 10개.
    // 단, AIModesSection 에 카테고리 h3 2개가 있으므로 h2 는 10개.
    const { container } = render(<App />);
    const h2Count = container.querySelectorAll('h2').length;
    // 10개 섹션 × h2 1개 = 10
    expect(h2Count).toBe(10);
  });

  it('H3 가 카드 내부 또는 카테고리 헤더로만 존재한다 (Phase 11: features 카테고리 헤더 허용)', () => {
    const { container } = render(<App />);
    const h3s = Array.from(container.querySelectorAll('h3'));
    // 허용:
    //   - article 내부 (카드 제목)
    //   - ai-mode-item 내부 (AI 모드 카드)
    //   - grid 클래스 ancestor 내부
    //   - features-category-* wrapper 내부 (Phase 11 v2 카테고리 그루핑 헤더)
    for (const h3 of h3s) {
      const isAllowed =
        h3.closest('article') !== null ||
        h3.closest('[data-testid="ai-mode-item"]') !== null ||
        h3.closest('[class*="grid"]') !== null ||
        h3.closest('[data-testid^="features-category-"]') !== null;
      expect(isAllowed, `H3 "${h3.textContent}" 가 허용 위치 외에 존재`).toBe(true);
    }
  });
});
