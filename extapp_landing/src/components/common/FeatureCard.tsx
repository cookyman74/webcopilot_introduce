import type { ReactNode } from 'react';
import { Badge } from './Badge';
import type { FeatureStatus } from '../../lib/types';

/**
 * 기능/로드맵/비즈니스 섹션의 공통 카드 컴포넌트.
 *
 * 두 가지 용도:
 *   (1) 제품 기능 카드 (Features · Roadmap) — status + statusLabel 로 배지 렌더
 *   (2) 비즈니스 가치 카드 (BusinessSection §5.10) — status 없이 배지 없이 렌더
 *
 * 설계 제약 (02_implementation_plan.md §5.10, phase08 TEST-P8.9):
 *   "BusinessSection 의 가치 카드에는 상태 배지 사용 금지."
 *   FeatureCard 를 재사용하되 Badge 가 **일체** 렌더되지 않아야 한다.
 *
 * 타입 계약 (discriminated union):
 *   - WithStatus: status + statusLabel **둘 다 필수**
 *   - WithoutStatus: 둘 다 **undefined** (또는 생략)
 *   - 한쪽만 전달하는 것은 **타입 에러** (FeatureCard.test.tsx 의
 *     `@ts-expect-error` 블록이 이 계약을 typecheck 게이트로 검증)
 *
 * 마크업 계약:
 *   - 루트 태그는 **반드시 `<article>`** — Phase 8 TEST-P8.7 의
 *     `getAllByRole('article')` 가 이 선택에 의존
 *
 * 테스트: src/components/common/FeatureCard.test.tsx (TEST-P2.8/P2.9)
 */
type FeatureCardBase = {
  icon?: ReactNode;
  title: string;
  description: string;
  example?: string;
};

type WithStatus = FeatureCardBase & {
  status: FeatureStatus;
  statusLabel: string;
};

type WithoutStatus = FeatureCardBase & {
  status?: undefined;
  statusLabel?: undefined;
};

export type FeatureCardProps = WithStatus | WithoutStatus;

export function FeatureCard(props: FeatureCardProps) {
  const { icon, title, description, example } = props;
  const hasStatus = props.status !== undefined && props.statusLabel !== undefined;

  return (
    <article className="rounded-2xl border border-border bg-canvas p-6 md:p-8 shadow-sm hover:shadow-md transition">
      {(icon || hasStatus) && (
        <div className="flex items-start justify-between gap-4">
          {icon ? <div className="text-accent">{icon}</div> : <div />}
          {hasStatus && <Badge status={props.status as FeatureStatus}>{props.statusLabel}</Badge>}
        </div>
      )}
      <h3 className="mt-4 text-xl font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-base text-ink-700">{description}</p>
      {example && <p className="mt-3 text-sm text-ink-500">예: {example}</p>}
    </article>
  );
}
