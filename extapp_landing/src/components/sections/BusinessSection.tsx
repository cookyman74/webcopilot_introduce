import { useTranslation } from 'react-i18next';
import { Section } from '../common/Section';
import { FeatureCard } from '../common/FeatureCard';
import { Button } from '../common/Button';
import { PARTNERSHIP_CONTACT, DOCS_URL } from '../../lib/constants';

/**
 * BusinessSection — B2B 기술 파트너십 제안 (Phase 8 v2 신규).
 *
 * 핵심 제약:
 *   - Badge 사용 절대 금지 (FeatureCard WithoutStatus 로만 사용)
 *   - "구현됨"/"보강 중"/"계획" 텍스트 금지
 *   - Primary CTA = mailto:PARTNERSHIP_CONTACT
 *   - Header 네비에 #business 미포함 (의도된 배제)
 */
const BUSINESS_CARDS = ['context', 'actionTools', 'scripts'] as const;
const HEADING_ID = 'business-heading';

export function BusinessSection() {
  const { t } = useTranslation();

  return (
    <Section
      id="business"
      background="surface-alt"
      aria-labelledby={HEADING_ID}
      data-testid="business-section"
    >
      <p className="text-center text-sm font-semibold uppercase tracking-widest text-accent">
        {t('business.eyebrow')}
      </p>
      <h2 id={HEADING_ID} className="mt-3 text-center text-3xl font-bold text-ink-900 md:text-4xl">
        {t('business.title')}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-base text-ink-700">
        {t('business.subtitle')}
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {BUSINESS_CARDS.map((key) => (
          <FeatureCard
            key={key}
            title={t(`business.cards.${key}.title`)}
            description={t(`business.cards.${key}.desc`)}
          />
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Button href={`mailto:${PARTNERSHIP_CONTACT}`} variant="primary">
          {t('business.cta_primary')}
        </Button>
        <Button href={DOCS_URL} variant="secondary">
          {t('business.cta_secondary')}
        </Button>
      </div>
    </Section>
  );
}
