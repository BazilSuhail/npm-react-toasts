import { resolveSpringConfig, springToWAAPIKeyframes, type SpringPreset, type SpringConfig, type AnimationVariant, type Position } from './spring';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface AnimateConfig {
  spring?: SpringPreset | SpringConfig;
  animation?: AnimationVariant;
  position?: Position;
}

const EXIT_MAX_DURATION = 300;

export function animateIn(
  el: HTMLElement,
  config?: AnimateConfig,
): Animation | null {
  const variant = config?.animation ?? 'slide-top';
  const position = config?.position ?? 'top-right';

  if (prefersReducedMotion() || variant === 'none') {
    el.style.opacity = '1';
    el.style.transform = 'none';
    return null;
  }

  const springConfig = resolveSpringConfig(config?.spring);

  const { keyframes, duration } = springToWAAPIKeyframes(0, 1, 'transform', springConfig, {
    variant,
    position,
  });

  return el.animate(keyframes, {
    duration,
    easing: 'linear',
    fill: 'forwards',
  });
}

export function animateOut(
  el: HTMLElement,
  config?: AnimateConfig,
): Promise<void> {
  const variant = config?.animation ?? 'slide-top';
  const position = config?.position ?? 'top-right';

  if (prefersReducedMotion() || variant === 'none') {
    return Promise.resolve();
  }

  const springConfig = resolveSpringConfig(config?.spring);
  const exitConfig = {
    stiffness: springConfig.stiffness * 1.5,
    damping: springConfig.damping * 1.3,
    mass: springConfig.mass,
  };

  const { keyframes, duration } = springToWAAPIKeyframes(1, 0, 'transform', exitConfig, {
    variant,
    position,
    maxDuration: EXIT_MAX_DURATION,
  });

  const anim = el.animate(keyframes, {
    duration,
    easing: 'linear',
    fill: 'forwards',
  });

  return anim.finished.then(() => {});
}
