import { ridgeLeastSquares } from './linearAlgebra';
import { CalibrationModel, CalibrationSample, GazeFeatures, ScreenPoint } from './types';

/**
 * Polynomial feature expansion used for both the X and Y regressions:
 * [1, fx, fy, fx^2, fy^2, fx*fy, headOffsetX, headOffsetY]
 */
function designRow(f: GazeFeatures): number[] {
  return [1, f.fx, f.fy, f.fx * f.fx, f.fy * f.fy, f.fx * f.fy, f.headOffsetX, f.headOffsetY];
}

export function predict(coeffs: number[], f: GazeFeatures): number {
  const row = designRow(f);
  let sum = 0;
  for (let i = 0; i < row.length; i++) sum += row[i] * coeffs[i];
  return sum;
}

export function predictPoint(model: CalibrationModel, f: GazeFeatures): ScreenPoint {
  return { x: predict(model.coeffsX, f), y: predict(model.coeffsY, f) };
}

/**
 * Rejects samples whose feature is far from the median for its target point,
 * using a median-absolute-deviation threshold. Groups samples by target so
 * outliers are judged against the point they were collected for.
 */
export function rejectOutliers(samples: CalibrationSample[], madThreshold = 2.5): CalibrationSample[] {
  const groups = new Map<string, CalibrationSample[]>();
  for (const sample of samples) {
    const key = `${sample.target.x.toFixed(4)},${sample.target.y.toFixed(4)}`;
    const group = groups.get(key) ?? [];
    group.push(sample);
    groups.set(key, group);
  }

  const kept: CalibrationSample[] = [];
  for (const group of groups.values()) {
    if (group.length < 4) {
      kept.push(...group);
      continue;
    }
    const fxs = group.map((s) => s.features.fx).sort((a, b) => a - b);
    const fys = group.map((s) => s.features.fy).sort((a, b) => a - b);
    const medianFx = median(fxs);
    const medianFy = median(fys);
    const madFx = median(fxs.map((v) => Math.abs(v - medianFx)).sort((a, b) => a - b)) || 1e-6;
    const madFy = median(fys.map((v) => Math.abs(v - medianFy)).sort((a, b) => a - b)) || 1e-6;

    for (const sample of group) {
      const withinX = Math.abs(sample.features.fx - medianFx) / madFx <= madThreshold;
      const withinY = Math.abs(sample.features.fy - medianFy) / madFy <= madThreshold;
      if (withinX && withinY) kept.push(sample);
    }
  }
  return kept;
}

function median(sortedValues: number[]): number {
  const n = sortedValues.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 === 0 ? (sortedValues[mid - 1] + sortedValues[mid]) / 2 : sortedValues[mid];
}

export function fitCalibrationModel(rawSamples: CalibrationSample[]): CalibrationModel {
  const samples = rejectOutliers(rawSamples);
  if (samples.length < 8) {
    throw new Error('Not enough calibration samples after outlier rejection to fit a model');
  }

  const designMatrix = samples.map((s) => designRow(s.features));
  const targetsX = samples.map((s) => s.target.x);
  const targetsY = samples.map((s) => s.target.y);

  const coeffsX = ridgeLeastSquares(designMatrix, targetsX);
  const coeffsY = ridgeLeastSquares(designMatrix, targetsY);

  let squaredError = 0;
  for (const sample of samples) {
    const predicted = { x: predict(coeffsX, sample.features), y: predict(coeffsY, sample.features) };
    squaredError += (predicted.x - sample.target.x) ** 2 + (predicted.y - sample.target.y) ** 2;
  }
  const rmse = Math.sqrt(squaredError / samples.length);

  return { coeffsX, coeffsY, rmse, sampleCount: samples.length };
}
