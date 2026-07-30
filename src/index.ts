import { injectStyles } from './inject';
import { styles } from './styles';

injectStyles(styles);

export { ToastProvider, useToast, useToastContext } from './ToastContext';
export type { ToastData, InternalToast, ToastContextValue, ToastProviderProps, ToastRenderProps } from './ToastContext';

export { default as ToastContainer } from './ToastContainer';
export type { ToastContainerProps } from './ToastContainer';

export { default as ToastItem } from './ToastItem';
export type { ToastItemProps } from './ToastItem';

export type { SpringConfig, SpringPreset, AnimationVariant, Position } from './spring';
export type { AnimateConfig } from './animate';
