import React from 'react';
import { StyleSheet, View } from 'react-native';

interface CalibrationDotProps {
  xPercent: number;
  yPercent: number;
  /** 0..1 — grows the filled center as samples are collected for this point. */
  progress: number;
}

const DOT_SIZE = 32;

export function CalibrationDot({ xPercent, yPercent, progress }: CalibrationDotProps) {
  const scale = Math.max(0.2, Math.min(1, progress));
  return (
    <View style={[styles.container, { left: `${xPercent}%`, top: `${yPercent}%` }]}>
      <View style={styles.ring} />
      <View style={[styles.fill, { transform: [{ scale }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    marginLeft: -DOT_SIZE / 2,
    marginTop: -DOT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
    borderColor: '#ff3b30',
  },
  fill: {
    width: DOT_SIZE * 0.55,
    height: DOT_SIZE * 0.55,
    borderRadius: DOT_SIZE * 0.28,
    backgroundColor: '#ff3b30',
  },
});
