import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PaletteMap, RGBA } from './types.js';
import { parseColor } from './color.js';

/** PICO-8 16-color palette */
const PICO8: RGBA[] = [
  [0, 0, 0, 255], // 0 black
  [29, 43, 83, 255], // 1 dark blue
  [126, 37, 83, 255], // 2 dark purple
  [0, 135, 81, 255], // 3 dark green
  [171, 82, 54, 255], // 4 brown
  [95, 87, 79, 255], // 5 dark grey
  [194, 195, 199, 255], // 6 light grey
  [255, 241, 232, 255], // 7 white
  [255, 0, 77, 255], // 8 red
  [255, 163, 0, 255], // 9 orange
  [255, 236, 39, 255], // a yellow
  [0, 228, 54, 255], // b green
  [41, 173, 255, 255], // c blue
  [131, 118, 156, 255], // d indigo
  [255, 119, 168, 255], // e pink
  [255, 204, 170, 255], // f peach
];

/** GameBoy 4-color palette */
const GAMEBOY: RGBA[] = [
  [15, 56, 15, 255], // 0 darkest
  [48, 98, 48, 255], // 1 dark
  [139, 172, 15, 255], // 2 light
  [155, 188, 15, 255], // 3 lightest
];

/** Sweetie-16 palette */
const SWEETIE16: RGBA[] = [
  [26, 28, 44, 255], // 0
  [93, 39, 93, 255], // 1
  [177, 62, 83, 255], // 2
  [239, 125, 87, 255], // 3
  [255, 205, 117, 255], // 4
  [167, 240, 112, 255], // 5
  [56, 183, 100, 255], // 6
  [37, 113, 121, 255], // 7
  [41, 54, 111, 255], // 8
  [59, 93, 201, 255], // 9
  [65, 166, 246, 255], // a
  [115, 239, 247, 255], // b
  [244, 244, 244, 255], // c
  [148, 176, 194, 255], // d
  [86, 108, 134, 255], // e
  [51, 60, 87, 255], // f
];

/** CGA 4-color palette (mode 4, palette 1, high intensity) */
const CGA: RGBA[] = [
  [0, 0, 0, 255], // 0 black
  [85, 255, 255, 255], // 1 cyan
  [255, 85, 255, 255], // 2 magenta
  [255, 255, 255, 255], // 3 white
];

const PALETTE_CHARS = '.0123456789abcdef';
const HEX_KEYS = '0123456789abcdefghijklmnopqrstuvwxyz';

/** All built-in palettes */
export const PALETTES: Record<string, RGBA[]> = {
  pico8: PICO8,
  gameboy: GAMEBOY,
  sweetie16: SWEETIE16,
  cga: CGA,
};

/**
 * Create a PaletteMap from a named built-in palette.
 * Maps '.' to transparent, then '0'-'9', 'a'-'f' to palette colors.
 */
export function paletteFrom(name: string): PaletteMap {
  const colors = PALETTES[name.toLowerCase()];
  if (!colors) {
    throw new Error(`Unknown palette: "${name}". Available: ${Object.keys(PALETTES).join(', ')}`);
  }

  const map: PaletteMap = { '.': 'transparent' };
  for (let i = 0; i < colors.length; i++) {
    const char = PALETTE_CHARS[i + 1]; // skip '.' at index 0
    if (char) {
      map[char] = colors[i]!;
    }
  }
  return map;
}

/**
 * Create a PaletteMap from an array of hex color strings.
 * Auto-assigns single-char keys: '.' → transparent, '0'-'9', 'a'-'z' for up to 36 colors.
 */
export function paletteFromHex(hexColors: string[]): PaletteMap {
  if (hexColors.length > 36) {
    throw new Error(
      `paletteFromHex supports at most 36 colors (0-9, a-z), got ${hexColors.length}`,
    );
  }

  const map: PaletteMap = { '.': 'transparent' };
  for (let i = 0; i < hexColors.length; i++) {
    const hex = hexColors[i]!;
    const color = parseColor(hex.startsWith('#') ? hex : `#${hex}`);
    map[HEX_KEYS[i]!] = color;
  }
  return map;
}

/**
 * Parse a palette file (.hex or .gpl format) into a PaletteMap.
 * - `.hex`: one 6-digit hex color per line (no '#' prefix)
 * - `.gpl`: GIMP Palette format (header, optional comments, R G B per line)
 */
export function paletteFromFile(filePath: string): PaletteMap {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf-8');

  if (ext === '.hex') {
    const hexColors = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return paletteFromHex(hexColors);
  }

  if (ext === '.gpl') {
    const lines = content.split('\n');
    const hexColors: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        !trimmed ||
        trimmed === 'GIMP Palette' ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('Name:') ||
        trimmed.startsWith('Columns:')
      ) {
        continue;
      }
      const parts = trimmed.split(/\s+/);
      const r = parseInt(parts[0]!, 10);
      const g = parseInt(parts[1]!, 10);
      const b = parseInt(parts[2]!, 10);
      if (isNaN(r) || isNaN(g) || isNaN(b)) continue;
      const hex =
        r.toString(16).padStart(2, '0') +
        g.toString(16).padStart(2, '0') +
        b.toString(16).padStart(2, '0');
      hexColors.push(hex);
    }
    return paletteFromHex(hexColors);
  }

  throw new Error(
    `Unsupported palette file extension: "${ext}". Expected .hex or .gpl`,
  );
}
