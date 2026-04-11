/**
 * 프로젝트 전역 공통 타입.
 *
 * FeatureStatus:
 *   기능/로드맵 카드의 구현 상태 3종. Badge, FeatureCard, RoadmapSection,
 *   FeaturesSection 등이 공통으로 참조한다.
 *
 *   설계 원칙:
 *     - 새 status 값을 추가할 때 이 한 곳만 수정하면 전 컴포넌트에 타입
 *       에러가 확산되어 업데이트 누락을 방지한다.
 *     - 'done' | 'wip' | 'planned' 외의 값을 허용하지 않는 것은 기획 의도
 *       (01_landing_page_plan.md §7.3 "구현 상태 표기 규칙 3단계").
 */
export type FeatureStatus = 'done' | 'wip' | 'planned';
