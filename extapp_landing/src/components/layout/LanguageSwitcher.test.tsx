/**
 * Phase 3 RED — LanguageSwitcher 컴포넌트
 * 대응 체크: TEST-P3.6 · TEST-P3.7
 *
 * LanguageSwitcher 책임:
 *   1. SUPPORTED_LANGUAGES 각각에 대해 토글 버튼을 렌더
 *      (Phase 3 1차 기준 ko/en 2개 — 드롭다운 대신 단순 버튼 토글)
 *   2. 클릭 시 `i18n.changeLanguage(lng)` 호출
 *   3. i18next-browser-languagedetector 의 localStorage 캐시에 자동 저장
 *
 * 테스트 정책:
 *   - `@testing-library/user-event` 로 실제 클릭 시뮬레이션 (pointer + focus
 *     이벤트까지 자연스럽게 발생 → 접근성 회귀도 덤으로 검증)
 *   - `beforeEach` 에서 언어를 ko 로 리셋 + localStorage 클리어하여 테스트 간
 *     독립 보장
 *
 * 구현 선택 유연성 + 계약:
 *   - 라벨 텍스트는 "KO"/"EN" 이든 "한국어"/"English" 이든 자유.
 *   - 버튼 요소 타입은 `<button>` 을 요구 (select/option 방식은 1차에서 제외).
 *   - **공개 계약 — data-testid**:
 *       * 루트 엘리먼트: `data-testid="language-switcher"` (Header 가 의존)
 *       * 각 언어 버튼: `data-testid="lang-toggle-{lang}"` (`lang-toggle-ko`,
 *         `lang-toggle-en`) — 리뷰 피드백 반영: 라벨 regex `name: /ko|한국어/i`
 *         는 i18n 라벨 변경/아이콘 전환에 취약하므로 안정적 selector 로 data-testid
 *         를 병용한다.
 *   - testid 는 **Badge 의 `data-testid="status-badge"` 와 동일한 공개 계약**
 *     이므로 절대 이름 변경 금지.
 *
 * RED 기대 동작:
 *   `./LanguageSwitcher` · `../../i18n` 모듈 모두 현재 존재하지 않으므로
 *   "Failed to resolve import" 로 본 파일 전체가 FAIL.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '../../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher (TEST-P3.6 + TEST-P3.7)', () => {
  beforeEach(async () => {
    // 각 케이스 전 언어를 ko 로, localStorage 클리어로 독립 보장
    await i18n.changeLanguage('ko');
    localStorage.clear();
  });

  // ─────────────────────────────────────────────────────────
  // 공개 계약 — data-testid 부착 (Header 가 의존)
  // ─────────────────────────────────────────────────────────
  describe('공개 계약 — data-testid', () => {
    // 리뷰 피드백 반영: 라벨 regex 는 i18n 변경/아이콘 전환에 취약.
    // Header.test.tsx 가 LanguageSwitcher 포함 여부를 검증하려면 안정적인
    // selector 가 필요하므로 3종 testid 를 공개 계약으로 고정한다.

    it('루트에 data-testid="language-switcher" 가 부착된다', () => {
      render(<LanguageSwitcher />);
      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
    });

    it('ko 언어 버튼에 data-testid="lang-toggle-ko" 가 부착된다', () => {
      render(<LanguageSwitcher />);
      const koToggle = screen.getByTestId('lang-toggle-ko');
      expect(koToggle).toBeInTheDocument();
      // 반드시 button 요소여야 함 (select/option 방식 허용 안 함)
      expect(koToggle.tagName).toBe('BUTTON');
    });

    it('en 언어 버튼에 data-testid="lang-toggle-en" 가 부착된다', () => {
      render(<LanguageSwitcher />);
      const enToggle = screen.getByTestId('lang-toggle-en');
      expect(enToggle).toBeInTheDocument();
      expect(enToggle.tagName).toBe('BUTTON');
    });
  });

  // ─────────────────────────────────────────────────────────
  // 렌더 계약 — SUPPORTED_LANGUAGES 기반 토글
  // ─────────────────────────────────────────────────────────
  describe('렌더 계약', () => {
    it('ko / en 두 언어 각각에 대해 <button> 토글이 렌더된다', () => {
      render(<LanguageSwitcher />);
      // data-testid 기반 조회 — 라벨 변경에 강건함
      expect(screen.getByTestId('lang-toggle-ko')).toBeInTheDocument();
      expect(screen.getByTestId('lang-toggle-en')).toBeInTheDocument();
    });

    it('초기 렌더 시 현재 활성 언어(ko)가 시각적으로 표시된다', () => {
      // 구현 자유: aria-pressed="true", data-active, className, disabled 등
      // 어떤 방식이든 "현재 언어가 ko 임" 이 **접근 가능** 해야 한다.
      render(<LanguageSwitcher />);
      const koToggle = screen.getByTestId('lang-toggle-ko');
      const enToggle = screen.getByTestId('lang-toggle-en');

      // aria-pressed 또는 aria-current 또는 data-active 중 하나를 검증
      const koIsActive =
        koToggle.getAttribute('aria-pressed') === 'true' ||
        koToggle.getAttribute('aria-current') === 'true' ||
        koToggle.getAttribute('data-active') === 'true' ||
        koToggle.hasAttribute('disabled');
      const enIsActive =
        enToggle.getAttribute('aria-pressed') === 'true' ||
        enToggle.getAttribute('aria-current') === 'true' ||
        enToggle.getAttribute('data-active') === 'true' ||
        enToggle.hasAttribute('disabled');

      expect(koIsActive).toBe(true);
      expect(enIsActive).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P3.6 — 클릭 시 i18n.language 변경
  // ─────────────────────────────────────────────────────────
  describe('TEST-P3.6 — 클릭 시 i18n.language 변경', () => {
    it('EN 토글 클릭 → i18n.language 가 "en" 이 된다', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      expect(i18n.language).toBe('ko'); // beforeEach 로 시작 상태 ko
      await user.click(screen.getByTestId('lang-toggle-en'));
      expect(i18n.language).toBe('en');
    });

    it('KO 토글 재클릭 → i18n.language 가 다시 "ko" 로 돌아온다', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      // ko → en → ko 왕복
      await user.click(screen.getByTestId('lang-toggle-en'));
      expect(i18n.language).toBe('en');
      await user.click(screen.getByTestId('lang-toggle-ko'));
      expect(i18n.language).toBe('ko');
    });

    it('이미 활성화된 언어를 다시 클릭해도 크래시가 나지 않는다', async () => {
      // i18n.changeLanguage(현재와 같은 언어) 는 idempotent. 이를 UI 에서도 보장.
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      // 초기 ko 에서 KO 토글을 다시 클릭
      await user.click(screen.getByTestId('lang-toggle-ko'));
      expect(i18n.language).toBe('ko');
    });
  });

  // ─────────────────────────────────────────────────────────
  // TEST-P3.7 — localStorage 저장
  // ─────────────────────────────────────────────────────────
  describe('TEST-P3.7 — localStorage 영속화', () => {
    it('언어 변경 후 localStorage 에 i18nextLng="en" 이 저장된다', async () => {
      // i18next-browser-languagedetector 의 기본 key = "i18nextLng".
      // phase03 §3.3 TASK-004 i18next init 의 detection.caches = ['localStorage']
      // 설정이 이 동작의 소스.
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      // 초기 상태: beforeEach 에서 localStorage.clear() 했으므로 키 부재 확인
      expect(localStorage.getItem('i18nextLng')).toBeNull();

      await user.click(screen.getByTestId('lang-toggle-en'));
      expect(localStorage.getItem('i18nextLng')).toBe('en');
    });

    it('언어 왕복(en → ko) 후에도 localStorage 값이 정확히 반영된다', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      await user.click(screen.getByTestId('lang-toggle-en'));
      expect(localStorage.getItem('i18nextLng')).toBe('en');

      await user.click(screen.getByTestId('lang-toggle-ko'));
      expect(localStorage.getItem('i18nextLng')).toBe('ko');
    });
  });
});
