const { withSettingsGradle, withAppBuildGradle, withMainApplication } = require('@expo/config-plugins');

/**
 * Nitro Modules aren't discovered by React Native's classic autolinking
 * (it looks for a `ReactPackage` class, which Nitro modules don't have --
 * confirmed on-device: `vision-camera-face-landmarker` was silently
 * missing from `npx expo-modules-autolinking react-native-config`'s
 * dependency list, and the app crashed at runtime with "FaceLandmarkerPlugin
 * ... has not yet been registered"). So the local Nitro module's Gradle
 * project has to be wired in by hand, same as any manually-included
 * Android library.
 */
module.exports = function withFaceLandmarkerNative(config) {
  config = withSettingsGradle(config, (config) => {
    if (!config.modResults.contents.includes("':vision-camera-face-landmarker'")) {
      config.modResults.contents += `
include ':vision-camera-face-landmarker'
project(':vision-camera-face-landmarker').projectDir = new File(rootProject.projectDir, '../node_modules/vision-camera-face-landmarker/android')
`;
    }
    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes("project(':vision-camera-face-landmarker')")) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n    implementation project(':vision-camera-face-landmarker')`
      );
    }
    return config;
  });

  // Nitro modules have no ReactPackage, so nothing else ever calls their
  // generated OnLoad.initializeNative() -- confirmed on-device: without
  // this, the native lib never loads and the HybridObject is never
  // registered, throwing at runtime on first use.
  config = withMainApplication(config, (config) => {
    if (!config.modResults.contents.includes('FaceLandmarkerOnLoad')) {
      config.modResults.contents = config.modResults.contents
        .replace(
          /import expo\.modules\.ExpoReactHostFactory/,
          `import expo.modules.ExpoReactHostFactory\n\nimport com.margelo.nitro.facelandmarker.FaceLandmarkerOnLoad`
        )
        .replace(
          /loadReactNative\(this\)/,
          `loadReactNative(this)\n    FaceLandmarkerOnLoad.initializeNative()`
        );
    }
    return config;
  });

  return config;
};
