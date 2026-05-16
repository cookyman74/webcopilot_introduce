/**
 * Phase 11 v2 — FeaturesSection 카테고리 그루핑 + 16 카드.
 *
 * 변경:
 *   - 9 카드 → 16 카드 (4 카테고리: absorb 5 / write 4 / automate 5 / convenience 2)
 *   - convenience = workMemory + floating (이전 1-카드 카테고리 memory + interface 통합)
 *   - 모든 status='done' (Phase 11 시점 모든 항목 구현 완료)
 *   - 카테고리 헤더 4개 (h3, data-testid="features-category-{key}")
 *
 * 보존:
 *   - id="features" (NAV_ANCHORS 첫 번째 앵커, Hero Secondary CTA 대상)
 *   - data-testid="features-section"
 *   - 반응형 grid (md:grid-cols-2 lg:grid-cols-3) — 카테고리 내부 sub-grid 에 적용
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeaturesSection } from './FeaturesSection';
import i18n from '../../i18n';

const ALL_FEATURE_KEYS = [
  // absorb
  'chat',
  'helper',
  'multiTab',
  'webSearch',
  'image',
  // write
  'autofill',
  'tone',
  'improve',
  'select',
  // automate
  'doCommand',
  'action',
  'script',
  'scriptCRUD',
  'tabGroup',
  // memory
  'workMemory',
  // interface
  'floating',
] as const;

const CATEGORY_KEYS = ['absorb', 'write', 'automate', 'convenience'] as const;

describe('FeaturesSection (Phase 11 v2)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  describe('카드 수 + 카드 정체성', () => {
    it('정확히 16개의 <article> 을 렌더한다 (5+4+5+1+1)', () => {
      const { container } = render(<FeaturesSection />);
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBe(16);
    });

    it('16개 카드 각각에 <h3> heading 이 존재한다', () => {
      const { container } = render(<FeaturesSection />);
      const cardHeadings = Array.from(
        container.querySelectorAll('article h3, article h4, article h5')
      );
      expect(cardHeadings.length).toBe(16);
      for (const h of cardHeadings) {
        expect(h.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });

    it('16개 카드 각각에 설명 <p> 단락이 존재한다', () => {
      const { container } = render(<FeaturesSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        const paragraphs = article.querySelectorAll('p');
        expect(paragraphs.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('16개 카드 각각에 아이콘(svg) 이 존재한다', () => {
      const { container } = render(<FeaturesSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        expect(article.querySelector('svg')).not.toBeNull();
      }
    });

    it('ALL_FEATURE_KEYS 16개의 i18n 제목이 DOM 에 정확히 1번씩 렌더된다', () => {
      const { container } = render(<FeaturesSection />);
      const renderedTitles = Array.from(
        container.querySelectorAll('article h3, article h4, article h5')
      ).map((el) => el.textContent?.trim() ?? '');
      for (const key of ALL_FEATURE_KEYS) {
        const title = i18n.t(`features.items.${key}.title`);
        const count = renderedTitles.filter((t) => t === title).length;
        expect(count, `"${title}" (${key}) 렌더 횟수`).toBe(1);
      }
      expect(renderedTitles.length).toBe(16);
    });
  });

  describe('카테고리 그루핑', () => {
    it('4개 카테고리 헤더가 렌더된다 (data-testid="features-category-{key}")', () => {
      const { container } = render(<FeaturesSection />);
      for (const cat of CATEGORY_KEYS) {
        const node = container.querySelector(`[data-testid="features-category-${cat}"]`);
        expect(node, `카테고리 "${cat}" 컨테이너 누락`).not.toBeNull();
      }
    });

    it('각 카테고리 헤더는 i18n t("features.categories.{key}") 텍스트를 가진다', () => {
      const { container } = render(<FeaturesSection />);
      for (const cat of CATEGORY_KEYS) {
        const node = container.querySelector(`[data-testid="features-category-${cat}"]`);
        const heading = node?.querySelector('h3, h4, h5');
        expect(heading?.textContent?.trim()).toBe(i18n.t(`features.categories.${cat}`));
      }
    });

    it('카테고리 컨테이너 내부의 카드 수가 설계와 일치한다 (5/4/5/2)', () => {
      const expected: Record<string, number> = {
        absorb: 5,
        write: 4,
        automate: 5,
        convenience: 2,
      };
      const { container } = render(<FeaturesSection />);
      for (const cat of CATEGORY_KEYS) {
        const node = container.querySelector(`[data-testid="features-category-${cat}"]`);
        const cards = node?.querySelectorAll('article');
        expect(cards?.length, `카테고리 "${cat}" 카드 수`).toBe(expected[cat]);
      }
    });
  });

  describe('status badge', () => {
    it('16개 카드 모두에 status badge 가 존재한다', () => {
      const { container } = render(<FeaturesSection />);
      const badges = container.querySelectorAll('[data-testid="status-badge"]');
      expect(badges.length).toBe(16);
    });

    it('done 상태 배지가 정확히 16개 존재한다 (모두 구현됨)', () => {
      render(<FeaturesSection />);
      const doneText = i18n.t('features.status.done');
      expect(screen.getAllByText(doneText).length).toBe(16);
    });

    it('wip / planned 배지는 0개', () => {
      render(<FeaturesSection />);
      expect(screen.queryAllByText(i18n.t('features.status.wip')).length).toBe(0);
      expect(screen.queryAllByText(i18n.t('features.status.planned')).length).toBe(0);
    });

    it('Work Memory 카드가 done 배지를 가진다 (★ Phase 11 핵심 신규)', () => {
      const { container } = render(<FeaturesSection />);
      const title = i18n.t('features.items.workMemory.title');
      const articles = Array.from(container.querySelectorAll('article'));
      const card = articles.find(
        (a) => a.querySelector('h3, h4, h5')?.textContent?.trim() === title
      );
      expect(card, 'workMemory 카드를 찾지 못함').not.toBeUndefined();
      const badge = card?.querySelector('[data-testid="status-badge"]');
      expect(badge?.textContent?.trim()).toBe(i18n.t('features.status.done'));
    });

    it('badge 라벨이 i18n 적용되어 ko → en 전환 시 DOM 이 갱신된다', async () => {
      const { rerender } = render(<FeaturesSection />);
      const koDone = i18n.t('features.status.done');
      expect(screen.getAllByText(koDone).length).toBe(16);

      await i18n.changeLanguage('en');
      rerender(<FeaturesSection />);
      const enDone = i18n.t('features.status.done');
      expect(enDone).not.toBe(koDone);
      expect(screen.getAllByText(enDone).length).toBe(16);
    });
  });

  describe('구조 계약', () => {
    it('섹션 최상위에 <h2> 제목이 정확히 1개 렌더된다', () => {
      const { container } = render(<FeaturesSection />);
      expect(container.querySelectorAll('h2').length).toBe(1);
    });

    it('h1 은 전혀 존재하지 않는다 (HeroSection 전용)', () => {
      const { container } = render(<FeaturesSection />);
      expect(container.querySelectorAll('h1').length).toBe(0);
    });

    it('id="features" 가 <section> 태그에 부여된다', () => {
      const { container } = render(<FeaturesSection />);
      expect(container.querySelector('section#features')).not.toBeNull();
    });

    it('루트 <section> 이 data-testid="features-section" 을 갖는다', () => {
      const { container } = render(<FeaturesSection />);
      const section = container.querySelector('section');
      expect(section?.getAttribute('data-testid')).toBe('features-section');
    });

    it('카테고리 sub-grid 에 반응형 클래스 (md:grid-cols-2 + lg:grid-cols-3) 가 존재한다', () => {
      const { container } = render(<FeaturesSection />);
      const hasGrid = Array.from(container.querySelectorAll('*')).some((el) => {
        if (typeof el.className !== 'string') return false;
        return /\bmd:grid-cols-2\b/.test(el.className) && /\blg:grid-cols-3\b/.test(el.className);
      });
      expect(hasGrid).toBe(true);
    });
  });

  describe('언어 전환 회귀', () => {
    it('ko → en 전환 시 h2 제목이 달라진다', async () => {
      const { rerender } = render(<FeaturesSection />);
      const koH2 = screen.getByRole('heading', { level: 2 }).textContent;
      await i18n.changeLanguage('en');
      rerender(<FeaturesSection />);
      const enH2 = screen.getByRole('heading', { level: 2 }).textContent;
      expect(enH2).not.toBe(koH2);
    });

    it('ko → en 전환 시 카드 제목이 변경된다 (브랜드 명칭 제외)', async () => {
      // 브랜드 명칭(ko/en 동일 허용): Action Tools, Floating Helper, Work Memory
      const BRAND_NAMES = ['Action Tools', 'Floating Helper', 'Work Memory'] as const;
      const { container, rerender } = render(<FeaturesSection />);
      const koTitles = Array.from(
        container.querySelectorAll('article h3, article h4, article h5')
      ).map((el) => el.textContent?.trim() ?? '');

      await i18n.changeLanguage('en');
      rerender(<FeaturesSection />);
      const enTitles = Array.from(
        container.querySelectorAll('article h3, article h4, article h5')
      ).map((el) => el.textContent?.trim() ?? '');

      expect(koTitles.length).toBe(16);
      expect(enTitles.length).toBe(16);

      for (let i = 0; i < 16; i++) {
        const isBrand = BRAND_NAMES.some((b) => koTitles[i] === b || enTitles[i] === b);
        if (isBrand) {
          expect(koTitles[i]).toBe(enTitles[i]);
        } else {
          expect(enTitles[i], `카드 #${i + 1} "${koTitles[i]}" 동일 (i18n 누락 의심)`).not.toBe(
            koTitles[i]
          );
        }
      }
    });
  });
});
