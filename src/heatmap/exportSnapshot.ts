import type { CanvasRef } from '@shopify/react-native-skia';
import { Directory, File, Paths } from 'expo-file-system';
import type { RefObject } from 'react';

/** Snapshots the heatmap Canvas and writes it as a PNG under the app's cache directory. */
export function saveHeatmapSnapshot(canvasRef: RefObject<CanvasRef | null>): File | null {
  const snapshot = canvasRef.current?.makeImageSnapshot();
  if (!snapshot) return null;

  const bytes = snapshot.encodeToBytes();
  const dir = new Directory(Paths.cache, 'heatmaps');
  if (!dir.exists) dir.create({ intermediates: true });

  const file = new File(dir, `heatmap-${Date.now()}.png`);
  file.write(bytes);
  return file;
}
