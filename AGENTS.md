# Repository Guidelines

## Project Structure & Module Organization

This repository contains planning documents at the root and the actual landing page app in `extapp_landing/`. Keep implementation work inside `extapp_landing/src/`.

- `extapp_landing/src/main.tsx`: Vite entry point
- `extapp_landing/src/App.tsx`: current top-level page component
- `extapp_landing/src/components/`: shared UI, grouped by `common/`, `layout/`, and `sections/`
- `extapp_landing/src/lib/`: reusable helpers
- `extapp_landing/src/test/setup.ts`: Vitest and Testing Library setup
- `extapp_landing/public/`: static assets such as `favicon.svg`

Avoid committing generated output from `extapp_landing/dist/` or dependencies from `extapp_landing/node_modules/`.

## Build, Test, and Development Commands

Run commands from `extapp_landing/`.

- `npm install`: install dependencies
- `npm run dev`: start the Vite dev server with HMR
- `npm run build`: run TypeScript build checks and produce a production bundle
- `npm run preview`: serve the production build locally
- `npm run lint`: run ESLint on `.ts` and `.tsx` files
- `npm run test`: run Vitest once
- `npm run test:watch`: run Vitest in watch mode
- `npm run typecheck`: run TypeScript without emitting files

## Coding Style & Naming Conventions

Use TypeScript and React function components. Prettier is configured for 2-space indentation, semicolons, single quotes, trailing commas where valid, and `printWidth: 100`. ESLint covers TypeScript, React Hooks, and Vite refresh rules.

Use `PascalCase` for React components (`HeroSection.tsx`), `camelCase` for functions and variables, and colocate tests next to the component when practical. Keep Tailwind utility usage readable; extract repeated UI into components instead of duplicating long class strings.

## Testing Guidelines

Vitest runs with Testing Library and `happy-dom`. Name tests `*.test.tsx` or `*.test.ts` and keep them close to the code they verify, following the existing `src/App.test.tsx` pattern. Add or update tests for any user-visible behavior, rendering logic, or shared helper introduced in a change.

## Commit & Pull Request Guidelines

This repository has no established commit history yet, so use a clear imperative format such as `feat: add hero section` or `fix: correct CTA layout`. Keep commits focused and easy to review.

Pull requests should include a short summary, testing notes (`npm run lint && npm run test && npm run build`), and screenshots for UI changes. Link the related issue or planning document when relevant.
