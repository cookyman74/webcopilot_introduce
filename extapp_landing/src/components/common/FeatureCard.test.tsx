/**
 * Phase 2 디자인 시스템 RED — FeatureCard 공통 컴포넌트
 * 대응 체크: TEST-P2.8 (with status) · TEST-P2.9 (without status, BusinessSection 대응)
 *
 * FeatureCard 는 두 가지 용도로 재사용된다:
 *   (1) 제품 기능 카드 (Features · Roadmap) — status + statusLabel 로 배지 렌더
 *   (2) 비즈니스 가치 카드 (BusinessSection §5.10) — status 없이 배지 없이 렌더
 *
 * 설계 제약 (02_implementation_plan.md §5.10, working_plan/phase08 TEST-P8.9):
 *   "BusinessSection 의 가치 카드에는 상태 배지 사용 금지."
 *   FeatureCard 를 재사용하되 Badge 는 **일체** 렌더되지 않아야 한다.
 *
 * 책임:
 *   1. title, description 은 **필수** props
 *   2. status/statusLabel 은 **선택** props — 둘 다 있으면 Badge 렌더,
 *      없으면 Badge 렌더 안 함 (그리고 DOM 에 [data-testid="status-badge"]
 *      가 존재하지 않아야 함)
 *   3. status/statusLabel 을 **하나만** 전달하는 것은 타입 수준에서 금지
 *      (discriminated union). 테스트는 허용된 두 케이스만 검증.
 *   4. icon, example 은 선택 props
 *   5. 루트 태그는 `<article>` — Phase 8 TEST-P8.7 의 `getAllByRole('article')`
 *      이 이 선택에 의존
 *
 * RED 기대 동작:
 *   `./FeatureCard` 모듈이 존재하지 않으므로 Vitest가 "Failed to resolve import"
 *   로 본 파일 전체를 FAIL 처리해야 한다.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureCard } from './FeatureCard';

describe('FeatureCard 공통 컴포넌트', () => {
  // ─────────────────────────────────────────────────────────
  // TEST-P2.8 — 상태 배지 포함 케이스 (제품 기능 섹션)
  // ─────────────────────────────────────────────────────────
  describe('TEST-P2.8 — with status (Features · Roadmap 용)', () => {
    it('title, description, statusLabel 이 모두 렌더된다', () => {
      render(
        <FeatureCard
          title="AI 채팅"
          description="페이지 문맥 기반 질문"
          status="done"
          statusLabel="구현됨"
        />
      );
      expect(screen.getByText('AI 채팅')).toBeInTheDocument();
      expect(screen.getByText('페이지 문맥 기반 질문')).toBeInTheDocument();
      expect(screen.getByText('구현됨')).toBeInTheDocument();
    });

    it('example prop 이 주어지면 "예: ..." 형태로 노출된다', () => {
      render(
        <FeatureCard
          title="AI 채팅"
          description="페이지 문맥 기반 질문"
          example="이 페이지 요약해줘"
          status="done"
          statusLabel="구현됨"
        />
      );
      // "예: 이 페이지 요약해줘" 같이 prefix 는 구현 자유, 본문만 검증
      expect(screen.getByText(/이 페이지 요약해줘/)).toBeInTheDocument();
    });

    it('status 가 주어지면 [data-testid="status-badge"] 가 DOM 에 존재한다', () => {
      render(<FeatureCard title="t" description="d" status="wip" statusLabel="보강 중" />);
      expect(screen.getByTestId('status-badge')).toBeInTheDocument();
    });

    it('icon prop 이 주어지면 카드 내부에 렌더된다', () => {
      render(
        <FeatureCard
          title="t"
          description="d"
          status="done"
          statusLabel="구현됨"
          icon={<svg data-testid="feature-icon" aria-hidden />}
        />
      );
      expect(screen.getByTestId('feature-icon')).toBeInTheDocument();
    });

    it('3종 상태(done/wip/planned) 각각에 대해 Badge 가 해당 라벨로 렌더된다', () => {
      const cases = [
        { status: 'done', label: '구현됨' },
        { status: 'wip', label: '보강 중' },
        { status: 'planned', label: '계획·검토 중' },
      ] as const;

      for (const { status, label } of cases) {
        const { unmount } = render(
          <FeatureCard title="t" description="d" status={status} statusLabel={label} />
        );
        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByTestId('status-badge')).toBeInTheDocument();
        unmount();
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P2.9 — status 없는 케이스 (BusinessSection 대응)
  // ─────────────────────────────────────────────────────────
  describe('TEST-P2.9 — without status (BusinessSection §5.10 대응)', () => {
    it('status/statusLabel 없이 호출해도 title/description 이 정상 렌더된다', () => {
      render(
        <FeatureCard
          title="페이지 문맥 기반 AI"
          description="사용자 컨텍스트를 잃지 않는 AI 파이프라인"
        />
      );
      expect(screen.getByText('페이지 문맥 기반 AI')).toBeInTheDocument();
      expect(screen.getByText('사용자 컨텍스트를 잃지 않는 AI 파이프라인')).toBeInTheDocument();
    });

    it('status 없는 경우 [data-testid="status-badge"] 가 DOM 에 전혀 존재하지 않는다', () => {
      // Phase 8 TEST-P8.9 "BusinessSection 내부에 Badge 가 하나도 없음" 의
      // 토대가 되는 계약. 이 가드가 실패하면 BusinessSection 이 카피 오염을
      // 막을 방법이 없어진다.
      const { container } = render(
        <FeatureCard
          title="Action Tools 에이전트"
          description="브라우저를 직접 조작하는 안전 경계 기반 자동화"
        />
      );
      expect(container.querySelectorAll('[data-testid="status-badge"]').length).toBe(0);
      expect(screen.queryByTestId('status-badge')).toBeNull();
    });

    it('상태 텍스트("구현됨"·"보강 중"·"계획" 등)가 DOM 에 전혀 누출되지 않는다', () => {
      // BusinessSection 은 제품 구현 상태를 주장하지 않고 "기술 재사용 가능성"
      // 을 제안하는 섹션이다. 상태 문구가 우연히 description 등에 섞이면
      // 의도와 충돌하므로, 기본 사용례에서 상태 텍스트가 없어야 한다.
      const { container } = render(
        <FeatureCard
          title="스크립트 실행/등록 인프라"
          description="사이트별 확장 자산을 안전하게 운영"
        />
      );
      const text = container.textContent ?? '';
      expect(text).not.toMatch(/구현됨/);
      expect(text).not.toMatch(/보강 중/);
      expect(text).not.toMatch(/계획/);
      expect(text).not.toMatch(/\bwip\b/i);
      expect(text).not.toMatch(/\bplanned\b/i);
    });

    it('status 없는 경우에도 icon 은 여전히 렌더 가능하다', () => {
      render(
        <FeatureCard
          title="t"
          description="d"
          icon={<svg data-testid="business-icon" aria-hidden />}
        />
      );
      expect(screen.getByTestId('business-icon')).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────────────────
  // 공통 — 루트 태그 <article> (Phase 8 getAllByRole 호환)
  // ─────────────────────────────────────────────────────────
  describe('공통 — 루트 태그는 <article>', () => {
    // phase08 TEST-P8.7 이 `screen.getAllByRole('article').length === 3` 로
    // RoadmapSection / BusinessSection 의 카드 개수를 검증하므로, 두 케이스
    // 모두 article role 을 가져야 한다.
    //
    // v2: 리뷰 피드백 반영 — `querySelector('article')` 은 중첩된 자식 article
    // 에도 매칭되므로 루트 검증이 느슨하다. `container.firstElementChild`
    // 의 tagName 을 직접 확인하여 **루트 요소 자체가 <article>** 임을
    // 강제한다.

    it('status 있음 케이스에서 루트 요소 자체가 <article> 이다', () => {
      const { container } = render(
        <FeatureCard title="t" description="d" status="done" statusLabel="구현됨" />
      );
      const root = container.firstElementChild;
      expect(root).not.toBeNull();
      expect(root?.tagName).toBe('ARTICLE');
    });

    it('status 없음 케이스에서 루트 요소 자체가 <article> 이다', () => {
      const { container } = render(<FeatureCard title="t" description="d" />);
      const root = container.firstElementChild;
      expect(root).not.toBeNull();
      expect(root?.tagName).toBe('ARTICLE');
    });

    it('컨테이너 내부에 정확히 1개의 article 만 존재한다 (중첩 금지)', () => {
      const { container } = render(<FeatureCard title="t" description="d" />);
      expect(container.querySelectorAll('article').length).toBe(1);
    });

    it('article 이 role="article" 로 접근 가능하다 (Phase 8 getAllByRole 대응)', () => {
      // phase08 TEST-P8.7 가 정확히 이 selector 로 카드 개수를 센다.
      render(<FeatureCard title="t" description="d" />);
      const articles = screen.getAllByRole('article');
      expect(articles.length).toBe(1);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 타입 레벨 강제 — discriminated union props (GREEN 활성화됨)
  // ─────────────────────────────────────────────────────────
  describe('타입 레벨 강제 — status/statusLabel 둘 다 있거나 둘 다 없음', () => {
    // RED 단계에서는 `./FeatureCard` 모듈이 없어 `@ts-expect-error` 가
    // "unused directive" 로 판정됐기 때문에 `it.todo` 로 문서화만 했다.
    // GREEN 단계에서 FeatureCard 가 discriminated union 으로 구현되어
    // 잘못된 조합이 실제로 타입 에러를 발생시키므로, 이제 `@ts-expect-error`
    // 가 **typecheck 게이트** 로 작동한다.
    //
    // 작동 원리:
    //   - 잘못된 props 조합 → 타입 에러 발생 → `@ts-expect-error` 가
    //     "기대한 에러를 삼킴" → typecheck PASS
    //   - 타입 에러가 안 나면 → 주석이 "불필요" 로 판정 → typecheck FAIL (TS2578)
    // 따라서 아래 3개 케이스는 **컴파일 시점에만** 의미를 가지며, 런타임
    // 실행은 불필요하므로 `it.skip` 으로 실행을 건너뛴다.

    it.skip('status 만 전달 — discriminated union 위반 (타입 에러 기대)', () => {
      render(
        // @ts-expect-error — status 는 있지만 statusLabel 누락
        <FeatureCard title="t" description="d" status="done" />
      );
    });

    it.skip('statusLabel 만 전달 — discriminated union 위반 (타입 에러 기대)', () => {
      render(
        // @ts-expect-error — statusLabel 는 있지만 status 누락
        <FeatureCard title="t" description="d" statusLabel="구현됨" />
      );
    });

    it.skip('잘못된 status 값("unknown") — 리터럴 유니온 위반 (타입 에러 기대)', () => {
      render(
        // @ts-expect-error — 'done'|'wip'|'planned' 외 값은 허용 안 됨
        <FeatureCard title="t" description="d" status="unknown" statusLabel="x" />
      );
    });

    // ── 런타임 positive control ──
    // 타입 레벨 차단과 별개로, 허용 케이스 2개가 정상 동작함을 런타임으로
    // 검증. 타입 레벨 게이트가 의도치 않게 완화됐을 때 이 positive control
    // 이 살아 있어야 전체 로직이 건전함을 확인할 수 있다.
    it('허용 케이스 2개(with status / without status) 는 정상 동작한다 — positive control', () => {
      render(
        <FeatureCard
          title="허용 케이스 (둘 다 있음)"
          description="d"
          status="done"
          statusLabel="구현됨"
        />
      );
      render(<FeatureCard title="허용 케이스 (둘 다 없음)" description="d" />);
      expect(screen.getByText('허용 케이스 (둘 다 있음)')).toBeInTheDocument();
      expect(screen.getByText('허용 케이스 (둘 다 없음)')).toBeInTheDocument();
    });
  });
});
