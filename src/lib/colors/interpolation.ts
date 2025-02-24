export function lerp3(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function bspline3(a: number, b: number, t: number): number {
  return (
    (1.0 / 6.0) *
    ((2 - t) * (2 - t) * (2 - t) * a +
      (3 * t * t * t - 6 * t * t + 4) * b +
      (-3 * t * t * t + 3 * t * t + 3 * t + 1) * a +
      t * t * t * b)
  );
}
