import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  FileText,
  TextCursor,
  Edit3,
  Zap,
  Image,
  Wand2,
  Terminal,
  Sparkles,
} from 'lucide-react';
import { Section } from '../common/Section';
import { FeatureCard } from '../common/FeatureCard';
import type { FeatureStatus } from '../../lib/types';

/**
 * FeaturesSection — 9개 주요 기능 카드 (Phase 5 §5.3 TASK-004).
 *
 * 구조:
 *   <Section id="features" background="surface" data-testid="features-section">
 *     <h2>{t('features.title')}</h2>
 *     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 *       {FEATURE_ITEMS.map(...)}  // 9개 FeatureCard
 *     </div>
 *   </Section>
 *
 * 설계 결정:
 *   - id="features": Hero Secondary CTA `href="#features"` 앵커 대상 +
 *     NAV_ANCHORS 첫 번째 ID. 데모 `<Section id="features">` 를 완전 대체.
 *   - statusLabel 은 i18n `features.status.{done|wip|planned}` 키를 사용.
 *     Phase 4 이전의 하드코딩 "구현됨" 패턴에서 i18n 기반으로 전환.
 *   - FeatureCard 의 discriminated union (WithStatus) 를 활용해 모든 카드에
 *     status + statusLabel 을 부여.
 *
 * 테스트: src/components/sections/FeaturesSection.test.tsx (TEST-P5.3~P5.7/P5.9/P5.11/P5.13)
 */
const FEATURE_ITEMS: readonly { key: string; status: FeatureStatus; icon: ReactNode }[] = [
  { key: 'chat', status: 'done', icon: <MessageSquare size={24} /> },
  { key: 'helper', status: 'done', icon: <FileText size={24} /> },
  { key: 'select', status: 'done', icon: <TextCursor size={24} /> },
  { key: 'autofill', status: 'done', icon: <Edit3 size={24} /> },
  { key: 'action', status: 'done', icon: <Zap size={24} /> },
  { key: 'image', status: 'done', icon: <Image size={24} /> },
  { key: 'improve', status: 'done', icon: <Wand2 size={24} /> },
  { key: 'script', status: 'wip', icon: <Terminal size={24} /> },
  { key: 'floating', status: 'planned', icon: <Sparkles size={24} /> },
];

const HEADING_ID = 'features-heading';

export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <Section
      id="features"
      background="surface"
      aria-labelledby={HEADING_ID}
      data-testid="features-section"
    >
      <h2 id={HEADING_ID} className="text-center text-3xl font-bold text-ink-900 md:text-4xl">
        {t('features.title')}
      </h2>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURE_ITEMS.map(({ key, status, icon }) => (
          <FeatureCard
            key={key}
            icon={icon}
            title={t(`features.items.${key}.title`)}
            description={t(`features.items.${key}.desc`)}
            example={t(`features.items.${key}.example`)}
            status={status}
            statusLabel={t(`features.status.${status}`)}
          />
        ))}
      </div>
    </Section>
  );
}
