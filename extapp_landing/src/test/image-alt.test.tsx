/**
 * Phase 9 — 이미지 alt 속성 검증
 * 대응 체크: TEST-P9.5
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';
import i18n from '../i18n';

describe('이미지 alt 속성 (TEST-P9.5)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  it('App 전체 렌더 후 모든 <img> 에 alt 속성이 존재한다', () => {
    const { container } = render(<App />);
    const images = Array.from(container.querySelectorAll('img'));
    expect(images.length).toBeGreaterThan(0);
    for (const img of images) {
      expect(img.hasAttribute('alt'), `src="${img.getAttribute('src')}" 에 alt 속성 누락`).toBe(
        true
      );
    }
  });

  it('alt 속성이 i18n 키 문자열이 아닌 실제 번역값이다', () => {
    // 리뷰 피드백 반영 (Medium): 이전 regex /^[a-z]+\.[a-z]+\.[a-z]+$/ 는
    // "hero.imageAlt" 같은 2단 키를 놓쳤다. i18n 키 패턴을 더 포괄적으로 잡음.
    const { container } = render(<App />);
    const images = Array.from(container.querySelectorAll('img'));
    for (const img of images) {
      const alt = img.getAttribute('alt') ?? '';
      // i18n 키는 보통 dot-separated camelCase: hero.imageAlt, common.examplePrefix 등
      // 실제 번역값은 한글이거나 공백/특수문자를 포함
      expect(alt).not.toMatch(/^[a-zA-Z]+(\.[a-zA-Z_]+)+$/);
      // 빈 문자열이 아닌 경우 2글자 이상이어야 함 (실제 의미 있는 텍스트)
      if (alt !== '') {
        expect(alt.length).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
