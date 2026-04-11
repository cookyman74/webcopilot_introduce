/**
 * Phase 2 디자인 시스템 RED — 설정 파일 검사
 * 대응 체크: TEST-P2.1 (Tailwind 토큰) · TEST-P2.2 (Pretendard 폰트)
 *
 * 설계 결정:
 *   - `tailwind.config.js` 는 ESM 설정 파일이다. 본 테스트는 두 가지 층위로
 *     검증한다:
 *       (a) 구조 검증 — 토큰 키의 존재 (regex, 느슨한 매칭)
 *       (b) 값 검증 — 설계 문서(02_implementation_plan.md §4.2) 에 명시된
 *         브랜드 hex 값과 레이아웃 값의 정확성 (regex, 하드코딩 매칭)
 *     (b) 는 리뷰 피드백 반영 — 키 존재만 보면 accent 가 #000000 으로
 *     바뀌어도 통과하므로 브랜드 아이덴티티 보호가 안 된다.
 *   - 토큰 값이 변경될 때 본 테스트를 의도적으로 함께 수정하는 흐름이
 *     브랜드 컬러/타이포 변경의 "승인 지점" 역할을 한다.
 *
 * RED 기대 동작:
 *   현재 tailwind.config.js 는 `theme: { extend: {} }` 상태, index.html 은
 *   Pretendard 참조 없음 → 본 파일의 모든 assertion이 FAIL 이어야 정상.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname_ = dirname(fileURLToPath(import.meta.url));
// src/test/ 에서 두 레벨 위가 extapp_landing/ (프로젝트 루트)
const APP_ROOT = resolve(__dirname_, '..', '..');

const tailwindConfigRaw = readFileSync(resolve(APP_ROOT, 'tailwind.config.js'), 'utf-8');
const indexHtmlRaw = readFileSync(resolve(APP_ROOT, 'index.html'), 'utf-8');
const indexCssRaw = readFileSync(resolve(APP_ROOT, 'src/index.css'), 'utf-8');
const mainTsxRaw = readFileSync(resolve(APP_ROOT, 'src/main.tsx'), 'utf-8');

/**
 * 설계 문서 (02_implementation_plan.md §4.2) 에 명시된 **브랜드 값**.
 * 이 값이 변경될 때 본 상수를 먼저 수정하고, 그 수정을 PR 리뷰에서 승인
 * 받는 것이 "브랜드 변경의 공식 경로" 이다.
 */
const EXPECTED_TOKENS = {
  colors: {
    canvas: '#FFFFFF',
    surface: '#FBFAF9',
    'surface-alt': '#F7F6F3',
    border: '#E9E9E7',
    ink: {
      900: '#191918',
      700: '#37352F',
      500: '#787774',
      400: '#9B9A97',
    },
    accent: {
      DEFAULT: '#2E6EE6',
      hover: '#1F57C4',
      soft: '#EEF3FD',
    },
    status: {
      done: '#10B981',
      wip: '#F59E0B',
      planned: '#9B9A97',
    },
  },
  maxWidth: {
    content: '1200px',
  },
  borderRadius: {
    '2xl': '1rem',
    '3xl': '1.5rem',
  },
} as const;

/**
 * tailwind.config.js 원본 문자열에서 `key: "value"` 패턴을 찾는 헬퍼.
 * 공백·quote 유연성은 유지하되, 실제 hex 값의 정확성을 강제한다.
 */
function expectTokenValue(key: string, value: string): void {
  // 대소문자 구분 없이 hex 매칭 (#2E6EE6 vs #2e6ee6 둘 다 허용)
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`['"]?${escapedKey}['"]?\\s*:\\s*['"]${escapedValue}['"]`, 'i');
  expect(tailwindConfigRaw).toMatch(pattern);
}

// ─────────────────────────────────────────────────────────────
// TEST-P2.1 — Tailwind 디자인 토큰 정의 (구조 + 값)
// ─────────────────────────────────────────────────────────────
describe('TEST-P2.1 — tailwind.config.js 디자인 토큰', () => {
  describe('배경 계열 컬러 (canvas · surface · surface-alt)', () => {
    it(`canvas = ${EXPECTED_TOKENS.colors.canvas}`, () => {
      expectTokenValue('canvas', EXPECTED_TOKENS.colors.canvas);
    });

    it(`surface = ${EXPECTED_TOKENS.colors.surface}`, () => {
      expectTokenValue('surface', EXPECTED_TOKENS.colors.surface);
    });

    it(`surface-alt = ${EXPECTED_TOKENS.colors['surface-alt']} (BusinessSection 배경)`, () => {
      // 02_implementation_plan.md §5.10 에서 BusinessSection 이 `bg-surface-alt`
      // 를 사용하도록 지정함. 이 토큰이 없으면 BusinessSection 이 깨진다.
      expectTokenValue('surface-alt', EXPECTED_TOKENS.colors['surface-alt']);
    });

    it(`border = ${EXPECTED_TOKENS.colors.border} (카드 라인)`, () => {
      // FeatureCard 의 border 색. 이 토큰이 없으면 모든 카드 라인이 깨진다.
      expectTokenValue('border', EXPECTED_TOKENS.colors.border);
    });
  });

  describe('텍스트 컬러 ink 스케일 (400 · 500 · 700 · 900)', () => {
    it.each([
      ['900', EXPECTED_TOKENS.colors.ink['900']],
      ['700', EXPECTED_TOKENS.colors.ink['700']],
      ['500', EXPECTED_TOKENS.colors.ink['500']],
      ['400', EXPECTED_TOKENS.colors.ink['400']],
    ] as const)('ink.%s = %s', (weight, hex) => {
      expectTokenValue(weight, hex);
    });

    it('ink 컨테이너가 객체로 정의되어 있다 (스케일 묶음)', () => {
      // ink: { 900: ..., 700: ... } 형태여야 Tailwind 가 text-ink-700 같은
      // 유틸을 생성한다. flat 정의는 Tailwind 가 처리하지 못함.
      expect(tailwindConfigRaw).toMatch(/\bink\s*:\s*\{/);
    });
  });

  describe('accent 컬러 계열 (DEFAULT · hover · soft)', () => {
    it(`accent.DEFAULT = ${EXPECTED_TOKENS.colors.accent.DEFAULT} (브랜드 블루)`, () => {
      // 02_implementation_plan.md §4.2 — "Web AI Assistant 는 '브라우저 AI'
      // 이므로 차분한 블루 계열 액센트" 로 명시된 브랜드 아이덴티티.
      // 이 값이 바뀌면 본 assertion 이 FAIL 하여 브랜드 변경을 PR 수준에서
      // 검토하도록 강제한다.
      expectTokenValue('DEFAULT', EXPECTED_TOKENS.colors.accent.DEFAULT);
    });

    it(`accent.hover = ${EXPECTED_TOKENS.colors.accent.hover}`, () => {
      expectTokenValue('hover', EXPECTED_TOKENS.colors.accent.hover);
    });

    it(`accent.soft = ${EXPECTED_TOKENS.colors.accent.soft} (FinalCTA 배경)`, () => {
      // FinalCTASection 이 `bg-accent-soft` 를 사용 (§5.11).
      expectTokenValue('soft', EXPECTED_TOKENS.colors.accent.soft);
    });

    it('accent 컨테이너가 객체로 정의되어 있다', () => {
      expect(tailwindConfigRaw).toMatch(/\baccent\s*:\s*\{/);
    });
  });

  describe('status 배지 컬러 (done · wip · planned)', () => {
    it(`status.done = ${EXPECTED_TOKENS.colors.status.done} (구현됨 emerald)`, () => {
      expectTokenValue('done', EXPECTED_TOKENS.colors.status.done);
    });

    it(`status.wip = ${EXPECTED_TOKENS.colors.status.wip} (보강 중 amber)`, () => {
      expectTokenValue('wip', EXPECTED_TOKENS.colors.status.wip);
    });

    it(`status.planned = ${EXPECTED_TOKENS.colors.status.planned} (계획·검토 중)`, () => {
      expectTokenValue('planned', EXPECTED_TOKENS.colors.status.planned);
    });

    it('status 컨테이너가 객체로 정의되어 있다', () => {
      expect(tailwindConfigRaw).toMatch(/\bstatus\s*:\s*\{/);
    });
  });

  describe('레이아웃 토큰 (maxWidth · borderRadius)', () => {
    it(`maxWidth.content = ${EXPECTED_TOKENS.maxWidth.content} (Section wrapper)`, () => {
      // Section.test.tsx 의 `.max-w-content` selector 가 이 값에 의존.
      // 이 값이 바뀌면 max-w-content 유틸이 달라지고 모든 섹션의 중앙 정렬이
      // 깨지므로, 본 토큰은 '디자인 시스템 전체의 단일 진입점' 역할을 한다.
      expectTokenValue('content', EXPECTED_TOKENS.maxWidth.content);
    });

    it(`borderRadius.2xl = ${EXPECTED_TOKENS.borderRadius['2xl']} (카드 기본 라운드)`, () => {
      expectTokenValue('2xl', EXPECTED_TOKENS.borderRadius['2xl']);
    });

    it(`borderRadius.3xl = ${EXPECTED_TOKENS.borderRadius['3xl']} (강조 카드 라운드)`, () => {
      expectTokenValue('3xl', EXPECTED_TOKENS.borderRadius['3xl']);
    });
  });

  describe('타이포 — fontFamily', () => {
    it('fontFamily.sans 의 첫 항목이 Pretendard 이다', () => {
      // Tailwind `font-sans` 유틸이 Pretendard 를 우선 사용하도록 보장.
      // 순서가 중요하므로 'Pretendard' 가 sans 배열 앞쪽에 있어야 한다.
      expect(tailwindConfigRaw).toMatch(
        /fontFamily\s*:\s*\{[\s\S]*?sans\s*:\s*\[\s*['"]Pretendard['"]/
      );
    });

    it('fontFamily.sans 에 fallback 체인이 최소 2개 이상이다', () => {
      // Pretendard 로드 실패 시 시스템 폰트로 graceful degradation.
      // 설계 문서는 '-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'
      // 를 권장 fallback 으로 명시.
      expect(tailwindConfigRaw).toMatch(/sans\s*:\s*\[\s*['"]Pretendard['"]\s*,\s*['"][^'"]+['"]/);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// TEST-P2.2 — Pretendard 폰트 로드
// ─────────────────────────────────────────────────────────────
describe('TEST-P2.2 — Pretendard 폰트 로드 wiring', () => {
  it('Pretendard 가 index.html · src/index.css · src/main.tsx 중 한 곳에서 로드된다', () => {
    // 구현 선택 자유 (3가지 경로 허용):
    //   (a) index.html <link rel="stylesheet" href=".../pretendard..."> (CDN)
    //   (b) src/index.css 의 @import 또는 @font-face 선언
    //   (c) src/main.tsx 에서 @fontsource/pretendard npm 패키지 import
    // phase02_design_system.md §2.2 체크리스트 문구 "index.html 또는 main.tsx"
    // 와 실제 구현 관례(@fontsource 를 CSS 나 main 에서 import) 를 모두 흡수.
    const loadedViaHtml = /pretendard/i.test(indexHtmlRaw);
    const loadedViaCss = /pretendard/i.test(indexCssRaw);
    const loadedViaMain = /pretendard/i.test(mainTsxRaw);
    expect(loadedViaHtml || loadedViaCss || loadedViaMain).toBe(true);
  });

  it('body 기본 폰트가 Pretendard 로 지정되어 있다 (@apply font-sans 또는 직접 선언)', () => {
    // font-sans 유틸을 body 에 @apply 하거나, body { font-family: "Pretendard"... }
    // 둘 중 하나. GREEN 시점의 구현 선택에 맞춰 두 방식 모두 허용.
    const appliedViaTailwind = /body\s*\{[^}]*@apply[^;}]*font-sans/s.test(indexCssRaw);
    const appliedDirect = /body\s*\{[^}]*font-family[^;}]*Pretendard/is.test(indexCssRaw);
    expect(appliedViaTailwind || appliedDirect).toBe(true);
  });

  it('body 기본 텍스트 컬러가 ink-700, 배경이 canvas 토큰을 사용한다', () => {
    // Notion-like 톤앤매너 — 본문 #37352F(ink-700) on canvas(#FFFFFF).
    // 모든 섹션이 이 기본값 위에서 동작한다고 가정하므로 명시적 검증.
    expect(indexCssRaw).toMatch(/body\s*\{[^}]*(text-ink-700|color:[^;}]*ink)/s);
    expect(indexCssRaw).toMatch(/body\s*\{[^}]*(bg-canvas|background[^;}]*canvas)/s);
  });
});
