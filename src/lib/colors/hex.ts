import { HexColorValidator, HexString } from "./types";

export function normalizeHexString(maybeHex: HexString | string): {
  hex: HexString;
  alpha: number;
} {
  let hex: HexString;
  let alpha: number = 1;

  // Validate the input
  if (HexColorValidator.safeParse(maybeHex).success) {
    hex = maybeHex;
  } else {
    throw new Error("Invalid hex color string: " + JSON.stringify(maybeHex));
  }

  // Remove the pound sing
  hex = hex.replace("#", "");

  if (hex.length === 3) {
    // RGB -> RRGGBB
    hex = `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  } else if (hex.length === 4) {
    // RGBA -> RRGGBBAA
    hex = `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
    alpha = parseInt(hex[3], 16) / 15;
  } else if (hex.length === 5 || hex.length === 6) {
    // RRGGB(B) -> RRGGB[B|0]
    hex = `#${hex}`.padEnd(7, "0");
  } else if (hex.length === 7) {
    // RRGGBBA -> RRGGBBA0
    hex = `#${hex}0`;
  } else if (hex.length === 8) {
    // RRGGBBAA -> RRGGBBAA
    hex = `#${hex.slice(0, 6)}`;
    alpha = parseInt(hex.slice(6, 8), 16) / 255;
  }

  return { hex, alpha };
}
