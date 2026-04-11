# Web AI Assistant 랜딩 페이지 구현 계획서

> 기준 문서:
> - [extension_intro.md](./extension_intro.md) — 제품 소개 원문
> - [01_landing_page_plan.md](./01_landing_page_plan.md) — 정보 구조 및 섹션 기획
>
> 목적: 위 두 문서를 실제 코드 산출물로 옮기기 위한 **구현 단계 계획**
> 상태: 초안 (1차 구현 전)

---

## 1. 구현 조건 요약

사용자가 확정한 1차 구현 조건은 다음과 같다.

| 항목 | 결정 사항 |
|------|----------|
| 프로젝트 위치 | `00_intro_web_landing_page/extapp_landing/` |
| 프레임워크 | Vite + React + TypeScript |
| 스타일링 | Tailwind CSS |
| 컴포넌트 구조 | 섹션 단위 컴포넌트 분리 |
| 디자인 레퍼런스 | Notion 한국어 랜딩 (https://www.notion.com/ko) |
| 다국어 | 1차: 한국어 / 영어 · 2차: 일본어 · 3차: 중국어 |
| 이미지 | 스크린샷/목업 placeholder, 추후 교체 |
| 주 CTA 링크 | https://chromewebstore.google.com/detail/cpemgmhplednniaifpolbchjmegidcao?authuser=0&hl=ko |
| 섹션 범위 | 기획서 10개 섹션 전부 1차 구현 |
| 배포 | Vercel · Git push 기반 자동 배포 |

---

## 2. 기술 스택 상세

### 2.1 코어

- **Vite 5.x** — 번들러 / 개발 서버
- **React 18** — UI 라이브러리
- **TypeScript** — 타입 안전성 + 유지보수성
- **Tailwind CSS 3.x** — 유틸리티 스타일링

### 2.2 보조 라이브러리

- **react-i18next** + **i18next** — 다국어 처리
- **lucide-react** — 아이콘 (Notion류 랜딩의 깔끔한 선 아이콘에 적합)
- **framer-motion** (선택) — Notion 랜딩 특유의 가벼운 스크롤 인터랙션용
- **clsx** — 조건부 className 처리

### 2.3 개발 도구

- **ESLint** + **Prettier** — 코드 품질
- **TypeScript strict mode** — 타입 누락 방지

### 2.4 배포

- **Vercel** — GitHub 연동 시 main 브랜치 push → 자동 빌드/배포
- Vite 프로젝트는 Vercel이 프리셋으로 감지하므로 추가 설정 거의 불필요
- 커스텀 설정이 필요한 경우에만 `vercel.json` 추가

---

## 3. 디렉토리 구조

```
00_intro_web_landing_page/
├── extension_intro.md
├── 01_landing_page_plan.md
├── 02_implementation_plan.md         ← 이 문서
└── extapp_landing/                   ← 실제 프로젝트 루트
    ├── public/
    │   ├── favicon.svg
    │   └── images/                   ← 스크린샷/목업 placeholder
    │       ├── hero-mock.png
    │       ├── feature-*.png
    │       └── scenario-*.png
    ├── src/
    │   ├── main.tsx                  ← 진입점
    │   ├── App.tsx                   ← 레이아웃 + 섹션 조립
    │   ├── index.css                 ← Tailwind base + 전역 토큰
    │   ├── i18n/
    │   │   ├── index.ts              ← i18next 초기화
    │   │   └── locales/
    │   │       ├── ko.json
    │   │       ├── en.json
    │   │       ├── ja.json           ← 2차 (빈 파일로 생성)
    │   │       └── zh.json           ← 3차 (빈 파일로 생성)
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Header.tsx        ← 상단 네비 + 언어 스위처 + CTA
    │   │   │   ├── Footer.tsx
    │   │   │   └── LanguageSwitcher.tsx
    │   │   ├── common/
    │   │   │   ├── Section.tsx       ← 공통 섹션 래퍼 (패딩/max-width)
    │   │   │   ├── Badge.tsx         ← "구현됨" / "보강 중" / "계획/검토 중"
    │   │   │   ├── Button.tsx        ← Primary/Secondary CTA
    │   │   │   └── FeatureCard.tsx   ← 기능 카드 재사용
    │   │   └── sections/
    │   │       ├── HeroSection.tsx              ← 5.1
    │   │       ├── ProblemSection.tsx           ← 5.2
    │   │       ├── SolutionSection.tsx          ← 5.3 (3축)
    │   │       ├── FeaturesSection.tsx          ← 5.4 (기능 카드 그리드)
    │   │       ├── ScenariosSection.tsx         ← 5.5
    │   │       ├── DifferentiationSection.tsx   ← 5.6
    │   │       ├── AIModesSection.tsx           ← 5.7
    │   │       ├── SafetySection.tsx            ← 5.8
    │   │       ├── RoadmapSection.tsx           ← 5.9
    │   │       └── FinalCTASection.tsx          ← 5.10
    │   └── lib/
    │       ├── constants.ts          ← CTA URL 등
    │       └── types.ts
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .eslintrc.cjs
    ├── .prettierrc
    ├── .gitignore
    └── README.md
```

---

## 4. 디자인 시스템 (Notion-like)

Notion 한국어 랜딩의 핵심 인상을 정리하고, 그에 대응하는 토큰을 미리 정의한다.

### 4.1 Notion 랜딩의 인상 포인트

- **여백이 큰 히어로** — 카피가 숨쉴 공간이 넓다
- **큰 타이포** — 한글 기준 40~72px Hero 타이틀
- **부드러운 중립 톤** — off-white 배경 (#FFFFFF ~ #FBFAF9), 진회색 텍스트
- **섹션 구분이 절제됨** — 강한 구분선 없이 여백 + 살짝 다른 배경으로 구분
- **포인트 컬러는 1~2개** — 보통 따뜻한 액센트 (주황/빨강)
- **카드는 소프트 섀도 + 라운드 큰 편** — rounded-2xl 이상
- **아이콘은 선형 미니멀** — lucide 스타일이 정확히 이 톤
- **스크롤 애니메이션은 미세함** — 뿅 하고 튀지 않음, fade/slide 정도

### 4.2 컬러 토큰 (Tailwind 확장)

```js
// tailwind.config.js 일부
theme: {
  extend: {
    colors: {
      // 배경 계열
      canvas: '#FFFFFF',
      surface: '#FBFAF9',          // 섹션 교차 배경
      'surface-alt': '#F7F6F3',    // 더 진한 구분용
      // 텍스트 계열
      ink: {
        900: '#191918',
        700: '#37352F',            // Notion 본문 톤
        500: '#787774',
        400: '#9B9A97',
      },
      // 경계
      border: '#E9E9E7',
      // 액센트
      accent: {
        DEFAULT: '#2E6EE6',        // Web AI Assistant는 '브라우저 AI'이므로 차분한 블루
        hover:   '#1F57C4',
        soft:    '#EEF3FD',
      },
      // 상태 배지
      status: {
        done:    '#10B981',        // 구현됨
        wip:     '#F59E0B',        // 보강 중
        planned: '#9B9A97',        // 계획/검토 중
      },
    },
    fontFamily: {
      sans: [
        'Pretendard',
        '-apple-system',
        'BlinkMacSystemFont',
        'Inter',
        'sans-serif',
      ],
    },
    maxWidth: {
      content: '1200px',
    },
    borderRadius: {
      '2xl': '1rem',
      '3xl': '1.5rem',
    },
  },
}
```

> 브랜드 컬러 주의: Notion은 따뜻한 톤이지만, 본 제품은 "브라우저 AI 코파일럿"이므로 **차분한 블루 계열 액센트**로 차별화한다. 톤앤매너(여백/타이포/카드감)만 Notion을 참조하고 색은 블루를 유지.

### 4.3 타이포 스케일

| 용도 | 사이즈 (desktop) | 사이즈 (mobile) | weight |
|------|------------------|-----------------|--------|
| Hero H1 | 64px | 40px | 700 |
| Section H2 | 40px | 28px | 700 |
| Card H3 | 20px | 18px | 600 |
| Body | 18px | 16px | 400 |
| Caption | 14px | 13px | 400 |

### 4.4 레이아웃 규칙

- 공통 max-width: `1200px`
- 섹션 좌우 패딩: `px-6 md:px-10`
- 섹션 상하 패딩: `py-20 md:py-28`
- 카드 그리드 gap: `gap-6 md:gap-8`

---

## 5. 섹션별 컴포넌트 스펙

기획서 10개 섹션을 컴포넌트 단위로 1차 구현한다.

### 5.1 HeroSection

- **배경**: `bg-canvas`
- **레이아웃**: 2컬럼 (좌: 카피 + CTA, 우: 브라우저 목업 placeholder)
- **요소**
  - Eyebrow 라벨: "Chrome Extension · AI Copilot"
  - H1: "웹페이지를 이해하고, 질문하고, 자동화하는 AI 코파일럿"
  - Sub: 2~3줄 설명
  - Primary CTA: "Chrome에 추가하기" → Chrome Web Store 링크
  - Secondary CTA: "기능 살펴보기" → `#features` 앵커
  - 신뢰 라벨: "OpenAI · Gemini · LM Studio · Didim 지원"
- **Placeholder 이미지**: `/images/hero-mock.png` (브라우저 사이드패널 목업)

### 5.2 ProblemSection

- **배경**: `bg-surface`
- **구성**: H2 + 4개 카드 (아이콘 + 한 줄)
  - "페이지 내용을 다시 정리해야 함"
  - "웹 작업이 반복적이고 수동적"
  - "AI는 답변만, 실행은 사용자 몫"
  - "사이트별 자동화는 코드 장벽"

### 5.3 SolutionSection (해결 방식 3축)

- **배경**: `bg-canvas`
- **구성**: H2 + 3개 Large 카드 (아이콘 + 제목 + 설명 + 작은 예시 텍스트)
  1. 페이지 문맥 기반 AI
  2. 브라우저 액션 자동화
  3. 스크립트 기반 확장성

### 5.4 FeaturesSection (주요 기능)

- **배경**: `bg-surface`
- **구성**: H2 + 3×3 그리드 FeatureCard
- **카드 항목** (각 카드 = 아이콘 + 제목 + 1줄 가치 + 예시)
  1. AI 채팅 `구현됨`
  2. 페이지 도우미 `구현됨`
  3. 텍스트 선택 기반 `구현됨`
  4. 문서/폼 자동입력 `구현됨`
  5. Action Tools 에이전트 `구현됨`
  6. 이미지/스크린샷 `구현됨`
  7. 텍스트 개선 `구현됨`
  8. 스크립트 실행/등록 `보강 중`
  9. Floating Helper `계획/검토 중`
- **Badge 컴포넌트**로 상태 표시

### 5.5 ScenariosSection (사용 시나리오)

- **배경**: `bg-canvas`
- **구성**: H2 + 4개 스텝 카드 (또는 가로 타임라인)
  1. 기사 문장 선택 → 번역/질문
  2. 그룹웨어 문서 작성 보조
  3. 탭 정리 및 페이지 탐색 자동화
  4. 사이트 다크모드/광고 숨김
- 각 카드에 placeholder 스크린샷 영역

### 5.6 DifferentiationSection (차별화 포인트)

- **배경**: `bg-surface-alt`
- **구성**: H2 + 3개 좌우 비교 카드
  - "답변형 AI vs 행동형 AI"
  - "단발성 자동화 vs 재사용 가능한 자산"
  - "텍스트 중심 vs 페이지/필드/스크립트까지"

### 5.7 AIModesSection (지원 AI 모드)

- **배경**: `bg-canvas`
- **구성**: H2 + 로고 배지 그리드
  - 지원: OpenAI / Gemini / LM Studio / Didim (`지원됨` 배지)
  - 준비: Ollama (`검토 중` 배지)
- 로고는 1차에 텍스트 + 아이콘 placeholder로

### 5.8 SafetySection (안전 및 운영 원칙)

- **배경**: `bg-surface`
- **구성**: H2 + 4개 원칙 카드
  - 승인 기반 위험 작업 제어
  - 명시적 영구 스크립트 등록
  - 추적 가능한 세션 스크립트
  - 민감 사이트 보수적 처리
- 톤: 신뢰 형성용, 과장 금지 문구

### 5.9 RoadmapSection (확장 방향)

- **배경**: `bg-canvas`
- **구성**: H2 + 3개 로드맵 카드 (`계획/검토 중` 또는 `보강 중` 배지)
  - Floating Helper
  - Session Script Continuity
  - Extension App Studio
- **중요**: "구현됨"과 혼동되지 않도록 Badge로 명시

### 5.10 FinalCTASection

- **배경**: `bg-accent-soft` (액센트 컬러 옅은 버전)
- **구성**: 중앙 정렬 H2 + 서브카피 + Primary CTA + Secondary 링크
  - Primary: "Chrome에 추가하기" → Chrome Web Store
  - Secondary: "문서 보기" → GitHub/문서 링크 (1차엔 `#`)

### 5.A Header / Footer

- **Header (sticky)**
  - 좌: 로고 + 제품명
  - 중: 앵커 네비 (기능 / 시나리오 / 차별점 / 로드맵)
  - 우: LanguageSwitcher + Primary CTA
- **Footer**
  - 저작권, 문서 링크, 소셜 (placeholder)

---

## 6. 다국어(i18n) 전략

### 6.1 라이브러리

- `react-i18next` + `i18next` + `i18next-browser-languagedetector`

### 6.2 네임스페이스 구조

1차엔 단일 네임스페이스(`common.json`)가 아니라 **섹션 단위 키**로 시작해서 확장 가능하게 한다.

```json
// src/i18n/locales/ko.json
{
  "header": { "nav": { "features": "기능", "scenarios": "시나리오" } },
  "hero": {
    "eyebrow": "Chrome Extension · AI Copilot",
    "title": "웹페이지를 이해하고, 질문하고, 자동화하는 AI 코파일럿",
    "subtitle": "...",
    "cta_primary": "Chrome에 추가하기",
    "cta_secondary": "기능 살펴보기"
  },
  "problem": { "...": "..." },
  "solution": { "...": "..." },
  "features": { "...": "..." },
  "scenarios": { "...": "..." },
  "differentiation": { "...": "..." },
  "aiModes": { "...": "..." },
  "safety": { "...": "..." },
  "roadmap": { "...": "..." },
  "finalCta": { "...": "..." },
  "footer": { "...": "..." }
}
```

### 6.3 언어 지원 단계

| 단계 | 언어 | 구현 시점 |
|------|------|----------|
| 1차 | 한국어 (ko) | 이번 구현 |
| 1차 | 영어 (en) | 이번 구현 |
| 2차 | 일본어 (ja) | 추후 (빈 파일 생성) |
| 3차 | 중국어 (zh) | 추후 (빈 파일 생성) |

### 6.4 언어 스위처

- Header 우측에 드롭다운 (현재 언어 + 선택 가능한 언어)
- 선택 언어는 `localStorage`에 저장 → 재방문 시 복원
- 초기값은 브라우저 언어 자동 감지 (`ko` / `en` / fallback `en`)

### 6.5 URL 전략

1차엔 쿼리/경로 분리 없이 **클라이언트 상태만**으로 언어 전환.
추후 SEO가 필요해지면 `/ko`, `/en` 경로 분리 또는 Next.js 이관 검토.

---

## 7. Vercel 배포 파이프라인

### 7.1 원칙

- **main 브랜치 push → 자동 빌드/배포**
- PR → Preview Deployment 자동 생성
- 빌드/런타임 환경변수는 1차엔 없음

### 7.2 Vercel 프로젝트 설정

Vercel이 Vite를 자동 감지하므로 기본 설정으로 충분하지만, 안전하게 명시적으로 설정한다.

| 항목 | 값 |
|------|----|
| Framework Preset | `Vite` |
| Root Directory | `docs/00_intro_web_landing_page/extapp_landing` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | `20.x` |

### 7.3 Root Directory 주의사항

리포지토리 루트가 아닌 **서브 디렉토리**에 프로젝트가 있으므로, Vercel 프로젝트 생성 시 Root Directory를 반드시 위 경로로 지정해야 한다. 이걸 놓치면 Vercel이 repo 루트에서 `package.json`을 찾지 못해 빌드가 실패한다.

### 7.4 vercel.json (선택)

기본 감지로 충분하지만, 추후 리다이렉트/헤더가 필요할 때 `extapp_landing/vercel.json` 추가:

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

### 7.5 연결 단계

1. GitHub 리포에 코드 push
2. Vercel 대시보드 → "Add New Project" → 리포 선택
3. Root Directory를 `docs/00_intro_web_landing_page/extapp_landing`으로 지정
4. Framework Preset = Vite 확인
5. Deploy → 도메인 발급
6. (선택) 커스텀 도메인 연결

### 7.6 브랜치 전략

- `main` → Production
- 그 외 브랜치 → Preview Deployment (자동)
- 현재 작업 브랜치(`v2.7/refactoring_tools`) → Preview로 먼저 검증 가능

---

## 8. 구현 순서 (Build TODO)

### Phase 1. 프로젝트 부트스트랩

1. `extapp_landing/` 디렉토리 생성
2. Vite + React + TypeScript 템플릿 초기화
3. Tailwind CSS 설치 및 설정
4. 디자인 토큰(`tailwind.config.js`) 반영
5. Pretendard 폰트 로드 (CDN 또는 `@fontsource/pretendard`)
6. ESLint/Prettier 설정
7. `.gitignore` 작성

### Phase 2. 공통 인프라

1. `src/lib/constants.ts` — CTA URL 등
2. `src/i18n/` — i18next 초기화 + `ko.json`/`en.json` 뼈대
3. `components/common/` — Section, Button, Badge, FeatureCard
4. `components/layout/` — Header, Footer, LanguageSwitcher

### Phase 3. 섹션 구현 (10개)

위 5장 순서대로:

1. HeroSection
2. ProblemSection
3. SolutionSection
4. FeaturesSection
5. ScenariosSection
6. DifferentiationSection
7. AIModesSection
8. SafetySection
9. RoadmapSection
10. FinalCTASection

각 섹션 구현 시:
- 텍스트는 i18n 키로 분리 (`t('hero.title')`)
- 이미지는 `public/images/` 하위 placeholder 경로로 먼저 참조
- 상태 배지가 필요한 항목은 `Badge` 컴포넌트 사용

### Phase 4. App 조립 및 반응형 검증

1. `App.tsx`에 섹션 순서대로 배치
2. 데스크톱 → 태블릿 → 모바일 반응형 점검
3. 앵커 스크롤 동작 확인
4. 언어 스위처 동작 확인

### Phase 5. 배포

1. GitHub에 코드 push
2. Vercel 프로젝트 생성 + Root Directory 지정
3. 첫 배포 확인
4. Preview/Production URL 공유

### Phase 6. (1차 이후) 반복 개선

- 실제 스크린샷/목업 교체
- 카피 정교화
- 일본어/중국어 locale 추가
- SEO 메타 태그 보강
- (필요 시) framer-motion 스크롤 인터랙션 추가

---

## 9. 1차 구현에서 **하지 않을** 것

YAGNI 원칙에 따라 1차엔 아래를 명시적으로 제외한다.

- Next.js 이관 / SSR
- 다크모드 토글 (톤앤매너가 밝은 톤이므로 불필요)
- 라우팅(react-router) — 1페이지 랜딩이므로 불필요
- CMS 연동
- Analytics (추후 Vercel Analytics 또는 GA4 추가 가능)
- Sitemap/robots.txt 자동화 (배포 후 필요 시)
- 실제 스크린샷 제작 (placeholder 유지)
- 일본어/중국어 번역 (파일 구조만 준비)

---

## 10. 체크리스트 (구현 완료 정의)

1차 구현이 끝났다고 말할 수 있는 조건:

- [ ] `extapp_landing/`에서 `npm run dev` 실행 시 정상 구동
- [ ] 10개 섹션이 순서대로 렌더링됨
- [ ] 한국어/영어 전환이 동작함
- [ ] 주 CTA가 Chrome Web Store로 이동함
- [ ] 데스크톱/태블릿/모바일 3개 브레이크포인트에서 깨짐 없음
- [ ] 상태 배지(`구현됨`/`보강 중`/`계획/검토 중`)가 기획서 규칙대로 적용됨
- [ ] Roadmap 섹션이 "미래 방향"으로 명확히 구분됨
- [ ] `npm run build`가 에러 없이 통과함
- [ ] Vercel에 연결되어 push 시 자동 배포가 동작함
- [ ] Production URL에서 랜딩이 정상 서빙됨

---

## 11. 후속 문서 예정

이 구현 계획서 다음 단계로 필요해질 문서:

- `03_copywriting_ko_en.md` — 섹션별 확정 카피 (한/영)
- `04_asset_checklist.md` — 교체해야 할 placeholder 이미지 목록
- `05_i18n_ja_zh_rollout.md` — 일본어/중국어 추가 시 운영 가이드
