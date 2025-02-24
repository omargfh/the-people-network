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
