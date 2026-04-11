# Phase 1: Bootstrap — 작업 결과서

> **상위 계획서**: [main_landing_todolist.md](../../main_landing_todolist.md)
> **상세 계획서**: [phase01_bootstrap.md](../../phase01_bootstrap.md)
> **검증 스크립트**: [scripts/verify_phase1.mjs](../../scripts/verify_phase1.mjs)
> **이전 RED 스냅샷**: [Phase1_Bootstrap_RED_20260410.md](./Phase1_Bootstrap_RED_20260410.md)
> **작업일**: 2026-04-10
> **작업자**: junghojang
> **상태**: ✅ 완료 (사전 → RED → GREEN → REFACTOR → 사후)

---

## 1. 작업 요약

| 항목 | 내용 |
|------|------|
| 목표 | `extapp_landing/`에 Vite + React + TS + Tailwind 부트스트랩 + RED 회귀 가드 |
| 작업 범위 | TASK-001 ~ TASK-013 (GREEN) + REFACTOR 구조 정리 + 사후 검증 |
| 산출물 | `extapp_landing/` 신규 프로젝트 디렉토리 |
| 검증 결과 | **18 PASS / 0 FAIL** (verify_phase1.mjs) |
| 빌드 베이스라인 | JS 188KB, CSS 4KB (gzip 미적용) |

---

## 2. 검증 스크립트 결과 비교 (RED → GREEN)

| ID | 검증 항목 | RED (사전) | GREEN (현재) |
|----|----------|-----------|--------------|
| P1.1 | extapp_landing/package.json 존재 | ❌ FAIL | ✅ PASS |
| P1.2 | dependencies에 react/react-dom | ❌ FAIL | ✅ PASS |
| P1.3 | devDependencies 핵심 패키지 | ❌ FAIL | ✅ PASS |
| P1.4 | tsconfig strict: true (#4 대응) | ❌ FAIL | ✅ PASS |
| P1.5 | tailwind content glob (#3 대응) | ❌ FAIL | ✅ PASS |
| P1.6 | postcss tailwindcss+autoprefixer | ❌ FAIL | ✅ PASS |
| P1.7 | index.css @tailwind 디렉티브 | ❌ FAIL | ✅ PASS |
| P1.8 | main.tsx → './index.css' import | ❌ FAIL | ✅ PASS |
| P1.9 | App.tsx Tailwind 유틸 className | ❌ FAIL | ✅ PASS |
| P1.10 | App.test.tsx + describe/it | ❌ FAIL | ✅ PASS |
| P1.11 | DOM 환경(jsdom 또는 happy-dom) | ❌ FAIL | ✅ PASS |
| P1.12 | .gitignore node_modules, dist | ❌ FAIL | ✅ PASS |
| P1.13 | ESLint config 존재 | ❌ FAIL | ✅ PASS |
| P1.14 | Prettier config 존재 | ❌ FAIL | ✅ PASS |
| P1.15 | npm run typecheck (strict) | ❌ FAIL | ✅ PASS |
| P1.16 | npm test 성공 | ❌ FAIL | ✅ PASS |
| P1.17 | npm run build + dist/index.html | ❌ FAIL | ✅ PASS |
| P1.18 | dist CSS Tailwind 유틸 (E2E) | ❌ FAIL | ✅ PASS |

**전환 결과**: 0 PASS → **18 PASS** (exit 1 → exit 0)

---

## 3. 설치된 패키지 버전 (Vite scaffold + 추가 설치)

### Dependencies
| 패키지 | 버전 |
|--------|------|
| react | ^19.2.4 |
| react-dom | ^19.2.4 |

### DevDependencies (핵심)
| 패키지 | 버전 | 비고 |
|--------|------|------|
| vite | ^8.0.4 | scaffold |
| typescript | ~6.0.2 | scaffold |
| @vitejs/plugin-react | ^6.0.1 | scaffold |
| eslint | ^9.39.4 | scaffold (flat config) |
| typescript-eslint | ^8.58.0 | scaffold |
| tailwindcss | ^3.4.19 | 명시 설치 (Tailwind 4 회피) |
| postcss | ^8.5.9 | tailwind 의존 |
| autoprefixer | ^10.4.27 | tailwind 의존 |
| vitest | ^4.1.4 | 명시 설치 |
| @testing-library/react | ^16.3.2 | 명시 설치 |
| @testing-library/jest-dom | ^6.9.1 | 명시 설치 |
| jsdom | ^27.0.1 | 명시 설치 (호환성용 보존) |
| happy-dom | ^20.8.9 | **추가 설치** — jsdom@27 CJS/ESM 이슈 회피 |
| @rolldown/binding-darwin-arm64 | ^1.0.0-rc.15 | **추가 설치** — npm optional deps 누락 회피 |
| @types/jsdom | ^28.0.1 | 명시 설치 |
| prettier | ^3.8.2 | 명시 설치 |
| eslint-config-prettier | ^10.1.8 | 명시 설치 |

---

## 4. 발생 이슈와 해결 방법

### 4.1 Node 버전 경고 (Low)

**증상**: Vite 8 / create-vite 9가 Node `^20.19.0 || >=22.12.0`을 요구하지만 환경은 Node 22.11.0. EBADENGINE 경고 발생.

**해결**: Minor 버전 차이로 실제 동작에는 문제 없음을 확인 (`npm run dev`/`build`/`test` 모두 성공). 향후 Phase 진행 중 문제 발생 시 Node를 22.12+로 업그레이드하기로 결정.

**영향**: 경고만 발생, 회귀 가드 18개 모두 PASS.

---

### 4.2 vitest 4 + rolldown native binary 누락 (Medium)

**증상**:
```
Error: Cannot find module '@rolldown/binding-darwin-arm64'
```
vitest 4가 내부적으로 rolldown을 사용하는데, optional 의존성으로 선언된 macOS arm64 native binding이 npm에 의해 자동 설치되지 않음 (npm optional deps의 알려진 버그).

**원인**: npm 10.x의 optional dependencies 처리 버그. 같은 문제를 esbuild, rollup 등에서도 종종 보임.

**해결**:
```bash
npm install -D @rolldown/binding-darwin-arm64
```
명시적으로 devDependencies에 추가하여 환경 재현성 확보.

**영향**: 이 패키지가 macOS arm64 환경에서만 필요하지만 devDeps에 두어도 다른 플랫폼의 빌드를 깨지 않음 (optional/platform-aware install).

---

### 4.3 vitest config의 `test` 필드 타입 에러 (Medium)

**증상**:
```
Object literal may only specify known properties,
and 'test' does not exist in type 'UserConfigExport'.
```
`vite.config.ts`에서 `defineConfig({ plugins, test })` 작성 시 vite의 `defineConfig` 타입은 `test` 필드를 모르기 때문에 TS 에러 발생.

**원인**: vitest 4부터 vitest 전용 `defineConfig`는 `vitest/config`에서 export됨. vite의 `defineConfig`로는 type-safe하게 test 옵션 작성 불가.

**해결**:
```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
```
import 경로를 `vite` → `vitest/config`로 변경.

**영향**: TypeScript 빌드 통과 + vitest 옵션 type-safe.

---

### 4.4 jsdom 27 transitive deps의 CJS/ESM interop 깨짐 (High)

**증상**:
```
Error: require() of ES Module @csstools/css-calc/dist/index.mjs not supported.
[vitest-pool]: Failed to start forks worker for test files
```
jsdom@27 → `@asamuzakjp/css-color` (CJS) → `@csstools/css-calc` (ESM-only). CJS에서 ESM을 require() 하려다 실패.

**원인**: jsdom 27이 사용하는 css-color의 일부 transitive 의존성이 ESM-only로 배포되어 패키징 호환성 깨짐.

**해결 검토**:
1. ❌ jsdom 다운그레이드 — fragile, 다른 호환성 문제 가능
2. ❌ css-calc 버전 핀 — transitive 핀은 유지 부담
3. ✅ **happy-dom으로 환경 전환** — vitest 팀 권장, 더 빠르고 이런 issue 없음

**적용**:
```bash
npm install -D happy-dom
```
```ts
// vite.config.ts
test: {
  globals: true,
  environment: 'happy-dom',  // 'jsdom' → 'happy-dom'
  setupFiles: './src/test/setup.ts',
}
```

**부수 영향 — verify_phase1.mjs 업데이트**:
- TEST-P1.3: devDeps에서 `jsdom` 강제 → `jsdom OR happy-dom` 허용
- TEST-P1.11: vitest config에 `jsdom` 문자열 → `environment: 'jsdom'|'happy-dom'` 정규식
- 의도(DOM 에뮬레이션 가능)는 동일, 구현 선택만 유연화. jsdom은 호환성 위해 devDeps에 보존.

**판정**: TDD 원칙상 테스트 변경은 신중해야 하나, 본 케이스는 **테스트가 너무 좁은 구현 선택을 강요했던 결함**이며, 동일한 의도를 보존하면서 일반화한 것. 작업 결과서에 명시 기록.

---

## 5. 산출물 인벤토리

### 5.1 디렉토리 구조

```
00_intro_web_landing_page/
├── extension_intro.md
├── 01_landing_page_plan.md
├── 02_implementation_plan.md
├── working_plan/
│   ├── main_landing_todolist.md
│   ├── phase01_bootstrap.md             ← (RED 단계에서 수정됨)
│   ├── phase02_design_system.md
│   ├── ...
│   ├── scripts/
│   │   └── verify_phase1.mjs            ← 신규 (RED 단계에서 작성, 본 단계에서 P1.3/P1.11 수정)
│   └── working_history/v1.0/
│       ├── Phase1_Bootstrap_RED_20260410.md
│       └── Phase1_Bootstrap_20260410.md  ← 이 파일
└── extapp_landing/                       ← 본 Phase 산출물
    ├── .gitignore                        (Vite scaffold + .vite/coverage 보강)
    ├── .prettierrc                       (신규)
    ├── eslint.config.js                  (Vite scaffold)
    ├── index.html
    ├── package.json                      (scripts: dev/build/lint/preview/test/test:watch/typecheck)
    ├── package-lock.json
    ├── postcss.config.js                 (Tailwind init)
    ├── tailwind.config.js                (content glob 설정)
    ├── tsconfig.app.json                 (strict: true + vitest/jest-dom types 추가)
    ├── tsconfig.json                     (Vite scaffold)
    ├── tsconfig.node.json                (Vite scaffold)
    ├── vite.config.ts                    (vitest/config + happy-dom)
    ├── README.md                         (Vite scaffold)
    ├── public/
    │   └── favicon.svg                   (Vite scaffold)
    ├── src/
    │   ├── App.tsx                       (Bootstrap OK 임시 컨텐츠)
    │   ├── App.test.tsx                  (1개 vitest 단위 테스트)
    │   ├── main.tsx                      (Vite scaffold; index.css import 확인)
    │   ├── index.css                     (@tailwind 디렉티브로 단순화)
    │   ├── test/
    │   │   └── setup.ts                  (@testing-library/jest-dom import)
    │   ├── components/                   (다음 Phase 준비)
    │   │   ├── common/.gitkeep
    │   │   ├── layout/.gitkeep
    │   │   └── sections/.gitkeep
    │   ├── i18n/locales/.gitkeep         (다음 Phase 준비)
    │   └── lib/.gitkeep                  (다음 Phase 준비)
    └── dist/                             (빌드 산출물; gitignore됨)
        ├── index.html
        └── assets/
            ├── index-*.js   (188KB)
            └── index-*.css  (4KB)
```

### 5.2 파일별 변경 요약

| 파일 | 변경 종류 | 비고 |
|------|----------|------|
| `tailwind.config.js` | Edit | content 글롭에 `index.html`, `src/**/*.{js,ts,jsx,tsx}` 추가 |
| `src/index.css` | Rewrite | 기존 Vite 데모 CSS → `@tailwind base/components/utilities` 3줄 |
| `src/App.tsx` | Rewrite | 기존 Vite 데모 → "Bootstrap OK" + Tailwind className |
| `src/App.test.tsx` | New | vitest + RTL 1개 테스트 |
| `src/test/setup.ts` | New | jest-dom matchers |
| `vite.config.ts` | Edit | `vitest/config` + happy-dom test 옵션 |
| `tsconfig.app.json` | Edit | `strict: true`, `types`에 vitest/jest-dom 추가 |
| `package.json` | Edit | scripts에 test/test:watch/typecheck 추가 |
| `.prettierrc` | New | Prettier 5개 룰 |
| `.gitignore` | Edit | `.vite`, `coverage` 추가 |
| `src/components/{common,layout,sections}/.gitkeep` | New | Phase 2 준비 |
| `src/i18n/locales/.gitkeep` | New | Phase 3 준비 |
| `src/lib/.gitkeep` | New | Phase 3 준비 |
| `src/App.css` | Delete | Vite 데모 CSS |
| `src/assets/{react,vite}.svg`, `hero.png` | Delete | Vite 데모 이미지 |
| `public/icons.svg` | Delete | Vite 데모 아이콘 |

---

## 6. 빌드 베이스라인 (Phase 9 비교 기준)

| 항목 | 값 | 비고 |
|------|----|------|
| `dist/assets/index-*.js` | 188 KB | 미가공 (gzip 미적용) |
| `dist/assets/index-*.css` | 4 KB | Tailwind purge 후 |
| `dist/index.html` | (작은 파일) | |

본 수치는 P9(반응형/SEO/빌드 검증)에서 최종 비교 기준이 됨.

---

## 7. Phase 1 완료 조건 (Definition of Done) 체크

- [x] `working_plan/scripts/verify_phase1.mjs` 18개 항목 모두 PASS (exit 0)
- [x] **[wiring]** TEST-P1.4: tsconfig `strict: true` 명시
- [x] **[wiring]** TEST-P1.5: tailwind.config content 글롭에 index.html, src/** 포함
- [x] **[wiring]** TEST-P1.6: postcss.config에 tailwindcss + autoprefixer 모두 포함
- [x] **[wiring]** TEST-P1.8: main.tsx가 './index.css' import
- [x] **[wiring]** TEST-P1.18: 빌드된 dist/assets/*.css에 Tailwind 유틸리티(min-h-screen) 실제 포함
- [x] `extapp_landing/`에서 `npm run dev`가 정상 실행됨 (5173 포트, HTTP 200)
- [x] App.test.tsx 1개 vitest 테스트 PASS
- [x] ESLint config + Prettier config 파일 존재
- [x] .gitignore에 node_modules, dist 포함
- [x] 다음 Phase에서 사용할 디렉토리 뼈대 생성 완료
- [x] 작업 결과서 작성 (이 파일)
- [ ] 변경사항 커밋 (사용자 승인 후 진행)

---

## 8. 다음 Phase 인계 사항 (Phase 2)

### 8.1 환경

- **Node 버전 경고 잔존**: Vite 8/create-vite 9가 22.12+를 요구. 22.11.0에서도 동작은 정상이나 경고가 매번 출력. P2 진행 중 문제 없으면 무시, 아니면 Node 업그레이드.
- **happy-dom 사용**: 컴포넌트 단위 테스트는 happy-dom 환경에서 실행됨. JSDOM-specific API(예: `document.fonts`)에 의존하는 코드 작성 시 호환성 확인 필요.
- **rolldown native binary 의존**: `@rolldown/binding-darwin-arm64`이 macOS arm64에서 필수. CI/다른 OS에서 빌드 시 해당 OS의 binding이 자동 설치되어야 함 (현재 명시 설치는 macOS arm64만).

### 8.2 다음 Phase에서 사용할 자산

- `src/components/common/`: Section, Button, Badge, FeatureCard 컴포넌트가 들어갈 자리 (.gitkeep로 자리 표시)
- `src/components/layout/`: Header, Footer, LanguageSwitcher
- `src/components/sections/`: 10개 섹션 컴포넌트
- `src/i18n/locales/`: ko/en/ja/zh JSON
- `src/lib/`: constants.ts, types.ts

### 8.3 Phase 2 진입 시 할 일

phase02_design_system.md의 사전 작업 → RED → GREEN 순으로 진행.

특히 P2에서 다음 작업이 필요:
1. `lucide-react` 미설치 (P5에서 설치 예정이나 P2에서 아이콘이 필요할 수 있음)
2. `clsx` 설치 필요 (P2 TASK-003)
3. Pretendard 폰트 로드 (P2 TASK-002)
4. 디자인 토큰 확장 (P2 TASK-001)

### 8.4 회귀 가드 보존

본 Phase에서 작성한 `verify_phase1.mjs`는 Phase 2 이후에도 회귀 가드로 동작해야 한다. 다음 Phase 종료 시점에서도 이 18개 항목이 PASS인지 확인 가능.

```bash
cd 00_intro_web_landing_page
node working_plan/scripts/verify_phase1.mjs
# 기대: 18 PASS / 0 FAIL
```

---

## 9. 미해결 이슈

없음. 모든 검증 항목 통과.

---

## 10. 작업 시간

| 단계 | 소요 |
|------|------|
| 사전 작업 (환경 점검) | ~5분 |
| RED Phase (검증 스크립트 작성) | ~30분 (이전 세션) |
| GREEN Phase (TASK-001 ~ TASK-013) | ~45분 |
| 이슈 해결 (rolldown + happy-dom 전환) | ~15분 |
| REFACTOR Phase (구조 정리) | ~5분 |
| 사후 작업 (검증 + 결과서 작성) | ~15분 |
| **합계** | **약 2시간** (1일 예상 대비 단축) |

---

## 11. 최종 커밋 권장 (사용자 승인 후 실행)

```bash
cd /Users/junghojang/Developments/myProject/DINKIssTyle-Chrome-Extensions/Local-AI-Assistant

git add docs/00_intro_web_landing_page/extapp_landing
git add docs/00_intro_web_landing_page/working_plan/scripts/verify_phase1.mjs
git add docs/00_intro_web_landing_page/working_plan/phase01_bootstrap.md
git add docs/00_intro_web_landing_page/working_plan/working_history/v1.0/Phase1_Bootstrap_RED_20260410.md
git add docs/00_intro_web_landing_page/working_plan/working_history/v1.0/Phase1_Bootstrap_20260410.md

git commit -m "[P1] 랜딩 페이지 부트스트랩 — Vite 8 + React 19 + TS 6 + Tailwind 3 + RED 검증 스크립트"
```

> **주의**: 현재 작업 디렉토리에 본 Phase와 무관한 변경(P30 작업 등)이 함께 존재합니다. 위 명령은 본 Phase에 관련된 파일만 add하므로 안전합니다.
