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
 * 각 카드에 서비스 프로바이더의 공식 로고 이미지 표시.
 */
type AIMode = { key: string; status: FeatureStatus; logo: string };

const CLOUD_MODES: readonly AIMode[] = [
  { key: 'openai', status: 'done', logo: '/images/providers/openai.png' },
  { key: 'gemini', status: 'done', logo: '/images/providers/gemini.png' },
  { key: 'claude', status: 'done', logo: '/images/providers/claude.png' },
];

const LOCAL_MODES: readonly AIMode[] = [
  { key: 'lmstudio', status: 'done', logo: '/images/providers/lmstudio.png' },
  { key: 'ollama', status: 'planned', logo: '/images/providers/ollama.png' },
  { key: 'gpustack', status: 'planned', logo: '/images/providers/gpustack.png' },
];

const HEADING_ID = 'aimodes-heading';

export function AIModesSection() {
  const { t } = useTranslation();

  const statusLabel = (status: FeatureStatus) =>
    status === 'done' ? t('aiModes.status.supported') : t('aiModes.status.reviewing');

  const renderCard = ({ key, status, logo }: AIMode) => (
    <div
      key={key}
      data-testid="ai-mode-item"
      className="flex h-[160px] flex-col items-center rounded-xl border border-border bg-surface p-5 text-center"
    >
      {/* 아이콘 — 고정 위치 (상단) */}
      <div className="flex h-12 items-center justify-center">
        <img
          src={logo}
          alt={t(`aiModes.items.${key}.name`)}
          width={40}
          height={40}
          className="h-10 w-10 rounded-lg object-contain"
        />
      </div>
      {/* 이름 — 고정 위치 (중단), 한 줄 강제 */}
      <span className="mt-2 whitespace-nowrap text-base font-semibold text-ink-900">
        {t(`aiModes.items.${key}.name`)}
      </span>
      {/* 배지 — 고정 위치 (하단) */}
      <div className="mt-auto pt-2">
        <Badge status={status}>{statusLabel(status)}</Badge>
      </div>
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
