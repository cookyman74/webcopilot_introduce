/**
 * Phase 2 디자인 시스템 RED — Section 공통 컴포넌트
 * 대응 체크: TEST-P2.3
 *
 * Section 은 전 섹션(Hero, Problem, Solution, Features, ...)이 공통으로
 * 사용하는 레이아웃 래퍼. 각 섹션 컴포넌트는 `<Section id="..." background="...">`
 * 로 자신의 콘텐츠를 감싼다.
 *
 * 책임:
 *   1. children 을 `max-w-content` (1200px) 컨테이너로 중앙 정렬한다
 *   2. background prop 에 따라 4종 배경 중 하나를 적용한다
 *   3. id prop 을 `<section>` 태그로 전달해 앵커 네비게이션을 지원한다
 *   4. 상하 패딩을 일관되게 제공한다 (섹션 간 리듬)
 *
 * RED 기대 동작:
 *   `./Section` 모듈이 존재하지 않으므로 Vitest가 "Failed to resolve import"
 *   로 본 파일 전체를 FAIL 처리해야 한다.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Section } from './Section';

describe('TEST-P2.3 — Section 공통 컴포넌트', () => {
  describe('레이아웃 계약', () => {
    it('루트 요소 자체가 <section> 이며, children 을 max-w-content 컨테이너로 감싼다', () => {
      // v2: firstElementChild.tagName 으로 루트 검증 강화 (중첩 section 허용 안 함).
      const { container } = render(
        <Section>
          <p data-testid="child">child content</p>
        </Section>
      );
      const root = container.firstElementChild;
      expect(root?.tagName).toBe('SECTION');

      // 내부에 max-w-content 래퍼가 존재하고 그 안에 children 이 위치한다.
      // max-w-content 는 tailwind.config.js 의 maxWidth.content = 1200px 토큰에
      // 의존 — design-system.config.test.ts 의 "maxWidth.content = 1200px"
      // assertion 이 이 클래스의 의미를 보장한다 (교차 참조).
      const innerWrapper = root?.querySelector('.max-w-content');
      expect(innerWrapper).not.toBeNull();
      expect(innerWrapper?.querySelector('[data-testid="child"]')).not.toBeNull();
    });

    it('내부 래퍼가 mx-auto 로 중앙 정렬되어 있다', () => {
      const { container } = render(<Section>x</Section>);
      const innerWrapper = container.querySelector('section .max-w-content');
      expect(innerWrapper?.className).toContain('mx-auto');
    });

    it('좌우 패딩(px-6 또는 md:px-10)이 내부 래퍼에 적용되어 있다', () => {
      const { container } = render(<Section>x</Section>);
      const innerWrapper = container.querySelector('section .max-w-content');
      const cls = innerWrapper?.className ?? '';
      expect(cls).toMatch(/\bpx-6\b/);
    });

    it('상하 패딩(py-20 또는 md:py-28)이 섹션 태그에 적용되어 있다', () => {
      const { container } = render(<Section>x</Section>);
      const sectionTag = container.querySelector('section');
      expect(sectionTag?.className).toMatch(/\bpy-20\b/);
    });
  });

  describe('background prop — 4종 배경', () => {
    it('기본값은 canvas 이다 (bg-canvas 클래스 적용)', () => {
      const { container } = render(<Section>x</Section>);
      expect(container.querySelector('section')?.className).toContain('bg-canvas');
    });

    it.each([
      ['canvas', 'bg-canvas'],
      ['surface', 'bg-surface'],
      ['surface-alt', 'bg-surface-alt'],
      ['accent-soft', 'bg-accent-soft'],
    ] as const)('background="%s" → %s 클래스 적용', (bg, expectedClass) => {
      const { container } = render(<Section background={bg}>x</Section>);
      expect(container.querySelector('section')?.className).toContain(expectedClass);
    });
  });

  describe('id prop — 앵커 네비 지원', () => {
    it('id prop 이 section 태그의 id 속성으로 전달된다', () => {
      // Header 네비는 #features, #scenarios, #differentiation, #roadmap 로
      // 앵커 점프하므로, 각 섹션이 id 를 section 태그에 노출해야 한다.
      const { container } = render(<Section id="features">x</Section>);
      expect(container.querySelector('section')?.id).toBe('features');
    });

    it('id 가 없으면 id 속성이 없다 (빈 문자열도 설정되지 않음)', () => {
      const { container } = render(<Section>x</Section>);
      const sectionTag = container.querySelector('section');
      expect(sectionTag?.getAttribute('id')).toBeNull();
    });
  });

  describe('className prop — 추가 커스터마이즈', () => {
    it('외부에서 전달한 className 이 섹션 태그에 추가된다', () => {
      // 특정 섹션이 고유 여백이나 장식을 필요로 할 때 빠져나갈 수 있도록
      // className 을 확장 가능하게 열어둔다.
      const { container } = render(<Section className="custom-xyz">x</Section>);
      expect(container.querySelector('section')?.className).toContain('custom-xyz');
    });
  });
});
