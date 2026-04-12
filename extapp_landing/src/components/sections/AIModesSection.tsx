import { useTranslation } from 'react-i18next';
import { Section } from '../common/Section';
import { Badge } from '../common/Badge';
import type { FeatureStatus } from '../../lib/types';

/**
 * AIModesSection — 지원 AI 모드 (Phase 7).
 *
 * 두 카테고리로 구분:
 *   - 클라우드 서비스: OpenAI · Gemini · Claude (done)
 *   - 로컬 SLM: LM Studio (done) · Ollama (planned) · GpuStack (planned)
 *
 * 카드 크기 통일: 모든 카드가 동일한 min-height 를 가지도록
 * grid + stretch 로 높이를 맞춤.
 */
type AIMode = { key: string; status: FeatureStatus };

const CLOUD_MODES: readonly AIMode[] = [
  { key: 'openai', status: 'done' },
  { key: 'gemini', status: 'done' },
  { key: 'claude', status: 'done' },
];

const LOCAL_MODES: readonly AIMode[] = [
  { key: 'lmstudio', status: 'done' },
  { key: 'ollama', status: 'planned' },
  { key: 'gpustack', status: 'planned' },
];

const HEADING_ID = 'aimodes-heading';

export function AIModesSection() {
  const { t } = useTranslation();

  const statusLabel = (status: FeatureStatus) =>
    status === 'done' ? t('aiModes.status.supported') : t('aiModes.status.reviewing');

  const renderCard = ({ key, status }: AIMode) => (
    <div
      key={key}
      data-testid="ai-mode-item"
      className="flex h-[130px] flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface p-5 text-center"
    >
      <span className="text-lg font-semibold text-ink-900">{t(`aiModes.items.${key}.name`)}</span>
      <span className="text-xs text-ink-500">{t(`aiModes.items.${key}.type`)}</span>
      <Badge status={status}>{statusLabel(status)}</Badge>
    </div>
  );

  return (
    <Section background="canvas" aria-labelledby={HEADING_ID} data-testid="aimodes-section">
      <h2 id={HEADING_ID} className="text-center text-3xl font-bold text-ink-900 md:text-4xl">
        {t('aiModes.title')}
      </h2>
      <p className="mt-4 text-center text-base text-ink-700">{t('aiModes.subtitle')}</p>

      <div className="mx-auto mt-10 grid max-w-3xl gap-8 md:grid-cols-2">
        {/* 클라우드 서비스 */}
        <div>
          <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-ink-500">
            {t('aiModes.cloudLabel')}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{CLOUD_MODES.map(renderCard)}</div>
        </div>

        {/* 로컬 SLM */}
        <div>
          <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-ink-500">
            {t('aiModes.localLabel')}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{LOCAL_MODES.map(renderCard)}</div>
        </div>
      </div>
    </Section>
  );
}
