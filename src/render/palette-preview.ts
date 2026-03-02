import type { PaletteMap, Renderable, RGBA } from '../types.js';
import { parseColor } from '../color.js';
import { PixelCanvas } from '../canvas.js';

export interface PaletteSwatchOptions {
  scale?: number;
  columns?: number;
}

/**
 * Create a Renderable showing each non-transparent palette color as a swatch.
 */
export function paletteSwatch(
  palette: PaletteMap,
  opts?: PaletteSwatchOptions,
): Renderable {
  const scale = opts?.scale ?? 1;

  // Collect non-transparent colors
  const colors: RGBA[] = [];
  for (const [key, value] of Object.entries(palette)) {
    if (key === '.') continue;
    const rgba = parseColor(value);
    if (rgba[3] === 0) continue;
    colors.push(rgba);
  }

  if (colors.length === 0) {
    return new PixelCanvas(0, 0);
  }

  const columns = opts?.columns ?? Math.ceil(Math.sqrt(colors.length));
  const rows = Math.ceil(colors.length / columns);
  const canvas = new PixelCanvas(columns * scale, rows * scale);

  for (let i = 0; i < colors.length; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const color = colors[i]!;
    for (let dy = 0; dy < scale; dy++) {
      for (let dx = 0; dx < scale; dx++) {
        canvas.setPixel(col * scale + dx, row * scale + dy, color);
      }
    }
  }

  return canvas;
}
