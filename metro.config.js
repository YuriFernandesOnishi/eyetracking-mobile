const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// The native face-landmarker frame-processor plugin lives in a local
// "file:" package (packages/vision-camera-face-landmarker) rather than in
// node_modules proper. Metro ignores TypeScript inside node_modules by
// default, so we explicitly watch that folder and stop it from being
// excluded from the Babel transform.
const localPackagePath = path.resolve(__dirname, 'packages/vision-camera-face-landmarker');

config.watchFolders = [...(config.watchFolders ?? []), localPackagePath];
// node_modules/vision-camera-face-landmarker is a symlink to packages/vision-camera-face-landmarker
// (npm "file:" dependency) -- make sure Metro follows it instead of treating it as opaque.
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
