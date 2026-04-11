# Phase 1: 프로젝트 부트스트랩

> **목표**: `extapp_landing/` 디렉토리에 Vite + React + TypeScript + Tailwind 프로젝트를 초기화하고, 첫 화면이 dev server에서 정상 렌더되도록 한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일
> **E2E 확인 단위**: `npm run dev` 실행 시 Tailwind 클래스가 적용된 빈 페이지가 표시되고 `npm run build`가 통과한다.

---

## 1.1 사전 작업 (Pre-Work)

> **목적**: 본작업의 실패를 줄이기 위한 환경 점검 및 컨텍스트 확인

- [ ] **[CONTEXT]** 작업 목적 및 배경 확인
  - 구현 계획서 검토: [02_implementation_plan.md](../02_implementation_plan.md) 2장(기술 스택), 3장(디렉토리 구조), 8장(Phase 1)
  - 산출물 위치: `00_intro_web_landing_page/extapp_landing/`

- [ ] **[ANALYSIS]** 현재 환경 확인
  - Node.js 버전: `node -v` (20.x 이상 필요)
  - npm 버전: `npm -v` (10.x 이상 권장)
  - 디렉토리 충돌 확인: `extapp_landing/`이 이미 존재하지 않는지

- [ ] **[ANALYSIS]** Vite 템플릿 확인
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

## 1.2 RED Phase: 실행 가능한 검증 스크립트 + 18개 회귀 가드

> **목적**: Phase 1 종료 조건을 **실제 실행 가능한 테스트**로 정의하고, 현재 모두 FAIL임을 확인

### 1.2.1 검증 스크립트 작성

- [ ] **[RED]** `working_plan/scripts/verify_phase1.mjs` 작성
  - Node 빌트인(`fs`, `child_process`, `path`)만 사용
  - 18개 검증 항목을 실제 코드로 구현
  - **정적 검사 14건**(TEST-P1.1 ~ TEST-P1.14): 파일 존재 + 내용 파싱 + wiring 확인
  - **런타임 검사 4건**(TEST-P1.15 ~ TEST-P1.18): `npm run typecheck/test/build` 실행 + 빌드 산출물 검증
  - 종료 코드: 전부 PASS=0 / 1건 이상 FAIL=1

### 1.2.2 검증 체크리스트 (TEST-P1.1 ~ TEST-P1.18)

검증 스크립트가 실제로 검사하는 18개 항목. 각 항목은 단순 존재 확인이 아닌 **wiring 검증**까지 수행한다.

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
| **P1.18** | `dist/assets/*.css`에 App.tsx에서 사용한 Tailwind 유틸리티 포함 (E2E wiring) | execSync 결과 파일 grep (#3 대응 — Tailwind 끝점 검증) |

> **#1~#5는 본 Phase 리뷰에서 제기된 이슈 번호와 매핑된다.**
> **포트 5173 검사는 제거**되었다 (Vite의 fallback 동작으로 false negative 가능). `npm run build` 성공 + `dist/index.html` 생성이 더 안정적인 E2E 가드.

### 1.2.3 RED 상태 확인 (모두 FAIL)

- [ ] **[RED-VERIFY]** 검증 스크립트 실행 → 모든 항목 FAIL 확인
  ```bash
  cd 00_intro_web_landing_page
  node working_plan/scripts/verify_phase1.mjs
  ```
  **기대 결과**: `0 PASS / 18 FAIL / 총 18`, exit code `1`

- [ ] **[RED-VERIFY]** 결과 스냅샷을 `working_history/v1.0/Phase1_Bootstrap_RED_*.md`에 기록
  - 모든 18개 항목이 FAIL인지 표로 정리
  - GREEN 단계 종료 시 동일 스크립트가 18 PASS인지 비교 가능하도록 함

---

## 1.3 GREEN Phase: 최소 코드 구현

> **목적**: 위 검증 체크리스트를 통과하는 최소 셋업

- [ ] **[TASK-001]** Vite 프로젝트 초기화
  - 작업 디렉토리: `00_intro_web_landing_page/`
  - 명령:
    ```bash
    cd 00_intro_web_landing_page
    npm create vite@latest extapp_landing -- --template react-ts
    cd extapp_landing
    npm install
    ```

- [ ] **[TASK-002]** Tailwind CSS 설치 및 초기화
  - 파일: `extapp_landing/`
  - 명령:
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```

- [ ] **[TASK-003]** Tailwind 콘텐츠 경로 설정
  - 파일: `extapp_landing/tailwind.config.js`
  - 변경:
    ```js
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    ```

- [ ] **[TASK-004]** Tailwind 디렉티브 추가
  - 파일: `extapp_landing/src/index.css`
  - 내용:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```

- [ ] **[TASK-005]** App.tsx 임시 컨텐츠
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

- [ ] **[TASK-006]** 테스트 인프라 설치
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

- [ ] **[TASK-007]** 첫 단위 테스트 작성 (셋업 검증)
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

- [ ] **[TASK-008]** package.json scripts 정비
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

- [ ] **[TASK-009]** TypeScript strict 모드 확인 *(TEST-P1.4 대응)*
  - 파일: `extapp_landing/tsconfig.app.json`
  - Vite react-ts 템플릿은 기본으로 `"strict": true`를 포함하지만 명시적으로 검증
  - `compilerOptions.strict === true` 확인 — 누락 시 추가
  - 이 항목은 단순 빌드 통과가 아닌 **설정값 자체**가 strict임을 검증

- [ ] **[TASK-010]** ESLint 설정 *(TEST-P1.13 대응 — REFACTOR에서 GREEN으로 이동)*
  - 명령:
    ```bash
    npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react-hooks eslint-plugin-react-refresh
    ```
  - Vite react-ts 템플릿이 자동 생성하는 `eslint.config.js`(또는 `.eslintrc.cjs`)를 사용하거나, 없으면 최소 설정 작성
  - 검증: `working_plan/scripts/verify_phase1.mjs`의 TEST-P1.13 PASS

- [ ] **[TASK-011]** Prettier 설정 *(TEST-P1.14 대응 — REFACTOR에서 GREEN으로 이동)*
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

- [ ] **[TASK-012]** .gitignore 보강 *(TEST-P1.12 대응 — REFACTOR에서 GREEN으로 이동)*
  - 파일: `extapp_landing/.gitignore`
  - Vite 템플릿 기본값에 다음 항목이 모두 포함되었는지 확인 (없으면 추가):
    ```
    node_modules/
    dist/
    .vite/
    *.local
    coverage/
    ```

- [ ] **[TASK-013]** main.tsx의 index.css import 확인 *(TEST-P1.8 대응)*
  - 파일: `extapp_landing/src/main.tsx`
  - Vite 템플릿이 자동으로 `import './index.css'`를 포함하지만 명시적으로 확인
  - 누락 시 추가

- [ ] **[GREEN-VERIFY]** 검증 스크립트로 18개 항목 모두 PASS 확인
  ```bash
  cd 00_intro_web_landing_page
  node working_plan/scripts/verify_phase1.mjs
  ```
  **기대 결과**: `18 PASS / 0 FAIL / 총 18`, exit code `0`

- [ ] **[GREEN-VERIFY]** 추가 수동 확인
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

- [ ] **[REFACTOR-STRUCTURE]** 불필요 파일 정리
  - 제거: `extapp_landing/src/assets/react.svg`, `extapp_landing/public/vite.svg` (Vite 기본 데모 자산)
  - 단순화: `extapp_landing/src/App.css` 제거 후 `App.tsx`에서 import 라인 삭제

- [ ] **[REFACTOR-STRUCTURE]** 디렉토리 뼈대 생성 (다음 Phase 준비)
  - 빈 디렉토리: `src/components/{layout,common,sections}/`, `src/i18n/locales/`, `src/lib/`
  - 각 디렉토리에 `.gitkeep` 추가 (또는 README placeholder)

- [ ] **[REFACTOR-VERIFY]** 리팩터링 후 검증 스크립트 재실행
  ```bash
  cd 00_intro_web_landing_page
  node working_plan/scripts/verify_phase1.mjs
  ```
  **기대 결과**: 여전히 `18 PASS / 0 FAIL` — 구조 변경이 동작에 영향 없음을 보장

### 1.4.2 빌드 품질 점검 (Make it fast)

- [ ] **[REFACTOR-PERF-MEASURE]** 베이스라인 번들 크기 측정
  | 파일 | 이전 | 이후 | 변화 |
  |------|------|------|------|
  | dist/assets/index-*.js | — | [측정] | 베이스라인 |
  | dist/assets/index-*.css | — | [측정] | 베이스라인 |
  | dist/index.html | — | [측정] | 베이스라인 |

- [ ] **[REFACTOR-PERF-ANALYZE]** 빌드 품질 체크리스트
  | 항목 | 확인 방법 | 기대 | 적용 |
  |------|----------|------|------|
  | tsc strict 통과 | `npm run typecheck` | 0 errors | ⬜ |
  | 빌드 성공 | `npm run build` | exit 0 | ⬜ |
  | dev 서버 응답 | `npm run dev` | http 200 | ⬜ |
  | 테스트 통과 | `npm run test` | 1 pass | ⬜ |

---

## 1.5 사후 작업 (Post-Work)

- [ ] **[VERIFY]** 검증 스크립트 최종 실행 (필수)
  ```bash
  cd 00_intro_web_landing_page
  node working_plan/scripts/verify_phase1.mjs
  ```
  **기대 결과**: `18 PASS / 0 FAIL`

- [ ] **[VERIFY]** 추가 회귀 확인 (수동)
  - 브라우저에서 `npm run dev` 후 첫 화면 접속
  - "Bootstrap OK" 텍스트가 Tailwind 스타일로 표시되는지 확인
  - 콘솔 에러 없음 확인

- [ ] **[DOC]** 작업 결과서 작성
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

- [ ] `working_plan/scripts/verify_phase1.mjs` 18개 항목 모두 PASS
- [ ] **[wiring]** TEST-P1.4: tsconfig `strict: true` 명시 (단순 빌드 통과 아님)
- [ ] **[wiring]** TEST-P1.5: tailwind.config content 글롭에 index.html, src/** 포함
- [ ] **[wiring]** TEST-P1.6: postcss.config에 tailwindcss + autoprefixer 모두 포함
- [ ] **[wiring]** TEST-P1.8: main.tsx가 './index.css' import
- [ ] **[wiring]** TEST-P1.18: 빌드된 dist/assets/*.css에 Tailwind 유틸리티(min-h-screen) 실제 포함
- [ ] `extapp_landing/`에서 `npm run dev`가 정상 실행됨
- [ ] 브라우저에서 Tailwind 적용된 첫 화면 확인
- [ ] App.test.tsx 1개 vitest 테스트 PASS
- [ ] ESLint config + Prettier config 파일 존재
- [ ] .gitignore에 node_modules, dist 포함
- [ ] 다음 Phase에서 사용할 디렉토리 뼈대 생성 완료
- [ ] 작업 결과서 작성 및 커밋 완료
