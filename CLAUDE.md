# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

This directory is the landing-page sub-project for the **Web AI Assistant** Chrome Extension. It is *not* the extension itself — it's a marketing/intro site that lives beside the extension repo.

```
00_intro_web_landing_page/
├── extension_intro.md          ← Product source of truth (copy origin)
├── 01_landing_page_plan.md     ← Information architecture / section spec
├── 02_implementation_plan.md   ← Tech-stack + directory + per-section spec
├── working_plan/               ← Phased TDD build plan (phase01..phase10)
│   ├── main_landing_todolist.md
│   ├── phase0N_*.md            ← Per-phase RED→GREEN→REFACTOR checklists
│   └── scripts/verify_phase1.mjs  ← Node-only regression guard for Phase 1
└── extapp_landing/             ← The actual Vite app (run all npm commands here)
```

All `npm` commands must be run from `extapp_landing/`, not from this directory.

## Commands

From `extapp_landing/`:

```bash
npm run dev          # Vite dev server
npm run build        # tsc -b && vite build  (typecheck is part of build)
npm run preview      # Preview the production bundle
npm run lint         # ESLint (flat config, eslint.config.js)
npm run typecheck    # tsc --noEmit -p tsconfig.app.json  (no build output)
npm test             # vitest run (CI / one-shot)
npm run test:watch   # vitest watch
# Single test file:
npx vitest run src/App.test.tsx
# Single test by name:
npx vitest run -t "renders the bootstrap heading"
```

Phase 1 also has a standalone regression guard that runs without vitest (Node builtins only):

```bash
node working_plan/scripts/verify_phase1.mjs
```

It performs 18 checks (TEST-P1.1..P1.18) covering file existence, wiring, and runtime (`typecheck`/`test`/`build`). Keep it green — it is the permanent bootstrap regression guard.

## Stack Notes (Non-Obvious)

- **React 19 + Vite 8 + TypeScript 6 + Tailwind 3**. Strict mode on, `noUnusedLocals`/`noUnusedParameters` on, `verbatimModuleSyntax` on → type-only imports must use `import type`.
- **Test environment is `happy-dom`, not jsdom**, because jsdom@27's transitive deps (`@asamuzakjp/css-color` → `@csstools/css-calc`) break under CJS/ESM interop. `jsdom` is kept as a devDep only for compat; do not switch `vite.config.ts` back to it without revalidating that chain. See the comment in `extapp_landing/vite.config.ts`.
- **Vitest config lives inside `vite.config.ts`** (via `/// <reference types="vitest/config" />`), not a separate `vitest.config.ts`.
- `tsconfig.app.json` is the source-of-truth for type-checking application code; `tsconfig.node.json` is for the build tooling files. Root `tsconfig.json` just references both.

## Architecture (Planned — see `02_implementation_plan.md` §3,5)

The current code is a Phase-1 bootstrap (`App.tsx` renders a single "Bootstrap OK" heading). The target architecture, which phases 2–9 build out, is:

- **Single-page landing** composed of **11 sections** rendered top-to-bottom in `App.tsx`:
  Hero → Problem → Solution → Features → Scenarios → Differentiation → AIModes → Safety → Roadmap → **Business** → FinalCTA
  - The `Business` section (added in plan v2) is aimed at companies that want to adopt or license the underlying tech (page-context AI, Action Tools, script infra). It sits between Roadmap and FinalCTA, is deliberately **not** linked from the Header nav (to avoid diluting the install CTA), has **no status badges** (it pitches reusability, not product-feature status), and its primary CTA is `mailto:${PARTNERSHIP_CONTACT}` — kept separate from the Chrome Web Store CTA that FinalCTA owns.
- **Component layers** under `src/components/`:
  - `layout/` — Header (sticky nav + LanguageSwitcher + CTA), Footer
  - `common/` — `Section` wrapper, `Button`, `Badge`, `FeatureCard` (reused across sections)
  - `sections/` — one file per landing section, each consumes i18n keys
- **i18n via `react-i18next`** with per-section key namespaces in `src/i18n/locales/{ko,en,ja,zh}.json`. ko/en are first-class; ja/zh ship as empty scaffolds. Language is persisted in `localStorage`, initialized from browser language, client-side only (no routing).
- **Constants single-source** in `src/lib/constants.ts` — notably the Chrome Web Store CTA URL. Any CTA must import from here; tests assert it.
- **Design tokens** live in `tailwind.config.js` (`theme.extend.colors`: `canvas`, `surface`, `ink.*`, `accent.*`, `status.{done,wip,planned}`). Notion-like tone but with a **blue** accent (`#2E6EE6`), deliberately *not* Notion's warm accent — see `02_implementation_plan.md` §4.2.
- **Status badges** are load-bearing content, not decoration. Every feature/roadmap item must be tagged `구현됨` / `보강 중` / `계획/검토 중` via the `Badge` component. The information-architecture plan (`01_landing_page_plan.md` §7.3) treats this as a hard rule to prevent "implemented vs. planned" confusion — the Roadmap section especially must never render without a non-`구현됨` badge.

## Working Method

- Work is organized as 10 sequential phases in `working_plan/phase0N_*.md`, each a **1-day, E2E-verifiable unit** following **Red → Green → Refactor** (vitest from Phase 2 onward; Phase 1 uses the Node verify script because vitest doesn't exist yet at that point). Before starting implementation work, read the relevant phase file — it contains the exact TEST IDs, acceptance checks, and scope boundaries for that phase.
- When copy or section content is involved, the source of truth is `extension_intro.md` → `01_landing_page_plan.md` → section spec in `02_implementation_plan.md` §5. Do not invent product claims; mirror the three documented feature statuses.
- `02_implementation_plan.md` §9 lists explicit **non-goals** for the 1st implementation: no Next.js/SSR, no dark mode, no router, no CMS, no analytics, no real screenshots (placeholders only), no ja/zh translation content. Do not add any of these unless the user asks.

## Deployment

- Target: **Vercel**, auto-deploy on `main` push, PRs become Preview Deployments.
- **Critical**: Vercel's **Root Directory** must be set to `docs/00_intro_web_landing_page/extapp_landing` (the project is in a sub-path of the extension monorepo, not at repo root). Without this, the build fails because Vercel can't find `package.json`. This is listed as the #1 deployment risk in `working_plan/main_landing_todolist.md`.
- Framework preset: Vite · Build: `npm run build` · Output: `dist` · Node: 20.x.
