import { Application, PointData } from "pixi.js";

export function lerp3(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerp5(
  yin: number,
  yout: number,
  xin: number,
  x: number,
  xout: number
) {
  return yout + ((yin - yout) * (x - xout)) / (xin - xout);
}

export function approxTo(num: number, target: number, tolerance: number) {
  return Math.abs(num - target) < tolerance ? target : num;
}

export function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random(); // Converting [0,1) to (0,1]
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function USED(...args: any[]) {
  args;
}

/* Assumes the position is in the center of the object */
export function inScreen(
  position: PointData,
  app: Application,
  threshold = { width: 0, height: 0 },
  padding = 0.1
) {
  const screenPaddingWidth = app.screen.width * padding,
    screenPaddingHeight = app.screen.height * padding;
  return (
    position.x - threshold.width / 2 >= -screenPaddingWidth &&
    position.x + threshold.width / 2 <= app.screen.width + screenPaddingWidth &&
    position.y - threshold.height / 2 >= -screenPaddingHeight &&
    position.y + threshold.height / 2 <= app.screen.height + screenPaddingHeight
  );
}

export function crossScreen(
  positionA: PointData,
  positionB: PointData,
  app: Application,
  padding = 0.25
) {
  const screenWidth = app.screen.width * (1 + padding),
    screenHeight = app.screen.height * (1 + padding);
  const lrCross =
    (positionA.x < 0 && positionB.x > screenWidth) ||
    (positionB.x < 0 && positionA.x > screenWidth);
  const tbCross =
    (positionA.y < 0 && positionB.y > screenHeight) ||
    (positionB.y < 0 && positionA.y > screenHeight);
  const tlCross = // top to left
    positionA.y < 0 &&
    positionA.x < 0 &&
    positionB.y > screenHeight &&
    positionB.x > screenWidth;
  const trCross = // top to right
    positionA.y < 0 &&
    positionA.x > screenWidth &&
    positionB.y > screenHeight &&
    positionB.x < 0;
  const blCross = // bottom to left
    positionA.y > screenHeight &&
    positionA.x < 0 &&
    positionB.y < 0 &&
    positionB.x > screenWidth;
  const brCross = // bottom to right
    positionA.y > screenHeight &&
    positionA.x > screenWidth &&
    positionB.y < 0 &&
    positionB.x < 0;
  return lrCross || tbCross || tlCross || trCross || blCross || brCross;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
