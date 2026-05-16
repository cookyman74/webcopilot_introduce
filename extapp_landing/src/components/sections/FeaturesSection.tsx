import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  FileText,
  Columns,
  Search,
  Image,
  Edit3,
  SlidersHorizontal,
  Wand2,
  TextCursor,
  Bot,
  Zap,
  Terminal,
  ListChecks,
  FolderTree,
  Database,
  Sparkles,
} from 'lucide-react';
import { Section } from '../common/Section';
import { FeatureCard } from '../common/FeatureCard';
import type { FeatureStatus } from '../../lib/types';

/**
 * FeaturesSection — Phase 11 v2: 5 카테고리 × 16 카드 (카테고리 그루핑 도입).
 *
 * 카테고리:
 *   absorb (5) — 정보 흡수·분석
 *   write  (4) — 작성·편집
 *   automate (5) — 사이트 자동화
 *   memory (1) — 작업 맥락 메모리
 *   interface (1) — 인터페이스
 *
 * 구조:
 *   <Section id="features" data-testid="features-section">
 *     <h2>{t('features.title')}</h2>
 *     {CATEGORIES.map(category => (
 *       <section aria-labelledby={`features-category-${category.key}`}>
 *         <h3 id={...}>{t(`features.categories.${category.key}`)}</h3>
 *         <div className="grid ...">
 *           {category.items.map(item => <FeatureCard ... />)}
 *         </div>
 *       </section>
 *     ))}
 *   </Section>
 *
 * 설계 결정:
 *   - id="features": Hero Secondary CTA `href="#features"` 앵커 + NAV_ANCHORS 첫 번째.
 *   - 카테고리 헤더는 h3 — semantic order: section h2 → category h3 → card h3.
 *     FeatureCard 내부 h3 와 같은 level 이지만 카드 그루핑 가독성 우선 (BusinessSection 동일 패턴).
 *   - 모든 카드 status='done' — Phase 11 시점 features overview 의 모든 항목이 구현 완료.
 *
 * 테스트: src/components/sections/FeaturesSection.test.tsx
 */
type FeatureItem = { key: string; status: FeatureStatus; icon: ReactNode };
type Category = { key: string; items: readonly FeatureItem[] };

const CATEGORIES: readonly Category[] = [
  {
    key: 'absorb',
    items: [
      { key: 'chat', status: 'done', icon: <MessageSquare size={24} /> },
      { key: 'helper', status: 'done', icon: <FileText size={24} /> },
      { key: 'multiTab', status: 'done', icon: <Columns size={24} /> },
      { key: 'webSearch', status: 'done', icon: <Search size={24} /> },
      { key: 'image', status: 'done', icon: <Image size={24} /> },
    ],
  },
  {
    key: 'write',
    items: [
      { key: 'autofill', status: 'done', icon: <Edit3 size={24} /> },
      { key: 'tone', status: 'done', icon: <SlidersHorizontal size={24} /> },
      { key: 'improve', status: 'done', icon: <Wand2 size={24} /> },
      { key: 'select', status: 'done', icon: <TextCursor size={24} /> },
    ],
  },
  {
    key: 'automate',
    items: [
      { key: 'doCommand', status: 'done', icon: <Bot size={24} /> },
      { key: 'action', status: 'done', icon: <Zap size={24} /> },
      { key: 'script', status: 'done', icon: <Terminal size={24} /> },
      { key: 'scriptCRUD', status: 'done', icon: <ListChecks size={24} /> },
      { key: 'tabGroup', status: 'done', icon: <FolderTree size={24} /> },
    ],
  },
  {
    key: 'memory',
    items: [{ key: 'workMemory', status: 'done', icon: <Database size={24} /> }],
  },
  {
    key: 'interface',
    items: [{ key: 'floating', status: 'done', icon: <Sparkles size={24} /> }],
  },
];

const HEADING_ID = 'features-heading';

export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <Section
      id="features"
      background="surface"
      aria-labelledby={HEADING_ID}
      data-testid="features-section"
    >
      <h2 id={HEADING_ID} className="text-center text-3xl font-bold text-ink-900 md:text-4xl">
        {t('features.title')}
      </h2>

      <div className="mt-12 flex flex-col gap-12">
        {CATEGORIES.map((category) => {
          const categoryHeadingId = `features-category-${category.key}`;
          return (
            <div
              key={category.key}
              role="group"
              aria-labelledby={categoryHeadingId}
              data-testid={`features-category-${category.key}`}
            >
              <h3
                id={categoryHeadingId}
                className="mb-6 text-xl font-semibold uppercase tracking-wide text-accent"
              >
                {t(`features.categories.${category.key}`)}
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {category.items.map(({ key, status, icon }) => (
                  <FeatureCard
                    key={key}
                    icon={icon}
                    title={t(`features.items.${key}.title`)}
                    description={t(`features.items.${key}.desc`)}
                    example={t(`features.items.${key}.example`)}
                    status={status}
                    statusLabel={t(`features.status.${status}`)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
