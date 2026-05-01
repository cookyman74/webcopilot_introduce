import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Blocks, Languages, FileEdit, LayoutGrid, Play } from 'lucide-react';
import { Section } from '../common/Section';
import { VideoModal } from '../common/VideoModal';

/**
 * ScenariosSection — 4개 사용 시나리오 (Phase 6 §6.3 TASK-002).
 *
 * 구조:
 *   <Section id="scenarios" background="canvas"
 *            aria-labelledby="scenarios-heading"
 *            data-testid="scenarios-section">
 *     <h2 id="scenarios-heading">{t('scenarios.title')}</h2>
 *     <div className="grid gap-8 md:grid-cols-2">
 *       {SCENARIO_ITEMS.map(...)}  // 4개 <article>
 *     </div>
 *   </Section>
 *
 * 영상 모달:
 *   각 카드의 유튜브 영상 placeholder 클릭 → VideoModal 중앙 팝업.
 *   videoId 가 비어있으면 "영상 준비 중" placeholder 표시.
 *   실제 YouTube URL 확보 시 SCENARIO_ITEMS 의 videoId 를 채우면 자동 적용.
 *
 * 테스트: src/components/sections/ScenariosSection.test.tsx (TEST-P6.1~P6.3 + P6.8/P6.9/P6.11)
 */
const SCENARIO_ITEMS: readonly { key: string; icon: ReactNode; videoId?: string }[] = [
  { key: 's1', icon: <Blocks size={24} />, videoId: 'E4r5CSlAjQA' },
  { key: 's2', icon: <Languages size={24} />, videoId: 'ZQkDGoBaCbo' },
  { key: 's3', icon: <FileEdit size={24} /> },
  { key: 's4', icon: <LayoutGrid size={24} /> },
];

const HEADING_ID = 'scenarios-heading';

export function ScenariosSection() {
  const { t } = useTranslation();
  const [activeVideo, setActiveVideo] = useState<{
    videoId?: string;
    title: string;
  } | null>(null);

  return (
    <Section
      id="scenarios"
      background="canvas"
      aria-labelledby={HEADING_ID}
      data-testid="scenarios-section"
    >
      <h2 id={HEADING_ID} className="text-center text-3xl font-bold text-ink-900 md:text-4xl">
        {t('scenarios.title')}
      </h2>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {SCENARIO_ITEMS.map(({ key, icon, videoId }) => (
          <article
            key={key}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 md:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                {t(`scenarios.items.${key}.step`)}
              </span>
              <div className="text-accent">{icon}</div>
            </div>
            <h3 className="text-lg font-semibold text-ink-900">
              {t(`scenarios.items.${key}.title`)}
            </h3>
            <p className="text-sm text-ink-700">{t(`scenarios.items.${key}.desc`)}</p>
            {/* 유튜브 영상 — 클릭 시 모달 팝업으로 재생 */}
            <button
              type="button"
              onClick={() =>
                setActiveVideo({
                  videoId,
                  title: t(`scenarios.items.${key}.title`),
                })
              }
              className="group relative mt-2 flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-alt transition hover:border-accent"
            >
              {videoId ? (
                <>
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt={t(`scenarios.items.${key}.title`)}
                    className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-ink-900/60 text-white transition group-hover:bg-accent/90">
                    <Play size={28} fill="currentColor" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-ink-400 transition group-hover:text-accent">
                  <Play size={32} />
                  <span className="text-xs">{t('scenarios.videoPlaceholder')}</span>
                </div>
              )}
            </button>
          </article>
        ))}
      </div>

      <VideoModal
        isOpen={activeVideo !== null}
        onClose={() => setActiveVideo(null)}
        videoId={activeVideo?.videoId}
        title={activeVideo?.title}
      />
    </Section>
  );
}
