import { createContext, useContext, useCallback, useRef, useState, type ReactNode } from 'react';
import type { SpringPreset, SpringConfig, AnimationVariant, Position } from './spring';

export interface ToastRenderProps {
  id: string;
  message: string;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  position: Position;
  dismiss: () => void;
}

export interface ToastData {
  id: string;
  message: string;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  dismissible?: boolean;
  position?: Position;
  animation?: AnimationVariant;
  spring?: SpringPreset | SpringConfig;
  render?: (props: ToastRenderProps) => ReactNode;
}

export interface InternalToast extends ToastData {
  removing: boolean;
}

export interface ToastContextValue {
  toasts: InternalToast[];
  addToast: (toast: Omit<ToastData, 'id'>) => string;
  removeToast: (id: string) => void;
  defaultPosition: Position;
  defaultDuration: number;
  defaultAnimation: AnimationVariant;
  defaultSpring: SpringPreset | SpringConfig;
  maxToasts: number;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastCounter = 0;

export interface ToastProviderProps {
  children: ReactNode;
  defaultPosition?: Position;
  defaultDuration?: number;
  defaultAnimation?: AnimationVariant;
  defaultSpring?: SpringPreset | SpringConfig;
  maxToasts?: number;
}

export function ToastProvider({
  children,
  defaultPosition = 'top-right',
  defaultDuration = 4000,
  defaultAnimation = 'slide-top',
  defaultSpring = 'gentle',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<InternalToast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 350);
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastData, 'id'>) => {
      const id = `toast-${++toastCounter}`;
      const duration = toast.duration ?? defaultDuration;

      setToasts((prev) => {
        const next = [...prev, { ...toast, id, removing: false }];
        if (next.length > maxToasts) {
          const oldest = next.find((t) => !t.removing);
          if (oldest) {
            const timer = timersRef.current.get(oldest.id);
            if (timer) clearTimeout(timer);
            timersRef.current.delete(oldest.id);
            return next.filter((t) => t.id !== oldest.id).concat([{ ...toast, id, removing: false }]);
          }
        }
        return next;
      });

      if (duration > 0) {
        const timer = setTimeout(() => removeToast(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [defaultDuration, maxToasts, removeToast]
  );

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    defaultPosition,
    defaultDuration,
    defaultAnimation,
    defaultSpring,
    maxToasts,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');

  const toast = useCallback(
    (message: string, options?: Partial<Omit<ToastData, 'id' | 'message'>>) => {
      return ctx.addToast({ message, ...options });
    },
    [ctx]
  );

  const success = useCallback(
    (message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'type'>>) => {
      return ctx.addToast({ message, type: 'success', ...options });
    },
    [ctx]
  );

  const error = useCallback(
    (message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'type'>>) => {
      return ctx.addToast({ message, type: 'error', ...options });
    },
    [ctx]
  );

  const warning = useCallback(
    (message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'type'>>) => {
      return ctx.addToast({ message, type: 'warning', ...options });
    },
    [ctx]
  );

  const info = useCallback(
    (message: string, options?: Partial<Omit<ToastData, 'id' | 'message' | 'type'>>) => {
      return ctx.addToast({ message, type: 'info', ...options });
    },
    [ctx]
  );

  return { toast, success, error, warning, info, dismiss: ctx.removeToast };
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within <ToastProvider>');
  return ctx;
}
