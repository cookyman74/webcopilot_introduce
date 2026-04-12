# Web AI Assistant 랜딩 페이지 작업 계획서 (Main)

> **TDD 방법론 기반**: Red → Green → Refactor 사이클 적용
> **작업 원칙**: 각 Phase는 1일 분량 · E2E 확인 가능한 단위 · Agile 반복
> **참고 문서**:
>   - [99_TDD_plan.md](../../working_template/99_TDD_plan.md) — TDD 방법론
>   - [02_implementation_plan.md](../02_implementation_plan.md) — 구현 계획서
>   - [01_landing_page_plan.md](../01_landing_page_plan.md) — 정보 구조 기획
>   - [extension_intro.md](../extension_intro.md) — 제품 소개 원문
> **버전**: v1.0 (Vite + React + TS + Tailwind + Vercel)

---

## 작업 개요

| 항목 | 내용 |
|------|------|
| 프로젝트 | Web AI Assistant 확장앱 소개 랜딩 페이지 (Notion-like 톤) |
| 산출물 | `00_intro_web_landing_page/extapp_landing/` 하위 Vite + React + TS 프로젝트 |
| 영향 범위 | 신규 디렉토리 생성, 기존 확장앱 코드와 독립 |
| 위험 수준 | Low (소비자 노출 전 단계, 확장앱 본체와 격리) |
| 성능 민감도 | Medium (랜딩 페이지 LCP/CLS, 번들 크기) |
| 배포 | Vercel · main 브랜치 push 자동 배포 |
| 작업 브랜치 | `v2.7/refactoring_tools` (현행) 또는 신규 `feat/landing_page` 분기 검토 |
| 1차 언어 | 한국어, 영어 |
| 2·3차 언어 | 일본어, 중국어 (파일 뼈대만 준비) |
| 주 CTA | https://chromewebstore.google.com/detail/cpemgmhplednniaifpolbchjmegidcao?authuser=0&hl=ko |

---

## 핵심 리스크 요약

| # | 리스크 | 영향 | 대응 방안 | Phase | 상태 |
|---|--------|------|----------|-------|------|
| 1 | Vercel Root Directory 미지정 → 빌드 실패 | High | Phase 10에서 Root Directory를 `docs/00_intro_web_landing_page/extapp_landing`으로 명시 | P10 | ⬜ |
| 2 | "구현됨"과 "계획/검토 중" 혼동 | Medium | Badge 컴포넌트로 상태 강제 표기 (Phase 2 + 모든 섹션 Phase) | P2~P8 | ⬜ |
| 3 | i18n 키 누락 → 한쪽 언어 표시 깨짐 | Medium | RED 단계에서 ko/en 양쪽 키 존재 검증 테스트 작성 | P3~P8 | ⬜ |
| 4 | 번들 크기 증가 (framer-motion 등) | Medium | Phase 9 Refactor에서 bundle 크기 측정 + tree-shaking 검증 | P9 | ⬜ |
| 5 | 모바일 레이아웃 깨짐 | Medium | 각 섹션 Phase의 GREEN-VERIFY에 3개 브레이크포인트 시각 확인 포함 | P4~P9 | ⬜ |
| 6 | placeholder 이미지 누락으로 깨진 이미지 노출 | Low | `public/images/` 빈 SVG placeholder 생성 + alt 명시 | P2 | ⬜ |
| 7 | Chrome Web Store CTA URL 오타 | High | `lib/constants.ts`에 단일 출처로 관리 + Phase 8 테스트에서 검증 | P2, P8 | ⬜ |
| 8 | BusinessSection이 일반 제품 카피와 섞여 B2B 메시지가 묻힘 | Medium | §5.10 대상 태그 명시 · Badge 사용 금지 · 배경/톤 구분 · Phase 8 테스트에서 Badge 부재 강제 | P8 | ⬜ |
| 9 | Partnership 문의 이메일 주소 오타/누락 | Medium | `lib/constants.ts`의 `PARTNERSHIP_CONTACT` 단일 출처 + Phase 8 상수 테스트에서 검증 | P2, P8 | ⬜ |

---

## Phase 구성 (10단계)

각 Phase는 **1일 분량**이며, 종료 시 **E2E로 시각 또는 동작 확인이 가능한 단위**다.

| Phase | 제목 | 산출물 | E2E 확인 방법 | 상세 계획서 |
|-------|------|--------|--------------|------------|
| P1 | 프로젝트 부트스트랩 | Vite + React + TS + Tailwind 셋업 | `npm run dev` → 빈 페이지에 Tailwind 클래스 적용 확인 | [phase01_bootstrap.md](./phase01_bootstrap.md) |
| P2 | 디자인 시스템 + 공통 컴포넌트 | 토큰, Section/Button/Badge/FeatureCard | 데모 페이지에서 모든 변형이 시각 확인 가능 | [phase02_design_system.md](./phase02_design_system.md) |
| P3 | i18n + Header/Footer 레이아웃 | react-i18next, ko/en, LanguageSwitcher | 언어 토글로 Header 텍스트가 한↔영 전환 | [phase03_i18n_layout.md](./phase03_i18n_layout.md) |
| P4 | Hero + Problem 섹션 | HeroSection, ProblemSection | 두 섹션이 화면에 보이고 한/영 토글 작동 | [phase04_hero_problem.md](./phase04_hero_problem.md) |
| P5 | Solution + Features 섹션 | SolutionSection, FeaturesSection | 3축 카드 + 9개 기능 카드 + 상태 배지 시각 확인 | [phase05_solution_features.md](./phase05_solution_features.md) |
| P6 | Scenarios + Differentiation 섹션 | ScenariosSection, DifferentiationSection | 4개 시나리오, 3개 비교 카드 시각 확인 | [phase06_scenarios_differentiation.md](./phase06_scenarios_differentiation.md) |
| P7 | AI Modes + Safety 섹션 | AIModesSection, SafetySection | 모드 배지 + 4개 안전 원칙 카드 시각 확인 | [phase07_aimodes_safety.md](./phase07_aimodes_safety.md) |
| P8 | Roadmap + **Business** + Final CTA 섹션 | RoadmapSection, **BusinessSection**, FinalCTASection | 로드맵 카드 + B2B 섹션 + Chrome Web Store CTA 동작 | [phase08_roadmap_finalcta.md](./phase08_roadmap_finalcta.md) |
| P9 | 반응형 / a11y / SEO / 프로덕션 빌드 | meta, OG, lighthouse, build 검증 | `npm run build` 성공 + 모바일/태블릿/데스크톱 깨짐 없음 | [phase09_responsive_seo_build.md](./phase09_responsive_seo_build.md) |
| P10 | Vercel 자동 배포 | vercel.json (필요 시), GitHub 연동 | git push → Vercel Production URL에서 정상 서빙 | [phase10_vercel_deploy.md](./phase10_vercel_deploy.md) |

---

## TDD 적용 원칙 (랜딩 페이지 맥락)

본 프로젝트는 Chrome 확장앱이 아닌 **정적 랜딩 페이지(SPA)** 이므로, 템플릿의 MV3/CSP/zip 항목은 **랜딩 페이지 맥락으로 치환**하여 적용한다.

| 템플릿 원본 | 랜딩 페이지 치환 |
|------------|-----------------|
| MV3 IIFE 번들 | Vite SSG/SPA 빌드 산출물 |
| service worker cold start | LCP (Largest Contentful Paint) |
| zip 패키징 | `dist/` 산출물 + Vercel 배포 |
| `npm run zip` | `npm run build` |
| manifest.json 경로 | Vercel Root Directory 설정 |

### 테스트 도구

- **Unit / Integration**: `vitest` + `@testing-library/react`
- **타입 체크**: `tsc --noEmit` (strict: true)
- **빌드 검증**: `npm run build`
- **시각 회귀**: 1차엔 수동 (브라우저 직접 확인), 추후 Playwright 도입 검토

### 각 Phase의 RED 단계 테스트 패턴

랜딩 페이지에 적합한 테스트 유형:

1. **컴포넌트 렌더 테스트** — i18n 키가 텍스트로 렌더되는지
2. **prop 변형 테스트** — Badge가 status에 따라 다른 색을 적용하는지
3. **상호작용 테스트** — LanguageSwitcher 클릭 시 i18n 언어가 전환되는지
4. **링크 검증 테스트** — Primary CTA의 `href`가 Chrome Web Store URL인지
5. **상수 검증 테스트** — `constants.ts`의 URL이 의도된 값인지

---

## 최종 체크리스트

### TDD 사이클 완료
- [ ] 모든 Phase의 Red → Green → Refactor 사이클 완료
- [ ] 전체 단위 테스트 통과 (`npx vitest run`)
- [ ] `tsc --noEmit` (strict: true) 타입 오류 없음
- [ ] `npm run build` 성공
- [ ] Vercel Production 배포 성공

### 기능 완성도
- [ ] **11개 섹션**이 순서대로 렌더링됨 *(v2: BusinessSection 추가)*
- [ ] 한국어/영어 전환이 동작함
- [ ] 일본어/중국어 locale 파일 뼈대 존재 (값은 비워둠)
- [ ] 주 CTA가 Chrome Web Store로 이동함
- [ ] **BusinessSection Primary CTA가 `mailto:${PARTNERSHIP_CONTACT}` 로 열림**
- [ ] 상태 배지 3종(`구현됨`/`보강 중`/`계획·검토 중`)이 기획서 규칙대로 적용됨 *(BusinessSection 카드 제외)*
- [ ] Roadmap 섹션이 "미래 방향"으로 명확히 구분됨
- [ ] BusinessSection이 일반 사용자 섹션과 시각·카피 면에서 명확히 구분됨
- [ ] 데스크톱/태블릿/모바일 3개 브레이크포인트에서 깨짐 없음

### 배포
- [ ] GitHub 리포에 커밋 푸시 완료
- [ ] Vercel 프로젝트 생성 + Root Directory 지정 완료
- [ ] main push → 자동 배포 동작 확인
- [ ] Production URL 발급 및 공유

### 문서화
- [ ] 각 Phase별 작업 결과서(`working_history/{버전}/PhaseN_*.md`) 작성 완료

---

## 진행 체크리스트

### 사전 준비
- [x] Node.js 20+ 설치 확인 (`node -v`) — Node **22.11.0** 확인 (v1 RED 결과서 §2) · v2.1에서 `package.json`에 `engines: "^20.19.0 || >=22.12.0"` 선언으로 범위 문서화
- [x] npm 10+ 확인 (`npm -v`) — npm **10.9.0** 확인 (v1 RED 결과서 §2)
- [x] 작업 브랜치 결정 — 본 서브 디렉토리가 독립 git 저장소로 운영되며 `main` 브랜치에서 작업 진행 중 (최초 커밋 `918d49a`)
- [ ] Vercel 계정 + GitHub 연동 권한 확인 (Phase 10 전까지)

### Phase 완료 현황

| Phase | RED | GREEN | REFACTOR | 결과서 | 커밋 | 상태 |
|-------|-----|-------|----------|--------|------|------|
| P1 부트스트랩 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 완료 (v2.1) |
| P2 디자인시스템 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 완료 (RED v2 리뷰 반영 포함) |
| P3 i18n+레이아웃 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 완료 (RED v2 리뷰 반영 · happy-dom 환경 제약 2건 skip) |
| P4 Hero+Problem | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 완료 (RED v2 리뷰 6건 반영 · 사후 리뷰 4건 반영 · P3 hotfix html-lang sync · E2E Playwright 검증) |
| P5 Solution+Features | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 완료 (RED v2 리뷰 5건 반영 · lucide-react 추가 · 데모 #features 대체 · 240 passed) |
| P6 Scenarios+Diff | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| P7 AIModes+Safety | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| P8 Roadmap+Business+CTA | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| P9 반응형/SEO/빌드 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| P10 Vercel 배포 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

## 주의사항

### TDD 사이클 원칙
1. **Red First**: 각 Phase는 검증 체크리스트(또는 vitest 테스트)를 먼저 작성하고 FAIL 상태를 확인한다.
2. **Minimal Green**: 해당 Phase 목표만 달성하는 최소 코드를 구현한다. 다음 Phase의 일을 미리 하지 않는다.
3. **Safe Refactor**: 통과 상태에서만 구조 개선을 수행한다.

### 작업 분리 원칙
4. 구조 변경(파일 이동·이름 변경)과 기능 변경(컴포넌트 추가)은 가능한 커밋을 분리한다.
5. 한 Phase에서 두 섹션을 만드는 경우(P4~P8), 섹션별로 RED→GREEN→REFACTOR를 별도 사이클로 돌리고 마지막에 통합 검증한다.

### 랜딩 페이지 특화 원칙
6. **i18n 키 누락 금지**: ko에 추가한 키는 같은 커밋에서 en에도 추가한다 (테스트로 강제).
7. **상태 배지 강제**: 기능을 노출할 때는 반드시 `구현됨` / `보강 중` / `계획·검토 중` 중 하나를 명시한다. 미표기 금지.
8. **placeholder 표기**: 실제 스크린샷이 아닌 자리만 잡는 이미지는 시각적으로 placeholder임을 알 수 있게 한다(점선 보더 + "스크린샷 자리" 라벨).
9. **단일 CTA 출처**: Chrome Web Store URL은 `src/lib/constants.ts`에서만 정의하고 모든 컴포넌트가 import하여 사용한다.

### 빌드/배포 원칙
10. 각 Phase 종료 시 `npm run dev`로 시각 확인하고, P9까지 도달하면 `npm run build` + `npm run preview`로 산출물 검증한다.
11. P10 Vercel 연동 시 Root Directory 설정을 반드시 검증한다.

---

## 빌드 품질 Quick Reference (Refactor 시 참조)

| 항목 | 확인 방법 | 기대값 | 위반 시 영향 |
|------|----------|--------|-------------|
| `tsc --noEmit` (strict) | `npx tsc --noEmit` | 0 errors | 런타임 타입 오류 |
| Vite 빌드 성공 | `npm run build` | exit 0 | 배포 불가 |
| 번들 크기 (JS) | `du -sh dist/assets/*.js` | <300KB gzip | LCP 저하 |
| 이미지 최적화 | `du -sh dist/images/` | placeholder 단계 무시 | LCP 저하 |
| Lighthouse Performance | DevTools | ≥90 | 사용자 경험 |
| Lighthouse Accessibility | DevTools | ≥95 | 접근성 |
| LCP | Lighthouse | <2.5s | UX 핵심 지표 |
| CLS | Lighthouse | <0.1 | 시각 안정성 |

---

## 관련 문서

- [02_implementation_plan.md](../02_implementation_plan.md) — 구현 계획서 (디자인 토큰, 디렉토리 구조, 컴포넌트 스펙)
- [01_landing_page_plan.md](../01_landing_page_plan.md) — 정보 구조 기획서
- [extension_intro.md](../extension_intro.md) — 제품 소개서
- [99_TDD_plan.md](../../working_template/99_TDD_plan.md) — TDD 방법론
- [template_todolist_performance.md](../../working_template/template_todolist_performance.md) — 작업 계획서 템플릿

---

## 예상 일정

| Phase | 예상 소요 | 시작일 | 완료일 | 비고 |
|-------|----------|--------|--------|------|
| P1 부트스트랩 | 1일 | 2026-04-10 | 2026-04-11 | ✅ v1(18 가드 GREEN) 2026-04-10 완료 → v2(23 가드) + v2.1(리뷰 사각지대 수정) 2026-04-11 완료. 결과서 3건 · 커밋 `f6e0639` + `e9a5e56` |
| P2 디자인시스템 | 1일 | 2026-04-11 | 2026-04-11 | ✅ RED v1 → v2(리뷰 피드백 6건 반영) → GREEN(TASK-001~010) → REFACTOR(타입 분리 + barrel) → 사후. 결과서 1건 `Phase2_DesignSystem_20260411.md` |
| P3 i18n+레이아웃 | 1일 | 2026-04-11 | 2026-04-11 | ✅ RED v1 → v2(리뷰 피드백 5건 반영) → GREEN(TASK-001~009) → REFACTOR(barrel + 네비 데이터화) → 사후. 결과서 1건 `Phase3_I18nLayout_20260411.md`. 140 passed \| 5 skipped (happy-dom 환경 제약 2건 포함) |
| P4 Hero+Problem | 1일 | 2026-04-12 | 2026-04-12 | ✅ RED v2 리뷰 6건 + 사후 리뷰 4건. TDD 사이클 + E2E Playwright 3 브레이크포인트 시각·동작 검증. P3 hotfix(html-lang sync) 동반. 테스트 198 passed \| 5 skipped. 번들 JS 256.99KB gzip 81.36KB |
| P5 Solution+Features | 1일 | 2026-04-12 | 2026-04-12 | ✅ lucide-react 12아이콘. SolutionSection 3축 + FeaturesSection 9카드(done×7+wip×1+planned×1). 데모 #features 대체. 240 passed. JS 266.11KB gzip 84.82KB |
| P6 Scenarios+Diff | 1일 | — | — | |
| P7 AIModes+Safety | 1일 | — | — | |
| P8 Roadmap+Business+CTA | 1~1.5일 | — | — | 3개 섹션 (v2 BusinessSection 추가로 확장) |
| P9 반응형/SEO/빌드 | 1일 | — | — | Lighthouse 보정 시 +0.5일 |
| P10 Vercel 배포 | 0.5~1일 | — | — | Root Directory 이슈 시 +0.5일 |
| **Total** | **10~11.5일** | — | — | v2 BusinessSection으로 P8이 +0.5일 |

---

**작성일**: 2026-04-10
**작성자**: junghojang
**최종 수정일**: 2026-04-11
**상태**: 🔄 **Phase 1~5 완료** · Phase 6 (Scenarios + Differentiation) 착수 대기
