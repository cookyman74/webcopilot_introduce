#!/usr/bin/env node
/**
 * Phase 1 Bootstrap 검증 스크립트
 *
 * phase01_bootstrap.md의 RED 체크리스트(TEST-P1.1 ~ TEST-P1.23)를
 * 실행 가능한 회귀 가드로 구현한다.
 *
 * - Bootstrap 이전: 모든 항목이 FAIL이어야 함 (RED 상태)
 * - Bootstrap 완료 후: 모든 항목이 PASS여야 함 (GREEN 상태)
 *
 * 이 스크립트는 Node 빌트인만 사용하므로 extapp_landing/이 존재하기
 * 전에도 실행 가능하다 (부트스트랩 예외).
 *
 * 사용:
 *   cd 00_intro_web_landing_page
 *   node working_plan/scripts/verify_phase1.mjs
 *
 * 종료 코드:
 *   0 — 모든 항목 PASS
 *   1 — 1건 이상 FAIL
 *
 * ─── 변경 이력 ─────────────────────────────────────────────────
 * v1: 18개 가드(P1.1~P1.18). RED 스냅샷(Phase1_Bootstrap_RED_20260410.md)의 기반.
 * v2: 리뷰 피드백 반영 — 5개 가드 추가(P1.19~P1.23) + P1.18 동적 추출 강화.
 *   - P1.18 강화: App.tsx의 className을 동적으로 추출해 모든 utility가
 *     빌드된 dist CSS에 존재하는지 검사 (리뷰 Medium: min-h-screen 한 개만
 *     검사하던 문제 해결).
 *   - P1.19: `npm run lint` 런타임 가드 (리뷰 High: vite.config.ts의
 *     triple-slash reference가 실제 lint 실패였으나 기존 가드는 검출 실패).
 *   - P1.20: main.tsx 렌더 와이어링 정적 가드 (리뷰 Medium: createRoot(...)
 *     .render(<App/>) wiring이 깨져도 App.test.tsx가 <App />을 직접 렌더하므로
 *     놓침).
 *   - P1.21: `npm run format:check` 런타임 가드 (리뷰 Low: Prettier는 설정
 *     존재만 검증, 실제 포맷 회귀 방지 없음).
 *   - P1.22: index.html → main.tsx 엔트리 포인트 연결성 + 빌드 후 dist/index.html
 *     에 번들 스크립트가 주입됐는지 검사 (리뷰 Refined: 스크립트 태그가 빠져도
 *     빌드는 성공).
 *   - P1.23: vite.config.ts의 plugins 배열에 @vitejs/plugin-react가 실제로
 *     포함됐는지 검사 (리뷰 Refined: devDep 존재만으로는 JSX 변환 wiring 보장
 *     안 됨).
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const APP = join(ROOT, 'extapp_landing');

// ─── 테스트 러너 ───────────────────────────────────────────────────
const results = [];

function test(id, label, fn) {
  try {
    const r = fn();
    if (r === true || r === undefined) {
      results.push({ id, label, status: 'PASS' });
    } else {
      results.push({ id, label, status: 'FAIL', detail: String(r) });
    }
  } catch (e) {
    results.push({ id, label, status: 'FAIL', detail: e.message });
  }
}

// ─── 헬퍼 ─────────────────────────────────────────────────────────
function readIfExists(p) {
  return existsSync(p) ? readFileSync(p, 'utf-8') : null;
}

// JS/TS 소스에서 주석만 제거한다 (문자열 리터럴은 보존).
// 사용처: from '...' import 문자열처럼 내용이 필요한 검사 (P1.23의 패키지명 감지 등).
function stripJsComments(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    // line comment
    if (c === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    // block comment
    if (c === '/' && next === '*') {
      i += 2;
      while (i < src.length - 1 && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    // string / template literal — 그대로 보존
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      out += quote;
      i++;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\') {
          out += src[i];
          if (i + 1 < src.length) out += src[i + 1];
          i += 2;
          continue;
        }
        out += src[i];
        i++;
      }
      if (i < src.length) {
        out += quote;
        i++;
      }
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

// JS/TS 소스에서 라인·블록 주석 **및 문자열 리터럴 내용**을 제거한다.
// 사용처: createRoot(...).render(...) 같은 구조 매칭 (P1.20).
//         문자열 안의 '(' 같은 문자가 괄호 balancer를 오염시키는 것을 방지.
// 주의: template literal의 ${...} interpolation은 단순화를 위해 내용 취급한다.
function stripJsCommentsAndStrings(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    // line comment
    if (c === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    // block comment
    if (c === '/' && next === '*') {
      i += 2;
      while (i < src.length - 1 && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    // string / template literal — keep quotes as structural markers, blank out inside
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      out += quote;
      i++;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\') {
          i += 2;
          continue;
        }
        // preserve newlines inside template literals (for line counting)
        out += src[i] === '\n' ? '\n' : ' ';
        i++;
      }
      if (i < src.length) {
        out += quote;
        i++;
      }
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

// createRoot( ... ) 의 닫는 ')' 직후에 `.render( ... )` 가 체인되어 있고,
// render 인자 안에 <App 이 등장하는지 검사한다.
// 단순한 3개 조각의 독립 regex는 `createRoot(root); foo().render(<App />)` 같은
// 코드를 우회할 수 있으므로, 균형 괄호 walker를 사용한다.
function hasCreateRootRenderChainWithApp(src) {
  const clean = stripJsCommentsAndStrings(src);
  const startRe = /\bcreateRoot\s*\(/g;
  let m;
  while ((m = startRe.exec(clean)) !== null) {
    let pos = m.index + m[0].length;
    let depth = 1;
    while (pos < clean.length && depth > 0) {
      const ch = clean[pos];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      pos++;
    }
    if (depth !== 0) continue;
    // pos is right after the closing ')' of createRoot(...)
    let after = pos;
    while (after < clean.length && /\s/.test(clean[after])) after++;
    // must be immediately followed by `.render` (optionally whitespaced)
    if (clean.slice(after, after + 7) !== '.render') continue;
    let rpos = after + 7;
    while (rpos < clean.length && /\s/.test(clean[rpos])) rpos++;
    if (clean[rpos] !== '(') continue;
    rpos++;
    let rdepth = 1;
    const renderStart = rpos;
    while (rpos < clean.length && rdepth > 0) {
      const ch = clean[rpos];
      if (ch === '(') rdepth++;
      else if (ch === ')') rdepth--;
      rpos++;
    }
    if (rdepth !== 0) continue;
    const renderArgs = clean.slice(renderStart, rpos - 1);
    if (/<App\b/.test(renderArgs)) return true;
  }
  return false;
}

// src/ 하위의 .ts / .tsx 소스 파일을 재귀적으로 수집.
// 테스트 파일(.test.*, .spec.*)은 제외 — 유틸 스캔 대상이 아님.
function collectSourceFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        stack.push(full);
      } else if (entry.isFile()) {
        if (!/\.(tsx?|jsx?)$/.test(entry.name)) continue;
        if (/\.(test|spec)\.(tsx?|jsx?)$/.test(entry.name)) continue;
        out.push(full);
      }
    }
  }
  return out;
}

function stripJsonComments(src) {
  // JSONC: /* */ 블록 + // 라인 주석 제거 + 트레일링 콤마 정리
  let out = src.replace(/\/\*[\s\S]*?\*\//g, '');
  out = out
    .split('\n')
    .map((line) => {
      let inStr = false;
      let strChar = '';
      let escape = false;
      for (let i = 0; i < line.length - 1; i++) {
        const c = line[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (c === '\\') {
          escape = true;
          continue;
        }
        if (inStr) {
          if (c === strChar) inStr = false;
          continue;
        }
        if (c === '"' || c === "'") {
          inStr = true;
          strChar = c;
          continue;
        }
        if (c === '/' && line[i + 1] === '/') return line.slice(0, i);
      }
      return line;
    })
    .join('\n');
  out = out.replace(/,(\s*[}\]])/g, '$1');
  return out;
}

function findFirst(paths) {
  for (const p of paths) {
    const full = join(APP, p);
    if (existsSync(full)) {
      return { path: p, full, content: readFileSync(full, 'utf-8') };
    }
  }
  return null;
}

function nodeModulesReady() {
  return (
    existsSync(join(APP, 'package.json')) &&
    existsSync(join(APP, 'node_modules'))
  );
}

// ─── 정적 파일 검사 (TEST-P1.1 ~ TEST-P1.14) ──────────────────────

test('P1.1', 'extapp_landing/package.json 존재', () => {
  if (!existsSync(join(APP, 'package.json'))) return 'package.json missing';
});

test('P1.2', 'package.json dependencies에 react/react-dom 포함', () => {
  const pkg = readIfExists(join(APP, 'package.json'));
  if (!pkg) return 'package.json missing';
  const json = JSON.parse(pkg);
  if (!json.dependencies?.react) return 'react missing in dependencies';
  if (!json.dependencies?.['react-dom'])
    return 'react-dom missing in dependencies';
});

test('P1.3', 'package.json devDependencies 핵심 패키지 포함', () => {
  const pkg = readIfExists(join(APP, 'package.json'));
  if (!pkg) return 'package.json missing';
  const json = JSON.parse(pkg);
  const required = [
    'typescript',
    'vite',
    'tailwindcss',
    'postcss',
    'autoprefixer',
    'vitest',
    '@testing-library/react',
    '@testing-library/jest-dom',
  ];
  const dev = json.devDependencies ?? {};
  const missing = required.filter((r) => !dev[r]);
  if (missing.length > 0) return `missing devDeps: ${missing.join(', ')}`;
  // DOM 에뮬레이션 라이브러리 (jsdom 또는 happy-dom 중 하나 필요)
  if (!dev['jsdom'] && !dev['happy-dom']) {
    return 'missing DOM env library: need jsdom or happy-dom';
  }
});

test('P1.4', 'tsconfig compilerOptions.strict === true', () => {
  // Vite react-ts: tsconfig.json은 references, strict는 tsconfig.app.json에 있음
  const candidates = ['tsconfig.app.json', 'tsconfig.json'];
  for (const c of candidates) {
    const content = readIfExists(join(APP, c));
    if (!content) continue;
    try {
      const json = JSON.parse(stripJsonComments(content));
      if (json.compilerOptions?.strict === true) return; // PASS
    } catch (e) {
      return `${c} parse error: ${e.message}`;
    }
  }
  return 'compilerOptions.strict !== true (checked tsconfig.app.json, tsconfig.json)';
});

test(
  'P1.5',
  'tailwind.config.* content glob에 index.html과 src/** 포함',
  () => {
    const cfg = findFirst([
      'tailwind.config.js',
      'tailwind.config.cjs',
      'tailwind.config.ts',
      'tailwind.config.mjs',
    ]);
    if (!cfg) return 'tailwind.config.* not found';
    if (!/index\.html/.test(cfg.content))
      return 'content glob missing index.html';
    if (!/src\/\*\*/.test(cfg.content)) return 'content glob missing src/**';
  }
);

test('P1.6', 'postcss.config.*에 tailwindcss + autoprefixer 포함', () => {
  const cfg = findFirst([
    'postcss.config.js',
    'postcss.config.cjs',
    'postcss.config.mjs',
  ]);
  if (!cfg) return 'postcss.config.* not found';
  if (!/tailwindcss/.test(cfg.content)) return 'tailwindcss plugin missing';
  if (!/autoprefixer/.test(cfg.content)) return 'autoprefixer plugin missing';
});

test('P1.7', 'src/index.css에 @tailwind base/components/utilities', () => {
  const css = readIfExists(join(APP, 'src/index.css'));
  if (!css) return 'src/index.css missing';
  if (!/@tailwind\s+base/.test(css)) return '@tailwind base missing';
  if (!/@tailwind\s+components/.test(css))
    return '@tailwind components missing';
  if (!/@tailwind\s+utilities/.test(css))
    return '@tailwind utilities missing';
});

test('P1.8', "src/main.tsx가 './index.css' import", () => {
  const main = readIfExists(join(APP, 'src/main.tsx'));
  if (!main) return 'src/main.tsx missing';
  if (!/import\s+['"]\.\/index\.css['"]/.test(main))
    return "import './index.css' missing in main.tsx";
});

test('P1.9', 'src/App.tsx가 Tailwind 유틸리티 className 사용', () => {
  const app = readIfExists(join(APP, 'src/App.tsx'));
  if (!app) return 'src/App.tsx missing';
  const re =
    /className\s*=\s*["'`][^"'`]*\b(min-h-|max-w-|flex|grid|bg-|text-|p[xytrbl]?-|m[xytrbl]?-|rounded|shadow|font-)/;
  if (!re.test(app)) return 'no Tailwind utility class found in App.tsx';
});

test('P1.10', 'src/App.test.tsx 존재 + describe/it', () => {
  const t = readIfExists(join(APP, 'src/App.test.tsx'));
  if (!t) return 'src/App.test.tsx missing';
  if (!/(describe|it|test)\s*\(/.test(t))
    return 'no describe/it/test() found';
});

test('P1.11', 'vitest config에 DOM 환경(jsdom 또는 happy-dom) 설정', () => {
  const cfg = findFirst([
    'vitest.config.ts',
    'vitest.config.js',
    'vite.config.ts',
  ]);
  if (!cfg) return 'no vitest/vite config found';
  // environment 옵션에 jsdom 또는 happy-dom이 명시되어야 함
  if (!/environment\s*:\s*['"](?:jsdom|happy-dom)['"]/.test(cfg.content)) {
    return 'no DOM environment (jsdom/happy-dom) configured in test.environment';
  }
});

test('P1.12', '.gitignore에 node_modules, dist 포함', () => {
  const gi = readIfExists(join(APP, '.gitignore'));
  if (!gi) return '.gitignore missing';
  if (!/node_modules/.test(gi)) return 'node_modules not ignored';
  if (!/dist/.test(gi)) return 'dist not ignored';
});

test('P1.13', 'ESLint config 존재', () => {
  const candidates = [
    '.eslintrc.cjs',
    '.eslintrc.js',
    '.eslintrc.json',
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.cjs',
  ];
  for (const c of candidates) if (existsSync(join(APP, c))) return;
  return 'no ESLint config found';
});

test('P1.14', 'Prettier config 존재', () => {
  const candidates = [
    '.prettierrc',
    '.prettierrc.json',
    '.prettierrc.js',
    '.prettierrc.cjs',
    'prettier.config.js',
    'prettier.config.cjs',
  ];
  for (const c of candidates) if (existsSync(join(APP, c))) return;
  return 'no Prettier config found';
});

// ─── 런타임 검사 (TEST-P1.15 ~ TEST-P1.18) — node_modules 필요 ────

test('P1.15', 'npm run typecheck 성공 (strict 모드 포함)', () => {
  if (!nodeModulesReady()) return 'package.json or node_modules missing';
  try {
    execSync('npm run typecheck', { cwd: APP, stdio: 'pipe' });
  } catch (e) {
    const out = (e.stdout?.toString() || e.stderr?.toString() || e.message)
      .split('\n')
      .slice(-3)
      .join(' / ');
    return `typecheck failed: ${out}`;
  }
});

test('P1.16', 'npm test 성공 (vitest run)', () => {
  if (!nodeModulesReady()) return 'package.json or node_modules missing';
  try {
    execSync('npm test', { cwd: APP, stdio: 'pipe' });
  } catch (e) {
    const out = (e.stdout?.toString() || e.stderr?.toString() || e.message)
      .split('\n')
      .slice(-3)
      .join(' / ');
    return `tests failed: ${out}`;
  }
});

test('P1.17', 'npm run build 성공 + dist/index.html 생성', () => {
  if (!nodeModulesReady()) return 'package.json or node_modules missing';
  try {
    execSync('npm run build', { cwd: APP, stdio: 'pipe' });
  } catch (e) {
    const out = (e.stdout?.toString() || e.stderr?.toString() || e.message)
      .split('\n')
      .slice(-3)
      .join(' / ');
    return `build failed: ${out}`;
  }
  if (!existsSync(join(APP, 'dist/index.html')))
    return 'dist/index.html not generated';
});

test(
  'P1.18',
  'dist/assets/*.css에 src/ 전체의 Tailwind 유틸리티 포함 (동적 E2E wiring, variant 지원)',
  () => {
    // v2.1: 스캔 대상을 src/**/*.{ts,tsx,js,jsx} 전체로 확장.
    // v2.0은 App.tsx만 봤지만, Phase 2 이후 다른 컴포넌트가 추가되면 누락 검출이 불가.
    const srcDir = join(APP, 'src');
    if (!existsSync(srcDir)) return 'src/ missing';
    const sourceFiles = collectSourceFiles(srcDir);
    if (sourceFiles.length === 0) return 'no source files under src/';

    // className="..." 뿐 아니라 className={`...`} 템플릿 리터럴과 clsx(`...`) 형태까지 포착.
    // - "...", '...', `...` 세 가지 quote 허용
    // - class-like 속성명은 JSX의 className 만 명시적으로 대상으로 함
    const classExtractors = [
      /className\s*=\s*["']([^"']+)["']/g,
      /className\s*=\s*\{?\s*`([^`]+)`/g,
      // clsx/cn/tailwind-merge에 넘기는 bare 문자열도 일부 포착
      /\b(?:clsx|cn|twMerge|tw)\s*\(\s*["'`]([^"'`]+)["'`]/g,
    ];

    const classes = new Set();
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf-8');
      for (const re of classExtractors) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(content)) !== null) {
          for (const c of m[1].split(/\s+/).filter(Boolean)) classes.add(c);
        }
      }
    }

    // Tailwind utility만 걸러내기.
    // v2.1: variant prefix(md:, hover:, dark:, 2xl:, md:hover: 등)를 제거한 **베이스** 클래스로 필터 판정.
    // 이전 버전은 md:flex 같은 variant 클래스를 전부 제외했음 (리뷰 Medium).
    const utilityPrefixes =
      /^(min-h-|max-h-|max-w-|min-w-|w-|h-|size-|flex|grid|inline|block|hidden|container|items-|justify-|self-|place-|gap-|space-|bg-|text-|font-|leading-|tracking-|p[xytrbl]?-|m[xytrbl]?-|rounded|shadow|border|ring|outline|opacity-|z-|top-|right-|bottom-|left-|inset-|absolute|relative|fixed|sticky|static|overflow-|cursor-|select-|transition|duration-|ease-|transform|translate-|scale-|rotate-|skew-|origin-|aspect-|col-|row-|order-|basis-|truncate|uppercase|lowercase|capitalize|italic|underline|line-|whitespace-|break-|list-|divide-|pointer-|resize|appearance-|backdrop-|filter|blur|brightness|contrast|grayscale|invert|saturate|sepia)/;

    const stripVariants = (cls) => cls.split(':').pop();
    const utilities = [...classes].filter((c) => utilityPrefixes.test(stripVariants(c)));
    if (utilities.length === 0) {
      return `no Tailwind utility class extracted from ${sourceFiles.length} source file(s) — cannot verify`;
    }

    const distAssets = join(APP, 'dist', 'assets');
    if (!existsSync(distAssets)) return 'dist/assets missing (build first)';
    const cssFiles = readdirSync(distAssets).filter((f) => f.endsWith('.css'));
    if (cssFiles.length === 0) return 'no CSS file in dist/assets';

    // 모든 유틸이 하나의 CSS 번들에 전부 포함되어야 wiring이 온전함.
    // CSS escape 고려:
    //   text-3xl       → .text-3xl
    //   p-2.5          → .p-2\.5
    //   md:flex        → .md\:flex
    //   md:hover:bg-.. → .md\:hover\:bg-..
    const buildRegex = (cls) => {
      const escaped = cls.replace(/[.:/\\[\]()]/g, (ch) => `\\\\?${ch}`);
      return new RegExp(`\\.${escaped}(?:[^A-Za-z0-9_-]|$)`);
    };

    for (const cssFile of cssFiles) {
      const css = readFileSync(join(distAssets, cssFile), 'utf-8');
      const missing = utilities.filter((cls) => !buildRegex(cls).test(css));
      if (missing.length === 0) return; // PASS: 모든 유틸이 이 CSS에 존재
    }
    // 어느 CSS 파일에도 전부 포함된 경우가 없음 → 가장 많이 남은 번들 기준 보고
    let worstMissing = utilities;
    for (const cssFile of cssFiles) {
      const css = readFileSync(join(distAssets, cssFile), 'utf-8');
      const missing = utilities.filter((cls) => !buildRegex(cls).test(css));
      if (missing.length < worstMissing.length) worstMissing = missing;
    }
    return `missing from built CSS (${sourceFiles.length} src files scanned): ${worstMissing.slice(0, 10).join(', ')}${worstMissing.length > 10 ? `, ... (${worstMissing.length - 10} more)` : ''} — Tailwind wiring broken`;
  }
);

// ─── 추가 가드 (v2) ───────────────────────────────────────────────
// 리뷰 피드백으로 추가된 5개 가드.
//   - P1.19: `npm run lint` 런타임 가드
//   - P1.20: main.tsx render wiring 정적 가드
//   - P1.21: `npm run format:check` 런타임 가드
//   - P1.22: index.html → main.tsx 엔트리 포인트 + dist 주입 검사
//   - P1.23: vite.config.ts plugins 배열에 @vitejs/plugin-react 포함 검사

test('P1.19', 'npm run lint 성공 (ESLint 회귀 가드)', () => {
  if (!nodeModulesReady()) return 'package.json or node_modules missing';
  const pkg = JSON.parse(readFileSync(join(APP, 'package.json'), 'utf-8'));
  if (!pkg.scripts?.lint) return 'package.json has no "lint" script';
  try {
    execSync('npm run lint', { cwd: APP, stdio: 'pipe' });
  } catch (e) {
    const out = (e.stdout?.toString() || e.stderr?.toString() || e.message)
      .split('\n')
      .slice(-5)
      .join(' / ');
    return `lint failed: ${out}`;
  }
});

test('P1.20', 'src/main.tsx가 createRoot(...).render(<App/>) 와이어링', () => {
  const main = readIfExists(join(APP, 'src/main.tsx'));
  if (!main) return 'src/main.tsx missing';
  // 1) react-dom/client의 createRoot import
  if (!/import\s*\{[^}]*\bcreateRoot\b[^}]*\}\s*from\s*['"]react-dom\/client['"]/.test(main)) {
    return "missing: import { createRoot } from 'react-dom/client'";
  }
  // 2) App import (확장자는 .tsx 또는 없음 둘 다 허용)
  if (!/import\s+App\s+from\s*['"]\.\/App(?:\.tsx)?['"]/.test(main)) {
    return "missing: import App from './App'";
  }
  // 3) v2.1: createRoot(...).render(...) 체인 및 render 인자 <App 존재를
  //    **동일 표현식 내부**에서 검증한다.
  //    이전 v2.0은 `createRoot(` / `).render(` / `<App` 세 조각을 독립 검사하여
  //    `createRoot(root); foo().render(<App />)` 같은 코드가 우회됐음 (리뷰 High).
  if (!hasCreateRootRenderChainWithApp(main)) {
    return 'missing: createRoot(...).render(<App ...>) wiring in a single expression';
  }
});

test('P1.21', 'npm run format:check 성공 (Prettier 회귀 가드)', () => {
  if (!nodeModulesReady()) return 'package.json or node_modules missing';
  const pkg = JSON.parse(readFileSync(join(APP, 'package.json'), 'utf-8'));
  if (!pkg.scripts?.['format:check']) {
    return 'package.json has no "format:check" script';
  }
  try {
    execSync('npm run format:check', { cwd: APP, stdio: 'pipe' });
  } catch (e) {
    const out = (e.stdout?.toString() || e.stderr?.toString() || e.message)
      .split('\n')
      .slice(-5)
      .join(' / ');
    return `format:check failed: ${out}`;
  }
});

test(
  'P1.22',
  'index.html → main.tsx 엔트리 + <div id="root"> + dist 번들 실재',
  () => {
    // v2.1: 세 가지를 모두 검증한다.
    //   (a) 소스 index.html의 <script type="module" src="/src/main.tsx"> — 속성 순서 무관
    //   (b) 소스 index.html의 React 마운트 지점 (id="root") 존재
    //   (c) dist/index.html에 module script가 주입되고 dist/assets/*.js 파일이 실재
    const html = readIfExists(join(APP, 'index.html'));
    if (!html) return 'index.html missing';

    // (a) 속성 순서 무관 검사: 모든 <script ...> 태그를 수집해 속성을 각각 확인
    const scriptTagRe = /<script\b([^>]*)>/gi;
    const sourceScripts = [];
    let sm;
    while ((sm = scriptTagRe.exec(html)) !== null) sourceScripts.push(sm[1]);
    const hasEntryScript = sourceScripts.some((attrs) => {
      const typeOk = /\btype\s*=\s*["']module["']/i.test(attrs);
      const srcOk = /\bsrc\s*=\s*["']\/src\/main\.tsx["']/i.test(attrs);
      return typeOk && srcOk;
    });
    if (!hasEntryScript) {
      return 'index.html missing <script type="module" src="/src/main.tsx"> (attribute order 무관)';
    }

    // (b) <div id="root"> (또는 태그 무관 id="root") 존재 — React 마운트 지점
    if (!/<[a-z][^>]*\bid\s*=\s*["']root["']/i.test(html)) {
      return 'index.html missing mount target with id="root"';
    }

    // (c) 빌드 후 dist/index.html 검사
    const distIndex = readIfExists(join(APP, 'dist/index.html'));
    if (!distIndex) return 'dist/index.html missing (build first)';

    // 모든 <script> 태그 수집 → type="module" + src 속성 추출 (속성 순서 무관)
    scriptTagRe.lastIndex = 0;
    const distScripts = [];
    let dm;
    while ((dm = scriptTagRe.exec(distIndex)) !== null) distScripts.push(dm[1]);

    const entryEntry = distScripts.find((attrs) => /\btype\s*=\s*["']module["']/i.test(attrs));
    if (!entryEntry) {
      return 'dist/index.html missing <script type="module" ...>';
    }
    const srcMatch = entryEntry.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (!srcMatch) return 'dist/index.html module script has no src attribute';
    const srcPath = srcMatch[1];

    // Vite는 /assets/*.js로 번들을 주입한다. 다른 경로면 wiring이 의심스러움.
    if (!/^\/assets\/[^/]+\.js$/.test(srcPath)) {
      return `dist/index.html module script points to unexpected path: ${srcPath} (expected /assets/*.js)`;
    }

    // 참조된 번들 파일이 실제로 존재하는지 확인 (깨진 참조 방지)
    const assetFs = join(APP, 'dist', srcPath.replace(/^\//, ''));
    if (!existsSync(assetFs)) {
      return `dist/index.html references ${srcPath} but file does not exist`;
    }
  }
);

test('P1.23', 'vite.config.ts plugins 배열에 @vitejs/plugin-react 포함', () => {
  const cfg = readIfExists(join(APP, 'vite.config.ts'));
  if (!cfg) return 'vite.config.ts missing';
  // v2.1: 주석을 먼저 제거해서 `// plugins: [react()]` 같은 주석 라인이
  // plugins: [] 판정을 우회하지 못하도록 한다 (리뷰 Medium).
  // import 문자열은 그대로 살려야 하므로 stripJsComments(주석만) 을 사용.
  const clean = stripJsComments(cfg);
  if (!/from\s*['"]@vitejs\/plugin-react['"]/.test(clean)) {
    return "missing: import ... from '@vitejs/plugin-react'";
  }
  // plugins 배열 내부에서 react() 호출이 존재해야 JSX 변환이 활성화된다.
  if (!/plugins\s*:\s*\[[^\]]*\breact\s*\(/.test(clean)) {
    return 'plugins: [...] does not invoke react() — JSX transform disabled';
  }
});

// ─── 결과 출력 ─────────────────────────────────────────────────────
let pass = 0;
let fail = 0;
console.log('');
console.log('━━━ Phase 1 Bootstrap 검증 ━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`APP: ${APP}`);
console.log('');

for (const r of results) {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} TEST-${r.id}  ${r.label}`);
  if (r.status === 'FAIL' && r.detail) {
    console.log(`     └─ ${r.detail}`);
  }
  if (r.status === 'PASS') pass++;
  else fail++;
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`결과: ${pass} PASS / ${fail} FAIL / 총 ${results.length}`);
console.log('');

process.exit(fail === 0 ? 0 : 1);
