import { z } from "zod";
import type ColorClassInstance from "./colors";

export const HexColorValidator = z.string().regex(/^#?[0-9a-fA-F]{3,8}$/);

export type HexString = z.infer<typeof HexColorValidator>;
export type ResolvableToColor = string | HexString | ColorClassInstance;
export type Color = ColorClassInstance;

export type RGBObject = {
  r: number;
  g: number;
  b: number;
};

export type HSLObject = {
  h: number;
  s: number;
  l: number;
};

export type ColorObject =
  | RGBObject
  | HSLObject
  | { hex: string; alpha: number };
