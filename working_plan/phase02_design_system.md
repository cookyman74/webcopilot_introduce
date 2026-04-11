# Phase 2: 디자인 시스템 + 공통 컴포넌트

> **목표**: Notion-like 디자인 토큰을 Tailwind에 반영하고, 전 섹션에서 재사용할 공통 컴포넌트(Section, Button, Badge, FeatureCard)를 구현한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일
> **E2E 확인 단위**: 임시 데모 페이지에서 모든 공통 컴포넌트 변형이 시각적으로 확인되고, 상태 배지 3종 색상이 명확히 구분된다.

---

## 2.1 사전 작업 (Pre-Work)

- [x] **[REVIEW]** Phase 1 결과서 **3건** 검토
  - 파일:
    1. [`working_history/v1.0/Phase1_Bootstrap_RED_20260410.md`](./working_history/v1.0/Phase1_Bootstrap_RED_20260410.md) — v1 RED 스냅샷 (18 가드 FAIL)
    2. [`working_history/v1.0/Phase1_Bootstrap_20260410.md`](./working_history/v1.0/Phase1_Bootstrap_20260410.md) — v1 GREEN 결과서 (18 PASS)
    3. [`working_history/v1.0/Phase1_Bootstrap_TestGuardV2_20260411.md`](./working_history/v1.0/Phase1_Bootstrap_TestGuardV2_20260411.md) — v2/v2.1 리뷰 기반 가드 보강 (23 PASS, 돌연변이 테스트 6+6건)
  - 확인: 부트스트랩 정상 완료, dev 서버 동작, 23개 회귀 가드 전체 PASS, 미해결 이슈 없음

- [x] **[REGRESSION-BASELINE]** Phase 2 진입 전 **Phase 1 회귀 가드 기준선** 확보 *(RED 진입 직전 `23 PASS / 0 FAIL` 확인)*
  ```bash
  cd 00_intro_web_landing_page
  node working_plan/scripts/verify_phase1.mjs
  ```
  **기대**: `23 PASS / 0 FAIL`. 이후 Phase 2 변경이 이 기준선을 깨지 않아야 한다. GREEN-VERIFY 및 사후 작업에서 재실행한다 (§2.3, §2.5 참조).

- [x] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 4장(디자인 시스템) 재확인
  - Notion 한국어 랜딩 톤앤매너 핵심: 큰 여백, 큰 타이포, off-white 배경, soft 카드, 차분한 액센트

- [x] **[CONTEXT]** Phase 1 환경 가정 인계 *(TestGuardV2 §12 기반)*
  - **컴포넌트 테스트 환경**: `happy-dom` (jsdom@27 의 CJS/ESM interop 이슈로 v1 GREEN 단계에서 전환). `document.fonts` 같은 JSDOM-specific API는 호환성 확인 필요.
  - **Prettier 규범**: 새 파일 작성 후 반드시 `npm run format` 실행 (P1.21 = `format:check` 런타임 가드가 회귀 감지).
  - **Tailwind 가드 자동 적응**: P1.18은 `src/**/*.{ts,tsx}` 전체를 스캔하므로 Phase 2 에서 새 컴포넌트를 추가하면 자동으로 검증 대상이 확장된다. variant prefix (`md:`, `hover:`, `dark:`) 도 v2.1에서 정상 처리된다.
  - **engines 제약**: `package.json` 에 `"node": "^20.19.0 || >=22.12.0"` 선언됨. 현재 로컬 Node 22.11.0은 EBADENGINE 경고가 발생하나 동작에는 영향 없음.

- [x] **[CONTEXT]** Phase 2 가 수정하는 파일과 Phase 1 가드의 상호작용
  | 수정 대상 | 영향 받는 Phase 1 가드 | 주의 |
  |----------|----------------------|------|
  | `tailwind.config.js` (토큰 확장) | P1.5 (content glob), P1.18 (dist CSS 검증) | content glob은 유지, 새 토큰은 purge 후에도 살아남아야 P1.18 PASS |
  | `index.html` (Pretendard `<link>` 추가) | P1.22 (속성 순서 agnostic, id="root", dist 실재) | 기존 `<script>` 와 `<div id="root">` 유지 필수 |
  | `src/index.css` (body 스타일) | P1.7 (`@tailwind` 디렉티브) | 3개 디렉티브 절대 제거 금지 |
  | `src/App.tsx` (데모 페이지로 대체) | P1.9 (Tailwind 유틸 사용), P1.18, P1.16 (`App.test.tsx` 통과) | 아래 ANALYSIS 참조 |
  | `src/App.test.tsx` | P1.10 (existence + describe/it), P1.16 (vitest run) | "Bootstrap OK" 텍스트 기반 테스트는 데모 페이지 전환 시 FAIL 위험 — TASK-008에서 함께 전환 |

- [x] **[ANALYSIS]** 디자인 토큰 정의 검토
  - 컬러: canvas, surface, ink, border, accent, status(done/wip/planned)
  - 타이포: Hero H1 64/40, Section H2 40/28, Body 18/16
  - 폰트: Pretendard 우선

- [x] **[ANALYSIS]** FeatureCard 의 BusinessSection 호환성 확인 *(Phase 8 예비 대응)*
  - `02_implementation_plan.md §5.10` 과 `phase08 TEST-P8.9` 가 **BusinessSection 가치 카드에 상태 배지 사용 금지** 를 규정하고 있고, 동시에 "`FeatureCard` 재사용" 을 요구함
  - 따라서 Phase 2 의 `FeatureCard` 는 **`status` / `statusLabel` / `icon` 이 모두 optional** 해야 하며, 값이 없을 때 Badge 는 렌더되지 않아야 함
  - 이 제약은 §2.2 RED 테스트와 §2.3 GREEN TASK-007에 반영 (아래 참조)

---

## 2.2 RED Phase: 검증 체크리스트 + 실패 테스트 작성

- [x] **[RED]** 검증 체크리스트 작성
  ```
  TEST-P2.1:  tailwind.config.js에 colors.accent, colors.status, colors.ink 토큰 정의
  TEST-P2.2:  Pretendard 폰트가 index.html · src/index.css · src/main.tsx 중 한 곳에서 로드됨 (3가지 구현 경로 허용)
  TEST-P2.3:  <Section> 컴포넌트가 children을 max-w-content 컨테이너로 감쌈
  TEST-P2.4:  <Button variant="primary"> 클릭 가능한 a 또는 button을 렌더
  TEST-P2.5:  <Badge status="done"> 가 status.done 컬러 클래스를 적용
  TEST-P2.6:  <Badge status="wip"> 가 status.wip 컬러 클래스를 적용
  TEST-P2.7:  <Badge status="planned"> 가 status.planned 컬러 클래스를 적용
  TEST-P2.8:  <FeatureCard title description status statusLabel /> 가 4개 props를 모두 노출 (상태 배지 포함 케이스)
  TEST-P2.9:  <FeatureCard title description /> status/statusLabel 없이도 정상 렌더 + Badge가 DOM에 존재하지 않음 (BusinessSection 대응)
  TEST-P2.10: Phase 2 변경 후에도 verify_phase1.mjs 23개 가드 전부 PASS 유지 (회귀 금지)
  ```

- [x] **[RED]** Badge 컴포넌트 테스트 작성 (실패 상태) — `src/components/common/Badge.test.tsx` 신규 · TEST-P2.5/P2.6/P2.7 + data-testid 계약
  - 파일: `src/components/common/Badge.test.tsx`
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { Badge } from './Badge';

  describe('Badge', () => {
    it('renders done status with correct label', () => {
      render(<Badge status="done">구현됨</Badge>);
      expect(screen.getByText('구현됨')).toBeInTheDocument();
    });
    it('applies different class for wip vs planned', () => {
      const { rerender, container } = render(<Badge status="wip">보강 중</Badge>);
      const wipClass = container.firstChild?.className ?? '';
      rerender(<Badge status="planned">계획·검토 중</Badge>);
      const plannedClass = container.firstChild?.className ?? '';
      expect(wipClass).not.toBe(plannedClass);
    });
  });
  ```

- [x] **[RED]** FeatureCard 컴포넌트 테스트 작성 — `src/components/common/FeatureCard.test.tsx` 신규 · TEST-P2.8 (with status) + TEST-P2.9 (BusinessSection 대응, Badge DOM 부재 강제) + <article> 루트 계약
  - 파일: `src/components/common/FeatureCard.test.tsx`
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { FeatureCard } from './FeatureCard';

  describe('FeatureCard', () => {
    // TEST-P2.8: 상태 배지 포함 케이스 (일반 기능 섹션 — Features/Roadmap 등)
    it('renders title, description, and status badge', () => {
      render(
        <FeatureCard
          title="AI 채팅"
          description="페이지 문맥 기반 질문"
          status="done"
          statusLabel="구현됨"
        />
      );
      expect(screen.getByText('AI 채팅')).toBeInTheDocument();
      expect(screen.getByText('페이지 문맥 기반 질문')).toBeInTheDocument();
      expect(screen.getByText('구현됨')).toBeInTheDocument();
    });

    // TEST-P2.9: status/statusLabel 없이 렌더 가능 + Badge DOM 부재
    // BusinessSection (§5.10) 가 기술 재사용 **제안** 카드로 이 케이스를 사용한다.
    // Phase 8 TEST-P8.9 가 "BusinessSection 내부에 Badge 가 단 하나도 렌더되지 않음"
    // 을 강제하므로, FeatureCard 는 status prop 없이도 정상 동작해야 한다.
    it('renders without status/statusLabel and does NOT render any badge', () => {
      const { container } = render(
        <FeatureCard
          title="페이지 문맥 기반 AI"
          description="사용자 컨텍스트를 잃지 않는 AI 파이프라인"
        />
      );
      expect(screen.getByText('페이지 문맥 기반 AI')).toBeInTheDocument();
      expect(screen.getByText('사용자 컨텍스트를 잃지 않는 AI 파이프라인')).toBeInTheDocument();
      // Badge 컴포넌트는 data-testid="status-badge" 규약을 따른다고 가정 (§2.3 TASK-006)
      expect(container.querySelectorAll('[data-testid="status-badge"]').length).toBe(0);
      // 상태 텍스트도 누출되지 않아야 함
      expect(container.textContent).not.toMatch(/구현됨|보강 중|계획/);
    });
  });
  ```

- [x] **[RED]** Section 컴포넌트 테스트 작성 — `src/components/common/Section.test.tsx` 신규 · TEST-P2.3 (레이아웃 계약 · background 4종 · id 앵커 · className 확장)

- [x] **[RED]** Button 컴포넌트 테스트 작성 — `src/components/common/Button.test.tsx` 신규 · TEST-P2.4 (semantic 태그 선택 · external rel · variant 구분 · children 렌더)

- [x] **[RED]** 설정 파일 검사 테스트 작성 — `src/test/design-system.config.test.ts` 신규 · TEST-P2.1 (Tailwind 토큰 6건) + TEST-P2.2 (Pretendard 로드 3건)

- [x] **[RED-VERIFY]** 테스트 실패 확인 — 실측 결과
  ```bash
  npm test
  # Test Files  5 failed | 1 passed (6)
  # Tests       9 failed | 1 passed (10)
  #
  # 파일 단위 실패 원인:
  #   - Section.test.tsx       : Failed to resolve import "./Section"       (전체 파일)
  #   - Button.test.tsx        : Failed to resolve import "./Button"        (전체 파일)
  #   - Badge.test.tsx         : Failed to resolve import "./Badge"         (전체 파일)
  #   - FeatureCard.test.tsx   : Failed to resolve import "./FeatureCard"   (전체 파일)
  #   - design-system.config.test.ts : 9개 assertion 모두 FAIL (토큰 미정의)
  #
  # App.test.tsx : 1 passed — Phase 1 기존 테스트는 영향 없음 (비회귀 유지)
  ```
  - **벤치마크 카운트**: 4개 컴포넌트 테스트 파일은 모듈 미해결 단계에서 FAIL 하므로 vitest 가 내부 it() 개수를 "0 test" 로 보고한다. GREEN 완료 후 모듈이 생기면 이 파일들의 개별 테스트(총 **37 개** — Section 9, Button 12, Badge 8, FeatureCard 11)가 실행 대상으로 정상 집계된다.
  - **Phase 1 회귀 가드 상태** (RED 본질적 실패):
    ```bash
    node working_plan/scripts/verify_phase1.mjs
    # 결과: 20 PASS / 3 FAIL / 총 23
    #
    # 3건 실패 (전부 RED 본질 — GREEN 완료 시 자동 해소):
    #   ❌ P1.15 typecheck — tsc가 미구현 모듈의 import를 resolve 못함
    #   ❌ P1.16 test      — 위의 npm test 실패 전파
    #   ❌ P1.17 build     — tsc -b 단계에서 동일 타입 오류
    #
    # P1.21 format:check 는 PASS — 신규 테스트 파일에 prettier 규범 적용됨
    # 나머지 20개 가드 PASS 유지 (P1.18 dynamic 스캔, P1.22 entry, P1.23 plugins 등)
    ```
    **Phase 2 완료 시점(GREEN 이후) 에 반드시 23 PASS / 0 FAIL 로 복귀해야 함.**

---

## 2.3 GREEN Phase: 최소 코드 구현

- [x] **[TASK-001]** Tailwind 토큰 확장
  - 파일: `extapp_landing/tailwind.config.js`
  - 추가: 02_implementation_plan.md 4.2절의 컬러/폰트/maxWidth/borderRadius 토큰 전체

- [x] **[TASK-002]** Pretendard 폰트 로드
  - 파일: `extapp_landing/index.html`
  - `<head>`에 추가:
    ```html
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
    ```
  - `index.css` body 기본 폰트 적용:
    ```css
    body { @apply font-sans text-ink-700 bg-canvas; }
    ```

- [x] **[TASK-003]** clsx 설치
  - 명령: `npm install clsx`

- [x] **[TASK-004]** Section 공통 컴포넌트
  - 파일: `src/components/common/Section.tsx`
  ```tsx
  import { ReactNode } from 'react';
  import clsx from 'clsx';

  type SectionProps = {
    id?: string;
    background?: 'canvas' | 'surface' | 'surface-alt' | 'accent-soft';
    children: ReactNode;
    className?: string;
  };

  export function Section({ id, background = 'canvas', children, className }: SectionProps) {
    const bgMap = {
      canvas: 'bg-canvas',
      surface: 'bg-surface',
      'surface-alt': 'bg-surface-alt',
      'accent-soft': 'bg-accent-soft',
    } as const;
    return (
      <section id={id} className={clsx(bgMap[background], 'py-20 md:py-28', className)}>
        <div className="mx-auto max-w-content px-6 md:px-10">{children}</div>
      </section>
    );
  }
  ```

- [x] **[TASK-005]** Button 공통 컴포넌트
  - 파일: `src/components/common/Button.tsx`
  ```tsx
  import { ReactNode } from 'react';
  import clsx from 'clsx';

  type ButtonProps = {
    href?: string;
    variant?: 'primary' | 'secondary';
    children: ReactNode;
    external?: boolean;
  };

  export function Button({ href, variant = 'primary', children, external }: ButtonProps) {
    const base = 'inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold transition';
    const variants = {
      primary: 'bg-accent text-white hover:bg-accent-hover',
      secondary: 'bg-white text-ink-700 border border-border hover:bg-surface',
    };
    const Tag = href ? 'a' : 'button';
    const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    return (
      <Tag href={href} className={clsx(base, variants[variant])} {...externalProps}>
        {children}
      </Tag>
    );
  }
  ```

- [x] **[TASK-006]** Badge 공통 컴포넌트
  - 파일: `src/components/common/Badge.tsx`
  - **`data-testid="status-badge"` 규약**: FeatureCard / BusinessSection 테스트 (TEST-P2.9, TEST-P8.9) 가 이 testid 로 Badge 존재 여부를 검증한다. 반드시 유지.
  ```tsx
  import { ReactNode } from 'react';
  import clsx from 'clsx';

  type Status = 'done' | 'wip' | 'planned';
  type BadgeProps = { status: Status; children: ReactNode };

  export function Badge({ status, children }: BadgeProps) {
    const map: Record<Status, string> = {
      done:    'bg-emerald-50 text-status-done border-emerald-200',
      wip:     'bg-amber-50 text-status-wip border-amber-200',
      planned: 'bg-stone-50 text-status-planned border-stone-200',
    };
    return (
      <span
        data-testid="status-badge"
        className={clsx(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
          map[status]
        )}
      >
        {children}
      </span>
    );
  }
  ```

- [x] **[TASK-007]** FeatureCard 공통 컴포넌트 *(v2: BusinessSection 호환을 위해 status/statusLabel/icon optional)*
  - **타입 레벨 강제 활성화**: 구현 완료 후 `FeatureCard.test.tsx` 의 "타입 레벨 강제" describe 블록에 있는 **3개 `it.todo` 항목을 실제 `it` + `@ts-expect-error`** 로 전환한다. RED 단계에서는 모듈이 없어 TS 가 props 를 `any` 로 처리하므로 `@ts-expect-error` 가 "불필요한 주석" 으로 판정되어 쓸 수 없었지만, 구현이 완료되면 discriminated union 이 실제 타입 에러를 발생시켜 `@ts-expect-error` 가 게이트로 작동한다. 전환 대상:
    1. `status` 만 전달 → 타입 에러
    2. `statusLabel` 만 전달 → 타입 에러
    3. 잘못된 `status` 값 (`'unknown'` 등) → 타입 에러
  - 파일: `src/components/common/FeatureCard.tsx`
  - **설계 원칙**:
    1. `status` / `statusLabel` 이 **둘 다** 전달된 경우에만 Badge 렌더
    2. 하나만 전달되는 것은 타입 레벨에서 허용하지 않음 (conditional type 또는 런타임 검사)
    3. Badge 미렌더 시 `<Badge>` 컴포넌트 자체가 호출되지 않아야 함 (DOM 에 `data-testid="status-badge"` 가 존재하지 않도록)
  ```tsx
  import type { ReactNode } from 'react';
  import { Badge } from './Badge';

  type FeatureStatus = 'done' | 'wip' | 'planned';

  type FeatureCardBase = {
    icon?: ReactNode;
    title: string;
    description: string;
    example?: string;
  };

  // status + statusLabel 은 둘 다 있거나 둘 다 없어야 함 (discriminated union)
  type WithStatus = FeatureCardBase & { status: FeatureStatus; statusLabel: string };
  type WithoutStatus = FeatureCardBase & { status?: undefined; statusLabel?: undefined };

  export type FeatureCardProps = WithStatus | WithoutStatus;

  export function FeatureCard(props: FeatureCardProps) {
    const { icon, title, description, example } = props;
    const hasStatus = props.status !== undefined && props.statusLabel !== undefined;

    return (
      <article className="rounded-2xl border border-border bg-canvas p-6 md:p-8 shadow-sm hover:shadow-md transition">
        <div className="flex items-start justify-between gap-4">
          {icon && <div className="text-accent">{icon}</div>}
          {hasStatus && <Badge status={props.status!}>{props.statusLabel}</Badge>}
        </div>
        <h3 className="mt-4 text-xl font-semibold text-ink-900">{title}</h3>
        <p className="mt-2 text-base text-ink-700">{description}</p>
        {example && <p className="mt-3 text-sm text-ink-500">예: {example}</p>}
      </article>
    );
  }
  ```
  - **주의**: 루트 엘리먼트를 `<div>` → `<article>` 로 변경. `phase08 TEST-P8.7` (`screen.getAllByRole('article').length === 3`) 이 이 선택에 의존한다.

- [x] **[TASK-008]** 임시 데모 페이지 + **App.test.tsx 전환** *(Phase 1 P1.16 회귀 방지)*
  - 파일: `src/App.tsx`
  - 모든 공통 컴포넌트의 변형을 한 화면에 노출 (시각 확인 목적):
    - Section 4종 배경 (canvas / surface / surface-alt / accent-soft)
    - Button primary / secondary
    - Badge 3종 (done / wip / planned)
    - FeatureCard **status 포함** 버전 (아이콘 + 배지)
    - FeatureCard **status 없는** 버전 (BusinessSection 프리뷰)
  - 파일: `src/App.test.tsx` **동반 업데이트**
    - 기존 v1 테스트는 `"Bootstrap OK"` 텍스트 존재를 검증 → 데모 페이지 전환 시 FAIL → P1.16/verify_phase1.mjs FAIL
    - 새 테스트는 데모 페이지의 안정된 요소 중 **Phase 2 이후에도 유지되는 것**을 검증하는 것이 안전. 예:
      ```tsx
      import { render, screen } from '@testing-library/react';
      import App from './App';

      describe('App demo page', () => {
        it('renders at least one status badge (Badge 변형 데모)', () => {
          const { container } = render(<App />);
          // 데모 페이지에는 Badge 변형이 노출된다
          expect(container.querySelectorAll('[data-testid="status-badge"]').length).toBeGreaterThan(0);
        });
      });
      ```
    - **대안**: App.test.tsx 를 삭제하지 말 것. P1.10 (존재 + describe/it) 가드가 있다. 파일 자체는 유지하되 내용을 전환.
  - **검증**: 이 TASK 완료 후 `npm test` 가 여전히 PASS 해야 하고, verify_phase1.mjs 도 23 PASS 유지.

- [x] **[TASK-009]** placeholder 이미지 시스템
  - 파일: `public/images/placeholder.svg`
  - 점선 보더 + "스크린샷 자리" 라벨이 들어간 SVG 1개 생성
  - 추후 모든 섹션이 fallback으로 참조

- [x] **[TASK-010]** Prettier 일괄 포맷 적용 *(P1.21 회귀 방지)*
  ```bash
  cd extapp_landing
  npm run format       # Phase 2 에서 추가/수정한 모든 파일을 규범에 맞춤
  npm run format:check # 확인 — 이 명령이 CI/가드(P1.21)에서 매번 강제됨
  ```
  - Phase 2 는 4~5개 새 파일 + 여러 기존 파일 수정이 있으므로 포맷 불일치 위험이 크다. TASK-001~009 완료 직후 한 번 일괄 적용한다.

- [x] **[GREEN-VERIFY]** 검증 — **Phase 2 자체 테스트 + Phase 1 회귀 가드 재실행**
  ```bash
  # Phase 2 자체 검증
  npm run test            # 모든 테스트 PASS (P2 신규 5건 + P1 App 테스트 전환본)
  npm run typecheck       # 0 errors
  npm run lint            # 0 errors
  npm run format:check    # 통과
  npm run build           # 성공
  npm run dev             # 데모 페이지에서 모든 변형 시각 확인

  # Phase 1 회귀 가드 재확인 (TEST-P2.10)
  cd 00_intro_web_landing_page
  node working_plan/scripts/verify_phase1.mjs
  # 기대: 23 PASS / 0 FAIL — 사전 작업의 [REGRESSION-BASELINE] 과 동일
  ```
  - **만약 verify_phase1.mjs 가 FAIL 을 보고한다면** 어떤 가드가 깨졌는지 먼저 확인하고, 원인 분석 후 수정한다. 가드 우회로 해결하지 말 것. 가장 흔한 Phase 2 회귀:
    - P1.16 (`npm test`): App.test.tsx 가 데모 페이지 전환에 맞게 업데이트되지 않음 → TASK-008 재확인
    - P1.18: 새 컴포넌트의 Tailwind 유틸이 `tailwind.config.js` content glob 밖에 있음 → content glob 확장
    - P1.21: 새 파일이 prettier 규범 불일치 → `npm run format` 재실행
    - P1.22: `index.html` 의 `<div id="root">` 또는 `<script>` 가 Pretendard `<link>` 추가 중 실수로 제거됨 → 복원

---

## 2.4 REFACTOR Phase: 코드 개선

### 2.4.1 구조 개선

- [x] **[REFACTOR-STRUCTURE]** 컴포넌트 export 정리
  - 파일: `src/components/common/index.ts` 추가
  - barrel export: `Section`, `Button`, `Badge`, `FeatureCard`

- [x] **[REFACTOR-STRUCTURE]** 타입 분리
  - 파일: `src/lib/types.ts`
  - `FeatureStatus = 'done' | 'wip' | 'planned'` 공통 타입 정의 후 모든 컴포넌트가 import

- [x] **[REFACTOR-STRUCTURE]** clsx 패턴 일관화
  - 모든 공통 컴포넌트가 동일한 className 결합 패턴을 사용하는지 점검

- [x] **[REFACTOR-VERIFY]** 리팩터링 후 테스트 재확인
  ```bash
  npm run test        # 여전히 PASS
  npm run typecheck   # 0 errors
  ```

### 2.4.2 빌드 품질 점검

- [x] **[REFACTOR-PERF-MEASURE]** 번들 크기 측정
  | 파일 | 이전 | 이후 | 변화 |
  |------|------|------|------|
  | dist/assets/index-*.js | [P1 값] | [측정] | [Δ] |
  | dist/assets/index-*.css | [P1 값] | [측정] | [Δ] |

- [x] **[REFACTOR-PERF-ANALYZE]** Tailwind purge 정상 동작 확인
  - dist CSS에 사용하지 않은 유틸 클래스가 포함되어 있지 않은지 size로 추정

---

## 2.5 사후 작업

- [x] **[VERIFY]** 전체 검증 — **Phase 2 + Phase 1 회귀**
  ```bash
  # Phase 2
  npm run typecheck && npm run lint && npm run test && npm run format:check && npm run build

  # Phase 1 회귀 가드 (필수)
  cd 00_intro_web_landing_page
  node working_plan/scripts/verify_phase1.mjs
  # 기대: 23 PASS / 0 FAIL
  ```

- [x] **[VERIFY]** 시각 회귀 확인 (수동)
  - 데모 페이지에서 다음 요소 확인:
    - Section 4종 배경색 차이
    - Button primary/secondary 호버
    - Badge 3종 색상 명확히 구분
    - FeatureCard **with status** (배지 렌더됨)
    - FeatureCard **without status** (배지 DOM 에 존재하지 않음 — BusinessSection 프리뷰)
    - Pretendard 폰트 로드됨 (DevTools Network 에서 confirm)

- [x] **[DOC]** 작업 결과서 작성
  - 파일: `working_history/v1.0/Phase2_DesignSystem_2026MMDD.md`
  - 포함 내용:
    - 설치 패키지 (clsx 등)
    - Tailwind 토큰 diff (이전 / 이후)
    - 5개 공통 컴포넌트 구현 요약 (Section / Button / Badge / FeatureCard**×2 케이스** / placeholder.svg)
    - Phase 1 → Phase 2 번들 크기 변화 (베이스라인 `JS 188KB / CSS 4KB` 대비)
    - Phase 1 회귀 가드 재실행 결과 (23 PASS 유지 확인)
    - App.test.tsx 전환 경위 (v1 "Bootstrap OK" → 데모 페이지 대응)
    - 다음 Phase (P3 i18n) 인계 사항

- [x] **[COMMIT]** 변경사항 커밋
  ```bash
  git add extapp_landing/src \
          extapp_landing/tailwind.config.js \
          extapp_landing/index.html \
          extapp_landing/public \
          extapp_landing/package.json \
          extapp_landing/package-lock.json \
          working_plan/working_history/v1.0/Phase2_DesignSystem_2026MMDD.md
  git commit -m "[P2] 디자인 시스템 + 공통 컴포넌트 (Section/Button/Badge/FeatureCard with optional status)"
  ```

---

## Phase 2 완료 조건 (Definition of Done)

- [x] Tailwind 토큰(컬러/폰트/maxWidth/radius) 적용 완료
- [x] Pretendard 폰트 로드 확인
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
- [x] 작업 결과서 작성 및 커밋 완료
