/**
 * Phase 2 디자인 시스템 RED — Button 공통 컴포넌트
 * 대응 체크: TEST-P2.4
 *
 * Button 은 랜딩 페이지의 모든 CTA 와 링크를 담당하는 단일 컴포넌트.
 * Primary: Chrome Web Store 설치 유도 (Header, Hero, FinalCTA, 모바일)
 * Secondary: 앵커 스크롤 / 보조 링크 (Hero "기능 살펴보기" 등)
 *
 * 책임:
 *   1. href 가 있으면 <a>, 없으면 <button> 으로 렌더 (semantic 선택)
 *   2. external=true 시 target="_blank" + rel="noopener noreferrer" 부여
 *      (외부 링크 보안: tabnabbing 방지)
 *   3. variant="primary" / "secondary" 로 스타일 분리
 *   4. children 을 그대로 렌더 (텍스트 + 선택적 아이콘)
 *
 * RED 기대 동작:
 *   `./Button` 모듈이 존재하지 않으므로 Vitest가 "Failed to resolve import"
 *   로 본 파일 전체를 FAIL 처리해야 한다.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('TEST-P2.4 — Button 공통 컴포넌트', () => {
  describe('semantic 태그 선택 (href 유무 기반)', () => {
    it('href 가 주어지면 루트 요소가 <a> 태그이다', () => {
      // v2: firstElementChild.tagName 으로 루트 검증 강화 (중첩 a 허용 안 함).
      const { container } = render(
        <Button href="https://example.com" variant="primary">
          Click me
        </Button>
      );
      const root = container.firstElementChild;
      expect(root?.tagName).toBe('A');
      expect(root?.getAttribute('href')).toBe('https://example.com');
      // role 기반 접근성 확인
      expect(screen.getByRole('link', { name: 'Click me' })).toBe(root);
    });

    it('href 가 없으면 루트 요소가 <button> 태그이다', () => {
      const { container } = render(<Button variant="primary">Click me</Button>);
      const root = container.firstElementChild;
      expect(root?.tagName).toBe('BUTTON');
      expect(screen.getByRole('button', { name: 'Click me' })).toBe(root);
    });

    it('href 가 내부 앵커(#features)일 때도 <a> 로 렌더된다', () => {
      // Hero Secondary CTA "기능 살펴보기" 가 이 패턴을 사용.
      const { container } = render(
        <Button href="#features" variant="secondary">
          기능 살펴보기
        </Button>
      );
      const root = container.firstElementChild;
      expect(root?.tagName).toBe('A');
      expect(root?.getAttribute('href')).toBe('#features');
    });
  });

  describe('external prop — 외부 링크 보안 속성', () => {
    it('external=true 일 때 target="_blank" 가 부여된다', () => {
      render(
        <Button href="https://chromewebstore.google.com" external>
          Chrome에 추가하기
        </Button>
      );
      const el = screen.getByRole('link', { name: 'Chrome에 추가하기' });
      expect(el).toHaveAttribute('target', '_blank');
    });

    it('external=true 일 때 rel 에 noopener 와 noreferrer 둘 다 포함된다', () => {
      // v2: 리뷰 피드백 반영 — 이전 버전은 noopener 만 확인했지만, 파일 상단
      // 주석은 "noopener noreferrer 둘 다" 라고 명시했다. 두 속성의 역할:
      //   - noopener : 새 탭의 window.opener 접근 차단 (tabnabbing 방지)
      //   - noreferrer : Referer 헤더 전송 차단 (프라이버시 + tabnabbing 보조)
      // 둘 다 없으면 Chrome Web Store 로 이동 시 원본 URL 이 referrer 로
      // 노출될 수 있다. 두 속성 모두 외부 링크의 최소 보안 계약으로 강제.
      render(
        <Button href="https://chromewebstore.google.com" external>
          Chrome에 추가하기
        </Button>
      );
      const el = screen.getByRole('link', { name: 'Chrome에 추가하기' });
      const rel = el.getAttribute('rel') ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });

    it('external prop 이 없으면 target 속성이 설정되지 않는다', () => {
      render(<Button href="#features">기능 살펴보기</Button>);
      const el = screen.getByRole('link', { name: '기능 살펴보기' });
      expect(el.getAttribute('target')).toBeNull();
    });

    it('internal 링크(#anchor)는 external 무관하게 target 이 없어야 한다', () => {
      // 내부 앵커에 external 이 실수로 켜지면 UX 가 깨지므로, 사용 규약상
      // external 은 https:// 외부 URL 에만 붙이도록 교육적으로 분리.
      // (런타임 강제는 하지 않으나 기본 동작에서 안전한지만 확인)
      render(<Button href="#features">기능 살펴보기</Button>);
      expect(screen.getByRole('link').getAttribute('target')).toBeNull();
    });
  });

  describe('variant prop — 시각 구분', () => {
    it('variant="primary" 는 accent 배경(bg-accent) 을 사용한다', () => {
      const { container } = render(<Button variant="primary">p</Button>);
      const el = container.querySelector('button,a');
      expect(el?.className).toMatch(/bg-accent/);
    });

    it('variant="secondary" 는 border 가 있는 outline 스타일이다', () => {
      const { container } = render(<Button variant="secondary">s</Button>);
      const el = container.querySelector('button,a');
      expect(el?.className).toMatch(/\bborder\b/);
    });

    it('primary 와 secondary 의 className 이 서로 다르다', () => {
      const { container: a } = render(<Button variant="primary">p</Button>);
      const { container: b } = render(<Button variant="secondary">s</Button>);
      const ca = a.querySelector('button,a')?.className ?? '';
      const cb = b.querySelector('button,a')?.className ?? '';
      expect(ca).not.toBe(cb);
    });

    it('variant 생략 시 기본값은 primary 이다', () => {
      const { container } = render(<Button>default</Button>);
      const el = container.querySelector('button,a');
      expect(el?.className).toMatch(/bg-accent/);
    });
  });

  describe('children 렌더', () => {
    it('텍스트 children 이 그대로 노출된다', () => {
      render(<Button>Chrome에 추가하기</Button>);
      expect(screen.getByText('Chrome에 추가하기')).toBeInTheDocument();
    });

    it('JSX children (텍스트 + 아이콘)이 모두 렌더된다', () => {
      render(
        <Button>
          <span data-testid="icon">▶</span>
          <span>시작하기</span>
        </Button>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('시작하기')).toBeInTheDocument();
    });
  });
});
