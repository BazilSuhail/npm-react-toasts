export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

export type SpringPreset = 'default' | 'gentle' | 'wobbly' | 'stiff' | 'slow';

export type AnimationVariant =
  | 'slide-top'
  | 'slide-bottom'
  | 'slide-left'
  | 'slide-right'
  | 'fade'
  | 'scale'
  | 'none';

export type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'left-center'
  | 'right-center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

const PRESETS: Record<SpringPreset, SpringConfig> = {
  default: { stiffness: 100, damping: 10, mass: 1 },
  gentle: { stiffness: 120, damping: 14, mass: 1 },
  wobbly: { stiffness: 200, damping: 10, mass: 1 },
  stiff: { stiffness: 400, damping: 30, mass: 1 },
  slow: { stiffness: 50, damping: 20, mass: 1 },
};

const VELOCITY_THRESHOLD = 0.001;
const DISPLACEMENT_THRESHOLD = 0.001;
const MAX_SIMULATION_STEPS = 1200;
const FIXED_DT = 1 / 120;

export function resolveSpringConfig(input?: SpringPreset | Partial<SpringConfig>): SpringConfig {
  if (!input) return PRESETS.default;
  if (typeof input === 'string') return PRESETS[input] ?? PRESETS.default;
  return { ...PRESETS.default, ...input };
}

function isAtRest(value: number, velocity: number, target: number): boolean {
  return (
    Math.abs(velocity) < VELOCITY_THRESHOLD &&
    Math.abs(value - target) < DISPLACEMENT_THRESHOLD
  );
}

export interface GenerateOptions {
  maxDuration?: number;
}

export function generateSpringKeyframes(
  from: number,
  to: number,
  config: SpringConfig,
  options?: GenerateOptions,
): { keyframes: number[]; duration: number } {
  const { stiffness, damping, mass } = config;
  const maxSteps = options?.maxDuration
    ? Math.min(MAX_SIMULATION_STEPS, Math.ceil((options.maxDuration / 1000) / FIXED_DT))
    : MAX_SIMULATION_STEPS;

  let value = from;
  let velocity = 0;
  const positions: number[] = [from];
  let steps = 0;

  while (steps < maxSteps) {
    if (isAtRest(value, velocity, to)) {
      positions.push(to);
      break;
    }

    const displacement = value - to;
    const springForce = -stiffness * displacement;
    const dampingForce = -damping * velocity;
    const acceleration = (springForce + dampingForce) / mass;

    velocity += acceleration * FIXED_DT;
    value += velocity * FIXED_DT;
    positions.push(value);
    steps++;
  }

  if (steps >= maxSteps) {
    positions.push(to);
  }

  const duration = steps * FIXED_DT * 1000;
  return { keyframes: positions, duration };
}

export interface WAAPIKeyframeOptions {
  maxDuration?: number;
}

function getSlideDirection(position: Position): { prop: 'X' | 'Y'; sign: 1 | -1 } {
  if (position.includes('top')) return { prop: 'Y', sign: -1 };
  if (position.includes('bottom')) return { prop: 'Y', sign: 1 };
  if (position.includes('left')) return { prop: 'X', sign: -1 };
  if (position.includes('right')) return { prop: 'X', sign: 1 };
  return { prop: 'Y', sign: -1 };
}

function buildKeyframes(
  positions: number[],
  variant: AnimationVariant,
  position: Position,
): Keyframe[] {
  const { prop, sign } = getSlideDirection(position);

  return positions.map((pos, i) => {
    const offset = i / (positions.length - 1);

    switch (variant) {
      case 'fade':
        return { opacity: String(pos), offset } as Keyframe;

      case 'scale':
        return {
          transform: `scale(${0.9 + 0.1 * pos})`,
          opacity: String(pos),
          offset,
        } as Keyframe;

      case 'slide-top':
      case 'slide-bottom':
      case 'slide-left':
      case 'slide-right':
        return {
          transform: `${prop === 'X' ? 'translateX' : 'translateY'}(${(1 - pos) * sign * 100}%)`,
          opacity: String(pos),
          offset,
        } as Keyframe;

      default:
        return { opacity: String(pos), offset } as Keyframe;
    }
  });
}

export function springToWAAPIKeyframes(
  fromValue: number,
  toValue: number,
  property: 'opacity' | 'transform',
  config: SpringConfig,
  options?: WAAPIKeyframeOptions & { variant?: AnimationVariant; position?: Position },
): { keyframes: Keyframe[]; duration: number } {
  const { keyframes: rawPositions, duration } = generateSpringKeyframes(fromValue, toValue, config, options);

  if (property === 'opacity') {
    const keyframes = rawPositions.map((pos, i) => ({
      opacity: String(pos),
      offset: i / (rawPositions.length - 1),
    })) as Keyframe[];
    return { keyframes, duration };
  }

  const variant = options?.variant ?? 'slide-top';
  const position = options?.position ?? 'top-right';
  return { keyframes: buildKeyframes(rawPositions, variant, position), duration };
}
