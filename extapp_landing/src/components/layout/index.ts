/**
 * 레이아웃 컴포넌트 barrel export — Phase 2 `components/common/index.ts` 와 동일 패턴.
 *
 * 사용:
 *   import { Header, Footer, LanguageSwitcher } from './components/layout';
 *
 * 개별 파일 경로 import 도 가능하지만 barrel 이 있으면:
 *   - import 라인 수 감소
 *   - 레이아웃 컴포넌트 목록을 한 파일에서 파악 가능
 *   - 파일 이동 시 호출자 변경 최소화
 */
export { Header } from './Header';
export { Footer } from './Footer';
export { LanguageSwitcher } from './LanguageSwitcher';
