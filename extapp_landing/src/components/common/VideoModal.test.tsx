/**
 * Phase 6 리뷰 반영 — VideoModal 단위 테스트
 *
 * VideoModal 책임:
 *   1. isOpen=true 일 때 모달 렌더, false 일 때 null
 *   2. videoId 있으면 YouTube iframe, 없으면 placeholder
 *   3. 닫기 3종: X 버튼 / 배경 클릭 / ESC 키 → onClose 호출
 *   4. body.overflow 잠금/해제
 *   5. 접근성: role="dialog" + aria-modal="true" + aria-label
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoModal } from './VideoModal';
import i18n from '../../i18n';

describe('VideoModal', () => {
  const onClose = vi.fn();

  beforeEach(async () => {
    onClose.mockClear();
    document.body.style.overflow = '';
    await i18n.changeLanguage('ko');
  });

  // ─────────────────────────────────────────────────
  // 렌더 조건
  // ─────────────────────────────────────────────────
  it('isOpen=false 이면 아무것도 렌더하지 않는다', () => {
    const { container } = render(<VideoModal isOpen={false} onClose={onClose} />);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('isOpen=true 이면 dialog 가 렌더된다', () => {
    render(<VideoModal isOpen={true} onClose={onClose} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────────
  // videoId 분기
  // ─────────────────────────────────────────────────
  it('videoId 가 없으면 placeholder (Play 아이콘 + "영상 준비 중") 를 렌더한다', () => {
    render(<VideoModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText('영상 준비 중')).toBeInTheDocument();
    // iframe 은 없어야 함
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('videoId 가 있으면 YouTube iframe 을 렌더한다', () => {
    render(<VideoModal isOpen={true} onClose={onClose} videoId="testId123" />);
    const iframe = document.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('src')).toContain('youtube.com/embed/testId123');
    expect(iframe?.getAttribute('src')).toContain('autoplay=1');
    // placeholder 텍스트는 없어야 함
    expect(screen.queryByText('영상 준비 중')).toBeNull();
  });

  // ─────────────────────────────────────────────────
  // 닫기 동작
  // ─────────────────────────────────────────────────
  it('X 버튼 클릭 시 onClose 가 호출된다', async () => {
    const user = userEvent.setup();
    render(<VideoModal isOpen={true} onClose={onClose} />);
    const closeBtn = screen.getByLabelText('닫기');
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('배경(오버레이) 클릭 시 onClose 가 호출된다', async () => {
    const user = userEvent.setup();
    render(<VideoModal isOpen={true} onClose={onClose} />);
    const overlay = screen.getByRole('dialog');
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('모달 콘텐츠 영역 클릭 시 onClose 가 호출되지 않는다 (stopPropagation)', async () => {
    const user = userEvent.setup();
    render(<VideoModal isOpen={true} onClose={onClose} />);
    // placeholder 텍스트를 클릭 — 콘텐츠 영역 내부
    const placeholder = screen.getByText('영상 준비 중');
    await user.click(placeholder);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ESC 키 누르면 onClose 가 호출된다', async () => {
    const user = userEvent.setup();
    render(<VideoModal isOpen={true} onClose={onClose} />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ─────────────────────────────────────────────────
  // body overflow 잠금
  // ─────────────────────────────────────────────────
  it('isOpen=true 이면 body.overflow 가 hidden 으로 설정된다', () => {
    render(<VideoModal isOpen={true} onClose={onClose} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('언마운트 시 body.overflow 가 복원된다', () => {
    const { unmount } = render(<VideoModal isOpen={true} onClose={onClose} />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  // ─────────────────────────────────────────────────
  // 접근성
  // ─────────────────────────────────────────────────
  it('dialog 에 aria-modal="true" 가 설정된다', () => {
    render(<VideoModal isOpen={true} onClose={onClose} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('title 이 있으면 aria-label 에 title 이 포함된다', () => {
    render(<VideoModal isOpen={true} onClose={onClose} title="테스트 영상" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-label')).toContain('테스트 영상');
  });
});
