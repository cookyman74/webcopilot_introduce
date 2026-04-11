import type { ReactNode } from 'react';
import clsx from 'clsx';

/**
 * 랜딩 페이지 전 CTA/링크의 공통 컴포넌트.
 *
 * 책임:
 *   1. `href` 유무로 `<a>` / `<button>` semantic 선택
 *   2. `variant` 로 primary / secondary 시각 구분
 *   3. **외부 링크 자동 감지**: `href` 가 `http(s)://` 로 시작하면 자동으로
 *      external 로 간주되어 `target="_blank" rel="noopener noreferrer"` 가
 *      부여된다. 개발자가 `external` prop 을 잊어도 보안 속성이 누락되지 않음.
 *      `external={false}` 로 명시적 opt-out 가능 (동일 탭 이동을 강제할 때).
 *   4. children 그대로 렌더 (텍스트 + 선택적 아이콘)
 *
 * 테스트: src/components/common/Button.test.tsx (TEST-P2.4)
 */
type ButtonProps = {
  href?: string;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  /**
   * 외부 링크 여부.
   * - `true`:  명시적으로 외부 링크 (target=_blank + noopener noreferrer)
   * - `false`: 명시적으로 내부 링크 (http(s) URL 이어도 동일 탭 이동)
   * - `undefined` (기본): `href` 가 http(s) 면 자동 true, 아니면 자동 false
   */
  external?: boolean;
};

/** http(s) URL 판정 — 자동 external 감지용 */
function isHttpUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

const BASE_CLASS =
  'inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold transition';

const VARIANT_CLASS = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'bg-canvas text-ink-700 border border-border hover:bg-surface',
} as const;

export function Button({ href, variant = 'primary', children, external }: ButtonProps) {
  const classes = clsx(BASE_CLASS, VARIANT_CLASS[variant]);

  if (href !== undefined) {
    // external prop 이 명시되면 그 값을 그대로, 생략되면 URL 기반 자동 판정.
    // 이렇게 해서 개발자가 외부 URL 에 external 을 까먹어도 기본값이 안전.
    const shouldBeExternal = external ?? isHttpUrl(href);
    const externalProps = shouldBeExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};
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
