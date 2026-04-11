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
 *
 * 테스트: src/components/common/Section.test.tsx (TEST-P2.3)
 */
type SectionProps = {
  id?: string;
  background?: 'canvas' | 'surface' | 'surface-alt' | 'accent-soft';
  children: ReactNode;
  className?: string;
};

const BG_MAP = {
  canvas: 'bg-canvas',
  surface: 'bg-surface',
  'surface-alt': 'bg-surface-alt',
  'accent-soft': 'bg-accent-soft',
} as const;

export function Section({ id, background = 'canvas', children, className }: SectionProps) {
  return (
    <section id={id} className={clsx(BG_MAP[background], 'py-20 md:py-28', className)}>
      <div className="mx-auto max-w-content px-6 md:px-10">{children}</div>
    </section>
  );
}
