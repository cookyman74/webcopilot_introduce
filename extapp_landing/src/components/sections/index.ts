/**
 * sections barrel — Phase 4 §4.4.1 REFACTOR-STRUCTURE.
 *
 * Phase 2 `common/index.ts` · Phase 3 `layout/index.ts` 와 동일 패턴.
 * 외부(App.tsx) 는 `./components/sections` 로 묶어서 import 하고,
 * 내부 재배치는 barrel 파일 하나만 갱신하면 된다.
 */
export { HeroSection } from './HeroSection';
export { ProblemSection } from './ProblemSection';
