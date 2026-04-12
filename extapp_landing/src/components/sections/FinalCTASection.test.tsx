/**
 * Phase 8 RED — FinalCTASection 컴포넌트
 * 대응 체크: TEST-P8.4 · TEST-P8.5 · TEST-P8.13 · TEST-P8.14 · TEST-P8.16
 *
 * FinalCTASection 핵심 제약:
 *   - Primary CTA = CHROME_WEB_STORE_URL (일반 사용자 설치 전용)
 *   - mailto / 파트너십 / 문의 문구 금지 (BusinessSection 과 분리)
 *   - background="accent-soft" → 배경 4종 복구
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FinalCTASection } from './FinalCTASection';
import i18n from '../../i18n';
import { CHROME_WEB_STORE_URL } from '../../lib/constants';

describe('FinalCTASection (TEST-P8.4/P8.5/P8.13/P8.14/P8.16)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  describe('TEST-P8.4 — H2 + CTA 렌더', () => {
    it('h2 제목이 렌더된다', () => {
      render(<FinalCTASection />);
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    });

    it('Primary CTA 링크가 존재한다', () => {
      render(<FinalCTASection />);
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('TEST-P8.5 — Primary CTA = Chrome Web Store', () => {
    it('Primary CTA 가 CHROME_WEB_STORE_URL 을 href 로 갖는다', () => {
      render(<FinalCTASection />);
      const primary = screen
        .getAllByRole('link')
        .find((el) => el.getAttribute('href') === CHROME_WEB_STORE_URL);
      expect(primary).toBeDefined();
    });

    it('Primary CTA 가 외부 링크 보안 속성을 갖는다 (target=_blank + noopener)', () => {
      render(<FinalCTASection />);
      const primary = screen
        .getAllByRole('link')
        .find((el) => el.getAttribute('href') === CHROME_WEB_STORE_URL);
      expect(primary).toHaveAttribute('target', '_blank');
      const rel = primary?.getAttribute('rel') ?? '';
      expect(rel).toContain('noopener');
    });
  });

  describe('TEST-P8.13 — mailto/파트너십 문구 금지', () => {
    it('mailto 링크가 존재하지 않는다', () => {
      const { container } = render(<FinalCTASection />);
      const hasMailto = Array.from(container.querySelectorAll('a')).some((a) =>
        (a.getAttribute('href') ?? '').startsWith('mailto:')
      );
      expect(hasMailto).toBe(false);
    });

    it('ko 문구에 파트너십/문의 텍스트가 포함되지 않는다', () => {
      const { container } = render(<FinalCTASection />);
      const text = container.textContent ?? '';
      expect(text).not.toMatch(/파트너십/);
      expect(text).not.toMatch(/문의/);
    });

    it('en 문구에 partnership/contact 텍스트가 포함되지 않는다', async () => {
      await i18n.changeLanguage('en');
      const { container } = render(<FinalCTASection />);
      const text = (container.textContent ?? '').toLowerCase();
      expect(text).not.toMatch(/partnership/);
      expect(text).not.toMatch(/contact us/);
    });
  });

  describe('구조 계약', () => {
    it('data-testid="finalcta-section" (TEST-P8.14)', () => {
      const { container } = render(<FinalCTASection />);
      expect(container.querySelector('section')?.getAttribute('data-testid')).toBe(
        'finalcta-section'
      );
    });

    it('id 속성을 부여하지 않는다 (NAV_ANCHORS 대상 아님)', () => {
      const { container } = render(<FinalCTASection />);
      expect(container.querySelector('section')?.getAttribute('id')).toBeNull();
    });

    it('aria-labelledby 가 실제 h2 id 를 가리킨다 (landmark 일관성)', () => {
      // 리뷰 피드백 반영 (Low): FinalCTASection 만 aria-labelledby 가 없어
      // 접근성 landmark 패턴이 끊겼다. 다른 모든 섹션과 동일한 패턴 적용.
      const { container } = render(<FinalCTASection />);
      const section = container.querySelector('section');
      const lb = section?.getAttribute('aria-labelledby');
      expect(lb).not.toBeNull();
      const target = container.querySelector(`#${lb}`);
      expect(target).not.toBeNull();
      expect(target?.tagName).toBe('H2');
    });

    it('background 가 accent-soft 이다 (TEST-P8.16)', () => {
      const { container } = render(<FinalCTASection />);
      const section = container.querySelector('section');
      expect(section?.className).toContain('bg-accent-soft');
    });

    it('h1 은 존재하지 않는다', () => {
      const { container } = render(<FinalCTASection />);
      expect(container.querySelectorAll('h1').length).toBe(0);
    });
  });

  describe('언어 전환', () => {
    it('ko → en 전환 시 h2 가 달라진다', async () => {
      const { rerender } = render(<FinalCTASection />);
      const koH2 = screen.getByRole('heading', { level: 2 }).textContent;
      await i18n.changeLanguage('en');
      rerender(<FinalCTASection />);
      expect(screen.getByRole('heading', { level: 2 }).textContent).not.toBe(koH2);
    });
  });
});
