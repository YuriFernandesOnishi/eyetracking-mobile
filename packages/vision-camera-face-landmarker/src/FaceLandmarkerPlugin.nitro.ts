import type { HybridObject } from 'react-native-nitro-modules';
import type { Frame } from 'react-native-vision-camera';

/**
 * Native frame-processor plugin: runs MediaPipe FaceLandmarker (with iris
 * landmarks) on a camera Frame and returns a flat numeric vector.
 *
 * The vector layout is the contract consumed by
 * src/gaze/featureExtraction.ts#extractFeatures — keep both in sync:
 * [faceFound, rightIrisX, rightIrisY, leftIrisX, leftIrisY,
 *  rightEyeOuterX, rightEyeOuterY, rightEyeInnerX, rightEyeInnerY,
 *  leftEyeOuterX, leftEyeOuterY, leftEyeInnerX, leftEyeInnerY,
 *  rightEyeUpperY, rightEyeLowerY, leftEyeUpperY, leftEyeLowerY,
 *  interPupillaryDistance]
 * All coordinates normalized 0..1 relative to the frame.
 */
export interface FaceLandmarkerPlugin
  extends HybridObject<{
    android: 'kotlin';
  }> {
  detect(frame: Frame): number[];
}
