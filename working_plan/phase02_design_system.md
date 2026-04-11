# Phase 2: 디자인 시스템 + 공통 컴포넌트

> **목표**: Notion-like 디자인 토큰을 Tailwind에 반영하고, 전 섹션에서 재사용할 공통 컴포넌트(Section, Button, Badge, FeatureCard)를 구현한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일
> **E2E 확인 단위**: 임시 데모 페이지에서 모든 공통 컴포넌트 변형이 시각적으로 확인되고, 상태 배지 3종 색상이 명확히 구분된다.

---

## 2.1 사전 작업 (Pre-Work)

- [ ] **[REVIEW]** 이전 Phase 결과서 검토
  - 파일: `working_history/v1.0/Phase1_Bootstrap_*.md`
  - 확인: 부트스트랩 정상 완료, dev 서버 동작, 미해결 이슈 없음

- [ ] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 4장(디자인 시스템) 재확인
  - Notion 한국어 랜딩 톤앤매너 핵심: 큰 여백, 큰 타이포, off-white 배경, soft 카드, 차분한 액센트

- [ ] **[ANALYSIS]** 디자인 토큰 정의 검토
  - 컬러: canvas, surface, ink, border, accent, status(done/wip/planned)
  - 타이포: Hero H1 64/40, Section H2 40/28, Body 18/16
  - 폰트: Pretendard 우선

---

## 2.2 RED Phase: 검증 체크리스트 + 실패 테스트 작성

- [ ] **[RED]** 검증 체크리스트 작성
  ```
  TEST-P2.1: tailwind.config.js에 colors.accent, colors.status, colors.ink 토큰 정의
  TEST-P2.2: Pretendard 폰트가 index.html 또는 main.tsx에서 로드됨
  TEST-P2.3: <Section> 컴포넌트가 children을 max-w-content 컨테이너로 감쌈
  TEST-P2.4: <Button variant="primary"> 클릭 가능한 a 또는 button을 렌더
  TEST-P2.5: <Badge status="done"> 가 status.done 컬러 클래스를 적용
  TEST-P2.6: <Badge status="wip"> 가 status.wip 컬러 클래스를 적용
  TEST-P2.7: <Badge status="planned"> 가 status.planned 컬러 클래스를 적용
  TEST-P2.8: <FeatureCard> 가 title, description, status props를 모두 노출
  ```

- [ ] **[RED]** Badge 컴포넌트 테스트 작성 (실패 상태)
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

- [ ] **[RED]** FeatureCard 컴포넌트 테스트 작성
  - 파일: `src/components/common/FeatureCard.test.tsx`
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { FeatureCard } from './FeatureCard';

  describe('FeatureCard', () => {
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
  });
  ```

- [ ] **[RED-VERIFY]** 테스트 실패 확인
  ```bash
  npm run test  # 새 테스트 4건 FAIL이어야 함
  ```

---

## 2.3 GREEN Phase: 최소 코드 구현

- [ ] **[TASK-001]** Tailwind 토큰 확장
  - 파일: `extapp_landing/tailwind.config.js`
  - 추가: 02_implementation_plan.md 4.2절의 컬러/폰트/maxWidth/borderRadius 토큰 전체

- [ ] **[TASK-002]** Pretendard 폰트 로드
  - 파일: `extapp_landing/index.html`
  - `<head>`에 추가:
    ```html
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
    ```
  - `index.css` body 기본 폰트 적용:
    ```css
    body { @apply font-sans text-ink-700 bg-canvas; }
    ```

- [ ] **[TASK-003]** clsx 설치
  - 명령: `npm install clsx`

- [ ] **[TASK-004]** Section 공통 컴포넌트
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

- [ ] **[TASK-005]** Button 공통 컴포넌트
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

- [ ] **[TASK-006]** Badge 공통 컴포넌트
  - 파일: `src/components/common/Badge.tsx`
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
      <span className={clsx('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border', map[status])}>
        {children}
      </span>
    );
  }
  ```

- [ ] **[TASK-007]** FeatureCard 공통 컴포넌트
  - 파일: `src/components/common/FeatureCard.tsx`
  ```tsx
  import { ReactNode } from 'react';
  import { Badge } from './Badge';

  type FeatureCardProps = {
    icon?: ReactNode;
    title: string;
    description: string;
    example?: string;
    status: 'done' | 'wip' | 'planned';
    statusLabel: string;
  };

  export function FeatureCard({ icon, title, description, example, status, statusLabel }: FeatureCardProps) {
    return (
      <div className="rounded-2xl border border-border bg-canvas p-6 md:p-8 shadow-sm hover:shadow-md transition">
        <div className="flex items-start justify-between gap-4">
          <div className="text-accent">{icon}</div>
          <Badge status={status}>{statusLabel}</Badge>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-ink-900">{title}</h3>
        <p className="mt-2 text-base text-ink-700">{description}</p>
        {example && <p className="mt-3 text-sm text-ink-500">예: {example}</p>}
      </div>
    );
  }
  ```

- [ ] **[TASK-008]** 임시 데모 페이지
  - 파일: `src/App.tsx`
  - 모든 공통 컴포넌트의 변형을 한 화면에 노출 (시각 확인 목적)

- [ ] **[TASK-009]** placeholder 이미지 시스템
  - 파일: `public/images/placeholder.svg`
  - 점선 보더 + "스크린샷 자리" 라벨이 들어간 SVG 1개 생성
  - 추후 모든 섹션이 fallback으로 참조

- [ ] **[GREEN-VERIFY]** 검증
  ```bash
  npm run test        # 모든 테스트 PASS
  npm run typecheck   # 0 errors
  npm run build       # 성공
  npm run dev         # 데모 페이지에서 4개 컴포넌트 시각 확인
  ```

---

## 2.4 REFACTOR Phase: 코드 개선

### 2.4.1 구조 개선

- [ ] **[REFACTOR-STRUCTURE]** 컴포넌트 export 정리
  - 파일: `src/components/common/index.ts` 추가
  - barrel export: `Section`, `Button`, `Badge`, `FeatureCard`

- [ ] **[REFACTOR-STRUCTURE]** 타입 분리
  - 파일: `src/lib/types.ts`
  - `FeatureStatus = 'done' | 'wip' | 'planned'` 공통 타입 정의 후 모든 컴포넌트가 import

- [ ] **[REFACTOR-STRUCTURE]** clsx 패턴 일관화
  - 모든 공통 컴포넌트가 동일한 className 결합 패턴을 사용하는지 점검

- [ ] **[REFACTOR-VERIFY]** 리팩터링 후 테스트 재확인
  ```bash
  npm run test        # 여전히 PASS
  npm run typecheck   # 0 errors
  ```

### 2.4.2 빌드 품질 점검

- [ ] **[REFACTOR-PERF-MEASURE]** 번들 크기 측정
  | 파일 | 이전 | 이후 | 변화 |
  |------|------|------|------|
  | dist/assets/index-*.js | [P1 값] | [측정] | [Δ] |
  | dist/assets/index-*.css | [P1 값] | [측정] | [Δ] |

- [ ] **[REFACTOR-PERF-ANALYZE]** Tailwind purge 정상 동작 확인
  - dist CSS에 사용하지 않은 유틸 클래스가 포함되어 있지 않은지 size로 추정

---

## 2.5 사후 작업

- [ ] **[VERIFY]** 전체 검증
  ```bash
  npm run typecheck && npm run test && npm run build
  ```

- [ ] **[VERIFY]** 시각 회귀 확인 (수동)
  - 데모 페이지에서 다음 요소 확인:
    - Section 4종 배경색 차이
    - Button primary/secondary 호버
    - Badge 3종 색상 명확히 구분
    - FeatureCard 카드 섀도/라운드 적용

- [ ] **[DOC]** 작업 결과서 작성
  - 파일: `working_history/v1.0/Phase2_DesignSystem_2026MMDD.md`

- [ ] **[COMMIT]** 변경사항 커밋
  ```bash
  git add extapp_landing/{src,tailwind.config.js,index.html,public}
  git commit -m "[P2] 디자인 시스템 + 공통 컴포넌트 (Section/Button/Badge/FeatureCard)"
  ```

---

## Phase 2 완료 조건 (Definition of Done)

- [ ] Tailwind 토큰(컬러/폰트/maxWidth/radius) 적용 완료
- [ ] Pretendard 폰트 로드 확인
- [ ] Section / Button / Badge / FeatureCard 4개 공통 컴포넌트 구현
- [ ] 4개 공통 컴포넌트 단위 테스트 PASS
- [ ] 임시 데모 페이지에서 모든 변형 시각 확인 완료
- [ ] 상태 배지 3종이 시각적으로 명확히 구분됨
- [ ] placeholder.svg 1개 생성
- [ ] `npm run build` 통과
- [ ] 작업 결과서 작성 및 커밋 완료
