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

/**
 * 랜딩 페이지 최상위 네비게이션 앵커 — **단일 출처**.
 *
 * Header 컴포넌트와 실제 Section 컴포넌트(Phase 4~8) 가 이 목록을 공유한다.
 * 이렇게 해서:
 *   1. Header 의 href 와 Section 의 id 가 **같은 상수에서 생성** 되므로 한쪽만
 *      바뀌어 "dead anchor" 가 생기는 회귀를 원천 차단한다.
 *   2. `App.test.tsx` 에 `NAV_ANCHORS` 를 반복하며 "모든 id 가 DOM 에 존재" 를
 *      검증하는 가드를 두면, Phase 4~8 에서 섹션 추가 시 해당 섹션의 id 가 이
 *      목록과 일치하지 않으면 즉시 FAIL 로 드러난다.
 *   3. 번역 라벨은 `labelKey` 로 i18n 키를 노출 — Header 가 t() 로 렌더.
 *
 * 순서는 랜딩 페이지 섹션 순서(01_landing_page_plan.md §5) 를 그대로 따른다.
 */
export const NAV_ANCHORS = [
  { id: 'features', labelKey: 'header.nav.features' },
  { id: 'scenarios', labelKey: 'header.nav.scenarios' },
  { id: 'differentiation', labelKey: 'header.nav.differentiation' },
  { id: 'roadmap', labelKey: 'header.nav.roadmap' },
] as const;

export type NavAnchorId = (typeof NAV_ANCHORS)[number]['id'];

/**
 * B2B 파트너십 문의 이메일 — BusinessSection Primary CTA 대상.
 *
 * Phase 8 에서 도입. `constants.test.ts` 의 TEST-P8.11 이 이메일 형식을 강제.
 * FIXME: 전용 파트너십 이메일 확정 시 교체 (현재 개인 이메일 임시 사용).
 */
export const PARTNERSHIP_CONTACT = 'cookyman@gmail.com';

/**
 * 문서/가이드 링크 — BusinessSection Secondary CTA · FinalCTA Secondary CTA 대상.
 *
 * FIXME: 실제 문서 URL (GitHub Pages / Notion 등) 확정 시 교체.
 */
export const DOCS_URL = 'https://github.com/anthropics';
