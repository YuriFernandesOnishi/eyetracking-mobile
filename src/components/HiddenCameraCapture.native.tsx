import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Frame } from 'react-native-vision-camera';
import { useCamera, useCameraDevice, useCameraPermission, useFrameOutput } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-worklets';
import { getFaceLandmarkerPlugin } from 'vision-camera-face-landmarker';
import { extractFeatures } from '../gaze/featureExtraction';
import { TUNING } from '../gaze/tuning';
import { GazeFeatures } from '../gaze/types';

export interface HiddenCameraCaptureProps {
  enabled: boolean;
  onFeatures: (features: GazeFeatures | null) => void;
  onPermissionDenied?: () => void;
}

/**
 * Mounts the front camera + our MediaPipe frame-processor plugin with no
 * visible preview (useCamera/useFrameOutput don't require any rendered
 * view to actually run the capture session -- see
 * packages/vision-camera-face-landmarker). UNVERIFIED end-to-end: this
 * could not be run on a real Android device in this environment. The
 * frame-throttle counter below relies on the frame-processor worklet
 * closure persisting its own copy of `throttleCounterRef` across calls on
 * the camera thread -- a common pattern in the VisionCamera community, but
 * confirm it actually throttles (rather than resetting every frame) once
 * this runs on-device.
 */
export function HiddenCameraCapture({ enabled, onFeatures, onPermissionDenied }: HiddenCameraCaptureProps) {
  const { hasPermission, requestPermission, canRequestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const throttleCounterRef = useRef(0);
  // Create the HybridObject once on the main JS thread -- calling the
  // factory (NitroModules.createHybridObject, inside
  // getFaceLandmarkerPlugin) from within the worklet itself throws
  // "[Worklets] Tried to synchronously call a Remote Function" (confirmed
  // on-device). Only the resulting instance's own methods (plugin.detect)
  // are safe to call synchronously from the frame-processor thread.
  const plugin = useMemo(() => getFaceLandmarkerPlugin(), []);

  useEffect(() => {
    if (!enabled || hasPermission) return;
    if (canRequestPermission) {
      requestPermission().then((granted) => {
        if (!granted) onPermissionDenied?.();
      });
    } else {
      onPermissionDenied?.();
    }
  }, [enabled, hasPermission, canRequestPermission, requestPermission, onPermissionDenied]);

  const handleRawVector = useCallback(
    (raw: number[]) => {
      onFeatures(extractFeatures(raw));
    },
    [onFeatures]
  );

  const onFrame = useCallback(
    (frame: Frame) => {
      'worklet';
      throttleCounterRef.current += 1;
      if (throttleCounterRef.current % TUNING.frameProcessorThrottle !== 0) {
        frame.dispose();
        return;
      }
      const raw = plugin.detect(frame);
      frame.dispose();
      runOnJS(handleRawVector)(raw);
    },
    [handleRawVector, plugin]
  );

  // 'native' (PRIVATE/GPU format) isn't supported for ImageAnalysis on
  // some devices (confirmed failing on a Galaxy J7 Prime 2 / Android 9)
  // -- 'yuv' (YUV_420_888) is universally supported and is what
  // GazeLandmarkerCore.detect() expects via MediaImageBuilder anyway.
  const frameOutput = useFrameOutput({ pixelFormat: 'yuv', onFrame });

  useCamera({
    isActive: enabled && hasPermission && device != null,
    device: device ?? 'front',
    outputs: device != null ? [frameOutput] : [],
  });

  // No visible UI: the camera runs fully in the background.
  return null;
}
