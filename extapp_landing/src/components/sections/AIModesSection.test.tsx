/**
 * Phase 7 — AIModesSection 컴포넌트
 * 대응 체크: TEST-P7.1~P7.4 · TEST-P7.8~P7.10 · TEST-P7.12
 *
 * AIModesSection 책임:
 *   1. 두 카테고리 (클라우드 서비스 / 로컬 SLM) 로 6개 AI 모드 표시
 *   2. 각 항목에 모드명 + type 라벨 + 상태 배지 (done=지원됨 / planned=검토 중)
 *   3. 클라우드: OpenAI(done) · Gemini(done) · Claude(done)
 *      로컬: LM Studio(done) · Ollama(planned) · GpuStack(planned)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIModesSection } from './AIModesSection';
import i18n from '../../i18n';

describe('AIModesSection (TEST-P7.1~P7.4 + P7.8~P7.10 + P7.12)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P7.1 — 6개 모드 항목
  // ─────────────────────────────────────────────────────────
  describe('TEST-P7.1 — 6개 AI 모드 항목', () => {
    it('정확히 6개의 모드 항목을 렌더한다', () => {
      const { container } = render(<AIModesSection />);
      const items = container.querySelectorAll('[data-testid="ai-mode-item"]');
      expect(items.length).toBe(6);
    });

    it('각 항목에 모드명이 비어있지 않다', () => {
      const { container } = render(<AIModesSection />);
      const items = Array.from(container.querySelectorAll('[data-testid="ai-mode-item"]'));
      for (const item of items) {
        expect(item.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // 카테고리 구분
  // ─────────────────────────────────────────────────────────
  describe('카테고리 구분 (클라우드 / 로컬)', () => {
    it('클라우드 서비스 카테고리 라벨이 렌더된다', () => {
      render(<AIModesSection />);
      expect(screen.getByText(i18n.t('aiModes.cloudLabel'))).toBeInTheDocument();
    });

    it('로컬 SLM 카테고리 라벨이 렌더된다', () => {
      render(<AIModesSection />);
      expect(screen.getByText(i18n.t('aiModes.localLabel'))).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P7.2~P7.4 — 상태 배지 매핑
  // ─────────────────────────────────────────────────────────
  describe('TEST-P7.2~P7.4 — 상태 배지', () => {
    it('done(지원됨) 배지가 정확히 4개 존재한다 (OpenAI+Gemini+Claude+LMStudio)', () => {
      render(<AIModesSection />);
      const supportedText = i18n.t('aiModes.status.supported');
      expect(screen.getAllByText(supportedText).length).toBe(4);
    });

    it('planned(검토 중) 배지가 정확히 2개 존재한다 (Ollama+GpuStack)', () => {
      render(<AIModesSection />);
      const reviewingText = i18n.t('aiModes.status.reviewing');
      expect(screen.getAllByText(reviewingText).length).toBe(2);
    });

    it('Ollama 항목이 구체적으로 planned(검토 중) 배지를 가진다', () => {
      render(<AIModesSection />);
      const ollamaName = i18n.t('aiModes.items.ollama.name');
      const ollamaElement = screen.getByText(ollamaName);
      const container = ollamaElement.closest('[data-testid="ai-mode-item"]');
      expect(container).not.toBeNull();
      const badge = container?.querySelector('[data-testid="status-badge"]');
      expect(badge?.textContent?.trim()).toBe(i18n.t('aiModes.status.reviewing'));
    });

    it('GpuStack 항목이 구체적으로 planned(검토 중) 배지를 가진다', () => {
      render(<AIModesSection />);
      const gpuName = i18n.t('aiModes.items.gpustack.name');
      const gpuElement = screen.getByText(gpuName);
      const container = gpuElement.closest('[data-testid="ai-mode-item"]');
      expect(container).not.toBeNull();
      const badge = container?.querySelector('[data-testid="status-badge"]');
      expect(badge?.textContent?.trim()).toBe(i18n.t('aiModes.status.reviewing'));
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P7.12 — 모드 정체성
  // ─────────────────────────────────────────────────────────
  describe('TEST-P7.12 — 모드 정체성 + 카테고리 소속 고정', () => {
    it('6개 모드명이 각각 정확히 1회씩 렌더된다', () => {
      render(<AIModesSection />);
      const keys = ['openai', 'gemini', 'claude', 'lmstudio', 'ollama', 'gpustack'];
      for (const key of keys) {
        const name = i18n.t(`aiModes.items.${key}.name`);
        expect(screen.getAllByText(name).length).toBe(1);
      }
    });

    it('각 모드의 type 라벨이 i18n 값과 정확히 일치한다', () => {
      // 리뷰 피드백 반영 (Medium): 이전 버전은 type 라벨을 검증하지 않아
      // OpenAI 를 "로컬" 로 잘못 표기해도 통과했다. 각 카드의 모드명을 찾고
      // 같은 ai-mode-item 내부에 올바른 type 이 있는지 직접 검증.
      render(<AIModesSection />);
      const expected: Record<string, string> = {
        openai: i18n.t('aiModes.items.openai.type'),
        gemini: i18n.t('aiModes.items.gemini.type'),
        claude: i18n.t('aiModes.items.claude.type'),
        lmstudio: i18n.t('aiModes.items.lmstudio.type'),
        ollama: i18n.t('aiModes.items.ollama.type'),
        gpustack: i18n.t('aiModes.items.gpustack.type'),
      };
      for (const [key, expectedType] of Object.entries(expected)) {
        const name = i18n.t(`aiModes.items.${key}.name`);
        const nameEl = screen.getByText(name);
        const card = nameEl.closest('[data-testid="ai-mode-item"]');
        expect(card, `${key} 의 ai-mode-item 을 찾지 못함`).not.toBeNull();
        expect(card?.textContent).toContain(expectedType);
      }
    });

    it('Didim 은 존재하지 않는다 (제거됨)', () => {
      render(<AIModesSection />);
      expect(screen.queryByText('Didim')).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────
  // 구조 계약
  // ─────────────────────────────────────────────────────────
  describe('구조 계약', () => {
    it('h2 제목이 정확히 1개 렌더된다', () => {
      const { container } = render(<AIModesSection />);
      expect(container.querySelectorAll('h2').length).toBe(1);
    });

    it('h1 은 존재하지 않는다', () => {
      const { container } = render(<AIModesSection />);
      expect(container.querySelectorAll('h1').length).toBe(0);
    });

    it('id 속성을 부여하지 않는다', () => {
      const { container } = render(<AIModesSection />);
      expect(container.querySelector('section')?.getAttribute('id')).toBeNull();
    });

    it('data-testid="aimodes-section" 을 갖는다', () => {
      const { container } = render(<AIModesSection />);
      expect(container.querySelector('section')?.getAttribute('data-testid')).toBe(
        'aimodes-section'
      );
    });

    it('aria-labelledby 가 실제 h2 id 를 가리킨다', () => {
      const { container } = render(<AIModesSection />);
      const section = container.querySelector('section');
      const labelledBy = section?.getAttribute('aria-labelledby');
      if (labelledBy) {
        const target = container.querySelector(`#${labelledBy}`);
        expect(target).not.toBeNull();
        expect(target?.tagName).toBe('H2');
      } else {
        expect(section?.hasAttribute('aria-label')).toBe(true);
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P7.9 — 언어 전환
  // ─────────────────────────────────────────────────────────
  describe('TEST-P7.9 — 언어 전환', () => {
    it('ko → en 전환 시 h2 제목이 달라진다', async () => {
      const { rerender } = render(<AIModesSection />);
      const koH2 = screen.getByRole('heading', { level: 2 }).textContent;
      await i18n.changeLanguage('en');
      rerender(<AIModesSection />);
      expect(screen.getByRole('heading', { level: 2 }).textContent).not.toBe(koH2);
    });

    it('ko → en 전환 시 배지 라벨이 달라진다', async () => {
      const { rerender } = render(<AIModesSection />);
      const koSupported = i18n.t('aiModes.status.supported');
      await i18n.changeLanguage('en');
      rerender(<AIModesSection />);
      const enSupported = i18n.t('aiModes.status.supported');
      expect(enSupported).not.toBe(koSupported);
      expect(screen.getAllByText(enSupported).length).toBe(4);
    });

    it('ko → en 전환 시 카테고리 라벨이 달라진다', async () => {
      const { rerender } = render(<AIModesSection />);
      const koCloud = i18n.t('aiModes.cloudLabel');
      await i18n.changeLanguage('en');
      rerender(<AIModesSection />);
      const enCloud = i18n.t('aiModes.cloudLabel');
      expect(enCloud).not.toBe(koCloud);
    });
  });
});
