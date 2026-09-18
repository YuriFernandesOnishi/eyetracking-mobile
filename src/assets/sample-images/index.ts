import { Asset } from 'expo-asset';

export interface SampleImage {
  id: string;
  label: string;
  uri: string;
  width: number;
  height: number;
}

/**
 * Asset.fromModule(...).uri is the cross-platform way to turn a
 * require('./x.png') reference into a real URI string -- unlike
 * RNImage.resolveAssetSource, it also works on web (react-native-web's
 * Image has no resolveAssetSource implementation). All three bundled
 * sample images are known to be 1200x900 (see the ImageMagick commands
 * used to generate them), so width/height are supplied directly.
 */
function resolveSample(id: string, label: string, module: number): SampleImage {
  const uri = Asset.fromModule(module).uri;
  return { id, label, uri, width: 1200, height: 900 };
}

export const SAMPLE_IMAGES: SampleImage[] = [
  resolveSample('shapes', 'Formas', require('./sample-shapes.png')),
  resolveSample('grid', 'Grade', require('./sample-grid.png')),
  resolveSample('portrait', 'Retrato', require('./sample-portrait.png')),
];
