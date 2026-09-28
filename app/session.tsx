import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ContainImage } from '../src/components/ContainImage';
import { HiddenCameraCapture } from '../src/components/HiddenCameraCapture';
import { predictPoint } from '../src/gaze/calibration';
import { ContainRect, mapScreenPointToImageSpace } from '../src/gaze/coordinateMapping';
import { createEmaSmoother } from '../src/gaze/smoothing';
import { TUNING } from '../src/gaze/tuning';
import { GazeFeatures, GazePoint } from '../src/gaze/types';
import { useKeepAwakeSafe } from '../src/hooks/useKeepAwakeSafe';
import { useSession } from '../src/state/SessionContext';

/** Live red dot showing the predicted gaze point -- useful to sanity-check tracking during development. */
const DEBUG_SHOW_GAZE_DOT = __DEV__;

export default function SessionScreen() {
  useKeepAwakeSafe();
  const router = useRouter();
  const { selectedImage, calibrationModel, sessionDurationSec, setGazePoints } = useSession();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const rectRef = useRef<ContainRect | null>(null);
  const pointsRef = useRef<GazePoint[]>([]);
  const smootherRef = useRef(createEmaSmoother(TUNING.emaAlpha));
  const finishedRef = useRef(false);
  const debugDotUpdateCounterRef = useRef(0);

  const [debugDot, setDebugDot] = useState<{ x: number; y: number } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(sessionDurationSec);

  const finishSession = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setGazePoints(pointsRef.current.slice());
    router.replace('/results');
  }, [router, setGazePoints]);

  useEffect(() => {
    if (!selectedImage || !calibrationModel) {
      router.replace('/select-image');
    }
  }, [selectedImage, calibrationModel, router]);

  useEffect(() => {
    setSecondsLeft(sessionDurationSec);
    const interval = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionDurationSec]);

  useEffect(() => {
    if (secondsLeft === 0) finishSession();
  }, [secondsLeft, finishSession]);

  const handleFeatures = useCallback(
    (features: GazeFeatures | null) => {
      if (!calibrationModel || !rectRef.current) return;
      const predicted = features ? predictPoint(calibrationModel, features) : null;
      const screenPoint = predicted ? { x: predicted.x * windowWidth, y: predicted.y * windowHeight } : null;
      const smoothed = smootherRef.current(screenPoint);
      if (!smoothed) return;

      if (DEBUG_SHOW_GAZE_DOT) {
        // Throttle the React state update driving the debug dot -- pushing a
        // Fabric commit on every processed frame (~15Hz) crashed natively
        // inside MountingCoordinator::pullTransaction on a low-end/ARM32
        // device (Galaxy J7 Prime 2, Android 9). Gaze-point accumulation
        // above is unaffected and still runs at full rate.
        debugDotUpdateCounterRef.current += 1;
        if (debugDotUpdateCounterRef.current % 4 === 0) setDebugDot(smoothed);
      }

      const imagePoint = mapScreenPointToImageSpace(smoothed, rectRef.current);
      if (imagePoint) {
        pointsRef.current.push({ x: imagePoint.x, y: imagePoint.y, timestamp: Date.now() });
      }
    },
    [calibrationModel, windowWidth, windowHeight]
  );

  if (!selectedImage || !calibrationModel) return null;

  const progress = sessionDurationSec > 0 ? secondsLeft / sessionDurationSec : 0;

  return (
    <View style={styles.container}>
      <HiddenCameraCapture enabled onFeatures={handleFeatures} onPermissionDenied={finishSession} />
      <ContainImage
        uri={selectedImage.uri}
        imageWidth={selectedImage.width}
        imageHeight={selectedImage.height}
        onLayoutRect={(rect) => {
          rectRef.current = rect;
        }}
      />
      {DEBUG_SHOW_GAZE_DOT && debugDot && (
        <View style={[styles.debugDot, { left: debugDot.x - 8, top: debugDot.y - 8, pointerEvents: 'none' }]} />
      )}
      <View style={[styles.progressTrack, { pointerEvents: 'none' }]}>
        <View style={[styles.progressFill, { width: `${Math.max(0, progress) * 100}%` }]} />
      </View>
      <Pressable style={styles.finishButton} onPress={finishSession}>
        <Text style={styles.finishButtonText}>Finalizar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  debugDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,0,0,0.8)',
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#ff3b30',
  },
  finishButton: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    backgroundColor: 'rgba(28,28,30,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});
