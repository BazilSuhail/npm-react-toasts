import { useRef, useEffect, useCallback, type CSSProperties } from 'react';
import { animateIn, animateOut, type AnimateConfig } from './animate';
import type { Position } from './spring';

export interface ToastItemProps {
  id: string;
  message: string;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  dismissible?: boolean;
  position: Position;
  animation?: AnimateConfig['animation'];
  spring?: AnimateConfig['spring'];
  onDismiss: (id: string) => void;
}

const TYPE_ICONS: Record<string, string> = {
  default: '',
  success: '',
  error: '',
  warning: '',
  info: '',
};

export default function ToastItem({
  id,
  message,
  type = 'default',
  dismissible = true,
  position,
  animation,
  spring,
  onDismiss,
}: ToastItemProps) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elRef.current) {
      animateIn(elRef.current, { animation, spring, position });
    }
  }, [animation, spring, position]);

  const handleDismiss = useCallback(() => {
    if (!elRef.current) return;
    animateOut(elRef.current, { animation, spring, position }).then(() => {
      onDismiss(id);
    });
  }, [id, onDismiss, animation, spring, position]);

  const icon = TYPE_ICONS[type];

  return (
    <div
      ref={elRef}
      className={`rt-item rt-item--${type}`}
      role="alert"
      aria-live="assertive"
      style={{ opacity: 0 } as CSSProperties}
    >
      {icon && <span className="rt-icon">{icon}</span>}
      <span className="rt-message">{message}</span>
      {dismissible && (
        <button
          className="rt-close"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          &times;
        </button>
      )}
    </div>
  );
}
