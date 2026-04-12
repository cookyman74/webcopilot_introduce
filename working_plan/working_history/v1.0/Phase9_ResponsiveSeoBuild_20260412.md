# Phase 9 작업 결과서 — 반응형 / a11y / SEO / 프로덕션 빌드 검증

> **작업 일자**: 2026-04-12
> **대응 계획서**: [phase09_responsive_seo_build.md](../../phase09_responsive_seo_build.md)
> **Phase 8 베이스라인**: [Phase8_RoadmapBusinessFinalCta_20260412.md](./Phase8_RoadmapBusinessFinalCta_20260412.md)
> **마일스톤**: 프로덕션 빌드 품질 확정 — Phase 10 배포 준비 완료

---

## 1. 목표와 범위

Phase 9 는 11개 섹션이 완성된 상태에서 **새 섹션을 추가하지 않고** 품질을 확정하는 단계다:
1. `index.html` SEO 메타 보강 (title / description / OG / Twitter Card)
2. 외부 링크 안전성 검증 (rel="noopener noreferrer")
3. 이미지 alt 속성 검증
4. Heading 레벨 구조 검증 (H1×1, H2×10, H3×카드)
5. 프로덕션 빌드 `npm run build && npm run preview` 확인

TDD 사이클: RED (meta 5건 FAIL, 나머지 3 테스트 파일은 기존 코드가 이미 준수해 PASS) → GREEN (index.html 메타 추가로 전부 PASS)

---

## 2. 수정/생성 파일 요약

### 2.1 신규 파일
| 파일 | 테스트 수 | 역할 |
|------|----------|------|
| `src/test/meta.test.ts` | 6 | index.html 의 lang/title/description/OG/Twitter 존재 검증 |
| `src/test/external-links.test.tsx` | 2 | target="_blank" 링크의 noopener/noreferrer 검증 |
| `src/test/image-alt.test.tsx` | 2 | 모든 `<img>` 의 alt 속성 + i18n 키 아닌 실제 값 검증 |
| `src/test/heading-structure.test.tsx` | 3 | H1×1 + H2×10 + H3 카드 내부만 검증 |
| 본 결과서 | — | |

### 2.2 수정 파일
| 파일 | 변경 |
|------|------|
| `index.html` | title "extapp_landing" → "Web AI Assistant — 웹페이지 문맥 기반 AI 코파일럿" + meta description + OG tags + Twitter card + `lang="ko"` |

### 2.3 패키지 변동
**없음.** Phase 9 는 코드 품질 확정만 수행.

---

## 3. 테스트 결과

```
lint         ✅ 0 errors
typecheck    ✅ 0 errors
format:check ✅ All files compliant
test         ✅ 27 test files · 382 passed | 5 skipped (387)
build        ✅ JS 284.28 KB (gzip 89.82 KB) · CSS 11.91 KB (gzip 3.22 KB)
```

### 테스트 증분
| 구분 | Phase 8 | Phase 9 | Δ |
|------|---------|---------|---|
| Test Files | 23 | **27** | +4 |
| Tests passed | 369 | **382** | +13 |

### RED → GREEN 분석
- **meta.test.ts**: RED 시 5건 FAIL (title/description/OG/twitter 미존재) → `index.html` 수정 후 PASS
- **external-links.test.tsx**: RED 시 이미 PASS — Button 컴포넌트의 auto-external 이 Phase 2 부터 `rel="noopener noreferrer"` 을 자동 부여
- **image-alt.test.tsx**: RED 시 이미 PASS — HeroSection `<img alt={t('hero.imageAlt')}>` 가 Phase 4 에서 구현
- **heading-structure.test.tsx**: RED 시 이미 PASS — H1×1 (Hero) + H2×10 (나머지 섹션) + H3 (카드 내부)

→ Phase 4~8 의 TDD 가 접근성/SEO 기반을 이미 갖추고 있었고, Phase 9 는 그 위에 **메타 태그만 보강**하면 되는 상태.

---

## 4. 번들 크기 (최종)

| 자산 | Phase 8 | Phase 9 | Δ |
|------|---------|---------|---|
| `index.html` | 0.59 KB | **1.26 KB** | +0.67 KB (메타 태그) |
| JS | 284.28 KB (gzip 89.82 KB) | **284.28 KB** (gzip 89.82 KB) | 0 |
| CSS | 11.91 KB (gzip 3.22 KB) | **11.91 KB** (gzip 3.22 KB) | 0 |

**gzip 합계**: 89.82 + 3.22 + 0.70 = **93.74 KB** — Phase 9 gzip 목표(JS < 300 KB) 대비 **210 KB 이상 여유**.

---

## 5. SEO 메타 태그 상세

```html
<html lang="ko">
  <title>Web AI Assistant — 웹페이지 문맥 기반 AI 코파일럿</title>
  <meta name="description" content="웹페이지를 이해하고, 질문하고, 자동화하는 Chrome 확장앱. OpenAI · Gemini · Claude · LM Studio 지원." />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Web AI Assistant — AI Copilot for the Browser" />
  <meta property="og:description" content="페이지 문맥을 읽고 필요할 때 직접 브라우저를 조작하는 AI 코파일럿." />
  <meta property="og:image" content="/images/placeholder.svg" />
  <meta name="twitter:card" content="summary_large_image" />
```

- `lang="ko"` 기본값 유지 — Phase 3 hotfix 의 `syncHtmlLang` 이 runtime 에서 i18n 감지 언어로 override
- OG image 는 `placeholder.svg` 임시 사용 — 실제 OG 이미지(1200×630 PNG) 는 Phase 10 배포 전 교체
- description 에 Claude 포함 (Phase 7 AI 모드 재구성 반영)

---

## 6. 접근성/구조 검증 현황

| 항목 | 상태 | 근거 |
|------|------|------|
| H1 유일성 | ✅ | HeroSection 만 H1. `heading-structure.test.tsx` + `App.test.tsx` h1===1 가드 |
| H2 10개 (섹션당 1개) | ✅ | 11섹션 중 HeroSection 은 H1 → 나머지 10 섹션 H2 |
| 모든 img alt | ✅ | HeroSection 1개 — `t('hero.imageAlt')` |
| 외부 링크 rel | ✅ | Button auto-external — 모든 https:// 링크에 noopener+noreferrer |
| aria-labelledby | ✅ | 11개 섹션 전부 적용 (Phase 8 리뷰에서 FinalCTA 보완) |
| 키보드 순회 | ⚠️ | 수동 확인 필요 — Playwright MCP 또는 브라우저에서 Tab 순회 |

---

## 7. Lighthouse 측정 (수동)

Lighthouse 측정은 `npm run preview` 실행 후 Chrome DevTools 에서 수동으로 수행해야 합니다. 자동화된 CI Lighthouse 는 Phase 10 Vercel 배포 후 별도 검토.

**수동 측정 권장 절차**:
```bash
npm run build && npm run preview
# http://localhost:4173 에서 Chrome DevTools → Lighthouse → Mobile
```

---

## 8. Phase 10 (Vercel 배포) 인계 사항

### 8.1 배포 전 확정 필요 항목
- [ ] `PARTNERSHIP_CONTACT` 실제 이메일 확정 (`cookyman@gmail.com` → 전용 주소?)
- [ ] `DOCS_URL` 실제 문서 URL 확정 (`https://github.com/anthropics` → 실제 docs?)
- [ ] OG image 실제 파일 생성 (`placeholder.svg` → 1200×630 PNG)
- [ ] Lighthouse 수동 측정 완료 + 결과 기록

### 8.2 Vercel 배포 핵심
- Root Directory: `docs/00_intro_web_landing_page/extapp_landing` (CLAUDE.md 에 명시)
- Framework: Vite
- Build: `npm run build` · Output: `dist` · Node: 20.x

### 8.3 프로덕션 빌드 품질
- JS gzip 89.82 KB — 300 KB 목표 대비 70% 미달
- CSS gzip 3.22 KB — 매우 경량
- 11개 섹션 + lucide-react 17 아이콘 + i18n 2언어 포함

---

---

## 9. 리뷰 반영 (2026-04-12)

### 9.1 수정 내역

| # | 심각도 | 이슈 | 수정 |
|---|--------|------|------|
| 1 | High | DOCS_URL 이 제3자 저장소(`github.com/anthropics`) 를 가리킴 | Chrome Web Store 확장앱 페이지 URL 로 교체. FIXME 유지 — 실제 문서 URL 확정 시 교체 |
| 2 | Medium | meta.test.ts 가 태그 "존재" 만 확인, 값 정확성 미검증 | `lang="ko"` 정확 매칭 + description/OG 값 비어있지 않음 + og:type="website" + og:image 이미지 확장자 + twitter:card="summary_large_image" 값 검증 |
| 3 | Medium | image-alt regex 가 `hero.imageAlt` 같은 2단 키를 놓침 | regex → `/^[a-zA-Z]+(\.[a-zA-Z_]+)+$/` camelCase 포함 패턴으로 확장 |
| 4 | Medium | 계획서 H2 11개 vs 테스트 H2 10개 불일치 | 계획서 TEST-P9.7 을 "H2 10개 (HeroSection 은 H1 이므로 나머지 10 섹션이 H2)" 로 수정 |
| 5 | Low | external-links 가 target="_blank" 만 검사 — target 누락 회귀 미탐지 | `https://` 링크가 반드시 `target="_blank"` 를 갖는지 별도 검증 추가 |

### 9.2 검증 결과
```
test: 27 files · 384 passed | 5 skipped (389)
build: JS 284.33 KB (gzip 89.81) · CSS 11.91 KB (gzip 3.22)
```

### 9.3 수정 파일
| 파일 | 변경 |
|------|------|
| `src/lib/constants.ts` | DOCS_URL → Chrome Web Store 확장앱 페이지 |
| `src/test/meta.test.ts` | 값 정확성 검증 8건으로 강화 (존재 6건 → 값 8건) |
| `src/test/image-alt.test.tsx` | alt regex 패턴 확장 (camelCase 2단+ 키 탐지) |
| `src/test/external-links.test.tsx` | https:// 링크 target="_blank" 강제 가드 추가 |
| `working_plan/phase09_responsive_seo_build.md` | TEST-P9.7 H2 11개 → 10개 수정 |

**작성**: 2026-04-12
**Phase 9 상태**: ✅ GREEN + 리뷰 반영 + 자동 검증 완료 · Lighthouse 수동 측정 대기 · 커밋 대기
**마일스톤**: 프로덕션 빌드 품질 확정
