import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Section } from '../common/Section';

/**
 * DifferentiationSection — 3개 차별화 비교 카드 (Phase 6 §6.3 TASK-003).
 *
 * 구조:
 *   <Section id="differentiation" background="surface-alt"
 *            aria-labelledby="diff-heading"
 *            data-testid="differentiation-section">
 *     <h2 id="diff-heading">{t('differentiation.title')}</h2>
 *     <div className="grid gap-8 md:grid-cols-3">
 *       {DIFF_ITEMS.map(...)}  // 3개 <article>
 *     </div>
 *   </Section>
 *
 * 각 카드 내부:
 *   before(회색 톤) → ArrowRight 아이콘 → after(액센트 톤) → 설명
 *
 * 설계 결정:
 *   - id="differentiation": NAV_ANCHORS 세 번째 앵커 대상
 *   - background="surface-alt": 구현 계획서 §5.6 스펙
 *   - 데모 `<Section id="differentiation">` (Buttons) 를 완전 대체
 *
 * 테스트: src/components/sections/DifferentiationSection.test.tsx (TEST-P6.4~P6.6 + P6.8/P6.9/P6.12)
 */
const DIFF_ITEMS = ['d1', 'd2', 'd3'] as const;
const HEADING_ID = 'diff-heading';

export function DifferentiationSection() {
  const { t } = useTranslation();

  return (
    <Section
      id="differentiation"
      background="surface-alt"
      aria-labelledby={HEADING_ID}
      data-testid="differentiation-section"
    >
      <h2 id={HEADING_ID} className="text-center text-3xl font-bold text-ink-900 md:text-4xl">
        {t('differentiation.title')}
      </h2>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {DIFF_ITEMS.map((key) => (
          <article
            key={key}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-canvas p-6 md:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-surface px-3 py-1 text-sm font-medium text-ink-500">
                {t(`differentiation.items.${key}.before`)}
              </span>
              <ArrowRight size={16} className="shrink-0 text-ink-400" />
              <span className="rounded-lg bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
                {t(`differentiation.items.${key}.after`)}
              </span>
            </div>
            <p className="text-sm text-ink-700">{t(`differentiation.items.${key}.desc`)}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
