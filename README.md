# entity-react-toasts

[![npm version](https://img.shields.io/npm/v/entity-react-toasts.svg)](https://www.npmjs.com/package/entity-react-toasts)
[![npm downloads](https://img.shields.io/npm/dm/entity-react-toasts.svg)](https://www.npmjs.com/package/entity-react-toasts)
[![license](https://img.shields.io/npm/l/entity-react-toasts.svg)](https://github.com/BazilSuhail/react-toast/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/entity-react-toasts)](https://bundlephobia.com/package/entity-react-toasts)
[![typescript](https://img.shields.io/badge/typescript-ready-blue.svg)](https://www.typescriptlang.org/)

Zero-dependency React toast notification library with spring physics animations powered by the Web Animations API.

- **7 animation variants** — slide, scale, fade, none
- **5 spring presets** — default, gentle, wobbly, stiff, slow
- **8 positions** — all corners + center edges
- **5 toast types** — default, success, error, warning, info
- **Max toast limit** — configurable, auto-evicts oldest
- **Auto-dismiss** — configurable duration per toast
- **Dismissible** — close button with exit animation
- **Reduced motion** — respects `prefers-reduced-motion`
- Zero-config — styles auto-injected, no CSS import needed
- Portal-rendered, accessible, and tree-shakable

## Install

```bash
npm install entity-react-toasts
```

## Quick Start

```tsx
import { ToastProvider, ToastContainer, useToast } from 'entity-react-toasts';

function App() {
  return (
    <ToastProvider>
      <MyComponent />
      <ToastContainer />
    </ToastProvider>
  );
}

function MyComponent() {
  const { success, error } = useToast();

  return (
    <div>
      <button onClick={() => success('Changes saved!')}>Save</button>
      <button onClick={() => error('Something went wrong')}>Error</button>
    </div>
  );
}
```

## Components

| Component | Purpose |
|---|---|
| `ToastProvider` | Root provider. Manages toast state, timers, max limit, and defaults. |
| `ToastContainer` | Renders toasts into `document.body` via portal. Groups by position. |
| `ToastItem` | Individual toast with icon, message, close button, and spring-animated enter/exit. |

## Hooks

| Hook | Returns |
|---|---|
| `useToast` | `{ toast, success, error, warning, info, dismiss }` |
| `useToastContext` | Raw `ToastContextValue` object |

## Props

### ToastProvider

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | App content. |
| `defaultPosition` | `Position` | `'top-right'` | Default position for all toasts. |
| `defaultDuration` | `number` | `4000` | Default auto-dismiss duration in ms. |
| `defaultAnimation` | `AnimationVariant` | `'slide-top'` | Default animation variant. |
| `defaultSpring` | `SpringPreset \| SpringConfig` | `'gentle'` | Default spring config. |
| `maxToasts` | `number` | `5` | Maximum visible toasts. Oldest evicted when exceeded. |

### ToastContainer

| Prop | Type | Default | Description |
|---|---|---|---|
| `position` | `Position` | — | Override position for all toasts in this container. |
| `animation` | `AnimationVariant` | — | Override animation for all toasts. |
| `spring` | `SpringPreset \| SpringConfig` | — | Override spring for all toasts. |

### ToastItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | Unique toast identifier. |
| `message` | `string` | — | Toast message content. |
| `type` | `'default' \| 'success' \| 'error' \| 'warning' \| 'info'` | `'default'` | Toast type with color styling. |
| `dismissible` | `boolean` | `true` | Show close button. |
| `position` | `Position` | — | Toast position. |
| `animation` | `AnimationVariant` | — | Animation variant. |
| `spring` | `SpringPreset \| SpringConfig` | — | Spring config. |
| `onDismiss` | `(id: string) => void` | — | Called when toast is dismissed. |

## Toast Data

When creating a toast, you can pass these options:

```ts
interface ToastData {
  id: string;
  message: string;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  dismissible?: boolean;
  position?: Position;
  animation?: AnimationVariant;
  spring?: SpringPreset | SpringConfig;
}
```

## useToast Hook

```tsx
const { toast, success, error, warning, info, dismiss } = useToast();

// Basic toast
toast('Hello world');

// Typed toast with options
success('Changes saved!', { duration: 6000, position: 'bottom-center' });

// Custom animation
error('Failed to save', { animation: 'scale', spring: 'stiff' });

// Dismiss by ID
const id = toast('Loading...');
dismiss(id);
```

## Animation Variants

| Variant | Effect |
|---|---|
| `slide-top` | Slide down from above (default) |
| `slide-bottom` | Slide up from below |
| `slide-left` | Slide in from left |
| `slide-right` | Slide in from right |
| `fade` | Opacity only, no transform |
| `scale` | Scale from 0.9 to 1 with opacity |
| `none` | Instant, no animation |

```tsx
// Set on provider (applies to all toasts)
<ToastProvider defaultAnimation="slide-bottom">

// Set per toast
success('Saved!', { animation: 'scale' });

// Set on container
<ToastContainer animation="slide-left" />
```

## Positions

| Position | Description |
|---|---|
| `top-left` | Top-left corner |
| `top-center` | Top center |
| `top-right` | Top-right corner (default) |
| `left-center` | Left center |
| `right-center` | Right center |
| `bottom-left` | Bottom-left corner |
| `bottom-center` | Bottom center |
| `bottom-right` | Bottom-right corner |

```tsx
// Set on provider
<ToastProvider defaultPosition="bottom-left">

// Set per toast
info('New message', { position: 'top-center' });

// Set on container
<ToastContainer position="bottom-right" />
```

## Spring Presets

| Preset | Stiffness | Damping | Mass | Feel |
|---|---|---|---|---|
| `default` | 100 | 10 | 1 | Moderate bounce, balanced |
| `gentle` | 120 | 14 | 1 | Critically damped, no overshoot |
| `wobbly` | 200 | 10 | 1 | Playful, lots of bounce |
| `stiff` | 400 | 30 | 1 | Snappy, quick settle |
| `slow` | 50 | 20 | 1 | Heavy, deliberate |

```tsx
success('Saved!', { spring: 'wobbly' });
```

## Custom Spring Config

```tsx
success('Saved!', { spring: { stiffness: 300, damping: 15, mass: 0.8 } });
```

## Multiple Containers

Render multiple `ToastContainer` components for different positions:

```tsx
<ToastProvider>
  <App />
  <ToastContainer position="top-right" />
  <ToastContainer position="bottom-left" />
</ToastProvider>
```

Toasts automatically route to the correct container based on their position.

## Max Toasts

Control the maximum number of visible toasts:

```tsx
<ToastProvider maxToasts={3}>
  ...
</ToastProvider>
```

When the limit is exceeded, the oldest non-removing toast is evicted.

## Duration

Set default duration or per-toast:

```tsx
// Global default
<ToastProvider defaultDuration={5000}>

// Per toast
toast('Quick message', { duration: 2000 });
success('Sticky message', { duration: 0 }); // 0 = no auto-dismiss
```

## Disabling Close

```tsx
// Non-dismissible toast
error('Critical error', { dismissible: false });
```

## CSS Custom Properties

Override these in your CSS to theme the toasts globally:

```css
:root {
  --rt-bg: #ffffff;
  --rt-text: #1e293b;
  --rt-text-muted: #64748b;
  --rt-border: #e2e8f0;
  --rt-radius: 10px;
  --rt-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  --rt-success: #10b981;
  --rt-success-bg: #ecfdf5;
  --rt-error: #ef4444;
  --rt-error-bg: #fef2f2;
  --rt-warning: #f59e0b;
  --rt-warning-bg: #fffbeb;
  --rt-info: #3b82f6;
  --rt-info-bg: #eff6ff;
  --rt-close-color: #94a3b8;
  --rt-close-hover: #475569;
}
```

## Real-World Examples

### Success Toast

```tsx
const { success } = useToast();

success('Your changes have been saved.', { duration: 3000 });
```

### Error with Custom Position

```tsx
const { error } = useToast();

error('Failed to upload file. Please try again.', {
  position: 'top-center',
  spring: 'stiff',
  duration: 6000,
});
```

### Warning Toast

```tsx
const { warning } = useToast();

warning('Your session will expire in 5 minutes.', {
  dismissible: false,
  duration: 8000,
});
```

### Info Toast

```tsx
const { info } = useToast();

info('New features are available. Check them out!', {
  animation: 'scale',
  spring: 'gentle',
});
```

### Custom Animation

```tsx
const { toast } = useToast();

toast('Processing...', {
  animation: 'fade',
  spring: 'slow',
  position: 'bottom-center',
  duration: 2000,
});
```

### Sequential Toasts

```tsx
const { success, error } = useToast();

async function handleSave() {
  try {
    await saveData();
    success('Saved successfully!');
  } catch (err) {
    error('Save failed. Please try again.');
  }
}
```

## Accessibility

- `role="alert"` and `aria-live="assertive"` on each toast
- `aria-label="Dismiss"` on close button
- Respects `prefers-reduced-motion: reduce` — animations are skipped entirely
- Focus never trapped — toasts are non-modal

## TypeScript

All component props, spring types, and animation types are fully typed and exported:

```tsx
import type {
  ToastData,
  ToastContextValue,
  ToastProviderProps,
  ToastContainerProps,
  ToastItemProps,
  SpringConfig,
  SpringPreset,
  AnimationVariant,
  Position,
  AnimateConfig,
} from 'entity-react-toasts';
```

## Tree Shaking

The package uses the `exports` field with conditional ESM/CJS builds and `sideEffects: false`. Styles are auto-injected on first import. Bundlers will tree-shake unused components automatically.

```tsx
// Only imports what you use
import { ToastProvider, useToast } from 'entity-react-toasts';
```

## License

MIT
