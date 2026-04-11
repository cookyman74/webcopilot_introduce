import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CHROME_WEB_STORE_URL } from '../../lib/constants';

/**
 * 상단 Header — sticky 고정 네비게이션 바.
 *
 * 구조 (좌 → 중 → 우):
 *   [로고/제품명]  [<nav> 4개 앵커 링크]  [LanguageSwitcher + Primary CTA]
 *
 * 책임:
 *   1. 루트 `<header>` + sticky 포지셔닝 (스크롤 고정)
 *   2. 제품명 "Web AI Assistant" 텍스트 노출 (브랜드 식별)
 *   3. 4개 앵커 네비: #features / #scenarios / #differentiation / #roadmap
 *      — 라벨은 i18n.t('header.nav.*') 로 렌더
 *   4. LanguageSwitcher 우측 배치 (nav 외부)
 *   5. Primary CTA: Button 공통 컴포넌트 + CHROME_WEB_STORE_URL
 *      — Button §14.2.4 자동 external 감지로 target/rel 자동 부여
 *
 * 테스트: src/components/layout/Header.test.tsx (TEST-P3.4, P3.5 + 레이아웃 계약)
 */

/**
 * 네비 항목 데이터 — .map() 으로 반복 렌더.
 * 향후 항목 추가 시 이 배열만 수정하면 됨 (REFACTOR-STRUCTURE 대응).
 */
const NAV_ITEMS = [
  { href: '#features', key: 'header.nav.features' },
  { href: '#scenarios', key: 'header.nav.scenarios' },
  { href: '#differentiation', key: 'header.nav.differentiation' },
  { href: '#roadmap', key: 'header.nav.roadmap' },
] as const;

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 bg-canvas/90 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-content px-6 md:px-10 h-16 flex items-center justify-between gap-6">
        {/* 좌: 로고/제품명 — 브랜드 텍스트는 i18n 대상 아님 (제품명 고정) */}
        <div className="text-lg font-bold text-ink-900">Web AI Assistant</div>

        {/* 중: 네비게이션 */}
        <nav aria-label="Primary">
          <ul className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sm font-medium text-ink-700 hover:text-ink-900 transition"
                >
                  {t(item.key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* 우: LanguageSwitcher + Primary CTA */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Button href={CHROME_WEB_STORE_URL}>{t('header.cta')}</Button>
        </div>
      </div>
    </header>
  );
}
