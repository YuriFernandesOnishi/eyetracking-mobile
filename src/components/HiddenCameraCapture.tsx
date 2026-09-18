// Metro always prefers HiddenCameraCapture.native.tsx (iOS/Android) or
// HiddenCameraCapture.web.tsx over this file when bundling, since it has
// its own platform-specific resolution independent of tsconfig. This
// plain-extension file exists only so that plain `tsc`/editors (which
// don't know about the RN platform-suffix convention) have a single
// resolvable module for the bare `./HiddenCameraCapture` import -- it
// re-exports the native implementation since Android is this project's
// only shipped target.
export * from './HiddenCameraCapture.native';
