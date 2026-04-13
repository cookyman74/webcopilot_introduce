import type { ReactNode } from 'react';
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
 * 각 카드에 서비스 프로바이더의 브랜드 컬러 기반 로고 아이콘 표시.
 */

/** 브랜드 컬러 기반 로고 아이콘 — 서비스별 이니셜 + 고유 배경색 */
function BrandIcon({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${bg} ${text}`}
    >
      {label}
    </div>
  );
}

type AIMode = { key: string; status: FeatureStatus; icon: ReactNode };

const CLOUD_MODES: readonly AIMode[] = [
  {
    key: 'openai',
    status: 'done',
    icon: <BrandIcon label="AI" bg="bg-emerald-600" text="text-white" />,
  },
  {
    key: 'gemini',
    status: 'done',
    icon: <BrandIcon label="G" bg="bg-blue-500" text="text-white" />,
  },
  {
    key: 'claude',
    status: 'done',
    icon: <BrandIcon label="C" bg="bg-amber-600" text="text-white" />,
  },
];

const LOCAL_MODES: readonly AIMode[] = [
  {
    key: 'lmstudio',
    status: 'done',
    icon: <BrandIcon label="LM" bg="bg-indigo-500" text="text-white" />,
  },
  {
    key: 'ollama',
    status: 'planned',
    icon: <BrandIcon label="🦙" bg="bg-ink-900" text="text-white" />,
  },
  {
    key: 'gpustack',
    status: 'planned',
    icon: <BrandIcon label="GP" bg="bg-green-600" text="text-white" />,
  },
];

const HEADING_ID = 'aimodes-heading';

export function AIModesSection() {
  const { t } = useTranslation();

  const statusLabel = (status: FeatureStatus) =>
    status === 'done' ? t('aiModes.status.supported') : t('aiModes.status.reviewing');

  const renderCard = ({ key, status, icon }: AIMode) => (
    <div
      key={key}
      data-testid="ai-mode-item"
      className="flex h-[150px] flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface p-5 text-center"
    >
      {icon}
      <span className="text-lg font-semibold text-ink-900">{t(`aiModes.items.${key}.name`)}</span>
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
