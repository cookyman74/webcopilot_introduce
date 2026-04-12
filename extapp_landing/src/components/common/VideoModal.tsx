import { useEffect, useCallback } from 'react';
import { X, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * VideoModal — 유튜브 영상을 중앙 모달로 재생하는 공통 컴포넌트.
 *
 * 동작:
 *   - videoId 가 있으면 YouTube iframe 임베드를 16:9 비율로 표시
 *   - videoId 가 없으면 "영상 준비 중" placeholder 표시
 *   - 닫기: X 버튼 / 배경 클릭 / ESC 키
 *
 * 사용처: ScenariosSection 의 시나리오 카드 영상 placeholder 클릭 시
 */
type VideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  videoId?: string;
  title?: string;
};

export function VideoModal({ isOpen, onClose, videoId, title }: VideoModalProps) {
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title ? t('common.videoDialog', { title }) : t('scenarios.videoPlaceholder')}
    >
      <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-2 -top-10 rounded-full p-1 text-white hover:text-ink-400 transition"
          aria-label={t('common.close')}
        >
          <X size={24} />
        </button>

        {/* 영상 영역 — 16:9 비율 */}
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-ink-900">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={title ?? ''}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-ink-400">
              <Play size={48} />
              <span className="text-sm">{t('scenarios.videoPlaceholder')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
