# Phase 1: Bootstrap — RED 단계 스냅샷 (v2, 리뷰 반영)

> **상위 계획서**: [main_landing_todolist.md](../../main_landing_todolist.md)
> **상세 계획서**: [phase01_bootstrap.md](../../phase01_bootstrap.md)
> **검증 스크립트**: [scripts/verify_phase1.mjs](../../scripts/verify_phase1.mjs)
> **단계**: 사전 작업 + RED Phase 완료 / GREEN Phase 착수 대기
> **버전**: v2 (2026-04-10) — 리뷰 의견 5건 반영, 9개 → 18개 항목으로 확장
> **작성일**: 2026-04-10

---

## 1. 리뷰 의견 반영 요약

| # | 의견 | 검증 | 조치 |
|---|------|------|------|
| 1 (High) | RED에 실행 가능한 실패 테스트 없음 | ✅ 확인 | `verify_phase1.mjs` 스크립트로 18개 검증 가드 구현. Node 빌트인만 사용 → 부트스트랩 이전에도 실행 가능 |
| 2 (Medium) | RED 체크리스트가 Phase 1 설계 범위 미커버 | ⚠️ 부분 | ESLint(P1.13), Prettier(P1.14), .gitignore(P1.12)를 RED로 추가. 디자인 토큰/Pretendard는 Phase 2로 의도적 이관 사실을 phase01에 명시 |
| 3 (Medium) | 존재성 위주 → wiring 회귀 못 막음 | ✅ 확인 | wiring 6건 추가: P1.5(tailwind content glob), P1.6(postcss 플러그인), P1.8(main.tsx CSS import), P1.18(빌드된 CSS에 Tailwind 유틸 포함 E2E) |
| 4 (Medium) | strict: true 보장 안 됨 | ✅ 확인 | P1.4: tsconfig.app.json `compilerOptions.strict === true` 직접 검사 (JSONC parse) |
| 5 (Low) | 포트 5173 검증 flaky | ✅ 확인 | 포트 검사 제거. P1.17 `npm run build` 성공 + dist/index.html 생성으로 대체 |

---

## 2. 사전 작업 결과

| 항목 | 결과 | 판정 |
|------|------|------|
| [CONTEXT] 작업 목적 확인 | 02_implementation_plan.md 2·3·8장 검토 | ✅ |
| [ANALYSIS] Node.js 버전 | `v22.11.0` (요구: 20+) | ✅ |
| [ANALYSIS] npm 버전 | `10.9.0` (요구: 10+) | ✅ |
| [ANALYSIS] 디렉토리 충돌 | `extapp_landing/` 미존재 | ✅ |
| [ANALYSIS] Vite 템플릿 | `react-ts` 사용 결정 | ✅ |
| [NOTE] 디자인 토큰/Pretendard 이관 | P1 → P2 이관 사유 phase01에 명시 | ✅ |

---

## 3. RED Phase 검증 스크립트 실행 결과

명령:
```bash
cd 00_intro_web_landing_page
node working_plan/scripts/verify_phase1.mjs
```

종료 코드: **`1`** (1건 이상 FAIL → RED 상태 유효)

### 3.1 정적 파일 검사 (TEST-P1.1 ~ TEST-P1.14)

| ID | 검증 항목 | 상태 | 실패 사유 |
|----|----------|------|----------|
| P1.1 | extapp_landing/package.json 존재 | ❌ FAIL | package.json missing |
| P1.2 | dependencies에 react/react-dom | ❌ FAIL | package.json missing |
| P1.3 | devDependencies 핵심 패키지 | ❌ FAIL | package.json missing |
| P1.4 | tsconfig strict: true (#4 대응) | ❌ FAIL | strict !== true (no tsconfig) |
| P1.5 | tailwind content glob (#3 대응) | ❌ FAIL | tailwind.config.* not found |
| P1.6 | postcss tailwindcss+autoprefixer (#3 대응) | ❌ FAIL | postcss.config.* not found |
| P1.7 | index.css @tailwind 디렉티브 | ❌ FAIL | src/index.css missing |
| P1.8 | main.tsx → './index.css' import (#3 대응) | ❌ FAIL | src/main.tsx missing |
| P1.9 | App.tsx Tailwind 유틸리티 className | ❌ FAIL | src/App.tsx missing |
| P1.10 | App.test.tsx + describe/it | ❌ FAIL | src/App.test.tsx missing |
| P1.11 | vitest config + jsdom | ❌ FAIL | no vitest/vite config found |
| P1.12 | .gitignore node_modules, dist (#2 대응) | ❌ FAIL | .gitignore missing |
| P1.13 | ESLint config 존재 (#2 대응) | ❌ FAIL | no ESLint config found |
| P1.14 | Prettier config 존재 (#2 대응) | ❌ FAIL | no Prettier config found |

### 3.2 런타임 검사 (TEST-P1.15 ~ TEST-P1.18)

| ID | 검증 항목 | 상태 | 실패 사유 |
|----|----------|------|----------|
| P1.15 | npm run typecheck 성공 (#4 대응) | ❌ FAIL | package.json or node_modules missing |
| P1.16 | npm test 성공 | ❌ FAIL | package.json or node_modules missing |
| P1.17 | npm run build + dist/index.html (#5 대응) | ❌ FAIL | package.json or node_modules missing |
| P1.18 | dist/assets/*.css Tailwind 유틸 (#3 대응 E2E) | ❌ FAIL | dist/assets missing |

### 3.3 합계

- **PASS**: 0
- **FAIL**: 18
- **총 항목**: 18
- **종료 코드**: 1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
결과: 0 PASS / 18 FAIL / 총 18
```

---

## 4. RED Phase 완료 판정

- ✅ **실행 가능한** 검증 스크립트 작성 완료 (#1 대응)
- ✅ 18개 검증 항목 정의 완료 (기존 9개에서 확장)
- ✅ wiring 회귀 가드 6건 추가 (#3 대응)
- ✅ strict 모드 직접 검증 (#4 대응)
- ✅ 포트 검사 제거 + 빌드 검증으로 대체 (#5 대응)
- ✅ ESLint/Prettier/.gitignore가 RED로 편입 (#2 대응)
- ✅ 모든 18개 항목이 실측 FAIL (exit code 1)
- ✅ TDD 사이클의 RED 조건 만족 (실행 가능한 실패 테스트가 먼저 존재)

**다음 단계**: GREEN Phase 착수 대기. 사용자 승인 후 phase01_bootstrap.md 1.3절 TASK-001부터 진행.

---

## 5. GREEN 진입 시 주의 사항

### 5.1 비대화 모드 실행

phase01_bootstrap.md TASK-001은 `npm create vite@latest` 인데, 첫 실행 시 `Ok to proceed?` 프롬프트가 뜰 수 있다. `--yes`를 추가하거나 사용자가 직접 대화형으로 실행하도록 안내한다.

### 5.2 TASK 순서 변경 (RED 가드와 일치)

리뷰 반영으로 다음 TASK가 GREEN으로 이동되었다 (기존엔 REFACTOR):

- **TASK-009**: tsconfig strict 명시 검증
- **TASK-010**: ESLint 설정
- **TASK-011**: Prettier 설정
- **TASK-012**: .gitignore 보강
- **TASK-013**: main.tsx의 index.css import 확인

이는 RED 가드(TEST-P1.4, P1.13, P1.14, P1.12, P1.8)를 GREEN에서 만족시키기 위한 TDD 원칙 준수다.

### 5.3 GREEN-VERIFY 기준

GREEN 종료 시 다음 명령으로 18개 항목 모두 PASS를 확인해야 한다:
```bash
node working_plan/scripts/verify_phase1.mjs
# 기대: 18 PASS / 0 FAIL, exit 0
```

이 결과가 본 RED 스냅샷(0 PASS / 18 FAIL)에서 18개 모두 전환되어야 Phase 1이 완료된다.
