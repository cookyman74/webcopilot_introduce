import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessagesSquare,
  Languages,
  ShoppingCart,
  Wand2,
  PenLine,
  BookMarked,
  Play,
} from 'lucide-react';
import { Section } from '../common/Section';
import { VideoModal } from '../common/VideoModal';

/**
 * ScenariosSection — Phase 11 v2: 6 시나리오 (4 → 6).
 *
 * 시나리오:
 *   s1 커뮤니티 글쓰기  (videoId: E4r5CSlAjQA, 기존 영상 재활용)
 *   s2 영문 자료 분석   (videoId: ZQkDGoBaCbo, 기존 영상 재활용)
 *   s3 쇼핑 가격 비교 ★ Work Memory
 *   s4 사이트 UI/UX 직접 커스터마이즈 — examples 칩 3개 + prompt 박스 verbatim 노출
 *   s5 AI 글쓰기 동반자
 *   s6 리서치 워크플로우 ★ Work Memory
 *
 * s4 카드 특수 렌더:
 *   - 일반 카드와 동일 step/title/desc + targetSites
 *   - 추가: 예시 칩 3개 (테마/광고/메일발송) + 코드 블록 prompt 박스
 *   - 영상 버튼은 다른 카드와 일관성 유지를 위해 placeholder 노출
 *
 * 그리드: md:grid-cols-2 (6 = 3 row × 2 col)
 */
const SCENARIO_ITEMS: readonly { key: string; icon: ReactNode; videoId?: string }[] = [
  { key: 's1', icon: <MessagesSquare size={24} />, videoId: 'E4r5CSlAjQA' },
  { key: 's2', icon: <Languages size={24} />, videoId: 'ZQkDGoBaCbo' },
  { key: 's3', icon: <ShoppingCart size={24} /> },
  { key: 's4', icon: <Wand2 size={24} /> },
  { key: 's5', icon: <PenLine size={24} /> },
  { key: 's6', icon: <BookMarked size={24} /> },
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
        {SCENARIO_ITEMS.map(({ key, icon, videoId }) => {
          const isCustomCard = key === 's4';
          return (
            <article
              key={key}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 md:p-8"
              data-testid={`scenario-${key}`}
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

              {/* 주요 사이트 라벨 + targetSites */}
              <p className="text-xs text-ink-500">
                <span className="font-semibold text-ink-700">{t('scenarios.targetLabel')}: </span>
                {t(`scenarios.items.${key}.targetSites`)}
              </p>

              {/* s4 특수 영역 — examples 칩 3개 + prompt 박스 */}
              {isCustomCard && (
                <div className="mt-2 flex flex-col gap-3" data-testid="scenario-s4-customization">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {t('scenarios.items.s4.examplesIntro')}
                  </p>
                  <ul className="flex flex-col gap-1 text-sm text-ink-700">
                    <li>{t('scenarios.items.s4.exampleTheme')}</li>
                    <li>{t('scenarios.items.s4.exampleAdblock')}</li>
                    <li>{t('scenarios.items.s4.exampleMail')}</li>
                  </ul>
                  <div
                    className="rounded-lg border border-accent/40 bg-accent-soft/50 p-3"
                    data-testid="scenario-s4-prompt-box"
                  >
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent">
                      {t('scenarios.items.s4.promptLabel')}
                    </p>
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-ink-900">
                      <code>{t('scenarios.items.s4.promptBody')}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* 유튜브 영상 placeholder/썸네일 */}
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
          );
        })}
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
