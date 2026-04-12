/**
 * Phase 4 RED — ProblemSection 컴포넌트
 * 대응 체크: TEST-P4.4 · TEST-P4.6
 *
 * ProblemSection 책임:
 *   1. 루트 `<Section background="surface">` + h2 제목 + 4개 문제 카드 그리드
 *      - 모바일 (< md): 1컬럼
 *      - 태블릿 (md): 2×2 (md:grid-cols-2)
 *      - 데스크톱 (lg): 1×4 (lg:grid-cols-4)
 *   2. 각 카드는 `<article>` + 아이콘 placeholder + `<h3>` 제목 + `<p>` 설명
 *   3. i18n 적용: `problem.title` (섹션 h2) + `problem.items.{p1..p4}.{title,desc}`
 *   4. `['p1','p2','p3','p4'].map()` 데이터화 (phase04 §4.4 REFACTOR-STRUCTURE 선반영)
 *   5. region landmark 접근성 — `aria-labelledby` 로 h2 참조
 *
 * 설계 계약:
 *   - ProblemSection 에는 `id` 를 부여하지 않는다 (NAV_ANCHORS 앵커 대상 아님)
 *   - 섹션 h2 가 페이지 내 최상위 h1 (Hero) 보다 하위 level 이어야 함
 *
 * RED 기대 동작:
 *   `./ProblemSection` 모듈이 아직 존재하지 않으므로 Vitest가 "Failed to resolve
 *   import" 로 본 파일 전체를 FAIL 처리해야 한다.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProblemSection } from './ProblemSection';
import i18n from '../../i18n';

describe('ProblemSection (TEST-P4.4 + P4.6)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P4.4 — 4개 문제 카드 렌더
  // ─────────────────────────────────────────────────────────
  describe('TEST-P4.4 — 4개 문제 카드', () => {
    it('정확히 4개의 <article> 을 렌더한다', () => {
      // phase04 §4.3 TASK-001 locale 스펙:
      //   problem.items.p1~p4 = 4개 (웹 작업 반복/AI 답변만/자동화 코드 장벽/페이지 재정리)
      // 각 카드는 <article> 루트여야 screen.getAllByRole('article') 카운팅 가능.
      const { container } = render(<ProblemSection />);
      const articles = container.querySelectorAll('article');
      expect(articles.length).toBe(4);
    });

    it('getAllByRole("article") 로도 정확히 4개 접근 가능하다', () => {
      // 위와 동일 검증을 접근성 role 관점에서 재확인.
      // testing-library 의 role 기반 쿼리는 aria/semantic 양쪽을 고려하므로 더 엄격.
      render(<ProblemSection />);
      const articles = screen.getAllByRole('article');
      expect(articles.length).toBe(4);
    });

    it('4개 카드 각각에 <h3> 또는 동급 heading 이 1개 이상 존재한다', () => {
      // 카드 내부 구조: 아이콘 → h3 제목 → p 설명
      // 설계 문서 (§4.3 TASK-003) 는 h3 을 권장하지만 h4/h5 도 허용 (구현 자유).
      const { container } = render(<ProblemSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        const heading = article.querySelector('h3, h4, h5');
        expect(heading).not.toBeNull();
        expect(heading?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });

    it('4개 카드 각각에 설명 <p> 단락이 1개 이상 존재한다', () => {
      // phase04 §4.3 TASK-001: problem.items.*.desc 가 각 카드의 설명.
      // 비어있는 카드 (desc 누락) 회귀 방지.
      const { container } = render(<ProblemSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        const paragraphs = article.querySelectorAll('p');
        expect(paragraphs.length).toBeGreaterThanOrEqual(1);
        // 첫 번째 <p> 는 빈 문자열이 아니어야 함
        const firstParagraph = paragraphs[0];
        expect(firstParagraph?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // 구조 계약 — h2 제목 + region 접근성
  // ─────────────────────────────────────────────────────────
  describe('구조 계약 — h2 제목 + region', () => {
    it('섹션 최상위에 <h2> 제목이 정확히 1개 렌더된다', () => {
      // ProblemSection 은 h1 을 쓰지 않음 (h1 은 HeroSection 전용).
      // 섹션 제목은 h2 로 고정.
      const { container } = render(<ProblemSection />);
      const h2s = container.querySelectorAll('h2');
      expect(h2s.length).toBe(1);
    });

    it('h2 텍스트가 비어있지 않다 (i18n t("problem.title") 렌더)', () => {
      render(<ProblemSection />);
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    });

    it('h1 은 전혀 존재하지 않는다 (HeroSection 전용이므로)', () => {
      // ProblemSection 에서 실수로 h1 을 쓰면 App 전체 h1 유일성 가드가 깨짐.
      // 이를 컴포넌트 단위에서 선제적으로 차단.
      const { container } = render(<ProblemSection />);
      const h1s = container.querySelectorAll('h1');
      expect(h1s.length).toBe(0);
    });

    it('섹션 루트 <section> 이 aria-labelledby 또는 aria-label 로 접근 가능하다', () => {
      // region landmark 접근성 — 스크린리더 사용자가 섹션을 건너뛰며 탐색 가능해야 함.
      // 구현 자유: aria-labelledby="problem-heading" + h2 id="problem-heading" 패턴 권장.
      const { container } = render(<ProblemSection />);
      const section = container.querySelector('section');
      expect(section).not.toBeNull();
      const hasLabel =
        section?.hasAttribute('aria-label') || section?.hasAttribute('aria-labelledby');
      expect(hasLabel).toBe(true);
    });

    it('aria-labelledby 를 사용할 경우 그 값이 실제 h2 id 를 가리킨다', () => {
      // 리뷰 피드백 반영 (Low): 이전 버전은 `hasAttribute` 만 확인해 값이
      // 빈 문자열이거나 존재하지 않는 id 를 가리켜도 통과했다. 스크린리더가
      // "region" 으로 그룹화하려면 aria-labelledby 가 가리키는 id 가 실제로
      // DOM 에 존재해야 하며, 그 요소가 의미 있는 heading 이어야 한다.
      //
      // 검증 로직:
      //   1. aria-label 만 쓰는 경우 → 검증 생략 (이미 위 테스트에서 라벨 존재 확인)
      //   2. aria-labelledby 를 쓰는 경우:
      //      (a) 값이 빈 문자열이 아니어야 함
      //      (b) 해당 id 를 가진 요소가 섹션 내부에 존재해야 함
      //      (c) 그 요소가 h2 (섹션 heading) 이어야 함
      //      (d) 텍스트가 비어있지 않아야 함
      const { container } = render(<ProblemSection />);
      const section = container.querySelector('section');
      expect(section).not.toBeNull();
      const labelledBy = section?.getAttribute('aria-labelledby');
      if (labelledBy !== null && labelledBy !== undefined) {
        expect(labelledBy.trim().length).toBeGreaterThan(0);
        const target = container.querySelector(`#${labelledBy}`);
        expect(
          target,
          `aria-labelledby="${labelledBy}" 가 가리키는 id 요소가 DOM 에 없음`
        ).not.toBeNull();
        expect(target?.tagName).toBe('H2');
        expect(target?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });

    it('id 속성을 부여하지 않는다 (NAV_ANCHORS 앵커 대상 아님)', () => {
      // Problem 은 NAV_ANCHORS 4개 (features/scenarios/differentiation/roadmap) 에 없음.
      // 데모 Section 의 4개 ID 와 충돌하지 않도록 id 부여 금지.
      const { container } = render(<ProblemSection />);
      const section = container.querySelector('section');
      expect(section?.getAttribute('id')).toBeNull();
    });

    it('루트 <section> 이 data-testid="problem-section" 을 갖는다 (공개 계약)', () => {
      // 리뷰 피드백 반영 (Medium): App.test.tsx 의 TEST-P4.11 가 "ProblemSection
      // 이 실제로 렌더되는지" 를 직접 확인하려면 `data-testid` 공개 계약이
      // 필요하다. 이전 버전은 전역 article 수 >= 6 으로 간접 검증해서 다른
      // 섹션이 article 을 추가하면 ProblemSection 이 없어도 통과하는 결함이 있었다.
      //
      // 계약:
      //   1. ProblemSection 루트 <section> 이 data-testid="problem-section" 을 가진다
      //   2. 구현 컴포넌트가 이 속성을 제거/변경하면 App.test.tsx 가드와 본 테스트
      //      양쪽에서 즉시 FAIL → 회귀 차단
      const { container } = render(<ProblemSection />);
      const section = container.querySelector('section');
      expect(section).not.toBeNull();
      expect(section?.getAttribute('data-testid')).toBe('problem-section');
    });

    it('반응형 카드 그리드 클래스 (md:grid-cols-2 + lg:grid-cols-4) 가 DOM 에 존재한다', () => {
      // phase04 §4.3 TASK-003 구조 계약:
      //   모바일: 1컬럼 → 태블릿(md): 2×2 → 데스크톱(lg): 1×4
      //   Tailwind 예: `grid gap-6 md:grid-cols-2 lg:grid-cols-4`
      //
      // 이전 버전은 grid 레이아웃 존재 여부를 전혀 검증하지 않아 4개 카드가
      // 단일 컬럼으로 스택되어도 통과했다. 두 breakpoint 클래스를 모두
      // 요구하여 "태블릿 2열 + 데스크톱 4열" 설계 계약을 강제한다.
      //
      // 구현 자유: ProblemSection 내부 어느 요소에든 두 클래스가 동일 요소에
      // 있으면 PASS. 별도 breakpoint (sm/xl) 로 변경하면 FAIL → 설계 변경 시점에
      // 본 테스트를 함께 갱신해야 함을 알림.
      const { container } = render(<ProblemSection />);
      const hasResponsiveGrid = Array.from(container.querySelectorAll('*')).some((el) => {
        if (typeof el.className !== 'string') return false;
        return /\bmd:grid-cols-2\b/.test(el.className) && /\blg:grid-cols-4\b/.test(el.className);
      });
      expect(hasResponsiveGrid).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P4.6 — 언어 전환 회귀
  // ─────────────────────────────────────────────────────────
  describe('TEST-P4.6 — 언어 전환 회귀', () => {
    it('ko → en 전환 시 h2 제목 텍스트가 달라진다', async () => {
      const { rerender } = render(<ProblemSection />);
      const koH2 = screen.getByRole('heading', { level: 2 }).textContent;
      expect(koH2?.length ?? 0).toBeGreaterThan(0);

      await i18n.changeLanguage('en');
      rerender(<ProblemSection />);
      const enH2 = screen.getByRole('heading', { level: 2 }).textContent;
      expect(enH2?.length ?? 0).toBeGreaterThan(0);
      expect(enH2).not.toBe(koH2);
    });

    it('ko → en 전환 시 4개 카드 제목이 모두 달라진다', async () => {
      // 각 카드의 i18n 키 problem.items.{p1..p4}.title 이 언어 전환에 반응하는지 확인.
      // 한 카드라도 hardcoded 이면 이 가드가 FAIL.
      const { container, rerender } = render(<ProblemSection />);
      const koTitles = Array.from(
        container.querySelectorAll('article h3, article h4, article h5')
      ).map((el) => el.textContent?.trim() ?? '');

      await i18n.changeLanguage('en');
      rerender(<ProblemSection />);
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
