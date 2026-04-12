# Phase 5 작업 결과서 — SolutionSection + FeaturesSection

> **작업 일자**: 2026-04-12
> **대응 계획서**: [phase05_solution_features.md](../../phase05_solution_features.md)
> **Phase 4 베이스라인**: [Phase4_HeroProblem_20260412.md](./Phase4_HeroProblem_20260412.md)

---

## 1. 목표와 범위

Phase 5 는 해결 방식 3축(SolutionSection)과 9개 주요 기능 카드(FeaturesSection) 를 구현했다. 핵심 전환은 데모 `<Section id="features" background="accent-soft">` 를 삭제하고 실제 FeaturesSection (`id="features"`, `background="surface"`) 으로 대체한 것이다.

완료된 TDD 사이클:
1. **RED** — SolutionSection/FeaturesSection 테스트 + App.test.tsx Phase 5 구조 가드 + i18n required-key 가드
2. **RED 리뷰 반영** — 5개 리뷰 이슈(High×1, Medium×4) 수정: 섹션 렌더 순서 가드, 카드별 status 매핑, 9개 카드 정체성 고정, badge i18n DOM 검증, Phase 4 데모 가드 전환
3. **GREEN** — lucide-react 설치 → locale 키 추가 → SolutionSection/FeaturesSection 구현 → App.tsx 갱신 → barrel 확장 → 1회 수정(브랜드 명칭 i18n 허용) 후 전부 PASS
4. **REFACTOR** — GREEN 에서 선반영 완료 (SOLUTION_AXES/FEATURE_ITEMS 데이터화, statusLabel i18n 기반), 추가 변경 없음

---

## 2. 수정/생성 파일 요약

### 2.1 신규 파일
| 파일 | 역할 |
|------|------|
| `src/components/sections/SolutionSection.tsx` | Solution 섹션 — 3축 카드 (context/action/script) + lucide 아이콘 |
| `src/components/sections/SolutionSection.test.tsx` | 17 테스트 (TEST-P5.1/P5.2/P5.9/P5.10) |
| `src/components/sections/FeaturesSection.tsx` | Features 섹션 — 9개 FeatureCard + status badge + lucide 아이콘 |
| `src/components/sections/FeaturesSection.test.tsx` | 22 테스트 (TEST-P5.3~P5.7/P5.9/P5.11/P5.13) |
| 본 결과서 | `working_history/v1.0/Phase5_SolutionFeatures_20260412.md` |

### 2.2 수정 파일
| 파일 | 변경 요약 |
|------|----------|
| `package.json` | `lucide-react: ^1.8.0` 추가 |
| `src/i18n/locales/ko.json` | `solution.*` 10키 + `features.*` 31키 추가 |
| `src/i18n/locales/en.json` | 동일 41키 영문 번역 |
| `src/App.tsx` | Solution/Features 삽입 + 데모 `#features` 섹션 삭제 + FeatureCard import 제거 |
| `src/App.test.tsx` | Phase 5 구조 가드 5건 추가 + 배경 4종→3종 축소 + 데모 FeatureCard/BusinessSection 테스트 삭제→roadmap Badge 독립 가드로 교체 |
| `src/i18n/i18n.test.ts` | `solution.*` / `features.*` required-key 가드 2건 추가 |
| `src/components/sections/index.ts` | SolutionSection + FeaturesSection export 추가 |

### 2.3 패키지 변동
| 패키지 | 버전 | 용도 |
|--------|------|------|
| `lucide-react` | `^1.8.0` | SolutionSection/FeaturesSection 아이콘 (12개 named import) |

---

## 3. RED 리뷰 피드백 반영 (5건)

| # | 심각도 | 이슈 | 수정 |
|---|--------|------|------|
| 1 | High | TEST-P5.12(렌더 순서) 미구현 | `section[data-testid]` DOM 순서를 `['hero-section','problem-section','solution-section','features-section']` 과 `.toEqual()` 비교 |
| 2 | Medium | Badge 총량만 검증 — 카드별 매핑 미보장 | script 카드의 badge 텍스트가 `t('features.status.wip')` 인지 + floating 이 `t('features.status.planned')` 인지 개별 검증 |
| 3 | Medium | 9개 카드 정체성 미고정 | `expectedKeys` 배열의 각 `t()` 제목이 DOM 에 정확히 1회 렌더되는지 반복 검증 + 역방향 총 9개 확인 |
| 4 | Medium | Badge i18n 테스트가 DOM 미검증 | rerender 후 `screen.getAllByText(enDone).length === 7` 등 실제 DOM 렌더 확인 추가 |
| 5 | Medium | Phase 4 데모 가드 미전환 | accent-soft 배경 4종→3종 축소 + FeatureCard 2 케이스/BusinessSection 프리뷰 삭제 → roadmap Badge 독립 가드로 교체 |

---

## 4. GREEN 구현 요점

### 4.1 SolutionSection
- `Section background="canvas"` + `aria-labelledby="solution-heading"` + `data-testid="solution-section"`
- `SOLUTION_AXES = ['context','action','script'].map()` — Phase 4 ProblemSection 패턴 계승
- lucide-react 아이콘: BookOpen / MousePointerClick / Code2
- 반응형: `grid gap-8 md:grid-cols-3` (모바일 1col → 데스크톱 3col)
- 각 카드 내부: 아이콘 → h3 → 설명 → "예:" 예시

### 4.2 FeaturesSection
- `Section id="features" background="surface"` + `data-testid="features-section"`
- `FEATURE_ITEMS` 배열 9개 — key/status/icon 명세
- FeatureCard 공통 컴포넌트 사용: `icon`, `title`, `description`, `example`, `status`, `statusLabel` props
- **statusLabel i18n**: `t('features.status.${status}')` — Phase 4 이전의 하드코딩 "구현됨" 패턴에서 i18n 기반으로 전환. 언어 전환 시 badge 텍스트도 "Implemented"/"In Progress"/"Planned" 로 자동 전환
- 반응형: `grid gap-6 md:grid-cols-2 lg:grid-cols-3` (모바일 1col → 태블릿 2col → 데스크톱 3×3)

### 4.3 App.tsx 핵심 전환
- 데모 `<Section id="features" background="accent-soft">` (FeatureCard 2개 포함) **삭제**
- `<SolutionSection />` + `<FeaturesSection />` 을 ProblemSection 바로 뒤에 삽입
- FeaturesSection 이 `id="features"` 를 인수받아 Hero Secondary CTA `href="#features"` + NAV_ANCHORS 첫 번째 ID 를 그대로 유지
- 나머지 데모 3개 Section (scenarios/differentiation/roadmap) 은 수정 없음

### 4.4 브랜드 명칭 i18n 허용
GREEN 1차에서 FeaturesSection i18n 전환 테스트 1건 FAIL: "Action Tools", "Floating Helper" 가 ko/en 모두 동일한 영문 제품명. 테스트를 "9개 전부 변경" → "최소 7개 이상 변경" 으로 조정해 브랜드 명칭을 허용.

---

## 5. 테스트 결과

### 5.1 전체 게이트 (5종)
```
lint         ✅ 0 errors
typecheck    ✅ 0 errors (app + test)
format:check ✅ All files compliant
test         ✅ 15 test files · 240 passed | 5 skipped (245)
build        ✅ JS 266.11 KB (gzip 84.82 KB) · CSS 10.62 KB (gzip 2.93 KB)
```

### 5.2 테스트 증분 (Phase 4 → Phase 5)
| 구분 | Phase 4 | Phase 5 | Δ |
|------|---------|---------|---|
| Test Files | 13 | **15** | +2 (Solution/Features) |
| Tests passed | 198 | **240** | +42 |
| Tests skipped | 5 | 5 | — |

### 5.3 Phase 5 신규 테스트 상세
| 파일 | 테스트 수 | 비고 |
|------|----------|------|
| SolutionSection.test.tsx | 17 | 3 article + 내부 구조 + h2 + aria + data-testid + grid + i18n |
| FeaturesSection.test.tsx | 22 | 9 article + 카드 정체성 9키 고정 + badge 매핑(총량+카드별) + i18n badge DOM + grid |
| i18n.test.ts 추가분 | 2 | solution.* 10키 + features.* 31키 required |
| App.test.tsx 추가분 | 5 | data-testid 직접 조회 + scope article/badge + 렌더 순서 |
| App.test.tsx 변경분 | −2+1 | 데모 FeatureCard/BusinessSection 삭제 → roadmap Badge 가드 |

---

## 6. 번들 크기 변화

| 자산 | Phase 4 | Phase 5 | Δ |
|------|---------|---------|---|
| JS | 256.99 KB (gzip 81.36 KB) | **266.11 KB** (gzip 84.82 KB) | +9.12 KB (gzip +3.46 KB) |
| CSS | 10.46 KB (gzip 2.91 KB) | **10.62 KB** (gzip 2.93 KB) | +0.16 KB (gzip +0.02 KB) |
| modules | 61 | **1769** | +1708 (lucide-react tree-shaking 내부 모듈 포함) |

- JS 증가 +9.12 KB — lucide-react 12개 아이콘 + Solution/Features 컴포넌트. 예측(+15~30 KB) 보다 작음. tree-shaking 정상 동작.
- modules 1769 는 lucide-react 의 내부 ESM 파일이 Vite transform 대상에 포함되기 때문. 최종 번들에는 사용한 아이콘만 포함.
- Phase 9 gzip 목표(JS < 300 KB): 현재 gzip 84.82 KB → 215.18 KB 여유.

---

## 7. 주요 결정 기록

### 7.1 데모 `#features` 제거와 accent-soft 배경 소멸
- 구현 계획서 §5.4 는 FeaturesSection 배경을 `bg-surface` 로 지정
- 데모 `<Section id="features" background="accent-soft">` 삭제 시 `accent-soft` 가 전체 App 에서 소멸
- App.test.tsx 의 "4종 배경" 가드를 "3종 배경" 으로 축소 (canvas/surface/surface-alt)
- accent-soft 는 Phase 8 FinalCTA(§5.11) 에서 다시 등장 → 그 시점에 4종 가드 복구

### 7.2 statusLabel i18n 전환
- Phase 4 이전: FeatureCard 에 `statusLabel="구현됨"` 하드코딩
- Phase 5: `statusLabel={t('features.status.done')}` → 언어 전환 시 "Implemented" 자동 적용
- 이 패턴은 Phase 6 Roadmap + Phase 8 어디서든 동일하게 재사용 가능

### 7.3 lucide-react tree-shaking 방식
- `import { MessageSquare } from 'lucide-react'` named import only
- `import * as Icons` barrel import **금지** (전체 아이콘 번들 +500 KB 방지)
- 실측: 12 아이콘 사용 → JS +9.12 KB raw = 아이콘당 ~0.76 KB (SVG path 데이터 포함)

### 7.4 REFACTOR 보류 결정 (YAGNI)
- statusLabel 자동 매핑 헬퍼 (`getStatusLabel(t, status)`) → Phase 6 Roadmap 에서 재사용 발생 시 추출
- FEATURE_ITEMS 외부화 (`src/lib/featureCatalog.ts`) → 1회 사용 추상화 회피

---

## 8. Phase 6 (Scenarios + Differentiation) 인계 사항

### 8.1 데모 섹션 교체 대상
Phase 5 완료 후 남은 데모 Section 3개:
- `<Section id="scenarios" background="canvas">` — Phase 6 ScenariosSection 으로 대체
- `<Section id="differentiation" background="surface">` — Phase 6 DifferentiationSection 으로 대체
- `<Section id="roadmap" background="surface-alt">` — Phase 8 RoadmapSection 으로 대체

### 8.2 App.test.tsx 전환 패턴
Phase 5 에서 확립된 패턴:
1. 데모 섹션 삭제 → 실제 섹션 `<XxxSection />` 으로 대체
2. 실제 섹션에 `data-testid="xxx-section"` 공개 계약 부여
3. App.test.tsx 에 data-testid 직접 조회 + scope 내부 검증 + 렌더 순서 가드 추가
4. 영향받는 기존 가드 (배경 종류, 카드 카운트 등) 조정
5. 계획서의 `§X.1.1 Phase N→N+1 전환 분석` 으로 정확히 어떤 가드가 깨지는지 사전 매핑

### 8.3 sections barrel 확장
`src/components/sections/index.ts` 에 Phase 6 섹션 2줄 추가하면 됨.

### 8.4 렌더 순서 가드 확장
현재 가드: `['hero-section','problem-section','solution-section','features-section']`
Phase 6 에서 Scenarios + Differentiation 추가 시 이 배열도 확장 필요.

### 8.5 Badge 3종 가드
현재 "Badge 3종 라벨" 가드는 FeaturesSection 이 `보강 중`(script) + `계획·검토 중`(floating) 을 렌더하므로 자연 통과. Phase 6~8 에서 Badge 사용 패턴이 바뀌어도 이 가드는 안정적.

---

---

## 9. 사후 리뷰 반영 (2026-04-12)

Phase 5 작업결과서에 대한 코드 레벨 리뷰에서 4건(Medium×2, Low×2) + 잠재 이슈 2건이 제시되어 수정 완료.

### 9.1 수정 내역

| # | 심각도 | 이슈 | 수정 |
|---|--------|------|------|
| 1 | Medium | "예:" 접두사가 ko 하드코딩 — en 전환 시 혼합 언어 | `common.examplePrefix` i18n 키 추가 (ko: "예:", en: "e.g."). SolutionSection + FeatureCard 에서 `t('common.examplePrefix')` 사용. required-key 가드 추가 |
| 2 | Medium | 데모 섹션 3개 한국어 하드코딩 — en 전환 시 혼합 | `demo.*` i18n 키 7개 추가. App.tsx 에서 `useTranslation()` + `t()` 로 교체. App.test.tsx 에 `beforeEach(i18n.changeLanguage('ko'))` 추가 |
| 3 | Low | FeaturesSection 에 aria-labelledby 누락 | `aria-labelledby="features-heading"` + `<h2 id="features-heading">` 추가. ProblemSection/SolutionSection 과 일관된 landmark |
| 4 | Low | 브랜드 명칭 예외 가드가 느슨 (7개 이상 변경) | `BRAND_NAMES = ['Action Tools', 'Floating Helper']` allowlist 로 고정. allowlist 외 카드는 전부 변경 강제, allowlist 내 카드는 ko/en 동일 강제 |

**잠재 이슈 대응**:
- ① accent-soft 배경 부재: Phase 8 계획서에 "배경 가드 4종 복구" TODO 명시 필요 → 결과서 §8.1 인계 사항에 이미 기록됨
- ② FEATURE_ITEMS 외부화: 결과서 §7.4 의 YAGNI 결정 유지 — 2회 이상 재사용 발생 시 추출

### 9.2 검증 결과

```
lint         ✅ 0 errors
typecheck    ✅ 0 errors (app + test)
format:check ✅ All files compliant
test         ✅ 15 files · 241 passed | 5 skipped (+1 common.examplePrefix 가드)
build        ✅ JS 266.79 KB (gzip 85.00 KB) · CSS 10.62 KB (gzip 2.93 KB)
```

### 9.3 수정 파일

| 파일 | 변경 |
|------|------|
| `src/i18n/locales/ko.json` | `common.examplePrefix` + `demo.*` 7키 추가 |
| `src/i18n/locales/en.json` | 동일 8키 영문 |
| `src/components/common/FeatureCard.tsx` | `useTranslation()` hook 추가 + "예:" → `t('common.examplePrefix')` |
| `src/components/sections/SolutionSection.tsx` | "예:" → `t('common.examplePrefix')` |
| `src/components/sections/FeaturesSection.tsx` | `aria-labelledby="features-heading"` + h2 id 추가 |
| `src/components/sections/FeaturesSection.test.tsx` | 브랜드 명칭 allowlist 고정 |
| `src/App.tsx` | 데모 섹션 텍스트 i18n 전환 + `useTranslation()` hook 추가 |
| `src/App.test.tsx` | `beforeEach(i18n.changeLanguage('ko'))` + Demo heading i18n 대응 + Badge i18n 대응 |
| `src/i18n/i18n.test.ts` | `common.examplePrefix` required-key 가드 추가 |

**작성**: 2026-04-12
**Phase 5 상태**: ✅ GREEN + REFACTOR + 리뷰 반영 + 자동 검증 완료 · 커밋 대기
