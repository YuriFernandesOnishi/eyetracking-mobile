import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GazeFeatures } from '../gaze/types';

export interface HiddenCameraCaptureProps {
  enabled: boolean;
  onFeatures: (features: GazeFeatures | null) => void;
  onPermissionDenied?: () => void;
}

/**
 * Web has no real camera/gaze pipeline. This mock stands in for it so the
 * rest of the app (calibration, session, heatmap) can be exercised end to
 * end in a browser: mouse position is treated AS the raw eye ratio, i.e.
 * "looking" = pointing the mouse there. This runs the exact same
 * extractFeatures -> calibration -> predict pipeline as Android, just fed
 * synthetic input -- it does not validate real camera accuracy.
 */
export function HiddenCameraCapture({ enabled, onFeatures }: HiddenCameraCaptureProps) {
  const lastFeaturesRef = useRef<GazeFeatures | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleMove = (event: MouseEvent) => {
      const fx = event.clientX / window.innerWidth;
      const fy = event.clientY / window.innerHeight;
      const features: GazeFeatures = {
        fx,
        fy,
        headOffsetX: 0,
        headOffsetY: 0,
        interPupillaryDistance: 0.06,
      };
      lastFeaturesRef.current = features;
      onFeatures(features);
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [enabled, onFeatures]);

  if (!enabled) return null;

  return (
    <View style={[styles.badge, { pointerEvents: 'none' }]}>
      <Text style={styles.badgeText}>modo simulado (mouse) — sem câmera real no web</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1000,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
  },
});
