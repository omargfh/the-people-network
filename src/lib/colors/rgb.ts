export function hexToRGB(hex: string): Record<"r" | "g" | "b", number> {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  hex = hex.replace(
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
    function (_: string, r: string, g: string, b: string) {
      return r + r + g + g + b + b;
    }
  );
  // Pad whole string to 6 chars, except if it has # at the beginning, then 7
  hex = hex.padEnd(7, "0");
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result === null || result.length < 4) {
    console.warn(`Invalid hex color: ${hex}`);
    return {
      r: 255,
      g: 255,
      b: 255,
    };
  }
  let r: number = parseInt(result[1] || "FF", 16);
  let g: number = parseInt(result[2] || "FF", 16);
  let b: number = parseInt(result[3] || "FF", 16);
  return {
    r: r,
    g: g,
    b: b,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0").slice(0, 2)}${g
    .toString(16)
    .padStart(2, "0")
    .slice(0, 2)}${b.toString(16).padStart(2, "0").slice(0, 2)}`;
}
