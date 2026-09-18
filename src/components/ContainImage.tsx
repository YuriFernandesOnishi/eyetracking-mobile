import { Image } from 'expo-image';
import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { ContainRect, computeContainRect } from '../gaze/coordinateMapping';

interface ContainImageProps {
  uri: string;
  imageWidth: number;
  imageHeight: number;
  onLayoutRect?: (rect: ContainRect) => void;
  children?: React.ReactNode;
}

/** Renders an image with resizeMode="contain" and reports the resulting letterboxed rect so callers can map gaze/heatmap points into it. */
export function ContainImage({ uri, imageWidth, imageHeight, onLayoutRect, children }: ContainImageProps) {
  const [hasLayout, setHasLayout] = useState(false);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setHasLayout(true);
      onLayoutRect?.(computeContainRect(width, height, imageWidth, imageHeight));
    },
    [imageWidth, imageHeight, onLayoutRect]
  );

  return (
    <View style={StyleSheet.absoluteFill} onLayout={handleLayout}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="contain" />
      {hasLayout && children}
    </View>
  );
}
