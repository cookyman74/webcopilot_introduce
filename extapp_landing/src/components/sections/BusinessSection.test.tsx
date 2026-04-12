/**
 * Phase 8 RED — BusinessSection 컴포넌트 (v2 신규)
 * 대응 체크: TEST-P8.7~P8.12 · TEST-P8.14
 *
 * BusinessSection 핵심 제약:
 *   - Badge(status-badge) 가 단 하나도 렌더되면 안 됨 (기술 재사용 제안)
 *   - "구현됨"/"보강 중"/"계획" 텍스트 부재 (기능 카피 혼동 방지)
 *   - Primary CTA = mailto:PARTNERSHIP_CONTACT
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BusinessSection } from './BusinessSection';
import i18n from '../../i18n';
import { PARTNERSHIP_CONTACT } from '../../lib/constants';

describe('BusinessSection (TEST-P8.7~P8.12 + P8.14)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  describe('TEST-P8.7 — 3개 가치 카드', () => {
    it('정확히 3개의 <article> 을 렌더한다', () => {
      const { container } = render(<BusinessSection />);
      expect(container.querySelectorAll('article').length).toBe(3);
    });

    it('3개 카드 정체성이 i18n 키와 일치한다', () => {
      const { container } = render(<BusinessSection />);
      const keys = ['context', 'actionTools', 'scripts'];
      const titles = Array.from(container.querySelectorAll('article h3')).map(
        (el) => el.textContent?.trim() ?? ''
      );
      expect(titles.length).toBe(3);
      for (const key of keys) {
        const expected = i18n.t(`business.cards.${key}.title`);
        expect(titles.filter((t) => t === expected).length).toBe(1);
      }
    });
  });

  describe('TEST-P8.9 — Badge 완전 금지', () => {
    it('status-badge 가 단 하나도 렌더되지 않는다', () => {
      const { container } = render(<BusinessSection />);
      expect(container.querySelectorAll('[data-testid="status-badge"]').length).toBe(0);
    });
  });

  describe('TEST-P8.12 — 기능 상태 카피 혼동 방지', () => {
    it('ko 문구에 구현 상태 텍스트가 포함되지 않는다', () => {
      const { container } = render(<BusinessSection />);
      const text = container.textContent ?? '';
      expect(text).not.toMatch(/구현됨/);
      expect(text).not.toMatch(/보강 중/);
      expect(text).not.toMatch(/계획·검토 중/);
    });

    it('en 문구에 구현 상태 텍스트가 포함되지 않는다', async () => {
      await i18n.changeLanguage('en');
      const { container } = render(<BusinessSection />);
      const text = (container.textContent ?? '').toLowerCase();
      expect(text).not.toMatch(/implemented/);
      expect(text).not.toMatch(/in progress/);
      expect(text).not.toMatch(/planned/);
      expect(text).not.toMatch(/under review/);
    });
  });

  describe('TEST-P8.10 — CTA', () => {
    it('Primary CTA 가 mailto:PARTNERSHIP_CONTACT 를 href 로 갖는다', () => {
      const { container } = render(<BusinessSection />);
      const mailto = Array.from(container.querySelectorAll('a'))
        .map((a) => a.getAttribute('href') ?? '')
        .find((href) => href.startsWith('mailto:'));
      expect(mailto).toBe(`mailto:${PARTNERSHIP_CONTACT}`);
    });

    it('Eyebrow 라벨이 존재한다', () => {
      render(<BusinessSection />);
      const eyebrow = i18n.t('business.eyebrow');
      expect(screen.getByText(eyebrow)).toBeInTheDocument();
    });
  });

  describe('구조 계약', () => {
    it('id="business" 이 <section> 에 부여된다 (TEST-P8.8)', () => {
      const { container } = render(<BusinessSection />);
      expect(container.querySelector('section#business')).not.toBeNull();
    });

    it('data-testid="business-section" (TEST-P8.14)', () => {
      const { container } = render(<BusinessSection />);
      expect(container.querySelector('section')?.getAttribute('data-testid')).toBe(
        'business-section'
      );
    });

    it('h2 제목이 1개 렌더된다', () => {
      const { container } = render(<BusinessSection />);
      expect(container.querySelectorAll('h2').length).toBe(1);
    });

    it('h1 은 존재하지 않는다', () => {
      const { container } = render(<BusinessSection />);
      expect(container.querySelectorAll('h1').length).toBe(0);
    });
  });

  describe('언어 전환', () => {
    it('ko → en 전환 시 h2 가 달라진다', async () => {
      const { rerender } = render(<BusinessSection />);
      const koH2 = screen.getByRole('heading', { level: 2 }).textContent;
      await i18n.changeLanguage('en');
      rerender(<BusinessSection />);
      expect(screen.getByRole('heading', { level: 2 }).textContent).not.toBe(koH2);
    });
  });
});
