import { computeContainRect, mapImageSpaceToScreenPoint, mapScreenPointToImageSpace } from '../coordinateMapping';

describe('computeContainRect', () => {
  it('letterboxes top/bottom when the image is wider than the container', () => {
    const rect = computeContainRect(300, 300, 400, 200);
    expect(rect.renderedWidth).toBeCloseTo(300);
    expect(rect.renderedHeight).toBeCloseTo(150);
    expect(rect.offsetX).toBeCloseTo(0);
    expect(rect.offsetY).toBeCloseTo(75);
  });

  it('letterboxes left/right when the image is taller than the container', () => {
    const rect = computeContainRect(300, 300, 200, 400);
    expect(rect.renderedWidth).toBeCloseTo(150);
    expect(rect.renderedHeight).toBeCloseTo(300);
    expect(rect.offsetX).toBeCloseTo(75);
    expect(rect.offsetY).toBeCloseTo(0);
  });
});

describe('mapScreenPointToImageSpace', () => {
  const rect = computeContainRect(300, 300, 400, 200); // renderedW=300 renderedH=150, offsetY=75

  it('maps a point inside the rendered image to normalized 0..1 coords', () => {
    const result = mapScreenPointToImageSpace({ x: 150, y: 150 }, rect);
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(0.5);
    expect(result!.y).toBeCloseTo(0.5);
  });

  it('maps the top-left corner of the rendered image to (0, 0)', () => {
    const result = mapScreenPointToImageSpace({ x: 0, y: 75 }, rect);
    expect(result!.x).toBeCloseTo(0);
    expect(result!.y).toBeCloseTo(0);
  });

  it('returns null for a point on the letterbox bar', () => {
    const result = mapScreenPointToImageSpace({ x: 150, y: 10 }, rect);
    expect(result).toBeNull();
  });

  it('round-trips through mapImageSpaceToScreenPoint', () => {
    const imagePoint = { x: 0.25, y: 0.75 };
    const screenPoint = mapImageSpaceToScreenPoint(imagePoint, rect);
    const back = mapScreenPointToImageSpace(screenPoint, rect);
    expect(back!.x).toBeCloseTo(imagePoint.x);
    expect(back!.y).toBeCloseTo(imagePoint.y);
  });
});
