/**
 * Phase 2 디자인 시스템 RED — Badge 공통 컴포넌트
 * 대응 체크: TEST-P2.5 (done) · TEST-P2.6 (wip) · TEST-P2.7 (planned)
 *
 * Badge 는 기능/로드맵 카드의 구현 상태를 명시하는 핵심 장치.
 * 3종: done(구현됨) · wip(보강 중) · planned(계획·검토 중)
 *
 * 책임:
 *   1. 각 status 에 맞는 **디자인 토큰(status-*) 을 반드시 사용** 한다
 *      — 하드코딩 팔레트(emerald/amber/stone) 만 쓰는 구현은 FAIL
 *   2. children 텍스트(라벨)를 그대로 노출한다
 *   3. `data-testid="status-badge"` 를 부착한다 (FeatureCard TEST-P2.9 와
 *      Phase 8 TEST-P8.9 가 이 selector 에 의존)
 *
 * 핵심 불변조건:
 *   - data-testid 가 없으면 BusinessSection(§5.10) 의 "Badge 부재" 강제가
 *     깨진다. 이 testid 는 Badge 계약의 일부로 봐야 한다.
 *   - status-done/wip/planned 토큰을 반드시 사용해야 한다. 설계 문서
 *     (02_implementation_plan.md §4.2) 가 정의한 status 토큰을 우회해서
 *     emerald-500 같은 기본 팔레트만 쓰는 구현은 브랜드 토큰 체계를 깨뜨린다.
 *
 * RED 기대 동작:
 *   `./Badge` 모듈이 존재하지 않으므로 Vitest가 "Failed to resolve import"
 *   로 본 파일 전체를 FAIL 처리해야 한다.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge 공통 컴포넌트', () => {
  // ─────────────────────────────────────────────────────────
  // TEST-P2.5 — done 상태
  // ─────────────────────────────────────────────────────────
  describe('TEST-P2.5 — status="done" (구현됨)', () => {
    it('children 으로 전달된 라벨을 렌더한다', () => {
      render(<Badge status="done">구현됨</Badge>);
      expect(screen.getByText('구현됨')).toBeInTheDocument();
    });

    it('status-done 디자인 토큰 클래스를 반드시 사용한다 (하드코딩 팔레트 금지)', () => {
      // 리뷰 피드백 반영: 이전 버전은 /status-done|emerald/ 로 OR 조건이었으나,
      // 이는 토큰을 우회하고 emerald 기본 팔레트만 써도 통과시켰다.
      // 수정: status-done 토큰 사용을 **필수**로 강제하고, 팔레트(emerald)는
      // 보조 표현으로만 허용.
      const { container } = render(<Badge status="done">구현됨</Badge>);
      const badge = container.querySelector('[data-testid="status-badge"]');
      expect(badge).not.toBeNull();
      // (a) 반드시: status-done 토큰이 className 에 존재
      expect(badge?.className).toMatch(/\bstatus-done\b/);
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P2.6 — wip 상태
  // ─────────────────────────────────────────────────────────
  describe('TEST-P2.6 — status="wip" (보강 중)', () => {
    it('children 으로 전달된 라벨을 렌더한다', () => {
      render(<Badge status="wip">보강 중</Badge>);
      expect(screen.getByText('보강 중')).toBeInTheDocument();
    });

    it('status-wip 디자인 토큰 클래스를 반드시 사용한다 (하드코딩 팔레트 금지)', () => {
      const { container } = render(<Badge status="wip">보강 중</Badge>);
      const badge = container.querySelector('[data-testid="status-badge"]');
      expect(badge).not.toBeNull();
      expect(badge?.className).toMatch(/\bstatus-wip\b/);
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P2.7 — planned 상태
  // ─────────────────────────────────────────────────────────
  describe('TEST-P2.7 — status="planned" (계획·검토 중)', () => {
    it('children 으로 전달된 라벨을 렌더한다', () => {
      render(<Badge status="planned">계획·검토 중</Badge>);
      expect(screen.getByText('계획·검토 중')).toBeInTheDocument();
    });

    it('status-planned 디자인 토큰 클래스를 반드시 사용한다 (하드코딩 팔레트 금지)', () => {
      const { container } = render(<Badge status="planned">계획·검토 중</Badge>);
      const badge = container.querySelector('[data-testid="status-badge"]');
      expect(badge).not.toBeNull();
      expect(badge?.className).toMatch(/\bstatus-planned\b/);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 교차 검증 — 3종이 시각적으로 구분되어야 함
  // ─────────────────────────────────────────────────────────
  describe('교차 검증 (3종 시각 구분 · 토큰 전체 매핑)', () => {
    it('done · wip · planned 세 상태의 className 이 서로 다르다', () => {
      // 단순 props 전달만 하고 같은 스타일이 적용되면 상태 구분이 무의미.
      // 3개 조합 모두 서로 달라야 한다 (3개 중 2개가 같으면 FAIL).
      const { container: a } = render(<Badge status="done">a</Badge>);
      const { container: b } = render(<Badge status="wip">b</Badge>);
      const { container: c } = render(<Badge status="planned">c</Badge>);
      const classNames = [a, b, c].map(
        (x) => x.querySelector('[data-testid="status-badge"]')?.className ?? ''
      );
      expect(classNames[0]).not.toBe(classNames[1]);
      expect(classNames[1]).not.toBe(classNames[2]);
      expect(classNames[0]).not.toBe(classNames[2]);
    });

    it('각 status 가 각자의 토큰만 사용한다 (교차 오염 금지)', () => {
      // done Badge 는 status-wip / status-planned 를 포함하면 안 된다.
      // 실수로 모든 status 에 같은 유틸을 적용하는 회귀를 방지.
      const variants = [
        {
          status: 'done',
          own: /\bstatus-done\b/,
          others: [/\bstatus-wip\b/, /\bstatus-planned\b/],
        },
        { status: 'wip', own: /\bstatus-wip\b/, others: [/\bstatus-done\b/, /\bstatus-planned\b/] },
        {
          status: 'planned',
          own: /\bstatus-planned\b/,
          others: [/\bstatus-done\b/, /\bstatus-wip\b/],
        },
      ] as const;

      for (const { status, own, others } of variants) {
        const { container, unmount } = render(<Badge status={status}>x</Badge>);
        const className = container.querySelector('[data-testid="status-badge"]')?.className ?? '';
        expect(className).toMatch(own);
        for (const other of others) {
          expect(className).not.toMatch(other);
        }
        unmount();
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // 계약: data-testid 부착
  // ─────────────────────────────────────────────────────────
  describe('계약 — data-testid="status-badge" 부착', () => {
    // 본 testid 는 외부 테스트 2곳에서 selector 로 의존한다:
    //   - FeatureCard TEST-P2.9: status 미전달 시 DOM 에 Badge 가 없음을 검증
    //   - Phase 8 TEST-P8.9: BusinessSection 내부에 Badge 가 하나도 없음을 검증
    // Badge 구현 시 testid 를 누락하거나 이름을 바꾸면 두 가드가 동시에 무력화된다.
    // 따라서 이 속성은 Badge 의 "공개 계약"으로 취급해야 한다.

    it('status 종류와 무관하게 data-testid="status-badge" 가 부착된다', () => {
      const { rerender } = render(<Badge status="done">a</Badge>);
      expect(screen.getByTestId('status-badge')).toBeInTheDocument();

      rerender(<Badge status="wip">b</Badge>);
      expect(screen.getByTestId('status-badge')).toBeInTheDocument();

      rerender(<Badge status="planned">c</Badge>);
      expect(screen.getByTestId('status-badge')).toBeInTheDocument();
    });

    it('단일 Badge 인스턴스는 testid 가 정확히 1개 부착된 요소를 생성한다', () => {
      // 중첩 요소에 testid 가 중복 부착되면 getAllByTestId 계산이 틀어진다.
      const { container } = render(<Badge status="done">x</Badge>);
      expect(container.querySelectorAll('[data-testid="status-badge"]').length).toBe(1);
    });
  });
});
