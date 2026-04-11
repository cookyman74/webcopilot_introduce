# Phase 4: Hero + Problem 섹션

> **목표**: 첫 인상을 결정하는 HeroSection(2컬럼: 카피 + 브라우저 목업)과 ProblemSection(4개 문제 카드)을 구현한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일
> **E2E 확인 단위**: 두 섹션이 화면 상단에 차례로 보이고, 한↔영 토글로 텍스트가 바뀌며, Hero CTA가 Chrome Web Store로 이동한다.

---

## 4.1 사전 작업

- [ ] **[REVIEW]** 이전 Phase 결과서 검토
  - 파일: `working_history/v1.0/Phase3_I18nLayout_*.md`
  - 확인: i18n 동작, Header/Footer 정상, locale 키 구조 일치

- [ ] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 5.1, 5.2 (HeroSection / ProblemSection 스펙)
  - 기획서 5.1, 5.2 (메시지 톤)
  - extension_intro.md 1장(제품 개요), 2장(핵심 가치) 표현 참조

- [ ] **[ANALYSIS]** placeholder 이미지 경로 확인
  - `public/images/hero-mock.png` (Phase 2에서 미생성 시 placeholder.svg 재사용)

---

## 4.2 RED Phase: 검증 체크리스트 + 실패 테스트

- [ ] **[RED]** 검증 체크리스트
  ```
  TEST-P4.1: HeroSection이 H1, eyebrow, subtitle, primary/secondary CTA 렌더
  TEST-P4.2: HeroSection의 primary CTA href가 CHROME_WEB_STORE_URL과 일치
  TEST-P4.3: HeroSection의 secondary CTA href가 '#features' (앵커)
  TEST-P4.4: ProblemSection이 4개 문제 카드 렌더
  TEST-P4.5: ko/en locale에 hero.*, problem.* 키 모두 존재
  TEST-P4.6: 언어 전환 시 Hero H1 텍스트가 변경됨
  ```

- [ ] **[RED]** HeroSection 테스트
  - 파일: `src/components/sections/HeroSection.test.tsx`
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { HeroSection } from './HeroSection';
  import '../../i18n';
  import { CHROME_WEB_STORE_URL } from '../../lib/constants';

  describe('HeroSection', () => {
    it('renders heading and primary CTA pointing to web store', () => {
      render(<HeroSection />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      const cta = screen.getAllByRole('link').find(a =>
        a.getAttribute('href') === CHROME_WEB_STORE_URL
      );
      expect(cta).toBeDefined();
    });
  });
  ```

- [ ] **[RED]** ProblemSection 테스트
  - 파일: `src/components/sections/ProblemSection.test.tsx`
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { ProblemSection } from './ProblemSection';
  import '../../i18n';

  describe('ProblemSection', () => {
    it('renders 4 problem cards', () => {
      render(<ProblemSection />);
      const cards = screen.getAllByRole('article');
      expect(cards.length).toBe(4);
    });
  });
  ```

- [ ] **[RED]** locale 키 동기화 재검증
  - Phase 3 i18n.test.ts가 새로 추가된 hero.*, problem.* 키도 검사하므로 자동 적용

- [ ] **[RED-VERIFY]** 테스트 FAIL 확인
  ```bash
  npm run test
  ```

---

## 4.3 GREEN Phase: 최소 코드 구현

- [ ] **[TASK-001]** locale 키 추가
  - 파일: `src/i18n/locales/ko.json`
  ```json
  "hero": {
    "eyebrow": "Chrome Extension · AI Copilot",
    "title": "웹페이지를 이해하고, 질문하고, 자동화하는 AI 코파일럿",
    "subtitle": "단순한 채팅이 아니라, 페이지 문맥을 읽고 필요할 때 직접 브라우저를 조작하는 브라우저 생산성 도구입니다.",
    "cta_primary": "Chrome에 추가하기",
    "cta_secondary": "기능 살펴보기",
    "trust": "OpenAI · Gemini · LM Studio · Didim 지원"
  },
  "problem": {
    "title": "이런 경험, 한 번쯤 있으셨죠?",
    "items": {
      "p1": { "title": "페이지를 다시 정리해야 함", "desc": "긴 글을 읽고 요약을 또 만들어야 합니다." },
      "p2": { "title": "반복적인 웹 작업", "desc": "같은 양식, 같은 클릭이 매일 반복됩니다." },
      "p3": { "title": "AI는 답변만, 실행은 사용자", "desc": "결국 마지막 작업은 직접 해야 합니다." },
      "p4": { "title": "사이트별 자동화의 코드 장벽", "desc": "스크립트를 직접 짜는 건 부담이 큽니다." }
    }
  }
  ```
  - 파일: `src/i18n/locales/en.json` — 동일 키 영문

- [ ] **[TASK-002]** HeroSection 컴포넌트
  - 파일: `src/components/sections/HeroSection.tsx`
  - 2컬럼 grid (md 이상), 좌측 카피/CTA, 우측 placeholder 이미지
  - `Section background="canvas"` 사용
  - useTranslation 훅으로 텍스트 i18n 적용

- [ ] **[TASK-003]** ProblemSection 컴포넌트
  - 파일: `src/components/sections/ProblemSection.tsx`
  - `Section background="surface"` 사용
  - H2 + 4개 문제 카드 (2×2 grid → md 4×1)
  - 각 카드는 `<article>` (테스트 호환)

- [ ] **[TASK-004]** App.tsx에 두 섹션 추가
  - 순서: Header → HeroSection → ProblemSection → (임시 기존 데모) → Footer

- [ ] **[GREEN-VERIFY]** 검증
  ```bash
  npm run test && npm run typecheck && npm run build
  npm run dev    # 시각 확인
  ```

---

## 4.4 REFACTOR Phase: 코드 개선

### 4.4.1 구조 개선

- [ ] **[REFACTOR-STRUCTURE]** 문제 카드 데이터화
  - ProblemSection 내 4개 카드를 `['p1','p2','p3','p4'].map()` 형태로 정리
  - 향후 추가/수정 용이

- [ ] **[REFACTOR-STRUCTURE]** Hero 이미지 placeholder 컴포넌트화 검토
  - 추후 모든 섹션에서 재사용할 가능성 → `common/Placeholder.tsx`로 분리 검토 (분리하지 않으면 결정 근거 결과서에 기록)

- [ ] **[REFACTOR-VERIFY]** 테스트 재확인

### 4.4.2 빌드 품질 점검

- [ ] **[REFACTOR-PERF-MEASURE]** 번들 크기 변화 측정
  - 두 섹션 추가로 인한 JS/CSS 증가량

- [ ] **[REFACTOR-PERF-ANALYZE]** Lighthouse 간이 측정 (선택)
  - dev 서버 또는 preview에서 LCP 추세 확인

---

## 4.5 사후 작업

- [ ] **[VERIFY]** 전체 검증
  ```bash
  npm run typecheck && npm run test && npm run build
  ```

- [ ] **[VERIFY]** 기능/시각 회귀 확인
  - HeroSection 첫 화면 노출 (스크롤 없이 보임)
  - 한국어 → 영어 전환 시 Hero H1 변경
  - Hero Primary CTA 클릭 → Chrome Web Store 새 탭
  - Hero Secondary CTA 클릭 → 페이지 내 `#features`로 스크롤 (앵커 대상은 P5에서 생기므로 일단 동작만)
  - ProblemSection 4개 카드 가독성 확인 (모바일 폭에서도)

- [ ] **[DOC]** 작업 결과서 작성
  - 파일: `working_history/v1.0/Phase4_HeroProblem_2026MMDD.md`

- [ ] **[COMMIT]** 커밋
  ```bash
  git add extapp_landing/src
  git commit -m "[P4] HeroSection + ProblemSection 구현"
  ```

---

## Phase 4 완료 조건 (Definition of Done)

- [ ] HeroSection 렌더 + Primary/Secondary CTA 동작
- [ ] Primary CTA href = Chrome Web Store URL
- [ ] ProblemSection 4개 카드 렌더
- [ ] hero.*, problem.* 키 ko/en 동기화
- [ ] 언어 전환 시 두 섹션 텍스트 정상 변경
- [ ] 단위 테스트 PASS
- [ ] `npm run build` 통과
- [ ] 모바일/데스크톱 시각 확인 완료
- [ ] 작업 결과서 작성 및 커밋 완료
