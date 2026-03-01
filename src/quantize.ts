import type { RGBA, PaletteMap } from './types.js';
import { parseColor } from './color.js';
import { Frame } from './frame.js';

/**
 * Map each pixel in a frame to the nearest palette color using
 * Euclidean distance in RGBA space.
 */
export function quantize(frame: Frame, palette: PaletteMap): Frame {
  const colors: RGBA[] = [];
  for (const value of Object.values(palette)) {
    if (value === 'transparent') continue;
    const rgba = parseColor(value);
    if (rgba[3] === 0) continue;
    colors.push(rgba);
  }

  if (colors.length === 0) {
    throw new Error('Palette must contain at least one opaque color for quantization');
  }

  const pixels: RGBA[][] = [];
  for (let y = 0; y < frame.height; y++) {
    const row: RGBA[] = [];
    for (let x = 0; x < frame.width; x++) {
      const pixel = frame.getPixel(x, y);

      // Keep fully transparent pixels as-is
      if (pixel[3] === 0) {
        row.push(pixel);
        continue;
      }

      let bestDist = Infinity;
      let best: RGBA = pixel;
      for (const color of colors) {
        const dr = pixel[0] - color[0];
        const dg = pixel[1] - color[1];
        const db = pixel[2] - color[2];
        const da = pixel[3] - color[3];
        const dist = dr * dr + dg * dg + db * db + da * da;
        if (dist < bestDist) {
          bestDist = dist;
          best = color;
        }
      }
      row.push(best);
    }
    pixels.push(row);
  }

  return new Frame(pixels);
}
