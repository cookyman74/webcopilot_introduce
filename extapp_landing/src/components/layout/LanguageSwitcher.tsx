import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { SUPPORTED_LANGUAGES } from '../../lib/constants';
import type { SupportedLanguage } from '../../lib/constants';

/**
 * 언어 전환 컴포넌트 — SUPPORTED_LANGUAGES 각각을 버튼 토글로 렌더.
 *
 * 공개 계약 (LanguageSwitcher.test.tsx §공개 계약):
 *   - 루트: `data-testid="language-switcher"`
 *   - 각 버튼: `data-testid="lang-toggle-{lang}"`, 반드시 `<button>` 요소
 *   - 활성 언어: `aria-pressed="true"` 로 시각/접근성 표시
 *
 * 설계:
 *   - 1차 범위 ko/en 2개뿐이므로 **드롭다운 대신 단순 토글** 로 구현.
 *   - `useTranslation()` 훅이 언어 변경 시 컴포넌트를 자동 리렌더 → aria-pressed
 *     상태가 항상 현재 언어와 동기화됨.
 *   - 2차(ja)·3차(zh) 언어 활성화 시 SUPPORTED_LANGUAGES 에 추가하면 본 컴포넌트
 *     는 자동 확장 — `.map()` 구조 덕분에 코드 수정 불필요.
 */
const LABELS: Record<SupportedLanguage, string> = {
  ko: 'KO',
  en: 'EN',
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  return (
    <div data-testid="language-switcher" className="inline-flex items-center gap-1">
      {SUPPORTED_LANGUAGES.map((lang) => {
        // load: 'languageOnly' 설정으로 region 코드는 이미 제거됨.
        // 방어적으로 startsWith 도 체크해 'ko-KR' 같은 경우에도 매칭.
        const isActive = current === lang || current.startsWith(`${lang}-`);
        return (
          <button
            key={lang}
            type="button"
            data-testid={`lang-toggle-${lang}`}
            aria-pressed={isActive}
            onClick={() => {
              void i18n.changeLanguage(lang);
            }}
            className={clsx(
              'px-2 py-1 rounded text-sm font-semibold transition',
              isActive ? 'bg-accent text-white' : 'text-ink-500 hover:text-ink-700'
            )}
          >
            {LABELS[lang]}
          </button>
        );
      })}
    </div>
  );
}
