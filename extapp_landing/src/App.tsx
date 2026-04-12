import './i18n';
import { Header, Footer } from './components/layout';
import {
  HeroSection,
  ProblemSection,
  SolutionSection,
  FeaturesSection,
  ScenariosSection,
  DifferentiationSection,
  AIModesSection,
  SafetySection,
  RoadmapSection,
  BusinessSection,
  FinalCTASection,
} from './components/sections';

/**
 * Phase 8 랜딩 레이아웃 — **11개 섹션 본문 완성**.
 *
 * Phase 8 핵심 변경점:
 *   1. RoadmapSection · BusinessSection · FinalCTASection 삽입
 *   2. 마지막 데모 `<Section id="roadmap">` 삭제 — RoadmapSection 이 인수
 *   3. Section / Badge / demo.* import 전부 제거 (데모 전부 소멸)
 *   4. accent-soft 배경 FinalCTASection 으로 복구
 *
 * 최종 섹션 렌더 순서 (11개):
 *   Hero → Problem → Solution → Features → Scenarios → Differentiation
 *   → AIModes → Safety → Roadmap → Business → FinalCTA
 *
 * NAV_ANCHORS: features → scenarios → differentiation → roadmap (4개)
 * #business 는 Header 네비에 **없음** (의도된 배제).
 */
export default function App() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <ScenariosSection />
        <DifferentiationSection />
        <AIModesSection />
        <SafetySection />
        <RoadmapSection />
        <BusinessSection />
        <FinalCTASection />
      </main>
      <Footer />
    </>
  );
}
