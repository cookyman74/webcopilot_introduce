/**
 * Phase 9 — index.html SEO 메타 태그 검증
 * 대응 체크: TEST-P9.1~P9.4
 *
 * 리뷰 피드백 반영 (Medium): "존재만 확인" → 값 정확성도 검증.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf-8');

describe('index.html SEO 메타 (TEST-P9.1~P9.4)', () => {
  it('lang="ko" 가 기본값으로 설정되어 있다 (TEST-P9.1)', () => {
    expect(html).toMatch(/<html[^>]*lang="ko"/);
  });

  it('title 에 "Web AI Assistant" 가 포함되고 비어있지 않다 (TEST-P9.2)', () => {
    expect(html).toMatch(/<title>[^<]*Web AI Assistant[^<]*<\/title>/);
    // title 이 placeholder("extapp_landing") 가 아닌지
    expect(html).not.toMatch(/<title>extapp_landing<\/title>/);
  });

  it('meta description 이 존재하고 값이 비어있지 않다 (TEST-P9.3)', () => {
    expect(html).toMatch(/<meta\s+name="description"\s+content="[^"]+"/);
  });

  it('og:title 이 존재하고 값이 비어있지 않다 (TEST-P9.4)', () => {
    expect(html).toMatch(/<meta\s+property="og:title"\s+content="[^"]+"/);
  });

  it('og:description 이 존재하고 값이 비어있지 않다 (TEST-P9.4)', () => {
    expect(html).toMatch(/<meta\s+property="og:description"\s+content="[^"]+"/);
  });

  it('og:type 이 "website" 이다', () => {
    expect(html).toMatch(/<meta\s+property="og:type"\s+content="website"/);
  });

  it('og:image 가 존재하고 이미지 경로를 가리킨다', () => {
    expect(html).toMatch(/<meta\s+property="og:image"\s+content="[^"]+\.(svg|png|jpg)"/);
  });

  it('twitter:card 가 "summary_large_image" 이다', () => {
    expect(html).toMatch(/<meta\s+name="twitter:card"\s+content="summary_large_image"/);
  });
});
