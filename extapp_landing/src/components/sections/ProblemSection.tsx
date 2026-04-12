import { useTranslation } from 'react-i18next';
import { Section } from '../common/Section';

/**
 * ProblemSection — "이런 경험 있으셨죠?" 4개 문제 정의 (Phase 4 §4.3 TASK-003).
 *
 * 구조:
 *   <Section background="surface"
 *            aria-labelledby="problem-heading"
 *            data-testid="problem-section">
 *     <h2 id="problem-heading">{t('problem.title')}</h2>
 *     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
 *       {['p1','p2','p3','p4'].map(...)}  // 4개 <article>
 *     </div>
 *   </Section>
 *
 * 반응형 그리드:
 *   - 모바일 (< md):  1컬럼 (세로 스택)
 *   - 태블릿 (md):    2×2
 *   - 데스크톱 (lg):  1×4
 *
 * 설계 결정:
 *   - 4개 카드를 `PROBLEM_ITEMS` 상수 배열로 정의 후 `.map()` 렌더 — Phase 3
 *     Header 의 `NAV_ANCHORS.map()` 패턴과 동일. phase04 §4.4.1 REFACTOR-STRUCTURE
 *     선반영.
 *   - `id` 부여 없음 — NAV_ANCHORS 앵커 대상 아님
 *   - `aria-labelledby="problem-heading"` + h2 `id="problem-heading"` 로 region
 *     landmark 접근성 확보 (ProblemSection.test.tsx 검증)
 *   - 각 카드는 `<article>` 로 semantic. 카드 내부 제목은 `<h3>`, 설명은 `<p>`.
 *
 * 테스트: src/components/sections/ProblemSection.test.tsx (TEST-P4.4 + P4.6)
 */
const PROBLEM_ITEMS = ['p1', 'p2', 'p3', 'p4'] as const;
const HEADING_ID = 'problem-heading';

export function ProblemSection() {
  const { t } = useTranslation();

  return (
    <Section background="surface" aria-labelledby={HEADING_ID} data-testid="problem-section">
      <h2 id={HEADING_ID} className="text-center text-3xl font-bold text-ink-900 md:text-4xl">
        {t('problem.title')}
      </h2>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PROBLEM_ITEMS.map((key) => (
          <article
            key={key}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-canvas p-6"
          >
            {/* 아이콘 placeholder — Phase 9 에서 실제 아이콘으로 교체 */}
            <div aria-hidden="true" className="h-10 w-10 rounded-lg bg-accent-soft" />
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
