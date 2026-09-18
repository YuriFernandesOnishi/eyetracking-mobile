import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CalibrationModel, GazePoint } from '../gaze/types';
import { TUNING } from '../gaze/tuning';

export interface SelectedImage {
  uri: string;
  width: number;
  height: number;
}

interface SessionContextValue {
  selectedImage: SelectedImage | null;
  setSelectedImage: (image: SelectedImage | null) => void;
  calibrationModel: CalibrationModel | null;
  setCalibrationModel: (model: CalibrationModel | null) => void;
  sessionDurationSec: number;
  setSessionDurationSec: (seconds: number) => void;
  gazePoints: GazePoint[];
  setGazePoints: (points: GazePoint[]) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [calibrationModel, setCalibrationModel] = useState<CalibrationModel | null>(null);
  const [sessionDurationSec, setSessionDurationSec] = useState<number>(TUNING.defaultSessionDurationSec);
  const [gazePoints, setGazePoints] = useState<GazePoint[]>([]);

  const value = useMemo<SessionContextValue>(
    () => ({
      selectedImage,
      setSelectedImage,
      calibrationModel,
      setCalibrationModel,
      sessionDurationSec,
      setSessionDurationSec,
      gazePoints,
      setGazePoints,
    }),
    [selectedImage, calibrationModel, sessionDurationSec, gazePoints]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}

/** Mutable accumulator ref for gaze points collected during a live session, avoiding a re-render per sample. */
export function useGazePointAccumulator() {
  const pointsRef = useRef<GazePoint[]>([]);

  const push = useCallback((point: GazePoint) => {
    pointsRef.current.push(point);
  }, []);

  const reset = useCallback(() => {
    pointsRef.current = [];
  }, []);

  const flush = useCallback(() => pointsRef.current.slice(), []);

  return { push, reset, flush };
}
