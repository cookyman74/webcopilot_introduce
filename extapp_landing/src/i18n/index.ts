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
 * 테스트와의 계약 (src/i18n/i18n.test.ts 참조):
 *   - `i18n.options.detection?.order === ['localStorage', 'navigator']`
 *   - `i18n.options.detection?.caches` 에 'localStorage' 포함
 *   - `i18n.options.fallbackLng` 가 'en' 포함
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

export default i18n;
