import { Easing } from 'react-native-reanimated';

/**
 * Motion language: fluid but never bouncy. Springs are critically damped (dampingRatio 1):
 * they accelerate and settle naturally but never overshoot, so nothing wobbles. Eased
 * timings use a long, soft deceleration so movement glides into place instead of stopping.
 */
export const motion = {
  /** Glides in fast and settles slowly (easeOutQuint-like). For things arriving. */
  settle: Easing.bezier(0.22, 1, 0.36, 1),
  /** Smooth start and finish. For things travelling between two places. */
  travel: Easing.bezier(0.45, 0, 0.2, 1),
  /** Critically damped spring presets (no overshoot). */
  spring: {
    press: { dampingRatio: 1, duration: 180 },
    release: { dampingRatio: 1, duration: 320 },
    lift: { dampingRatio: 1, duration: 340 },
  },
  duration: {
    fade: 260,
    modal: 320,
    screen: 300,
  },
} as const;
