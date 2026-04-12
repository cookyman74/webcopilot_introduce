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

  it('H3 가 카드 내부에만 존재한다 (섹션 제목으로 사용되지 않음)', () => {
    const { container } = render(<App />);
    const h3s = Array.from(container.querySelectorAll('h3'));
    // 모든 H3 는 article 또는 ai-mode-item 내부에 있어야 함
    for (const h3 of h3s) {
      const isInsideCard =
        h3.closest('article') !== null ||
        h3.closest('[data-testid="ai-mode-item"]') !== null ||
        h3.closest('[class*="grid"]') !== null;
      expect(isInsideCard, `H3 "${h3.textContent}" 가 카드 외부에 위치`).toBe(true);
    }
  });
});
