/**
 * Phase 6 RED — DifferentiationSection 컴포넌트
 * 대응 체크: TEST-P6.4 · TEST-P6.5 · TEST-P6.6 · TEST-P6.8 · TEST-P6.9 · TEST-P6.12
 *
 * DifferentiationSection 책임:
 *   1. 루트 `<Section id="differentiation" background="surface-alt">` + h2 제목 + 3개 비교 카드 그리드
 *      - 모바일 (< md): 1컬럼
 *      - 데스크톱 (md+): 3컬럼 (md:grid-cols-3)
 *   2. 각 카드는 `<article>` + before 영역(회색) + ArrowRight 아이콘 + after 영역(액센트) + 설명
 *   3. i18n 적용: `differentiation.title` + `differentiation.items.{d1..d3}.{before,after,desc}`
 *   4. `['d1','d2','d3'].map()` 데이터화 (phase06 §6.3 TASK-003)
 *   5. data-testid="differentiation-section" 공개 계약
 *
 * RED 기대 동작:
 *   `./DifferentiationSection` 모듈이 아직 존재하지 않으므로 Vitest가 "Failed to resolve
 *   import" 로 본 파일 전체를 FAIL 처리해야 한다.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DifferentiationSection } from './DifferentiationSection';
import i18n from '../../i18n';

describe('DifferentiationSection (TEST-P6.4/P6.5/P6.6 + P6.8/P6.9 + P6.12)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P6.4 — 3개 비교 카드 렌더
  // ─────────────────────────────────────────────────────────
  describe('TEST-P6.4 — 5개 비교 카드 (Phase 11: d4/d5 추가, 3 → 5)', () => {
    it('정확히 5개의 <article> 을 렌더한다', () => {
      const { container } = render(<DifferentiationSection />);
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBe(5);
    });

    it('getAllByRole("article") 로도 정확히 5개 접근 가능하다', () => {
      render(<DifferentiationSection />);
      const articles = screen.getAllByRole('article');
      expect(articles.length).toBe(5);
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P6.5 — 카드 내부 구조 (before + after)
  // ─────────────────────────────────────────────────────────
  describe('TEST-P6.5 — 카드 내부 구조 (Before/After 대비)', () => {
    it('5개 카드 각각에 i18n before/after 텍스트가 실제로 렌더된다', () => {
      // Phase 11 v2: d1~d5 각각의 i18n before/after 값이 카드 내부에 존재하는지 검증.
      const expectedKeys = ['d1', 'd2', 'd3', 'd4', 'd5'];
      const { container } = render(<DifferentiationSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      expect(articles.length).toBe(5);
      for (let i = 0; i < 5; i++) {
        const beforeText = i18n.t(`differentiation.items.${expectedKeys[i]}.before`);
        const afterText = i18n.t(`differentiation.items.${expectedKeys[i]}.after`);
        const content = articles[i].textContent ?? '';
        expect(content, `카드 ${expectedKeys[i]} 에 before "${beforeText}" 누락`).toContain(
          beforeText
        );
        expect(content, `카드 ${expectedKeys[i]} 에 after "${afterText}" 누락`).toContain(
          afterText
        );
        // before 와 after 는 서로 달라야 함 (비교 대비의 의미)
        expect(beforeText).not.toBe(afterText);
      }
    });

    it('5개 카드 각각에 방향을 나타내는 아이콘(svg) 이 존재한다', () => {
      // before → after 를 연결하는 ArrowRight 등 아이콘.
      const { container } = render(<DifferentiationSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        const svg = article.querySelector('svg');
        expect(svg).not.toBeNull();
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P6.12 — 카드 정체성 (i18n 키 매핑 일관성)
  // ─────────────────────────────────────────────────────────
  describe('TEST-P6.12 — 카드 정체성 고정', () => {
    it('d1~d5 까지의 5개 비교 쌍(after 텍스트 기준) 이 각각 정확히 1회씩 렌더된다', () => {
      render(<DifferentiationSection />);
      const expectedKeys = ['d1', 'd2', 'd3', 'd4', 'd5'];
      for (const key of expectedKeys) {
        const afterText = i18n.t(`differentiation.items.${key}.after`);
        expect(screen.getAllByText(afterText).length).toBe(1);
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // 구조 계약 — id · h2 · data-testid · 반응형 grid
  // ─────────────────────────────────────────────────────────
  describe('구조 계약', () => {
    it('섹션 최상위에 <h2> 제목이 정확히 1개 렌더된다', () => {
      const { container } = render(<DifferentiationSection />);
      expect(container.querySelectorAll('h2').length).toBe(1);
    });

    it('h2 텍스트가 비어있지 않다 (i18n t("differentiation.title") 렌더)', () => {
      render(<DifferentiationSection />);
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    });

    it('id="differentiation" 가 <section> 태그에 부여된다 (TEST-P6.6)', () => {
      const { container } = render(<DifferentiationSection />);
      const section = container.querySelector('section#differentiation');
      expect(section).not.toBeNull();
    });

    it('루트 <section> 이 data-testid="differentiation-section" 을 갖는다 (TEST-P6.9)', () => {
      const { container } = render(<DifferentiationSection />);
      const section = container.querySelector('section');
      expect(section?.getAttribute('data-testid')).toBe('differentiation-section');
    });

    it('h1 은 전혀 존재하지 않는다 (HeroSection 전용)', () => {
      const { container } = render(<DifferentiationSection />);
      expect(container.querySelectorAll('h1').length).toBe(0);
    });

    it('aria-labelledby 가 실제 h2 id 를 가리킨다 (region landmark)', () => {
      const { container } = render(<DifferentiationSection />);
      const section = container.querySelector('section');
      const labelledBy = section?.getAttribute('aria-labelledby');
      if (labelledBy) {
        const target = container.querySelector(`#${labelledBy}`);
        expect(target).not.toBeNull();
        expect(target?.tagName).toBe('H2');
        expect(target?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      } else {
        expect(section?.hasAttribute('aria-label')).toBe(true);
      }
    });

    it('반응형 grid 클래스 (md:grid-cols-2 + lg:grid-cols-3) 가 DOM 에 존재한다 (5개 = 3+2 split)', () => {
      // Phase 11 v2: 3 → 5 카드, 모바일 1 → 태블릿 2 → 데스크톱 3 (마지막 row 2개).
      const { container } = render(<DifferentiationSection />);
      const hasGrid = Array.from(container.querySelectorAll('*')).some((el) => {
        if (typeof el.className !== 'string') return false;
        return /\bmd:grid-cols-2\b/.test(el.className) && /\blg:grid-cols-3\b/.test(el.className);
      });
      expect(hasGrid).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P6.8 — 언어 전환 회귀
  // ─────────────────────────────────────────────────────────
  describe('TEST-P6.8 — 언어 전환 회귀', () => {
    it('ko → en 전환 시 h2 제목 텍스트가 달라진다', async () => {
      const { rerender } = render(<DifferentiationSection />);
      const koH2 = screen.getByRole('heading', { level: 2 }).textContent;

      await i18n.changeLanguage('en');
      rerender(<DifferentiationSection />);
      const enH2 = screen.getByRole('heading', { level: 2 }).textContent;
      expect(enH2).not.toBe(koH2);
    });

    it('ko → en 전환 시 5개 비교 카드의 after 텍스트가 모두 달라진다', async () => {
      const { container, rerender } = render(<DifferentiationSection />);
      const koAfters = Array.from(container.querySelectorAll('article')).map(
        (el) => el.textContent ?? ''
      );

      await i18n.changeLanguage('en');
      rerender(<DifferentiationSection />);
      const enAfters = Array.from(container.querySelectorAll('article')).map(
        (el) => el.textContent ?? ''
      );

      for (let i = 0; i < 5; i++) {
        expect(enAfters[i]).not.toBe(koAfters[i]);
      }
    });
  });
});
