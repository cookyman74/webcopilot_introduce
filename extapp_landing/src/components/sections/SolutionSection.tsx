import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, MousePointerClick, Code2 } from 'lucide-react';
import { Section } from '../common/Section';

/**
 * SolutionSection — 해결 방식 3축 (Phase 5 §5.3 TASK-003).
 *
 * 구조:
 *   <Section background="canvas"
 *            aria-labelledby="solution-heading"
 *            data-testid="solution-section">
 *     <h2 id="solution-heading">{t('solution.title')}</h2>
 *     <div className="grid gap-8 md:grid-cols-3">
 *       {SOLUTION_AXES.map(...)}  // 3개 <article>
 *     </div>
 *   </Section>
 *
 * 각 카드:
 *   1. 페이지 문맥 기반 AI — BookOpen
 *   2. 브라우저 액션 자동화 — MousePointerClick
 *   3. 스크립트 기반 확장성 — Code2
 *
 * 설계 결정:
 *   - id 부여 없음 — NAV_ANCHORS 앵커 대상 아님
 *   - Phase 4 ProblemSection 의 PROBLEM_ITEMS.map() 패턴 계승
 *
 * 테스트: src/components/sections/SolutionSection.test.tsx (TEST-P5.1/P5.2/P5.9/P5.10)
 */
const SOLUTION_AXES: readonly { key: string; icon: ReactNode }[] = [
  { key: 'context', icon: <BookOpen size={28} /> },
  { key: 'action', icon: <MousePointerClick size={28} /> },
  { key: 'script', icon: <Code2 size={28} /> },
];

const HEADING_ID = 'solution-heading';

export function SolutionSection() {
  const { t } = useTranslation();

  return (
    <Section background="canvas" aria-labelledby={HEADING_ID} data-testid="solution-section">
      <h2 id={HEADING_ID} className="text-center text-3xl font-bold text-ink-900 md:text-4xl">
        {t('solution.title')}
      </h2>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {SOLUTION_AXES.map(({ key, icon }) => (
          <article
            key={key}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-8"
          >
            <div className="text-accent">{icon}</div>
            <h3 className="text-xl font-semibold text-ink-900">
              {t(`solution.axes.${key}.title`)}
            </h3>
            <p className="text-base text-ink-700">{t(`solution.axes.${key}.desc`)}</p>
            <p className="text-sm text-ink-500">
              {t('common.examplePrefix')} {t(`solution.axes.${key}.example`)}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}
