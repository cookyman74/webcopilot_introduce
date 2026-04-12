# Phase 8 작업 결과서 — RoadmapSection + BusinessSection + FinalCTASection

> **작업 일자**: 2026-04-12
> **대응 계획서**: [phase08_roadmap_finalcta.md](../../phase08_roadmap_finalcta.md)
> **Phase 7 베이스라인**: [Phase7_AIModesSafety_20260412.md](./Phase7_AIModesSafety_20260412.md)
> **마일스톤**: **11개 섹션 본문 완성** — 다음 Phase 는 품질/SEO(P9) + 배포(P10)

---

## 1. 목표와 범위

Phase 8 은 랜딩 페이지 본문의 마지막 3개 섹션을 구현해 **11개 섹션을 완성**했다:
- **RoadmapSection**: 3개 확장 방향 (wip/planned — done 금지)
- **BusinessSection** (v2): B2B 기술 파트너십 제안 (Badge 금지, mailto CTA)
- **FinalCTASection**: 일반 사용자 설치 유도 (Chrome Web Store CTA, 파트너십 문구 금지)

핵심 전환:
- 마지막 데모 `<Section id="roadmap">` 삭제 — **데모 섹션 전부 소멸**
- `Section`/`Badge`/`demo.*` import 및 i18n 키 전부 App.tsx 에서 제거
- `accent-soft` 배경 FinalCTASection 으로 복구 → **4종 배경 가드 복구**
- `PARTNERSHIP_CONTACT` 상수 도입 (`constants.ts`)

TDD 사이클: RED → GREEN (1차 시도, P7 렌더 순서 가드 충돌 수정 후 PASS) → REFACTOR (선반영 완료)

---

## 2. 수정/생성 파일 요약

### 2.1 신규 파일
| 파일 | 역할 |
|------|------|
| `src/components/sections/RoadmapSection.tsx` | 로드맵 3카드 (wip/planned) |
| `src/components/sections/RoadmapSection.test.tsx` | 11 테스트 |
| `src/components/sections/BusinessSection.tsx` | B2B 3카드 (Badge 없음) + mailto CTA |
| `src/components/sections/BusinessSection.test.tsx` | 13 테스트 |
| `src/components/sections/FinalCTASection.tsx` | 최종 CTA (accent-soft) |
| `src/components/sections/FinalCTASection.test.tsx` | 12 테스트 |
| 본 결과서 | |

### 2.2 수정 파일
| 파일 | 변경 |
|------|------|
| `src/lib/constants.ts` | `PARTNERSHIP_CONTACT` 추가 |
| `src/lib/constants.test.ts` | PARTNERSHIP_CONTACT 이메일 형식 가드 |
| `src/i18n/locales/ko.json` | `roadmap.*` + `business.*` + `finalCta.*` 추가 · `demo.*` 삭제 |
| `src/i18n/locales/en.json` | 동일 |
| `src/i18n/i18n.test.ts` | roadmap/business/finalCta required-key 가드 3건 |
| `src/App.tsx` | 11개 섹션 조립 + 데모 roadmap 삭제 + Section/Badge/useTranslation import 제거 |
| `src/App.test.tsx` | P8 구조 가드 4건 + 배경 4종 복구 + roadmap Badge 데모 삭제 + P7 렌더 순서 11개로 갱신 |
| `src/components/sections/index.ts` | 3개 export 추가 (11개 total) |

---

## 3. 테스트 결과

```
lint         ✅ 0 errors
typecheck    ✅ 0 errors
format:check ✅ All files compliant
test         ✅ 23 test files · 367 passed | 5 skipped (372)
build        ✅ JS 284.20 KB (gzip 89.79 KB) · CSS 11.91 KB (gzip 3.22 KB)
```

### 테스트 증분
| 구분 | Phase 7 | Phase 8 | Δ |
|------|---------|---------|---|
| Test Files | 20 | **23** | +3 |
| Tests passed | 326 | **367** | +41 |

---

## 4. 번들 크기 변화

| 자산 | Phase 7 | Phase 8 | Δ |
|------|---------|---------|---|
| JS | 279.86 KB (gzip 88.71 KB) | **284.20 KB** (gzip 89.79 KB) | +4.34 KB (gzip +1.08 KB) |
| CSS | 11.90 KB (gzip 3.22 KB) | **11.91 KB** (gzip 3.22 KB) | +0.01 KB |

Phase 9 gzip 목표(JS < 300 KB): 89.79 KB → **210.21 KB 여유**. 11개 섹션 완성 후에도 gzip 90 KB 미만 유지.

---

## 5. 주요 결정 기록

### 5.1 RoadmapSection 의 Floating Helper = planned
FeaturesSection 에서는 Floating Helper 가 `done` (구현 완료) 이지만, RoadmapSection 에서는 "빠른 진입 UX 준비" 라는 **다음 단계 방향**이므로 `planned` 로 표시. 두 섹션이 같은 이름을 다른 상태로 쓰는 것은 의미상 정합적 — Features 는 현재 기능, Roadmap 은 미래 방향.

### 5.2 BusinessSection Badge 금지 테스트 전략
- `data-testid="status-badge"` 카운트 === 0
- ko/en 양쪽에서 "구현됨"/"보강 중"/"계획·검토 중"/"Implemented"/"In Progress"/"Planned"/"Under Review" 텍스트 부재 검증
- FeatureCard `WithoutStatus` 타입으로 타입 레벨에서도 Badge 차단

### 5.3 FinalCTASection mailto 금지 테스트 전략
- `href.startsWith('mailto:')` 인 링크 부재
- ko: "파트너십"/"문의" 텍스트 부재
- en: "partnership"/"contact us" 텍스트 부재

### 5.4 데모 완전 소멸
Phase 2 에서 도입된 데모 섹션이 Phase 8 에서 **전부 삭제** 됨:
- Phase 5: `#features` 데모 → FeaturesSection
- Phase 6: `#scenarios` + `#differentiation` 데모 → ScenariosSection + DifferentiationSection
- **Phase 8**: `#roadmap` 데모 → RoadmapSection
- `demo.*` i18n 키 삭제, `Section`/`Badge` common import 도 App.tsx 에서 제거

---

## 6. Phase 9 (반응형 / a11y / SEO / 빌드) 인계 사항

### 6.1 본문 완성 기준선
- 11개 섹션 전부 렌더, 23 test files, 367 passed
- JS gzip 89.79 KB — Phase 9 최적화 전 마지막 측정값

### 6.2 배경 4종 복구 완료
Phase 8 FinalCTASection(`accent-soft`) 으로 4종 배경 가드 복구됨. Phase 9 에서 변경 불필요.

### 6.3 SEO / meta / OG
Phase 9 에서 `index.html` 에 meta description, OG tags, favicon 등 추가 예정.

### 6.4 Lighthouse 측정
Phase 9 에서 LCP/CLS/Accessibility score 측정 + placeholder 이미지 최적화.

---

---

## 7. 리뷰 반영 (2026-04-12)

### 7.1 수정 내역

| # | 심각도 | 이슈 | 수정 |
|---|--------|------|------|
| 1 | High | PARTNERSHIP_CONTACT 가 placeholder `partnership@example.com` | git user email `cookyman@gmail.com` 으로 교체. FIXME 유지 — 전용 파트너십 이메일 확정 시 Phase 10 전 교체 |
| 2 | Medium | BusinessSection/FinalCTA secondary CTA 가 `href="#"` dead link | `DOCS_URL` 상수 도입 (`https://github.com/anthropics` placeholder). 두 섹션 모두 `DOCS_URL` 로 교체. `constants.test.ts` 에 URL 형식 가드 추가. FIXME 유지 |
| 3 | Low | FinalCTASection 에만 `aria-labelledby` 누락 | `HEADING_ID = 'finalcta-heading'` + `h2 id` + `aria-labelledby` 추가. 테스트에 landmark 가드 추가 |

### 7.2 검증 결과
```
test: 23 files · 369 passed | 5 skipped (374)
build: JS 284.28 KB (gzip 89.82) · CSS 11.91 KB (gzip 3.22)
```

### 7.3 수정 파일
| 파일 | 변경 |
|------|------|
| `src/lib/constants.ts` | PARTNERSHIP_CONTACT 이메일 교체 + DOCS_URL 상수 추가 |
| `src/lib/constants.test.ts` | DOCS_URL import + https 형식 가드 |
| `src/components/sections/BusinessSection.tsx` | DOCS_URL import + secondary CTA `href="#"` → `DOCS_URL` |
| `src/components/sections/FinalCTASection.tsx` | DOCS_URL import + secondary CTA → DOCS_URL + aria-labelledby + heading id |
| `src/components/sections/FinalCTASection.test.tsx` | aria-labelledby landmark 가드 추가 |

**작성**: 2026-04-12
**Phase 8 상태**: ✅ GREEN + REFACTOR + 리뷰 반영 + 자동 검증 완료 · 커밋 대기
**마일스톤**: 11개 섹션 본문 완성
