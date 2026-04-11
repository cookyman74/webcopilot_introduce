# Phase 3: i18n + Header / Footer 레이아웃

> **목표**: react-i18next로 한국어/영어 다국어 시스템을 구축하고, 상단 Header(네비 + 언어 스위처 + CTA)와 하단 Footer를 구현한다. 일본어/중국어는 빈 locale 파일만 준비.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일
> **E2E 확인 단위**: 언어 스위처 클릭으로 Header 텍스트가 한↔영 전환되며, localStorage에 선택 언어가 보존된다.

---

## 3.1 사전 작업

- [ ] **[REVIEW]** 이전 Phase 결과서 검토
  - 파일: `working_history/v1.0/Phase2_DesignSystem_*.md`
  - 확인: 공통 컴포넌트 PASS, 디자인 토큰 적용 완료

- [ ] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 6장(i18n 전략) 재확인
  - 1차: ko/en, 2차: ja, 3차: zh
  - 언어 감지: 브라우저 → localStorage → fallback `en`

- [ ] **[ANALYSIS]** 상수 파일 위치 확인
  - 파일: `src/lib/constants.ts` (Phase 2에서 미생성 시 본 Phase에서 생성)
  - 정의: `CHROME_WEB_STORE_URL`, `SUPPORTED_LANGUAGES`

---

## 3.2 RED Phase: 검증 체크리스트 + 실패 테스트

- [ ] **[RED]** 검증 체크리스트 작성
  ```
  TEST-P3.1: src/i18n/locales/{ko,en,ja,zh}.json 4개 파일 존재
  TEST-P3.2: ko.json과 en.json에 동일한 키 구조
  TEST-P3.3: i18next 초기화 후 t('header.nav.features')가 한국어 문자열 반환
  TEST-P3.4: Header 컴포넌트가 4개 네비 링크(features/scenarios/differentiation/roadmap) 렌더
  TEST-P3.5: Header에 Primary CTA 버튼 존재 (href = Chrome Web Store URL)
  TEST-P3.6: LanguageSwitcher 클릭 후 i18n.language가 'en'으로 변경
  TEST-P3.7: 언어 변경 후 localStorage에 'i18nextLng' 키 저장
  TEST-P3.8: Footer에 저작권 텍스트 렌더
  TEST-P3.9: constants.ts의 CHROME_WEB_STORE_URL이 정확한 값
  ```

- [ ] **[RED]** i18n 키 동기화 테스트
  - 파일: `src/i18n/i18n.test.ts`
  ```ts
  import ko from './locales/ko.json';
  import en from './locales/en.json';

  function collectKeys(obj: object, prefix = ''): string[] {
    return Object.entries(obj).flatMap(([k, v]) => {
      const path = prefix ? `${prefix}.${k}` : k;
      return typeof v === 'object' ? collectKeys(v as object, path) : [path];
    });
  }

  describe('i18n locale parity', () => {
    it('ko and en have identical key structures', () => {
      expect(collectKeys(ko).sort()).toEqual(collectKeys(en).sort());
    });
  });
  ```

- [ ] **[RED]** Header 컴포넌트 테스트
  - 파일: `src/components/layout/Header.test.tsx`
  ```tsx
  import { render, screen } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import { Header } from './Header';
  import '../../i18n';
  import { CHROME_WEB_STORE_URL } from '../../lib/constants';

  describe('Header', () => {
    it('renders nav links and CTA', () => {
      render(<Header />);
      expect(screen.getByRole('link', { name: /Chrome/i })).toHaveAttribute(
        'href', CHROME_WEB_STORE_URL
      );
    });
  });
  ```

- [ ] **[RED]** LanguageSwitcher 동작 테스트
  - 파일: `src/components/layout/LanguageSwitcher.test.tsx`
  - 토글 클릭 후 i18n.language 변경 검증

- [ ] **[RED]** 상수 검증 테스트
  - 파일: `src/lib/constants.test.ts`
  ```ts
  import { CHROME_WEB_STORE_URL } from './constants';
  describe('constants', () => {
    it('CHROME_WEB_STORE_URL is the official store URL', () => {
      expect(CHROME_WEB_STORE_URL).toBe(
        'https://chromewebstore.google.com/detail/cpemgmhplednniaifpolbchjmegidcao?authuser=0&hl=ko'
      );
    });
  });
  ```

- [ ] **[RED-VERIFY]** 모든 새 테스트 FAIL 확인
  ```bash
  npm run test
  ```

---

## 3.3 GREEN Phase: 최소 코드 구현

- [ ] **[TASK-001]** i18next 패키지 설치
  ```bash
  npm install i18next react-i18next i18next-browser-languagedetector
  ```

- [ ] **[TASK-002]** 상수 파일
  - 파일: `src/lib/constants.ts`
  ```ts
  export const CHROME_WEB_STORE_URL =
    'https://chromewebstore.google.com/detail/cpemgmhplednniaifpolbchjmegidcao?authuser=0&hl=ko';

  export const SUPPORTED_LANGUAGES = ['ko', 'en'] as const;
  export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
  // ja, zh는 2·3차에 추가 예정
  ```

- [ ] **[TASK-003]** locale JSON 파일
  - 파일: `src/i18n/locales/ko.json`
  ```json
  {
    "header": {
      "nav": {
        "features": "기능",
        "scenarios": "시나리오",
        "differentiation": "차별점",
        "roadmap": "로드맵"
      },
      "cta": "Chrome에 추가하기"
    },
    "footer": {
      "copyright": "© 2026 Web AI Assistant",
      "docs": "문서",
      "contact": "문의"
    }
  }
  ```
  - 파일: `src/i18n/locales/en.json` — 동일 키 구조, 영문 값
  - 파일: `src/i18n/locales/ja.json` — `{}` (빈 객체)
  - 파일: `src/i18n/locales/zh.json` — `{}` (빈 객체)

- [ ] **[TASK-004]** i18next 초기화
  - 파일: `src/i18n/index.ts`
  ```ts
  import i18n from 'i18next';
  import { initReactI18next } from 'react-i18next';
  import LanguageDetector from 'i18next-browser-languagedetector';
  import ko from './locales/ko.json';
  import en from './locales/en.json';

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: { ko: { translation: ko }, en: { translation: en } },
      fallbackLng: 'en',
      supportedLngs: ['ko', 'en'],
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      interpolation: { escapeValue: false },
    });

  export default i18n;
  ```

- [ ] **[TASK-005]** main.tsx에서 i18n import
  - 파일: `src/main.tsx`
  - `import './i18n';` 추가

- [ ] **[TASK-006]** LanguageSwitcher 컴포넌트
  - 파일: `src/components/layout/LanguageSwitcher.tsx`
  - 드롭다운 또는 토글 (현재 언어 표시 + 다른 언어 선택)
  - `i18n.changeLanguage(lng)` 호출

- [ ] **[TASK-007]** Header 컴포넌트
  - 파일: `src/components/layout/Header.tsx`
  - sticky top, 좌측 로고/제품명, 중앙 앵커 네비, 우측 LanguageSwitcher + Primary Button
  - Primary Button은 `Button` 공통 컴포넌트 + `CHROME_WEB_STORE_URL`

- [ ] **[TASK-008]** Footer 컴포넌트
  - 파일: `src/components/layout/Footer.tsx`
  - 저작권, 문서/문의 링크 (1차엔 `#` placeholder)

- [ ] **[TASK-009]** App.tsx 갱신
  - Header + (임시 main 영역) + Footer 구조로 변경
  - 임시 main에는 Phase 2 데모 카드들을 일단 유지

- [ ] **[GREEN-VERIFY]** 검증
  ```bash
  npm run test        # i18n + Header + Switcher + constants 테스트 PASS
  npm run typecheck   # 0 errors
  npm run build       # 성공
  npm run dev         # 브라우저에서 언어 전환 수동 확인
  ```

---

## 3.4 REFACTOR Phase: 코드 개선

### 3.4.1 구조 개선

- [ ] **[REFACTOR-STRUCTURE]** 네비 항목 데이터화
  - Header 내 4개 nav 항목을 배열 데이터로 추출 → `.map()` 렌더
  - 향후 항목 추가 용이

- [ ] **[REFACTOR-STRUCTURE]** Header / Footer / Switcher barrel export
  - 파일: `src/components/layout/index.ts`

- [ ] **[REFACTOR-STRUCTURE]** i18n 네임스페이스 분리 검토
  - 1차엔 단일 translation 네임스페이스 유지 (YAGNI)
  - **섹션별 최상위 키 예약**: hero / problem / solution / features / scenarios / differentiation / aiModes / safety / roadmap / **business** *(v2)* / finalCta — 이후 Phase들에서 추가될 네임스페이스 목록. ko/en 키 동기화 테스트가 모든 추가 네임스페이스를 자동 검증한다.
  - 결과 문서에 결정 근거 기록

- [ ] **[REFACTOR-VERIFY]** 리팩터링 후 테스트 재확인
  ```bash
  npm run test && npm run typecheck
  ```

### 3.4.2 빌드 품질 점검

- [ ] **[REFACTOR-PERF-MEASURE]** 번들 크기 변화
  - i18next 패키지 추가로 번들이 얼마나 증가했는지 측정 (이전 대비 Δ)
  - 예상: ~30~50KB gzip 추가

---

## 3.5 사후 작업

- [ ] **[VERIFY]** 전체 검증
  ```bash
  npm run typecheck && npm run test && npm run build
  ```

- [ ] **[VERIFY]** 기능 회귀 확인 (수동)
  - 브라우저 첫 진입: 기본 언어 표시 (브라우저 언어 따라)
  - 언어 스위처로 한↔영 전환
  - 새로고침 후에도 마지막 선택 언어 유지 (localStorage)
  - DevTools → Application → LocalStorage → `i18nextLng` 확인
  - Header CTA 클릭 → Chrome Web Store 새 탭 열림

- [ ] **[DOC]** 작업 결과서 작성
  - 파일: `working_history/v1.0/Phase3_I18nLayout_2026MMDD.md`

- [ ] **[COMMIT]** 변경사항 커밋
  ```bash
  git add extapp_landing/src
  git commit -m "[P3] i18n + Header/Footer/LanguageSwitcher 레이아웃"
  ```

---

## Phase 3 완료 조건 (Definition of Done)

- [ ] react-i18next 셋업 완료
- [ ] ko/en locale 키 구조 일치
- [ ] ja/zh 빈 locale 파일 존재
- [ ] LanguageSwitcher 한↔영 토글 동작
- [ ] localStorage에 언어 선택 저장
- [ ] Header sticky + 4개 네비 + Primary CTA 동작
- [ ] Footer 저작권/링크 표시
- [ ] Header CTA → Chrome Web Store URL 정확
- [ ] 새 단위 테스트 모두 PASS
- [ ] `npm run build` 통과
- [ ] 작업 결과서 작성 및 커밋 완료
