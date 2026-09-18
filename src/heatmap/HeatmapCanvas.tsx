import { Canvas, CanvasRef, Circle, Group, Image, RadialGradient, useImage, vec } from '@shopify/react-native-skia';
import React, { RefObject } from 'react';
import { ContainRect, mapImageSpaceToScreenPoint } from '../gaze/coordinateMapping';
import { TUNING } from '../gaze/tuning';
import { GazePoint } from '../gaze/types';

interface HeatmapCanvasProps {
  uri: string;
  rect: ContainRect;
  /** Gaze points in normalized (0..1) image-content coordinates. */
  points: GazePoint[];
  width: number;
  height: number;
  canvasRef?: RefObject<CanvasRef | null>;
}

/**
 * Base image + an additive "heat" layer: each gaze point draws a soft
 * radial blob, overlapping blobs brighten (blendMode="plus"), and the
 * whole heat layer is composited over the image at partial opacity so the
 * original image stays visible underneath. This is the same core idea as
 * heatmap.js's density accumulation, simplified to skip the
 * grayscale-then-color-LUT indirection (see plan's "v1 simples").
 */
export function HeatmapCanvas({ uri, rect, points, width, height, canvasRef }: HeatmapCanvasProps) {
  const image = useImage(uri);
  if (!image) return null;

  const radiusPx = TUNING.heatmapPointRadius * Math.min(rect.renderedWidth, rect.renderedHeight);

  return (
    <Canvas ref={canvasRef} style={{ width, height }}>
      <Image
        image={image}
        x={rect.offsetX}
        y={rect.offsetY}
        width={rect.renderedWidth}
        height={rect.renderedHeight}
        fit="contain"
      />
      <Group opacity={TUNING.heatmapOpacity}>
        <Group blendMode="plus">
          {points.map((point, index) => {
            const screenPoint = mapImageSpaceToScreenPoint(point, rect);
            return (
              <Circle key={index} cx={screenPoint.x} cy={screenPoint.y} r={radiusPx}>
                <RadialGradient
                  c={vec(screenPoint.x, screenPoint.y)}
                  r={radiusPx}
                  colors={['rgba(255,60,0,0.55)', 'rgba(255,60,0,0)']}
                />
              </Circle>
            );
          })}
        </Group>
      </Group>
    </Canvas>
  );
}
