/**
 * Phase 3 RED — Footer 레이아웃 컴포넌트
 * 대응 체크: TEST-P3.8
 *
 * Footer 책임:
 *   1. 루트 태그는 `<footer>` (Phase 2 Button/FeatureCard 의 루트 nodeName
 *      검증 패턴과 동일하게 엄격 검증)
 *   2. `footer.copyright` i18n 키를 렌더 (1차 값 예: "© 2026 Web AI Assistant")
 *   3. `footer.docs`, `footer.contact` 링크를 렌더 (1차엔 href="#" placeholder)
 *
 * 설계 계약:
 *   - 루트가 `<footer>` 여야 semantic HTML landmarks (contentinfo) 가 작동
 *   - © 기호 + 연도 + 제품명이 i18n 값 안에 포함되어 있어야 저작권 표기가 의미 있음
 *
 * RED 기대 동작:
 *   `./Footer` · `../../i18n` 모듈이 현재 존재하지 않으므로 "Failed to resolve
 *   import" 로 본 파일 전체가 FAIL.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';
import '../../i18n';

describe('Footer 공통 레이아웃 (TEST-P3.8)', () => {
  // ─────────────────────────────────────────────────────────
  // TEST-P3.8 — 저작권 텍스트 렌더
  // ─────────────────────────────────────────────────────────
  describe('TEST-P3.8 — 저작권 텍스트', () => {
    it('© 기호 + 2026 연도 + "Web AI Assistant" 를 포함한 저작권 텍스트를 렌더한다', () => {
      // phase03 §3.3 TASK-003 의 locale 스펙:
      //   ko.json: "footer.copyright": "© 2026 Web AI Assistant"
      //   en.json: 동일 문자열 (저작권 문구는 일반적으로 한↔영 동일)
      // 연도/제품명 포맷이 바뀌면 이 테스트를 함께 갱신해야 한다.
      render(<Footer />);
      expect(screen.getByText(/©.*2026.*Web AI Assistant/i)).toBeInTheDocument();
    });

    it('저작권 텍스트가 비어있지 않다 (i18n 키 누락 방지)', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      const text = footer.textContent?.trim() ?? '';
      expect(text.length).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 구조 계약 — 루트 태그 + landmark
  // ─────────────────────────────────────────────────────────
  describe('구조 계약', () => {
    it('루트 요소가 <footer> 태그이다', () => {
      // Phase 2 FeatureCard/Button 과 동일한 엄격도 — firstElementChild 기반
      const { container } = render(<Footer />);
      const root = container.firstElementChild;
      expect(root?.tagName).toBe('FOOTER');
    });

    it('contentinfo landmark role 로 접근 가능하다', () => {
      // <footer> 가 body 직계자 위치면 자동으로 role="contentinfo" 가 된다.
      // 테스트에서는 body 직계 여부를 보장할 수 없으므로 getByRole 로 접근성
      // 관점에서만 검증.
      render(<Footer />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────────────────
  // 보조 링크 (문서 · 문의) — 1차 placeholder
  // ─────────────────────────────────────────────────────────
  describe('보조 링크 (1차 placeholder 허용)', () => {
    // 리뷰 피드백 반영 (Low): 기존 테스트는 "최소 2개 링크" 만 검사해서
    // 빈 플레이스홀더 링크 2개도 통과했다. docs / contact 각각이 i18n 라벨
    // 로 접근 가능한지 구체적으로 강제한다.
    //
    // phase03 §3.3 TASK-003 locale 스펙:
    //   ko.json: footer.docs = "문서", footer.contact = "문의"
    //   en.json: footer.docs = "Docs", footer.contact = "Contact" (예상)
    // 두 언어 라벨 모두 매칭되도록 regex 를 OR 로 둔다.

    it('footer.docs 라벨의 링크가 정확히 1개 존재한다 ("문서" 또는 "Docs")', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      const docsLinks = Array.from(footer.querySelectorAll('a')).filter((a) =>
        /문서|docs/i.test(a.textContent ?? '')
      );
      expect(docsLinks.length).toBe(1);
    });

    it('footer.contact 라벨의 링크가 정확히 1개 존재한다 ("문의" 또는 "Contact")', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      const contactLinks = Array.from(footer.querySelectorAll('a')).filter((a) =>
        /문의|contact/i.test(a.textContent ?? '')
      );
      expect(contactLinks.length).toBe(1);
    });

    it('docs / contact 두 링크는 서로 다른 요소이다 (1개 링크가 두 역할 못함)', () => {
      // 같은 앵커에 "문서 / 문의" 같은 형식으로 합쳐서 1개로 처리하는 회귀 방지
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      const anchors = Array.from(footer.querySelectorAll('a'));
      const docs = anchors.find((a) => /문서|docs/i.test(a.textContent ?? ''));
      const contact = anchors.find((a) => /문의|contact/i.test(a.textContent ?? ''));
      expect(docs).toBeDefined();
      expect(contact).toBeDefined();
      expect(docs).not.toBe(contact);
    });

    it('docs / contact 링크가 href 속성을 가진다 (1차엔 "#" 허용)', () => {
      // 1차엔 placeholder 이지만 최소한 href 속성은 있어야 접근성/인지 가능.
      // href 없이 <a> 태그만 쓰는 잘못된 구현을 차단.
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      const docs = Array.from(footer.querySelectorAll('a')).find((a) =>
        /문서|docs/i.test(a.textContent ?? '')
      );
      const contact = Array.from(footer.querySelectorAll('a')).find((a) =>
        /문의|contact/i.test(a.textContent ?? '')
      );
      expect(docs?.getAttribute('href')).not.toBeNull();
      expect(contact?.getAttribute('href')).not.toBeNull();
    });
  });
});
