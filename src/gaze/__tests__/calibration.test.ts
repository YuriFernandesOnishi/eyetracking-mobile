import { fitCalibrationModel, predictPoint, rejectOutliers } from '../calibration';
import { CalibrationSample, GazeFeatures } from '../types';

// Seeded PRNG (mulberry32) so the synthetic dataset is reproducible.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Known ground-truth mapping from (fx, fy) features to normalized screen coords. */
function trueScreenX(fx: number, fy: number): number {
  return 0.05 + 0.9 * fx + 0.02 * fy + 0.01 * fx * fy;
}
function trueScreenY(fx: number, fy: number): number {
  return 0.03 + 0.05 * fx + 0.92 * fy - 0.01 * fx * fy;
}

function buildSyntheticSamples(samplesPerPoint: number, noise: number): CalibrationSample[] {
  const rand = mulberry32(42);
  const grid = [0.1, 0.5, 0.9];
  const samples: CalibrationSample[] = [];

  for (const baseFx of grid) {
    for (const baseFy of grid) {
      const target = { x: trueScreenX(baseFx, baseFy), y: trueScreenY(baseFx, baseFy) };
      for (let i = 0; i < samplesPerPoint; i++) {
        const features: GazeFeatures = {
          fx: baseFx + (rand() - 0.5) * noise,
          fy: baseFy + (rand() - 0.5) * noise,
          headOffsetX: (rand() - 0.5) * 0.01,
          headOffsetY: (rand() - 0.5) * 0.01,
          interPupillaryDistance: 0.06,
        };
        samples.push({ features, target });
      }
    }
  }
  return samples;
}

describe('fitCalibrationModel', () => {
  it('recovers a known feature->screen mapping from noisy synthetic samples', () => {
    const samples = buildSyntheticSamples(20, 0.02);
    const model = fitCalibrationModel(samples);

    expect(model.sampleCount).toBeGreaterThan(8);
    expect(model.rmse).toBeLessThan(0.02);

    // Predict at a point not exactly on the calibration grid.
    const testFeatures: GazeFeatures = { fx: 0.3, fy: 0.7, headOffsetX: 0, headOffsetY: 0, interPupillaryDistance: 0.06 };
    const predicted = predictPoint(model, testFeatures);
    expect(predicted.x).toBeCloseTo(trueScreenX(0.3, 0.7), 1);
    expect(predicted.y).toBeCloseTo(trueScreenY(0.3, 0.7), 1);
  });

  it('throws when there are too few samples to fit a model', () => {
    const samples = buildSyntheticSamples(1, 0.02).slice(0, 3);
    expect(() => fitCalibrationModel(samples)).toThrow();
  });
});

describe('rejectOutliers', () => {
  it('drops samples whose features are far from the rest of their target group', () => {
    const target = { x: 0.5, y: 0.5 };
    const good: CalibrationSample[] = Array.from({ length: 10 }, (_, i) => ({
      features: { fx: 0.5 + i * 0.001, fy: 0.5, headOffsetX: 0, headOffsetY: 0, interPupillaryDistance: 0.06 },
      target,
    }));
    const outlier: CalibrationSample = {
      features: { fx: 0.99, fy: 0.5, headOffsetX: 0, headOffsetY: 0, interPupillaryDistance: 0.06 },
      target,
    };

    const kept = rejectOutliers([...good, outlier]);
    expect(kept.length).toBe(good.length);
    expect(kept.some((s) => s.features.fx === 0.99)).toBe(false);
  });
});
