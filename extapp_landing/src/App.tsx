import { Section, Button, Badge, FeatureCard } from './components/common';

/**
 * Phase 2 데모 페이지 — 공통 컴포넌트 4종의 모든 변형을 한 화면에 노출.
 *
 * 목적:
 *   - 시각 회귀 확인 (개발자가 `npm run dev` 로 모든 변형을 한눈에 검토)
 *   - App.test.tsx 가 종합 회귀 가드로 작동하도록 요소 밀도 확보
 *
 * Phase 3 에서 이 데모 페이지는 실제 랜딩 레이아웃 (Header + 섹션들 + Footer)
 * 으로 대체된다.
 */
export default function App() {
  return (
    <main>
      <Section background="canvas">
        <h1 className="text-4xl font-bold text-ink-900">Design System Demo</h1>
        <p className="mt-4 text-ink-700">
          Phase 2 공통 컴포넌트 (Section · Button · Badge · FeatureCard) 시각 확인 페이지
        </p>
      </Section>

      <Section background="surface">
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
        </div>
      </Section>

      <Section background="surface-alt">
        <h2 className="text-2xl font-semibold text-ink-900">Status Badges</h2>
        <div className="mt-6 flex flex-wrap gap-4">
          <Badge status="done">구현됨</Badge>
          <Badge status="wip">보강 중</Badge>
          <Badge status="planned">계획·검토 중</Badge>
        </div>
      </Section>

      <Section background="accent-soft">
        <h2 className="text-2xl font-semibold text-ink-900">Feature Cards</h2>
        <p className="mt-2 text-sm text-ink-500">
          좌: 상태 배지 포함 (Features/Roadmap 용) · 우: 상태 배지 없음 (BusinessSection 용 — Phase
          8 프리뷰)
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
  );
}
