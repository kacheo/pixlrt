import type { RGBA, PaletteMap, PixelGrid } from './types.js';
import { parseColor } from './color.js';

const TRANSPARENT: RGBA = [0, 0, 0, 0];

/**
 * Parse an ASCII grid string into a 2D RGBA pixel grid.
 *
 * - Trims leading/trailing blank lines and dedents by common whitespace
 * - Maps each character to an RGBA color via the palette
 * - Space characters (if not in palette) and 'transparent' values → [0,0,0,0]
 * - Tabs are expanded to spaces (2-space tab stops)
 * - Lines are right-padded with transparent pixels to match the widest line
 * - Error messages include row/col positions for debugging
 */
export function parseGrid(ascii: string, palette: PaletteMap): PixelGrid {
  // Resolve palette to RGBA
  const resolved = new Map<string, RGBA>();
  for (const [char, color] of Object.entries(palette)) {
    resolved.set(char, parseColor(color));
  }

  // Expand tabs to spaces
  const expanded = ascii.replace(/\t/g, '  ');

  // Split into lines and strip leading/trailing empty lines
  let lines = expanded.split('\n');

  // Remove leading empty lines
  while (lines.length > 0 && lines[0]!.trim() === '') {
    lines.shift();
  }
  // Remove trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1]!.trim() === '') {
    lines.pop();
  }

  if (lines.length === 0) {
    throw new Error('Empty grid: no non-blank lines found');
  }

  // Dedent by common leading whitespace
  const indent = lines.reduce((min, line) => {
    if (line.trim() === '') return min;
    const match = line.match(/^(\s*)/);
    const len = match ? match[1]!.length : 0;
    return Math.min(min, len);
  }, Infinity);

  if (indent > 0 && indent < Infinity) {
    lines = lines.map((line) => line.slice(indent));
  }

  // Parse each line into chars (Unicode-safe)
  const charGrid = lines.map((line) => Array.from(line));

  // Find max width
  const maxWidth = charGrid.reduce((max, row) => Math.max(max, row.length), 0);

  if (maxWidth === 0) {
    throw new Error('Empty grid: all lines are blank after dedent');
  }

  // Build pixel grid
  const availableChars = Array.from(resolved.keys()).sort().join(', ');
  const pixels: RGBA[][] = [];

  for (let row = 0; row < charGrid.length; row++) {
    const pixelRow: RGBA[] = [];
    const chars = charGrid[row]!;

    for (let col = 0; col < maxWidth; col++) {
      if (col >= chars.length) {
        // Right-pad with transparent
        pixelRow.push(TRANSPARENT);
        continue;
      }

      const char = chars[col]!;

      // Space defaults to transparent if not in palette
      if (char === ' ' && !resolved.has(' ')) {
        pixelRow.push(TRANSPARENT);
        continue;
      }

      const color = resolved.get(char);
      if (!color) {
        throw new Error(
          `Unknown palette character '${char}' at row ${row + 1}, col ${col + 1}. ` +
            `Available palette characters: ${availableChars}`,
        );
      }
      pixelRow.push(color);
    }

    pixels.push(pixelRow);
  }

  return pixels;
}

/**
 * Parse multiple ASCII grid strings and validate they all have the same dimensions.
 */
export function parseFrames(frames: string[], palette: PaletteMap): PixelGrid[] {
  if (frames.length === 0) {
    throw new Error('At least one frame is required');
  }

  const grids = frames.map((ascii, i) => {
    try {
      return parseGrid(ascii, palette);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`Frame ${i}: ${msg}`, { cause: e });
    }
  });

  // Validate consistent dimensions
  const height = grids[0]!.length;
  const width = grids[0]![0]!.length;

  for (let i = 1; i < grids.length; i++) {
    const g = grids[i]!;
    if (g.length !== height || g[0]!.length !== width) {
      throw new Error(
        `Frame ${i} dimensions (${g[0]!.length}x${g.length}) don't match ` +
          `frame 0 dimensions (${width}x${height}). All frames must be the same size.`,
      );
    }
  }

  return grids;
}
