import { useTranslation } from 'react-i18next';

/**
 * 하단 Footer — 저작권 + docs/contact 보조 링크.
 *
 * 책임:
 *   1. 루트 `<footer>` (contentinfo landmark)
 *   2. i18n.t('footer.copyright') 렌더 — "© 2026 Web AI Assistant"
 *   3. docs / contact 링크 각 1개씩 (1차엔 href="#" placeholder)
 *
 * 테스트: src/components/layout/Footer.test.tsx (TEST-P3.8)
 *
 * 주의:
 *   - docs / contact 는 **서로 다른 `<a>` 요소** 로 분리 렌더 (합쳐서 1개로
 *     만들지 말 것 — 테스트가 2개의 구분된 요소를 강제).
 *   - 1차엔 href="#" placeholder 이지만 속성 자체는 반드시 존재해야 함.
 */
export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-surface py-8">
      <div className="mx-auto max-w-content px-6 md:px-10 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-500">{t('footer.copyright')}</p>
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-ink-500 hover:text-ink-700 transition">
            {t('footer.docs')}
          </a>
          <a href="#" className="text-sm text-ink-500 hover:text-ink-700 transition">
            {t('footer.contact')}
          </a>
        </div>
      </div>
    </footer>
  );
}
