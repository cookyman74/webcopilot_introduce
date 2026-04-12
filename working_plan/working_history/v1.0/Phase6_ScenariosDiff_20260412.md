# Phase 6 작업 결과서 — ScenariosSection + DifferentiationSection

> **작업 일자**: 2026-04-12
> **대응 계획서**: [phase06_scenarios_differentiation.md](../../phase06_scenarios_differentiation.md)
> **Phase 5 베이스라인**: [Phase5_SolutionFeatures_20260412.md](./Phase5_SolutionFeatures_20260412.md)

---

## 1. 목표와 범위

Phase 6 는 4개 사용 시나리오(ScenariosSection)와 3개 차별화 비교 카드(DifferentiationSection)를 구현했다. 핵심 전환은 데모 `<Section id="scenarios">` (Design System Demo)와 `<Section id="differentiation">` (Buttons) 을 삭제하고 실제 컴포넌트로 대체한 것이다. 이제 데모 섹션은 `roadmap` 1개만 잔존한다.

완료된 TDD 사이클:
1. **RED** — ScenariosSection/DifferentiationSection 테스트 + App.test.tsx Phase 6 구조 가드 + i18n required-key 가드
2. **RED 리뷰 반영** — step 라벨 regex→i18n.t() 강화, before/after i18n 직접 검증, aria-labelledby 추가, 커밋 누락 해결
3. **GREEN** — locale 키 추가 → 두 섹션 구현 → App.tsx 갱신 (데모 2개 제거) → barrel 확장 → 1차 시도 전부 PASS
4. **REFACTOR** — GREEN 에서 선반영 완료 (데이터 배열화, Button import 제거), 추가 변경 없음

---

## 2. 수정/생성 파일 요약

### 2.1 신규 파일
| 파일 | 역할 |
|------|------|
| `src/components/sections/ScenariosSection.tsx` | Scenarios 섹션 — 4개 시나리오 카드 + lucide 아이콘 + step 라벨 |
| `src/components/sections/ScenariosSection.test.tsx` | 20 테스트 (TEST-P6.1~P6.3, P6.8/P6.9/P6.11) |
| `src/components/sections/DifferentiationSection.tsx` | Differentiation 섹션 — 3개 before→after 비교 카드 |
| `src/components/sections/DifferentiationSection.test.tsx` | 17 테스트 (TEST-P6.4~P6.6, P6.8/P6.9/P6.12) |
| 본 결과서 | `working_history/v1.0/Phase6_ScenariosDiff_20260412.md` |

### 2.2 수정 파일
| 파일 | 변경 요약 |
|------|----------|
| `src/i18n/locales/ko.json` | `scenarios.*` 13키 + `differentiation.*` 10키 추가 |
| `src/i18n/locales/en.json` | 동일 23키 영문 번역 |
| `src/App.tsx` | Scenarios/Differentiation 삽입 + 데모 2개 삭제 + Button import 제거 |
| `src/App.test.tsx` | Phase 6 구조 가드 5건 + 렌더 순서 확장 (Phase 5 가드 갱신) |
| `src/i18n/i18n.test.ts` | scenarios.*/differentiation.* required-key 가드 2건 |
| `src/components/sections/index.ts` | ScenariosSection + DifferentiationSection export |

### 2.3 패키지 변동
**없음.** lucide-react 는 Phase 5 에서 이미 설치됨. Phase 6 에서 추가 사용한 아이콘 5개 (Languages/FileEdit/LayoutGrid/Moon/ArrowRight) 는 tree-shaking 으로 자동 포함.

---

## 3. 테스트 결과

### 3.1 전체 게이트 (5종)
```
lint         ✅ 0 errors
typecheck    ✅ 0 errors (app + test)
format:check ✅ All files compliant
test         ✅ 17 test files · 272 passed | 5 skipped (277)
build        ✅ JS 271.54 KB (gzip 86.38 KB) · CSS 10.86 KB (gzip 2.98 KB)
```

### 3.2 테스트 증분
| 구분 | Phase 5 | Phase 6 | Δ |
|------|---------|---------|---|
| Test Files | 15 | **17** | +2 |
| Tests passed | 241 | **272** | +31 |
| Tests skipped | 5 | 5 | — |

### 3.3 Phase 6 신규 테스트 상세
| 파일 | 테스트 수 |
|------|----------|
| ScenariosSection.test.tsx | 20 |
| DifferentiationSection.test.tsx | 17 |
| i18n.test.ts 추가분 | 2 |
| App.test.tsx 추가/변경분 | +5 (P6 구조 가드) |

---

## 4. 번들 크기 변화

| 자산 | Phase 5 | Phase 6 | Δ |
|------|---------|---------|---|
| JS | 266.79 KB (gzip 85.00 KB) | **273.98 KB** (gzip 87.19 KB) | +7.19 KB (gzip +2.19 KB) |
| CSS | 10.62 KB (gzip 2.93 KB) | **11.72 KB** (gzip 3.18 KB) | +1.10 KB (gzip +0.25 KB) |

※ §7 사후 수정(시나리오 순서 재배치 + VideoModal 추가) 반영 수치. Phase 9 gzip 목표(JS < 300 KB): 현재 87.19 KB → 212.81 KB 여유.

---

## 5. 주요 결정 기록

### 5.1 데모 2개 삭제와 Button import 제거
- 데모 `<Section id="scenarios">` (Design System Demo) 와 `<Section id="differentiation">` (Buttons 데모) 삭제
- Button 데모가 사라지면서 App.tsx 에서 `Button` import 도 제거 (roadmap 데모는 Badge 만 사용)
- App.test.tsx 의 Button 관련 데모 테스트 6건은 Phase 5 리뷰에서 이미 삭제 완료

### 5.2 DifferentiationSection before/after 시각 구조
- before: `bg-surface` 회색 pill → `ArrowRight` 아이콘 → after: `bg-accent-soft` 파란 pill
- 구현 계획서 §5.6 의 "좌우 비교 카드" 스펙을 pill + 화살표 + pill 레이아웃으로 해석

### 5.3 ScenariosSection placeholder 이미지 영역
- 각 카드 하단에 `h-32 border-dashed bg-surface-alt` placeholder div 배치
- Phase 9 Lighthouse 최적화 시점에 실제 스크린샷으로 교체 예정

---

## 6. Phase 7 (AI Modes + Safety) 인계 사항

### 6.1 데모 섹션 잔존 현황
- `roadmap` 1개만 남음 — Phase 8 RoadmapSection 교체 시 `demo.*` i18n 키와 함께 삭제
- Phase 7 (AIModes + Safety) 은 NAV_ANCHORS 에 **없는** 섹션이므로 데모 교체 이슈 없음

### 6.2 렌더 순서 가드 확장 필요
현재: `[hero, problem, solution, features, scenarios, differentiation]`
Phase 7 에서 AIModes + Safety 추가 시 이 배열 확장 필요

### 6.3 sections barrel 확장
`src/components/sections/index.ts` 에 Phase 7 섹션 2줄 추가하면 됨 (6개 → 8개 export)

### 6.4 accent-soft 배경 여전히 부재
Phase 8 FinalCTA 에서 `bg-accent-soft` 복구 예정. Phase 7 의 AIModes(canvas) + Safety(surface) 에서도 accent-soft 사용 없음.

---

---

## 7. 사후 콘텐츠 수정 (2026-04-12)

### 7.1 시나리오 s4 카피 수정 — 스크립트 인젝션 핵심 가치 반영

**변경 사유**: "사이트 다크모드·광고 숨김" 이라는 결과물 나열만으로는 스크립트 인젝션의 핵심 가치("페이지를 자신만의 페이지로 만든다") 가 전달되지 않음. `extension_intro.md` 의 "사용자 맞춤형 사이트 확장 기능을 만드는 기반" 메시지와 정합성 확보 필요.

| | 변경 전 | 변경 후 |
|---|---|---|
| ko 제목 | 사이트 다크모드·광고 숨김 | **사이트별 맞춤 스크립트로 확장** |
| ko 설명 | 한 번 만든 스크립트를 다음 방문에도 재사용합니다. | **다크모드, 광고 숨김, UI 변경 등 한 번 만든 스크립트를 영구 자산으로 등록해 매번 자동 적용합니다.** |
| en 제목 | Site dark mode & ad hiding | **Extend with per-site custom scripts** |
| en 설명 | Reuse scripts you created on every future visit. | **Dark mode, ad hiding, UI tweaks — register one-time scripts as permanent assets that auto-apply on every visit.** |

### 7.2 시나리오 순서 재배치 — 스크립트 확장을 Step 1 으로 승격

**변경 사유**: 스크립트 인젝션 기반 확장이 제품의 가장 핵심적인 차별 기능이므로 Step 1 으로 배치해 첫 인상을 강화.

| Step | 변경 전 | 변경 후 | 아이콘 |
|------|--------|--------|--------|
| **1** | 기사 문장 선택 → 번역·질문 | **사이트별 맞춤 스크립트로 확장** | `Blocks` (확장성) |
| **2** | 그룹웨어 문서 작성 보조 | 기사 문장 선택 → 번역·질문 | `Languages` |
| **3** | 탭 정리·페이지 탐색 자동화 | 그룹웨어 문서 작성 보조 | `FileEdit` |
| **4** | 사이트별 맞춤 스크립트로 확장 | 탭 정리·페이지 탐색 자동화 | `LayoutGrid` |

아이콘도 `Moon`(다크모드 전용) → `Blocks`(모듈 조합/확장성) 로 교체.

수정 파일:
- `src/i18n/locales/ko.json` — s1~s4 콘텐츠 재배치
- `src/i18n/locales/en.json` — 동일
- `src/components/sections/ScenariosSection.tsx` — 아이콘 순서 재배치 (`Moon` → `Blocks` import 교체)

### 7.3 유튜브 영상 모달 팝업 추가

**변경 사유**: "이렇게 사용합니다" 시나리오 섹션의 placeholder 를 스크린샷이 아닌 유튜브 영상으로 제공하기로 결정. 각 시나리오 카드의 영상 영역을 클릭하면 중앙 모달 팝업에서 유튜브 영상을 재생할 수 있도록 구현.

**신규 컴포넌트** — `src/components/common/VideoModal.tsx`
- 중앙 모달 팝업 (반투명 배경 오버레이 `bg-ink-900/60`)
- `videoId` 존재 시 → YouTube iframe 자동재생 (`autoplay=1&rel=0`)
- `videoId` 미존재 시 → Play 아이콘 + "영상 준비 중" / "Video coming soon" placeholder
- 닫기 3종: X 버튼 / 배경 클릭 / ESC 키
- `body.overflow = 'hidden'` 으로 배경 스크롤 잠금
- 접근성: `role="dialog"` + `aria-modal="true"` + `aria-label`

**ScenariosSection 변경**
- placeholder `<div>` → `<button>` 전환 (클릭 가능 요소)
- hover 효과: 테두리 `border-accent` + 배경 `bg-accent-soft` (클릭 유도)
- 클릭 → `useState` 로 선택된 카드의 `{ videoId, title }` 저장 → `VideoModal` 렌더
- `SCENARIO_ITEMS` 에 `videoId?: string` 필드 추가 — 영상 URL 확보 시 채우면 즉시 iframe 으로 전환

**i18n 키 추가**
- `scenarios.videoPlaceholder`: ko "영상 준비 중" / en "Video coming soon"
- `common.close`: ko "닫기" / en "Close" (모달 닫기 버튼 aria-label)

**실제 영상 연결 방법** (향후):
```ts
const SCENARIO_ITEMS = [
  { key: 's1', icon: <Blocks size={24} />, videoId: 'YOUTUBE_VIDEO_ID' },
  ...
];
```

**번들 변화 (§7 수정 전후)**:
| 자산 | §6 완료 시점 | §7 수정 후 | Δ |
|------|------------|-----------|---|
| JS | 271.54 KB (gzip 86.38 KB) | **273.98 KB** (gzip 87.19 KB) | +2.44 KB (VideoModal + state) |
| CSS | 10.86 KB (gzip 2.98 KB) | **11.72 KB** (gzip 3.18 KB) | +0.86 KB (모달 + hover 스타일) |

수정 파일 총괄:
| 파일 | 변경 |
|------|------|
| `src/components/common/VideoModal.tsx` | **신규** — 유튜브 영상 모달 컴포넌트 |
| `src/components/common/index.ts` | `VideoModal` export 추가 |
| `src/components/sections/ScenariosSection.tsx` | VideoModal 연결 + placeholder `<button>` + 아이콘 재배치 + `videoId?` 필드 |
| `src/i18n/locales/ko.json` | s1~s4 순서 재배치 + s1 카피 수정 + `scenarios.videoPlaceholder` + `common.close` |
| `src/i18n/locales/en.json` | 동일 |

---

## 8. 리뷰 반영 (2026-04-12)

Phase 6 결과서에 대한 코드 레벨 리뷰에서 4건(Medium×3, Low×1) + 잠재 이슈 3건이 제시되어 수정 완료.

### 8.1 수정 내역

| # | 심각도 | 이슈 | 수정 |
|---|--------|------|------|
| 1 | Medium | 계획서 s1~s4 키 매핑이 사후 순서 재배치와 불일치 | `phase06_scenarios_differentiation.md` §6.1 시나리오 테이블을 현행 코드 순서(s1=스크립트 확장, s2=번역, s3=문서, s4=탭)로 갱신. "사후 순서 재배치 반영 — §7.2 참조" 주석 추가 |
| 2 | Medium | `common.close` 가 required-key 가드 밖 | **이미 반영 완료** — i18n.test.ts L116-117 에 common.close 가드 존재 확인 |
| 3 | Medium | VideoModal 핵심 상호작용 미검증 | `VideoModal.test.tsx` 신규 12 테스트 (렌더 조건 · videoId 분기 · 닫기 3종 · overflow 잠금 · 접근성) + `ScenariosSection.test.tsx` 에 모달 상호작용 3 테스트 (버튼 클릭→dialog 출현 · ESC 닫기 · 4개 placeholder 버튼 존재) |
| 4 | Low | 결과서 §4 번들 수치 stale | §4 테이블을 §7 수정 반영 수치(JS 273.98KB, CSS 11.72KB)로 갱신 |

**잠재 이슈 대응**:
- ① VideoModal 단위 테스트 부재 → `VideoModal.test.tsx` 12 테스트로 해결
- ② 모달 트리거 검증 누락 → `ScenariosSection.test.tsx` 에 userEvent 기반 3 테스트 추가
- ③ aria-label 개선 → `common.videoDialog: "{{title}} — 영상"` i18n 키 추가, VideoModal 에서 title 존재 시 `t('common.videoDialog', { title })` 사용

### 8.2 검증 결과

```
lint         ✅ 0 errors
typecheck    ✅ 0 errors (app + test)
format:check ✅ All files compliant
test         ✅ 18 test files · 287 passed | 5 skipped (292)
build        ✅ JS 274.08 KB (gzip 87.23 KB) · CSS 11.72 KB (gzip 3.18 KB)
```

### 8.3 테스트 증분

| 구분 | 리뷰 전 | 리뷰 후 | Δ |
|------|--------|--------|---|
| Test Files | 17 | **18** | +1 (VideoModal.test.tsx) |
| Tests passed | 272 | **287** | +15 |

### 8.4 수정 파일

| 파일 | 변경 |
|------|------|
| `src/components/common/VideoModal.test.tsx` | **신규** — 12 단위 테스트 |
| `src/components/common/VideoModal.tsx` | aria-label 개선 (`common.videoDialog` i18n 사용) |
| `src/components/sections/ScenariosSection.test.tsx` | 모달 상호작용 describe 3 테스트 추가 + userEvent import |
| `src/i18n/locales/ko.json` | `common.videoDialog` 키 추가 |
| `src/i18n/locales/en.json` | 동일 |
| `working_plan/phase06_scenarios_differentiation.md` | §6.1 시나리오 테이블 갱신 |
| `working_plan/working_history/v1.0/Phase6_ScenariosDiff_20260412.md` | §4 번들 수치 갱신 + 본 §8 추가 |

**작성**: 2026-04-12
**Phase 6 상태**: ✅ GREEN + REFACTOR + 콘텐츠 수정 + 리뷰 반영 + 자동 검증 완료 · 커밋 대기
