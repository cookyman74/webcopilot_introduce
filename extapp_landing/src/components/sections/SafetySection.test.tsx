/**
 * Phase 7 RED — SafetySection 컴포넌트
 * 대응 체크: TEST-P7.5~P7.7 · TEST-P7.8~P7.10 · TEST-P7.13
 *
 * SafetySection 책임:
 *   1. 루트 `<Section background="surface">` + h2 + subtitle + 4개 원칙 카드
 *   2. 각 카드는 `<article>` + lucide 아이콘 + h3 + 설명
 *   3. 과장 표현 금지 ("100%", "완전 자동", "absolute", "never fails")
 *   4. data-testid="safety-section" · id 부여 없음
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SafetySection } from './SafetySection';
import i18n from '../../i18n';

describe('SafetySection (TEST-P7.5~P7.7 + P7.8~P7.10 + P7.13)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P7.5 — 4개 원칙 카드
  // ─────────────────────────────────────────────────────────
  describe('TEST-P7.5 — 5개 원칙 카드 (Phase 11: loop hard-stop 추가)', () => {
    it('정확히 5개의 <article> 을 렌더한다', () => {
      const { container } = render(<SafetySection />);
      expect(container.querySelectorAll('article').length).toBe(5);
    });

    it('getAllByRole("article") 로도 정확히 5개 접근 가능하다', () => {
      render(<SafetySection />);
      expect(screen.getAllByRole('article').length).toBe(5);
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P7.6 — 카드 내부 구조
  // ─────────────────────────────────────────────────────────
  describe('TEST-P7.6 — 카드 내부 구조', () => {
    it('5개 카드 각각에 h3 heading 이 존재하고 비어있지 않다', () => {
      const { container } = render(<SafetySection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        const h = article.querySelector('h3, h4, h5');
        expect(h).not.toBeNull();
        expect(h?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });

    it('5개 카드 각각에 설명 <p> 가 존재한다', () => {
      const { container } = render(<SafetySection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        const p = article.querySelector('p');
        expect(p).not.toBeNull();
        expect(p?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });

    it('5개 카드 각각에 아이콘(svg) 이 존재한다', () => {
      const { container } = render(<SafetySection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        expect(article.querySelector('svg')).not.toBeNull();
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P7.7 — 과장 표현 금지
  // ─────────────────────────────────────────────────────────
  describe('TEST-P7.7 — 과장 표현 금지', () => {
    it('ko 문구에 과장 표현이 포함되지 않는다', () => {
      const { container } = render(<SafetySection />);
      const text = container.textContent ?? '';
      expect(text).not.toMatch(/100%/);
      expect(text).not.toMatch(/완전 자동/);
      expect(text).not.toMatch(/절대/);
      expect(text).not.toMatch(/무결/);
    });

    it('en 문구에 과장 표현이 포함되지 않는다', async () => {
      await i18n.changeLanguage('en');
      const { container } = render(<SafetySection />);
      const text = (container.textContent ?? '').toLowerCase();
      expect(text).not.toMatch(/100%/);
      expect(text).not.toMatch(/fully automatic/);
      expect(text).not.toMatch(/absolute/);
      expect(text).not.toMatch(/never fails/);
      expect(text).not.toMatch(/guaranteed/);
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P7.13 — 카드 정체성
  // ─────────────────────────────────────────────────────────
  describe('TEST-P7.13 — 원칙 정체성 고정', () => {
    it('5개 원칙 제목이 각각 정확히 1회씩 렌더된다 (Phase 11: loop 추가)', () => {
      const { container } = render(<SafetySection />);
      const keys = ['approval', 'register', 'session', 'sensitive', 'loop'];
      const renderedTitles = Array.from(container.querySelectorAll('article h3')).map(
        (el) => el.textContent?.trim() ?? ''
      );
      expect(renderedTitles.length).toBe(5);
      for (const key of keys) {
        const title = i18n.t(`safety.items.${key}.title`);
        expect(renderedTitles.filter((t) => t === title).length).toBe(1);
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // 구조 계약
  // ─────────────────────────────────────────────────────────
  describe('구조 계약', () => {
    it('h2 제목이 정확히 1개 렌더된다', () => {
      const { container } = render(<SafetySection />);
      expect(container.querySelectorAll('h2').length).toBe(1);
    });

    it('h1 은 존재하지 않는다', () => {
      const { container } = render(<SafetySection />);
      expect(container.querySelectorAll('h1').length).toBe(0);
    });

    it('id 속성을 부여하지 않는다 (NAV_ANCHORS 대상 아님)', () => {
      // 리뷰 피드백 반영 (Low): 계획서는 id 미부여를 요구하지만 테스트 누락.
      const { container } = render(<SafetySection />);
      expect(container.querySelector('section')?.getAttribute('id')).toBeNull();
    });

    it('data-testid="safety-section" 을 갖는다 (TEST-P7.10)', () => {
      const { container } = render(<SafetySection />);
      expect(container.querySelector('section')?.getAttribute('data-testid')).toBe(
        'safety-section'
      );
    });

    it('aria-labelledby 가 실제 h2 id 를 가리킨다', () => {
      const { container } = render(<SafetySection />);
      const section = container.querySelector('section');
      const labelledBy = section?.getAttribute('aria-labelledby');
      if (labelledBy) {
        const target = container.querySelector(`#${labelledBy}`);
        expect(target).not.toBeNull();
        expect(target?.tagName).toBe('H2');
      } else {
        expect(section?.hasAttribute('aria-label')).toBe(true);
      }
    });

    it('반응형 grid (md:grid-cols-2) 가 존재한다', () => {
      const { container } = render(<SafetySection />);
      const hasGrid = Array.from(container.querySelectorAll('*')).some(
        (el) => typeof el.className === 'string' && /\bmd:grid-cols-2\b/.test(el.className)
      );
      expect(hasGrid).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P7.9 — 언어 전환
  // ─────────────────────────────────────────────────────────
  describe('TEST-P7.9 — 언어 전환', () => {
    it('ko → en 전환 시 h2 제목이 달라진다', async () => {
      const { rerender } = render(<SafetySection />);
      const koH2 = screen.getByRole('heading', { level: 2 }).textContent;
      await i18n.changeLanguage('en');
      rerender(<SafetySection />);
      expect(screen.getByRole('heading', { level: 2 }).textContent).not.toBe(koH2);
    });

    it('ko → en 전환 시 5개 카드 제목이 모두 달라진다', async () => {
      const { container, rerender } = render(<SafetySection />);
      const koTitles = Array.from(container.querySelectorAll('article h3')).map(
        (el) => el.textContent?.trim() ?? ''
      );
      await i18n.changeLanguage('en');
      rerender(<SafetySection />);
      const enTitles = Array.from(container.querySelectorAll('article h3')).map(
        (el) => el.textContent?.trim() ?? ''
      );
      expect(koTitles.length).toBe(5);
      for (let i = 0; i < 5; i++) {
        expect(enTitles[i]).not.toBe(koTitles[i]);
      }
    });
  });
});
