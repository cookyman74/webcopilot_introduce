/**
 * Phase 6 RED — ScenariosSection 컴포넌트
 * 대응 체크: TEST-P6.1 · TEST-P6.2 · TEST-P6.3 · TEST-P6.8 · TEST-P6.9 · TEST-P6.11
 *
 * ScenariosSection 책임:
 *   1. 루트 `<Section id="scenarios" background="canvas">` + h2 제목 + 4개 시나리오 카드 그리드
 *      - 모바일 (< md): 1컬럼
 *      - 태블릿+ (md+): 2×2 (md:grid-cols-2)
 *   2. 각 카드는 `<article>` + step 라벨 + `<h3>` 제목 + `<p>` 설명 + placeholder 이미지
 *   3. i18n 적용: `scenarios.title` (섹션 h2) + `scenarios.items.{s1..s4}.{step,title,desc}`
 *   4. `['s1','s2','s3','s4'].map()` 데이터화 (phase06 §6.3 TASK-002)
 *   5. data-testid="scenarios-section" 공개 계약
 *
 * RED 기대 동작:
 *   `./ScenariosSection` 모듈이 아직 존재하지 않으므로 Vitest가 "Failed to resolve
 *   import" 로 본 파일 전체를 FAIL 처리해야 한다.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScenariosSection } from './ScenariosSection';
import i18n from '../../i18n';

describe('ScenariosSection (TEST-P6.1/P6.2/P6.3 + P6.8/P6.9 + P6.11)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P6.1 — 4개 시나리오 카드 렌더
  // ─────────────────────────────────────────────────────────
  describe('TEST-P6.1 — 4개 시나리오 카드', () => {
    it('정확히 4개의 <article> 을 렌더한다', () => {
      const { container } = render(<ScenariosSection />);
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBe(4);
    });

    it('getAllByRole("article") 로도 정확히 4개 접근 가능하다', () => {
      render(<ScenariosSection />);
      const articles = screen.getAllByRole('article');
      expect(articles.length).toBe(4);
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P6.2 — 카드 내부 구조 (step + h3 + desc)
  // ─────────────────────────────────────────────────────────
  describe('TEST-P6.2 — 카드 내부 구조', () => {
    it('4개 카드 각각에 step 라벨이 i18n 값으로 존재한다', () => {
      // 리뷰 피드백 반영 (Low): `step|단계` regex 는 i18n 라벨이 바뀌면
      // 오탐할 수 있다. 각 카드의 step 라벨이 `t('scenarios.items.sN.step')`
      // 실제 값과 일치하는지 직접 검증.
      const { container } = render(<ScenariosSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      const expectedKeys = ['s1', 's2', 's3', 's4'];
      expect(articles.length).toBe(4);
      for (let idx = 0; idx < 4; idx++) {
        const stepText = i18n.t(`scenarios.items.${expectedKeys[idx]}.step`);
        expect(articles[idx].textContent).toContain(stepText);
      }
    });

    it('4개 카드 각각에 <h3> heading 이 존재하고 비어있지 않다', () => {
      const { container } = render(<ScenariosSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        const heading = article.querySelector('h3, h4, h5');
        expect(heading).not.toBeNull();
        expect(heading?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });

    it('4개 카드 각각에 설명 <p> 단락이 존재한다', () => {
      const { container } = render(<ScenariosSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        const p = article.querySelector('p');
        expect(p).not.toBeNull();
        expect(p?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P6.11 — 카드 정체성 (i18n 키 매핑 일관성)
  // ─────────────────────────────────────────────────────────
  describe('TEST-P6.11 — 카드 정체성 고정', () => {
    it('s1~s4 까지의 4개 시나리오 제목이 각각 정확히 1회씩 렌더된다', () => {
      render(<ScenariosSection />);
      const expectedKeys = ['s1', 's2', 's3', 's4'];
      for (const key of expectedKeys) {
        const title = i18n.t(`scenarios.items.${key}.title`);
        expect(screen.getAllByText(title).length).toBe(1);
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // 구조 계약 — id · h2 · data-testid · 반응형 grid
  // ─────────────────────────────────────────────────────────
  describe('구조 계약', () => {
    it('섹션 최상위에 <h2> 제목이 정확히 1개 렌더된다', () => {
      const { container } = render(<ScenariosSection />);
      expect(container.querySelectorAll('h2').length).toBe(1);
    });

    it('h2 텍스트가 비어있지 않다 (i18n t("scenarios.title") 렌더)', () => {
      render(<ScenariosSection />);
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    });

    it('id="scenarios" 가 <section> 태그에 부여된다 (TEST-P6.3)', () => {
      const { container } = render(<ScenariosSection />);
      const section = container.querySelector('section#scenarios');
      expect(section).not.toBeNull();
    });

    it('루트 <section> 이 data-testid="scenarios-section" 을 갖는다 (TEST-P6.9)', () => {
      const { container } = render(<ScenariosSection />);
      const section = container.querySelector('section');
      expect(section?.getAttribute('data-testid')).toBe('scenarios-section');
    });

    it('h1 은 전혀 존재하지 않는다 (HeroSection 전용)', () => {
      const { container } = render(<ScenariosSection />);
      expect(container.querySelectorAll('h1').length).toBe(0);
    });

    it('aria-labelledby 가 실제 h2 id 를 가리킨다 (region landmark)', () => {
      const { container } = render(<ScenariosSection />);
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

    it('반응형 grid 클래스 (md:grid-cols-2) 가 DOM 에 존재한다', () => {
      // 2×2 grid: 모바일 1col → 태블릿+ 2col.
      const { container } = render(<ScenariosSection />);
      const hasGrid = Array.from(container.querySelectorAll('*')).some(
        (el) => typeof el.className === 'string' && /\bmd:grid-cols-2\b/.test(el.className)
      );
      expect(hasGrid).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P6.8 — 언어 전환 회귀
  // ─────────────────────────────────────────────────────────
  describe('TEST-P6.8 — 언어 전환 회귀', () => {
    it('ko → en 전환 시 h2 제목 텍스트가 달라진다', async () => {
      const { rerender } = render(<ScenariosSection />);
      const koH2 = screen.getByRole('heading', { level: 2 }).textContent;

      await i18n.changeLanguage('en');
      rerender(<ScenariosSection />);
      const enH2 = screen.getByRole('heading', { level: 2 }).textContent;
      expect(enH2).not.toBe(koH2);
    });

    it('ko → en 전환 시 4개 시나리오 제목이 모두 달라진다', async () => {
      const { container, rerender } = render(<ScenariosSection />);
      const koTitles = Array.from(container.querySelectorAll('article h3')).map(
        (el) => el.textContent?.trim() ?? ''
      );

      await i18n.changeLanguage('en');
      rerender(<ScenariosSection />);
      const enTitles = Array.from(container.querySelectorAll('article h3')).map(
        (el) => el.textContent?.trim() ?? ''
      );

      expect(koTitles.length).toBe(4);
      for (let i = 0; i < 4; i++) {
        expect(enTitles[i]).not.toBe(koTitles[i]);
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // 영상 모달 상호작용
  // ─────────────────────────────────────────────────────────
  describe('영상 모달 상호작용', () => {
    it('영상 placeholder 버튼 클릭 시 모달(dialog) 이 DOM 에 나타난다', async () => {
      const user = userEvent.setup();
      render(<ScenariosSection />);
      // 모달은 처음에 없어야 함
      expect(screen.queryByRole('dialog')).toBeNull();
      // 첫 번째 카드의 영상 placeholder 버튼 클릭
      const buttons = screen.getAllByText('영상 준비 중');
      await user.click(buttons[0]);
      // 모달이 나타나야 함
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('모달 열린 후 ESC 키로 닫을 수 있다', async () => {
      const user = userEvent.setup();
      render(<ScenariosSection />);
      const buttons = screen.getAllByText('영상 준비 중');
      await user.click(buttons[0]);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('4개 카드 각각에 영상 버튼이 존재한다 (썸네일 또는 placeholder)', () => {
      const { container } = render(<ScenariosSection />);
      // videoId 가 있는 카드는 썸네일 이미지, 없는 카드는 "영상 준비 중" 텍스트
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBe(4);
      for (const article of articles) {
        const btn = article.querySelector('button');
        expect(btn, '카드에 영상 버튼이 없음').not.toBeNull();
      }
    });
  });
});
