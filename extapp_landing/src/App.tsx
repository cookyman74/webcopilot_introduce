import './i18n';
import { Section, Button, Badge, FeatureCard } from './components/common';
import { Header, Footer } from './components/layout';
import { HeroSection, ProblemSection } from './components/sections';

/**
 * Phase 4 랜딩 레이아웃 — HeroSection + ProblemSection + Phase 2 데모 잔존분.
 *
 * 목적:
 *   - Phase 4 HeroSection (h1 · CTA 2개 · 이미지 placeholder) 과 ProblemSection
 *     (4개 문제 카드) 을 Header 직후에 배치해 실제 랜딩 상단 경험을 구성한다.
 *   - Phase 2 의 공통 컴포넌트 변형(Section/Button/Badge/FeatureCard)은 데모
 *     섹션으로 유지되어 App.test.tsx 의 159 assertion 호환성을 보존한다
 *     (TEST-P4.8). Phase 5~ 에서 실제 섹션으로 1:1 교체 예정.
 *
 * Phase 4 핵심 변경점 (phase04 §4.3 TASK-004):
 *   1. <HeroSection /> · <ProblemSection /> 을 Header 바로 뒤에 삽입
 *   2. 데모 첫 Section 의 <h1>"Design System Demo"</h1> 를 <h2> 로 다운그레이드
 *      — HeroSection h1 과의 중복 제거, h1 유일성 가드(TEST-P4.10) 충족
 *   3. 데모 4개 Section 의 렌더 순서를 `NAV_ANCHORS` 순서
 *      (features → scenarios → differentiation → roadmap) 와 일치시킴
 *      — 이전 버전은 scenarios → differentiation → roadmap → features 순서였고
 *      Header 네비 순서(features 가 1번)와 스크롤 흐름이 어긋나 있었다
 *      (리뷰 Low 수정). Phase 5+ 실제 섹션으로 교체될 때도 이 순서 불변.
 */
export default function App() {
  return (
    <>
      <Header />
      <main>
        {/* Phase 4 실제 섹션 — 첫 화면 + 문제 정의 */}
        <HeroSection />
        <ProblemSection />

        {/*
         * Phase 2/3 데모 콘텐츠 (4개 Section) — Phase 5~ 에서 실제 섹션으로 교체.
         * NAV_ANCHORS 4개 ID 는 App.test.tsx "NAV_ANCHORS 4개 ID 존재" 가드가
         * 계속 강제하므로 교체 시점까지 반드시 유지되어야 한다. 렌더 순서도
         * NAV_ANCHORS 배열 순서(features → scenarios → differentiation → roadmap)
         * 를 그대로 따라가 Header 네비 클릭 시 아래로 순차 스크롤되도록 한다.
         */}
        <Section id="features" background="accent-soft">
          <h2 className="text-2xl font-semibold text-ink-900">Feature Cards</h2>
          <p className="mt-2 text-sm text-ink-500">
            좌: 상태 배지 포함 (Features/Roadmap 용) · 우: 상태 배지 없음 (BusinessSection 용 —
            Phase 8 프리뷰)
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <FeatureCard
              title="AI 채팅"
              description="페이지 문맥 기반 질문"
              example="현재 페이지 요약해줘"
              status="done"
              statusLabel="구현됨"
            />
            <FeatureCard
              title="페이지 문맥 기반 AI"
              description="사용자 컨텍스트를 잃지 않는 AI 파이프라인"
            />
          </div>
        </Section>

        <Section id="scenarios" background="canvas">
          {/* h1 → h2 다운그레이드 (TEST-P4.10 h1 유일성 보장) — HeroSection 이 h1 독점 */}
          <h2 className="text-4xl font-bold text-ink-900">Design System Demo</h2>
          <p className="mt-4 text-ink-700">
            Phase 2 공통 컴포넌트 (Section · Button · Badge · FeatureCard) 시각 확인 페이지
          </p>
        </Section>

        <Section id="differentiation" background="surface">
          <h2 className="text-2xl font-semibold text-ink-900">Buttons</h2>
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
          <h2 className="text-2xl font-semibold text-ink-900">Status Badges</h2>
          <div className="mt-6 flex flex-wrap gap-4">
            <Badge status="done">구현됨</Badge>
            <Badge status="wip">보강 중</Badge>
            <Badge status="planned">계획·검토 중</Badge>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
