import { createEmaSmoother } from '../smoothing';

describe('createEmaSmoother', () => {
  it('returns the first point as-is', () => {
    const smoother = createEmaSmoother(0.25);
    const result = smoother({ x: 10, y: 20 });
    expect(result).toEqual({ x: 10, y: 20 });
  });

  it('converges towards a constant input over repeated calls', () => {
    const smoother = createEmaSmoother(0.3);
    let result = smoother({ x: 0, y: 0 });
    for (let i = 0; i < 50; i++) {
      result = smoother({ x: 100, y: 100 });
    }
    expect(result!.x).toBeCloseTo(100, 1);
    expect(result!.y).toBeCloseTo(100, 1);
  });

  it('holds the last smoothed point when given null (no face detected)', () => {
    const smoother = createEmaSmoother(0.5);
    smoother({ x: 5, y: 5 });
    const held = smoother(null);
    expect(held).toEqual({ x: 5, y: 5 });
  });

  it('returns null when no point has ever been observed', () => {
    const smoother = createEmaSmoother(0.5);
    expect(smoother(null)).toBeNull();
  });
});
