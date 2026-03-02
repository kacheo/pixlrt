import { describe, it, expect } from 'vitest';
import { paletteSwatch } from '../src/render/palette-preview.js';
import { paletteFrom } from '../src/palette.js';
import type { PaletteMap } from '../src/types.js';

describe('paletteSwatch', () => {
  it('returns renderable with correct dimensions for pico8', () => {
    const swatch = paletteSwatch(paletteFrom('pico8'));
    // 16 colors, sqrt(16)=4, so 4 columns x 4 rows at scale=1
    expect(swatch.width).toBe(4);
    expect(swatch.height).toBe(4);
  });

  it('pixels match palette colors', () => {
    const palette: PaletteMap = {
      '.': 'transparent',
      '0': [255, 0, 0, 255],
      '1': [0, 255, 0, 255],
      '2': [0, 0, 255, 255],
      '3': [255, 255, 0, 255],
    };
    const swatch = paletteSwatch(palette, { columns: 2 });
    // 4 colors, 2 columns → 2x2 grid
    expect(swatch.width).toBe(2);
    expect(swatch.height).toBe(2);
    expect(swatch.getPixel(0, 0)).toEqual([255, 0, 0, 255]);
    expect(swatch.getPixel(1, 0)).toEqual([0, 255, 0, 255]);
    expect(swatch.getPixel(0, 1)).toEqual([0, 0, 255, 255]);
    expect(swatch.getPixel(1, 1)).toEqual([255, 255, 0, 255]);
  });

  it('respects custom columns option', () => {
    const palette = paletteFrom('pico8'); // 16 colors
    const swatch = paletteSwatch(palette, { columns: 8 });
    expect(swatch.width).toBe(8);
    expect(swatch.height).toBe(2);
  });

  it('scales swatches with scale option', () => {
    const palette: PaletteMap = {
      '.': 'transparent',
      '0': [255, 0, 0, 255],
      '1': [0, 255, 0, 255],
    };
    const swatch = paletteSwatch(palette, { scale: 4, columns: 2 });
    expect(swatch.width).toBe(8); // 2 columns * 4 scale
    expect(swatch.height).toBe(4); // 1 row * 4 scale
    // All pixels in first swatch should be red
    expect(swatch.getPixel(0, 0)).toEqual([255, 0, 0, 255]);
    expect(swatch.getPixel(3, 3)).toEqual([255, 0, 0, 255]);
    // Second swatch should be green
    expect(swatch.getPixel(4, 0)).toEqual([0, 255, 0, 255]);
  });

  it('handles empty palette', () => {
    const swatch = paletteSwatch({ '.': 'transparent' });
    expect(swatch.width).toBe(0);
    expect(swatch.height).toBe(0);
  });
});
