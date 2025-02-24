import { hslToHex, rgbToHSL } from "./hsl";
import { hexToRGB, rgbToHex } from "./rgb";
import { colorsHex } from "./constants";
import { HSLObject, ResolvableToColor, RGBObject } from "./types";
import { normalizeHexString } from "./hex";
import { ColorInterpolationStrategy, ColorSpace } from "./enums";
import { lerp3 } from "./interpolation";
import { createLazyValue } from "./util";

export type Triple<T> = [T, T, T];
export type Lazy<T> = () => T;

export default class Color {
  hex = "#FFFFFF";
  alpha = 1;

  /* ---------------- Internal Utilities ---------------- */
  static normalize(
    value: number | string,
    property: "r" | "g" | "b" | "h" | "s" | "l"
  ): number {
    if (typeof value === "string") {
      return this.normalize(parseFloat(value), property) as number;
    }
    if (value > 0 && value < 1) {
      if (property === "r" || property === "g" || property === "b") {
        return Math.min(Math.max(value * 255, 0), 255);
      } else if (property === "h") {
        return (value * 360) % 360;
      } else if (property === "s" || property === "l") {
        return Math.min(Math.max(value * 100, 0), 100);
      }
    }
    return value;
  }

  /* ---------------- Constructors ---------------- */
  static fromHex(hexString: string) {
    const { hex, alpha } = normalizeHexString(hexString);
    const color = new Color();
    color.hex = hex;
    color.alpha = alpha;
    return color;
  }

  static _fromHexUnsafe(hexString: string, alpha: number = 1) {
    // Internal use only
    const color = new Color();
    color.hex = hexString;
    color.alpha = alpha;
    return color;
  }

  static fromHSL(h: number, s: number, l: number, a: number = 1) {
    const color = new Color();
    color.hex = hslToHex(Math.round(h), Math.round(s), Math.round(l));
    color.alpha = a;
    return color;
  }

  static fromRGB(r: number, g: number, b: number, a: number = 1): Color {
    const color = new Color();
    color.hex = rgbToHex(Math.round(r), Math.round(g), Math.round(b));
    color.alpha = a;
    return color;
  }

  /* ---------------- Random Colors ---------------- */
  static random() {
    const color = new Color();
    color.hex = (
      "#" + Math.floor(Math.random() * 16777215).toString(16)
    ).padEnd(7, "0");
    return color;
  }

  static seededRandom(seed: string) {
    const color = new Color();
    color.hex = (
      "#" +
      Math.floor(Math.abs(Math.sin(seed.charCodeAt(0)) * 16777215)).toString(16)
    ).padEnd(7, "0");
    return color;
  }

  /* ---------------- Resolve colors ---------------- */
  static resolve(input: ResolvableToColor) {
    try {
      if (typeof input === "string") {
        input = input.trim();
        if (input.startsWith("#")) {
          return Color.fromHex(input);
        } else if (input.startsWith("hsla")) {
          const [h, s, l, a] =
            /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/
              .exec(input)
              ?.slice(1)
              .map((x) => parseFloat(x)) || [0, 0, 0, 0];
          return Color.fromHSL(h, s, l, a);
        } else if (input.startsWith("hsl")) {
          const [h, s, l] = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/
            .exec(input)
            ?.slice(1)
            .map((x) => parseFloat(x)) || [0, 0, 0];
          return Color.fromHSL(h, s, l);
        } else if (input.startsWith("rgba")) {
          const [r, g, b, a] = input
            .slice(5, -1)
            .split(",")
            .map((x) => parseFloat(x)) || [0, 0, 0, 0];
          return Color.fromRGB(r, g, b, a);
        } else if (input.startsWith("rgb")) {
          const [r, g, b] = input
            .slice(4, -1)
            .split(",")
            .map((x) => parseFloat(x)) || [0, 0, 0];
          return Color.fromRGB(r, g, b);
        } else {
          return Color.named(input);
        }
      } else {
        return input;
      }
    } catch {
      return Color.fromHex("#FFFFFF");
    }
  }

  static named(name: string) {
    if (colorsHex[name]) {
      return Color.fromHex(colorsHex[name]);
    } else {
      throw new Error(`Color ${name} does not exist.`);
    }
  }

  /* ---------------- Color Properties ---------------- */
  _hsl: Lazy<HSLObject> = createLazyValue(() =>
    rgbToHSL(this.rgb.r, this.rgb.g, this.rgb.b)
  );
  get hsl(): HSLObject {
    return this._hsl();
  }

  get hslString() {
    return `hsl(${this.hsl.h}, ${this.hsl.s}%, ${this.hsl.l}%)`;
  }

  _rgb: Lazy<RGBObject> = createLazyValue(() => hexToRGB(this.hex));
  get rgb(): RGBObject {
    return this._rgb();
  }

  get rgbString() {
    return `rgb(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b})`;
  }

  get rgba() {
    return { ...this.rgb, a: this.alpha };
  }

  get rgbaString() {
    return `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${this.alpha})`;
  }
  get hsla() {
    return { ...this.hsl, a: this.alpha };
  }

  get hslaString() {
    return `hsla(${this.hsl.h * 255}, ${this.hsl.s * 100}%, ${
      this.hsl.l * 100
    }%, ${this.alpha})`;
  }

  get hexString(): string {
    return (
      this.hex +
      (this.alpha < 1 ? Math.round(this.alpha * 255).toString(16) : "")
    );
  }

  get hexStringNoAlpha(): string {
    return this.hex;
  }

  get hexStringNoPound(): string {
    return this.hex.slice(1);
  }

  /* ---------------- Hue Operations ---------------- */
  nextHue(CLUSTER_BOUNDS = [20, 150, 200, 310, 360]): Color {
    let h = this.hsl.h;
    for (let i = 0; i < CLUSTER_BOUNDS.length; i++) {
      if (h < CLUSTER_BOUNDS[i]) {
        h = CLUSTER_BOUNDS[i];
        break;
      }
    }
    return Color.fromHSL(h, this.hsl.s, this.hsl.l, this.alpha);
  }

  /* ---------------- Color Operations ---------------- */
  clamp(number: number): number {
    return Math.max(Math.min(number, 255), 0);
  }

  multiply(matrix: number[]) {
    const { r, g, b } = this.rgb;
    const newR = this.clamp(r * matrix[0] + g * matrix[1] + b * matrix[2]);
    const newG = this.clamp(r * matrix[3] + g * matrix[4] + b * matrix[5]);
    const newB = this.clamp(r * matrix[6] + g * matrix[7] + b * matrix[8]);
    return Color.fromRGB(newR, newG, newB, this.alpha);
  }

  scale(value: number | Triple<number>) {
    if (typeof value === "number") {
      return this.multiply([value, 0, 0, 0, value, 0, 0, 0, value]);
    }
    return this.multiply([value[0], 0, 0, 0, value[1], 0, 0, 0, value[2]]);
  }

  vectorMultiply(color: Color) {
    const { r, g, b } = this.rgb;
    const { r: r2, g: g2, b: b2 } = color.rgb;
    const newR = this.clamp((r * r2) / 255);
    const newG = this.clamp((g * g2) / 255);
    const newB = this.clamp((b * b2) / 255);
    return Color.fromRGB(newR, newG, newB, this.alpha);
  }

  invert(value = 1) {
    const { r, g, b } = this.rgb;
    const newR = this.clamp((value + (r / 255) * (1 - 2 * value)) * 255);
    const newG = this.clamp((value + (g / 255) * (1 - 2 * value)) * 255);
    const newB = this.clamp((value + (b / 255) * (1 - 2 * value)) * 255);
    return Color.fromRGB(newR, newG, newB, this.alpha);
  }

  linear(slope = 1, intercept = 0) {
    const { r, g, b } = this.rgb;
    const newR = this.clamp(r * slope + intercept * 255);
    const newG = this.clamp(g * slope + intercept * 255);
    const newB = this.clamp(b * slope + intercept * 255);
    return Color.fromRGB(newR, newG, newB, this.alpha);
  }

  linearContrast(value = 1) {
    return this.linear(value, -(0.5 * value) + 0.5);
  }

  linearBrightness(value = 1) {
    return this.linear(value, 0);
  }

  gamma(value = 1) {
    const { r, g, b } = this.rgb;
    const newR = this.clamp((r / 255) ** value * 255);
    const newG = this.clamp((g / 255) ** value * 255);
    const newB = this.clamp((b / 255) ** value * 255);
    return Color.fromRGB(newR, newG, newB, this.alpha);
  }

  sepia(value = 1) {
    this.multiply([
      0.393 + 0.607 * (1 - value),
      0.769 - 0.769 * (1 - value),
      0.189 - 0.189 * (1 - value),
      0.349 - 0.349 * (1 - value),
      0.686 + 0.314 * (1 - value),
      0.168 - 0.168 * (1 - value),
      0.272 - 0.272 * (1 - value),
      0.534 - 0.534 * (1 - value),
      0.131 + 0.869 * (1 - value),
    ]);
  }

  /* ---------------- Color Properties ---------------- */
  get contrast(): number {
    const { r, g, b } = this.rgb;
    const relativeLuminance = (c: number): number => {
      const sRGB = c / 255;
      const linearRGB =
        sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
      return linearRGB * 100;
    };

    const luminance =
      0.2126 * relativeLuminance(r) +
      0.7152 * relativeLuminance(g) +
      0.0722 * relativeLuminance(b);
    return luminance;
  }

  get kelvin(): number {
    const { r, g, b } = this.rgb;
    const temp = (r + g + b) / 3;
    return Math.round(1000000 / temp);
  }

  readableTextColor(): Color {
    return this.contrast > 50
      ? Color.fromHex("#000000")
      : Color.fromHex("#FFFFFF");
  }

  opacity(percent: number) {
    let color = Color.fromHex(this.hexStringNoAlpha);
    color.alpha = percent / 100;
    return color;
  }

  darker(percent: number) {
    const { h, s, l } = this.hsl;
    percent = Color.normalize(percent, "l");
    return Color.fromHSL(h, s, Math.max(l - percent, 0), this.alpha);
  }

  lighter(percent: number) {
    const { h, s, l } = this.hsl;
    percent = Color.normalize(percent, "l");
    return Color.fromHSL(h, s, Math.min(l + percent, 100), this.alpha);
  }

  lightness(percent: number) {
    const { h, s } = this.hsl;
    percent = Color.normalize(percent, "l");
    return Color.fromHSL(h, s, Math.min(Math.max(percent, 0), 100), this.alpha);
  }

  grayscale() {
    const { h, s } = this.hsl;
    return Color.fromHSL(h, 0, s, this.alpha);
  }

  // Turn all colors into a list of colors that are accessible
  // https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
  static checkAccessible(foregroundColor: Color, backgroundColor: Color) {
    const contrastRatio =
      (foregroundColor.contrast + 0.05) / (backgroundColor.contrast + 0.05);
    return contrastRatio >= 7;
  }

  rotate(degrees: number): Color {
    const { h, s, l } = this.hsl;
    return Color.fromHSL((h + degrees) % 360, s, l, this.alpha);
  }

  saturate(percent: number): Color {
    const { h, s, l } = this.hsl;
    return Color.fromHSL(h, Math.min(s + percent, 100), l, this.alpha);
  }

  desaturate(percent: number): Color {
    const { h, s, l } = this.hsl;
    return Color.fromHSL(h, Math.max(s - percent, 0), l, this.alpha);
  }

  shiftRGBValues(r: number, g: number, b: number): Color {
    const rgb = this.rgb;
    return Color.fromRGB(
      Math.min(Math.max(rgb.r + r, 0), 255),
      Math.min(Math.max(rgb.g + g, 0), 255),
      Math.min(Math.max(rgb.b + b, 0), 255),
      this.alpha
    );
  }

  complementary(): Color {
    const { h, s, l } = this.hsl;
    return Color.fromHSL((h + 180) % 360, s, l, this.alpha);
  }

  get monochromatic(): Color[] {
    const { h, s, l } = this.hsl;
    const colors = [];
    for (let i = 0; i < 360; i += 30) {
      colors.push(Color.fromHSL(h, s, l + i, this.alpha));
    }
    return colors;
  }

  get triadic(): Color[] {
    const { h, s, l } = this.hsl;
    const colors = [];
    for (let i = 0; i < 360; i += 120) {
      colors.push(Color.fromHSL(h, s, l + i, this.alpha));
    }
    return colors;
  }

  interpolate(
    end: Color,
    percent: number,
    strategy: ColorInterpolationStrategy = ColorInterpolationStrategy.LINEAR,
    space: ColorSpace = ColorSpace.RGB,
    useShortestPath: boolean = false
  ) {
    let interpolationFunction;
    switch (strategy) {
      case ColorInterpolationStrategy.LINEAR:
        interpolationFunction = lerp3;
        break;
      case ColorInterpolationStrategy.SPLINE:
        interpolationFunction = lerp3;
        break;
      default:
        interpolationFunction = lerp3;
    }

    if (space === ColorSpace.HSL) {
      const startColor = this.hsl;
      const endColor = end.hsl;
      let h;
      if (useShortestPath && Math.abs(startColor.h - endColor.h) > 180) {
        h = interpolationFunction(
          startColor.h,
          endColor.h > startColor.h ? endColor.h - 360 : endColor.h + 360,
          percent
        );
      } else {
        h = interpolationFunction(startColor.h, endColor.h, percent);
      }
      const s = interpolationFunction(startColor.s, endColor.s, percent);
      const l = interpolationFunction(startColor.l, endColor.l, percent);
      return Color.fromHSL(h, s, l);
    } else {
      const startColor = this.rgb;
      const endColor = end.rgb;
      const r = interpolationFunction(startColor.r, endColor.r, percent);
      const g = interpolationFunction(startColor.g, endColor.g, percent);
      const b = interpolationFunction(startColor.b, endColor.b, percent);
      return Color.fromRGB(r, g, b);
    }
  }

  get r(): number {
    return this.rgb.r;
  }

  get g(): number {
    return this.rgb.g;
  }

  get b(): number {
    return this.rgb.b;
  }

  get h(): number {
    return this.hsl.h;
  }

  get s(): number {
    return this.hsl.s;
  }

  get l(): number {
    return this.hsl.l;
  }

  get a(): number {
    return this.alpha;
  }
}
