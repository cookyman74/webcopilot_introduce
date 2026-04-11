# Web AI Assistant Landing Page - GEMINI.md

This file provides instructional context and project overview for the Web AI Assistant Landing Page project.

## Project Overview

The **Web AI Assistant Landing Page** is a dedicated product introduction site for the Web AI Assistant Chrome Extension. It aims to communicate the product's value proposition, features, usage scenarios, and future roadmap to potential users.

### Key Technologies
- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (Vanilla CSS approach)
- **Testing:** Vitest, React Testing Library
- **Internationalization:** react-i18next (Planned for Phase 3)
- **Deployment:** Vercel (Planned for Phase 10)

### Project Structure
The project is split between high-level planning and the actual implementation:
- `/`: Root directory contains planning documents (`01_landing_page_plan.md`, `02_implementation_plan.md`, etc.).
- `/extapp_landing/`: The React application codebase.
- `/working_plan/`: Detailed step-by-step implementation phases (P1 to P10).

## Building and Running

All commands should be executed within the `extapp_landing` directory:

```bash
cd extapp_landing

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test          # Run once
npm run test:watch    # Watch mode

# Type check
npm run typecheck

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development Conventions

### TDD Workflow (Red → Green → Refactor)
The project follows a strict TDD approach as outlined in `working_plan/main_landing_todolist.md`:
1. **RED:** Write a test (or define a verification checklist) and confirm it fails.
2. **GREEN:** Implement the minimum code required to pass the test.
3. **REFACTOR:** Improve code structure while ensuring tests still pass.

### Directory Organization (under `src/components`)
- `common/`: Reusable UI atoms (Buttons, Badges, etc.).
- `layout/`: Shared layout components (Header, Footer, MainLayout).
- `sections/`: Specific sections of the landing page (Hero, Features, etc.).

### Internationalization (i18n)
- Support for Korean (KO) and English (EN) is mandatory.
- Japanese (JA) and Chinese (ZH) skeletons should be prepared.
- Always add keys to both `ko` and `en` locales simultaneously to avoid missing translations.

### Implementation Principles
- **Status Badges:** Every feature or roadmap item must clearly show its state: `구현됨` (Implemented), `보강 중` (Enhancing), or `계획/검토 중` (Planned).
- **Single Source of Truth:** Constants like the Chrome Web Store URL must be managed in `src/lib/constants.ts`.
- **Responsive Design:** Ensure the layout works across Desktop, Tablet, and Mobile breakpoints.

## Key Reference Documents
- `01_landing_page_plan.md`: Information architecture and messaging strategy.
- `02_implementation_plan.md`: Design tokens and component specifications.
- `working_plan/main_landing_todolist.md`: The master task list and phase definitions.
