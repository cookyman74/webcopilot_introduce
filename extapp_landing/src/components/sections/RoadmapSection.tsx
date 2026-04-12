import { useTranslation } from 'react-i18next';
import { Section } from '../common/Section';
import { FeatureCard } from '../common/FeatureCard';
import type { FeatureStatus } from '../../lib/types';

/**
 * RoadmapSection — 3개 확장 방향 (Phase 8).
 *
 * 핵심 제약: 모든 카드는 wip 또는 planned — done 절대 금지.
 * id="roadmap": NAV_ANCHORS 네 번째 앵커.
 */
const ROADMAP_ITEMS: readonly { key: string; status: FeatureStatus }[] = [
  { key: 'floating', status: 'planned' },
  { key: 'continuity', status: 'wip' },
  { key: 'studio', status: 'planned' },
];

const HEADING_ID = 'roadmap-heading';

export function RoadmapSection() {
  const { t } = useTranslation();

  return (
    <Section
      id="roadmap"
      background="canvas"
      aria-labelledby={HEADING_ID}
      data-testid="roadmap-section"
    >
      <h2 id={HEADING_ID} className="text-center text-3xl font-bold text-ink-900 md:text-4xl">
        {t('roadmap.title')}
      </h2>
      <p className="mt-4 text-center text-base text-ink-700">{t('roadmap.subtitle')}</p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {ROADMAP_ITEMS.map(({ key, status }) => (
          <FeatureCard
            key={key}
            title={t(`roadmap.items.${key}.title`)}
            description={t(`roadmap.items.${key}.desc`)}
            status={status}
            statusLabel={t(`features.status.${status}`)}
          />
        ))}
      </div>
    </Section>
  );
}
