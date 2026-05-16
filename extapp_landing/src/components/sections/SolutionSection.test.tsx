/**
 * Phase 5 RED — SolutionSection 컴포넌트
 * 대응 체크: TEST-P5.1 · TEST-P5.2 · TEST-P5.9 · TEST-P5.10
 *
 * SolutionSection 책임:
 *   1. 루트 `<Section background="canvas">` + h2 제목 + 3개 "축" 카드 그리드
 *      - 모바일 (< md): 1컬럼
 *      - 데스크톱 (md+): 3컬럼 (md:grid-cols-3)
 *   2. 각 카드는 `<article>` + 아이콘(lucide-react) + `<h3>` 제목 + `<p>` 설명 + `<p>` 예시
 *   3. i18n 적용: `solution.title` (섹션 h2) + `solution.axes.{context,action,script}.{title,desc,example}`
 *   4. 데이터 배열 `['context','action','script'].map()` 패턴 (Phase 4 ProblemSection 계승)
 *   5. region landmark 접근성 — `aria-labelledby` 로 h2 참조
 *
 * 설계 계약:
 *   - SolutionSection 에는 `id` 를 부여하지 않는다 (NAV_ANCHORS 앵커 대상 아님)
 *   - data-testid="solution-section" 공개 계약 (Phase 4 패턴 확산)
 *   - 섹션 h2 가 페이지 내 h1 (HeroSection) 보다 하위 level 이어야 함
 *
 * RED 기대 동작:
 *   `./SolutionSection` 모듈이 아직 존재하지 않으므로 Vitest가 "Failed to resolve
 *   import" 로 본 파일 전체를 FAIL 처리해야 한다.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SolutionSection } from './SolutionSection';
import i18n from '../../i18n';

describe('SolutionSection (TEST-P5.1 + P5.2 + P5.9 + P5.10)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P5.1 — 4개 축 카드 (Phase 11: memory 추가, 3 → 4)
  // ─────────────────────────────────────────────────────────
  describe('TEST-P5.1 — 4개 축 카드', () => {
    it('정확히 4개의 <article> 을 렌더한다', () => {
      const { container } = render(<SolutionSection />);
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBe(4);
    });

    it('getAllByRole("article") 로도 정확히 4개 접근 가능하다', () => {
      render(<SolutionSection />);
      const articles = screen.getAllByRole('article');
      expect(articles.length).toBe(4);
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P5.2 — 각 카드 내부 구조 (아이콘 + h3 + 설명 + 예시) — 4개 카드 적용
  // ─────────────────────────────────────────────────────────
  describe('TEST-P5.2 — 카드 내부 구조', () => {
    it('4개 카드 각각에 <h3> heading 이 존재하고 비어있지 않다', () => {
      const { container } = render(<SolutionSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      expect(articles.length).toBe(4);
      for (const article of articles) {
        const heading = article.querySelector('h3, h4, h5');
        expect(heading).not.toBeNull();
        expect(heading?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });

    it('4개 카드 각각에 설명 <p> 단락이 1개 이상 존재한다', () => {
      const { container } = render(<SolutionSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        const paragraphs = article.querySelectorAll('p');
        expect(paragraphs.length).toBeGreaterThanOrEqual(1);
        expect(paragraphs[0]?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });

    it('4개 카드 각각에 예시 텍스트가 존재한다', () => {
      // phase05 §5.3 TASK-003: 각 카드는 예시(example) 텍스트를 포함.
      // 예시는 "예:" 접두어 또는 별도 <p> 로 렌더될 수 있음 — 구현 자유.
      // 최소 보장: 카드 내부에 <p> 가 2개 이상 (설명 + 예시).
      const { container } = render(<SolutionSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        const paragraphs = article.querySelectorAll('p');
        expect(paragraphs.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('4개 카드 각각에 아이콘 요소가 존재한다 (lucide-react SVG)', () => {
      // lucide-react 아이콘은 <svg> 태그를 렌더. 카드 내부에 svg 가 1개 이상
      // 있어야 아이콘이 렌더된 것으로 판정.
      const { container } = render(<SolutionSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        const svg = article.querySelector('svg');
        expect(svg, '카드 내부에 아이콘(svg) 이 없음').not.toBeNull();
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // 구조 계약 — h2 제목 + region 접근성 + data-testid
  // ─────────────────────────────────────────────────────────
  describe('구조 계약', () => {
    it('섹션 최상위에 <h2> 제목이 정확히 1개 렌더된다', () => {
      const { container } = render(<SolutionSection />);
      const h2s = container.querySelectorAll('h2');
      expect(h2s.length).toBe(1);
    });

    it('h2 텍스트가 비어있지 않다 (i18n t("solution.title") 렌더)', () => {
      render(<SolutionSection />);
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    });

    it('h1 은 전혀 존재하지 않는다 (HeroSection 전용이므로)', () => {
      const { container } = render(<SolutionSection />);
      const h1s = container.querySelectorAll('h1');
      expect(h1s.length).toBe(0);
    });

    it('섹션 루트 <section> 이 aria-labelledby 또는 aria-label 로 접근 가능하다', () => {
      const { container } = render(<SolutionSection />);
      const section = container.querySelector('section');
      expect(section).not.toBeNull();
      const hasLabel =
        section?.hasAttribute('aria-label') || section?.hasAttribute('aria-labelledby');
      expect(hasLabel).toBe(true);
    });

    it('aria-labelledby 를 사용할 경우 그 값이 실제 h2 id 를 가리킨다', () => {
      const { container } = render(<SolutionSection />);
      const section = container.querySelector('section');
      const labelledBy = section?.getAttribute('aria-labelledby');
      if (labelledBy !== null && labelledBy !== undefined) {
        expect(labelledBy.trim().length).toBeGreaterThan(0);
        const target = container.querySelector(`#${labelledBy}`);
        expect(target).not.toBeNull();
        expect(target?.tagName).toBe('H2');
        expect(target?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });

    it('id 속성을 부여하지 않는다 (NAV_ANCHORS 앵커 대상 아님)', () => {
      const { container } = render(<SolutionSection />);
      const section = container.querySelector('section');
      expect(section?.getAttribute('id')).toBeNull();
    });

    it('루트 <section> 이 data-testid="solution-section" 을 갖는다 (TEST-P5.10)', () => {
      const { container } = render(<SolutionSection />);
      const section = container.querySelector('section');
      expect(section).not.toBeNull();
      expect(section?.getAttribute('data-testid')).toBe('solution-section');
    });

    it('반응형 4컬럼 grid 클래스 (lg:grid-cols-4) 가 DOM 에 존재한다', () => {
      // Phase 11 v2: 3축 → 4축 (memory 추가). md:grid-cols-2 lg:grid-cols-4 (모바일 1 → 태블릿 2 → 데스크톱 4).
      const { container } = render(<SolutionSection />);
      const hasGrid = Array.from(container.querySelectorAll('*')).some(
        (el) => typeof el.className === 'string' && /\blg:grid-cols-4\b/.test(el.className)
      );
      expect(hasGrid).toBe(true);
    });

    it('memory 축 카드가 i18n t("solution.axes.memory.title") 텍스트로 렌더된다', () => {
      // Phase 11 v2: Work Memory 가치 회귀 가드. memory 축 카드가 누락되면 FAIL.
      render(<SolutionSection />);
      const expectedTitle = i18n.t('solution.axes.memory.title');
      expect(screen.getByText(expectedTitle)).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P5.9 — 언어 전환 회귀
  // ─────────────────────────────────────────────────────────
  describe('TEST-P5.9 — 언어 전환 회귀', () => {
    it('ko → en 전환 시 h2 제목 텍스트가 달라진다', async () => {
      const { rerender } = render(<SolutionSection />);
      const koH2 = screen.getByRole('heading', { level: 2 }).textContent;
      expect(koH2?.length ?? 0).toBeGreaterThan(0);

      await i18n.changeLanguage('en');
      rerender(<SolutionSection />);
      const enH2 = screen.getByRole('heading', { level: 2 }).textContent;
      expect(enH2?.length ?? 0).toBeGreaterThan(0);
      expect(enH2).not.toBe(koH2);
    });

    it('ko → en 전환 시 4개 카드 제목이 모두 달라진다', async () => {
      const { container, rerender } = render(<SolutionSection />);
      const koTitles = Array.from(
        container.querySelectorAll('article h3, article h4, article h5')
      ).map((el) => el.textContent?.trim() ?? '');

      await i18n.changeLanguage('en');
      rerender(<SolutionSection />);
      const enTitles = Array.from(
        container.querySelectorAll('article h3, article h4, article h5')
      ).map((el) => el.textContent?.trim() ?? '');

      expect(koTitles.length).toBe(4);
      expect(enTitles.length).toBe(4);
      for (let i = 0; i < 4; i++) {
        expect(enTitles[i]).not.toBe(koTitles[i]);
      }
    });
  });
});
