export interface GazeFeatures {
  fx: number;
  fy: number;
  headOffsetX: number;
  headOffsetY: number;
  interPupillaryDistance: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface CalibrationSample {
  features: GazeFeatures;
  target: ScreenPoint;
}

export interface CalibrationModel {
  coeffsX: number[];
  coeffsY: number[];
  rmse: number;
  sampleCount: number;
}

export interface GazePoint extends ScreenPoint {
  timestamp: number;
}
