import { useMemo, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useToastContext, type InternalToast } from './ToastContext';
import ToastItem from './ToastItem';
import type { Position, AnimationVariant, SpringPreset, SpringConfig } from './spring';
import './styles.css';

const POSITION_CLASSES: Record<Position, string> = {
  'top-left': 'rt-container--top-left',
  'top-center': 'rt-container--top-center',
  'top-right': 'rt-container--top-right',
  'left-center': 'rt-container--left-center',
  'right-center': 'rt-container--right-center',
  'bottom-left': 'rt-container--bottom-left',
  'bottom-center': 'rt-container--bottom-center',
  'bottom-right': 'rt-container--bottom-right',
};

export interface ToastContainerProps {
  position?: Position;
  animation?: AnimationVariant;
  spring?: SpringPreset | SpringConfig;
  children?: (toasts: InternalToast[], dismiss: (id: string) => void) => ReactNode;
}

export default function ToastContainer({
  position: positionProp,
  animation: animationProp,
  spring: springProp,
  children,
}: ToastContainerProps) {
  const ctx = useToastContext();

  const grouped = useMemo(() => {
    const map = new Map<Position, InternalToast[]>();
    for (const toast of ctx.toasts) {
      const pos = toast.position ?? positionProp ?? ctx.defaultPosition;
      if (!map.has(pos)) map.set(pos, []);
      map.get(pos)!.push(toast);
    }
    return map;
  }, [ctx.toasts, positionProp, ctx.defaultPosition]);

  const containers = Array.from(grouped.entries()).map(([position, toasts]) => {
    const posClass = POSITION_CLASSES[position] ?? 'rt-container--top-right';
    return (
      <div key={position} className={`rt-container ${posClass}`}>
        {children
          ? children(toasts, ctx.removeToast)
          : toasts.map((t) => (
              <ToastItem
                key={t.id}
                id={t.id}
                message={t.message}
                type={t.type}
                dismissible={t.dismissible}
                position={position}
                animation={t.animation ?? animationProp ?? ctx.defaultAnimation}
                spring={t.spring ?? springProp ?? ctx.defaultSpring}
                onDismiss={ctx.removeToast}
                render={t.render}
              />
            ))}
      </div>
    );
  });

  return createPortal(<>{containers}</>, document.body);
}
