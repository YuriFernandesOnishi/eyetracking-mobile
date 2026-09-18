import { ScreenPoint } from './types';

/**
 * Exponential moving average smoother for reducing frame-to-frame jitter in
 * predicted gaze points. When a frame has no face detected, the last
 * smoothed point is held (returned as-is) rather than snapping to null.
 */
export function createEmaSmoother(alpha = 0.25) {
  let previous: ScreenPoint | null = null;

  return (point: ScreenPoint | null): ScreenPoint | null => {
    if (!point) return previous;
    previous = previous
      ? { x: alpha * point.x + (1 - alpha) * previous.x, y: alpha * point.y + (1 - alpha) * previous.y }
      : point;
    return previous;
  };
}
