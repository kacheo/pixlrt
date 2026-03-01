import type { RGBA, ColorInput } from './types.js';

const TRANSPARENT: RGBA = [0, 0, 0, 0];

const NAMED_COLORS: Record<string, RGBA> = {
  transparent: TRANSPARENT,
  black: [0, 0, 0, 255],
  white: [255, 255, 255, 255],
  red: [255, 0, 0, 255],
  green: [0, 128, 0, 255],
  blue: [0, 0, 255, 255],
  yellow: [255, 255, 0, 255],
  cyan: [0, 255, 255, 255],
  magenta: [255, 0, 255, 255],
  orange: [255, 165, 0, 255],
  purple: [128, 0, 128, 255],
  pink: [255, 192, 203, 255],
  brown: [139, 69, 19, 255],
  gray: [128, 128, 128, 255],
  grey: [128, 128, 128, 255],
  lime: [0, 255, 0, 255],
  navy: [0, 0, 128, 255],
  teal: [0, 128, 128, 255],
  maroon: [128, 0, 0, 255],
  olive: [128, 128, 0, 255],
  silver: [192, 192, 192, 255],
};

/**
 * Parse a color input into an RGBA tuple.
 * Supports: '#rgb', '#rrggbb', '#rrggbbaa', named colors, 'transparent', RGBA tuples.
 */
export function parseColor(input: ColorInput): RGBA {
  if (Array.isArray(input)) {
    const arr = input as number[];
    if (arr.length !== 4) {
      throw new Error(`RGBA tuple must have 4 elements, got ${arr.length}`);
    }
    return input;
  }

  const str = input.trim().toLowerCase();

  if (str in NAMED_COLORS) {
    return NAMED_COLORS[str]!;
  }

  if (str.startsWith('#')) {
    const hex = str.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0]! + hex[0]!, 16);
      const g = parseInt(hex[1]! + hex[1]!, 16);
      const b = parseInt(hex[2]! + hex[2]!, 16);
      return [r, g, b, 255];
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return [r, g, b, 255];
    }
    if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = parseInt(hex.slice(6, 8), 16);
      return [r, g, b, a];
    }
    throw new Error(`Invalid hex color: "${input}". Expected #rgb, #rrggbb, or #rrggbbaa`);
  }

  throw new Error(
    `Unknown color: "${input}". Use a hex value (#rgb, #rrggbb), named color (${Object.keys(NAMED_COLORS).slice(0, 5).join(', ')}...), or RGBA tuple.`,
  );
}

/** Clamp a value to 0-255 */
function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

/** Lighten a color by an amount (0-1) */
export function lighten(color: ColorInput, amount: number): RGBA {
  const [r, g, b, a] = parseColor(color);
  return [
    clamp(r + (255 - r) * amount),
    clamp(g + (255 - g) * amount),
    clamp(b + (255 - b) * amount),
    a,
  ];
}

/** Darken a color by an amount (0-1) */
export function darken(color: ColorInput, amount: number): RGBA {
  const [r, g, b, a] = parseColor(color);
  return [clamp(r * (1 - amount)), clamp(g * (1 - amount)), clamp(b * (1 - amount)), a];
}

/** Linearly interpolate between two colors */
export function lerp(a: ColorInput, b: ColorInput, t: number): RGBA {
  const ca = parseColor(a);
  const cb = parseColor(b);
  return [
    clamp(ca[0] + (cb[0] - ca[0]) * t),
    clamp(ca[1] + (cb[1] - ca[1]) * t),
    clamp(ca[2] + (cb[2] - ca[2]) * t),
    clamp(ca[3] + (cb[3] - ca[3]) * t),
  ];
}
