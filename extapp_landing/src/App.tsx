import './i18n';
import { useTranslation } from 'react-i18next';
import { Section, Button, Badge } from './components/common';
import { Header, Footer } from './components/layout';
import {
  HeroSection,
  ProblemSection,
  SolutionSection,
  FeaturesSection,
} from './components/sections';

/**
 * Phase 5 랜딩 레이아웃 — Hero + Problem + Solution + Features + 데모 잔존분.
 *
 * Phase 5 핵심 변경점 (phase05 §5.3 TASK-005):
 *   1. <SolutionSection /> · <FeaturesSection /> 을 ProblemSection 바로 뒤에 삽입
 *   2. 데모 `<Section id="features" background="accent-soft">` (Feature Cards 데모)
 *      삭제 — FeaturesSection 이 `id="features"` 를 인수받아 완전 대체
 *   3. 나머지 데모 Section 3개 (scenarios/differentiation/roadmap) 는 유지
 *   4. FeatureCard import 제거 (데모 features 섹션과 함께 소멸)
 *
 * 섹션 렌더 순서 (TEST-P5.12 가드가 강제):
 *   Hero → Problem → Solution → Features → (데모 3개: scenarios → differentiation → roadmap)
 *
 * NAV_ANCHORS 순서 (features → scenarios → differentiation → roadmap) 와
 * 섹션 렌더 순서가 일치해야 한다 — App.test.tsx 의 "섹션 렌더 순서가
 * NAV_ANCHORS 배열 순서와 일치" 가드가 이를 강제.
 */
export default function App() {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <main>
        {/* Phase 4 실제 섹션 — 첫 화면 + 문제 정의 */}
        <HeroSection />
        <ProblemSection />

        {/* Phase 5 실제 섹션 — 해결 방식 3축 + 9개 기능 카드 */}
        <SolutionSection />
        <FeaturesSection />

        {/*
         * Phase 2/3 데모 콘텐츠 (3개 Section — features 제거됨).
         * NAV_ANCHORS 중 scenarios/differentiation/roadmap 3개 ID 유지.
         * Phase 6~ 에서 실제 섹션으로 1:1 교체 예정.
         */}
        <Section id="scenarios" background="canvas">
          <h2 className="text-4xl font-bold text-ink-900">{t('demo.designSystem')}</h2>
          <p className="mt-4 text-ink-700">{t('demo.designSystemDesc')}</p>
        </Section>

        <Section id="differentiation" background="surface">
          <h2 className="text-2xl font-semibold text-ink-900">{t('demo.buttons')}</h2>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button href="#features" variant="secondary">
              Anchor Link
            </Button>
            <Button href="https://example.com" variant="primary" external>
              External Link
            </Button>
            <Button href="https://auto-detected.example.com" variant="secondary">
              Auto External
            </Button>
          </div>
        </Section>

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
