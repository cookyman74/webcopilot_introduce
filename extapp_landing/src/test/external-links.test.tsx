/**
 * Phase 9 — 외부 링크 안전성 검증
 * 대응 체크: TEST-P9.6
 *
 * 리뷰 피드백 반영 (Low): target="_blank" 만 검사하면 외부 링크가 target 을
 * 잃었을 때 검사 대상에서 빠진다. https:// 링크도 별도로 검증.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';
import i18n from '../i18n';

describe('외부 링크 안전성 (TEST-P9.6)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  it('모든 target="_blank" 링크에 rel="noopener noreferrer" 가 포함된다', () => {
    const { container } = render(<App />);
    const blanks = Array.from(container.querySelectorAll('a[target="_blank"]'));
    expect(blanks.length).toBeGreaterThan(0);
    for (const link of blanks) {
      const rel = link.getAttribute('rel') ?? '';
      expect(
        rel.includes('noopener'),
        `href="${link.getAttribute('href')}" 에 rel="noopener" 누락`
      ).toBe(true);
      expect(
        rel.includes('noreferrer'),
        `href="${link.getAttribute('href')}" 에 rel="noreferrer" 누락`
      ).toBe(true);
    }
  });

  it('모든 https:// 링크가 target="_blank" 를 갖는다 (외부 링크 누락 방지)', () => {
    // 리뷰 피드백 반영: https:// 링크가 실수로 target 을 잃으면
    // target="_blank" 검사에서 빠져 rel 도 검증되지 않는다. 이 가드는
    // "https:// 링크는 반드시 외부 링크로 렌더되어야 한다" 를 강제.
    const { container } = render(<App />);
    const httpsLinks = Array.from(container.querySelectorAll('a')).filter((a) =>
      (a.getAttribute('href') ?? '').startsWith('https://')
    );
    expect(httpsLinks.length).toBeGreaterThan(0);
    for (const link of httpsLinks) {
      expect(
        link.getAttribute('target'),
        `https:// link "${link.getAttribute('href')}" 에 target="_blank" 누락`
      ).toBe('_blank');
    }
  });
});
