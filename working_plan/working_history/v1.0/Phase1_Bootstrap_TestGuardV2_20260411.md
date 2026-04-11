# Phase 1: Bootstrap — 테스트 가드 v2 업그레이드 작업 결과서

> **상위 계획서**: [main_landing_todolist.md](../../main_landing_todolist.md)
> **상세 계획서**: [phase01_bootstrap.md](../../phase01_bootstrap.md)
> **검증 스크립트**: [scripts/verify_phase1.mjs](../../scripts/verify_phase1.mjs)
> **선행 결과서**:
>   - [Phase1_Bootstrap_RED_20260410.md](./Phase1_Bootstrap_RED_20260410.md) — v1 RED 스냅샷 (18개)
>   - [Phase1_Bootstrap_20260410.md](./Phase1_Bootstrap_20260410.md) — v1 GREEN 결과서 (0 PASS → 18 PASS)
> **작업일**: 2026-04-11
> **작업자**: junghojang
> **상태**: ✅ 완료 (리뷰 → 실측 검증 → 루트 원인 수정 → v2 가드 확장 → 돌연변이 테스트 → 문서 반영)
> **위치**: 이 결과서는 **v1 Phase 1 완료 이후 추가 수행된 리뷰 기반 보강 작업**을 기록한다. v1 원작업은 위 20260410 두 문서가 역할한다.

---

## 1. 작업 요약

| 항목 | 내용 |
|------|------|
| 목표 | v1 테스트 가드(18개)에 대한 리뷰 피드백 6건을 실측 검증 후 루트 원인 수정 및 가드 확장 |
| 작업 범위 | `verify_phase1.mjs` v1 → v2 / `vite.config.ts` lint 루트 원인 수정 / `package.json` format 스크립트 / Prettier 일괄 포맷 / `phase01_bootstrap.md` v2 반영 |
| 최종 검증 결과 | **23 PASS / 0 FAIL** (v1 18 → v2 23) |
| 돌연변이 테스트 | 6개 가드 모두 의도한 회귀 검출 확인 |
| 빌드·테스트·린트·포맷 | lint / typecheck / test / build / format:check 전부 통과 |

---

## 2. 리뷰 피드백 6건 및 실측 검증

v1(18개 가드) 완료 후 외부 리뷰에서 총 6건의 사각지대가 제기되었다. 각 항목을 **주장만 받아들이지 않고 실제 환경에서 재현 가능한 실측**으로 검증했다.

| # | 심각도 | 이슈 | 실측 검증 방법 | 검증 결과 |
|---|--------|------|----------------|-----------|
| 1 | **High** | `P1.13`이 ESLint 설정 "존재"만 검사 → `npm run lint`가 `vite.config.ts:1`의 `/// <reference types="vitest/config" />` 때문에 실제로 실패하지만 v1 가드는 검출 못함 | `npm run lint` 실행 | ✅ `@typescript-eslint/triple-slash-reference` 에러로 실제 실패 재현 |
| 2 | **Medium** | `main.tsx`의 `createRoot(...).render(...)` wiring이 깨져도 통과 — `App.test.tsx`가 `<App />`을 직접 렌더하므로 main.tsx 경로를 타지 않음 | `P1.8` 소스 검토, `App.test.tsx` 구조 확인 | ✅ `P1.8`은 `import './index.css'` 문자열만 검사하는 것 확인 |
| 3 | **Medium** | `P1.18`이 `const required = ['min-h-screen']` 한 개만 검사 → 색·타이포·정렬 회귀를 검출 못함 | `verify_phase1.mjs:320` 직접 확인 | ✅ 하드코딩된 단일 클래스 검사 재현 |
| 4 | **Low** | `P1.14`는 Prettier 설정 "존재"만 검사 · `format` 스크립트 부재 · 실제 코드베이스 포맷 일치 여부 미검증 | `npx prettier --check .` 실행 | ✅ 7개 파일이 포맷 불일치 상태 (`eslint.config.js`, `postcss.config.js`, `README.md`, `src/App.tsx`, `src/main.tsx`, `tailwind.config.js`, `tsconfig.json`) |
| 5 | **Refined** | `index.html` ↔ `main.tsx` 엔트리 연결성 가드 부재 — `<script type="module" src="/src/main.tsx">`가 제거돼도 빌드 성공 + `dist/index.html` 생성되어 `P1.17` 통과 | 소스/빌드 HTML 모두 확인 | ✅ `P1.17`은 파일 존재만 검사, script 태그 주입 여부 미검증 확인 |
| 6 | **Refined** | `@vitejs/plugin-react`가 `plugins: [react()]` 배열에 실제 포함되는지 가드 부재 — devDep 존재(`P1.3`)만으로 JSX 변환 wiring 보장 불가 | `vite.config.ts` 직접 확인 | ✅ devDep 검사와 config wiring 검사가 분리되어야 함을 확인 |

> **원칙 준수**: 모든 주장을 "있을 법하다"로 수용하지 않고 각각 재현 가능한 실측을 거쳤다. 검증 없이 가드를 추가하면 실제 문제를 반영하지 못하거나 가짜 문제를 가드로 굳힐 위험이 있다.

---

## 3. 루트 원인 수정 (High 이슈 #1)

### 3.1 증상
`npm run lint` 실행 시 아래 에러:
```
/extapp_landing/vite.config.ts
  1:1  error  Do not use a triple slash reference for vitest/config,
              use `import` style instead
              @typescript-eslint/triple-slash-reference
```

### 3.2 원인
v1 GREEN 단계([Phase1_Bootstrap_20260410.md](./Phase1_Bootstrap_20260410.md) §4.3 참조)에서 `vite.config.ts`의 `test` 필드 타입 안전성을 위해 `import { defineConfig } from 'vitest/config'` 로 변경했을 때, Vite scaffold가 남겨둔 triple-slash reference 라인(`/// <reference types="vitest/config" />`)을 함께 제거하지 않았다. `vitest/config`에서 `defineConfig`를 직접 import하면 `test` 옵션 타입이 이미 포함되므로 reference는 **중복이자 불필요**.

### 3.3 수정
```diff
- /// <reference types="vitest/config" />
  import { defineConfig } from 'vitest/config';
  import react from '@vitejs/plugin-react';
```

### 3.4 회귀 확인
수정 후:
- `npm run lint` → 통과
- `npm run typecheck` → 통과 (`test` 필드 타입 여전히 유효)
- `npm test` → 1 pass
- `npm run build` → 빌드 정상

즉 `vitest/config` 의 `defineConfig` import 하나로 타입과 lint 규칙을 모두 만족한다.

---

## 4. v2 가드 확장

### 4.1 P1.18 강화 — 동적 추출로 변경

**이전 (v1)**:
```js
const required = ['min-h-screen'];
```
→ App.tsx 클래스 중 하나만 검사. 색·타이포·정렬 회귀 검출 불가.

**이후 (v2)**:
- `App.tsx`의 `className="..."` 속성을 정규식으로 파싱해 모든 클래스 수집
- Tailwind utility prefix(`min-h-`, `flex`, `bg-`, `text-`, `p[xytrbl]?-`, `rounded`, `shadow`, `border`, … 약 40여개)로 필터링
- 필터링된 **모든** 유틸리티가 `dist/assets/*.css`에 포함되는지 검사
- CSS escape 처리(`text-3xl` → `.text-3xl`, `p-2.5` → `.p-2\.5` 등) 포함
- 누락 발생 시 어떤 유틸이 빠졌는지 구체 보고

**효과**: App.tsx가 사용하는 8개 유틸(`min-h-screen`, `flex`, `items-center`, `justify-center`, `bg-slate-50`, `text-3xl`, `font-bold`, `text-slate-900`) 중 **어느 하나라도** 빌드 CSS에서 빠지면 FAIL.

### 4.2 P1.19 신규 — `npm run lint` 런타임 가드

```js
test('P1.19', 'npm run lint 성공 (ESLint 회귀 가드)', () => {
  if (!nodeModulesReady()) return 'package.json or node_modules missing';
  const pkg = JSON.parse(readFileSync(join(APP, 'package.json'), 'utf-8'));
  if (!pkg.scripts?.lint) return 'package.json has no "lint" script';
  try {
    execSync('npm run lint', { cwd: APP, stdio: 'pipe' });
  } catch (e) { /* 마지막 5줄 요약해 보고 */ }
});
```

v1에서 lint는 `package.json` 스크립트만 존재했고 실제 실행 검증이 없었다. v2는 런타임 실행으로 lint 회귀를 감지.

### 4.3 P1.20 신규 — main.tsx 렌더 와이어링 (정적 4건)

```js
// 1) createRoot import
/import\s*\{[^}]*\bcreateRoot\b[^}]*\}\s*from\s*['"]react-dom\/client['"]/
// 2) App import
/import\s+App\s+from\s*['"]\.\/App(?:\.tsx)?['"]/
// 3) createRoot(...) 호출 + .render(...) 체인
/createRoot\s*\(/ && /\)\s*\.render\s*\(/
// 4) <App 존재
/<App\b/
```

> **설계 주의**: 초기 구현에서 `createRoot\s*\([^)]*\)\s*\.render\s*\(` 단일 regex를 썼으나 `createRoot(document.getElementById('root')!)` 의 중첩 괄호에서 첫 `)`에 매칭이 막혀 false negative가 발생했다. 중첩 괄호 전용 regex 대신 **"createRoot 호출 존재"와 ".render 체인 존재"를 분리 검사**하는 방식으로 변경해 단순화했다.

### 4.4 P1.21 신규 — `npm run format:check` 런타임 가드

먼저 `package.json`에 스크립트 추가:
```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

이후 런타임 가드 `P1.21`이 `npm run format:check` 실행 성공을 요구. 7개 파일에 `prettier --write .` 적용해서 현재 포맷을 규범과 일치시켰다(§5 참조).

### 4.5 P1.22 신규 — 엔트리 포인트 연결성

```js
// 소스 index.html에 module script 태그
/<script\s+type=["']module["']\s+src=["']\/src\/main\.tsx["']/i
// 빌드 후 dist/index.html에 번들 주입
/<script[^>]*type=["']module["'][^>]*src=["'][^"']*\.js["']/i
```

소스와 빌드 산출물 양쪽을 검사. 어느 한쪽이 깨져도 사용자 화면이 빈다.

### 4.6 P1.23 신규 — Vite React plugin 활성화

```js
if (!/from\s*['"]@vitejs\/plugin-react['"]/.test(cfg)) return ...;
if (!/plugins\s*:\s*\[[^\]]*\breact\s*\(/.test(cfg)) return ...;
```

import + `plugins:` 배열 내 `react()` 호출을 모두 검사. 둘 중 하나만 있고 다른 하나가 빠지면 JSX 변환 실패.

---

## 5. 돌연변이 테스트 (Mutation Testing)

**목적**: "가드가 존재한다"와 "가드가 실제로 의도한 회귀를 검출한다"는 다르다. 각 v2 가드에 대해 의도한 회귀를 인위적으로 삽입하고, 가드가 FAIL을 보고하는지 확인했다.

| 가드 | 돌연변이 | 기대 | 결과 |
|------|---------|------|------|
| **P1.18** (강화) | `tailwind.config.js` `content: []` 로 변경 후 재빌드 → 전 utility purge | FAIL + 8개 유틸 누락 보고 | ✅ `min-h-screen, flex, items-center, justify-center, bg-slate-50, text-3xl, font-bold, text-slate-900 — Tailwind wiring broken` |
| **P1.19** (lint) | `vite.config.ts` 첫줄에 triple-slash reference 복원 | FAIL | ✅ `lint failed: ... triple-slash-reference` |
| **P1.20** (render wiring) | `main.tsx`에서 `.render(...)` 호출 제거 (createRoot import는 유지) | FAIL | ✅ `missing: .render(...) chained on createRoot()` |
| **P1.21** (format:check) | `App.tsx` 를 한 줄로 압축해 prettier 규범 위반 | FAIL | ✅ `format:check failed` |
| **P1.22** (entry wiring) | `index.html` 의 `<script type="module" src="/src/main.tsx">` 태그 제거 | FAIL | ✅ `index.html missing <script type="module" src="/src/main.tsx">` |
| **P1.23** (react plugin) | `vite.config.ts` 의 `plugins: [react()]` → `plugins: []` | FAIL | ✅ `plugins: [...] does not invoke react() — JSX transform disabled` |

### 5.1 P1.18 돌연변이 설계 재조정 기록

첫 돌연변이 시도에서 App.tsx에 가짜 클래스 `nonexistent-util-xyz`를 삽입해봤지만, utility prefix 필터에 걸리지 않아 추출 집합에서 제외되어 PASS로 나왔다. **이건 가드 버그가 아니라 돌연변이 설계 오류**다 — 필터의 목적은 "프로젝트 임의 클래스"를 제외하는 것이므로 올바른 동작이다. 진짜 회귀 시나리오는 "기존 정상 유틸이 purge 단계에서 빠지는 것"이고, 이를 재현하는 올바른 돌연변이는 `tailwind.config.js`의 `content: []`. 돌연변이 재설계 후 8개 유틸 누락이 정확히 보고됐다.

---

## 6. 부수 변경

### 6.1 `package.json` 스크립트 추가
```diff
+ "format": "prettier --write .",
+ "format:check": "prettier --check ."
```

### 6.2 Prettier 일괄 포맷 (7개 파일)
`npx prettier --write .` 결과로 아래 파일이 규범 일치 상태가 됨:
- `extapp_landing/src/App.tsx`
- `extapp_landing/src/main.tsx`
- `extapp_landing/README.md`
- `extapp_landing/eslint.config.js`
- `extapp_landing/postcss.config.js`
- `extapp_landing/tailwind.config.js`
- `extapp_landing/tsconfig.json`

포맷 변경 후 전체 회귀(`lint / typecheck / test / build / format:check`) 모두 통과 확인.

### 6.3 `phase01_bootstrap.md` v2 반영
- 제목: "18개 회귀 가드" → "23개 회귀 가드"
- §1.2.2 표에 P1.19~P1.23 5행 추가 및 P1.18 설명 "동적 추출로 강화" 로 갱신
- v1 → v2 변경 배경 블록(리뷰 High/Medium/Low/Refined 요약) 삽입
- RED/GREEN 기대값 블록에 v1 18개 vs v2 23개 병기
- Definition of Done에 P1.19~P1.23 wiring 항목 5개 추가

---

## 7. 산출물 인벤토리

### 7.1 변경 파일

| 파일 | 변경 종류 | 비고 |
|------|----------|------|
| `working_plan/scripts/verify_phase1.mjs` | Edit | 헤더 변경 이력 블록 / P1.18 강화 / P1.19~P1.23 5개 신규 |
| `extapp_landing/vite.config.ts` | Edit | triple-slash reference 제거 (루트 원인 수정) |
| `extapp_landing/package.json` | Edit | `format` · `format:check` 스크립트 추가 |
| `extapp_landing/src/App.tsx` | Format | prettier --write |
| `extapp_landing/src/main.tsx` | Format | prettier --write |
| `extapp_landing/README.md` | Format | prettier --write |
| `extapp_landing/eslint.config.js` | Format | prettier --write |
| `extapp_landing/postcss.config.js` | Format | prettier --write |
| `extapp_landing/tailwind.config.js` | Format | prettier --write |
| `extapp_landing/tsconfig.json` | Format | prettier --write |
| `working_plan/phase01_bootstrap.md` | Edit | v2 가드 체크리스트/설명/DoD 반영 (별도 docs 커밋 `f6e0639` 에 포함) |
| `working_plan/working_history/v1.0/Phase1_Bootstrap_TestGuardV2_20260411.md` | New | 이 결과서 |

### 7.2 verify_phase1.mjs 최종 상태

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
결과: 23 PASS / 0 FAIL / 총 23
```

전 항목 PASS, exit 0.

---

## 8. 이전 상태 대비 비교

| 항목 | v1 (2026-04-10 GREEN) | v2 (2026-04-11 보강) |
|------|----------------------|---------------------|
| 가드 총 개수 | 18 | **23** (+5) |
| 정적 검사 | 14 | **17** (P1.20/P1.22/P1.23 추가) |
| 런타임 검사 | 4 | **6** (P1.19/P1.21 추가) |
| Tailwind E2E 가드 | 1개 클래스 하드코딩 | **App.tsx className 동적 추출 전체 검증** |
| ESLint 보호 | 설정 파일 존재만 | **`npm run lint` 실행 성공 요구** |
| Prettier 보호 | 설정 파일 존재만 | **`npm run format:check` 실행 성공 요구** |
| main.tsx 렌더 와이어링 | 미보호 | **4건 정적 검사로 강제** |
| index.html 엔트리 | 미보호 | **소스+빌드 양쪽 검사** |
| Vite React plugin | devDep 존재만 | **config 내 `plugins: [react()]` 호출 검사** |
| 빌드 결과 | `lint` 실패 상태에서 통과 기록 | **`lint` 포함 전체 회귀 통과** |
| 돌연변이 테스트 | 수행 안 함 | **6건 모두 의도한 회귀 검출 확인** |

---

## 9. 발생한 이슈와 해결 방법

### 9.1 P1.20 초기 regex의 중첩 괄호 실패 (Medium)

**증상**: 초기 버전 `createRoot\s*\([^)]*\)\s*\.render\s*\(` 가 `main.tsx` 의 `createRoot(document.getElementById('root')!)` 에서 FAIL.

**원인**: `[^)]*` 는 첫 `)` 에서 멈춤. `getElementById('root')` 안의 `)` 가 첫 일치가 되어 그 뒤 `.render(` 를 찾지 못함.

**해결**: 중첩 괄호 전용 regex 대신 조건을 2개로 분리.
```js
if (!/createRoot\s*\(/.test(main))       return 'missing: createRoot(...) call';
if (!/\)\s*\.render\s*\(/.test(main))    return 'missing: .render(...) chained on createRoot()';
```
단순하면서 의도를 더 명확히 표현하고, 중첩 괄호 문제 없음.

### 9.2 P1.18 돌연변이 설계 오류

§5.1 에 기록. 돌연변이를 재설계해 가드 유효성을 증명.

---

## 10. Phase 1 완료 조건 재점검 (v2 기준)

phase01_bootstrap.md Definition of Done 기준:

- [x] `verify_phase1.mjs` **23개** 항목 모두 PASS
- [x] P1.4 tsconfig strict · P1.5 tailwind content · P1.6 postcss · P1.8 main.tsx CSS import · P1.18 동적 Tailwind E2E · P1.19 lint · P1.20 render wiring · P1.21 format:check · P1.22 entry wiring · P1.23 react plugin
- [x] `npm run dev` 정상 실행 (5173 포트)
- [x] 브라우저 Tailwind 첫 화면 확인
- [x] App.test.tsx vitest 1 pass
- [x] ESLint + Prettier 설정 존재 **+ 실행 성공**
- [x] .gitignore node_modules, dist
- [x] 디렉토리 뼈대 (다음 Phase 준비)
- [x] 작업 결과서 작성 *(이 문서)*
- [ ] 변경사항 커밋 (사용자 승인 후 진행)

---

## 11. 미해결 이슈

없음. 모든 항목 통과 + 돌연변이 검증 완료.

---

## 12. 다음 Phase 인계 사항

### 12.1 환경

- **Node 버전 경고**: Vite 8/create-vite 9가 Node 22.12+를 요구하나 22.11.0에서 정상 동작 (v1 결과서 §4.1 참조). 변경 없음.
- **happy-dom 사용**: v1 결과서 §4.4 결정 유지.
- **rolldown native binding**: v1 결과서 §4.2 결정 유지.

### 12.2 회귀 가드 보존 정책

v2 가드 23개는 이후 Phase에서도 회귀 감지 용도로 유지된다. 새 Phase 종료 시 다음 명령으로 재확인 가능:

```bash
cd 00_intro_web_landing_page
node working_plan/scripts/verify_phase1.mjs
# 기대: 23 PASS / 0 FAIL
```

특히 Phase 2 이후로 Tailwind 유틸 사용이 늘어나면 P1.18의 동적 추출 대상이 자연스럽게 확대된다. App.tsx가 바뀌어도 가드는 자동 적응한다.

### 12.3 Prettier 규범 운영

Phase 2 이후 새 파일 작성 시 다음 둘 중 하나를 따르면 된다:

1. 작성 후 `npm run format` 으로 일괄 정리
2. 에디터의 format-on-save 활성화 (Prettier 플러그인)

CI에서는 `npm run format:check` 가 P1.21 경유로 강제된다.

### 12.4 ESLint 규범 운영

`vite.config.ts` 의 triple-slash reference 이슈는 이번에 수정했고 P1.19 로 재발 방지된다. 향후 유사한 "scaffold 잔재" 이슈가 발생하면 루트 원인을 수정하는 동시에 해당 규칙에 대한 P1.19 실행이 자동으로 감지한다.

---

## 13. 작업 시간

| 단계 | 소요 |
|------|------|
| 리뷰 피드백 파싱 | ~5분 |
| 6개 이슈 실측 검증 (각 `npm run lint`, `prettier --check`, 소스 검토) | ~15분 |
| 루트 원인 수정 (`vite.config.ts`) + 회귀 재확인 | ~5분 |
| Prettier 스크립트 추가 + 7개 파일 일괄 포맷 | ~5분 |
| `verify_phase1.mjs` v2 구현 (P1.18 강화 + P1.19~P1.23 신규) | ~30분 |
| P1.20 regex 중첩 괄호 디버깅 + 수정 | ~5분 |
| 돌연변이 테스트 6회 수행 + P1.18 돌연변이 재설계 | ~20분 |
| `phase01_bootstrap.md` v2 반영 | ~15분 |
| 결과서 작성 (이 문서) | ~20분 |
| **합계** | **약 2시간** |

---

## 14. 최종 커밋 권장 (사용자 승인 후 실행)

v2 작업의 **코드/스크립트 변경**은 아직 커밋되지 않았다. 문서(phase01_bootstrap.md 포함)는 `f6e0639` 커밋에 포함되어 먼저 기록되었고, 아래 변경들이 후속 커밋 대상:

```bash
cd /Users/junghojang/Developments/myProject/DINKIssTyle-Chrome-Extensions/00_intro_web_landing_page

git add working_plan/scripts/verify_phase1.mjs
git add working_plan/working_history/v1.0/Phase1_Bootstrap_TestGuardV2_20260411.md
git add extapp_landing/vite.config.ts
git add extapp_landing/package.json
git add extapp_landing/src/App.tsx
git add extapp_landing/src/main.tsx
git add extapp_landing/README.md
git add extapp_landing/eslint.config.js
git add extapp_landing/postcss.config.js
git add extapp_landing/tailwind.config.js
git add extapp_landing/tsconfig.json

git commit -m "[P1] 테스트 가드 v2 — 리뷰 피드백 반영 · ESLint 루트 원인 수정 · Prettier 정리"
```

> **주의**: 커밋 순서가 `f6e0639` (문서) → 후속(코드) 로 분리되어 있는 것은 사용자가 "문서 수정 내용에 대해 커밋해줘" 로 명시한 결과다. 문서-코드 간 일시적 불일치 구간이 존재하며, 이 커밋이 완료되면 해소된다.

---

## 15. v2.1 후속 개선 — 리뷰 피드백 반영 (2026-04-11 오후)

§1~§14는 v2.0 상태를 기록한다. v2.0 완료 후 외부 리뷰에서 **v2 가드 자체에 대한 사각지대 4건**과 추가 사각지대 몇 건이 제기되어, 같은 날 후속 개선(v2.1)을 수행했다. v2.0이 "눈에 보이지 않는 연결고리를 가드로 묶겠다"는 목표였다면, v2.1은 **"묶었다고 주장한 가드가 실제로 묶이는지"** 를 검증하고 보강한 작업이다.

### 15.1 제기된 리뷰 이슈 4건 + 추가 사각지대 2건

| # | 심각도 | 가드 | 이슈 요약 |
|---|--------|------|----------|
| A | **High** | P1.20 | `createRoot(` / `).render(` / `<App` 세 조각을 **독립** 검사하므로 `createRoot(root); foo().render(<App />)` 같이 wiring이 끊긴 코드가 통과 |
| B | **Medium** | P1.23 | regex가 주석까지 포함된 원문을 스캔 → `// plugins: [react()]` 주석이 남아 있고 본문은 `plugins: []` 여도 통과 |
| C | **Medium** | P1.18 | variant prefix(`md:`, `hover:`, `dark:` 등)가 붙은 클래스가 utility prefix 필터에서 전부 제외됨. Phase 2 이후 반응형/상태 클래스가 도입되면 검증 구멍 발생 |
| D | **Low** | P1.22 | 소스 HTML 검사가 `type` → `src` 속성 순서를 하드코딩해서 유효한 순서 교체도 false FAIL. dist 검사는 `[^"']*\.js` 로 느슨해서 `/evil.js` 도 통과 |
| E | **Low** (추가) | P1.18 | 스캔 대상이 `App.tsx` 단일 파일이라 Phase 2 이후 다른 컴포넌트가 추가되면 유틸 누락 검출 불가 |
| F | **Low** (추가) | P1.22 | `<div id="root">` 삭제 시에도 통과 → 빌드는 성공하나 런타임 흰 화면 |
| G | 잔여 리스크 | `package.json` | `engines` 제약 부재 → 로컬(Node 22.11.0)과 Vercel 배포 환경 간 버전 불일치 가능성 |

### 15.2 재현 실험 (실측 검증)

주장을 수용하기 전에 **각 이슈가 실제 현재 가드에서 재현되는지** 스탠드얼론 스크립트(`/tmp/verify_review_claims.mjs`)로 검증했다. 모두 현재 가드로 실제 우회/결함이 발생함을 확인:

```
[Issue 1 - P1.20] createRoot + .render 독립 검사 우회
  createRoot import: true / App import: true / createRoot(: true
  ).render(: true / <App: true
  → 가드 우회 **성공 (결함 확인)**

[Issue 2 - P1.23] 주석 내 react() 가 plugins: [] 판정 우회
  @vitejs/plugin-react import: true / plugins:...react(: true
  → 가드 통과 = 우회 **성공 (결함 확인)**

[Issue 3 - P1.18] variant prefix 필터링 누락
  md:flex              → 필터 통과: false
  hover:bg-slate-100   → 필터 통과: false
  dark:text-white      → 필터 통과: false
  md:hover:bg-blue-500 → 필터 통과: false
  → variant 전부 제외 = **결함 확인**

[Issue 4 - P1.22] 속성 순서 하드코딩
  type 먼저: true / src 먼저: false ← 유효 HTML인데 FAIL
  dist laxness — /evil.js: true ← 의도한 경로가 아니어도 통과

[Additional - P1.22] id="root" 부재 시
  → 현재 P1.22는 id="root" 검사 안 함 — 삭제돼도 통과
```

### 15.3 수정 내용 (v2.1)

#### 15.3.1 신규 헬퍼 추가 — `verify_phase1.mjs` 상단

`stripJsComments(src)`:
- 라인·블록 주석만 제거하고 문자열 리터럴은 보존
- P1.23의 `from '@vitejs/plugin-react'` 같은 import 문자열 내용이 필요한 검사에 사용

`stripJsCommentsAndStrings(src)`:
- 주석 + 문자열 리터럴 내부를 모두 제거 (구조 매칭 전용)
- 문자열 안의 `(`, `)` 가 괄호 balancer를 오염시키지 못하도록 함
- P1.20의 균형 괄호 walker에 사용

`hasCreateRootRenderChainWithApp(src)`:
- `stripJsCommentsAndStrings` 결과에 대해 괄호 depth 카운터로 `createRoot(...)` 의 닫는 `)` 위치를 찾고
- 그 직후 `.render(...)` 가 체인되어 있는지 확인하고
- render 인자 내부에 `<App` 이 존재하는지 확인
- 세 조건 모두 **동일 표현식 내부**에서 만족할 때만 true 반환

`collectSourceFiles(dir)`:
- `src/` 아래 `.ts`/`.tsx`/`.js`/`.jsx` 파일을 재귀 수집
- `.test.*` / `.spec.*` / `node_modules` / 숨김 디렉토리 제외

#### 15.3.2 P1.18 강화 (Issue C + E)

**Before**:
```js
const app = readIfExists(join(APP, 'src/App.tsx'));
const utilityPrefixes = /^(min-h-|...|origin-)/;
const utilities = [...classes].filter((c) => utilityPrefixes.test(c));
```

**After**:
```js
const sourceFiles = collectSourceFiles(join(APP, 'src'));
// className=, className={`...`}, clsx(`...`), cn(...), twMerge(...) 등 3개 추출 패턴
const classExtractors = [
  /className\s*=\s*["']([^"']+)["']/g,
  /className\s*=\s*\{?\s*`([^`]+)`/g,
  /\b(?:clsx|cn|twMerge|tw)\s*\(\s*["'`]([^"'`]+)["'`]/g,
];
// variant prefix 제거 후 base로 필터 판정
const stripVariants = (cls) => cls.split(':').pop();
const utilities = [...classes].filter((c) => utilityPrefixes.test(stripVariants(c)));
```

효과:
- 스캔 대상이 `App.tsx` 단일 파일 → `src/**` 전체 (`.test` 제외)
- `md:flex-col`, `hover:bg-slate-100`, `md:hover:bg-blue-500` 같은 variant 클래스가 정상 필터 통과
- `clsx`, `cn`, `twMerge`, `tw` 헬퍼 호출 내부 bare 문자열도 일부 포착
- CSS lookup regex의 `\\\\?${ch}` escape는 variant의 `\:` 표기와도 호환 (기존 로직 유지)

#### 15.3.3 P1.20 강화 (Issue A)

**Before**: 3조각(`createRoot(` / `).render(` / `<App`) 독립 검사

**After**: `hasCreateRootRenderChainWithApp()` 단일 호출. 균형 괄호 walker가 `createRoot` 와 `.render` 의 결합 관계와 render 인자 내 `<App` 존재를 **한 표현식 안에서** 검증.

#### 15.3.4 P1.22 강화 (Issue D + F)

**Before**: 속성 순서 하드코딩 regex + loose dist check

**After** — 세 가지 분리 검사:

1. **소스 HTML 속성 순서 무관 검사**:
   ```js
   const sourceScripts = [...html.matchAll(/<script\b([^>]*)>/gi)].map(m => m[1]);
   const hasEntryScript = sourceScripts.some((attrs) =>
     /\btype\s*=\s*["']module["']/i.test(attrs) &&
     /\bsrc\s*=\s*["']\/src\/main\.tsx["']/i.test(attrs)
   );
   ```

2. **DOM mount target 존재 검사**:
   ```js
   if (!/<[a-z][^>]*\bid\s*=\s*["']root["']/i.test(html)) {
     return 'index.html missing mount target with id="root"';
   }
   ```

3. **dist 번들 파일 실재 검증**:
   ```js
   const srcMatch = entryAttrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
   if (!/^\/assets\/[^/]+\.js$/.test(srcMatch[1])) return ...unexpected path...;
   if (!existsSync(join(APP, 'dist', srcMatch[1].replace(/^\//, '')))) {
     return `dist/index.html references ${srcMatch[1]} but file does not exist`;
   }
   ```

효과:
- `<script src="/src/main.tsx" type="module">` 순서 교체가 정상 통과
- `/evil.js` 같은 임의 경로는 `/assets/[name].js` 패턴 매칭에서 탈락
- 번들 스크립트가 실제 `dist/assets/` 에 존재하지 않으면 감지
- `<div id="root">` 삭제 시 즉시 FAIL

#### 15.3.5 P1.23 강화 (Issue B)

**Before**: `cfg` 원문에 직접 regex 적용

**After**: `stripJsComments(cfg)` 로 주석을 먼저 제거한 후 regex 적용. 문자열 리터럴은 보존(두 검사 모두 import 문자열과 구조 검사에 필요).

#### 15.3.6 잔여 리스크 G — `package.json` engines 추가

```diff
+ "engines": {
+   "node": "^20.19.0 || >=22.12.0"
+ },
```

Vite 8 의 공식 요구 범위를 선언. 현재 로컬 Node 22.11.0은 경고(EBADENGINE)만 발생하고 실행에는 영향 없음. Vercel (Node 20.x 또는 22.x) 배포 환경도 명시적 범위 안에 들어오므로 dev-deploy 버전 드리프트 리스크를 낮춘다. `.nvmrc` 추가는 이번 범위에서 보류 — 사용자 선택으로 남겨둠.

### 15.4 돌연변이 테스트 — v2.0 우회 시나리오 재현

각 이슈에 대해 **v2.0에서 실제로 우회가 가능했던 정확한 시나리오**를 삽입하고 v2.1 가드가 FAIL로 검출하는지 확인:

| # | 돌연변이 | v2.0 거동 | v2.1 거동 |
|---|---------|----------|----------|
| M1 (P1.20) | `createRoot(root); foo().render(<App />)` — wiring 끊김 | ❌ **false PASS** | ✅ FAIL (`missing: createRoot(...).render(<App ...>) wiring in a single expression`) |
| M2 (P1.23) | `// plugins: [react()]` 주석 + 본문 `plugins: []` | ❌ **false PASS** | ✅ FAIL (`plugins: [...] does not invoke react() — JSX transform disabled`) |
| M3 (P1.18) | `className="min-h-screen flex md:flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 ..."` (variant 정상 사용) | ⚠️ filter 누락으로 "검증 안 됨" (false PASS — 유틸이 있지만 검사되지 않음) | ✅ PASS (variant 포함 정상 검증) |
| M3b (P1.18) | 위 + `tailwind.config.js content: []` (purge로 모두 누락) | — | ✅ FAIL (`min-h-screen, flex, md:flex-col, items-center, justify-center, bg-slate-50, hover:bg-slate-100, text-3xl, font-bold, text-slate-900 — Tailwind wiring broken`) |
| M4a (P1.22) | `<script src="/src/main.tsx" type="module">` (유효 HTML, 속성 순서 교체) | ❌ **false FAIL** | ✅ PASS |
| M4b (P1.22) | `<div id="root">` 삭제 | ❌ **false PASS** | ✅ FAIL (`index.html missing mount target with id="root"`) |

**요약**: v2.0에서 차단하지 못했던 **6개 우회 시나리오(false PASS 4건 + false FAIL 1건 + silent skip 1건)** 가 v2.1 에서 모두 의도한 결과로 전환됨.

### 15.5 전체 회귀 확인

v2.1 수정 후:

```
verify_phase1.mjs   → 23 PASS / 0 FAIL (exit 0)
npm run lint        → 통과
npm run typecheck   → 통과
npm test            → 1 passed (App bootstrap)
npm run format:check→ All matched files use Prettier code style
npm run build       → ✓ built in 323ms
```

engines 필드 추가 후에도 build/test/format 모두 정상. 현재 로컬 Node 22.11.0 이 engines 범위 바깥이지만 `npm install` 경고(EBADENGINE)만 발생하고 실행에 영향 없음 — 의도된 상태.

### 15.6 남은 운영 리스크 (v2.1 범위 외)

리뷰어가 언급했지만 **v2.1 범위에 포함하지 않은** 항목:

- **가드 실행 속도**: 5개 런타임 검사(lint/typecheck/test/build/format:check)가 프로젝트 확장 시 길어질 수 있음. Phase 진행 중 실측해서 2분 초과 시 환경별 실행 정책 검토. 현재는 P1 규모에서 측정 의미 없음.
- **`.nvmrc`**: engines 선언은 했지만 로컬 버전 자동 전환은 안 함. 사용자가 선호하는 버전 관리 툴(nvm/fnm/volta)에 맡김.
- **AST 기반 파싱**: 정적 regex 방식의 한계가 있지만, Phase 1 규모에서는 정규식 + 주석 제거 + 균형 괄호 walker 조합이면 충분히 견고함. 설정 파일이 복잡해지는 시점에 재검토.
- **P1.18의 추가 사각지대**: 완전 동적 클래스 생성(예: 문자열 결합으로 `bg-${color}-500`), JSX spread props 내부 className 등은 여전히 검출 못함. 정적 분석의 근본 한계로, Tailwind의 content 글롭이 잡는 범위와 동일한 수준.

### 15.7 v2.0 → v2.1 파일 변경 요약

| 파일 | 변경 |
|------|------|
| `working_plan/scripts/verify_phase1.mjs` | 헬퍼 3개 추가(`stripJsComments`, `stripJsCommentsAndStrings`, `hasCreateRootRenderChainWithApp`, `collectSourceFiles`) · P1.18/P1.20/P1.22/P1.23 강화 |
| `extapp_landing/package.json` | `engines.node` 범위 추가 |
| `working_plan/phase01_bootstrap.md` | 가드 설명 표(P1.18~P1.23) v2.1 기준으로 갱신, v2→v2.1 반영 노트 추가 |
| `working_plan/working_history/v1.0/Phase1_Bootstrap_TestGuardV2_20260411.md` | 이 §15 추가 |

### 15.8 커밋 권장 (v2.1)

v2.1 변경은 v2.0 코드 변경과 **동일 커밋**에 합쳐서 적용하는 것이 자연스럽다. 즉 §14의 커밋 권장 명령에 다음이 추가된다:

```bash
git add working_plan/scripts/verify_phase1.mjs              # v2.1 헬퍼 + 가드 강화 (v2.0과 합쳐 단일 커밋)
git add extapp_landing/package.json                         # engines 필드 추가 포함
git add working_plan/phase01_bootstrap.md                   # 가드 설명 v2.1 (문서 커밋 f6e0639 이후 변경분)
git add working_plan/working_history/v1.0/Phase1_Bootstrap_TestGuardV2_20260411.md  # §15 추가
```

커밋 메시지 예:
```
[P1] 테스트 가드 v2.1 — 리뷰 사각지대 4건 수정 + Node engines 제약

v2.0 완료 후 리뷰에서 제기된 4개 약점(P1.18 variant·범위 협소, P1.20 3조각
독립 검사 우회, P1.22 속성 순서·mount target·dist 실재, P1.23 주석 우회)을
수정하고, 해당 우회 시나리오에 대한 돌연변이 테스트로 재검증. engines 필드
추가로 dev-deploy 버전 드리프트 리스크 감소.
```
