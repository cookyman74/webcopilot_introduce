import './i18n';
import { Section, Button, Badge, FeatureCard } from './components/common';
import { Header, Footer } from './components/layout';

/**
 * Phase 2 데모 페이지 + Phase 3 Header/Footer 레이아웃.
 *
 * 목적:
 *   - Phase 2 의 공통 컴포넌트 변형(Section/Button/Badge/FeatureCard)을 유지해
 *     Phase 2 App.test.tsx 84 assertion 이 회귀 없이 유지되도록 함 (TEST-P3.11)
 *   - Phase 3 의 Header(i18n 네비 + CTA + LanguageSwitcher) 와 Footer 를
 *     실제 랜딩 레이아웃 구조(`<Header> + <main> + <Footer>`)로 둘러싸서
 *     `npm run dev` 시 한 화면에서 전체 레이아웃을 검토 가능하게 함.
 *
 * Phase 4 전환 예고:
 *   Phase 4 가 HeroSection + ProblemSection 을 만들면서 데모 콘텐츠가 실제
 *   랜딩 섹션으로 대체되고, App.test.tsx 도 그 시점에 한 번 더 재작성된다.
 */
export default function App() {
  return (
    <>
      <Header />
      <main>
        {/*
         * Phase 3 주의: 4개 Section 각각에 NAV_ANCHORS 의 ID 를 부여한다.
         * Phase 2 시점에는 features 하나만 있었지만, Phase 3 Header 가 4개
         * 네비 앵커를 렌더하므로 모두 유효한 타겟을 갖춰야 한다. App.test.tsx
         * 의 "NAV_ANCHORS 4개 ID 가 App DOM 에 존재" 가드가 이 매핑을 강제함.
         * Phase 4~8 에서 실제 섹션 컴포넌트로 교체될 때 id 는 유지되어야 함.
         */}
        <Section id="scenarios" background="canvas">
          <h1 className="text-4xl font-bold text-ink-900">Design System Demo</h1>
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
      </main>
      <Footer />
    </>
  );
}
