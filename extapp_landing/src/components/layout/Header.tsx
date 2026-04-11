import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CHROME_WEB_STORE_URL, NAV_ANCHORS } from '../../lib/constants';

/**
 * 상단 Header — sticky 고정 네비게이션 바 + 모바일 disclosure.
 *
 * 데스크톱 구조 (md+):
 *   [로고/제품명]  [<nav aria-label="Primary"> 4개 앵커]  [LanguageSwitcher + CTA]
 *
 * 모바일 구조 (< md):
 *   [로고/제품명]  [LanguageSwitcher + CTA + 메뉴 버튼]
 *   (메뉴 버튼 클릭 시 아래에 <nav aria-label="Mobile menu"> 펼쳐짐)
 *
 * 책임:
 *   1. 루트 `<header>` + sticky top-0
 *   2. 제품명 "Web AI Assistant" 텍스트 (브랜드 고정)
 *   3. NAV_ANCHORS 를 단일 출처로 하여 데스크톱/모바일 nav 양쪽 렌더
 *      — Header 의 href 와 App.tsx 의 Section id 가 같은 상수를 참조
 *   4. LanguageSwitcher + Primary CTA 는 nav 외부 우측 영역
 *   5. 모바일에서 disclosure 패턴으로 nav 접근성 유지
 *      (이전 버전: hidden md:flex 로 모바일 nav 완전 소실 — 리뷰 Medium 이슈 해결)
 *
 * 테스트: src/components/layout/Header.test.tsx (TEST-P3.4, P3.5 + 레이아웃 계약 + 모바일 메뉴)
 */
export function Header() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = (): void => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-canvas/90 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-content px-6 md:px-10 h-16 flex items-center justify-between gap-4">
        {/* 좌: 로고/제품명 */}
        <div className="text-lg font-bold text-ink-900">Web AI Assistant</div>

        {/* 중: 데스크톱 네비게이션 (md+ 만 표시) */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {NAV_ANCHORS.map((anchor) => (
              <li key={anchor.id}>
                <a
                  href={`#${anchor.id}`}
                  className="text-sm font-medium text-ink-700 hover:text-ink-900 transition"
                >
                  {t(anchor.labelKey)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* 우: LanguageSwitcher + Primary CTA + 모바일 메뉴 버튼 */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button href={CHROME_WEB_STORE_URL}>{t('header.cta')}</Button>
          <button
            type="button"
            className="md:hidden p-2 text-ink-700 hover:text-ink-900 transition"
            aria-label={t('header.menuToggle')}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* 모바일 nav 패널 — menuOpen 일 때만 렌더 (md+ 에서는 항상 숨김) */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile menu"
          className="md:hidden border-t border-border bg-canvas"
        >
          <ul className="flex flex-col p-4 gap-3">
            {NAV_ANCHORS.map((anchor) => (
              <li key={anchor.id}>
                <a
                  href={`#${anchor.id}`}
                  className="block text-base font-medium text-ink-700 hover:text-ink-900 transition"
                  onClick={closeMenu}
                >
                  {t(anchor.labelKey)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
