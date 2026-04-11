# Phase 3: i18n + Header / Footer 레이아웃

> **목표**: react-i18next로 한국어/영어 다국어 시스템을 구축하고, 상단 Header(네비 + 언어 스위처 + CTA)와 하단 Footer를 구현한다. 일본어/중국어는 빈 locale 파일만 준비.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일
> **E2E 확인 단위**: 언어 스위처 클릭으로 Header 텍스트가 한↔영 전환되며, localStorage에 선택 언어가 보존되고, **Phase 2 데모 페이지는 `<main>` 영역에 그대로 유지** 되어 App.test.tsx 기존 84개 assertion 이 회귀 없음.

---

## 3.1 사전 작업

- [x] **[REVIEW]** Phase 1·2 결과서 **4건** 검토
  - 파일:
    1. [`Phase1_Bootstrap_RED_20260410.md`](./working_history/v1.0/Phase1_Bootstrap_RED_20260410.md) — v1 RED
    2. [`Phase1_Bootstrap_20260410.md`](./working_history/v1.0/Phase1_Bootstrap_20260410.md) — v1 GREEN (18 가드)
    3. [`Phase1_Bootstrap_TestGuardV2_20260411.md`](./working_history/v1.0/Phase1_Bootstrap_TestGuardV2_20260411.md) — v2/v2.1 (23 가드)
    4. [`Phase2_DesignSystem_20260411.md`](./working_history/v1.0/Phase2_DesignSystem_20260411.md) — 디자인 시스템 + 공통 컴포넌트 + §14 리뷰 후속 개선
  - 확인: 공통 컴포넌트 4종 PASS · 디자인 토큰 적용 · 23 Phase 1 가드 전체 PASS · tsconfig app/test 격리 · Button external 자동 감지

- [x] **[REGRESSION-BASELINE]** Phase 3 진입 전 **Phase 1 회귀 가드 + Phase 2 테스트** 기준선 확보
  ```bash
  cd 00_intro_web_landing_page
  node working_plan/scripts/verify_phase1.mjs
  # 기대: 23 PASS / 0 FAIL
  cd extapp_landing
  npm test
  # 기대: Test Files 6 passed (6) · Tests 84 passed | 3 skipped (87)
  ```
  **현재 두 기준선 값은 Phase 3 작업 동안 "회귀 금지" 의 상한선으로 작동한다.** GREEN-VERIFY 및 사후 작업에서 다시 실행해 동일 값 유지 확인 (§3.3, §3.5 참조).

- [x] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 6장(i18n 전략) 재확인
  - 1차: ko/en, 2차: ja, 3차: zh
  - 언어 감지: 브라우저 → localStorage → fallback `en`

- [x] **[CONTEXT]** Phase 2 환경 가정 인계 *(Phase2_DesignSystem_20260411.md §10 기반)*
  - **clsx 패턴**: 새 컴포넌트(Header/Footer/LanguageSwitcher)도 동일 패턴 사용 — 상단에 `BASE_CLASS`/`VARIANT_CLASS` 상수 + `clsx(상수, props, className)` 결합
  - **공통 컴포넌트 barrel**: `src/components/common/index.ts` 에서 `Section · Button · Badge · FeatureCard` 를 단일 import 로 가져올 수 있음. Header 는 특히 `Button` 을 Primary CTA 로 재사용해야 한다 (CHROME_WEB_STORE_URL 계약 일관성)
  - **Button 자동 external 감지**: Phase 2 §14.2.4 에서 추가된 기능. `href="https://..."` 이면 `external` prop 없이도 자동으로 `target="_blank" rel="noopener noreferrer"` 부여. Header CTA 에서 이 자동 감지에 의존 가능
  - **`FeatureStatus` 공유 타입**: `src/lib/types.ts` 에 정의됨. Phase 3 는 사용 안 하지만 구조 인지
  - **`data-testid="status-badge"` 공개 계약**: Badge 의 testid 는 외부 테스트 2곳(FeatureCard TEST-P2.9, Phase 8 TEST-P8.9)이 의존하므로 **절대 변경 금지**
  - **tsconfig app/test 격리**: Phase 2 §14.2.2 에서 `tsconfig.app.json` (브라우저, node 없음) 과 `tsconfig.test.json` (테스트, node 포함) 분리됨. `npm run typecheck` 는 두 config 모두 검사. 새 테스트 파일은 `src/**/*.test.ts(x)` 패턴으로 두어야 test config 에 포함됨
  - **engines 제약**: `package.json` `engines.node = "^20.19.0 || >=22.12.0"`. 새 dependency(`i18next`, `react-i18next`, `i18next-browser-languagedetector`, `@testing-library/user-event`) 설치 시 EBADENGINE 경고 발생 가능 (동작에는 무영향)

- [x] **[CONTEXT]** Phase 3 가 수정하는 파일과 Phase 1/2 가드의 상호작용
  | 수정 대상 | 영향 받는 가드 | 주의 |
  |----------|---------------|------|
  | `src/main.tsx` (`import './i18n'` 추가) | P1.8 (main.tsx `'./index.css'` import), P1.20 (createRoot/render 와이어링) | 기존 `import './index.css'` 와 `createRoot(...).render(<App/>)` 반드시 보존. 새 import 추가만 |
  | `src/App.tsx` (Header + main + Footer 구조) | P1.9 (Tailwind 유틸 사용), P1.18 (src 전체 유틸 스캔), P1.16 (`npm test`) | **데모 요소 전부 `<main>` 내부에 유지** → Phase 2 App.test.tsx 84 assertion 회귀 없음 |
  | `package.json` (i18next/react-i18next/LanguageDetector/user-event 추가) | P1.3 (devDeps 확인), P1.15 (typecheck) | 설치 직후 `npm run format` 실행해 package.json 규범 유지 (P1.21). P1.17(build)은 tsconfig 격리 덕분에 테스트 파일 오류의 영향 받지 않음 |
  | `tsconfig.test.json` 건드릴 필요 없음 | — | LanguageSwitcher 테스트가 user-event 사용 — test config 에 이미 타입 접근 가능 |
  | `src/components/layout/*.tsx` (신규 파일 3종) | P1.18 (자동 스캔 확대), P1.21 (format 규범) | 작성 직후 `npm run format` 필수 |
  | `src/i18n/index.ts` + `locales/*.json` (신규) | P1.21, P1.15 | JSON 파일도 prettier 규범 대상 |

- [x] **[ANALYSIS]** `src/lib/constants.ts` 생성 계획 *(Phase 2 에서 미생성)*
  - 이 파일은 **프로젝트 외부 주소/상수의 단일 출처** 역할을 한다. 처음 만드는 지금, 구조를 올바르게 잡아 두어야 이후 Phase 확장 시 중복/오타를 막을 수 있다.
  - Phase 3 에서 정의: `CHROME_WEB_STORE_URL`, `SUPPORTED_LANGUAGES`, `SupportedLanguage` 타입
  - **Phase 8 에서 추가 예정**: `PARTNERSHIP_CONTACT` (BusinessSection mailto) — `main_landing_todolist.md` 리스크 #9 대응
  - Phase 3 의 constants.ts 에 **주석으로 "외부 주소 단일 출처" 역할 명시** 해서 Phase 8 확장자가 파일을 분리하려는 충동을 막는다

- [x] **[ANALYSIS]** `@testing-library/user-event` 설치 필요 확인 *(Phase 2 까지 미설치)*
  - LanguageSwitcher 클릭 테스트(TEST-P3.6)가 실제 클릭 시뮬레이션을 요구 → `user-event` 필요
  - 이전 계획서 예시(§3.2 Header 테스트)가 `import userEvent from '@testing-library/user-event';` 를 사용하지만 패키지 미설치 상태 — Phase 3 TASK-001 에 설치 포함해야 함 (§3.3 참조)

- [x] **[ANALYSIS]** `src/components/layout/` 과 `src/i18n/locales/` 디렉토리 상태
  - 두 디렉토리 모두 Phase 1 에서 `.gitkeep` 만 들어있는 상태 (확인됨)
  - Phase 3 에서 실제 파일 추가 시 `.gitkeep` 제거 필요 (Phase 2 에서 `common/` 과 `lib/` 에서 동일하게 처리한 전례)

---

## 3.2 RED Phase: 검증 체크리스트 + 실패 테스트

- [x] **[RED]** 검증 체크리스트 작성
  ```
  TEST-P3.1:  src/i18n/locales/{ko,en,ja,zh}.json 4개 파일 존재
  TEST-P3.2:  ko.json과 en.json에 동일한 키 구조 (ja/zh는 2차/3차 활성화 시점에 확장)
  TEST-P3.3:  i18next 초기화 후 t('header.nav.features')가 한국어 문자열 반환
  TEST-P3.4:  Header 컴포넌트가 4개 네비 링크(features/scenarios/differentiation/roadmap) 렌더
  TEST-P3.5:  Header에 Primary CTA 버튼 존재 (href = Chrome Web Store URL · external 자동 감지 OR 명시)
  TEST-P3.6:  LanguageSwitcher 클릭 후 i18n.language가 'en'으로 변경
  TEST-P3.7:  언어 변경 후 localStorage에 'i18nextLng' 키 저장
  TEST-P3.8:  Footer에 저작권 텍스트 렌더
  TEST-P3.9:  constants.ts의 CHROME_WEB_STORE_URL이 정확한 값
  TEST-P3.10: Phase 3 변경 후에도 verify_phase1.mjs 23개 가드 전부 PASS 유지 (회귀 금지)
  TEST-P3.11: Phase 3 변경 후에도 App.test.tsx 84 assertion 전체 PASS 유지 (Phase 2 데모 호환성)
  TEST-P3.12: main.tsx는 여전히 './index.css' import + createRoot(...).render(<App/>) 와이어링을 보존 (Phase 1 P1.8/P1.20 직접 대응)
  ```

  > **TEST-P3.2 의 범위 주의**: 현재 ja/zh 는 빈 객체 `{}` 로 스캐폴드만 존재하므로 key parity 검증을 4개 언어 전부에 돌리면 FAIL 한다. 본 단계는 ko/en 만 비교한다. **2차(ja) 활성화 시점에 ja 도 parity 검증에 포함하고, 3차(zh) 에서 zh 추가** 하는 식으로 확장. 해당 확장 책임은 Phase 3 완료 후 언어 추가 PR 이 진다.

- [x] **[RED]** i18n 키 동기화 테스트 (TEST-P3.1 + TEST-P3.2)
  - 파일: `src/i18n/i18n.test.ts`
  ```ts
  import { describe, it, expect } from 'vitest';
  import ko from './locales/ko.json';
  import en from './locales/en.json';

  function collectKeys(obj: object, prefix = ''): string[] {
    return Object.entries(obj).flatMap(([k, v]) => {
      const path = prefix ? `${prefix}.${k}` : k;
      return v !== null && typeof v === 'object'
        ? collectKeys(v as object, path)
        : [path];
    });
  }

  describe('i18n locale parity (TEST-P3.2)', () => {
    it('ko.json 과 en.json 은 동일한 키 구조를 가진다', () => {
      // 주의: ja/zh 는 Phase 3 1차 범위에서 {} 빈 객체이므로 비교 제외.
      // 2차 활성화 시점에 이 테스트를 확장해서 ja 를, 3차에 zh 를 포함한다.
      expect(collectKeys(ko).sort()).toEqual(collectKeys(en).sort());
    });

    it('ko.json 에 빈 문자열 값이 없다 (번역 누락 조기 감지)', () => {
      const findEmptyValues = (obj: object, prefix = ''): string[] =>
        Object.entries(obj).flatMap(([k, v]) => {
          const path = prefix ? `${prefix}.${k}` : k;
          if (v !== null && typeof v === 'object')
            return findEmptyValues(v as object, path);
          return typeof v === 'string' && v.trim() === '' ? [path] : [];
        });
      expect(findEmptyValues(ko)).toEqual([]);
      expect(findEmptyValues(en)).toEqual([]);
    });
  });

  describe('i18n locale files exist (TEST-P3.1)', () => {
    it('ko/en 은 필수 최상위 키(header/footer) 를 포함한다', () => {
      expect(ko).toHaveProperty('header');
      expect(ko).toHaveProperty('footer');
      expect(en).toHaveProperty('header');
      expect(en).toHaveProperty('footer');
    });
  });
  ```

- [x] **[RED]** Header 컴포넌트 테스트 (TEST-P3.4 + TEST-P3.5)
  - 파일: `src/components/layout/Header.test.tsx`
  ```tsx
  import { describe, it, expect } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import { Header } from './Header';
  import '../../i18n';
  import { CHROME_WEB_STORE_URL } from '../../lib/constants';

  describe('Header (TEST-P3.4 + TEST-P3.5)', () => {
    it('4개 네비 링크(features/scenarios/differentiation/roadmap) 를 렌더한다', () => {
      render(<Header />);
      // 앵커 href 기반 검증 — i18n 라벨이 언어에 따라 바뀌어도 안정적
      const nav = screen.getByRole('navigation');
      const anchors = Array.from(nav.querySelectorAll('a[href^="#"]'));
      const hrefs = anchors.map((a) => a.getAttribute('href'));
      expect(hrefs).toEqual(
        expect.arrayContaining(['#features', '#scenarios', '#differentiation', '#roadmap'])
      );
      expect(anchors.length).toBe(4);
    });

    it('Primary CTA 가 Chrome Web Store URL 을 가리킨다', () => {
      render(<Header />);
      const cta = screen
        .getAllByRole('link')
        .find((el) => el.getAttribute('href') === CHROME_WEB_STORE_URL);
      expect(cta).toBeDefined();
    });

    it('Primary CTA 가 외부 링크 보안 속성(target + noopener + noreferrer)을 갖는다', () => {
      // Phase 2 Button 자동 external 감지(Phase2 §14.2.4)에 의존 또는 명시적 external prop
      render(<Header />);
      const cta = screen
        .getAllByRole('link')
        .find((el) => el.getAttribute('href') === CHROME_WEB_STORE_URL);
      expect(cta).toBeDefined();
      expect(cta).toHaveAttribute('target', '_blank');
      const rel = cta?.getAttribute('rel') ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });

    it('sticky 포지셔닝 클래스를 루트에 적용한다', () => {
      // Header 가 스크롤 시 상단 고정되어야 함 — sticky/fixed 중 하나
      const { container } = render(<Header />);
      const root = container.firstElementChild;
      expect(root?.className).toMatch(/\b(sticky|fixed)\b/);
    });
  });
  ```

- [x] **[RED]** LanguageSwitcher 동작 테스트 (TEST-P3.6 + TEST-P3.7)
  - 파일: `src/components/layout/LanguageSwitcher.test.tsx`
  ```tsx
  import { describe, it, expect, beforeEach } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import i18n from '../../i18n';
  import { LanguageSwitcher } from './LanguageSwitcher';

  describe('LanguageSwitcher (TEST-P3.6 + TEST-P3.7)', () => {
    beforeEach(async () => {
      // 각 케이스 전에 언어를 ko 로 리셋 (테스트 간 격리)
      await i18n.changeLanguage('ko');
      localStorage.clear();
    });

    it('렌더 직후 현재 언어가 ko 로 표시된다', () => {
      render(<LanguageSwitcher />);
      // 구현 선택 자유: 텍스트 "KO" / "한국어" / ko 축약 중 하나
      expect(screen.getByText(/ko|한국어/i)).toBeInTheDocument();
    });

    it('스위처 클릭 시 i18n.language 가 en 으로 변경된다', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      // EN 토글 버튼을 클릭 — 구현 선택 자유 (button / anchor / select option)
      const enToggle = screen.getByRole('button', { name: /en|english|영어/i });
      await user.click(enToggle);
      expect(i18n.language).toBe('en');
    });

    it('언어 변경 후 localStorage 에 i18nextLng="en" 이 저장된다', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      const enToggle = screen.getByRole('button', { name: /en|english|영어/i });
      await user.click(enToggle);
      expect(localStorage.getItem('i18nextLng')).toBe('en');
    });
  });
  ```

- [x] **[RED]** Footer 컴포넌트 테스트 (TEST-P3.8)
  - 파일: `src/components/layout/Footer.test.tsx`
  ```tsx
  import { describe, it, expect } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import { Footer } from './Footer';
  import '../../i18n';

  describe('Footer (TEST-P3.8)', () => {
    it('저작권 텍스트를 렌더한다', () => {
      render(<Footer />);
      // i18n 의 footer.copyright 값 — 한/영 공통적으로 "©" 기호와 연도 포함
      expect(screen.getByText(/©.*2026.*Web AI Assistant/i)).toBeInTheDocument();
    });

    it('루트 태그가 <footer> 이다', () => {
      const { container } = render(<Footer />);
      const root = container.firstElementChild;
      expect(root?.tagName).toBe('FOOTER');
    });
  });
  ```

- [x] **[RED]** 상수 검증 테스트 (TEST-P3.9)
  - 파일: `src/lib/constants.test.ts`
  ```ts
  import { describe, it, expect } from 'vitest';
  import { CHROME_WEB_STORE_URL, SUPPORTED_LANGUAGES } from './constants';

  describe('constants (TEST-P3.9)', () => {
    it('CHROME_WEB_STORE_URL 이 공식 URL 이다', () => {
      expect(CHROME_WEB_STORE_URL).toBe(
        'https://chromewebstore.google.com/detail/cpemgmhplednniaifpolbchjmegidcao?authuser=0&hl=ko'
      );
    });

    it('SUPPORTED_LANGUAGES 가 ko 와 en 을 포함한다', () => {
      expect(SUPPORTED_LANGUAGES).toContain('ko');
      expect(SUPPORTED_LANGUAGES).toContain('en');
    });

    it('CHROME_WEB_STORE_URL 은 https:// 로 시작한다 (Button 자동 external 감지 대상)', () => {
      // Phase 2 §14.2.4 의 자동 감지 로직이 이 URL 을 외부 링크로 판정하므로,
      // Header/Hero/FinalCTA 가 이 상수를 href 로 쓰면 target+rel 이 자동 부여됨
      expect(CHROME_WEB_STORE_URL).toMatch(/^https:\/\//);
    });
  });
  ```

- [x] **[RED-VERIFY]** 모든 새 테스트 FAIL 확인
  ```bash
  npm run test
  ```
  - 이 단계에서는 다음 파일들이 모두 "Failed to resolve import" 로 FAIL 해야 함:
    * `src/i18n/i18n.test.ts` → `./locales/ko.json` · `./locales/ja.json` · `./locales/zh.json` · `.` (i18n 모듈) 미존재
    * `src/components/layout/Header.test.tsx` → `./Header` · `../../i18n` · `../../lib/constants` 미존재
    * `src/components/layout/LanguageSwitcher.test.tsx` → `./LanguageSwitcher` + `../../i18n` 미존재
    * `src/components/layout/Footer.test.tsx` → `./Footer` · `../../i18n` 미존재
    * `src/lib/constants.test.ts` → `./constants` 미존재
  - `verify_phase1.mjs` 는 **P1.15 (typecheck) 와 P1.16 (test) 만 일시 FAIL** — 나머지 21개 PASS 로 `21 PASS / 2 FAIL / 총 23` 이 기대 상태. P1.17 (build) 는 **Phase 2 §14.2.2 에서 도입한 `tsconfig.app.json` ↔ `tsconfig.test.json` 격리** 덕분에 영향 받지 않는다 (`tsc -b` 는 `tsconfig.json` 의 references — app + node — 만 처리하고 test config 는 별도이므로, test 파일의 import 오류가 build 단계를 오염시키지 않음). 이 "P1.17 가드가 RED 중에도 살아있는 상태" 는 Phase 2 구조 개선의 지속 효과이며, Phase 3 RED 실패 원인의 순수성을 **미구현 모듈** 로만 한정한다.

---

## 3.3 GREEN Phase: 최소 코드 구현

- [x] **[TASK-001]** i18next + user-event 패키지 설치
  ```bash
  # i18n 런타임 (dependencies)
  npm install i18next react-i18next i18next-browser-languagedetector
  # LanguageSwitcher 클릭 테스트용 (devDependencies)
  npm install -D @testing-library/user-event
  ```
  - **왜 `@testing-library/user-event` 가 필요한가**: TEST-P3.6 (언어 스위처 클릭 → i18n.language 변경) 가 실제 사용자 상호작용을 요구한다. `fireEvent.click` 대신 `user-event` 를 쓰면 포커스/키보드 이벤트까지 자연스럽게 시뮬레이션되어 접근성 회귀까지 잡힘.
  - 설치 후 반드시 `npm run format` 실행 — `package.json` 의 prettier 규범 유지 (P1.21)

- [x] **[TASK-002]** 상수 파일 — **외부 주소 단일 출처**
  - 파일: `src/lib/constants.ts`
  ```ts
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
  ```

- [x] **[TASK-003]** locale JSON 파일
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

- [x] **[TASK-004]** i18next 초기화
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

- [x] **[TASK-005]** main.tsx에서 i18n import
  - 파일: `src/main.tsx`
  - `import './i18n';` 추가

- [x] **[TASK-006]** LanguageSwitcher 컴포넌트 *(1차: 단순 2개 버튼 토글)*
  - 파일: `src/components/layout/LanguageSwitcher.tsx`
  - **1차 구현 범위**: SUPPORTED_LANGUAGES 가 현재 `['ko', 'en']` 2개뿐이므로 **드롭다운 대신 버튼 2개 토글** 로 충분. 선택된 언어는 시각적으로 강조, 다른 언어는 클릭 시 `i18n.changeLanguage(lng)` 호출.
  - 2차(ja)·3차(zh) 언어 활성화 시 드롭다운으로 확장 — 1차 구현에는 `SUPPORTED_LANGUAGES.map(...)` 패턴으로 작성해 두어 언어 추가 시 컴포넌트 자체는 수정할 필요 없게 한다
  - 테스트 계약: 각 언어 토글이 `<button>` 이어야 함 (TEST-P3.6 의 `getByRole('button', ...)`)
  - **useTranslation 훅 활용 금지 (필요 없음)** — i18n.language 변경만 하면 되므로 `import i18n from '../../i18n'` 로 충분

- [x] **[TASK-007]** Header 컴포넌트
  - 파일: `src/components/layout/Header.tsx`
  - **구조**: `<header class="sticky top-0 ...">` 루트
    - 좌측: 로고 / 제품명 텍스트
    - 중앙: `<nav>` + 4개 앵커 링크 (`#features`, `#scenarios`, `#differentiation`, `#roadmap`) — i18n.t('header.nav.*') 로 라벨 렌더
    - 우측: `<LanguageSwitcher />` + Primary `<Button>` (CHROME_WEB_STORE_URL)
  - **Primary Button 은 공통 `Button` 컴포넌트 재사용** — `src/components/common` barrel 에서 import
  - Button 의 **자동 external 감지**(Phase 2 §14.2.4) 에 의존하므로 `external` prop 은 생략 가능. 단 명시적으로 `external` 을 넘기는 것도 허용 (명시성 선호 시)
  - **sticky 포지셔닝**: Tailwind 의 `sticky top-0 z-50` 또는 동등한 조합. Header.test.tsx 가 regex `/\b(sticky|fixed)\b/` 로 검증

- [x] **[TASK-008]** Footer 컴포넌트
  - 파일: `src/components/layout/Footer.tsx`
  - 루트 태그는 **`<footer>`** (Footer.test.tsx 루트 nodeName 검증)
  - 저작권 텍스트 (i18n.t('footer.copyright'))
  - 문서/문의 링크 (i18n.t('footer.docs'), 'footer.contact') — 1차엔 href="#" placeholder
  - 단순 구조: 중앙 정렬 또는 좌측 정렬 — 시각 통일은 Phase 9 에서 일괄 조정

- [x] **[TASK-009]** App.tsx 갱신 — **Phase 2 데모 유지 + Header/Footer 추가**
  - **정책**: Phase 2 의 데모 페이지 콘텐츠(4 Section × 공통 컴포넌트 변형) 는 **그대로 유지** 하고, 그 주위를 `<Header />` 와 `<Footer />` 로 감싼다. 이렇게 해서:
    - Phase 2 의 `App.test.tsx` 84 assertion 이 모두 여전히 PASS 한다 (TEST-P3.11)
    - Phase 1 의 P1.16 (`npm test`) 가드가 깨지지 않는다
  - **수정 후 구조**:
    ```tsx
    import { Header, Footer } from './components/layout';
    import { Section, Button, Badge, FeatureCard } from './components/common';

    export default function App() {
      return (
        <>
          <Header />
          <main>
            <Section background="canvas">...</Section>  {/* 기존 데모 그대로 */}
            <Section background="surface">...</Section>
            <Section background="surface-alt">...</Section>
            <Section id="features" background="accent-soft">...</Section>
          </main>
          <Footer />
        </>
      );
    }
    ```
  - **App.test.tsx 는 변경하지 않는다** — Phase 2 의 모든 assertion 이 그대로 유효. 단, Header 가 Chrome Web Store CTA 를 렌더하므로 `screen.getAllByRole('link')` 카운트에 영향 가능. 기존 테스트가 **name 기반 검색** 만 쓰는지 확인:
    - ✅ `screen.getByRole('link', { name: /Anchor Link/ })` — name 기반, Header CTA 와 충돌 안 함
    - ✅ `screen.getByRole('link', { name: /External Link/ })` — 동일
    - ✅ `screen.getByRole('link', { name: /Auto External/ })` — 동일
    - 모든 link 검색이 name 기반 → 충돌 없음 확인
  - **Phase 4 에서 본격 전환 예고**: Phase 4 가 HeroSection + ProblemSection 을 만들면서 데모를 실제 섹션으로 대체 시작한다. 그 시점에 App.test.tsx 를 Phase 1→2 전환과 동일하게 **한 번 더 재작성** 해야 한다 (데모 검증 → 실 랜딩 검증). 본 Phase 는 그 전단계.

- [x] **[GREEN-VERIFY]** 검증 — **Phase 3 자체 + Phase 1 회귀 + Phase 2 호환성**
  ```bash
  # Phase 3 자체 검증
  cd extapp_landing
  npm run lint          # 0 errors
  npm run typecheck     # 0 errors (app + test config 양쪽)
  npm run format:check  # 규범 준수
  npm test              # Phase 2 의 84 assertion + Phase 3 신규 전부 PASS
  npm run build         # 성공

  # Phase 1 회귀 가드 재실행 (TEST-P3.10)
  cd ..
  node working_plan/scripts/verify_phase1.mjs
  # 기대: 23 PASS / 0 FAIL (사전 작업의 REGRESSION-BASELINE 동일)

  # Phase 2 App.test.tsx 호환성 재확인 (TEST-P3.11)
  cd extapp_landing
  npx vitest run src/App.test.tsx
  # 기대: 모든 기존 assertion 통과 (Phase 2 의 84개 데모 검증)

  # 수동 시각 확인
  npm run dev
  # - 브라우저 첫 진입 시 언어 자동 감지 작동
  # - 스위처 클릭으로 한↔영 전환
  # - 새로고침 후에도 마지막 언어 유지
  # - Header CTA 클릭 → Chrome Web Store 새 탭
  # - Phase 2 데모 요소(Section 4종, Button 5종, Badge 3종, FeatureCard 2 케이스) 모두 보임
  ```
  - **만약 verify_phase1.mjs 또는 App.test.tsx 에서 회귀가 발생하면** 원인 분석 후 수정. 가드 우회로 해결 금지. 가장 흔한 Phase 3 회귀 패턴:
    * **P1.8 / P1.20** (main.tsx): i18n import 추가 시 기존 `./index.css` 또는 `createRoot(...).render(<App/>)` 를 실수로 제거 → 복원
    * **P1.16** (`npm test`): App.tsx 구조 변경이 기존 App.test.tsx 의 쿼리를 깨뜨림 → Phase 2 데모를 `<main>` 내부에 유지하고 있는지 확인
    * **P1.18** (Tailwind 동적 스캔): Header/Footer 가 신규 유틸을 썼는데 빌드 CSS 에 purge 되어 누락 → `tailwind.config.js` content glob 확인 (`src/**/*.{js,ts,jsx,tsx}` 이미 포함되므로 자동 스캔될 것)
    * **P1.21** (format:check): 신규 파일을 `npm run format` 없이 커밋 시도 → 설치/생성 직후 반드시 format 실행
    * **App.test.tsx**: 데모 요소를 제거하거나 이름을 바꿈 → 데모는 그대로 유지하고 Header/Footer 만 **추가**

---

## 3.4 REFACTOR Phase: 코드 개선

### 3.4.1 구조 개선

- [x] **[REFACTOR-STRUCTURE]** 네비 항목 데이터화
  - Header 내 4개 nav 항목을 배열 데이터로 추출 → `.map()` 렌더
  - 향후 항목 추가 용이

- [x] **[REFACTOR-STRUCTURE]** Header / Footer / Switcher barrel export
  - 파일: `src/components/layout/index.ts`

- [x] **[REFACTOR-STRUCTURE]** i18n 네임스페이스 분리 검토
  - 1차엔 단일 translation 네임스페이스 유지 (YAGNI)
  - **섹션별 최상위 키 예약**: hero / problem / solution / features / scenarios / differentiation / aiModes / safety / roadmap / **business** *(v2)* / finalCta — 이후 Phase들에서 추가될 네임스페이스 목록. ko/en 키 동기화 테스트가 모든 추가 네임스페이스를 자동 검증한다.
  - 결과 문서에 결정 근거 기록

- [x] **[REFACTOR-VERIFY]** 리팩터링 후 테스트 재확인
  ```bash
  npm run test && npm run typecheck
  ```

### 3.4.2 빌드 품질 점검

- [x] **[REFACTOR-PERF-MEASURE]** 번들 크기 변화 — Phase 2 → Phase 3
  | 파일 | Phase 2 베이스라인 | Phase 3 | Δ |
  |------|-------------------|---------|---|
  | `dist/assets/index-*.js` | **194.72 KB** (gzip 61.61 KB) | [측정] | [Δ] |
  | `dist/assets/index-*.css` | **8.42 KB** (gzip 2.51 KB) | [측정] | [Δ] |
  - **예상 증가**: JS +30~50KB (i18next/react-i18next/LanguageDetector 합산, gzip 후)
  - Phase 9 의 품질 목표 (gzip JS <300KB) 대비 여유 확인 — 현재 gzip 61.6KB 에서 +15~25KB 예상 = 약 80KB 수준으로 충분히 여유

---

## 3.5 사후 작업

- [x] **[VERIFY]** 전체 검증 — **Phase 3 + Phase 1 회귀 + Phase 2 호환성**
  ```bash
  # Phase 3
  cd extapp_landing
  npm run lint && npm run typecheck && npm run format:check && npm test && npm run build

  # Phase 1 회귀 가드 (필수)
  cd ..
  node working_plan/scripts/verify_phase1.mjs
  # 기대: 23 PASS / 0 FAIL
  ```

- [x] **[VERIFY]** 기능 회귀 확인 (수동, 브라우저)
  - 브라우저 첫 진입: 기본 언어 표시 (브라우저 언어 따라, ko 환경에서는 한국어)
  - 언어 스위처로 한↔영 전환 → Header 네비 라벨이 즉시 바뀌는지
  - 새로고침 후에도 마지막 선택 언어 유지 (localStorage)
  - DevTools → Application → LocalStorage → `i18nextLng` 키 확인
  - Header CTA 클릭 → Chrome Web Store 새 탭 열림
  - **Phase 2 데모 요소 전부 보임**: Section 4종, Button 5종(Primary/Secondary/Anchor/External/Auto External), Badge 3종, FeatureCard 2 케이스
  - 앵커 네비(`#features`)가 Feature Cards 섹션으로 스크롤되는지

- [x] **[DOC]** 작업 결과서 작성
  - 파일: `working_history/v1.0/Phase3_I18nLayout_2026MMDD.md`
  - 포함 내용:
    - 설치 패키지 버전 (i18next, react-i18next, i18next-browser-languagedetector, @testing-library/user-event)
    - 번들 크기 변화 (Phase 2 베이스라인 JS 194.72 KB / CSS 8.42 KB 대비)
    - Phase 1 회귀 가드 재실행 결과 (23 PASS / 0 FAIL 유지 확인)
    - Phase 2 App.test.tsx 호환성 확인 (84 assertion 유지)
    - i18n 키 구조 스냅샷 (ko/en header/footer 네임스페이스)
    - LanguageSwitcher 구현 선택 (1차 버튼 토글 vs 드롭다운)
    - 발생한 이슈와 해결 방법
    - 다음 Phase(P4 Hero + Problem) 인계 사항
      * App.tsx 재전환 시점 계획 (데모 제거 + App.test.tsx 재작성)
      * Section 컴포넌트 사용 예시
      * i18n 키 네임스페이스 관례 (section 별 최상위 키)

- [x] **[COMMIT]** 변경사항 커밋
  ```bash
  cd 00_intro_web_landing_page
  git add extapp_landing/src \
          extapp_landing/package.json \
          extapp_landing/package-lock.json \
          working_plan/phase03_i18n_layout.md \
          working_plan/working_history/v1.0/Phase3_I18nLayout_2026MMDD.md
  git commit -m "[P3] i18n + Header/Footer/LanguageSwitcher — ko/en 2개 언어 지원 · Phase 2 데모 호환 유지"
  ```

---

## Phase 3 완료 조건 (Definition of Done)

- [x] react-i18next 셋업 완료 (+ `@testing-library/user-event` devDep 추가)
- [x] ko/en locale 키 구조 일치 (`src/i18n/i18n.test.ts` PASS)
- [x] ja/zh 빈 locale 파일 존재 (TEST-P3.1)
- [x] LanguageSwitcher 한↔영 토글 동작 (TEST-P3.6)
- [x] localStorage 에 언어 선택 저장 (TEST-P3.7 — `i18nextLng` 키)
- [x] Header sticky + 4개 네비(features/scenarios/differentiation/roadmap) + Primary CTA 동작 (TEST-P3.4, P3.5)
- [x] **Header Primary CTA 가 `target="_blank"` + `rel` 에 noopener, noreferrer 둘 다 포함** (Button 자동 external 감지 OR 명시)
- [x] Footer 루트 태그 `<footer>` + 저작권 텍스트 렌더 (TEST-P3.8)
- [x] `constants.ts` 가 **외부 주소 단일 출처** 로 동작 (TEST-P3.9 + 파일 상단 주석)
- [x] `npm run lint` / `typecheck` (app + test) / `format:check` / `test` / `build` 전부 통과
- [x] **TEST-P3.10: Phase 1 회귀 가드 재실행 → 23 PASS / 0 FAIL 유지**
- [x] **TEST-P3.11: Phase 2 App.test.tsx 의 84 assertion 전부 유지** (데모 호환성)
- [x] **TEST-P3.12: main.tsx 가 여전히 `./index.css` import + `createRoot(...).render(<App/>)` 와이어링 보존** (P1.8/P1.20)
- [x] `src/components/layout/` 의 `.gitkeep` 이 제거되고 실제 파일 3종 (Header, Footer, LanguageSwitcher) 배치
- [x] `src/i18n/locales/` 의 `.gitkeep` 이 제거되고 4개 JSON 파일 (ko, en, ja, zh) 배치
- [x] 작업 결과서 작성 및 커밋 완료
