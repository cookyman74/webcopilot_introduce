# Phase 5: Solution + Features 섹션

> **목표**: 해결 방식 3축(SolutionSection)과 9개 기능 카드(FeaturesSection, 상태 배지 포함)를 구현한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일
> **E2E 확인 단위**: 3축 카드 + 9개 기능 카드가 시각적으로 노출되며, 각 카드의 상태 배지(`구현됨`/`보강 중`/`계획·검토 중`)가 정확히 표시된다.

---

## 5.1 사전 작업

- [ ] **[REVIEW]** 이전 Phase 결과서 검토
  - 파일: `working_history/v1.0/Phase4_HeroProblem_*.md`
  - 확인: Hero/Problem 정상, locale 키 동기화 깨짐 없음

- [ ] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 5.3, 5.4 (Solution / Features 스펙)
  - extension_intro.md 2장(핵심 가치), 3장(주요 기능) 표현 참조
  - 9개 기능 카드의 상태 매핑 확정:
    | # | 기능 | 상태 |
    |---|------|------|
    | 1 | AI 채팅 | done |
    | 2 | 페이지 도우미 | done |
    | 3 | 텍스트 선택 기반 | done |
    | 4 | 문서/폼 자동입력 | done |
    | 5 | Action Tools 에이전트 | done |
    | 6 | 이미지/스크린샷 | done |
    | 7 | 텍스트 개선 | done |
    | 8 | 스크립트 실행/등록 | wip |
    | 9 | Floating Helper | planned |

- [ ] **[ANALYSIS]** 아이콘 셋
  - lucide-react 설치 필요 여부 확인

---

## 5.2 RED Phase: 검증 체크리스트 + 실패 테스트

- [ ] **[RED]** 검증 체크리스트
  ```
  TEST-P5.1: SolutionSection이 3개 축 카드 렌더
  TEST-P5.2: FeaturesSection이 9개 FeatureCard 렌더
  TEST-P5.3: FeaturesSection의 8번 카드(스크립트)가 status="wip" 배지
  TEST-P5.4: FeaturesSection의 9번 카드(Floating Helper)가 status="planned" 배지
  TEST-P5.5: FeaturesSection의 1~7번 카드가 모두 status="done" 배지
  TEST-P5.6: ko/en locale에 solution.*, features.* 키 동기화
  TEST-P5.7: FeaturesSection의 id="features" (Hero secondary CTA 앵커 대상)
  ```

- [ ] **[RED]** SolutionSection 테스트
  - 파일: `src/components/sections/SolutionSection.test.tsx`
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { SolutionSection } from './SolutionSection';
  import '../../i18n';

  describe('SolutionSection', () => {
    it('renders 3 solution axis cards', () => {
      render(<SolutionSection />);
      const cards = screen.getAllByRole('article');
      expect(cards.length).toBe(3);
    });
  });
  ```

- [ ] **[RED]** FeaturesSection 테스트
  - 파일: `src/components/sections/FeaturesSection.test.tsx`
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { FeaturesSection } from './FeaturesSection';
  import '../../i18n';

  describe('FeaturesSection', () => {
    it('renders 9 feature cards', () => {
      render(<FeaturesSection />);
      const cards = screen.getAllByRole('article');
      expect(cards.length).toBe(9);
    });
    it('has anchor id="features"', () => {
      const { container } = render(<FeaturesSection />);
      expect(container.querySelector('#features')).toBeInTheDocument();
    });
    it('shows wip badge for script feature', () => {
      render(<FeaturesSection />);
      expect(screen.getAllByText(/보강 중|WIP/i).length).toBeGreaterThanOrEqual(1);
    });
    it('shows planned badge for floating helper', () => {
      render(<FeaturesSection />);
      expect(screen.getAllByText(/계획|Planned/i).length).toBeGreaterThanOrEqual(1);
    });
  });
  ```

- [ ] **[RED-VERIFY]** FAIL 확인
  ```bash
  npm run test
  ```

---

## 5.3 GREEN Phase: 최소 코드 구현

- [ ] **[TASK-001]** lucide-react 설치
  ```bash
  npm install lucide-react
  ```

- [ ] **[TASK-002]** locale 키 추가
  - 파일: `src/i18n/locales/ko.json`
  ```json
  "solution": {
    "title": "이렇게 해결합니다",
    "axes": {
      "context": {
        "title": "페이지 문맥 기반 AI",
        "desc": "현재 페이지, 선택 텍스트, 입력 필드, 스크린샷, 페이지 구조까지 함께 다룹니다.",
        "example": "예: 기사 요약, 입력 필드 분석 후 자동입력"
      },
      "action": {
        "title": "브라우저 액션 자동화",
        "desc": "자연어 요청을 실제 브라우저 동작으로 옮깁니다.",
        "example": "예: 탭 그룹 정리, 폼 입력, 댓글 추출"
      },
      "script": {
        "title": "스크립트 기반 확장성",
        "desc": "실행한 작업을 추적하고, 영구 스크립트로 발전시킵니다.",
        "example": "예: 사이트 다크모드, 광고 영역 숨김"
      }
    }
  },
  "features": {
    "title": "주요 기능",
    "status": { "done": "구현됨", "wip": "보강 중", "planned": "계획·검토 중" },
    "items": {
      "chat":     { "title": "AI 채팅",            "desc": "사이드 패널 기반 페이지 문맥 채팅", "example": "스트리밍 응답" },
      "helper":   { "title": "페이지 도우미",       "desc": "현재 페이지 요약, 입력 필드 분석",  "example": "보조 작성" },
      "select":   { "title": "텍스트 선택 기반",    "desc": "우클릭으로 선택 문장 처리",          "example": "번역, 설명, 가공" },
      "autofill": { "title": "문서·폼 자동입력",    "desc": "그룹웨어 문서/요청서 작성 보조",     "example": "Inwork 작성" },
      "action":   { "title": "Action Tools",        "desc": "GOTO·CLICK·FILL·EXTRACT 등",         "example": "탭 정리·기록 검색" },
      "image":    { "title": "이미지·스크린샷",     "desc": "드래그앤드롭 + 캡처 후 질문",        "example": "Vision 분석" },
      "improve":  { "title": "텍스트 개선",         "desc": "입력 필드에서 직접 다듬기",          "example": "초안 보정" },
      "script":   { "title": "스크립트 실행·등록",  "desc": "EXECUTE/REGISTER + 세션 추적",       "example": "다크모드 적용" },
      "floating": { "title": "Floating Helper",     "desc": "선택 직후 옆에 뜨는 빠른 진입",      "example": "번역·요약" }
    }
  }
  ```
  - 파일: `src/i18n/locales/en.json` — 동일 키 영문

- [ ] **[TASK-003]** SolutionSection 컴포넌트
  - 파일: `src/components/sections/SolutionSection.tsx`
  - `Section background="canvas"` 사용
  - H2 + 3개 큰 카드 (icon + title + desc + example)
  - lucide-react 아이콘: `BookOpen`, `MousePointerClick`, `Code2`
  - 각 카드는 `<article>`

- [ ] **[TASK-004]** FeaturesSection 컴포넌트
  - 파일: `src/components/sections/FeaturesSection.tsx`
  - `Section id="features" background="surface"` (Hero secondary CTA 앵커 대상)
  - H2 + 9개 FeatureCard (3×3 grid)
  - 카드 데이터를 배열로 정의:
    ```ts
    const items = [
      { key: 'chat',     status: 'done',    icon: <MessageSquare /> },
      { key: 'helper',   status: 'done',    icon: <FileText /> },
      { key: 'select',   status: 'done',    icon: <TextCursor /> },
      { key: 'autofill', status: 'done',    icon: <Edit3 /> },
      { key: 'action',   status: 'done',    icon: <Zap /> },
      { key: 'image',    status: 'done',    icon: <Image /> },
      { key: 'improve',  status: 'done',    icon: <Wand2 /> },
      { key: 'script',   status: 'wip',     icon: <Terminal /> },
      { key: 'floating', status: 'planned', icon: <Sparkles /> },
    ] as const;
    ```

- [ ] **[TASK-005]** App.tsx 두 섹션 추가
  - 순서: Header → Hero → Problem → **Solution → Features** → (이후 섹션 자리) → Footer

- [ ] **[GREEN-VERIFY]** 검증
  ```bash
  npm run test && npm run typecheck && npm run build
  npm run dev   # 시각 확인
  ```

---

## 5.4 REFACTOR Phase: 코드 개선

### 5.4.1 구조 개선

- [ ] **[REFACTOR-STRUCTURE]** 기능 카드 데이터 외부화 검토
  - `src/lib/featureCatalog.ts`로 분리할지 결정
  - 향후 다른 섹션(예: Roadmap)도 동일 패턴이면 분리, 아니면 컴포넌트 내부 유지

- [ ] **[REFACTOR-STRUCTURE]** Solution / Features 카드 그리드 클래스 정리
  - 반복되는 grid 클래스를 Tailwind `@apply` 또는 변수로 통일

- [ ] **[REFACTOR-STRUCTURE]** statusLabel 처리
  - FeatureCard에 statusLabel을 매번 prop으로 넘기지 말고 i18n에서 자동 매핑하는 헬퍼 검토

- [ ] **[REFACTOR-VERIFY]** 테스트 재확인
  ```bash
  npm run test && npm run typecheck
  ```

### 5.4.2 빌드 품질 점검

- [ ] **[REFACTOR-PERF-MEASURE]** 번들 크기 변화
  - lucide-react는 tree-shaken되어 사용한 아이콘만 포함되어야 함 → import 방식 확인 (`import { Foo } from 'lucide-react'` 권장)
  - 측정 대비 +30KB 이하 목표

- [ ] **[REFACTOR-PERF-ANALYZE]** import 패턴 점검
  - 잘못된 패턴: `import * as Icons from 'lucide-react'` 금지

---

## 5.5 사후 작업

- [ ] **[VERIFY]** 전체 검증
  ```bash
  npm run typecheck && npm run test && npm run build
  ```

- [ ] **[VERIFY]** 시각/기능 회귀 확인
  - SolutionSection 3개 카드 가독성
  - FeaturesSection 9개 카드 그리드 (데스크톱 3×3, 태블릿 2×?, 모바일 1×9)
  - 8번 카드(스크립트) `보강 중` 노란색 배지
  - 9번 카드(Floating Helper) `계획·검토 중` 회색 배지
  - Hero Secondary CTA 클릭 → `#features` 위치로 스크롤
  - 한↔영 전환 시 모든 카드 텍스트 변경

- [ ] **[DOC]** 작업 결과서 작성
  - 파일: `working_history/v1.0/Phase5_SolutionFeatures_2026MMDD.md`

- [ ] **[COMMIT]** 커밋
  ```bash
  git add extapp_landing/src
  git commit -m "[P5] SolutionSection + FeaturesSection (9개 카드 + 상태 배지)"
  ```

---

## Phase 5 완료 조건 (Definition of Done)

- [ ] SolutionSection 3개 축 카드 렌더
- [ ] FeaturesSection 9개 FeatureCard 렌더
- [ ] 9개 카드 상태 배지 정확 (done×7, wip×1, planned×1)
- [ ] FeaturesSection의 id="features" 앵커 동작
- [ ] solution.*, features.* 키 ko/en 동기화
- [ ] 언어 전환 정상
- [ ] 단위 테스트 PASS
- [ ] `npm run build` 통과
- [ ] lucide-react tree-shaking 동작 (번들 폭발 없음)
- [ ] 작업 결과서 작성 및 커밋 완료
