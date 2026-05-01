/**
 * Phase 4 RED — HeroSection 컴포넌트
 * 대응 체크: TEST-P4.1 · TEST-P4.2 · TEST-P4.3 · TEST-P4.6
 *
 * HeroSection 책임:
 *   1. 루트 `<Section background="canvas">` 내부에 반응형 2컬럼 grid
 *      - 모바일 (< md): 1컬럼 (카피 → 이미지)
 *      - 데스크톱 (>= md): 2컬럼 (좌 카피 · 우 placeholder 이미지)
 *   2. 좌측 카피: eyebrow 라벨 → `<h1>` title → subtitle → Primary/Secondary CTA → 신뢰 라벨
 *   3. Primary CTA: `<Button href={CHROME_WEB_STORE_URL}>` — Button 자동 external 감지로
 *      target="_blank" + rel="noopener noreferrer" 자동 부여 (phase02 §14.2.4)
 *   4. Secondary CTA: `<Button href="#features">` — 내부 앵커 (데모 4번째 Section 또는
 *      Phase 5 FeaturesSection 을 가리킴)
 *   5. 우측: `<img src="/images/placeholder.svg">` — Phase 2 placeholder 재사용 (phase04 §4.3 TASK-006)
 *   6. 모든 카피는 `useTranslation()` 훅 + `t('hero.*')` 로 i18n 렌더
 *
 * 설계 계약:
 *   - HeroSection 에는 `id` 를 부여하지 않는다 (NAV_ANCHORS 앵커 대상 아님 — 랜딩 최상단)
 *   - h1 태그는 HeroSection 에만 있어야 함 (App.test.tsx 의 h1 유일성 가드가 강제)
 *
 * RED 기대 동작:
 *   `./HeroSection` 모듈이 아직 존재하지 않으므로 Vitest가 "Failed to resolve import"
 *   로 본 파일 전체를 FAIL 처리해야 한다.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';
import i18n from '../../i18n';
import { CHROME_WEB_STORE_URL } from '../../lib/constants';

describe('HeroSection (TEST-P4.1 + P4.2 + P4.3 + P4.6)', () => {
  beforeEach(async () => {
    // 각 케이스 전 ko 로 리셋 — navigator 감지 상태 변동 제거
    await i18n.changeLanguage('ko');
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P4.1 — 핵심 요소 렌더 (h1 · eyebrow · subtitle · CTA)
  // ─────────────────────────────────────────────────────────
  describe('TEST-P4.1 — 핵심 요소 렌더', () => {
    it('루트에 정확히 1개의 <h1> 이 존재한다 (h1 유일성 기본 가드)', () => {
      // HeroSection 외부(App.tsx 전체)에서의 h1 유일성은 App.test.tsx 에서 별도 검증.
      // 여기서는 HeroSection 자체에 h1 이 1개 있음을 확인.
      const { container } = render(<HeroSection />);
      const h1s = container.querySelectorAll('h1');
      expect(h1s.length).toBe(1);
    });

    it('eyebrow 라벨이 렌더된다 (i18n t("hero.eyebrow"))', () => {
      // phase04 §4.3 TASK-001 locale 스펙:
      //   ko.json hero.eyebrow = "Chrome Extension · AI Copilot"
      //   en.json hero.eyebrow = 동일 또는 번역판
      // 구체 문구는 구현 자유지만 Chrome/Extension/Copilot 중 하나는 포함되어야 함.
      render(<HeroSection />);
      expect(screen.getByText(/Chrome Extension|AI Copilot/i)).toBeInTheDocument();
    });

    it('h1 title 이 비어있지 않고 충분한 길이를 갖는다 (한국어 기본)', () => {
      // 구체 문구는 locale 스펙에 고정되나 테스트는 "길이 > 10 chars" 로 느슨하게.
      // 이유: 문구 변경 시 테스트가 부서지지 않도록 — 동시에 "빈 H1 회귀" 는 차단.
      render(<HeroSection />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1.textContent?.length ?? 0).toBeGreaterThan(10);
    });

    it('subtitle 단락이 h1 다음에 존재한다 (1개 이상의 <p>)', () => {
      // Hero 는 h1 + 서브카피 + CTA 구조. 서브카피는 <p> 태그로 렌더.
      const { container } = render(<HeroSection />);
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBeGreaterThanOrEqual(1);
    });

    it('subtitle <p> 가 i18n t("hero.subtitle") 실제 값을 렌더한다', () => {
      // 리뷰 피드백 반영 (Medium): 이전 버전은 `paragraphs.length >= 1` 만 검사해
      // hardcoded 문자열 또는 빈 <p> 가 들어가도 통과했다. i18n.t() 로 **정확한**
      // subtitle 문자열을 조회하고 screen 에서 그 텍스트가 실제로 렌더되는지 검증.
      //
      // 구현 컴포넌트가 useTranslation() 훅으로 subtitle 을 렌더하지 않으면 FAIL.
      // locale 키 추가는 Phase 4 GREEN TASK-001 에서 수행되므로 RED 시점엔
      // `hero.subtitle` 이 없어 t() 가 키 자체를 반환 → screen.getByText 도 키로
      // 찾게 되지만, 구현 컴포넌트가 아직 존재하지 않아 import 해석 단계에서 FAIL.
      const subtitle = i18n.t('hero.subtitle');
      render(<HeroSection />);
      expect(screen.getByText(subtitle)).toBeInTheDocument();
    });

    it('신뢰 라벨 (지원 AI 모드) 이 렌더된다', () => {
      // Hero 신뢰 문구: "OpenAI · Gemini · Claude · LM Studio 지원"
      // Phase 7 사후 수정: Didim 제거 → Claude 추가로 AIModesSection 과 정합성 확보.
      render(<HeroSection />);
      expect(screen.getByText(/OpenAI|Gemini|Claude|LM Studio/)).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P4.2 — Primary CTA (Chrome Web Store)
  // ─────────────────────────────────────────────────────────
  describe('TEST-P4.2 — Primary CTA (Chrome Web Store)', () => {
    it('Primary CTA 가 CHROME_WEB_STORE_URL 을 href 로 갖는다', () => {
      render(<HeroSection />);
      const primary = screen
        .getAllByRole('link')
        .find((el) => el.getAttribute('href') === CHROME_WEB_STORE_URL);
      expect(primary).toBeDefined();
    });

    it('Primary CTA 는 외부 링크 보안 속성을 갖는다 (Button 자동 external 감지)', () => {
      // Phase 2 §14.2.4 의 Button 자동 external 감지에 의존.
      // https:// URL 이면 external prop 없이도 target + noopener + noreferrer 자동 부여.
      // Header Primary CTA 와 동일 패턴 — 결과 기반 검증이므로 명시적 external 도 허용.
      render(<HeroSection />);
      const primary = screen
        .getAllByRole('link')
        .find((el) => el.getAttribute('href') === CHROME_WEB_STORE_URL);
      expect(primary).toBeDefined();
      expect(primary).toHaveAttribute('target', '_blank');
      const rel = primary?.getAttribute('rel') ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P4.3 — Secondary CTA (내부 앵커 #features)
  // ─────────────────────────────────────────────────────────
  describe('TEST-P4.3 — Secondary CTA (#features 앵커)', () => {
    it('Secondary CTA 가 "#features" 를 href 로 갖는다', () => {
      render(<HeroSection />);
      const secondary = screen
        .getAllByRole('link')
        .find((el) => el.getAttribute('href') === '#features');
      expect(secondary).toBeDefined();
    });

    it('Secondary CTA 는 내부 앵커이므로 target 속성이 없다', () => {
      // #features 는 http(s):// 가 아니므로 Button 자동 external 감지에서 제외됨.
      // Primary 와 Secondary 의 동작 차이를 명확히 구분.
      render(<HeroSection />);
      const secondary = screen
        .getAllByRole('link')
        .find((el) => el.getAttribute('href') === '#features');
      expect(secondary?.getAttribute('target')).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P4.6 — 언어 전환 시 Hero 텍스트 변경
  // ─────────────────────────────────────────────────────────
  describe('TEST-P4.6 — 언어 전환 회귀', () => {
    it('ko → en 전환 시 h1 텍스트가 달라진다', async () => {
      const { rerender } = render(<HeroSection />);
      const koH1 = screen.getByRole('heading', { level: 1 }).textContent;
      expect(koH1?.length ?? 0).toBeGreaterThan(0);

      await i18n.changeLanguage('en');
      rerender(<HeroSection />);
      const enH1 = screen.getByRole('heading', { level: 1 }).textContent;
      expect(enH1?.length ?? 0).toBeGreaterThan(0);
      expect(enH1).not.toBe(koH1);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 구조 계약 — placeholder 이미지 + 2컬럼 레이아웃
  // ─────────────────────────────────────────────────────────
  describe('구조 계약', () => {
    it('placeholder 이미지가 <img> 태그로 렌더되고 alt 가 i18n t("hero.imageAlt") 실제 값을 쓴다', () => {
      // phase04 §4.3 TASK-006: public/images/placeholder.svg 재사용 결정.
      //
      // 리뷰 피드백 반영 (Medium): 이전 버전은 `alt?.length > 0` 으로만 검사해서
      // 구현이 alt={t('hero.imageAlt')} 를 쓰더라도 locale 에 해당 키가 없으면
      // t() 가 키 문자열("hero.imageAlt") 을 그대로 반환하여 길이 > 0 으로 통과했다.
      // 즉 접근성 회귀를 놓칠 수 있었다.
      //
      // 수정: i18n.t('hero.imageAlt') 로 조회한 실제 번역 값과 DOM alt 가 정확히
      // 일치해야 한다. locale 에 키가 없으면 t() 가 "hero.imageAlt" 를 반환 →
      // 이 케이스는 i18n.test.ts 의 required-key 가드(hero.imageAlt 포함)가 먼저
      // FAIL 하도록 이중 방어가 설계되어 있다.
      const expectedAlt = i18n.t('hero.imageAlt');
      const { container } = render(<HeroSection />);
      const img = container.querySelector('img');
      expect(img).not.toBeNull();
      expect(img?.getAttribute('src')).toMatch(/placeholder|hero-mock|hero-demo/);
      expect(img?.getAttribute('alt')).toBe(expectedAlt);
      // 추가 보조 가드: alt 가 literal 키 문자열("hero.imageAlt") 이면 안 된다.
      // i18n.test.ts required-key 가드가 먼저 막겠지만, 이 레벨에서도 한 번 더
      // 직접 차단해 접근성 회귀의 경로를 이중으로 닫는다.
      expect(img?.getAttribute('alt')).not.toBe('hero.imageAlt');
      expect((img?.getAttribute('alt') ?? '').trim().length).toBeGreaterThan(0);
    });

    it('루트 <section> 태그 1개를 갖는다 (Section 공통 컴포넌트 래핑)', () => {
      // Section 컴포넌트가 <section> 으로 래핑하므로 HeroSection 에도 section 이 1개 존재.
      const { container } = render(<HeroSection />);
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBe(1);
    });

    it('id 속성을 부여하지 않는다 (NAV_ANCHORS 앵커 대상 아님)', () => {
      // Hero 는 랜딩 최상단 — 네비 앵커 대상이 아니므로 id 없음이 의도.
      // NAV_ANCHORS 가 features/scenarios/differentiation/roadmap 4개만 관리.
      const { container } = render(<HeroSection />);
      const section = container.querySelector('section');
      expect(section?.getAttribute('id')).toBeNull();
    });

    it('루트 <section> 이 data-testid="hero-section" 을 갖는다 (공개 계약)', () => {
      // 리뷰 피드백 반영 (Medium): App.test.tsx 의 TEST-P4.10 / P4.11 가 "Hero/Problem
      // 이 실제로 렌더되는지" 를 직접 확인하려면 Badge/LanguageSwitcher 와 같은
      // `data-testid` 공개 계약이 필요하다. Hero 는 h1 유일성에 편승해 우연히
      // PASS 할 수 있어 더더욱 직접 식별자가 중요.
      //
      // 계약:
      //   1. HeroSection 루트 <section> 이 data-testid="hero-section" 을 가진다
      //   2. 구현 컴포넌트가 이 속성을 제거/변경하면 App.test.tsx 가드와 본 테스트
      //      양쪽에서 즉시 FAIL → 회귀 차단
      const { container } = render(<HeroSection />);
      const section = container.querySelector('section');
      expect(section).not.toBeNull();
      expect(section?.getAttribute('data-testid')).toBe('hero-section');
    });

    it('모바일 소스 순서: h1(카피) 이 <img>(이미지) 보다 DOM 상 앞에 위치한다', () => {
      // 리뷰 피드백 반영 (Medium): phase04 §4.3 TASK-002 계약은 모바일에서
      //   "1컬럼 (카피 위 → 이미지 아래)"
      // 를 요구한다. 이전 구현은 이미지 래퍼에 `order-first md:order-none` 을
      // 주어 모바일(grid-cols-1) 에서 이미지가 카피 **위** 에 렌더되었다.
      // happy-dom 은 CSS `order` 속성의 레이아웃 효과를 시뮬레이션하지 않으므로
      // 순수 DOM 소스 순서로 "h1 이 img 보다 앞" 을 검증한다.
      //
      // 이 가드는 `order-first` 를 다시 붙이는 회귀를 즉시 탐지한다.
      //   - 수정된 구현은 order 유틸 없이 순수 소스 순서 (카피 div → 이미지 div)
      //     로 모바일 1컬럼 레이아웃에서 카피가 먼저 렌더된다.
      //   - 데스크톱 2컬럼(md:grid-cols-2) 에서는 grid 가 소스 순서를 좌→우로
      //     배치하므로 좌 카피 / 우 이미지가 된다.
      const { container } = render(<HeroSection />);
      const h1 = container.querySelector('h1');
      const img = container.querySelector('img');
      expect(h1).not.toBeNull();
      expect(img).not.toBeNull();
      // h1 이 img 보다 먼저 등장해야 함 (Node.DOCUMENT_POSITION_FOLLOWING = 4)
      // h1.compareDocumentPosition(img) 가 4 를 포함하면 "img 는 h1 뒤에 있다"
      const imgFollowsH1 =
        (h1!.compareDocumentPosition(img!) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
      expect(imgFollowsH1).toBe(true);

      // 보조 가드: 이미지 래퍼 또는 img 자신에 `order-first` 같은 모바일
      // 재배치 유틸이 걸려있지 않다 — 회귀 시 동일 Tailwind 토큰이 다시
      // 등장하면 즉시 FAIL.
      const imgWrapper = img!.parentElement;
      const wrapperCls = imgWrapper?.className ?? '';
      expect(wrapperCls).not.toMatch(/\border-first\b/);
      expect(wrapperCls).not.toMatch(/\border-1\b/);
    });

    it('반응형 2컬럼 grid 클래스 (md:grid-cols-2) 가 DOM 에 존재한다', () => {
      // phase04 §4.3 TASK-002 구조 계약: 모바일 1컬럼 → 데스크톱 2컬럼.
      // 이전 버전은 grid 레이아웃 존재 여부를 전혀 검증하지 않아 실수로
      // `flex flex-col` 등으로 구현해도 통과했다. Tailwind 클래스 문자열을
      // 직접 매칭하여 "응답형 2컬럼 grid" 계약을 강제.
      //
      // 구현 자유: HeroSection 내부 어느 div 에든 `md:grid-cols-2` 클래스가
      // 있으면 PASS (Section 공통 컴포넌트의 내부 래퍼 제외). grid 가 아닌
      // 다른 방식으로 2컬럼을 만들면 이 가드에 의해 FAIL → 설계 변경 시점에
      // 본 테스트를 함께 갱신해야 함을 알림.
      const { container } = render(<HeroSection />);
      const hasResponsiveGrid = Array.from(container.querySelectorAll('*')).some(
        (el) =>
          el.className &&
          typeof el.className === 'string' &&
          /\bmd:grid-cols-2\b/.test(el.className)
      );
      expect(hasResponsiveGrid).toBe(true);
    });
  });
});
