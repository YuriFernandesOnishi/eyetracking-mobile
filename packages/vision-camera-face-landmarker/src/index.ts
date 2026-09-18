import { NitroModules } from 'react-native-nitro-modules';
import type { FaceLandmarkerPlugin } from './FaceLandmarkerPlugin.nitro';

export type { FaceLandmarkerPlugin } from './FaceLandmarkerPlugin.nitro';

let cachedPlugin: FaceLandmarkerPlugin | null = null;

/** Lazily creates (and caches) the native FaceLandmarker HybridObject. Android only. */
export function getFaceLandmarkerPlugin(): FaceLandmarkerPlugin {
  if (!cachedPlugin) {
    cachedPlugin = NitroModules.createHybridObject<FaceLandmarkerPlugin>('FaceLandmarkerPlugin');
  }
  return cachedPlugin;
}
