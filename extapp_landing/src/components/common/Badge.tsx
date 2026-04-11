import type { ReactNode } from 'react';
import clsx from 'clsx';
import type { FeatureStatus } from '../../lib/types';

/**
 * 기능/로드맵 카드의 구현 상태를 명시하는 배지.
 *
 * 책임:
 *   1. 3종 status(done/wip/planned) 각각에 **디자인 토큰** (status-*) 을
 *      반드시 사용한다. 하드코딩 팔레트만 쓰는 구현은 금지.
 *   2. children(라벨 텍스트) 을 그대로 노출.
 *   3. `data-testid="status-badge"` 를 **공개 계약** 으로 부착한다.
 *      외부 두 테스트가 이 selector 에 의존:
 *        - FeatureCard TEST-P2.9: status 미전달 시 Badge 부재 검증
 *        - Phase 8 TEST-P8.9: BusinessSection 내부 Badge 부재 검증
 *      → 이름을 바꾸면 두 가드가 동시에 무력화되므로 절대 변경 금지.
 *
 * 테스트: src/components/common/Badge.test.tsx (TEST-P2.5/P2.6/P2.7)
 */
type BadgeProps = {
  status: FeatureStatus;
  children: ReactNode;
};

const STATUS_CLASS: Record<FeatureStatus, string> = {
  done: 'bg-emerald-50 text-status-done border-emerald-200',
  wip: 'bg-amber-50 text-status-wip border-amber-200',
  planned: 'bg-stone-50 text-status-planned border-stone-200',
};

export function Badge({ status, children }: BadgeProps) {
  return (
    <span
      data-testid="status-badge"
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
        STATUS_CLASS[status]
      )}
    >
      {children}
    </span>
  );
}
