# Phase 2: 디자인 시스템 + 공통 컴포넌트 — 작업 결과서

> **상위 계획서**: [main_landing_todolist.md](../../main_landing_todolist.md)
> **상세 계획서**: [phase02_design_system.md](../../phase02_design_system.md)
> **선행 결과서**:
>   - v1 (Phase 1 부트스트랩): [Phase1_Bootstrap_RED_20260410.md](./Phase1_Bootstrap_RED_20260410.md), [Phase1_Bootstrap_20260410.md](./Phase1_Bootstrap_20260410.md)
>   - v2/v2.1 (Phase 1 테스트 가드): [Phase1_Bootstrap_TestGuardV2_20260411.md](./Phase1_Bootstrap_TestGuardV2_20260411.md)
> **작업일**: 2026-04-11
> **작업자**: junghojang
> **상태**: ✅ 완료 (사전 → RED 2회차(v1→v2 리뷰 반영) → GREEN → REFACTOR → 사후)

---

## 1. 작업 요약

| 항목 | 내용 |
|------|------|
| 목표 | Notion-like 디자인 토큰 + 5종 공통 컴포넌트(Section/Button/Badge/FeatureCard + 공유 타입) 구현 |
| 작업 범위 | TASK-001~010 (GREEN) + REFACTOR-STRUCTURE/PERF 3건 + 사후 검증 |
| 테스트 결과 | **80 passed | 3 skipped (83 total)** — 6 test files 전부 PASS |
| Phase 1 회귀 | **23 PASS / 0 FAIL** 유지 (TEST-P2.10 달성) |
| 빌드 | `npm run build` 성공 — JS 194.55 KB / CSS 8.23 KB |

---

## 2. TDD 사이클 요약

### 2.1 RED Phase (2회차 — 리뷰 피드백 반영)

Phase 2 의 RED 단계는 **2회 진행** 됐다. 1차 RED 작성 후 외부 리뷰에서 6건의 이슈가 제기되어 v2 로 재작성.

**v1 (initial)** — 5개 spec 파일, 656 라인, 10개 `it` + 9개 config assertion.

**v2 (review-driven rewrite)** — 5개 spec 파일, **905 라인**, 29개 `it` + 25개 config assertion + 3개 `it.todo` (GREEN 이후 `@ts-expect-error` 활성화 예정).

v2 에서 수정된 이슈:

| # | 심각도 | 이슈 | 조치 |
|---|-------|------|------|
| 1 | High | `node:fs`/`path`/`url` import 로 RED 실패 원인이 "미구현 모듈 + node 타입 누락" 혼재 | `tsconfig.app.json` types 에 `"node"` 추가. RED 실패 원인이 **"미구현 모듈" 4건만** 으로 축소 |
| 2 | Medium | 토큰 커버리지 누락 (canvas, surface-alt, accent-soft, border, borderRadius) | `EXPECTED_TOKENS` 상수 도입, 설계 문서 §4.2 의 모든 hex 값을 `expectTokenValue()` 헬퍼로 1:1 대조. 15+ 토큰 × 25 assertion |
| 3 | Medium | Badge regex OR 조건(`/status-done\|emerald/`)으로 토큰 우회 허용 | OR → AND 강제 (`/\bstatus-done\b/`), **하드코딩 팔레트 금지**. "교차 오염 금지" 테스트 신설 (각 status 가 다른 토큰 포함 안 함) |
| 4 | Medium | FeatureCard discriminated union 강제 부재 | `it.todo` 3건으로 RED 문서화 → **GREEN 완료 후 `@ts-expect-error` 활성화** (이 결과서 §2.2 참조) |
| 5 | Low | TEST-P2.2 체크리스트와 실제 테스트 범위 불일치 | 3가지 경로(html/css/main.tsx) 모두 허용. 체크리스트도 동일하게 갱신 |
| 6 | Low | Button 외부 링크 보안 가드에 noreferrer 누락 | `noopener` 와 `noreferrer` 둘 다 `toContain` 으로 강제 |

**Deep Dive 보강**:
- 실제 hex 값 하드코딩 대조 (브랜드 변경 시 가드 작동)
- `container.firstElementChild?.tagName` 로 Section/Button/FeatureCard **루트 태그** 엄격 검증 (`querySelector` 의 중첩 매칭 회피)
- Section 의 `max-w-content` 와 디자인 토큰 `maxWidth.content = 1200px` 교차 참조 주석

**RED 최종 상태 (v2)**:
- `npm test`: 5 failed (모듈 미해결) | 1 passed (App.test.tsx 기존)
- `verify_phase1.mjs`: 20 PASS / 3 FAIL — P1.15/P1.16/P1.17 만 실패 (미구현 모듈 타입 오류 전파). **P1.21 (format:check) 포함 나머지 20개는 PASS**

### 2.2 GREEN Phase

#### TASK-001: Tailwind 토큰 확장 ✅
`tailwind.config.js` 의 `theme.extend` 에 설계 문서 §4.2 의 전체 토큰 정의:
- `colors.canvas/surface/surface-alt/border` + `ink.{400,500,700,900}` + `accent.{DEFAULT,hover,soft}` + `status.{done,wip,planned}`
- `fontFamily.sans` = Pretendard + 4개 fallback
- `maxWidth.content = 1200px`
- `borderRadius.{2xl,3xl}` = 1rem / 1.5rem

#### TASK-002: Pretendard 로드 ✅
- `index.html` 의 `<head>` 에 CDN `<link>` 추가 (`cdn.jsdelivr.net/gh/orioncactus/pretendard`)
- `src/index.css` 에 `body { @apply font-sans text-ink-700 bg-canvas; }` — TEST-P2.2 의 3가지 assertion 만족

#### TASK-003: clsx 설치 ✅
`npm install clsx` → `clsx@^2.1.1` dependencies 추가 (devDependencies 아님 — 런타임 번들 포함).

#### TASK-004: Section 컴포넌트 ✅
- `id`, `background`, `children`, `className` props
- `BG_MAP` 로 4종 배경 매핑, `clsx()` 로 className 결합
- 루트 `<section>` + 내부 `<div className="mx-auto max-w-content px-6 md:px-10">` 2단 구조
- TEST-P2.3 의 9개 assertion 전부 통과

#### TASK-005: Button 컴포넌트 ✅
- `href` 유무로 `<a>` / `<button>` semantic 선택
- `variant` primary/secondary 로 `VARIANT_CLASS` 분기
- `external=true` 시 `target="_blank" rel="noopener noreferrer"` — 두 속성 모두 필수 강제
- `<button>` 은 `type="button"` 명시 (폼 내부 우발 submit 방지)
- TEST-P2.4 의 12개 assertion 전부 통과

#### TASK-006: Badge 컴포넌트 ✅
- `STATUS_CLASS` 에 3종 매핑: `bg-emerald-50 text-status-done border-emerald-200` 등
- **`data-testid="status-badge"`** 부착 — FeatureCard TEST-P2.9 와 Phase 8 TEST-P8.9 가 의존하는 공개 계약
- **디자인 토큰 `text-status-{done/wip/planned}` 사용 필수** — 하드코딩 팔레트만으로는 Badge.test.tsx 의 `/\bstatus-done\b/` regex 가 FAIL
- TEST-P2.5/P2.6/P2.7 + 교차 오염 금지 + data-testid 계약 총 8개 assertion 통과

#### TASK-007: FeatureCard 컴포넌트 ✅ + 타입 레벨 강제 활성화

```ts
type WithStatus = FeatureCardBase & { status: FeatureStatus; statusLabel: string };
type WithoutStatus = FeatureCardBase & { status?: undefined; statusLabel?: undefined };
export type FeatureCardProps = WithStatus | WithoutStatus;
```

discriminated union 으로 "둘 다 있거나 둘 다 없음" 을 **타입 수준에서** 강제. 한쪽만 전달하면 컴파일 에러.

**타입 레벨 강제 활성화** (TASK-007 part 2):
RED 단계에서 `./FeatureCard` 모듈이 없어 `@ts-expect-error` 가 "unused directive" 로 판정되어 쓸 수 없었다. GREEN 에서 구현이 완성되자 3개 `it.todo` 를 `it.skip + @ts-expect-error` 로 전환:
- `status` 만 전달 → 타입 에러
- `statusLabel` 만 전달 → 타입 에러
- `status="unknown"` → 타입 에러

`it.skip` 으로 런타임 실행은 건너뛰지만, TypeScript 파서는 이 코드를 반드시 검사하므로 타입 강제가 **typecheck 게이트** 로 작동한다.

**마크업 계약**: 루트 태그 `<article>` — Phase 8 TEST-P8.7 의 `getAllByRole('article')` 이 이 선택에 의존.

TEST-P2.8 + TEST-P2.9 + 루트 article 3건 + role="article" 접근성 + 타입 레벨 3건(skip) + positive control 총 11개 assertion.

#### TASK-008: 데모 페이지 + App.test.tsx 전환 ✅

`src/App.tsx` 를 "Bootstrap OK" 텍스트 → **4개 Section × 공통 컴포넌트 변형 데모** 페이지로 전환:
- canvas: 타이틀 + 서브 카피
- surface: Button primary/secondary/anchor/external 4종
- surface-alt: Badge done/wip/planned 3종
- accent-soft: FeatureCard with status + without status 2종

`src/App.test.tsx` 를 리뷰 피드백 반영(Deep Dive ②) 하여 **종합 회귀 가드** 로 전환. 이전 "Bootstrap OK" 1개 테스트 → **6개 테스트**:
1. Section 4종 배경 카운트
2. Button primary/secondary 렌더
3. Anchor link vs external link 속성 (noopener + noreferrer)
4. Badge 3종 라벨 (getAllByText 로 FeatureCard 중복 허용)
5. FeatureCard 2 케이스 — 총 article 2개, 총 Badge 4개
6. BusinessSection 프리뷰 카드가 상태 배지 부재 확인

#### TASK-009: placeholder.svg ✅
`public/images/placeholder.svg` 생성 — 점선 보더 + 이미지 아이콘 + "스크린샷 자리" 라벨 + "screenshot placeholder" 영어 보조 텍스트. 800×450 viewBox.

#### TASK-010: Prettier 일괄 포맷 ✅
`npm run format` 실행 → 신규 컴포넌트/테스트 파일 전체 규범 준수. `npm run format:check` 통과 확인 (P1.21).

#### GREEN-VERIFY ✅

```
npm run lint         → 0 errors
npm run typecheck    → 0 errors
npm run format:check → All matched files use Prettier code style
npm test             → 80 passed | 3 skipped (83 total)
npm run build        → ✓ built in 477ms, JS 194.55 KB / CSS 8.23 KB

node working_plan/scripts/verify_phase1.mjs
  → 23 PASS / 0 FAIL (TEST-P2.10 충족)
```

### 2.3 REFACTOR Phase

#### REFACTOR-STRUCTURE 1: 타입 분리 ✅

`src/lib/types.ts` 신규:
```ts
export type FeatureStatus = 'done' | 'wip' | 'planned';
```

Badge.tsx 와 FeatureCard.tsx 가 inline `type Status` / `type FeatureStatus` 를 제거하고 `import type { FeatureStatus } from '../../lib/types'` 로 전환. 새 status 값을 추가할 때 한 곳만 수정하면 컴파일 오류가 전 컴포넌트에 확산.

#### REFACTOR-STRUCTURE 2: barrel export ✅

`src/components/common/index.ts` 신규:
```ts
export { Section } from './Section';
export { Button } from './Button';
export { Badge } from './Badge';
export { FeatureCard } from './FeatureCard';
export type { FeatureCardProps } from './FeatureCard';
```

`App.tsx` import 를 4줄 → 1줄 로 정리:
```diff
- import { Section } from './components/common/Section';
- import { Button } from './components/common/Button';
- import { Badge } from './components/common/Badge';
- import { FeatureCard } from './components/common/FeatureCard';
+ import { Section, Button, Badge, FeatureCard } from './components/common';
```

#### REFACTOR-STRUCTURE 3: .gitkeep 정리 ✅

`src/components/common/.gitkeep` 와 `src/lib/.gitkeep` 제거 — 실제 파일이 들어왔으므로 역할 종료. `layout/`, `sections/`, `i18n/locales/` 의 .gitkeep 은 Phase 3~8 에서 채워질 예정이므로 유지.

#### REFACTOR-STRUCTURE 4: clsx 패턴 일관화 ✅

모든 공통 컴포넌트가 동일 패턴 사용:
- 상단에 상수 `BASE_CLASS` / `VARIANT_CLASS` / `BG_MAP` / `STATUS_CLASS` 선언
- `clsx(상수..., props, className)` 형식

#### REFACTOR-VERIFY ✅

```
npm run format   → 변경 없음 (이미 규범 준수)
npm run typecheck → 0 errors
npm run lint     → 0 errors + 0 warnings
npm test         → 80 passed | 3 skipped (변화 없음)
npm run build    → JS 194.55 KB / CSS 8.23 KB (변화 없음)
```

### 2.4 REFACTOR-PERF 측정

#### Tailwind Purge 정상 동작 확인 ✅

```
dist/assets/index-BkKHYbfF.css  8.23 kB  (gzip: 2.46 kB)
```

CSS 8.23 KB 는 **15+ 종 토큰 + Pretendard 관련 유틸 + 4 컴포넌트의 className 집합** 에 비해 매우 작다. Tailwind purge 가 정상 동작하며 사용되지 않은 유틸은 제거됨을 시사.

App.tsx 가 사용하는 유틸 (P1.18 이 검증):
```
bg-canvas · bg-surface · bg-surface-alt · bg-accent-soft
text-ink-900 · text-ink-700 · text-ink-500
text-4xl · text-2xl · text-xl · text-base · text-sm
font-bold · font-semibold · font-sans
bg-accent · hover:bg-accent-hover · bg-canvas · border-border · hover:bg-surface
bg-emerald-50 · text-status-done · border-emerald-200
bg-amber-50 · text-status-wip · border-amber-200
bg-stone-50 · text-status-planned · border-stone-200
rounded-2xl · rounded-full · shadow-sm · hover:shadow-md
... (grid/flex/spacing 유틸 다수)
```

모든 유틸이 빌드 CSS 에 포함됨 (P1.18 PASS).

---

## 3. 번들 크기 변화 (Phase 1 → Phase 2)

| 파일 | Phase 1 베이스라인 | Phase 2 | Δ |
|------|-------------------|---------|---|
| `dist/assets/index-*.js` | 188 KB | **194.55 KB** | +6.55 KB (+3.5%) |
| `dist/assets/index-*.css` | 4 KB | **8.23 KB** | +4.23 KB (+105%) |
| `dist/index.html` | (생성됨) | 0.59 KB | — |

**JS +6.55 KB 의 주요 원인**: `clsx` (~1 KB) + 공통 컴포넌트 4개 (~5 KB).
**CSS +4.23 KB 의 주요 원인**: 신규 Tailwind 유틸 (accent/ink/status/surface 계열) + body 기본 스타일.

Phase 9 의 번들 품질 목표 `<300 KB gzip JS` 대비 현재 gzip 61.56 KB → 충분한 여유.

---

## 4. 타입 레벨 게이트 동작 증명

TASK-007 에서 활성화한 `@ts-expect-error` 3건이 실제로 게이트로 작동하는지 확인:

```
src/components/common/FeatureCard.test.tsx:
  it.skip('status 만 전달 — ...') { @ts-expect-error ... }
  it.skip('statusLabel 만 전달 — ...') { @ts-expect-error ... }
  it.skip('잘못된 status 값 — ...') { @ts-expect-error ... }

npm run typecheck → 0 errors ← @ts-expect-error 가 타입 에러를 정확히 삼킴
```

만약 FeatureCard 의 discriminated union 이 약화돼서 `status` 만 전달하는 것을 허용하면:
- `@ts-expect-error` 가 "기대한 에러가 발생하지 않아 불필요" 로 판정 (TS2578)
- `npm run typecheck` 가 FAIL
- `verify_phase1.mjs` P1.15 가 FAIL

즉, 향후 누군가 FeatureCard 타입을 단순화하려 해도 이 3개 `it.skip` 블록이 즉시 알림을 발생시킨다. **타입 레벨 강제가 typecheck 게이트로 상시 감시 중**.

---

## 5. App.test.tsx 전환 경위 (P1.16 회귀 방지)

Phase 1 시점의 App.test.tsx:
```tsx
it('renders the bootstrap heading', () => {
  render(<App />);
  expect(screen.getByText(/Bootstrap OK/i)).toBeInTheDocument();
});
```

Phase 2 에서 App.tsx 가 데모 페이지로 전환되면서 "Bootstrap OK" 텍스트가 사라졌다. 이 테스트를 그대로 두면 `npm test` FAIL → P1.16 FAIL → `verify_phase1.mjs` 전체 FAIL → Phase 1 회귀 가드 붕괴.

**해결**: TASK-008 에서 App.test.tsx 를 데모 페이지의 안정된 요소들을 검증하는 **6개 종합 테스트** 로 전환. 리뷰 피드백(Deep Dive ②) 반영 — "App 이 데모 페이지라면 공통 컴포넌트의 모든 변형을 포괄적으로 검증해야 한다".

새 App.test.tsx 의 검증 범위:
- 4 Section 배경 (count ≥ 4)
- Button primary / secondary (role="button")
- Anchor link (#features) vs External link (target="_blank" + noopener + noreferrer)
- 3 Badge 라벨 (getAllByText 로 FeatureCard 중복 허용)
- FeatureCard 2 케이스 — article 2개, Badge 총 4개
- BusinessSection 프리뷰 카드 내부 Badge 부재 (Phase 8 TEST-P8.9 선행 가드)

**결과**: `npm test` PASS → P1.16 PASS → verify_phase1.mjs 23 PASS 유지.

---

## 6. 산출물 인벤토리

### 6.1 신규 파일

| 파일 | 용도 |
|------|------|
| `extapp_landing/src/components/common/Section.tsx` | 공통 섹션 래퍼 (v1 구현) |
| `extapp_landing/src/components/common/Button.tsx` | 공통 CTA/링크 (v1 구현) |
| `extapp_landing/src/components/common/Badge.tsx` | 공통 상태 배지 (data-testid 포함) |
| `extapp_landing/src/components/common/FeatureCard.tsx` | 공통 기능 카드 (discriminated union) |
| `extapp_landing/src/components/common/index.ts` | barrel export (REFACTOR) |
| `extapp_landing/src/lib/types.ts` | `FeatureStatus` 공유 타입 (REFACTOR) |
| `extapp_landing/public/images/placeholder.svg` | 스크린샷 자리 placeholder |
| `extapp_landing/src/components/common/Section.test.tsx` | TEST-P2.3 (104 라인) |
| `extapp_landing/src/components/common/Button.test.tsx` | TEST-P2.4 (149 라인) |
| `extapp_landing/src/components/common/Badge.test.tsx` | TEST-P2.5~7 (161 라인) |
| `extapp_landing/src/components/common/FeatureCard.test.tsx` | TEST-P2.8~9 + 타입 레벨 강제 (258 라인) |
| `extapp_landing/src/test/design-system.config.test.ts` | TEST-P2.1/P2.2 (232 라인) |

### 6.2 수정 파일

| 파일 | 변경 종류 |
|------|----------|
| `extapp_landing/tailwind.config.js` | 전체 토큰 정의 확장 |
| `extapp_landing/tsconfig.app.json` | `types` 배열에 `"node"` 추가 (RED 리뷰 피드백) |
| `extapp_landing/index.html` | Pretendard CDN `<link>` 추가 |
| `extapp_landing/src/index.css` | body 기본 스타일 (`@apply font-sans text-ink-700 bg-canvas`) |
| `extapp_landing/src/App.tsx` | 데모 페이지로 전환 |
| `extapp_landing/src/App.test.tsx` | 종합 회귀 가드로 전환 |
| `extapp_landing/package.json` | `clsx` 의존성 추가 |
| `extapp_landing/package-lock.json` | clsx lock 업데이트 |
| `working_plan/phase02_design_system.md` | 사전~GREEN~REFACTOR 체크박스 완료 표시 |

### 6.3 삭제 파일

| 파일 | 사유 |
|------|------|
| `extapp_landing/src/components/common/.gitkeep` | 실제 컴포넌트 파일 진입 |
| `extapp_landing/src/lib/.gitkeep` | types.ts 진입 |

---

## 7. 발생한 이슈와 해결 방법

### 7.1 App.test.tsx "Badge 3종" 테스트 수량 오류 (Minor)

**증상**: `npm test` 실행 시 `expected 4 to be 3` AssertionError.

**원인**: 데모 페이지에는 standalone Badge 3개 + FeatureCard(with status) 내부 Badge 1개 = **총 4개** 가 렌더됨. 테스트가 `expect(badges.length).toBe(3)` 로 잘못 기대.

**해결**: 테스트를 라벨 존재 검증 (`getAllByText('구현됨').length >= 1`) 으로 변경. 총 수량 검증은 별도 테스트("FeatureCard 2 케이스")에서 `expect(badges.length).toBe(4)` 로 수행.

### 7.2 ESLint unused-directive 경고 (Minor)

**증상**: `npm run lint` 에서 warning 1건: `src/test/design-system.config.test.ts:25` 의 `eslint-disable @typescript-eslint/naming-convention` 이 필요 없음.

**원인**: v1 에서 `__dirname_` 변수명 때문에 disable 을 걸었지만, v2 재작성 과정에서 naming-convention 규칙이 이 변수를 특별히 플래그하지 않음.

**해결**: `eslint-disable` 지시자 제거.

---

## 8. 리뷰 피드백 반영 요약 (RED v1 → v2)

직전 RED 단계에서 리뷰팀이 제기한 6건 + Deep Dive 4건을 모두 반영했다. 상세 내용은 §2.1 표 참조. v2 단계 총 변화:

- 테스트 파일 656 → **905 라인** (+249)
- `design-system.config.test.ts` assertion 9 → **25** (+16, 토큰 hex 값 1:1 대조 강화)
- Badge regex 강도: OR(토큰 우회 허용) → **AND(토큰 필수)**
- Button 외부 링크 보안: noopener만 → **noopener AND noreferrer**
- FeatureCard 타입 레벨 강제: 없음 → `it.todo` → **`@ts-expect-error` 3건 활성화 (GREEN 후)**
- 루트 태그 검증: `querySelector`(느슨) → **`firstElementChild.tagName`(엄격)**
- TEST-P2.2 범위: HTML · CSS 2경로 → **HTML · CSS · main.tsx 3경로**
- tsconfig.app.json `types`: node 누락 → **`"node"` 추가**

---

## 9. Phase 2 완료 조건 (Definition of Done) 체크

- [x] Tailwind 토큰(컬러/폰트/maxWidth/radius) 적용 완료
- [x] Pretendard 폰트 로드 확인 (CDN + body @apply)
- [x] Section / Button / Badge / FeatureCard 4개 공통 컴포넌트 구현
- [x] **FeatureCard 가 `status` / `statusLabel` 없이 렌더 가능하고, 그 경우 `[data-testid="status-badge"]` 가 DOM 에 존재하지 않음** *(BusinessSection 호환)*
- [x] **Badge 컴포넌트가 `data-testid="status-badge"` 를 일관되게 부착** (FeatureCard TEST-P2.9 와 Phase 8 TEST-P8.9 가 의존)
- [x] 4개 공통 컴포넌트 단위 테스트 PASS (FeatureCard 2 케이스 포함)
- [x] 임시 데모 페이지에서 모든 변형 시각 확인 완료 (FeatureCard with/without status 2 변형 포함)
- [x] 상태 배지 3종이 시각적으로 명확히 구분됨
- [x] placeholder.svg 1개 생성
- [x] `src/App.test.tsx` 가 데모 페이지 전환에 맞게 업데이트되었고 `npm test` PASS
- [x] `npm run lint` / `typecheck` / `format:check` / `build` 전부 통과
- [x] **Phase 1 회귀 가드 재실행: `node working_plan/scripts/verify_phase1.mjs` → 23 PASS / 0 FAIL 유지** (TEST-P2.10)
- [ ] 작업 결과서 작성 및 커밋 완료 *(결과서 ✅ / 커밋 — 본 결과서 기록 후 진행 예정)*

---

## 10. 다음 Phase 인계 사항 (Phase 3 i18n + Header/Footer)

### 10.1 환경

- **clsx** 가 dependencies 에 있음 — Phase 3 이후 컴포넌트도 동일 패턴 사용 권장 (clsx(상수, props, className))
- **공통 컴포넌트 barrel** `src/components/common/index.ts` — Phase 3 의 Header/Footer 가 이 barrel 에서 import 하면 깔끔
- **`FeatureStatus` 타입** — Phase 5 Features/Roadmap 이 import 해서 사용 (새 status 값 추가 시 한 곳만 수정)

### 10.2 데모 페이지 교체 시점

Phase 3 는 Header + Footer + i18n 레이아웃을 구현하면서 `App.tsx` 를 아래 구조로 대체한다:

```tsx
<>
  <Header />
  <main>
    {/* Hero, Problem, ... sections (Phase 4+) */}
  </main>
  <Footer />
</>
```

이때 **App.test.tsx 를 함께 업데이트** 해야 한다 — 현재는 데모 페이지 6개 요소를 검증하지만, Phase 3 이후로는 Header 존재, Footer 저작권, 언어 스위처 동작 등으로 검증 대상이 달라진다. **Phase 1 의 "Bootstrap OK" 에서 Phase 2 의 "데모" 로 전환했던 것과 동일한 방식** 으로 Phase 3 에서도 전환해야 P1.16 이 회귀하지 않는다.

### 10.3 Phase 1 회귀 가드 운영 정책

Phase 2 에서 확인된 것: `verify_phase1.mjs` 23개 가드가 Phase 2 의 모든 단계 (RED → GREEN → REFACTOR) 동안 의도된 FAIL/PASS 패턴을 정확히 보여줬다. Phase 3 에서도 동일한 정책을 유지:

```bash
# 각 Phase 진입 전·후로 회귀 가드 실행
node working_plan/scripts/verify_phase1.mjs
```

- **RED 단계**: 새 미구현 모듈이 import 되면 P1.15/P1.16/P1.17 일시 FAIL 예상 — 정상
- **GREEN 완료 후**: 반드시 23 PASS / 0 FAIL 복귀
- **REFACTOR 후**: 동일

### 10.4 P1.18 동적 스캔의 자동 적응

Phase 1 v2.1 에서 P1.18 이 `src/**/*.{ts,tsx}` 전체를 스캔하도록 강화됐다. Phase 2 에서 새로 추가된 컴포넌트 (Section, Button, Badge, FeatureCard, 데모 App) 의 Tailwind 유틸이 **자동으로** 검증 대상에 포함됐다. Phase 3 이후 Header/Footer 가 추가돼도 동일하게 자동 적응한다.

### 10.5 Badge 계약 보존

Badge 의 `data-testid="status-badge"` 는 **공개 계약** 이다. Phase 3~8 에서 Badge 코드를 건드릴 때:
- testid 이름 변경 금지 (FeatureCard TEST-P2.9 와 Phase 8 TEST-P8.9 가 동시에 깨짐)
- 단일 Badge 인스턴스에 testid 가 정확히 1개만 붙어야 함 (Badge.test.tsx 가 강제)

---

## 11. 미해결 이슈

없음. 모든 assertion 통과 + 회귀 가드 안정.

---

## 12. 작업 시간 (실측 근사)

| 단계 | 소요 |
|------|------|
| 사전 작업 (Phase 1 결과서 3건 검토 + 회귀 가드 기준선) | ~10분 |
| RED v1 (5 spec 파일, 656 라인) | ~40분 |
| RED v2 리뷰 피드백 반영 (6 이슈 + Deep Dive 4건, 905 라인) | ~50분 |
| GREEN TASK-001~010 | ~60분 |
| `@ts-expect-error` 활성화 + App.test.tsx 수량 오류 수정 | ~10분 |
| REFACTOR (타입 분리 + barrel + .gitkeep 정리) | ~15분 |
| 사후 작업 (회귀 가드 재실행, 체크박스 갱신, 결과서 작성) | ~30분 |
| **합계** | **약 3.5시간** |

---

## 13. 최종 커밋 권장

```bash
cd /Users/junghojang/Developments/myProject/DINKIssTyle-Chrome-Extensions/00_intro_web_landing_page

# Phase 2 산출물 (컴포넌트 + 테스트 + 설정)
git add extapp_landing/tailwind.config.js \
        extapp_landing/tsconfig.app.json \
        extapp_landing/index.html \
        extapp_landing/src/index.css \
        extapp_landing/src/App.tsx \
        extapp_landing/src/App.test.tsx \
        extapp_landing/src/components/common/ \
        extapp_landing/src/lib/types.ts \
        extapp_landing/src/test/design-system.config.test.ts \
        extapp_landing/package.json \
        extapp_landing/package-lock.json \
        extapp_landing/public/images/placeholder.svg

# .gitkeep 제거 추적
git add extapp_landing/src/components/common/.gitkeep \
        extapp_landing/src/lib/.gitkeep

# 계획서 체크박스 + 결과서
git add working_plan/phase02_design_system.md \
        working_plan/working_history/v1.0/Phase2_DesignSystem_20260411.md

git commit -m "[P2] 디자인 시스템 + 공통 컴포넌트 — 토큰 · Section/Button/Badge/FeatureCard · App 데모 전환"
```

**커밋 메시지 배경**: Phase 2 는 RED 2회차 + GREEN + REFACTOR 를 모두 한 세션에서 진행했고, 리뷰 피드백 반영분이 RED v1→v2 사이에 있었다. 결과서(§2.1)가 이 흐름을 기록하므로 커밋은 단일로 묶는다 (리뷰 v1 시점의 커밋 없음).

---

## 14. 작업 결과서 리뷰 후속 개선 (Phase 2 v2 — 결과서 기반 코드 리뷰)

§1~§13 이 Phase 2 커밋 `8b4d0c2` 완료 시점을 기록한 것이라면, §14 는 **커밋 이후 결과서와 실제 코드를 교차 리뷰한 결과 드러난 4건의 이슈** 와 그 수정 내역이다. 본 섹션의 모든 변경은 Phase 2 후속 커밋에 포함된다.

### 14.1 제기된 이슈 4건

| # | 심각도 | 이슈 | 실측 재현 |
|---|--------|------|----------|
| A | **Medium** | 데모 페이지의 "Anchor Link" 가 `#features` 를 가리키지만 어떤 Section 도 `id="features"` 를 노출하지 않음 → 앵커 네비 broken | ✅ `grep "id=" src/App.tsx` = no match |
| B | **Medium** | `tsconfig.app.json` 의 types 에 `"node"` 추가로 인해 브라우저 src/ 코드가 node API 를 import 해도 typecheck 통과 → 경계 누출 | ✅ probe 파일로 src/ 에 `import { readFileSync } from 'node:fs'` 삽입 → typecheck 0 errors |
| C | **Low** | `App.test.tsx` 의 "Section 4종 배경" 테스트가 단순 개수만 검사 → 모든 섹션이 같은 배경으로 회귀해도 통과 | ✅ 시뮬레이션: 4개 섹션 모두 `bg-canvas` 일 때 `sections.length >= 4` true |
| D | **Medium** (Deep Dive ②) | Button 의 `external` prop 누락 시 http(s) URL 이 noopener/noreferrer 없이 렌더 → tabnabbing 공격 표면 | ✅ 로직 시뮬레이션: `external=undefined` 시 `externalProps = {}` |

### 14.2 수정 내역

#### 14.2.1 Issue A — Anchor 대상 `id="features"` 추가

**`src/App.tsx`**:
```diff
- <Section background="accent-soft">
+ <Section id="features" background="accent-soft">
    <h2 className="text-2xl font-semibold text-ink-900">Feature Cards</h2>
```

Feature Cards 섹션 자체가 "Anchor Link" 버튼이 의도한 목적지로 가장 자연스럽다. 실제로 이 섹션이 앵커 점프의 타겟이 된다.

**대응 가드** — `App.test.tsx` 신규 assertion:
```tsx
it('Section id="features" 가 Anchor Link 대상으로 존재한다', () => {
  const { container } = render(<App />);
  expect(container.querySelector('#features')).not.toBeNull();
  expect(container.querySelector('section#features')).not.toBeNull();
});
```

#### 14.2.2 Issue B — 브라우저/테스트 tsconfig 격리 (tsconfig.test.json 신규)

**문제 구조**:
v2.0 에서 `design-system.config.test.ts` 가 `node:fs/path/url` 을 import 하면서 `tsconfig.app.json` 의 types 에 `"node"` 를 추가했다. 이는 테스트 1개 파일을 위해 **전체 src/ 브라우저 코드** 에 node ambient 타입을 노출한 부작용이 있었다.

**해결**:
1. `tsconfig.app.json` 의 types 에서 `"node"` 제거
2. `tsconfig.app.json` 의 `exclude` 에 `["src/**/*.test.ts", "src/**/*.test.tsx"]` 추가
3. `tsconfig.test.json` 신규 작성 — `tsconfig.app.json` 을 extends 하고 types 에 `"node"` 추가, include 는 test 파일만, exclude 는 `[]` 로 override (extends 로 상속된 exclude 가 include 를 가리는 현상 방지)
4. `package.json` typecheck 스크립트를 `tsc --noEmit -p tsconfig.app.json && tsc --noEmit -p tsconfig.test.json` 로 변경 — 두 projec 모두 검사

**검증 (돌연변이 테스트)**:
src/ 에 `import { readFileSync } from 'node:fs'` 를 가진 probe 파일 추가 → `npm run typecheck` 결과:
```
src/probe_node_leak.tsx(1,30): error TS2591: Cannot find name 'node:fs'.
```

즉 **브라우저 src/ 에서 node API 사용이 타입 수준에서 차단됨**. 테스트 파일에서는 여전히 정상 사용 가능.

**주의사항**:
- `extends` 가 `include`/`exclude` 를 상속하는 TypeScript 동작 때문에, `tsconfig.test.json` 에 `exclude: []` 를 명시해야 한다. 생략하면 부모의 `exclude` 를 상속받아 테스트 파일이 모두 제외되고 "No inputs were found" 오류 발생. 시행착오에서 발견된 제약.

#### 14.2.3 Issue C — App.test.tsx 배경 고유성 검증 강화

**Before** (단순 개수):
```tsx
it('Section 4종 배경이 모두 렌더된다 ...', () => {
  const sections = container.querySelectorAll('section');
  expect(sections.length).toBeGreaterThanOrEqual(4);
});
```

**After** (4종 배경 클래스 각각 실재 + 고유값 4개 이상):
```tsx
it('Section 4종 배경이 모두 고유하게 렌더된다 ...', () => {
  const { container } = render(<App />);
  const sections = container.querySelectorAll('section');
  expect(sections.length).toBeGreaterThanOrEqual(4);

  const combined = Array.from(sections).map((s) => s.className).join(' ');
  expect(combined).toMatch(/\bbg-canvas\b/);
  expect(combined).toMatch(/\bbg-surface\b/);
  expect(combined).toMatch(/\bbg-surface-alt\b/);
  expect(combined).toMatch(/\bbg-accent-soft\b/);

  const uniqueBgs = new Set(
    Array.from(sections)
      .map((s) => s.className.match(/\bbg-[a-z-]+\b/)?.[0])
      .filter((c): c is string => Boolean(c))
  );
  expect(uniqueBgs.size).toBeGreaterThanOrEqual(4);
});
```

#### 14.2.4 Issue D (Deep Dive ②) — Button external 자동 감지

**구현 변경**: `src/components/common/Button.tsx` 에 `isHttpUrl(href)` 헬퍼 추가 + nullish coalescing 기반 자동 감지:

```tsx
function isHttpUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

// ...
if (href !== undefined) {
  // external 이 명시되면 그 값, 생략되면 URL 기반 자동 판정
  const shouldBeExternal = external ?? isHttpUrl(href);
  const externalProps = shouldBeExternal
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};
  // ...
}
```

**동작 규약**:
- `external={true}`  → 명시적 외부 (target=_blank + noopener noreferrer)
- `external={false}` → 명시적 내부 (http(s) URL 이어도 동일 탭) — 자사 도메인 네비게이션 등 opt-out 경로 보존
- `external` 생략    → `href` 가 `http(s)://` 면 자동 true, 아니면 자동 false

**테스트 강화** — `Button.test.tsx` 에 `자동 외부 링크 감지 (http(s)://)` describe 블록 신규 (4 assertion):
1. http(s) URL 은 external 생략 시에도 자동 target+rel 부여
2. http:// URL 도 동일 (https 만 아님)
3. `external={false}` 명시 opt-out 시 동일 탭
4. 내부 경로 (`/path`, `#anchor`, `mailto:`) 는 자동 external 에서 제외

**데모 페이지 노출** — `App.tsx` 에 "Auto External" 버튼 추가:
```tsx
<Button href="https://auto-detected.example.com" variant="secondary">
  Auto External
</Button>
```
`external` prop 없이 http(s) URL 만 전달 → 자동 감지가 작동해 target=_blank + rel=noopener noreferrer 가 부여되는지 App.test.tsx 가 통합 검증.

### 14.3 돌연변이 테스트 결과 (v2 가드 유효성 증명)

각 수정된 가드가 의도한 회귀 시나리오를 정확히 검출하는지 돌연변이 테스트 4건 수행:

| Mutation | 수정 대상 가드 | 결과 |
|----------|---------------|------|
| M1: `id="features"` 제거 | App.test.tsx "Section id='features' 존재" | ✅ FAIL |
| M2: src/ 에 `import { readFileSync } from 'node:fs'` 삽입 | tsconfig.app.json 격리 | ✅ FAIL (TS2591) |
| M3: 모든 Section `background` 를 `canvas` 로 회귀 | App.test.tsx "Section 4종 배경 고유" | ✅ FAIL |
| M4: Button 의 `external ?? isHttpUrl(href)` 를 `external` 로 되돌림 | Button.test.tsx 자동 감지 3건 + App.test.tsx "Auto External" | ✅ FAIL (3건 동시) |

모든 돌연변이가 정확히 의도한 가드에서 탐지됐고, 복구 후 전 회귀 통과 확인.

### 14.4 Deep Dive Low 이슈 — 처리 정책

리뷰에 포함된 Low 이슈 3건은 **의도적으로 코드 변경 없이 인지만** 하는 것으로 결정:

| # | 이슈 | 결정 |
|---|------|------|
| ① | Section 유연성 부족 (BG_MAP 4종 제한) | **의도된 제약** — 배경 추가는 기획/디자인 승인을 거친 의식적 변경이어야 하므로 TypeScript union 으로 강제하는 것이 바람직. Phase 10 까지 진행 중 새 배경이 실제로 필요하면 그 시점에 `bgMap` 확장 + 대응 테스트 추가 |
| ③ | placeholder.svg 비율 제한 (현재 1개) | **Phase 2 범위 외** — Phase 4+ 에서 Hero, Feature, Scenario 섹션이 실제 목업 이미지를 요구할 때 비율별 (16:9 · 1:1 · 4:3) 로 분리. 현재는 placeholder 1개로 충분 (각 섹션이 CSS 로 aspect 를 제어) |
| ④ | 테스트 실행 속도 누적 | **현 시점 무관** — 현재 `verify_phase1.mjs` + Phase 2 신규 84개 테스트 총 실행 ~3초 수준. Phase 5 이후 섹션 테스트가 본격 추가되면 실측 후 변경 파일 기반 분산 실행 전략 검토 |

### 14.5 수정 후 최종 회귀 상태

```
npm run lint         → 0 errors, 0 warnings
npm run typecheck    → 0 errors  (tsconfig.app.json + tsconfig.test.json 양쪽)
npm run format:check → 전체 규범 준수
npm test             → Test Files 6 passed (6) · Tests 84 passed | 3 skipped (87)
npm run build        → JS 194.72 KB / CSS 8.42 KB

node working_plan/scripts/verify_phase1.mjs
  → 23 PASS / 0 FAIL / 총 23
```

테스트 수 변화: 80 → **84** (+4)
- Section id="features" 검증: +1
- Section 배경 고유성 강화: 기존 1개 재작성
- Button 자동 external 감지: +4 (4 케이스)
- App 데모의 "Auto External" 버튼 검증: +1 (기존 External Link 테스트 확장)

### 14.6 v2 산출물 추가 수정 파일

| 파일 | 변경 종류 |
|------|----------|
| `extapp_landing/tsconfig.app.json` | types 에서 `"node"` 제거 + test 파일 exclude 추가 |
| `extapp_landing/tsconfig.test.json` | **신규** — app 상속 + node types + test 파일 include + exclude override |
| `extapp_landing/package.json` | typecheck 스크립트가 두 tsconfig 모두 실행 |
| `extapp_landing/src/App.tsx` | Feature Cards 섹션에 `id="features"` + Auto External 버튼 |
| `extapp_landing/src/App.test.tsx` | 배경 고유성 강화 + Section id 검증 + Auto External 검증 |
| `extapp_landing/src/components/common/Button.tsx` | `isHttpUrl()` 헬퍼 + `external ?? isHttpUrl(href)` 자동 감지 |
| `extapp_landing/src/components/common/Button.test.tsx` | "자동 외부 링크 감지" describe 블록 4 케이스 추가 |

