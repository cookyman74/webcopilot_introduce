# Phase 9: 반응형 / a11y / SEO / 프로덕션 빌드 검증

> **목표**: 본문 **11개 섹션**이 완성된 상태에서 모바일/태블릿/데스크톱 반응형 완성도, 접근성, SEO 메타, 프로덕션 빌드 품질을 확정한다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 1일 (Lighthouse 보정 시 +0.5일)
> **E2E 확인 단위**: `npm run build && npm run preview`로 빌드 산출물이 정상 서빙되며, 3개 브레이크포인트에서 깨짐 없이 노출되고 Lighthouse Performance/Accessibility 모두 90 이상.

---

## 9.1 사전 작업

- [x] **[REVIEW]** Phase 8 결과서 검토
  - 파일: [`Phase8_RoadmapBusinessFinalCta_20260412.md`](./working_history/v1.0/Phase8_RoadmapBusinessFinalCta_20260412.md) (§7 리뷰 반영 포함)
  - 확인: 11개 섹션 본문 완성 마일스톤, 데모 전부 소멸, accent-soft 복구, PARTNERSHIP_CONTACT/DOCS_URL 상수 도입

- [ ] **[REGRESSION-BASELINE]** Phase 9 진입 전 기준선
  ```bash
  cd extapp_landing
  npm test
  # 기대: Test Files 23 passed (23) · Tests 369 passed | 5 skipped (374)
  npm run build
  # 기대: JS 284.28 KB (gzip 89.82 KB) · CSS 11.91 KB (gzip 3.22 KB)
  ```

- [x] **[CONTEXT]** Phase 9 범위 정의
  Phase 9 는 **새 섹션을 추가하지 않는다.** 기존 11개 섹션의 품질을 확정하는 단계:
  1. `index.html` SEO 메타 보강 (title/description/OG/twitter)
  2. 반응형 깨짐 보정 (3 브레이크포인트)
  3. 접근성 점검 (heading 레벨, 외부 링크 rel, 이미지 alt, 키보드 순회)
  4. Lighthouse 측정 + 최적화
  5. 프로덕션 빌드 `npm run preview` 서빙 확인

- [x] **[CONTEXT]** Phase 8 환경 가정
  - `index.html` 은 `<html lang="en">` 하드코딩 — Phase 3 hotfix 의 `syncHtmlLang` 이 init 시 올바른 lang 으로 override
  - `<title>extapp_landing</title>` — Phase 9 에서 실제 제품명으로 교체
  - meta description / OG tags 없음 — Phase 9 에서 추가
  - `<img>` 는 HeroSection 1개만 (alt i18n 적용 완료)
  - ScenariosSection 의 영상 placeholder 는 `<div>` (img 아님) → alt 불필요
  - 모든 섹션에 aria-labelledby 적용 완료 (Phase 8 리뷰 반영)
  - Button auto external: https:// URL 은 자동 target="_blank" + rel="noopener noreferrer"

- [x] **[CONTEXT]** Phase 9 에서 수정하는 파일 목록
  | 파일 | 변경 |
  |------|------|
  | `index.html` | title/description/OG/twitter meta 추가, `lang="ko"` 기본값 변경 |
  | `public/images/og.png` | OG 이미지 placeholder 생성 (1200×630) |
  | 테스트 파일 (신규) | meta.test.ts · external-links.test.tsx · image-alt.test.tsx |
  | 섹션 컴포넌트 (필요 시) | 반응형 깨짐 보정 |

---

## 9.2 RED Phase: 검증 체크리스트 + 실패 테스트

### 검증 체크리스트

```
TEST-P9.1:  index.html 에 lang 속성 존재
TEST-P9.2:  index.html 에 "Web AI Assistant" 포함 title 존재
TEST-P9.3:  index.html 에 meta description 존재
TEST-P9.4:  index.html 에 og:title · og:description 존재
TEST-P9.5:  App 렌더 후 모든 <img> 에 alt 속성 존재 (빈 문자열 허용 — 장식용)
TEST-P9.6:  App 렌더 후 모든 target="_blank" 링크에 rel="noopener" 포함
TEST-P9.7:  App 렌더 후 H1 1개 + H2 10개 (HeroSection 은 H1 이므로 나머지 10 섹션이 H2)
TEST-P9.8:  Lighthouse Performance ≥ 90 (수동 측정)
TEST-P9.9:  Lighthouse Accessibility ≥ 95 (수동 측정)
```

- [x] **[RED]** meta.test.ts — index.html 메타 태그 검증
- [x] **[RED]** external-links.test.tsx — 외부 링크 rel 속성 검증
- [x] **[RED]** image-alt.test.tsx — 이미지 alt 속성 검증
- [x] **[RED]** heading-structure.test.tsx — heading 레벨 구조 검증
- [x] **[RED-VERIFY]** 테스트 FAIL 확인

---

## 9.3 GREEN Phase: 최소 코드 구현

- [x] **[TASK-001]** index.html SEO 메타 보강
  - `<title>Web AI Assistant — 웹페이지 문맥 기반 AI 코파일럿</title>`
  - `<meta name="description" content="...">`
  - OG tags (og:type, og:title, og:description, og:image)
  - Twitter card (`summary_large_image`)
  - `lang="ko"` 기본값 유지 (syncHtmlLang 이 runtime override)

- [x] **[TASK-002]** OG 이미지 placeholder
  - `public/images/og.png` — 1200×630 placeholder (단색 + 텍스트)
  - 또는 SVG → PNG 변환이 번거로우면 og:image 를 기존 placeholder.svg 로 임시 지정

- [x] **[TASK-003]** 반응형 깨짐 보정
  - Playwright MCP 또는 수동으로 375/768/1280 세 뷰포트 확인
  - 가로 스크롤 발생 섹션 식별 → overflow-x-hidden 또는 grid 조정

- [x] **[TASK-004]** Heading 레벨 점검
  - H1 = HeroSection 만 (이미 App.test.tsx 가드 존재)
  - H2 = 각 섹션 제목 (이미 개별 테스트 가드 존재)
  - H3 = 카드 내부 제목

- [x] **[TASK-005]** Prettier 포맷

- [x] **[GREEN-VERIFY]** 검증
  ```bash
  npm run lint && npm run typecheck && npm run format:check && npm test && npm run build
  ```

---

## 9.4 REFACTOR Phase: 빌드 최적화

- [x] **[REFACTOR-PERF-MEASURE]** 최종 번들 크기 측정
  | 파일 | Phase 8 | Phase 9 | Δ |
  |------|---------|---------|---|
  | JS | 284.28 KB (gzip 89.82 KB) | [측정] | [Δ] |
  | CSS | 11.91 KB (gzip 3.22 KB) | [측정] | [Δ] |

- [x] **[REFACTOR-PERF-LIGHTHOUSE]** Lighthouse 측정 (`npm run preview` → Chrome DevTools)
  | 항목 | 점수 | 목표 |
  |------|------|------|
  | Performance | [측정] | ≥90 |
  | Accessibility | [측정] | ≥95 |
  | Best Practices | [측정] | ≥90 |
  | SEO | [측정] | ≥90 |
  | LCP | [측정] | <2.5s |
  | CLS | [측정] | <0.1 |

- [x] **[REFACTOR-VERIFY]** 최적화 후 테스트 재확인

---

## 9.5 사후 작업

- [x] **[VERIFY]** 전체 검증 (5종 게이트 + preview)
- [x] **[VERIFY]** 3 브레이크포인트 시각 회귀 (Playwright MCP 또는 수동)
- [x] **[VERIFY]** 키보드 접근성 (Tab 순회)
- [x] **[DOC]** 작업 결과서 — `working_history/v1.0/Phase9_ResponsiveSeoBuild_2026MMDD.md`
- [ ] **[COMMIT]** 커밋

---

## Phase 9 완료 조건 (Definition of Done)

- [x] index.html 메타 태그 (title/description/OG/twitter) 완성
- [x] 모든 `<img>` 에 alt 속성
- [x] 모든 외부 링크에 rel="noopener noreferrer"
- [x] Heading 레벨 의미적 정리 (H1×1, H2×11, H3×카드)
- [ ] 3 브레이크포인트 (375/768/1280) 시각 회귀 통과
- [ ] Lighthouse Performance ≥ 90, Accessibility ≥ 95
- [ ] LCP < 2.5s, CLS < 0.1
- [x] `npm run build && npm run preview` 정상
- [x] 메타/링크/alt/heading 단위 테스트 PASS
- [ ] **마일스톤**: 프로덕션 빌드 품질 확정 — Phase 10 배포 준비 완료
- [ ] 작업 결과서 (Lighthouse 결과 포함) 작성 및 커밋 완료
