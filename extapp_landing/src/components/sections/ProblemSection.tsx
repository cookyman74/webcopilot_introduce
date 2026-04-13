import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Puzzle, Layers, MousePointerClick } from 'lucide-react';
import { Section } from '../common/Section';

/**
 * ProblemSection — "이런 경험 있으셨죠?" 4개 문제 정의.
 *
 * 각 카드에 lucide 아이콘으로 문제 유형을 시각화:
 *   p1: ShieldAlert — 확장앱 보안/신뢰 문제
 *   p2: Puzzle — 사이트별 맞춤 기능 부재
 *   p3: Layers — 탭/북마크 정리 어려움
 *   p4: MousePointerClick — AI 답변 vs 실행 격차
 */
const PROBLEM_ITEMS: readonly { key: string; icon: ReactNode }[] = [
  { key: 'p1', icon: <ShieldAlert size={28} /> },
  { key: 'p2', icon: <Puzzle size={28} /> },
  { key: 'p3', icon: <Layers size={28} /> },
  { key: 'p4', icon: <MousePointerClick size={28} /> },
];

const HEADING_ID = 'problem-heading';

export function ProblemSection() {
  const { t } = useTranslation();

  return (
    <Section background="surface" aria-labelledby={HEADING_ID} data-testid="problem-section">
      <h2 id={HEADING_ID} className="text-center text-3xl font-bold text-ink-900 md:text-4xl">
        {t('problem.title')}
      </h2>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PROBLEM_ITEMS.map(({ key, icon }) => (
          <article
            key={key}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-canvas p-6"
          >
            <div className="text-accent">{icon}</div>
            <h3 className="text-lg font-semibold text-ink-900">
              {t(`problem.items.${key}.title`)}
            </h3>
            <p className="text-sm text-ink-700">{t(`problem.items.${key}.desc`)}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
