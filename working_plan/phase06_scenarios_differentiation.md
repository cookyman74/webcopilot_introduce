# Phase 6: Scenarios + Differentiation 섹션

> **목표**: 4개 사용 시나리오(ScenariosSection)와 3개 차별화 비교 카드(DifferentiationSection)를 구현한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일
> **E2E 확인 단위**: 시나리오 4개와 비교 카드 3개가 시각적으로 노출되며 한/영 토글이 정상 동작한다.

---

## 6.1 사전 작업

- [ ] **[REVIEW]** 이전 Phase 결과서 검토
  - 파일: `working_history/v1.0/Phase5_SolutionFeatures_*.md`
  - 확인: 9개 카드 + 상태 배지 정상, 번들 크기 폭발 없음

- [ ] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 5.5, 5.6 (ScenariosSection / DifferentiationSection 스펙)
  - extension_intro.md 9장(대표 사용 예시), 6장(차별화 포인트) 표현 참조

- [ ] **[ANALYSIS]** 시나리오 4개 확정
  1. 기사 문장 선택 → 번역/질문
  2. 그룹웨어 문서 작성 보조
  3. 탭 정리 및 페이지 탐색 자동화
  4. 사이트 다크모드/광고 숨김

- [ ] **[ANALYSIS]** 차별화 비교 3쌍 확정
  - 답변형 AI vs 행동형 AI
  - 단발성 자동화 vs 재사용 가능한 자산
  - 텍스트 중심 vs 페이지/필드/스크립트까지

---

## 6.2 RED Phase: 검증 체크리스트 + 실패 테스트

- [ ] **[RED]** 검증 체크리스트
  ```
  TEST-P6.1: ScenariosSection이 4개 시나리오 카드 렌더
  TEST-P6.2: ScenariosSection의 id="scenarios" (Header 네비 앵커 대상)
  TEST-P6.3: DifferentiationSection이 3개 비교 카드 렌더
  TEST-P6.4: DifferentiationSection의 id="differentiation"
  TEST-P6.5: 각 비교 카드에 "before"와 "after" 두 영역이 모두 존재
  TEST-P6.6: ko/en locale에 scenarios.*, differentiation.* 키 동기화
  ```

- [ ] **[RED]** ScenariosSection 테스트
  - 파일: `src/components/sections/ScenariosSection.test.tsx`
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { ScenariosSection } from './ScenariosSection';
  import '../../i18n';

  describe('ScenariosSection', () => {
    it('renders 4 scenario cards', () => {
      render(<ScenariosSection />);
      expect(screen.getAllByRole('article').length).toBe(4);
    });
    it('has anchor id="scenarios"', () => {
      const { container } = render(<ScenariosSection />);
      expect(container.querySelector('#scenarios')).toBeInTheDocument();
    });
  });
  ```

- [ ] **[RED]** DifferentiationSection 테스트
  - 파일: `src/components/sections/DifferentiationSection.test.tsx`
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { DifferentiationSection } from './DifferentiationSection';
  import '../../i18n';

  describe('DifferentiationSection', () => {
    it('renders 3 comparison cards', () => {
      render(<DifferentiationSection />);
      expect(screen.getAllByRole('article').length).toBe(3);
    });
  });
  ```

- [ ] **[RED-VERIFY]** FAIL 확인
  ```bash
  npm run test
  ```

---

## 6.3 GREEN Phase: 최소 코드 구현

- [ ] **[TASK-001]** locale 키 추가
  - 파일: `src/i18n/locales/ko.json`
  ```json
  "scenarios": {
    "title": "이렇게 사용합니다",
    "items": {
      "s1": { "title": "기사 문장 선택 → 번역·질문", "desc": "드래그 한 번으로 즉시 번역하고 후속 질문을 이어갑니다.", "step": "Step 1" },
      "s2": { "title": "그룹웨어 문서 작성 보조", "desc": "양식을 분석해 보조 입력하고 사용자가 최종 검토합니다.", "step": "Step 2" },
      "s3": { "title": "탭 정리·페이지 탐색 자동화", "desc": "열린 탭을 주제별로 정리하고 방문 기록을 검색합니다.", "step": "Step 3" },
      "s4": { "title": "사이트 다크모드·광고 숨김", "desc": "한 번 만든 스크립트를 다음 방문에도 재사용합니다.", "step": "Step 4" }
    }
  },
  "differentiation": {
    "title": "다른 점은 무엇인가요?",
    "items": {
      "d1": { "before": "답변형 AI", "after": "행동형 AI", "desc": "질문에 답하는 데서 멈추지 않고 직접 브라우저를 조작합니다." },
      "d2": { "before": "단발성 자동화", "after": "재사용 가능한 자산", "desc": "한 번 한 작업을 영구 스크립트로 발전시킬 수 있습니다." },
      "d3": { "before": "텍스트 중심 AI", "after": "페이지·필드·스크립트까지", "desc": "페이지 구조와 입력 필드, 탭, 스크립트를 함께 다룹니다." }
    }
  }
  ```
  - 파일: `src/i18n/locales/en.json` — 동일 키 영문

- [ ] **[TASK-002]** ScenariosSection 컴포넌트
  - 파일: `src/components/sections/ScenariosSection.tsx`
  - `Section id="scenarios" background="canvas"`
  - H2 + 4개 카드 (1×4 가로 또는 2×2 그리드)
  - 각 카드에 step 라벨 + 제목 + 설명 + placeholder 이미지 영역
  - 각 카드는 `<article>`

- [ ] **[TASK-003]** DifferentiationSection 컴포넌트
  - 파일: `src/components/sections/DifferentiationSection.tsx`
  - `Section id="differentiation" background="surface-alt"`
  - H2 + 3개 비교 카드
  - 각 카드 내부 좌우 분할: `before` (회색 톤) → 화살표 → `after` (액센트 톤)
  - 그 아래 1줄 설명
  - 각 카드는 `<article>`

- [ ] **[TASK-004]** App.tsx 두 섹션 추가
  - 순서: ... → Features → **Scenarios → Differentiation** → (다음 자리) → Footer

- [ ] **[GREEN-VERIFY]** 검증
  ```bash
  npm run test && npm run typecheck && npm run build
  npm run dev   # 시각 확인
  ```

---

## 6.4 REFACTOR Phase: 코드 개선

### 6.4.1 구조 개선

- [ ] **[REFACTOR-STRUCTURE]** 시나리오 카드 데이터화
  - `['s1','s2','s3','s4'].map()` 패턴

- [ ] **[REFACTOR-STRUCTURE]** 비교 카드 컴포넌트 분리 검토
  - 3개 카드가 동일 구조라면 `ComparisonCard` 내부 컴포넌트로 추출

- [ ] **[REFACTOR-STRUCTURE]** 화살표 아이콘 일관성
  - lucide의 `ArrowRight` 또는 텍스트 화살표 통일

- [ ] **[REFACTOR-VERIFY]** 테스트 재확인
  ```bash
  npm run test && npm run typecheck
  ```

### 6.4.2 빌드 품질 점검

- [ ] **[REFACTOR-PERF-MEASURE]** 번들 크기 변화
- [ ] **[REFACTOR-PERF-ANALYZE]** 텍스트 콘텐츠 비중이 큰 섹션이므로 JS 증가는 미미해야 함

---

## 6.5 사후 작업

- [ ] **[VERIFY]** 전체 검증
  ```bash
  npm run typecheck && npm run test && npm run build
  ```

- [ ] **[VERIFY]** 시각/기능 회귀 확인
  - 4개 시나리오 카드 가독성 (모바일에서도 step 라벨이 잘림 없이 보임)
  - 3개 비교 카드 before/after 시각 대비 명확 (회색 → 액센트)
  - Header 네비 "시나리오"/"차별점" 클릭 → 해당 섹션으로 스크롤
  - 한↔영 전환 정상

- [ ] **[DOC]** 작업 결과서 작성
  - 파일: `working_history/v1.0/Phase6_ScenariosDiff_2026MMDD.md`

- [ ] **[COMMIT]** 커밋
  ```bash
  git add extapp_landing/src
  git commit -m "[P6] ScenariosSection + DifferentiationSection"
  ```

---

## Phase 6 완료 조건 (Definition of Done)

- [ ] ScenariosSection 4개 카드 + id="scenarios"
- [ ] DifferentiationSection 3개 비교 카드 + id="differentiation"
- [ ] before/after 시각 대비 명확
- [ ] scenarios.*, differentiation.* 키 ko/en 동기화
- [ ] Header 네비 앵커 동작
- [ ] 단위 테스트 PASS
- [ ] `npm run build` 통과
- [ ] 작업 결과서 작성 및 커밋 완료
