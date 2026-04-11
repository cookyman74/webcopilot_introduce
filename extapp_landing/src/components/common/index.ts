/**
 * 공통 컴포넌트 barrel export.
 *
 * App.tsx 및 섹션 컴포넌트들은 이 index 를 통해 단일 import 라인으로
 * 공통 컴포넌트를 가져온다:
 *
 *   import { Section, Button, Badge, FeatureCard } from './components/common';
 *
 * 개별 파일 경로 import 도 가능하지만, barrel 이 있으면:
 *   - import 라인 수 감소
 *   - 공통 컴포넌트 목록을 한 파일에서 파악 가능
 *   - 파일 이동 시 호출자 변경 최소화
 */
export { Section } from './Section';
export { Button } from './Button';
export { Badge } from './Badge';
export { FeatureCard } from './FeatureCard';
export type { FeatureCardProps } from './FeatureCard';
