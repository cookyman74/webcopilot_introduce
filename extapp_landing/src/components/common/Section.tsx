import type { ReactNode } from 'react';
import clsx from 'clsx';

/**
 * 모든 섹션(Hero, Problem, Solution, ...) 의 공통 레이아웃 래퍼.
 *
 * 책임:
 *   1. children 을 `max-w-content` (1200px) 컨테이너로 중앙 정렬
 *   2. `background` prop 에 따라 4종 배경 중 하나 적용
 *   3. `id` prop 을 section 태그에 전달 (앵커 네비 지원)
 *   4. 상하 패딩(`py-20 md:py-28`) 일관 적용 (섹션 간 리듬)
 *   5. 접근성·테스트 계약 속성(`aria-*`, `data-testid`) 패스스루 — Phase 4
 *      HeroSection/ProblemSection 이 landmark region 식별자와 공개 testid 를
 *      Section 루트에 노출할 수 있도록 지원
 *
 * 테스트: src/components/common/Section.test.tsx (TEST-P2.3)
 */
type SectionProps = {
  id?: string;
  background?: 'canvas' | 'surface' | 'surface-alt' | 'accent-soft';
  children: ReactNode;
  className?: string;
  /** landmark region 접근성 — 섹션 heading id 를 참조 */
  'aria-labelledby'?: string;
  /** landmark region 접근성 — aria-labelledby 대안 */
  'aria-label'?: string;
  /** 공개 테스트 계약 — HeroSection: "hero-section", ProblemSection: "problem-section" */
  'data-testid'?: string;
};

const BG_MAP = {
  canvas: 'bg-canvas',
  surface: 'bg-surface',
  'surface-alt': 'bg-surface-alt',
  'accent-soft': 'bg-accent-soft',
} as const;

export function Section({
  id,
  background = 'canvas',
  children,
  className,
  'aria-labelledby': ariaLabelledBy,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: SectionProps) {
  return (
    <section
      id={id}
      className={clsx(BG_MAP[background], 'py-20 md:py-28', className)}
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      data-testid={dataTestId}
    >
      <div className="mx-auto max-w-content px-6 md:px-10">{children}</div>
    </section>
  );
}
