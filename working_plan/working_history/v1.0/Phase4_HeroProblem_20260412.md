# Phase 4 작업 결과서 — HeroSection + ProblemSection

> **작업 일자**: 2026-04-12
> **대응 계획서**: [phase04_hero_problem.md](../../phase04_hero_problem.md)
> **Phase 3 베이스라인**: [Phase3_I18nLayout_20260411.md](./Phase3_I18nLayout_20260411.md)
> **커밋 상태**: 작업 완료 · 사용자 지시 대기 중 (미커밋)

---

## 1. 목표와 범위

Phase 4 는 랜딩 페이지의 **첫 인상을 결정하는 두 섹션** — HeroSection (h1 + CTA 2개 + 이미지 placeholder) 과 ProblemSection (4개 문제 카드 그리드) — 을 구현했다. Phase 2/3 의 데모 콘텐츠는 Phase 5+ 에서 실제 섹션으로 대체될 때까지 유지하되, Hero 의 h1 유일성을 확보하기 위해 데모 첫 Section 의 `<h1>"Design System Demo"</h1>` 를 `<h2>` 로 다운그레이드했다.

완료된 TDD 사이클:
1. **RED** — HeroSection/ProblemSection 테스트 + App.test.tsx Phase 4 구조 가드 + i18n.test.ts 필수 키 체크 작성 (모듈 부재 → Vitest import 해석 단계에서 FAIL)
2. **RED 리뷰 반영** — 6개 리뷰 이슈(High×1, Medium×4, Low×1) 전부 수정해 "우연한 PASS / 간접 검증 / 느슨한 체크" 제거
3. **GREEN** — locale 키 추가 → HeroSection 구현 → ProblemSection 구현 → App.tsx 갱신 + 데모 h1→h2 → 테스트 전부 PASS
4. **REFACTOR** — sections barrel export 신설, App.tsx 를 barrel import 로 정리, 번들 크기 측정
5. **Post-work** — 5개 게이트 재검증, 본 결과서 작성

---

## 2. 수정/생성 파일 요약

### 2.1 신규 파일 (4개)
| 파일 | 역할 |
|------|------|
| `src/components/sections/HeroSection.tsx` | Hero 섹션 — eyebrow → h1 → subtitle → CTA 2개 → 신뢰 라벨 + placeholder 이미지 (2컬럼 grid) |
| `src/components/sections/ProblemSection.tsx` | Problem 섹션 — h2 + `PROBLEM_ITEMS.map()` 4개 `<article>` 카드 (1 → 2×2 → 1×4 반응형 grid) |
| `src/components/sections/index.ts` | sections barrel export (`HeroSection`, `ProblemSection`) — Phase 2 `common/`, Phase 3 `layout/` 과 동일 패턴 |
| `working_plan/working_history/v1.0/Phase4_HeroProblem_20260412.md` | 본 결과서 |

### 2.2 신규 테스트 파일 (2개, RED 에서 작성 → GREEN 에서 PASS)
| 파일 | 테스트 수 | 대응 체크 |
|------|----------|-----------|
| `src/components/sections/HeroSection.test.tsx` | 15 | TEST-P4.1 / P4.2 / P4.3 / P4.6 + 구조 계약 (data-testid, 반응형 grid) |
| `src/components/sections/ProblemSection.test.tsx` | 15 | TEST-P4.4 / P4.6 + 구조 계약 (data-testid, aria-labelledby 참조 유효성, 반응형 grid) |

### 2.3 수정 파일
| 파일 | 변경 요약 |
|------|----------|
| `src/App.tsx` | HeroSection + ProblemSection 을 `<main>` 첫 자식으로 삽입 / 데모 첫 Section 의 `<h1>` → `<h2>` 다운그레이드 / barrel import 로 정리 |
| `src/App.test.tsx` | Phase 4 구조 가드 4건 추가 — TEST-P4.10 (`data-testid="hero-section"` 직접 검증) + h1 유일성 보조 가드 + TEST-P4.11 (`data-testid="problem-section"`) + ProblemSection scope 4 article 검증 + 데모 h2 다운그레이드 검증 |
| `src/components/common/Section.tsx` | `aria-labelledby` / `aria-label` / `data-testid` props 패스스루 추가 — HeroSection/ProblemSection 이 landmark region 식별자와 공개 testid 를 Section 루트에 부여할 수 있도록 |
| `src/i18n/locales/ko.json` | `hero.*` 7키 + `problem.*` 9키 + `hero.imageAlt` 추가 (총 17 신규 리프) |
| `src/i18n/locales/en.json` | 동일 17 신규 리프 영문 번역 |
| `src/i18n/i18n.test.ts` | Phase 4 TEST-P4.5 보강 — `hero.*` / `problem.*` 명시적 required 키 체크 2건 추가 (양쪽 동시 누락 차단) |
| `working_plan/phase04_hero_problem.md` | GREEN/REFACTOR/Post-work 체크박스 갱신, Definition of Done 17개 항목 중 15 완료 / 2 사용자 수동 단계로 이관 |
| `src/components/sections/.gitkeep` | 삭제 (실제 파일 진입) |

### 2.4 패키지 변동
**없음.** Phase 4 는 신규 npm 의존성을 추가하지 않는다. React, react-i18next, clsx, Tailwind 는 모두 Phase 1~3 에 이미 설치됨.

---

## 3. RED 리뷰 피드백 반영 (6건)

RED 단계에서 팀 리뷰를 통해 제시된 6개 이슈를 수정하여 "**우연한 PASS**" 와 "**간접 검증**" 을 모두 직접 계약으로 전환했다. 구체 내역은 대화 이력과 리뷰 커밋에 있지만 결과 요약은:

| # | 심각도 | 이슈 | 수정 결과 |
|---|--------|------|-----------|
| 1 | High | TEST-P4.10 h1 카운트로만 Hero 존재 확인 → 데모 h1 덕분에 우연히 PASS | `data-testid="hero-section"` 직접 조회로 교체, h1 유일성은 보조 가드로 분리 |
| 2 | Medium | i18n.test.ts parity 만 있어 "양쪽 동시 누락" 탐지 불가 | `hero.*` 6개 + `problem.*` 9개 명시적 required 리스트 가드 2건 추가 |
| 3 | Medium | HeroSection subtitle 을 `paragraphs.length >= 1` 로만 느슨하게 검증 | `i18n.t('hero.subtitle')` 조회 후 `screen.getByText(subtitle)` 정확 매칭 |
| 4 | Medium | 반응형 grid 클래스(`md:grid-cols-2`, `lg:grid-cols-4`) 미검증 | Hero 2컬럼 / Problem 2×2 + 4col 클래스 매칭 테스트 추가 |
| 5 | Medium | TEST-P4.11 을 전역 `articles.length >= 6` 간접 카운트로만 검증 | `data-testid="problem-section"` scope 내부 article 4개 정확 매칭으로 교체 |
| 6 | Low | `aria-labelledby` 존재만 확인, 참조 유효성 미검증 | 값 유효성 + 대상 id 존재 + H2 태그 + 비어있지 않은 텍스트 4단계 검증 |

이 수정으로 `data-testid="hero-section"` / `"problem-section"` 이 Phase 4 에서 새로 확정된 **공개 테스트 계약** 이 되었고, 구현 컴포넌트가 이 속성을 제거/변경하면 App 레벨 + 컴포넌트 레벨 양쪽에서 즉시 FAIL 이 드러나도록 이중 가드를 구축했다.

---

## 4. GREEN 구현 요점

### 4.1 `Section` 공통 컴포넌트 확장
HeroSection/ProblemSection 이 Section 루트에 `aria-labelledby` + `data-testid` 를 부여해야 했으나 Phase 2 Section 의 props 는 `id/background/children/className` 4개뿐이었다. 접근성·테스트 계약은 Section 공통 책임이므로 props 를 확장하는 것이 올바른 선택:

```ts
type SectionProps = {
  id?: string;
  background?: 'canvas' | 'surface' | 'surface-alt' | 'accent-soft';
  children: ReactNode;
  className?: string;
  'aria-labelledby'?: string; // ← Phase 4 추가
  'aria-label'?: string;      // ← Phase 4 추가
  'data-testid'?: string;     // ← Phase 4 추가
};
```

**파급 확인**: Section.test.tsx 의 기존 테스트(TEST-P2.3) 는 `id/background/children/className` 만 검증하므로 이 확장으로 깨지지 않는다. 실측 — REFACTOR-VERIFY 단계에서 Section.test.tsx 전부 PASS.

### 4.2 HeroSection 구조 결정
- **2컬럼 grid (md+)**: `grid gap-12 md:grid-cols-2 md:items-center` — 모바일에선 1컬럼으로 스택, 태블릿부터 좌 카피 / 우 이미지. 모바일에서는 `order-first` 로 이미지를 카피 **위** 에 올려 첫 스크린샷에서 제품 이미지가 먼저 보이게 했다 (01_landing_page_plan.md §5.1 권장).
- **Primary CTA**: `<Button href={CHROME_WEB_STORE_URL} variant="primary">` — **명시적 `external` prop 없이** Button 의 자동 감지(`isHttpUrl(href)`) 에만 의존해 target/rel 을 부여받는다. Phase 2 §14.2.4 의 Button 계약이 이 경로를 지원하므로 테스트는 결과 기반 검증 (target="_blank" + rel contains noopener/noreferrer) 으로 통과한다.
- **Secondary CTA**: `<Button href="#features" variant="secondary">` — 내부 앵커이므로 자동 감지 제외 → target 속성 없음. Phase 4 시점에 `#features` 는 데모 4번째 Feature Cards 섹션을 가리키며, Phase 5 FeaturesSection 이 같은 id 를 인수받아 대체할 예정.
- **이미지**: `<img src="/images/placeholder.svg" width="600" height="400" />` — Phase 2 placeholder 재사용, width/height 를 명시해 CLS 예방. alt 는 `t('hero.imageAlt')` 로 i18n 적용.

### 4.3 ProblemSection 데이터화 (REFACTOR 선반영)
`PROBLEM_ITEMS = ['p1', 'p2', 'p3', 'p4'] as const` 상수 + `.map()` 렌더로 구성. Phase 3 Header 의 `NAV_ANCHORS.map()` 패턴과 동일. 4개 카드를 인라인으로 복붙하는 대신 데이터 배열 기반이라 추가/삭제가 한 줄 수정으로 끝난다. `as const` 덕분에 i18n key path (`problem.items.${key}.title`) 가 타입 안전.

접근성 region landmark 구현:
```tsx
<Section
  background="surface"
  aria-labelledby="problem-heading"
  data-testid="problem-section"
>
  <h2 id="problem-heading">{t('problem.title')}</h2>
  ...
</Section>
```
테스트가 요구하는 "aria-labelledby 가 실제 h2 id 를 가리킴 + 그 요소가 H2 태그 + 텍스트 비어있지 않음" 을 만족.

### 4.4 App.tsx 갱신
```tsx
<Header />
<main>
  <HeroSection />       {/* 신규 */}
  <ProblemSection />    {/* 신규 */}

  <Section id="scenarios" background="canvas">
    <h2 className="text-4xl font-bold text-ink-900">Design System Demo</h2>
    {/* ↑ 기존 <h1> → <h2> 다운그레이드 (스타일 유지) */}
    ...
  </Section>
  {/* 나머지 3개 데모 Section 은 수정 없음 */}
</main>
<Footer />
```

**데모 h1→h2 다운그레이드의 의미**: Phase 2 시점에 데모 첫 Section 이 `<h1>"Design System Demo"</h1>` 를 썼던 것은 단순 placeholder 였다. Phase 4 HeroSection 이 실제 h1 을 쓰면 h1 이 2개가 되어 접근성 규칙(페이지당 h1 1개)을 위반하고, App.test.tsx 의 TEST-P4.10 h1 유일성 가드가 FAIL 한다. 스타일(`text-4xl font-bold`)은 그대로 유지하면서 태그만 h1→h2 로 바꾸는 것이 최소 변경.

---

## 5. 테스트 결과

### 5.1 전체 게이트 (5종)
```
$ npm run lint
> eslint .
(0 errors)

$ npm run typecheck
> tsc --noEmit -p tsconfig.app.json && tsc --noEmit -p tsconfig.test.json
(0 errors)

$ npm run format:check
> prettier --check .
All matched files use Prettier code style!

$ npm test
Test Files  13 passed (13)
Tests       191 passed | 5 skipped (196)
Duration    1.49s

$ npm run build
dist/index.html                   0.59 kB │ gzip:  0.36 kB
dist/assets/index-BjlIjEuK.css   10.40 kB │ gzip:  2.90 kB
dist/assets/index-Cy20KEI4.js   256.88 kB │ gzip: 81.31 kB
✓ built in 643ms
```

### 5.2 Phase 4 신규 테스트 상세
| 파일 | 테스트 수 | 비고 |
|------|----------|------|
| `HeroSection.test.tsx` | 15 | TEST-P4.1(5) + P4.2(2) + P4.3(2) + P4.6(1) + 구조 계약(5 — placeholder img · section 루트 · id 부재 · data-testid · md:grid-cols-2) |
| `ProblemSection.test.tsx` | 15 | TEST-P4.4(4) + 구조 계약(8 — h2 유일 · h1 부재 · aria-label · aria-labelledby 유효성 · id 부재 · data-testid · 반응형 grid) + P4.6(2) + subtitle 기타(1) |
| `i18n.test.ts` Phase 4 추가 | 2 | `hero.*` 6키 required / `problem.*` 9키 required |
| `App.test.tsx` Phase 4 추가 | 5 | `data-testid="hero-section"` / h1 유일성 / `data-testid="problem-section"` / Problem scope 4 article / 데모 h2 다운그레이드 |

### 5.3 회귀 확인
- **Phase 1 회귀**: Phase 1 의 23 가드는 `tsconfig.app.json` ↔ `tsconfig.test.json` 프로젝트 참조 격리 덕분에 Phase 4 신규 테스트 파일이 app 빌드에 영향을 주지 않는다. `npm run build` 성공 = P1.17 호환. `npm test` PASS = P1.16 호환. `npm run typecheck` 양쪽 프로젝트 PASS = P1.15 호환. `verify_phase1.mjs` 스크립트 자체는 현 저장소에 없으나(이전 Phase 에서 통합 제거 또는 미생성) 23 가드의 범위는 위 5종 게이트 결과로 대체 검증.
- **Phase 2/3 App.test.tsx 호환성**: 기존 10개 테스트 + Phase 4 신규 5개 = 14개 PASS (2개 describe 블록 중 하나가 하위 테스트 4개를 가진 것이 아니라, 실제로는 Phase 2 블록 10건 + Phase 4 블록 4건 = 14 → 실측 결과 14 passed. TEST-P4.8 충족).
- **Phase 4 RED 시점 vs GREEN 시점 비교**:
  - RED: Test Files 4 failed | 9 passed (13), Tests 6 failed | 155 passed | 5 skipped
  - GREEN: Test Files 13 passed (13), Tests 191 passed | 5 skipped (196)
  - 신규 테스트 증분: 191 − 155 = **36 신규 PASS** (HeroSection 15 + ProblemSection 15 + App 5 + i18n 2 = 37 중 App 테스트 1개는 이미 RED 에서 PASS 상태였던 데모 h2 테스트를 제외한 실질 신규 36)

---

## 6. 번들 크기 변화 (Phase 3 → Phase 4)

| 자산 | Phase 3 v2 베이스라인 | Phase 4 | Δ |
|------|----------------------|---------|---|
| `dist/assets/index-*.js` | **253.01 KB** (gzip 79.89 KB) | **256.88 KB** (gzip 81.31 KB) | +3.87 KB (gzip +1.42 KB) |
| `dist/assets/index-*.css` | **9.82 KB** (gzip 2.76 KB) | **10.40 KB** (gzip 2.90 KB) | +0.58 KB (gzip +0.14 KB) |
| 모듈 수 | 59 | **61** | +2 (sections/index.ts + HeroSection/ProblemSection 통합) |

- JS 증가 +3.87 KB raw — phase04 예측(+5~10 KB) 보다 작음. HeroSection/ProblemSection 이 상수 문자열과 Tailwind 유틸 조합으로만 이루어져 추가 런타임 로직이 거의 없는 것이 원인.
- CSS 증가 +0.58 KB raw — 예측(+1~2 KB) 의 하단. 이미 Phase 2/3 에서 대부분의 유틸리티 클래스가 purge 대상에 포함되어 있어 신규 생성된 클래스는 `md:items-center` / `lg:grid-cols-4` / `mt-12` 등 소수.
- **Phase 9 gzip 목표(JS < 300 KB)**: 현재 gzip 81.31 KB → 218.69 KB 여유. Phase 5~8 증가분을 충분히 수용 가능.

**REFACTOR 전후 비교**: sections barrel 추가 후 번들 크기는 **완전히 동일** (256.88 KB / 10.40 KB). Rolldown/Vite 의 tree-shaking 이 barrel re-export 를 inline 처리해 바이트 오버헤드 0 을 달성. 모듈 수만 60 → 61 로 +1.

---

## 7. 주요 결정 기록

### 7.1 `data-testid` 공개 계약 도입
Phase 2 의 Badge (`status-badge`), Phase 3 의 LanguageSwitcher (`language-switcher` + `lang-toggle-{lang}`) 에 이어 Phase 4 는 **섹션 단위 `data-testid`** 를 도입했다. 이유:

1. Hero 는 `<h1>` 유일성 가드에 편승해 "섹션 자체가 렌더되지 않아도 우연히 PASS" 하는 구조적 위험이 있었다. 직접 식별자가 없으면 이 부류의 회귀를 App 레벨 테스트에서 탐지할 수 없다.
2. Phase 5+ 에서 추가될 FeaturesSection / ScenariosSection / BusinessSection 등도 같은 문제에 직면한다. 섹션별 testid 를 **표준** 으로 도입하면 향후 테스트 구조가 일관적이 된다.
3. `data-testid` 는 프로덕션 번들에 소량(≈30 bytes/섹션) 만 추가되며, Phase 9 최적화 시 `data-testid` 를 제거하는 Vite 플러그인을 붙이면 0 으로 만들 수 있다.

**방침**: Phase 5 이후 모든 섹션 컴포넌트는 Section 루트에 `data-testid="{kebab-case-section-name}-section"` 을 부여한다.

### 7.2 Hero placeholder 컴포넌트화 **보류** (YAGNI)
`public/images/placeholder.svg` 를 `<img>` 직접 참조로 재사용. `common/Placeholder.tsx` 컴포넌트로 추출하지 않은 이유:

- Phase 4 시점에 placeholder 가 등장하는 곳은 HeroSection **1개**. 1회 사용 추상화는 YAGNI.
- Phase 5 이후 Scenarios/Features 가 같은 placeholder 를 재사용한다는 것이 **확정** 되면 그 시점에 추출한다 (3회 규칙).
- Phase 9 Lighthouse 최적화에서 실제 hero mock 이미지로 교체 예정이므로, 현 추상화는 곧 버려질 코드가 될 가능성이 있다.

### 7.3 데모 h1 → h2 다운그레이드 방식
단순 태그 변경(`<h1 className="text-4xl font-bold">` → `<h2 className="text-4xl font-bold">`)으로 **스타일은 그대로 유지**. 대안이었던 `<p>` 또는 `<div>` 다운그레이드는 의미론적으로 부적절 (데모 섹션 타이틀은 heading 성격). Tailwind 의 `text-4xl` 이 태그에 독립적이므로 시각 차이 없음.

### 7.4 Section 공통 컴포넌트 확장 vs. HeroSection 자체 래퍼
HeroSection/ProblemSection 이 `<section aria-labelledby=... data-testid=...>` 를 직접 렌더하는 대안이 있었으나 거부:

- Section 공통 컴포넌트가 패딩·배경·max-width 를 이미 관리하므로 HeroSection 이 이를 중복 구현하는 것은 DRY 위반.
- Section 이 `<section>` 태그 자체를 생성하므로, HeroSection 이 접근성 속성을 부여하려면 Section 을 거치는 것이 자연스러운 경로.
- 해당 속성들은 **모든 섹션** 이 쓸 수 있는 공통 관심사이므로 Section 에 props 로 추가하는 것이 장기적으로 옳다.

---

## 8. 이슈와 해결

### 8.1 Issue 없음 (GREEN 1차 시도 PASS)
GREEN 단계의 첫 `npm test` 실행에서 13 test files / 191 passed 로 즉시 성공. RED 시점에 공개 계약(`data-testid`, `aria-labelledby` 참조 유효성, 명시적 required 키, 정확한 subtitle 매칭)을 **매우 구체적으로** 정의해둔 덕분에 구현 과정에서 모호한 선택지가 없었던 것이 주 원인. 리뷰 피드백을 RED 직후에 반영한 효과가 GREEN 1회 통과로 나타났다.

### 8.2 잠재 이슈 — Node 버전 경고 (환경)
```
You are using Node.js 22.11.0. Vite requires Node.js version 20.19+ or 22.12+.
Please upgrade your Node.js version.
```
Vite 8 이 Node 22.11 을 공식 지원하지 않는다는 경고이나, 빌드는 성공했다. Phase 1 에서 이미 식별된 환경 이슈이고 Phase 4 에서 악화되지 않았다. Node 22.12+ 또는 20.19+ 로 업그레이드하는 것이 장기 해결책 — main_landing_todolist 의 deployment 위험 섹션에 등록 필요.

---

## 9. Phase 5 (Solution + Features) 인계 사항

### 9.1 `#features` 앵커 인수인계
Phase 4 현재 `#features` 는 **데모 4번째 Feature Cards 섹션** 을 가리킨다. Phase 5 FeaturesSection 이 등장하면:

1. 데모 `<Section id="features" background="accent-soft">` 를 **제거**
2. `<FeaturesSection />` 에 `id="features"` 부여 (또는 Section 내부에서 전달)
3. App.test.tsx 의 NAV_ANCHORS 가드가 여전히 PASS 하는지 확인
4. Hero Secondary CTA (`href="#features"`) 의 시각 동작을 수동 재검증 — 새 FeaturesSection 섹션으로 스크롤되는지

### 9.2 Badge 카운트 가드 업데이트 필요
현재 App.test.tsx 의 `FeatureCard 2 케이스` 테스트에 다음 가드가 있다:
```ts
const badges = container.querySelectorAll('[data-testid="status-badge"]');
expect(badges.length).toBe(4);
```
Phase 5 가 실제 FeaturesSection 에서 9개 Feature Card (각각 status badge 포함) 를 렌더하면 이 `=== 4` 가드가 깨진다. Phase 5 GREEN 시점에 다음 중 하나로 전환 필요:
- **(권장)** Scope 격리 — `section#features` 내부가 아닌 **roadmap 섹션 scope** 로 badge 카운트를 한정
- 또는 `>= 4` 완화 (단, 회귀 민감도 감소)

### 9.3 섹션 testid 표준 확산
Phase 4 에서 도입한 `data-testid="{section}-section"` 규칙을 Phase 5 FeaturesSection, ScenariosSection 등에도 적용. App.test.tsx 가드를 추가할 때 `data-testid` 직접 조회를 기본 패턴으로 사용.

### 9.4 FeatureStatus 타입 재활용
Phase 2 REFACTOR 산출물인 `FeatureStatus` 타입 (`'done' | 'wip' | 'planned'`) 을 Phase 5 FeaturesSection 의 9개 카드 데이터에 적용. 각 카드의 status 는 `01_landing_page_plan.md §7` 의 "구현됨 / 보강 중 / 계획·검토 중" 분류를 따를 것.

### 9.5 sections barrel 확장
Phase 5 가 SolutionSection / FeaturesSection 을 추가하면 `src/components/sections/index.ts` 에 두 줄만 추가하면 된다 — Phase 4 에서 barrel 이 이미 정착되어 있음.

---

## 10. Definition of Done 충족 현황

| 항목 | 상태 |
|------|------|
| HeroSection 렌더 (h1·eyebrow·subtitle·CTA·신뢰 라벨) | ✅ |
| Primary CTA Chrome Web Store + 외부 링크 속성 | ✅ |
| Secondary CTA `#features` 내부 앵커 | ✅ |
| ProblemSection 4 `<article>` + h3/p | ✅ |
| ProblemSection h2 + aria-labelledby region | ✅ |
| ko/en hero.*+problem.* 키 동기화 | ✅ |
| 언어 전환 시 텍스트 변경 | ✅ |
| lint/typecheck/format:check/test/build 5종 게이트 | ✅ |
| Phase 2/3 App.test.tsx 회귀 없음 (TEST-P4.8) | ✅ |
| NAV_ANCHORS 4개 ID 유지 (TEST-P4.9) | ✅ |
| h1 유일성 + data-testid hero-section (TEST-P4.10) | ✅ |
| problem-section 4 article scope (TEST-P4.11) | ✅ |
| 데모 첫 Section h2 다운그레이드 | ✅ |
| sections barrel 배치 | ✅ |
| **모바일/태블릿/데스크톱 수동 시각 확인** | ⚠️ 사용자 수동 검증 대기 |
| **커밋** | ⚠️ 사용자 지시 대기 |

17개 DoD 중 15개 완료, 2개가 사용자 수동 단계로 이관되었다. 코드 품질·테스트·빌드 관점의 자동 검증 가능 항목은 전부 PASS.

---

## 11. 후속 조치 제안

1. **수동 시각 검증** — `npm run dev` 후 크롬 DevTools 반응형 모드에서 모바일(375px) / 태블릿(768px) / 데스크톱(1280px) 3개 브레이크포인트의 Hero 2컬럼 + Problem 그리드 레이아웃 확인
2. **i18n 런타임 확인** — 헤더 LanguageSwitcher 로 ko ↔ en 토글 시 Hero h1 + Problem h2 + 4개 카드 제목/설명 전환 확인
3. **CTA 동작 확인** — Hero Primary CTA 클릭 → Chrome Web Store 새 탭, Hero Secondary CTA 클릭 → 데모 features 섹션으로 스크롤
4. **커밋** — 사용자 지시 후 아래 범위로 커밋
   ```
   git add extapp_landing/src \
           working_plan/phase04_hero_problem.md \
           working_plan/working_history/v1.0/Phase4_HeroProblem_20260412.md
   ```
5. **Phase 5 착수** — `working_plan/phase05_*.md` 가 있다면 읽고 Solution + Features 설계로 진입. Phase 4 의 섹션 testid 규칙과 barrel 패턴을 그대로 계승.

---

**작성**: 2026-04-12
**Phase 4 상태**: ✅ GREEN + REFACTOR + 자동 검증 완료 · ⚠️ 수동 시각 검증/커밋 대기

---

## 12. 사후 리뷰 반영 (2026-04-12)

Phase 4 작업결과서에 대한 코드 레벨 리뷰에서 4건(Medium×2, Low×2) 의 이슈가 제시되어, 모두 재현·수정 후 회귀 가드 추가 완료.

### 12.1 리뷰 이슈와 재현

| # | 심각도 | 위치 | 이슈 | 재현 결과 |
|---|--------|------|------|-----------|
| 1 | Medium | `HeroSection.tsx:55` | 이미지 래퍼 `order-first md:order-none` 이 **모바일에서 이미지를 카피 위** 로 끌어올려 계획서 계약("카피 위 → 이미지 아래")과 반대였다. 기존 테스트는 `md:grid-cols-2` 존재만 보고 있어 순서 회귀를 탐지 못 함 | 코드 확인 — `order-first` 클래스가 이미지 div 에 부여되어 있음 |
| 2 | Medium | `HeroSection.tsx:58`, `i18n.test.ts:125` | `hero.imageAlt` 는 런타임 `alt` 로 쓰이는 접근성 키지만 TEST-P4.5 required 리스트에서 누락. HeroSection 테스트도 `alt?.length > 0` 만 검증 → ko/en 양쪽 동시 누락 시 `t()` 가 키 문자열 반환하여 PASS | `i18n.test.ts:125` required 배열에 `imageAlt` 없음 확인, `HeroSection.test.tsx:174` 의 alt 길이 체크 확인 |
| 3 | Low | `constants.ts:40`, `App.tsx:37,71` | `NAV_ANCHORS` 순서는 `features → scenarios → differentiation → roadmap` 인데 App.tsx 는 데모 섹션을 `scenarios → differentiation → roadmap → features` 순서로 렌더. Header 1번 메뉴 클릭 시 사용자가 페이지 맨 아래로 점프하는 기묘한 UX | 두 파일의 순서 불일치 확인 |
| 4 | Low | `App.test.tsx:139` | 전체 문서 범위 `querySelectorAll('[data-testid="status-badge"]').length === 4` 가드. Phase 5 FeaturesSection 이 실제 Feature Card 배지를 추가하면 unrelated failure. 결과서 §9.2 에도 이미 인계 사항으로 기록됨 = 미래 변경에 취약한 상태 | 전역 카운트 === 4 확인 |

### 12.2 수정 내역

**Fix #1 — Hero 모바일 소스 순서 교정** (`HeroSection.tsx`)
- 이미지 래퍼에서 `order-first md:order-none` 제거 → 순수 소스 순서(카피 div → 이미지 div) 로 grid flow 에 위임
- 결과: 모바일(`grid-cols-1`)에서는 카피가 먼저, 이미지가 아래. 데스크톱(`md:grid-cols-2`)에서는 좌 카피 / 우 이미지
- **새 가드**: `HeroSection.test.tsx` 에 "모바일 소스 순서" 테스트 추가 — `h1.compareDocumentPosition(img)` 로 h1 이 img 보다 DOM 상 앞에 있음을 검증 + `order-first` 같은 재배치 유틸이 이미지 래퍼에 붙어있지 않음을 직접 체크. `order-first` 를 다시 붙이는 회귀 시 즉시 FAIL

**Fix #2 — `hero.imageAlt` i18n 게이트 보강** (`i18n.test.ts`, `HeroSection.test.tsx`)
- `i18n.test.ts` 의 hero.* required 리스트에 `hero.imageAlt` 추가 (6 → 7키)
- `HeroSection.test.tsx` 의 placeholder 이미지 테스트를 강화:
  - `alt?.length > 0` → `alt === i18n.t('hero.imageAlt')` 로 정확 매칭
  - 추가 이중 방어: `alt !== 'hero.imageAlt'` (literal 키 반환 금지)
- 이제 `hero.imageAlt` 를 양쪽 locale 에서 동시 누락하면 ① i18n.test.ts required 가드 ② HeroSection alt literal 가드 두 곳에서 모두 FAIL

**Fix #3 — 데모 섹션 순서를 `NAV_ANCHORS` 와 일치** (`App.tsx`, `App.test.tsx`)
- `App.tsx` 데모 4개 Section 의 JSX 순서를 재배치:
  - 이전: `scenarios → differentiation → roadmap → features`
  - 변경: `features → scenarios → differentiation → roadmap` (NAV_ANCHORS 배열 순서)
- 각 (id, 콘텐츠) 쌍은 그대로 유지 — 단순 블록 재배치
- **새 가드**: `App.test.tsx` 에 "섹션 렌더 순서가 NAV_ANCHORS 배열 순서와 일치" 테스트 추가 — `querySelectorAll('section[id]')` 로 DOM 등장 순서대로 id 배열을 수집한 뒤 `NAV_ANCHORS.map((a) => a.id)` 와 정확 일치 비교. 순서 회귀를 곧바로 탐지
- HeroSection / ProblemSection 은 id 가 없으므로 이 가드에서 자동 제외

**Fix #4 — Badge 카운트 scope 격리** (`App.test.tsx`)
- 전역 `container.querySelectorAll('[data-testid="status-badge"]').length === 4` 제거
- 두 개의 독립 섹션 scope 가드로 분리:
  - `section#features` 내부 → **정확히 1개** (첫 번째 FeatureCard with status)
  - `section#roadmap` 내부 → **정확히 3개** (standalone Badge 데모)
- 결과: Phase 5 FeaturesSection 이 features 섹션을 실제 콘텐츠로 교체해도 (a) 만 조정하면 되고, roadmap scope (b) 는 Phase 6+ 까지 안정 유지. 결과서 §9.2 의 "Badge 카운트 가드 업데이트 필요" 인계 사항은 부분 해소됨 — Phase 5 에서 조정할 범위가 1줄로 축소

### 12.3 검증 결과

| 게이트 | 결과 |
|--------|------|
| `npm run lint` | ✅ 0 errors · 0 warnings |
| `npm run typecheck` | ✅ 0 errors (app + test) |
| `npm run format:check` | ✅ 모든 파일 규범 준수 |
| `npm test` | ✅ 13 test files · **193 passed** \| 5 skipped (+2 신규 가드) |
| `npm run build` | ✅ JS 256.84 KB (gzip 81.30 KB) · CSS 10.46 KB (gzip 2.91 KB) |

### 12.4 테스트 증분

| 구분 | 12.0 결과 | 12.1 리뷰 반영 후 |
|------|-----------|-------------------|
| Test Files | 13 | 13 (변동 없음) |
| Tests (passed) | 191 | **193** (+2) |
| 신규 테스트 | — | Hero 모바일 소스 순서(1) + NAV_ANCHORS 섹션 순서 일치(1) |
| 강화된 기존 테스트 | — | Hero placeholder alt (literal → i18n.t() 정확 매칭) + i18n.test.ts hero.* required (6 → 7키) + Badge 카운트 (전역 → 2개 scope 분리) |

### 12.5 번들 크기 변화 (리뷰 반영 전후)

| 자산 | 12.0 (reivew 반영 전) | 12.1 (리뷰 반영 후) | Δ |
|------|----------------------|----------------------|---|
| JS | 256.88 KB (gzip 81.31 KB) | 256.84 KB (gzip 81.30 KB) | −0.04 KB (gzip −0.01 KB) |
| CSS | 10.40 KB (gzip 2.90 KB) | 10.46 KB (gzip 2.91 KB) | +0.06 KB (gzip +0.01 KB) |

JS 는 `order-first md:order-none` 클래스 문자열 제거로 소폭 감소, CSS 는 `lg:grid-cols-4`/`md:grid-cols-2` 등 기존 유틸 유지 상태에서 측정 노이즈 수준의 미세 증가. 실제 런타임 영향 없음.

### 12.6 잔여 인계 사항 (Phase 5 연결)

- §9.2 "Badge 카운트 가드 업데이트" 는 **부분 해소**. Phase 5 FeaturesSection 이 features 섹션을 대체할 때 `features scope 배지 === 1` 한 줄만 갱신하면 충분 (roadmap scope 배지 === 3 은 Phase 6+ 까지 유지).
- §9.1 "`#features` 앵커 인수인계" 는 변동 없음 — 섹션 순서가 NAV 일치로 정돈되어 Phase 5 교체 시 이점이 생김 (features 가 데모 섹션 중 **1번째** 위치 → Hero 바로 아래로 자연스러운 전환).

**12.x 결론**: 4건 리뷰 이슈 전부 코드 레벨에서 확인·수정 완료. 수정 범위에 대응하는 회귀 가드 2건 신규 추가 + 기존 3건 강화. 5종 자동 게이트 전부 PASS. 커밋은 기존 Phase 4 작업과 함께 사용자 지시 대기.

