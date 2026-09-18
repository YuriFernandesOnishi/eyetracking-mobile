import { GazeFeatures } from './types';

/**
 * Contract with the native frame-processor plugin (see
 * packages/vision-camera-face-landmarker). All coordinates are normalized
 * (0..1) relative to the camera frame, as returned by MediaPipe FaceLandmarker.
 * Indices below are provisional — cross-check against the real MediaPipe
 * landmark map (iris landmarks ~468-477) before wiring up the native side.
 */
export const RAW_VECTOR_LENGTH = 18;

const enum RawIndex {
  FaceFound = 0,
  RightIrisX = 1,
  RightIrisY = 2,
  LeftIrisX = 3,
  LeftIrisY = 4,
  RightEyeOuterX = 5,
  RightEyeOuterY = 6,
  RightEyeInnerX = 7,
  RightEyeInnerY = 8,
  LeftEyeOuterX = 9,
  LeftEyeOuterY = 10,
  LeftEyeInnerX = 11,
  LeftEyeInnerY = 12,
  RightEyeUpperY = 13,
  RightEyeLowerY = 14,
  LeftEyeUpperY = 15,
  LeftEyeLowerY = 16,
  InterPupillaryDistance = 17,
}

function safeRatio(numerator: number, denominator: number): number {
  if (Math.abs(denominator) < 1e-6) return 0.5;
  return numerator / denominator;
}

/**
 * Converts the raw landmark vector from the native plugin into normalized
 * per-eye gaze ratios, averaged into a single (fx, fy) feature plus a head
 * offset proxy. Returns null when no face was found in the frame.
 */
export function extractFeatures(raw: readonly number[]): GazeFeatures | null {
  if (raw.length < RAW_VECTOR_LENGTH || raw[RawIndex.FaceFound] === 0) {
    return null;
  }

  const rightRatioX = safeRatio(
    raw[RawIndex.RightIrisX] - raw[RawIndex.RightEyeInnerX],
    raw[RawIndex.RightEyeOuterX] - raw[RawIndex.RightEyeInnerX]
  );
  const leftRatioX = safeRatio(
    raw[RawIndex.LeftIrisX] - raw[RawIndex.LeftEyeOuterX],
    raw[RawIndex.LeftEyeInnerX] - raw[RawIndex.LeftEyeOuterX]
  );
  const rightRatioY = safeRatio(
    raw[RawIndex.RightIrisY] - raw[RawIndex.RightEyeUpperY],
    raw[RawIndex.RightEyeLowerY] - raw[RawIndex.RightEyeUpperY]
  );
  const leftRatioY = safeRatio(
    raw[RawIndex.LeftIrisY] - raw[RawIndex.LeftEyeUpperY],
    raw[RawIndex.LeftEyeLowerY] - raw[RawIndex.LeftEyeUpperY]
  );

  const fx = (rightRatioX + leftRatioX) / 2;
  const fy = (rightRatioY + leftRatioY) / 2;

  const headOffsetX = (raw[RawIndex.RightIrisX] + raw[RawIndex.LeftIrisX]) / 2 - 0.5;
  const headOffsetY = (raw[RawIndex.RightIrisY] + raw[RawIndex.LeftIrisY]) / 2 - 0.5;

  return {
    fx,
    fy,
    headOffsetX,
    headOffsetY,
    interPupillaryDistance: raw[RawIndex.InterPupillaryDistance],
  };
}
