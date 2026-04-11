/**
 * 프로젝트 외부 주소 · URL · 환경 상수의 **단일 출처 (single source of truth)**.
 *
 * 이 파일의 목적은 같은 외부 주소가 여러 컴포넌트에 하드코딩되어 오타 회귀가
 * 발생하는 것을 방지하는 데 있다. Phase 가 진행되면서 다음 상수들이 추가된다:
 *
 *   Phase 3 (본 Phase):
 *     - CHROME_WEB_STORE_URL — Header/Hero/FinalCTA 가 참조
 *     - SUPPORTED_LANGUAGES  — i18n.init 과 LanguageSwitcher 가 참조
 *
 *   Phase 8 (예정):
 *     - PARTNERSHIP_CONTACT  — BusinessSection 의 mailto 링크 대상
 *       (main_landing_todolist.md 리스크 #9 대응)
 *
 * **주의**: 새 외부 주소를 추가할 때 컴포넌트에 직접 쓰지 말고 이 파일에 추가한 뒤
 * import 해서 쓴다. `constants.test.ts` 가 주요 URL 의 형식과 값을 검증한다.
 */

export const CHROME_WEB_STORE_URL =
  'https://chromewebstore.google.com/detail/cpemgmhplednniaifpolbchjmegidcao?authuser=0&hl=ko';

export const SUPPORTED_LANGUAGES = ['ko', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
// ja, zh 는 2·3차 언어 활성화 PR 에서 배열에 추가
