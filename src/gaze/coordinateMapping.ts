import { ScreenPoint } from './types';

export interface ContainRect {
  offsetX: number;
  offsetY: number;
  renderedWidth: number;
  renderedHeight: number;
}

/**
 * Computes the rect an image occupies inside a container when displayed with
 * resizeMode="contain" (letterboxed, centered, aspect-ratio preserved).
 */
export function computeContainRect(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number
): ContainRect {
  const scale = Math.min(containerWidth / imageWidth, containerHeight / imageHeight);
  const renderedWidth = imageWidth * scale;
  const renderedHeight = imageHeight * scale;
  return {
    offsetX: (containerWidth - renderedWidth) / 2,
    offsetY: (containerHeight - renderedHeight) / 2,
    renderedWidth,
    renderedHeight,
  };
}

/**
 * Maps a point in screen/container coordinates into normalized (0..1) image
 * content coordinates. Returns null when the point falls outside the
 * rendered image (i.e. it landed on the letterbox bars).
 */
export function mapScreenPointToImageSpace(screenPoint: ScreenPoint, rect: ContainRect): ScreenPoint | null {
  const nx = (screenPoint.x - rect.offsetX) / rect.renderedWidth;
  const ny = (screenPoint.y - rect.offsetY) / rect.renderedHeight;
  if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return null;
  return { x: nx, y: ny };
}

/** Inverse of mapScreenPointToImageSpace: normalized image coords -> screen coords. */
export function mapImageSpaceToScreenPoint(imagePoint: ScreenPoint, rect: ContainRect): ScreenPoint {
  return {
    x: rect.offsetX + imagePoint.x * rect.renderedWidth,
    y: rect.offsetY + imagePoint.y * rect.renderedHeight,
  };
}
