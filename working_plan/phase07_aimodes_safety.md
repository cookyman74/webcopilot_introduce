# Phase 7: AI Modes + Safety 섹션

> **목표**: 지원 AI 모드 4종 + 검토 중 1종(AIModesSection)과 4개 안전·운영 원칙(SafetySection)을 구현한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일
> **E2E 확인 단위**: AI 모드 배지가 지원/검토 중으로 명확히 구분되고, 안전 원칙 4개가 신뢰감 있는 톤으로 노출된다.

---

## 7.1 사전 작업

- [ ] **[REVIEW]** 이전 Phase 결과서 검토
  - 파일: `working_history/v1.0/Phase6_ScenariosDiff_*.md`

- [ ] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 5.7, 5.8 (AIModes / Safety 스펙)
  - extension_intro.md 4장(지원 AI 제공 방식), 7장(안전 및 운영 원칙)
  - **주의**: 안전 섹션 톤은 과장 금지 — "보수적으로 처리" / "사용자 확인 중심" 문구 유지

- [ ] **[ANALYSIS]** 지원 AI 모드 5종 매핑
  | # | 모드 | 상태 | 비고 |
  |---|------|------|------|
  | 1 | OpenAI | done | 클라우드 |
  | 2 | Gemini | done | 클라우드 |
  | 3 | LM Studio | done | 로컬 |
  | 4 | Didim | done | — |
  | 5 | Ollama | planned | 검토 중 |

- [ ] **[ANALYSIS]** 안전 원칙 4개
  1. 위험 작업은 승인 기반 제어
  2. 명시적 영구 스크립트 등록
  3. 추적 가능한 세션 스크립트
  4. 민감 사이트 보수적 처리

---

## 7.2 RED Phase: 검증 체크리스트 + 실패 테스트

- [ ] **[RED]** 검증 체크리스트
  ```
  TEST-P7.1: AIModesSection이 5개 모드 항목 렌더 (4 done + 1 planned)
  TEST-P7.2: AIModesSection의 Ollama 항목이 status="planned" 배지
  TEST-P7.3: SafetySection이 4개 원칙 카드 렌더
  TEST-P7.4: SafetySection의 문구에 과장 표현(예: "완전 자동", "100% 안전") 미포함
  TEST-P7.5: ko/en locale에 aiModes.*, safety.* 키 동기화
  ```

- [ ] **[RED]** AIModesSection 테스트
  - 파일: `src/components/sections/AIModesSection.test.tsx`
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { AIModesSection } from './AIModesSection';
  import '../../i18n';

  describe('AIModesSection', () => {
    it('renders 5 AI mode items', () => {
      render(<AIModesSection />);
      expect(screen.getAllByRole('listitem').length).toBe(5);
    });
    it('shows planned badge for Ollama', () => {
      render(<AIModesSection />);
      const ollamaItem = screen.getByText(/Ollama/i).closest('li');
      expect(ollamaItem?.textContent).toMatch(/계획|검토|Planned/i);
    });
  });
  ```

- [ ] **[RED]** SafetySection 테스트
  - 파일: `src/components/sections/SafetySection.test.tsx`
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { SafetySection } from './SafetySection';
  import '../../i18n';

  describe('SafetySection', () => {
    it('renders 4 safety principle cards', () => {
      render(<SafetySection />);
      expect(screen.getAllByRole('article').length).toBe(4);
    });
    it('does not contain overstated wording', () => {
      const { container } = render(<SafetySection />);
      const text = container.textContent ?? '';
      expect(text).not.toMatch(/100%|완전 자동/);
    });
  });
  ```

- [ ] **[RED-VERIFY]** FAIL 확인
  ```bash
  npm run test
  ```

---

## 7.3 GREEN Phase: 최소 코드 구현

- [ ] **[TASK-001]** locale 키 추가
  - 파일: `src/i18n/locales/ko.json`
  ```json
  "aiModes": {
    "title": "지원 AI 모드",
    "subtitle": "로컬 AI와 클라우드 AI를 상황에 맞게 선택할 수 있습니다.",
    "status": { "supported": "지원됨", "reviewing": "검토 중" },
    "items": {
      "openai":   { "name": "OpenAI",    "type": "클라우드", "status": "done" },
      "gemini":   { "name": "Gemini",    "type": "클라우드", "status": "done" },
      "lmstudio": { "name": "LM Studio", "type": "로컬",    "status": "done" },
      "didim":    { "name": "Didim",     "type": "—",       "status": "done" },
      "ollama":   { "name": "Ollama",    "type": "로컬",    "status": "planned" }
    }
  },
  "safety": {
    "title": "안전 및 운영 원칙",
    "subtitle": "브라우저 자동화의 경계를 분명히 합니다.",
    "items": {
      "approval": { "title": "승인 기반 위험 작업 제어",   "desc": "위험한 작업은 사용자 승인을 거칩니다." },
      "register": { "title": "명시적 영구 스크립트 등록", "desc": "영구 스크립트는 명시적 등록 흐름으로 관리합니다." },
      "session":  { "title": "추적 가능한 세션 스크립트", "desc": "세션 스크립트는 조회·되돌리기가 가능합니다." },
      "sensitive":{ "title": "민감 사이트 보수적 처리",   "desc": "정부/금융/제출 단계는 보조 입력 + 사용자 확인 중심입니다." }
    }
  }
  ```
  - 파일: `src/i18n/locales/en.json` — 동일 키 영문

- [ ] **[TASK-002]** AIModesSection 컴포넌트
  - 파일: `src/components/sections/AIModesSection.tsx`
  - `Section background="canvas"`
  - H2 + subtitle + `<ul>` 내 `<li>` 5개 (각 항목 = 이름 + type + 상태 배지)
  - 1차엔 로고 없이 텍스트만, 추후 placeholder 로고 자리만 점선 박스로 표시
  - Ollama 항목은 `<Badge status="planned">` 명시

- [ ] **[TASK-003]** SafetySection 컴포넌트
  - 파일: `src/components/sections/SafetySection.tsx`
  - `Section background="surface"`
  - H2 + subtitle + 4개 카드 (2×2 grid)
  - 각 카드는 `<article>`
  - lucide 아이콘 활용: `ShieldCheck`, `FileCheck2`, `History`, `Lock`

- [ ] **[TASK-004]** App.tsx 두 섹션 추가
  - 순서: ... → Differentiation → **AIModes → Safety** → (다음 자리) → Footer

- [ ] **[GREEN-VERIFY]** 검증
  ```bash
  npm run test && npm run typecheck && npm run build
  npm run dev   # 시각 확인
  ```

---

## 7.4 REFACTOR Phase: 코드 개선

### 7.4.1 구조 개선

- [ ] **[REFACTOR-STRUCTURE]** AI 모드 데이터 분리
  - 5개 모드를 컴포넌트 내 `const items = [...]`로 정리

- [ ] **[REFACTOR-STRUCTURE]** 안전 원칙 데이터 분리
  - 4개 원칙도 동일 패턴

- [ ] **[REFACTOR-STRUCTURE]** Badge 사용 일관성
  - AIModes의 "지원됨/검토 중"이 Features의 "구현됨/계획·검토 중"과 의미가 겹치지 않는지 검토 → 분리하거나 통합

- [ ] **[REFACTOR-VERIFY]** 테스트 재확인
  ```bash
  npm run test && npm run typecheck
  ```

### 7.4.2 빌드 품질 점검

- [ ] **[REFACTOR-PERF-MEASURE]** 번들 크기 변화 (텍스트 위주이므로 미미)

---

## 7.5 사후 작업

- [ ] **[VERIFY]** 전체 검증
  ```bash
  npm run typecheck && npm run test && npm run build
  ```

- [ ] **[VERIFY]** 시각/문구 회귀 확인
  - 5개 AI 모드 명확히 노출
  - Ollama만 회색 배지(검토 중)
  - 4개 안전 원칙 카드 가독성
  - **문구 검토**: 과장 표현 금지 항목 다시 한번 시각 확인
  - 한↔영 전환 정상

- [ ] **[DOC]** 작업 결과서 작성
  - 파일: `working_history/v1.0/Phase7_AIModesSafety_2026MMDD.md`

- [ ] **[COMMIT]** 커밋
  ```bash
  git add extapp_landing/src
  git commit -m "[P7] AIModesSection + SafetySection"
  ```

---

## Phase 7 완료 조건 (Definition of Done)

- [ ] AIModesSection 5개 항목 (4 supported + 1 planned)
- [ ] Ollama 항목 planned 배지 명시
- [ ] SafetySection 4개 원칙 카드
- [ ] 과장 표현 미포함 (테스트로 강제)
- [ ] aiModes.*, safety.* 키 ko/en 동기화
- [ ] 단위 테스트 PASS
- [ ] `npm run build` 통과
- [ ] 작업 결과서 작성 및 커밋 완료
