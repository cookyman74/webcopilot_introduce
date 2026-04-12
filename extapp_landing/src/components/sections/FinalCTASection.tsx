import { useTranslation } from 'react-i18next';
import { Section } from '../common/Section';
import { Button } from '../common/Button';
import { CHROME_WEB_STORE_URL, DOCS_URL } from '../../lib/constants';

/**
 * FinalCTASection — 최종 설치 유도 CTA (Phase 8).
 *
 * 핵심 제약:
 *   - 일반 사용자 설치 유도 전용 — mailto/파트너십/문의 문구 금지
 *   - background="accent-soft" → Phase 5 이후 소멸했던 accent-soft 복구
 *   - id 부여 없음 (NAV_ANCHORS 대상 아님)
 */
const HEADING_ID = 'finalcta-heading';

export function FinalCTASection() {
  const { t } = useTranslation();

  return (
    <Section background="accent-soft" aria-labelledby={HEADING_ID} data-testid="finalcta-section">
      <div className="mx-auto max-w-xl text-center">
        <h2 id={HEADING_ID} className="text-3xl font-bold text-ink-900 md:text-4xl">
          {t('finalCta.title')}
        </h2>
        <p className="mt-4 text-base text-ink-700">{t('finalCta.subtitle')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href={CHROME_WEB_STORE_URL} variant="primary">
            {t('finalCta.primary')}
          </Button>
          <Button href={DOCS_URL} variant="secondary">
            {t('finalCta.secondary')}
          </Button>
        </div>
      </div>
    </Section>
  );
}
