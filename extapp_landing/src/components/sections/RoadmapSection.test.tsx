/**
 * Phase 8 RED — RoadmapSection 컴포넌트
 * 대응 체크: TEST-P8.1~P8.3 · TEST-P8.14
 *
 * RoadmapSection 책임:
 *   1. id="roadmap" + 3개 로드맵 카드 (FeatureCard + wip/planned 배지)
 *   2. done 배지 절대 금지 — 로드맵은 "미래 방향" 이므로
 *   3. data-testid="roadmap-section"
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoadmapSection } from './RoadmapSection';
import i18n from '../../i18n';

describe('RoadmapSection (TEST-P8.1~P8.3 + P8.14)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  describe('TEST-P8.1 — 3개 로드맵 카드', () => {
    it('정확히 3개의 <article> 을 렌더한다', () => {
      const { container } = render(<RoadmapSection />);
      expect(container.querySelectorAll('article').length).toBe(3);
    });
  });

  describe('TEST-P8.3 — done 배지 금지', () => {
    it('done(구현됨) 배지가 단 하나도 존재하지 않는다', () => {
      render(<RoadmapSection />);
      const doneTexts = [i18n.t('features.status.done'), '구현됨', 'Implemented', 'Supported'];
      for (const text of doneTexts) {
        expect(screen.queryAllByText(text).length).toBe(0);
      }
    });

    it('모든 배지가 wip 또는 planned 이다', () => {
      const { container } = render(<RoadmapSection />);
      const badges = Array.from(container.querySelectorAll('[data-testid="status-badge"]'));
      expect(badges.length).toBe(3);
      const wipText = i18n.t('features.status.wip');
      const plannedText = i18n.t('features.status.planned');
      for (const badge of badges) {
        const text = badge.textContent?.trim() ?? '';
        expect(
          text === wipText || text === plannedText,
          `배지 "${text}" 이 wip("${wipText}") 또는 planned("${plannedText}") 가 아님`
        ).toBe(true);
      }
    });
  });

  describe('TEST-P8.1 카드 정체성', () => {
    it('3개 로드맵 제목이 각각 정확히 1회씩 렌더된다', () => {
      const { container } = render(<RoadmapSection />);
      const keys = ['floating', 'continuity', 'studio'];
      const titles = Array.from(container.querySelectorAll('article h3')).map(
        (el) => el.textContent?.trim() ?? ''
      );
      expect(titles.length).toBe(3);
      for (const key of keys) {
        const expected = i18n.t(`roadmap.items.${key}.title`);
        expect(titles.filter((t) => t === expected).length).toBe(1);
      }
    });
  });

  describe('구조 계약', () => {
    it('id="roadmap" 이 <section> 에 부여된다 (TEST-P8.2)', () => {
      const { container } = render(<RoadmapSection />);
      expect(container.querySelector('section#roadmap')).not.toBeNull();
    });

    it('data-testid="roadmap-section" (TEST-P8.14)', () => {
      const { container } = render(<RoadmapSection />);
      expect(container.querySelector('section')?.getAttribute('data-testid')).toBe(
        'roadmap-section'
      );
    });

    it('h2 제목이 1개 렌더된다', () => {
      const { container } = render(<RoadmapSection />);
      expect(container.querySelectorAll('h2').length).toBe(1);
    });

    it('h1 은 존재하지 않는다', () => {
      const { container } = render(<RoadmapSection />);
      expect(container.querySelectorAll('h1').length).toBe(0);
    });

    it('aria-labelledby 가 실제 h2 를 가리킨다', () => {
      const { container } = render(<RoadmapSection />);
      const section = container.querySelector('section');
      const lb = section?.getAttribute('aria-labelledby');
      if (lb) {
        const target = container.querySelector(`#${lb}`);
        expect(target?.tagName).toBe('H2');
      }
    });
  });

  describe('언어 전환', () => {
    it('ko → en 전환 시 h2 가 달라진다', async () => {
      const { rerender } = render(<RoadmapSection />);
      const koH2 = screen.getByRole('heading', { level: 2 }).textContent;
      await i18n.changeLanguage('en');
      rerender(<RoadmapSection />);
      expect(screen.getByRole('heading', { level: 2 }).textContent).not.toBe(koH2);
    });
  });
});
