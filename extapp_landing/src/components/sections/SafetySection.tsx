import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, FileCheck2, History, Lock, Repeat } from 'lucide-react';
import { Section } from '../common/Section';

/**
 * SafetySection — 4개 안전·운영 원칙 (Phase 7 §7.3 TASK-003).
 *
 * 톤: 신뢰 형성용, 과장 금지.
 * "100%", "완전 자동", "absolute", "never fails" 등 과장 문구 테스트로 차단.
 * id 부여 없음 — NAV_ANCHORS 대상 아님.
 */
const SAFETY_ITEMS: readonly { key: string; icon: ReactNode }[] = [
  { key: 'approval', icon: <ShieldCheck size={28} /> },
  { key: 'register', icon: <FileCheck2 size={28} /> },
  { key: 'session', icon: <History size={28} /> },
  { key: 'sensitive', icon: <Lock size={28} /> },
  { key: 'loop', icon: <Repeat size={28} /> },
];

const HEADING_ID = 'safety-heading';

export function SafetySection() {
  const { t } = useTranslation();

  return (
    <Section background="surface" aria-labelledby={HEADING_ID} data-testid="safety-section">
      <h2 id={HEADING_ID} className="text-center text-3xl font-bold text-ink-900 md:text-4xl">
        {t('safety.title')}
      </h2>
      <p className="mt-4 text-center text-base text-ink-700">{t('safety.subtitle')}</p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {SAFETY_ITEMS.map(({ key, icon }) => (
          <article
            key={key}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-canvas p-6 md:p-8"
          >
            <div className="text-accent">{icon}</div>
            <h3 className="text-lg font-semibold text-ink-900">{t(`safety.items.${key}.title`)}</h3>
            <p className="text-sm text-ink-700">{t(`safety.items.${key}.desc`)}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
