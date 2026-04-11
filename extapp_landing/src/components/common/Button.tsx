import type { ReactNode } from 'react';
import clsx from 'clsx';

/**
 * 랜딩 페이지 전 CTA/링크의 공통 컴포넌트.
 *
 * 책임:
 *   1. `href` 유무로 `<a>` / `<button>` semantic 선택
 *   2. `variant` 로 primary / secondary 시각 구분
 *   3. `external=true` 시 `target="_blank" rel="noopener noreferrer"` 자동
 *      — tabnabbing 방지 + Referer 전송 차단 (두 속성 모두 필수)
 *   4. children 그대로 렌더 (텍스트 + 선택적 아이콘)
 *
 * 테스트: src/components/common/Button.test.tsx (TEST-P2.4)
 */
type ButtonProps = {
  href?: string;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  external?: boolean;
};

const BASE_CLASS =
  'inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold transition';

const VARIANT_CLASS = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'bg-canvas text-ink-700 border border-border hover:bg-surface',
} as const;

export function Button({ href, variant = 'primary', children, external }: ButtonProps) {
  const classes = clsx(BASE_CLASS, VARIANT_CLASS[variant]);

  if (href !== undefined) {
    const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    return (
      <a href={href} className={classes} {...externalProps}>
        {children}
      </a>
    );
  }

  // 폼 내부 우발적 submit 방지를 위해 명시적 type="button"
  return (
    <button type="button" className={classes}>
      {children}
    </button>
  );
}
