import { useTranslation } from 'react-i18next';
import { Section } from '../common/Section';
import { Button } from '../common/Button';
import { CHROME_WEB_STORE_URL } from '../../lib/constants';

/**
 * HeroSection — 랜딩 최상단의 첫 화면 (Phase 4 §4.3 TASK-002).
 *
 * 구조:
 *   <Section background="canvas" data-testid="hero-section">
 *     <div md:grid-cols-2>
 *       좌: eyebrow → h1 → subtitle → [Primary CTA + Secondary CTA] → trust
 *       우: <img src="/images/placeholder.svg" />
 *     </div>
 *   </Section>
 *
 * 설계 결정:
 *   - `id` 부여 없음 — Hero 는 랜딩 최상단, NAV_ANCHORS 앵커 대상 아님
 *   - Primary CTA 는 Button 자동 external 감지에 의존 (href 가 https:// 이면
 *     target/rel 자동 부여). phase02 §14.2.4 의 Button 계약.
 *   - Secondary CTA 는 `href="#features"` 내부 앵커 — 외부 링크 속성 미부여가 정상
 *   - placeholder.svg 재사용 — Phase 2 자산. Phase 9 Lighthouse 최적화 시점에
 *     실제 hero mock 이미지로 교체 (phase04 §4.3 TASK-006)
 *   - `<img>` 에 width/height 지정으로 CLS(Cumulative Layout Shift) 예방
 *   - **모바일 소스 순서 = 카피 → 이미지** (phase04 §4.3 TASK-002 계약):
 *     DOM 순서를 "좌측 카피 div → 우측 이미지 div" 로 두고 grid 의 기본 flow
 *     (`grid-cols-1 → md:grid-cols-2`) 에 맡긴다. `order-*` 유틸을 쓰지 않음 —
 *     이전 구현은 `order-first md:order-none` 로 모바일에서 이미지가 카피
 *     **위** 에 오도록 잘못 배치되어 있었다 (리뷰 Medium 수정).
 *
 * 테스트: src/components/sections/HeroSection.test.tsx (TEST-P4.1~P4.3 + P4.6)
 */
export function HeroSection() {
  const { t } = useTranslation();

  return (
    <Section background="canvas" data-testid="hero-section">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        {/* 좌측 카피 */}
        <div className="flex flex-col gap-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            {t('hero.eyebrow')}
          </p>
          <h1 className="text-4xl font-bold leading-tight text-ink-900 md:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="text-lg text-ink-700">{t('hero.subtitle')}</p>
          <div className="flex flex-wrap gap-4">
            <Button href={CHROME_WEB_STORE_URL} variant="primary">
              {t('hero.cta_primary')}
            </Button>
            <Button href="#features" variant="secondary">
              {t('hero.cta_secondary')}
            </Button>
          </div>
          <p className="text-sm text-ink-500">{t('hero.trust')}</p>
        </div>

        {/* 우측 이미지 placeholder — 모바일: 카피 아래, 데스크톱: 우측 컬럼 */}
        <div>
          <img
            src="/images/placeholder.svg"
            alt={t('hero.imageAlt')}
            width={600}
            height={400}
            className="w-full rounded-lg border border-border bg-surface"
          />
        </div>
      </div>
    </Section>
  );
}
