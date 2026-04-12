/**
 * Phase 5 RED — FeaturesSection 컴포넌트
 * 대응 체크: TEST-P5.3 · TEST-P5.4 · TEST-P5.5 · TEST-P5.6 · TEST-P5.7 · TEST-P5.9 · TEST-P5.11 · TEST-P5.13
 *
 * FeaturesSection 책임:
 *   1. 루트 `<Section id="features" background="surface">` + h2 제목 + 9개 FeatureCard 그리드
 *      - 모바일 (< md): 1컬럼
 *      - 태블릿 (md): 2컬럼 (md:grid-cols-2)
 *      - 데스크톱 (lg): 3컬럼 (lg:grid-cols-3) → 3×3
 *   2. 각 카드는 `<article>` (FeatureCard 공통 컴포넌트 사용)
 *      - 아이콘(lucide-react SVG) + status badge + h3 제목 + 설명 + 예시
 *   3. status badge 매핑: done×7 + wip×1 + planned×1
 *   4. i18n 적용: `features.title` (섹션 h2) + `features.items.{key}.{title,desc,example}` (9×3)
 *      + `features.status.{done,wip,planned}` (badge 라벨 i18n)
 *   5. `id="features"`: Hero Secondary CTA `href="#features"` 앵커 대상 + NAV_ANCHORS 첫 번째 ID
 *
 * 설계 계약:
 *   - FeaturesSection 은 `id="features"` 를 부여한다 (NAV_ANCHORS 앵커 대상)
 *   - data-testid="features-section" 공개 계약 (Phase 4 패턴 확산)
 *   - 데모 `<Section id="features" background="accent-soft">` 를 완전 대체
 *
 * RED 기대 동작:
 *   `./FeaturesSection` 모듈이 아직 존재하지 않으므로 Vitest가 "Failed to resolve
 *   import" 로 본 파일 전체를 FAIL 처리해야 한다.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeaturesSection } from './FeaturesSection';
import i18n from '../../i18n';

describe('FeaturesSection (TEST-P5.3~P5.7 + P5.9 + P5.11 + P5.13)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P5.3 — 9개 FeatureCard 렌더
  // ─────────────────────────────────────────────────────────
  describe('TEST-P5.3 — 9개 FeatureCard', () => {
    it('정확히 9개의 <article> 을 렌더한다', () => {
      const { container } = render(<FeaturesSection />);
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBe(9);
    });

    it('9개 카드 각각에 <h3> heading 이 존재하고 비어있지 않다', () => {
      const { container } = render(<FeaturesSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      expect(articles.length).toBe(9);
      for (const article of articles) {
        const heading = article.querySelector('h3, h4, h5');
        expect(heading).not.toBeNull();
        expect(heading?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });

    it('9개 카드 각각에 설명 <p> 단락이 1개 이상 존재한다', () => {
      const { container } = render(<FeaturesSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        const paragraphs = article.querySelectorAll('p');
        expect(paragraphs.length).toBeGreaterThanOrEqual(1);
        expect(paragraphs[0]?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });

    it('9개 카드 각각에 아이콘(svg) 이 존재한다 (lucide-react)', () => {
      const { container } = render(<FeaturesSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        const svg = article.querySelector('svg');
        expect(svg, '카드 내부에 아이콘(svg) 이 없음').not.toBeNull();
      }
    });

    it('9개 카드의 정체성이 i18n 키 매핑과 정확히 일치한다 (카드 누락/중복 방지)', () => {
      // 리뷰 피드백 반영 (Medium): 이전 버전은 article 수 + non-empty heading +
      // icon 존재만 검증해서 같은 카드가 중복 렌더되거나 특정 카드가 빠져도
      // badge 총량만 맞으면 통과할 수 있었다.
      //
      // 수정: 계획서에 명시된 9개 i18n 키(chat/helper/select/autofill/action/
      // image/improve/script/floating) 각각의 t() 번역 제목이 DOM 에 **모두
      // 고유하게** 존재하는지 검증. 하나라도 빠지거나 중복되면 FAIL.
      const expectedKeys = [
        'chat',
        'helper',
        'select',
        'autofill',
        'action',
        'image',
        'improve',
        'script',
        'floating',
      ] as const;
      const { container } = render(<FeaturesSection />);
      const renderedTitles = Array.from(
        container.querySelectorAll('article h3, article h4, article h5')
      ).map((el) => el.textContent?.trim() ?? '');

      // 9개 키 각각의 번역 제목이 DOM 에 정확히 1번 존재해야 함
      for (const key of expectedKeys) {
        const expectedTitle = i18n.t(`features.items.${key}.title`);
        const count = renderedTitles.filter((t) => t === expectedTitle).length;
        expect(count, `"${expectedTitle}" (key: ${key}) 가 ${count}회 렌더됨 — 1회여야 함`).toBe(1);
      }

      // 역방향: DOM 에 예상 외 카드가 섞여있지 않은지 (총 9개 정확)
      expect(renderedTitles.length).toBe(9);
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P5.4/P5.5/P5.6 — status badge 매핑
  // ─────────────────────────────────────────────────────────
  describe('TEST-P5.4~P5.6 — status badge 정확 매핑', () => {
    it('9개 카드 모두에 status badge 가 존재한다 (data-testid="status-badge")', () => {
      // 모든 Feature 카드는 상태가 있어야 함 — BusinessSection 과의 차이.
      const { container } = render(<FeaturesSection />);
      const badges = container.querySelectorAll('[data-testid="status-badge"]');
      expect(badges.length).toBe(9);
    });

    it('done 상태 배지가 정확히 7개 존재한다 (카드 #1~#7)', () => {
      render(<FeaturesSection />);
      const doneText = i18n.t('features.status.done');
      const doneBadges = screen.getAllByText(doneText);
      expect(doneBadges.length).toBe(7);
    });

    it('wip 상태 배지가 정확히 1개 존재한다 (TEST-P5.4)', () => {
      render(<FeaturesSection />);
      const wipText = i18n.t('features.status.wip');
      const wipBadges = screen.getAllByText(wipText);
      expect(wipBadges.length).toBe(1);
    });

    it('planned 상태 배지가 정확히 1개 존재한다 (TEST-P5.5)', () => {
      render(<FeaturesSection />);
      const plannedText = i18n.t('features.status.planned');
      const plannedBadges = screen.getAllByText(plannedText);
      expect(plannedBadges.length).toBe(1);
    });

    it('"스크립트 실행·등록" 카드가 구체적으로 wip 배지를 가진다 (카드별 매핑 검증)', () => {
      // 리뷰 피드백 반영 (Medium): 이전 버전은 총량 (done×7 + wip×1 + planned×1)
      // 만 봤기 때문에 script 와 floating 의 status 가 뒤바뀌어도 통과했다.
      // 수정: 각 카드의 h3 제목을 찾고, 같은 article 내부의 badge 텍스트가
      // 설계 매핑과 일치하는지 검증.
      const { container } = render(<FeaturesSection />);
      const scriptTitle = i18n.t('features.items.script.title');
      const articles = Array.from(container.querySelectorAll('article'));
      const scriptCard = articles.find(
        (a) => a.querySelector('h3, h4, h5')?.textContent?.trim() === scriptTitle
      );
      expect(scriptCard, `"${scriptTitle}" 카드를 찾지 못함`).not.toBeUndefined();
      const badge = scriptCard?.querySelector('[data-testid="status-badge"]');
      expect(badge).not.toBeNull();
      expect(badge?.textContent?.trim()).toBe(i18n.t('features.status.wip'));
    });

    it('"Floating Helper" 카드가 구체적으로 planned 배지를 가진다 (카드별 매핑 검증)', () => {
      const { container } = render(<FeaturesSection />);
      const floatingTitle = i18n.t('features.items.floating.title');
      const articles = Array.from(container.querySelectorAll('article'));
      const floatingCard = articles.find(
        (a) => a.querySelector('h3, h4, h5')?.textContent?.trim() === floatingTitle
      );
      expect(floatingCard, `"${floatingTitle}" 카드를 찾지 못함`).not.toBeUndefined();
      const badge = floatingCard?.querySelector('[data-testid="status-badge"]');
      expect(badge).not.toBeNull();
      expect(badge?.textContent?.trim()).toBe(i18n.t('features.status.planned'));
    });

    it('badge 라벨이 i18n 적용되어 언어 전환 시 DOM 에서도 변경된다', async () => {
      // 리뷰 피드백 반영 (Medium): 이전 버전은 i18n.t() 반환값만 비교하고
      // rerender 후 DOM 에 실제 영문 badge 텍스트가 존재하는지 확인하지 않았다.
      // 컴포넌트가 statusLabel 을 하드코딩해도 통과할 수 있었다.
      //
      // 수정: rerender 후 screen.getAllByText(enText) 로 **DOM 에서** 영문
      // badge 라벨이 렌더되는지 직접 검증.
      const { rerender } = render(<FeaturesSection />);
      const koDone = i18n.t('features.status.done');
      const koWip = i18n.t('features.status.wip');
      const koPlanned = i18n.t('features.status.planned');
      // ko DOM 확인
      expect(screen.getAllByText(koDone).length).toBe(7);
      expect(screen.getAllByText(koWip).length).toBe(1);
      expect(screen.getAllByText(koPlanned).length).toBe(1);

      await i18n.changeLanguage('en');
      rerender(<FeaturesSection />);
      const enDone = i18n.t('features.status.done');
      const enWip = i18n.t('features.status.wip');
      const enPlanned = i18n.t('features.status.planned');
      // en 텍스트가 ko 텍스트와 다른지
      expect(enDone).not.toBe(koDone);
      expect(enWip).not.toBe(koWip);
      expect(enPlanned).not.toBe(koPlanned);
      // en DOM 에서 실제로 영문 badge 가 렌더되는지
      expect(screen.getAllByText(enDone).length).toBe(7);
      expect(screen.getAllByText(enWip).length).toBe(1);
      expect(screen.getAllByText(enPlanned).length).toBe(1);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 구조 계약 — id · h2 · data-testid · 반응형 grid
  // ─────────────────────────────────────────────────────────
  describe('구조 계약', () => {
    it('섹션 최상위에 <h2> 제목이 정확히 1개 렌더된다', () => {
      const { container } = render(<FeaturesSection />);
      const h2s = container.querySelectorAll('h2');
      expect(h2s.length).toBe(1);
    });

    it('h2 텍스트가 비어있지 않다 (i18n t("features.title") 렌더)', () => {
      render(<FeaturesSection />);
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    });

    it('h1 은 전혀 존재하지 않는다 (HeroSection 전용)', () => {
      const { container } = render(<FeaturesSection />);
      expect(container.querySelectorAll('h1').length).toBe(0);
    });

    it('id="features" 가 <section> 태그에 부여된다 (TEST-P5.7)', () => {
      // Hero Secondary CTA `href="#features"` + NAV_ANCHORS 첫 번째 ID.
      // 데모 `<Section id="features">` 를 완전 대체.
      const { container } = render(<FeaturesSection />);
      const section = container.querySelector('section#features');
      expect(section).not.toBeNull();
    });

    it('루트 <section> 이 data-testid="features-section" 을 갖는다 (TEST-P5.11)', () => {
      const { container } = render(<FeaturesSection />);
      const section = container.querySelector('section');
      expect(section).not.toBeNull();
      expect(section?.getAttribute('data-testid')).toBe('features-section');
    });

    it('반응형 grid 클래스 (md:grid-cols-2 + lg:grid-cols-3) 가 DOM 에 존재한다 (TEST-P5.13)', () => {
      // 3×3 grid: 모바일 1col → 태블릿 2col → 데스크톱 3col.
      const { container } = render(<FeaturesSection />);
      const hasGrid = Array.from(container.querySelectorAll('*')).some((el) => {
        if (typeof el.className !== 'string') return false;
        return /\bmd:grid-cols-2\b/.test(el.className) && /\blg:grid-cols-3\b/.test(el.className);
      });
      expect(hasGrid).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P5.9 — 언어 전환 회귀
  // ─────────────────────────────────────────────────────────
  describe('TEST-P5.9 — 언어 전환 회귀', () => {
    it('ko → en 전환 시 h2 제목 텍스트가 달라진다', async () => {
      const { rerender } = render(<FeaturesSection />);
      const koH2 = screen.getByRole('heading', { level: 2 }).textContent;
      expect(koH2?.length ?? 0).toBeGreaterThan(0);

      await i18n.changeLanguage('en');
      rerender(<FeaturesSection />);
      const enH2 = screen.getByRole('heading', { level: 2 }).textContent;
      expect(enH2?.length ?? 0).toBeGreaterThan(0);
      expect(enH2).not.toBe(koH2);
    });

    it('ko → en 전환 시 브랜드 명칭 외 카드 제목이 모두 달라진다', async () => {
      // 리뷰 피드백 반영 (Low): 이전 버전은 "9개 중 7개 이상 변경" 으로만
      // 검증해서 Action Tools/Floating Helper 가 아닌 다른 두 제목이
      // 고정돼도 통과할 수 있었다. 수정: 의도적으로 동일한 브랜드 명칭을
      // 명시적 allowlist 로 고정하고, 나머지는 전부 변경 강제.
      const BRAND_NAMES = ['Action Tools', 'Floating Helper'] as const;

      const { container, rerender } = render(<FeaturesSection />);
      const koTitles = Array.from(
        container.querySelectorAll('article h3, article h4, article h5')
      ).map((el) => el.textContent?.trim() ?? '');

      await i18n.changeLanguage('en');
      rerender(<FeaturesSection />);
      const enTitles = Array.from(
        container.querySelectorAll('article h3, article h4, article h5')
      ).map((el) => el.textContent?.trim() ?? '');

      expect(koTitles.length).toBe(9);
      expect(enTitles.length).toBe(9);

      for (let i = 0; i < 9; i++) {
        const isBrand = BRAND_NAMES.some((b) => koTitles[i] === b || enTitles[i] === b);
        if (isBrand) {
          // 브랜드 명칭은 ko/en 동일 허용 — 정확히 같은 값이어야 함
          expect(koTitles[i]).toBe(enTitles[i]);
        } else {
          // 일반 제목은 반드시 달라야 함 (i18n 적용 검증)
          expect(enTitles[i], `카드 #${i + 1} "${koTitles[i]}" 가 en 전환 후에도 동일`).not.toBe(
            koTitles[i]
          );
        }
      }
    });
  });
});
