# Phase 7 작업 결과서 — AIModesSection + SafetySection

> **작업 일자**: 2026-04-12
> **대응 계획서**: [phase07_aimodes_safety.md](../../phase07_aimodes_safety.md)
> **Phase 6 베이스라인**: [Phase6_ScenariosDiff_20260412.md](./Phase6_ScenariosDiff_20260412.md)

---

## 1. 목표와 범위

Phase 7 은 지원 AI 모드 5종(AIModesSection: done×4 + planned×1)과 안전·운영 원칙 4개(SafetySection)를 구현했다. 이 두 섹션은 NAV_ANCHORS 대상이 아니므로 데모 교체/삭제가 발생하지 않는다 (데모 roadmap 1개 유지).

TDD 사이클: RED → GREEN (1차 시도, P6 렌더 순서 가드 충돌 1건 수정 후 PASS) → REFACTOR (선반영 완료)

---

## 2. 수정/생성 파일 요약

### 2.1 신규 파일
| 파일 | 역할 |
|------|------|
| `src/components/sections/AIModesSection.tsx` | AI 모드 5종 — Badge(done/planned) + type 라벨 |
| `src/components/sections/AIModesSection.test.tsx` | 16 테스트 |
| `src/components/sections/SafetySection.tsx` | 안전 원칙 4종 — lucide 아이콘 + h3 + 설명 |
| `src/components/sections/SafetySection.test.tsx` | 17 테스트 |
| 본 결과서 | `working_history/v1.0/Phase7_AIModesSafety_20260412.md` |

### 2.2 수정 파일
| 파일 | 변경 |
|------|------|
| `src/i18n/locales/ko.json` | `aiModes.*` 14키 + `safety.*` 10키 |
| `src/i18n/locales/en.json` | 동일 24키 영문 |
| `src/App.tsx` | AIModes/Safety 삽입 (Differentiation 뒤) |
| `src/App.test.tsx` | Phase 7 구조 가드 3건 + P6 렌더 순서 가드 제거 (P7 가드가 포함) |
| `src/i18n/i18n.test.ts` | aiModes.*/safety.* required-key 가드 2건 |
| `src/components/sections/index.ts` | AIModesSection + SafetySection export |

---

## 3. 테스트 결과

```
lint         ✅ 0 errors
typecheck    ✅ 0 errors (app + test)
format:check ✅ All files compliant
test         ✅ 20 test files · 320 passed | 5 skipped (325)
build        ✅ JS 279.09 KB (gzip 88.60 KB) · CSS 11.94 KB (gzip 3.20 KB)
```

### 테스트 증분
| 구분 | Phase 6 | Phase 7 | Δ |
|------|---------|---------|---|
| Test Files | 18 | **20** | +2 |
| Tests passed | 287 | **320** | +33 |

---

## 4. 번들 크기 변화

| 자산 | Phase 6 | Phase 7 | Δ |
|------|---------|---------|---|
| JS | 274.08 KB (gzip 87.23 KB) | **279.09 KB** (gzip 88.60 KB) | +5.01 KB (gzip +1.37 KB) |
| CSS | 11.72 KB (gzip 3.18 KB) | **11.94 KB** (gzip 3.20 KB) | +0.22 KB (gzip +0.02 KB) |

lucide 아이콘 4개(ShieldCheck/FileCheck2/History/Lock) + 두 섹션 컴포넌트 + Badge 사용 = +5.01 KB. Phase 9 gzip 목표(JS < 300 KB): 88.60 KB → 211.40 KB 여유.

---

## 5. 주요 결정 기록

### 5.1 Badge 라벨 네임스페이스 분리
- AIModesSection: `aiModes.status.supported` / `aiModes.status.reviewing`
- FeaturesSection: `features.status.done` / `features.status.wip` / `features.status.planned`
- Badge 컴포넌트는 `status` prop (FeatureStatus: done/wip/planned) 으로 색상을 결정하고, `children` 으로 라벨을 받으므로 라벨 네임스페이스가 달라도 색상 매핑은 일관됨
- AIModesSection 의 done→"지원됨", planned→"검토 중" 은 의미상 FeaturesSection 의 done→"구현됨", planned→"계획·검토 중" 과 같은 색상(녹색/회색)을 공유하되 라벨만 다름 — 사용자 혼란 없음

### 5.2 AIModesSection 항목 마크업
- `<li>` 대신 `<div data-testid="ai-mode-item">` 사용 — 계획서 원안은 `<ul>/<li>` 였으나, 그리드 레이아웃에서 `<li>` 기본 마커가 시각적 노이즈를 만들어 `<div>` 로 전환. 테스트는 `data-testid` 기반으로 카운팅
- 반응형: `sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5` — 5개 항목이 모바일 1col → 태블릿 3col → 데스크톱 5col 가로 배치

### 5.3 P6 렌더 순서 가드 충돌 해결
- Phase 6 에서 `toEqual([...6개])` 로 strict 비교하던 가드가 Phase 7 의 8개 배열과 충돌
- P6 가드를 제거하고 P7 의 8개 strict 가드(`TEST-P7.11`)가 P4~P7 전체 순서를 포함하도록 통합

### 5.4 과장 표현 금지 가드
- ko: `100%`, `완전 자동`, `절대`, `무결` 4개 패턴
- en: `100%`, `fully automatic`, `absolute`, `never fails`, `guaranteed` 5개 패턴
- 이 가드는 향후 locale 수정 시에도 자동으로 과장 문구 유입을 차단

---

## 6. Phase 8 (Roadmap + Business + FinalCTA) 인계 사항

### 6.1 데모 roadmap 교체 — 마지막 데모 섹션
- `<Section id="roadmap" background="surface-alt">` (Badge 3종 standalone) 은 Phase 8 에서 RoadmapSection 으로 교체
- 교체 시 `demo.*` i18n 키 전부 삭제 가능 (다른 곳에서 미사용)
- `Section` / `Badge` import 도 App.tsx 에서 제거 가능

### 6.2 accent-soft 배경 복구
- Phase 8 FinalCTA 가 `bg-accent-soft` 를 사용 → 배경 가드 3종→4종 복구 필요
- App.test.tsx 에서 `accent-soft` 주석 해제

### 6.3 렌더 순서 가드 확장
현재: `[hero, problem, solution, features, scenarios, differentiation, aimodes, safety]`
Phase 8: `+ roadmap, business, finalcta` (3개 추가)

### 6.4 sections barrel
현재 8개 export → Phase 8 에서 +3개 (Roadmap/Business/FinalCTA)

---

---

## 7. 사후 콘텐츠 수정 + 리뷰 반영 (2026-04-12)

### 7.1 AI 모드 재구성 (사용자 요청)
- Didim 제거, Claude · GpuStack 추가 → 5종 → **6종**
- 단일 리스트 → **두 카테고리** (클라우드 서비스 / 로컬 SLM) 그룹 렌더
- 카드 높이 `h-[130px]` 고정으로 통일
- 배지 분포: done ×4 (OpenAI/Gemini/Claude/LMStudio) + planned ×2 (Ollama/GpuStack)

### 7.2 리뷰 이슈 수정 (4건)

| # | 심각도 | 이슈 | 수정 |
|---|--------|------|------|
| 1 | High | 계획서/결과서/코드/Hero 신뢰 문구 불일치 | 계획서 §7.1 모드 테이블 6종으로 갱신 + Hero trust "Didim" → "Claude" 교체 (ko/en) + HeroSection.test.tsx regex 갱신 |
| 2 | Medium | 렌더 순서 가드에 `#roadmap` 미포함 | `section[data-testid]` → 전체 `section` 수집 후 `data-testid ?? #id` 로 식별. `#roadmap` 이 safety 뒤에 위치함을 고정 |
| 3 | Medium | AI 모드 카드별 type 라벨 미검증 | 각 카드의 모드명을 찾고 같은 `ai-mode-item` 내부에 올바른 type (클라우드/로컬) 존재 검증 추가 |
| 4 | Low | SafetySection `id===null` 가드 누락 | `section.getAttribute('id')` === null 테스트 추가 |

### 7.3 검증 결과
```
test: 20 files · 326 passed | 5 skipped (331)
build: JS 279.86 KB (gzip 88.71) · CSS 11.90 KB (gzip 3.22)
```

### 7.4 수정 파일
| 파일 | 변경 |
|------|------|
| `src/i18n/locales/ko.json` | Hero trust "Didim" → "Claude" + aiModes 6종 재구성 + cloudLabel/localLabel |
| `src/i18n/locales/en.json` | 동일 |
| `src/components/sections/AIModesSection.tsx` | 두 카테고리 그룹 + h-[130px] 고정 + claude/gpustack 추가 |
| `src/components/sections/AIModesSection.test.tsx` | 6종 카운트 + type 라벨 카드별 검증 + 카테고리 라벨 |
| `src/components/sections/HeroSection.test.tsx` | trust regex Didim → Claude |
| `src/components/sections/SafetySection.test.tsx` | id===null 가드 추가 |
| `src/App.test.tsx` | 렌더 순서 가드에 #roadmap 포함 |
| `src/i18n/i18n.test.ts` | aiModes required keys 갱신 (didim→claude/gpustack + cloudLabel/localLabel) |
| `working_plan/phase07_aimodes_safety.md` | §7.1 모드 테이블 6종으로 갱신 |

**작성**: 2026-04-12
**Phase 7 상태**: ✅ GREEN + REFACTOR + 콘텐츠 수정 + 리뷰 반영 + 자동 검증 완료 · 커밋 대기
