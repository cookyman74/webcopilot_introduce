/**
 * i18next 초기화 — 프로젝트 전역 i18n 서브시스템의 단일 진입점.
 *
 * 감지 우선순위 (phase03 §3.1 설계):
 *   1. localStorage ('i18nextLng' 키)  — 직전 선택 언어 유지
 *   2. navigator.language            — 브라우저 기본 언어 (ko-KR → ko)
 *   3. fallbackLng 'en'              — 미지원 언어일 때 안전 기본값
 *
 * 언어 코드 정규화:
 *   - `load: 'languageOnly'` 로 region 코드 제거 (ko-KR → ko, en-US → en).
 *   - supportedLngs 는 ['ko', 'en'] 만 — ja/zh 는 2차/3차 활성화 PR 에서 추가.
 *
 * `<html lang>` 동기화 (Phase 3 hotfix — 2026-04-12 E2E 검증 발견):
 *   - `index.html` 은 `<html lang="en">` 로 하드코딩되어 있어, i18n 이 ko 로
 *     감지·전환되어도 DOM `<html>` 의 `lang` 속성이 업데이트되지 않았다.
 *     → 스크린리더가 한국어 본문을 영어로 TTS 하는 접근성 회귀 + SEO 분류 오류.
 *   - 수정: (1) init 완료 직후 `document.documentElement.lang` 을 현재 i18n
 *     언어와 sync, (2) `languageChanged` 이벤트마다 재 sync.
 *   - SSR / 테스트 환경 안전: `typeof document !== 'undefined'` 가드. happy-dom /
 *     jsdom 양쪽에서 document 가 있으므로 테스트는 정상 실행.
 *
 * 테스트와의 계약 (src/i18n/i18n.test.ts 참조):
 *   - `i18n.options.detection?.order === ['localStorage', 'navigator']`
 *   - `i18n.options.detection?.caches` 에 'localStorage' 포함
 *   - `i18n.options.fallbackLng` 가 'en' 포함
 *   - `document.documentElement.lang === i18n.language` (init 직후 + 전환 후)
 *
 * 주의:
 *   - 본 파일은 side-effect import 로 동작한다. `main.tsx` 또는 테스트에서
 *     `import './i18n'` (or equivalent) 만으로 i18n 이 초기화되어야 한다.
 *   - resources 는 inline 이므로 init 은 사실상 동기적으로 완료된다.
 *     (async namespace loading 없음)
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { SUPPORTED_LANGUAGES } from '../lib/constants';
import ko from './locales/ko.json';
import en from './locales/en.json';

/**
 * `<html lang>` 동기화 함수 — i18n.language 를 DOM 에 반영.
 * SSR / 테스트 환경에서 `document` 가 없을 경우 no-op.
 */
function syncHtmlLang(lng: string): void {
  if (typeof document === 'undefined') return;
  // i18next 는 감지 직후 "ko-KR" 같은 region 코드를 반환할 수 있으나
  // `load: 'languageOnly'` 설정과 함께 실제 t() 해석에는 base 만 사용된다.
  // DOM `lang` 속성에도 base 만 쓰는 것이 검색엔진/스크린리더 동작상 일관적.
  const normalized = lng.split('-')[0];
  document.documentElement.lang = normalized;
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// 초기 sync — resources 가 inline 이라 init 이 사실상 동기 완료되므로
// 이 시점에 i18n.language 는 감지된 언어값을 가짐
syncHtmlLang(i18n.language);

// 런타임 sync — LanguageSwitcher 또는 i18n.changeLanguage() 호출 시 자동 반영
i18n.on('languageChanged', syncHtmlLang);

export default i18n;
