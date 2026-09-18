/**
 * Constants meant to be adjusted empirically once tested on a physical
 * Android device (see plan's "Verificação" section). Values below are
 * reasonable starting points, not measured.
 */
export const TUNING = {
  /** Frame processor throttle: only run detection on 1 of every N camera frames. */
  frameProcessorThrottle: 2,
  /** EMA smoothing factor applied to predicted gaze points during a session. */
  emaAlpha: 0.25,
  /** Samples collected per calibration point (post outlier-rejection minimum applies too). */
  calibrationSamplesPerPoint: 20,
  /** Delay after tapping a calibration point before sampling starts, in ms. */
  calibrationSettleDelayMs: 180,
  /** RMSE (normalized 0..1 screen units) above which a "recalibrate?" warning is shown. */
  calibrationRmseWarningThreshold: 0.12,
  /** Default viewing-session duration, in seconds. */
  defaultSessionDurationSec: 20,
  /** Heatmap: radius (in normalized image units) of each accumulated gaze point's blob. */
  heatmapPointRadius: 0.045,
  /** Heatmap: opacity of the color layer composited over the base image. */
  heatmapOpacity: 0.7,
} as const;
