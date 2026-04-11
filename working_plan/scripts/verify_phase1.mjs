#!/usr/bin/env node
/**
 * Phase 1 Bootstrap 검증 스크립트
 *
 * phase01_bootstrap.md의 RED 체크리스트(TEST-P1.1 ~ TEST-P1.18)를
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
  'dist/assets/*.css에 Tailwind 유틸리티 포함 (E2E wiring)',
  () => {
    const distAssets = join(APP, 'dist', 'assets');
    if (!existsSync(distAssets)) return 'dist/assets missing (build first)';
    const cssFiles = readdirSync(distAssets).filter((f) => f.endsWith('.css'));
    if (cssFiles.length === 0) return 'no CSS file in dist/assets';
    // App.tsx에서 사용하는 핵심 유틸이 빌드 산출물 CSS에 포함되어야 함
    // 이 검사가 실패하면 Tailwind wiring이 어딘가 끊어졌다는 뜻
    const required = ['min-h-screen'];
    for (const cssFile of cssFiles) {
      const css = readFileSync(join(distAssets, cssFile), 'utf-8');
      const found = required.every((cls) => css.includes(cls));
      if (found) return;
    }
    return `Tailwind utility(${required.join(',')}) not found in built CSS — wiring broken`;
  }
);

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
