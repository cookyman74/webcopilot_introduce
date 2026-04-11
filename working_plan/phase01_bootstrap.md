# Phase 1: 프로젝트 부트스트랩

> **목표**: `extapp_landing/` 디렉토리에 Vite + React + TypeScript + Tailwind 프로젝트를 초기화하고, 첫 화면이 dev server에서 정상 렌더되도록 한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일
> **E2E 확인 단위**: `npm run dev` 실행 시 Tailwind 클래스가 적용된 빈 페이지가 표시되고 `npm run build`가 통과한다.

---

## 1.1 사전 작업 (Pre-Work)

> **목적**: 본작업의 실패를 줄이기 위한 환경 점검 및 컨텍스트 확인

- [x] **[CONTEXT]** 작업 목적 및 배경 확인
  - 구현 계획서 검토: [02_implementation_plan.md](../02_implementation_plan.md) 2장(기술 스택), 3장(디렉토리 구조), 8장(Phase 1)
  - 산출물 위치: `00_intro_web_landing_page/extapp_landing/`

- [x] **[ANALYSIS]** 현재 환경 확인
  - Node.js 버전: `node -v` (20.x 이상 필요)
  - npm 버전: `npm -v` (10.x 이상 권장)
  - 디렉토리 충돌 확인: `extapp_landing/`이 이미 존재하지 않는지

- [x] **[ANALYSIS]** Vite 템플릿 확인
  - 사용할 템플릿: `react-ts`
  - 명령: `npm create vite@latest extapp_landing -- --template react-ts`

### 📌 부트스트랩 예외 — TDD 사이클 적용 방식

Phase 1은 **프로젝트가 존재하기 전 단계**이므로 vitest 자체가 없는 시점에서 RED 테스트를 작성해야 한다. 이를 해결하기 위해 본 Phase는 다음 두 가지 방식을 병행한다.

1. **실행 가능한 검증 스크립트** (`working_plan/scripts/verify_phase1.mjs`)
   - Node 빌트인만 사용 → vitest 없이도 실행 가능
   - 18개 검증 항목(TEST-P1.1 ~ TEST-P1.18)을 실제 코드로 구현
   - RED 단계: 모든 항목 FAIL (exit 1)
   - GREEN 단계 종료: 모든 항목 PASS (exit 0)
   - 향후 회귀 가드로 영구 보존

2. **vitest 단위 테스트** (`extapp_landing/src/App.test.tsx`)
   - GREEN 단계에서 작성하는 정식 TDD 테스트
   - Phase 2 이후의 표준 방식으로 사용

### 📌 02_implementation_plan.md 8장과의 차이

구현 계획서 8장 Phase 1에는 **디자인 토큰 반영**과 **Pretendard 폰트 로드**가 포함되어 있으나, 본 작업 계획에서는 두 항목을 **Phase 2(디자인 시스템)로 이관**했다.

| 항목 | 구현 계획서 8장 | 작업 계획 (실제) | 사유 |
|------|-----------------|-------------------|------|
| Vite + React + TS 셋업 | P1 | P1 | 변경 없음 |
| Tailwind 설치 | P1 | P1 | 변경 없음 (디폴트 설정만) |
| **디자인 토큰** | P1 | **P2** | 공통 컴포넌트와 함께 도입하는 것이 자연스러움 |
| **Pretendard 폰트** | P1 | **P2** | 디자인 토큰과 짝이 되는 항목 |
| ESLint/Prettier | P1 | P1 | 변경 없음 |
| .gitignore | P1 | P1 | 변경 없음 |

이 결정에 따라 Phase 1은 **부트스트랩 인프라**(빌드/테스트/린트/포맷)에만 집중하고, 시각적 디자인은 Phase 2의 책임으로 분리한다.

---

## 1.2 RED Phase: 실행 가능한 검증 스크립트 + 23개 회귀 가드

> **목적**: Phase 1 종료 조건을 **실제 실행 가능한 테스트**로 정의하고, 현재 모두 FAIL임을 확인

### 1.2.1 검증 스크립트 작성

- [x] **[RED]** `working_plan/scripts/verify_phase1.mjs` 작성
  - Node 빌트인(`fs`, `child_process`, `path`)만 사용
  - 23개 검증 항목을 실제 코드로 구현 *(v1: 18개 → v2: +5개 리뷰 피드백 반영)*
  - **정적 검사 17건**: TEST-P1.1 ~ P1.14 (초기 18개 중 정적 14건) + P1.20 (main.tsx 렌더 와이어링) + P1.22 (index.html 엔트리) + P1.23 (vite.config.ts plugins)
  - **런타임 검사 6건**: P1.15(typecheck) / P1.16(test) / P1.17(build) / P1.18(dist CSS 동적 E2E) / P1.19(lint) / P1.21(format:check)
  - 종료 코드: 전부 PASS=0 / 1건 이상 FAIL=1

### 1.2.2 검증 체크리스트 (TEST-P1.1 ~ TEST-P1.23)

검증 스크립트가 실제로 검사하는 23개 항목. 각 항목은 단순 존재 확인이 아닌 **wiring 검증**까지 수행한다.

> **v2 추가 (리뷰 반영)**: 초기 v1은 18개였으나 다음 사각지대가 식별되어 5개 가드가 추가되었다.
> - **ESLint 런타임 검증 공백** (High): `eslint.config.js` 존재만 검사하던 P1.13은 실제 `vite.config.ts:1`의 triple-slash reference가 `@typescript-eslint/triple-slash-reference`를 위반하는 상황을 놓쳤다. → P1.19 추가, 루트 원인(reference 라인)도 수정.
> - **main.tsx 렌더 와이어링 공백** (Medium): `App.test.tsx`가 `<App />`을 직접 렌더하므로 `main.tsx`의 `createRoot(...).render(...)`가 깨져도 기존 가드는 모두 통과. → P1.20 추가.
> - **Tailwind 가드 협소** (Medium): P1.18이 `min-h-screen` 하드코딩 1개만 검사하여 색/타이포 회귀 검출 불가. → P1.18을 App.tsx의 className 전체 동적 추출로 강화.
> - **Prettier 런타임 검증 공백** (Low): `.prettierrc` 존재만 봤고 실제 7개 파일이 포맷 불일치 상태였음. → P1.21 추가 + `format`/`format:check` 스크립트 추가 + 기존 포맷 불일치 정리.
> - **Vite 엔트리 포인트 연결성** (Refined): `index.html`의 `<script type="module" src="/src/main.tsx">`가 제거돼도 빌드가 성공. → P1.22 추가.
> - **Vite React plugin 활성화** (Refined): `@vitejs/plugin-react` devDep 존재만 검사, `plugins: [react()]` 호출 여부는 확인 안 했음. → P1.23 추가.

#### 정적 파일 검사 (vitest 없이 실행 가능)

| ID | 검증 항목 | 검사 방법 |
|----|----------|-----------|
| **P1.1** | `extapp_landing/package.json` 존재 | 파일 존재 |
| **P1.2** | `dependencies`에 react, react-dom | JSON parse |
| **P1.3** | `devDependencies`에 typescript, vite, tailwindcss, postcss, autoprefixer, vitest, @testing-library/react, @testing-library/jest-dom, jsdom | JSON parse |
| **P1.4** | `tsconfig.app.json` 또는 `tsconfig.json`의 `compilerOptions.strict === true` | JSONC parse + 값 비교 (#4 대응) |
| **P1.5** | `tailwind.config.*`의 content 글롭에 `index.html`과 `src/**` 포함 | 내용 regex (#3 대응) |
| **P1.6** | `postcss.config.*`에 `tailwindcss` + `autoprefixer` 플러그인 포함 | 내용 regex (#3 대응) |
| **P1.7** | `src/index.css`에 `@tailwind base/components/utilities` 디렉티브 | 내용 regex |
| **P1.8** | `src/main.tsx`가 `import './index.css'` 포함 | 내용 regex (#3 대응) |
| **P1.9** | `src/App.tsx`의 `className=`에 Tailwind 유틸리티 클래스 | 내용 regex |
| **P1.10** | `src/App.test.tsx` 존재 + `describe/it/test()` 포함 | 내용 regex |
| **P1.11** | vitest 또는 vite config에 `jsdom` 환경 설정 | 내용 regex |
| **P1.12** | `.gitignore`에 `node_modules`, `dist` 포함 | 내용 regex (#2 대응) |
| **P1.13** | ESLint config 파일 존재 (`.eslintrc.*` 또는 `eslint.config.*`) | 파일 존재 (#2 대응) |
| **P1.14** | Prettier config 파일 존재 (`.prettierrc*` 또는 `prettier.config.*`) | 파일 존재 (#2 대응) |

#### 런타임 검사 (node_modules 필요)

| ID | 검증 항목 | 검사 방법 |
|----|----------|-----------|
| **P1.15** | `npm run typecheck` 성공 (strict 모드 효과 검증) | execSync (#4 대응) |
| **P1.16** | `npm test` 성공 (vitest run) | execSync |
| **P1.17** | `npm run build` 성공 + `dist/index.html` 생성 | execSync + 파일 존재 (#5 대응 — 포트 검사 대체) |
| **P1.18** | `dist/assets/*.css`에 **`src/**/*.{ts,tsx}` 전체의** 모든 Tailwind 유틸리티 포함 (v2.1: 스캔 범위 확장 + variant prefix 지원) | 소스 파일 전수 스캔 → className/clsx 추출 → variant(md:, hover:, dark:…) 스트립 후 prefix 판정 → 빌드 CSS에 전부 존재하는지 검사 (`\:` CSS escape 고려) |
| **P1.19** | `npm run lint` 성공 | execSync (v2 추가 — ESLint 회귀 가드) |
| **P1.20** | `src/main.tsx`의 `createRoot(...).render(<App/>)` 와이어링 (**동일 표현식 내부**) | v2.1: 균형 괄호 walker로 `createRoot(...)` 의 닫는 괄호 직후 `.render(<App ...>)` 이 체인되어 있는지 검증. 이전 v2.0의 3조각 독립 검사 방식은 `createRoot(root); foo().render(<App/>)` 로 우회 가능했음 |
| **P1.21** | `npm run format:check` 성공 | execSync (v2 추가 — Prettier 회귀 가드) |
| **P1.22** | `index.html`의 **(a)** `<script type="module" src="/src/main.tsx">` (속성 순서 무관) + **(b)** `<... id="root">` 마운트 지점 + **(c)** `dist/index.html`의 번들 스크립트 `/assets/*.js` 주입 및 **참조 파일 실재 확인** | v2.1: 속성 순서 agnostic 스크립트 태그 파싱 / DOM root 부재 검출 / dist 번들 경로 실체 검증 |
| **P1.23** | `vite.config.ts`에서 `@vitejs/plugin-react` import + `plugins:` 배열에 `react()` 호출 (**주석 제외**) | v2.1: `stripJsComments()` 로 라인·블록 주석을 선제거한 뒤 regex 적용 — `// plugins: [react()]` 주석 라인이 `plugins: []` 판정을 우회하지 못하게 차단 |

> **#1~#5는 본 Phase 리뷰에서 제기된 이슈 번호와 매핑된다.**
> **포트 5173 검사는 제거**되었다 (Vite의 fallback 동작으로 false negative 가능). `npm run build` 성공 + `dist/index.html` 생성이 더 안정적인 E2E 가드.
> **v2 5개 가드는 모두 돌연변이 테스트로 의도한 회귀 검출이 확인되었다** (verify_phase1.mjs 상단 변경 이력 참조).
> **v2.1 리뷰 반영**: v2.0에서 드러난 4개 약점(P1.18 variant 누락·범위 협소, P1.20 3조각 독립 검사 우회, P1.22 속성 순서·mount target·dist 실재, P1.23 주석 우회)을 모두 수정하고 해당 우회 시나리오에 대한 돌연변이 테스트로 재검증했다. 상세: [working_history/v1.0/Phase1_Bootstrap_TestGuardV2_20260411.md §15](./working_history/v1.0/Phase1_Bootstrap_TestGuardV2_20260411.md).

### 1.2.3 RED 상태 확인 (모두 FAIL)

- [x] **[RED-VERIFY]** 검증 스크립트 실행 → 모든 항목 FAIL 확인
  ```bash
  cd 00_intro_web_landing_page
  node working_plan/scripts/verify_phase1.mjs
  ```
  **기대 결과 (v1 RED 스냅샷)**: `0 PASS / 18 FAIL / 총 18`, exit code `1`
  **기대 결과 (v2 현재)**: `23 PASS / 0 FAIL / 총 23`, exit code `0` — v2 가드 5개는 GREEN 완료 이후 추가되었으므로 v1 RED 스냅샷과는 개수가 다르다. 기존 `Phase1_Bootstrap_RED_20260410.md`는 v1 상태의 불변 기록으로 보존한다.

- [x] **[RED-VERIFY]** 결과 스냅샷을 `working_history/v1.0/Phase1_Bootstrap_RED_*.md`에 기록
  - 모든 18개 항목이 FAIL인지 표로 정리
  - GREEN 단계 종료 시 동일 스크립트가 18 PASS인지 비교 가능하도록 함

---

## 1.3 GREEN Phase: 최소 코드 구현

> **목적**: 위 검증 체크리스트를 통과하는 최소 셋업

- [x] **[TASK-001]** Vite 프로젝트 초기화
  - 작업 디렉토리: `00_intro_web_landing_page/`
  - 명령:
    ```bash
    cd 00_intro_web_landing_page
    npm create vite@latest extapp_landing -- --template react-ts
    cd extapp_landing
    npm install
    ```

- [x] **[TASK-002]** Tailwind CSS 설치 및 초기화
  - 파일: `extapp_landing/`
  - 명령:
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```

- [x] **[TASK-003]** Tailwind 콘텐츠 경로 설정
  - 파일: `extapp_landing/tailwind.config.js`
  - 변경:
    ```js
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    ```

- [x] **[TASK-004]** Tailwind 디렉티브 추가
  - 파일: `extapp_landing/src/index.css`
  - 내용:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```

- [x] **[TASK-005]** App.tsx 임시 컨텐츠
  - 파일: `extapp_landing/src/App.tsx`
  - 내용 예:
    ```tsx
    export default function App() {
      return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50">
          <h1 className="text-3xl font-bold text-slate-900">
            Web AI Assistant Landing — Bootstrap OK
          </h1>
        </main>
      );
    }
    ```

- [x] **[TASK-006]** 테스트 인프라 설치
  - 명령:
    ```bash
    npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @types/jsdom
    ```
  - 파일 추가: `extapp_landing/vitest.config.ts`
    ```ts
    import { defineConfig } from 'vitest/config';
    import react from '@vitejs/plugin-react';
    export default defineConfig({
      plugins: [react()],
      test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.ts' },
    });
    ```
  - 파일 추가: `extapp_landing/src/test/setup.ts`
    ```ts
    import '@testing-library/jest-dom';
    ```

- [x] **[TASK-007]** 첫 단위 테스트 작성 (셋업 검증)
  - 파일: `extapp_landing/src/App.test.tsx`
    ```tsx
    import { render, screen } from '@testing-library/react';
    import App from './App';

    describe('App bootstrap', () => {
      it('renders the bootstrap heading', () => {
        render(<App />);
        expect(screen.getByText(/Bootstrap OK/i)).toBeInTheDocument();
      });
    });
    ```

- [x] **[TASK-008]** package.json scripts 정비
  - 파일: `extapp_landing/package.json`
  - 추가/확인:
    ```json
    "scripts": {
      "dev": "vite",
      "build": "tsc -b && vite build",
      "preview": "vite preview",
      "test": "vitest run",
      "test:watch": "vitest",
      "typecheck": "tsc --noEmit"
    }
    ```

- [x] **[TASK-009]** TypeScript strict 모드 확인 *(TEST-P1.4 대응)*
  - 파일: `extapp_landing/tsconfig.app.json`
  - Vite react-ts 템플릿은 기본으로 `"strict": true`를 포함하지만 명시적으로 검증
  - `compilerOptions.strict === true` 확인 — 누락 시 추가
  - 이 항목은 단순 빌드 통과가 아닌 **설정값 자체**가 strict임을 검증

- [x] **[TASK-010]** ESLint 설정 *(TEST-P1.13 대응 — REFACTOR에서 GREEN으로 이동)*
  - 명령:
    ```bash
    npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react-hooks eslint-plugin-react-refresh
    ```
  - Vite react-ts 템플릿이 자동 생성하는 `eslint.config.js`(또는 `.eslintrc.cjs`)를 사용하거나, 없으면 최소 설정 작성
  - 검증: `working_plan/scripts/verify_phase1.mjs`의 TEST-P1.13 PASS

- [x] **[TASK-011]** Prettier 설정 *(TEST-P1.14 대응 — REFACTOR에서 GREEN으로 이동)*
  - 명령:
    ```bash
    npm install -D prettier eslint-config-prettier
    ```
  - 파일: `extapp_landing/.prettierrc`
    ```json
    {
      "semi": true,
      "singleQuote": true,
      "trailingComma": "es5",
      "printWidth": 100,
      "tabWidth": 2
    }
    ```

- [x] **[TASK-012]** .gitignore 보강 *(TEST-P1.12 대응 — REFACTOR에서 GREEN으로 이동)*
  - 파일: `extapp_landing/.gitignore`
  - Vite 템플릿 기본값에 다음 항목이 모두 포함되었는지 확인 (없으면 추가):
    ```
    node_modules/
    dist/
    .vite/
    *.local
    coverage/
    ```

- [x] **[TASK-013]** main.tsx의 index.css import 확인 *(TEST-P1.8 대응)*
  - 파일: `extapp_landing/src/main.tsx`
  - Vite 템플릿이 자동으로 `import './index.css'`를 포함하지만 명시적으로 확인
  - 누락 시 추가

- [x] **[GREEN-VERIFY]** 검증 스크립트로 전 항목 PASS 확인
  ```bash
  cd 00_intro_web_landing_page
  node working_plan/scripts/verify_phase1.mjs
  ```
  **기대 결과 (v2)**: `23 PASS / 0 FAIL / 총 23`, exit code `0`

- [x] **[GREEN-VERIFY]** 추가 수동 확인
  ```bash
  cd extapp_landing
  npm run dev   # 브라우저에서 시각 확인 후 종료
  ```

---

## 1.4 REFACTOR Phase: 코드 개선

> **목적**: 동작 유지하면서 디렉토리/설정 정돈

### 1.4.1 구조 개선 (Make it right)

> **참고**: ESLint/Prettier/.gitignore/strict 검증은 GREEN 단계(TASK-009~012)로 이동했다.
> RED 단계에서 회귀 가드(TEST-P1.4, P1.12, P1.13, P1.14)로 보호되므로 GREEN에서 만족시키는 것이 TDD 원칙에 부합한다.
> REFACTOR는 동작에 영향이 없는 **순수 구조 정리**만 수행한다.

- [x] **[REFACTOR-STRUCTURE]** 불필요 파일 정리
  - 제거: `extapp_landing/src/assets/react.svg`, `extapp_landing/public/vite.svg` (Vite 기본 데모 자산)
  - 단순화: `extapp_landing/src/App.css` 제거 후 `App.tsx`에서 import 라인 삭제

- [x] **[REFACTOR-STRUCTURE]** 디렉토리 뼈대 생성 (다음 Phase 준비)
  - 빈 디렉토리: `src/components/{layout,common,sections}/`, `src/i18n/locales/`, `src/lib/`
  - 각 디렉토리에 `.gitkeep` 추가 (또는 README placeholder)

- [x] **[REFACTOR-VERIFY]** 리팩터링 후 검증 스크립트 재실행
  ```bash
  cd 00_intro_web_landing_page
  node working_plan/scripts/verify_phase1.mjs
  ```
  **기대 결과**: 여전히 `18 PASS / 0 FAIL` — 구조 변경이 동작에 영향 없음을 보장

### 1.4.2 빌드 품질 점검 (Make it fast)

- [x] **[REFACTOR-PERF-MEASURE]** 베이스라인 번들 크기 측정
  | 파일 | 이전 | 이후 | 변화 |
  |------|------|------|------|
  | dist/assets/index-*.js | — | 188 KB | 베이스라인 |
  | dist/assets/index-*.css | — | 4 KB (Tailwind purge 후) | 베이스라인 |
  | dist/index.html | — | 생성됨 | 베이스라인 |

- [x] **[REFACTOR-PERF-ANALYZE]** 빌드 품질 체크리스트
  | 항목 | 확인 방법 | 기대 | 적용 |
  |------|----------|------|------|
  | tsc strict 통과 | `npm run typecheck` | 0 errors | ✅ |
  | 빌드 성공 | `npm run build` | exit 0 | ✅ |
  | dev 서버 응답 | `npm run dev` | http 200 | ✅ (5173) |
  | 테스트 통과 | `npm run test` | 1 pass | ✅ |

---

## 1.5 사후 작업 (Post-Work)

- [x] **[VERIFY]** 검증 스크립트 최종 실행 (필수)
  ```bash
  cd 00_intro_web_landing_page
  node working_plan/scripts/verify_phase1.mjs
  ```
  **기대 결과**: `18 PASS / 0 FAIL`

- [x] **[VERIFY]** 추가 회귀 확인 (수동)
  - 브라우저에서 `npm run dev` 후 첫 화면 접속
  - "Bootstrap OK" 텍스트가 Tailwind 스타일로 표시되는지 확인
  - 콘솔 에러 없음 확인

- [x] **[DOC]** 작업 결과서 작성
  - 파일: `working_plan/working_history/v1.0/Phase1_Bootstrap_2026MMDD.md`
  - 포함 내용:
    - 설치된 패키지 버전 (vite, react, typescript, tailwindcss, vitest 등)
    - verify_phase1.mjs RED → GREEN 결과 비교
    - 발생한 이슈와 해결 방법
    - 다음 Phase 인계 사항

- [ ] **[COMMIT]** 변경사항 커밋
  ```bash
  git add 00_intro_web_landing_page/extapp_landing
  git add 00_intro_web_landing_page/working_plan/scripts/verify_phase1.mjs
  git commit -m "[P1] 랜딩 페이지 부트스트랩 — Vite + React + TS + Tailwind + RED 검증 스크립트"
  ```

---

## Phase 1 완료 조건 (Definition of Done)

- [x] `working_plan/scripts/verify_phase1.mjs` **23개** 항목 모두 PASS (v2)
- [x] **[wiring]** TEST-P1.4: tsconfig `strict: true` 명시 (단순 빌드 통과 아님)
- [x] **[wiring]** TEST-P1.5: tailwind.config content 글롭에 index.html, src/** 포함
- [x] **[wiring]** TEST-P1.6: postcss.config에 tailwindcss + autoprefixer 모두 포함
- [x] **[wiring]** TEST-P1.8: main.tsx가 './index.css' import
- [x] **[wiring]** TEST-P1.18: 빌드된 dist/assets/*.css에 App.tsx의 **모든** Tailwind 유틸 포함 (v2 동적 추출)
- [x] **[wiring]** TEST-P1.19: `npm run lint` 성공 (v2)
- [x] **[wiring]** TEST-P1.20: main.tsx `createRoot(...).render(<App/>)` 와이어링 (v2)
- [x] **[wiring]** TEST-P1.21: `npm run format:check` 성공 (v2)
- [x] **[wiring]** TEST-P1.22: `index.html` + `dist/index.html`의 번들 스크립트 주입 (v2)
- [x] **[wiring]** TEST-P1.23: `vite.config.ts` plugins 배열에 `react()` 호출 (v2)
- [x] `extapp_landing/`에서 `npm run dev`가 정상 실행됨
- [x] 브라우저에서 Tailwind 적용된 첫 화면 확인
- [x] App.test.tsx 1개 vitest 테스트 PASS
- [x] ESLint config + Prettier config 파일 존재
- [x] .gitignore에 node_modules, dist 포함
- [x] 다음 Phase에서 사용할 디렉토리 뼈대 생성 완료
- [x] 작업 결과서 작성 및 커밋 완료 — v1 결과서 `Phase1_Bootstrap_RED_20260410.md` + `Phase1_Bootstrap_20260410.md`, v2/v2.1 결과서 `Phase1_Bootstrap_TestGuardV2_20260411.md`. 문서 커밋 `f6e0639`, 코드·가드·결과서 커밋 `e9a5e56`
