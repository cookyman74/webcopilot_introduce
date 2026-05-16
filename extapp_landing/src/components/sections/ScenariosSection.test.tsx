/**
 * Phase 11 v2 — ScenariosSection 6 시나리오 + s4 prompt 박스.
 *
 * 변경:
 *   - 4 → 6 시나리오 (s1~s6)
 *   - 그룹웨어 시나리오 삭제, 시나리오 의미 전면 재정의
 *   - s4: examples 칩 3개 + prompt 박스 verbatim (cookyman@gmail.com 포함)
 *   - targetSites 필드 추가 (모든 카드)
 *
 * 보존:
 *   - id="scenarios" + data-testid="scenarios-section"
 *   - md:grid-cols-2 (6 = 3×2)
 *   - 영상 모달 상호작용
 *   - s1, s2 기존 영상 id 유지 (E4r5CSlAjQA, ZQkDGoBaCbo)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScenariosSection } from './ScenariosSection';
import i18n from '../../i18n';

const SCENARIO_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

describe('ScenariosSection (Phase 11 v2)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  describe('카드 수 + 정체성', () => {
    it('정확히 6개의 <article> 을 렌더한다', () => {
      const { container } = render(<ScenariosSection />);
      expect(container.querySelectorAll('article').length).toBe(6);
    });

    it('s1~s6 6개 시나리오 제목이 각각 정확히 1회씩 렌더된다', () => {
      render(<ScenariosSection />);
      for (const key of SCENARIO_KEYS) {
        const title = i18n.t(`scenarios.items.${key}.title`);
        expect(screen.getAllByText(title).length).toBe(1);
      }
    });

    it('각 카드에 data-testid="scenario-{key}" 가 부여된다', () => {
      const { container } = render(<ScenariosSection />);
      for (const key of SCENARIO_KEYS) {
        expect(container.querySelector(`[data-testid="scenario-${key}"]`)).not.toBeNull();
      }
    });
  });

  describe('카드 내부 구조 (step + h3 + desc + targetSites)', () => {
    it('6개 카드 각각에 step 라벨이 i18n 값으로 존재한다', () => {
      const { container } = render(<ScenariosSection />);
      for (const key of SCENARIO_KEYS) {
        const card = container.querySelector(`[data-testid="scenario-${key}"]`);
        expect(card?.textContent).toContain(i18n.t(`scenarios.items.${key}.step`));
      }
    });

    it('6개 카드 각각에 <h3> heading 이 존재하고 비어있지 않다', () => {
      const { container } = render(<ScenariosSection />);
      const articles = Array.from(container.querySelectorAll('article'));
      for (const article of articles) {
        const heading = article.querySelector('h3, h4, h5');
        expect(heading?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });

    it('6개 카드 각각에 targetSites 텍스트가 노출된다', () => {
      const { container } = render(<ScenariosSection />);
      for (const key of SCENARIO_KEYS) {
        const card = container.querySelector(`[data-testid="scenario-${key}"]`);
        const expected = i18n.t(`scenarios.items.${key}.targetSites`);
        expect(card?.textContent).toContain(expected);
      }
    });

    it('각 카드에 targetLabel 라벨 ("주요 사이트") 이 노출된다', () => {
      const { container } = render(<ScenariosSection />);
      const targetLabel = i18n.t('scenarios.targetLabel');
      for (const key of SCENARIO_KEYS) {
        const card = container.querySelector(`[data-testid="scenario-${key}"]`);
        expect(card?.textContent).toContain(targetLabel);
      }
    });
  });

  describe('★ s4 사이트 UI/UX 커스터마이즈 — 예시 칩 + prompt 박스', () => {
    it('s4 카드 안에 customization 영역이 존재한다 (data-testid="scenario-s4-customization")', () => {
      const { container } = render(<ScenariosSection />);
      const node = container.querySelector('[data-testid="scenario-s4-customization"]');
      expect(node).not.toBeNull();
    });

    it('s4 customization 영역에 예시 칩 3개 (테마 / 광고 / 메일발송) 가 모두 노출된다', () => {
      const { container } = render(<ScenariosSection />);
      const node = container.querySelector('[data-testid="scenario-s4-customization"]');
      const text = node?.textContent ?? '';
      expect(text).toContain(i18n.t('scenarios.items.s4.exampleTheme'));
      expect(text).toContain(i18n.t('scenarios.items.s4.exampleAdblock'));
      expect(text).toContain(i18n.t('scenarios.items.s4.exampleMail'));
    });

    it('s4 prompt 박스가 존재하고 i18n promptBody verbatim 을 노출한다', () => {
      const { container } = render(<ScenariosSection />);
      const promptBox = container.querySelector('[data-testid="scenario-s4-prompt-box"]');
      expect(promptBox).not.toBeNull();
      expect(promptBox?.textContent).toContain(i18n.t('scenarios.items.s4.promptBody'));
    });

    it('s4 prompt 박스에 메일 주소 "cookyman@gmail.com" 이 verbatim 노출된다 (사용자 제시 데모 prompt)', () => {
      const { container } = render(<ScenariosSection />);
      const promptBox = container.querySelector('[data-testid="scenario-s4-prompt-box"]');
      expect(promptBox?.textContent).toContain('cookyman@gmail.com');
    });

    it('s4 prompt 박스가 monospace 코드 블록 (<pre><code>) 으로 렌더된다', () => {
      const { container } = render(<ScenariosSection />);
      const promptBox = container.querySelector('[data-testid="scenario-s4-prompt-box"]');
      const pre = promptBox?.querySelector('pre');
      const code = pre?.querySelector('code');
      expect(pre, 'pre 태그 누락').not.toBeNull();
      expect(code, 'code 태그 누락').not.toBeNull();
    });

    it('s4 prompt 박스에 mailto: 링크가 생성되지 않는다 (단순 텍스트만)', () => {
      // 보안/SEO 목적: 메일 주소가 mailto 링크가 아닌 raw text 로만 노출되어야 함.
      const { container } = render(<ScenariosSection />);
      const promptBox = container.querySelector('[data-testid="scenario-s4-prompt-box"]');
      const mailLinks = promptBox?.querySelectorAll('a[href^="mailto:"]') ?? [];
      expect(mailLinks.length).toBe(0);
    });
  });

  describe('영상 모달 상호작용', () => {
    it('6개 카드 각각에 영상 버튼이 존재한다', () => {
      const { container } = render(<ScenariosSection />);
      const articles = container.querySelectorAll('article');
      for (const article of articles) {
        expect(article.querySelector('button')).not.toBeNull();
      }
    });

    it('videoId 가 없는 카드 4개 (s3, s4, s5, s6) 에 placeholder 텍스트가 노출된다', () => {
      render(<ScenariosSection />);
      const placeholders = screen.getAllByText('영상 준비 중');
      expect(placeholders.length).toBe(4);
    });

    it('영상 placeholder 버튼 클릭 시 모달(dialog) 이 DOM 에 나타난다', async () => {
      const user = userEvent.setup();
      render(<ScenariosSection />);
      expect(screen.queryByRole('dialog')).toBeNull();
      const buttons = screen.getAllByText('영상 준비 중');
      await user.click(buttons[0]);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('모달 열린 후 ESC 키로 닫을 수 있다', async () => {
      const user = userEvent.setup();
      render(<ScenariosSection />);
      const buttons = screen.getAllByText('영상 준비 중');
      await user.click(buttons[0]);
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('구조 계약', () => {
    it('섹션 최상위에 <h2> 제목이 정확히 1개 렌더된다', () => {
      const { container } = render(<ScenariosSection />);
      expect(container.querySelectorAll('h2').length).toBe(1);
    });

    it('id="scenarios" 가 <section> 태그에 부여된다', () => {
      const { container } = render(<ScenariosSection />);
      expect(container.querySelector('section#scenarios')).not.toBeNull();
    });

    it('루트 <section> 이 data-testid="scenarios-section" 을 갖는다', () => {
      const { container } = render(<ScenariosSection />);
      const section = container.querySelector('section');
      expect(section?.getAttribute('data-testid')).toBe('scenarios-section');
    });

    it('h1 은 전혀 존재하지 않는다 (HeroSection 전용)', () => {
      const { container } = render(<ScenariosSection />);
      expect(container.querySelectorAll('h1').length).toBe(0);
    });

    it('반응형 grid 클래스 (md:grid-cols-2) 가 DOM 에 존재한다', () => {
      const { container } = render(<ScenariosSection />);
      const hasGrid = Array.from(container.querySelectorAll('*')).some(
        (el) => typeof el.className === 'string' && /\bmd:grid-cols-2\b/.test(el.className)
      );
      expect(hasGrid).toBe(true);
    });
  });

  describe('언어 전환 회귀', () => {
    it('ko → en 전환 시 h2 제목이 달라진다', async () => {
      const { rerender } = render(<ScenariosSection />);
      const koH2 = screen.getByRole('heading', { level: 2 }).textContent;
      await i18n.changeLanguage('en');
      rerender(<ScenariosSection />);
      const enH2 = screen.getByRole('heading', { level: 2 }).textContent;
      expect(enH2).not.toBe(koH2);
    });

    it('ko → en 전환 시 6개 시나리오 제목이 모두 달라진다', async () => {
      const { container, rerender } = render(<ScenariosSection />);
      const koTitles = Array.from(container.querySelectorAll('article h3')).map(
        (el) => el.textContent?.trim() ?? ''
      );
      await i18n.changeLanguage('en');
      rerender(<ScenariosSection />);
      const enTitles = Array.from(container.querySelectorAll('article h3')).map(
        (el) => el.textContent?.trim() ?? ''
      );
      expect(koTitles.length).toBe(6);
      for (let i = 0; i < 6; i++) {
        expect(enTitles[i]).not.toBe(koTitles[i]);
      }
    });
  });
});
