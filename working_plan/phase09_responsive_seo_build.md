# Phase 9: 반응형 / a11y / SEO / 프로덕션 빌드 검증

> **목표**: 본문 **11개 섹션** *(v2: BusinessSection 포함)*이 완성된 상태에서 모바일/태블릿/데스크톱 반응형 완성도, 접근성, SEO 메타, 프로덕션 빌드 품질을 확정한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일 (Lighthouse 보정 시 +0.5일)
> **E2E 확인 단위**: `npm run build && npm run preview`로 빌드 산출물이 정상 서빙되며, 3개 브레이크포인트에서 깨짐 없이 노출되고 Lighthouse Performance/Accessibility 모두 90 이상.

---

## 9.1 사전 작업

- [ ] **[REVIEW]** 이전 Phase 결과서 검토
  - 파일: `working_history/v1.0/Phase8_RoadmapBusinessFinalCta_*.md` *(v2)*
  - 확인: **11개 섹션** 본문 완성 마일스톤, 베이스라인 번들 크기 기록

- [ ] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 8장 Phase 4 (반응형 검증)
  - 1차 배포 전 마지막 품질 게이트
  - Vercel 배포(P10) 전 안정화

- [ ] **[ANALYSIS]** 현재 상태 점검
  - `npm run build` 산출물 크기
  - `npm run preview`로 프로덕션 모드 확인
  - 모바일 시뮬레이션(DevTools)에서 시각 점검

---

## 9.2 RED Phase: 검증 체크리스트 + 실패 테스트

- [ ] **[RED]** 검증 체크리스트
  ```
  TEST-P9.1: 모바일(360px) 폭에서 모든 섹션 가로 스크롤 없음
  TEST-P9.2: 태블릿(768px) 폭에서 카드 그리드 깨짐 없음
  TEST-P9.3: 데스크톱(1280px) 폭에서 max-w-content 적용
  TEST-P9.4: index.html에 lang, title, description, OG 메타 존재
  TEST-P9.5: 모든 이미지에 alt 속성 존재
  TEST-P9.6: Hero H1, 모든 Section H2가 의미적 heading 레벨
  TEST-P9.7: 외부 링크에 rel="noopener noreferrer"
  TEST-P9.8: Lighthouse Performance ≥ 90
  TEST-P9.9: Lighthouse Accessibility ≥ 95
  TEST-P9.10: LCP < 2.5s (모바일 시뮬레이션)
  TEST-P9.11: CLS < 0.1
  ```

- [ ] **[RED]** 메타 태그 테스트
  - 파일: `src/__tests__/meta.test.ts`
  ```ts
  import { readFileSync } from 'fs';
  import { resolve } from 'path';

  describe('index.html meta tags', () => {
    const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf-8');
    it('has lang attribute', () => {
      expect(html).toMatch(/<html[^>]*lang=/);
    });
    it('has title tag with product name', () => {
      expect(html).toMatch(/<title>[^<]*Web AI Assistant[^<]*<\/title>/);
    });
    it('has meta description', () => {
      expect(html).toMatch(/<meta\s+name="description"/);
    });
    it('has OG tags', () => {
      expect(html).toMatch(/<meta\s+property="og:title"/);
      expect(html).toMatch(/<meta\s+property="og:description"/);
    });
  });
  ```

- [ ] **[RED]** 외부 링크 안전성 테스트
  - 파일: `src/__tests__/external-links.test.tsx`
  - 모든 `target="_blank"` 링크가 `rel="noopener noreferrer"`를 갖는지 검사

- [ ] **[RED]** alt 속성 테스트
  - 파일: `src/__tests__/image-alt.test.tsx`
  - App 전체 렌더 후 모든 `<img>`가 alt 속성을 갖는지 검사

- [ ] **[RED-VERIFY]** FAIL 확인
  ```bash
  npm run test
  ```

---

## 9.3 GREEN Phase: 최소 코드 구현

- [ ] **[TASK-001]** index.html 메타 보강
  - 파일: `extapp_landing/index.html`
  ```html
  <!doctype html>
  <html lang="ko">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Web AI Assistant — 웹페이지 문맥 기반 AI 코파일럿</title>
      <meta name="description" content="웹페이지를 이해하고, 질문하고, 자동화하는 Chrome 확장앱. OpenAI · Gemini · LM Studio · Didim 지원." />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Web AI Assistant — AI Copilot for the Browser" />
      <meta property="og:description" content="페이지 문맥을 읽고 필요할 때 직접 브라우저를 조작하는 AI 코파일럿." />
      <meta property="og:image" content="/images/og.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.tsx"></script>
    </body>
  </html>
  ```
  - placeholder OG 이미지: `public/images/og.png` (1200×630, 1차엔 단색 + 텍스트)

- [ ] **[TASK-002]** 각 섹션의 placeholder 이미지에 alt 속성 보강
  - HeroSection, ScenariosSection 등 모든 `<img>` 점검
  - 의미 있는 alt 작성 (또는 장식용 이미지는 `alt=""`)

- [ ] **[TASK-003]** 외부 링크 rel 속성 점검
  - `Button` 컴포넌트의 `external` prop이 적용되는 모든 호출처 확인
  - Header CTA, Hero Primary CTA, Final CTA 모두 `external` 명시
  - **BusinessSection Primary CTA는 `mailto:` 이므로 `external` 대신 `rel="noopener"` 만 (새 탭 필요 없음)** *(v2)*

- [ ] **[TASK-004]** 반응형 점검 후 깨진 곳 보정
  - 모바일에서 가로 스크롤 발생하는 섹션 식별
  - 그리드 컬럼을 `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` 패턴으로 통일
  - 긴 문장 줄바꿈 처리 (`break-keep`, `whitespace-normal`)

- [ ] **[TASK-005]** Heading 레벨 점검
  - Hero H1만 1개, 나머지 섹션은 모두 H2
  - 카드 내부는 H3
  - DevTools Accessibility tab으로 검증

- [ ] **[TASK-006]** sitemap.xml / robots.txt (선택)
  - 1차 배포 도메인이 없으면 생략 또는 placeholder
  - 결과서에 결정 사항 기록

- [ ] **[GREEN-VERIFY]** 검증
  ```bash
  npm run test          # 새 메타/링크/alt 테스트 PASS
  npm run typecheck
  npm run build
  npm run preview       # http://localhost:4173 시각 확인
  ```

---

## 9.4 REFACTOR Phase: 코드 개선 + 빌드 최적화

### 9.4.1 구조 개선 (Make it right)

- [ ] **[REFACTOR-STRUCTURE]** 반응형 클래스 일관화
  - 그리드 패턴, 패딩 패턴이 섹션 간 일관되도록 정리
  - Section 컴포넌트의 padding을 단일 출처로 관리

- [ ] **[REFACTOR-STRUCTURE]** Tailwind 임의 값(`[...]`) 최소화
  - 가능하면 토큰으로 대체

- [ ] **[REFACTOR-VERIFY]** 테스트 재확인
  ```bash
  npm run test && npm run typecheck
  ```

### 9.4.2 빌드 최적화 (Make it fast)

- [ ] **[REFACTOR-PERF-MEASURE]** 최종 번들 크기 측정
  | 파일 | P8 베이스라인 *(11 섹션 완성)* | P9 최종 | 변화 |
  |------|-----------|---------|------|
  | dist/assets/index-*.js | [P8 값] | [측정] | [Δ] |
  | dist/assets/index-*.css | [P8 값] | [측정] | [Δ] |
  | dist/index.html | — | [측정] | — |
  | **gzip 합계** | — | [측정] | — |

- [ ] **[REFACTOR-PERF-ANALYZE]** 빌드 품질 체크리스트
  | 항목 | 확인 방법 | 기대 | 적용 |
  |------|----------|------|------|
  | tsc strict 통과 | `npm run typecheck` | 0 errors | ⬜ |
  | 빌드 성공 | `npm run build` | exit 0 | ⬜ |
  | preview 응답 | `npm run preview` | http 200 | ⬜ |
  | JS gzip 크기 | bundle analysis | <150KB | ⬜ |
  | CSS gzip 크기 | bundle analysis | <30KB | ⬜ |
  | sourcemap 노출 | `ls dist/assets/*.map` | 1차엔 허용/제외 결정 | ⬜ |
  | 미사용 lucide 아이콘 미포함 | `grep -c "Heart" dist/assets/*.js` | 0 (사용 안 한 것) | ⬜ |

- [ ] **[REFACTOR-PERF-LIGHTHOUSE]** Lighthouse 측정
  - Chrome DevTools → Lighthouse → Mobile + Performance/Accessibility/Best Practices/SEO
  - 결과 기록:
    | 항목 | 점수 | 목표 | 통과 |
    |------|------|------|------|
    | Performance | [측정] | ≥90 | ⬜ |
    | Accessibility | [측정] | ≥95 | ⬜ |
    | Best Practices | [측정] | ≥90 | ⬜ |
    | SEO | [측정] | ≥90 | ⬜ |
    | LCP | [측정] | <2.5s | ⬜ |
    | CLS | [측정] | <0.1 | ⬜ |

- [ ] **[REFACTOR-PERF-VERIFY]** 최적화 후 테스트 + 빌드 재확인
  ```bash
  npm run test && npm run typecheck && npm run build
  ```

---

## 9.5 사후 작업

- [ ] **[VERIFY]** 전체 검증 (preview 모드)
  ```bash
  npm run typecheck
  npm run test
  npm run build
  npm run preview
  ```

- [ ] **[VERIFY]** 3개 브레이크포인트 시각 회귀 (수동 필수)
  - **모바일**: Chrome DevTools Device Toolbar → iPhone SE (375×667)
  - **태블릿**: iPad (768×1024)
  - **데스크톱**: 1280×800, 1920×1080
  - 각 폭에서 **11개 섹션** 모두 스크롤하며 확인 (BusinessSection의 3카드 그리드 반응형 특별 확인)

- [ ] **[VERIFY]** 키보드 접근성 (수동)
  - Tab 키만으로 Header → 모든 CTA → Footer 순회 가능
  - Focus ring이 시각적으로 보임

- [ ] **[DOC]** 작업 결과서 작성
  - 파일: `working_history/v1.0/Phase9_ResponsiveSeoBuild_2026MMDD.md`
  - 포함: Lighthouse 점수 캡처, 번들 크기 베이스라인 vs 최종, 미해결 이슈

- [ ] **[COMMIT]** 커밋
  ```bash
  git add extapp_landing
  git commit -m "[P9] 반응형/a11y/SEO 메타/프로덕션 빌드 검증"
  ```

---

## Phase 9 완료 조건 (Definition of Done)

- [ ] index.html 메타 태그(title/description/OG) 완성
- [ ] 모든 이미지에 alt 속성
- [ ] 모든 외부 링크에 rel="noopener noreferrer"
- [ ] Heading 레벨 의미적 정리 (H1×1, H2×섹션, H3×카드)
- [ ] 3개 브레이크포인트(360/768/1280) 시각 회귀 통과
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] LCP < 2.5s, CLS < 0.1
- [ ] `npm run build && npm run preview` 정상
- [ ] 메타/링크/alt 단위 테스트 PASS
- [ ] 작업 결과서(Lighthouse 결과 포함) 작성 및 커밋 완료
