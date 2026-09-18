import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CalibrationDot } from '../src/components/CalibrationDot';
import { HiddenCameraCapture } from '../src/components/HiddenCameraCapture';
import { fitCalibrationModel } from '../src/gaze/calibration';
import { TUNING } from '../src/gaze/tuning';
import { CalibrationSample, GazeFeatures } from '../src/gaze/types';
import { useKeepAwakeSafe } from '../src/hooks/useKeepAwakeSafe';
import { useSession } from '../src/state/SessionContext';

const GRID_X = [10, 50, 90];
const GRID_Y = [10, 50, 90];
// Center, then corners, then edges -- avoids a predictable left-to-right/top-to-bottom sweep.
const POINT_ORDER = [4, 0, 8, 2, 6, 1, 7, 3, 5];
const SAMPLE_INTERVAL_MS = 1000 / 15;

type Phase = 'idle' | 'sampling';

export default function CalibrationScreen() {
  useKeepAwakeSafe();
  const router = useRouter();
  const { setCalibrationModel } = useSession();

  const points = useMemo(
    () => POINT_ORDER.map((i) => ({ xPercent: GRID_X[i % 3], yPercent: GRID_Y[Math.floor(i / 3)] })),
    []
  );

  const [pointIndex, setPointIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);

  const samplesRef = useRef<CalibrationSample[]>([]);
  const latestFeaturesRef = useRef<GazeFeatures | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const handleFeatures = useCallback((features: GazeFeatures | null) => {
    latestFeaturesRef.current = features;
  }, []);

  const finishCalibration = useCallback(() => {
    try {
      const model = fitCalibrationModel(samplesRef.current);
      setCalibrationModel(model);
      if (model.rmse > TUNING.calibrationRmseWarningThreshold) {
        setWarning('A calibração pode não estar precisa. Deseja repetir?');
      } else {
        router.replace('/session');
      }
    } catch {
      setWarning('Não foi possível calibrar. Tente novamente olhando fixamente para cada ponto.');
    }
  }, [router, setCalibrationModel]);

  const advance = useCallback(() => {
    const next = pointIndex + 1;
    if (next < points.length) {
      setPointIndex(next);
      setPhase('idle');
      setProgress(0);
    } else {
      finishCalibration();
    }
  }, [pointIndex, points.length, finishCalibration]);

  const currentPoint = points[pointIndex];

  const handleTapPoint = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('sampling');

    const target = { x: currentPoint.xPercent / 100, y: currentPoint.yPercent / 100 };
    const settleTimeout = setTimeout(() => {
      let collected = 0;
      intervalRef.current = setInterval(() => {
        const features = latestFeaturesRef.current;
        if (features) {
          samplesRef.current.push({ features, target });
          collected += 1;
          setProgress(collected / TUNING.calibrationSamplesPerPoint);
        }
        if (collected >= TUNING.calibrationSamplesPerPoint) {
          clearTimers();
          const advanceTimeout = setTimeout(advance, 150);
          timeoutsRef.current.push(advanceTimeout);
        }
      }, SAMPLE_INTERVAL_MS);
    }, TUNING.calibrationSettleDelayMs);
    timeoutsRef.current.push(settleTimeout);
  }, [phase, currentPoint, advance, clearTimers]);

  const restart = useCallback(() => {
    clearTimers();
    samplesRef.current = [];
    setPointIndex(0);
    setPhase('idle');
    setProgress(0);
    setWarning(null);
  }, [clearTimers]);

  if (warning) {
    return (
      <View style={styles.center}>
        <Text style={styles.warningText}>{warning}</Text>
        <Pressable style={styles.button} onPress={restart}>
          <Text style={styles.buttonText}>Recalibrar</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.secondaryButton]} onPress={() => router.replace('/session')}>
          <Text style={styles.buttonText}>Continuar assim mesmo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HiddenCameraCapture
        enabled
        onFeatures={handleFeatures}
        onPermissionDenied={() => setWarning('Permissão de câmera negada. Não é possível calibrar.')}
      />
      <Text style={styles.instructions}>
        Olhe fixamente para o ponto vermelho e toque na tela ({pointIndex + 1}/{points.length})
      </Text>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleTapPoint}>
        <CalibrationDot
          xPercent={currentPoint.xPercent}
          yPercent={currentPoint.yPercent}
          progress={phase === 'idle' ? 0.2 : progress}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
  },
  instructions: {
    color: 'white',
    textAlign: 'center',
    marginTop: 48,
    paddingHorizontal: 24,
    fontSize: 15,
  },
  center: {
    flex: 1,
    backgroundColor: '#0b0b0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  warningText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  secondaryButton: {
    backgroundColor: '#3a3a3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
