import { PointData } from "pixi.js";
import { approxTo, lerp3 } from "./util";

export interface IScalable {
  getScale(): number;
  scaleTo(scale: number): void;
}

export interface ITransformable {
  getPosition(): PointData;
  getRotation(): number;
  delta({ x, y }: PointData): void;
  deltaRotation(rotation: number): void;
  moveTo({ x, y }: PointData): void;
  rotateTo(rotation: number): void;
}

export function animatePosition(
  instance: ITransformable,
  target: PointData,
  settings: { speed: number }
) {
  // Move the center node
  const { x, y } = instance.getPosition();
  const x2 = approxTo(lerp3(x, target.x, 0.1), target.x, 0.2 * settings.speed);
  const y2 = approxTo(lerp3(y, target.y, 0.1), target.y, 0.2 * settings.speed);
  instance.moveTo({ x: x2, y: y2 });
  if (x2 === target.x && y2 === target.y) {
    return true;
  }
  return false;
}

export function animateScale(
  instance: IScalable,
  target: number,
  settings: { speed: number }
) {
  // Scale the center node
  const scale = approxTo(
    lerp3(instance.getScale(), target, 0.1 * settings.speed),
    target,
    0.1
  );
  instance.scaleTo(scale);
  if (scale === target) {
    return true;
  }
  return false;
}

export function animateDeltaPosition(
  instance: ITransformable,
  delta: PointData,
  settings: { speed: number }
) {
  // Move the center node
  const { x, y } = instance.getPosition();
  const x2 = approxTo(
    lerp3(x, x + delta.x, 0.1),
    x + delta.x,
    0.2 * settings.speed
  );
  const y2 = approxTo(
    lerp3(y, y + delta.y, 0.1),
    y + delta.y,
    0.2 * settings.speed
  );
  instance.moveTo({ x: x2, y: y2 });
  if (x2 === x + delta.x && y2 === y + delta.y) {
    return true;
  }
  return false;
}
