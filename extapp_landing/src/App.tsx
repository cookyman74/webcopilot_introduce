import './i18n';
import { useTranslation } from 'react-i18next';
import { Section, Badge } from './components/common';
import { Header, Footer } from './components/layout';
import {
  HeroSection,
  ProblemSection,
  SolutionSection,
  FeaturesSection,
  ScenariosSection,
  DifferentiationSection,
} from './components/sections';

/**
 * Phase 6 랜딩 레이아웃 — 6개 실제 섹션 + 데모 1개 잔존분(roadmap).
 *
 * Phase 6 핵심 변경점 (phase06 §6.3 TASK-004):
 *   1. <ScenariosSection /> · <DifferentiationSection /> 을 FeaturesSection 뒤에 삽입
 *   2. 데모 `<Section id="scenarios">` (Design System Demo) 삭제
 *      — ScenariosSection 이 `id="scenarios"` 를 인수받아 완전 대체
 *   3. 데모 `<Section id="differentiation">` (Buttons) 삭제
 *      — DifferentiationSection 이 `id="differentiation"` 를 인수받아 완전 대체
 *   4. Button import 제거 (데모 differentiation 과 함께 소멸)
 *   5. 데모 `<Section id="roadmap">` (Status Badges) 만 잔존 — Phase 8 교체
 *
 * 섹션 렌더 순서 (TEST-P6.10 가드가 강제):
 *   Hero → Problem → Solution → Features → Scenarios → Differentiation → (데모 roadmap)
 *
 * NAV_ANCHORS 순서: features → scenarios → differentiation → roadmap
 */
export default function App() {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <main>
        {/* Phase 4 실제 섹션 */}
        <HeroSection />
        <ProblemSection />

        {/* Phase 5 실제 섹션 */}
        <SolutionSection />
        <FeaturesSection />

        {/* Phase 6 실제 섹션 */}
        <ScenariosSection />
        <DifferentiationSection />

        {/*
         * Phase 2/3 데모 콘텐츠 (1개 Section — scenarios/differentiation 제거됨).
         * NAV_ANCHORS 중 roadmap ID 만 유지.
         * Phase 8 RoadmapSection 으로 교체 예정.
         */}
        <Section id="roadmap" background="surface-alt">
          <h2 className="text-2xl font-semibold text-ink-900">{t('demo.statusBadges')}</h2>
          <div className="mt-6 flex flex-wrap gap-4">
            <Badge status="done">{t('demo.badgeDone')}</Badge>
            <Badge status="wip">{t('demo.badgeWip')}</Badge>
            <Badge status="planned">{t('demo.badgePlanned')}</Badge>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
