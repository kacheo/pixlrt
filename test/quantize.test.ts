import { describe, it, expect } from 'vitest';
import { Frame } from '../src/frame.js';
import { quantize } from '../src/quantize.js';
import type { PaletteMap, RGBA } from '../src/types.js';

describe('quantize()', () => {
  it('keeps exact matches unchanged', () => {
    const red: RGBA = [255, 0, 0, 255];
    const blue: RGBA = [0, 0, 255, 255];
    const frame = new Frame([[red, blue]]);
    const palette: PaletteMap = {
      '.': 'transparent',
      '0': red,
      '1': blue,
    };

    const result = quantize(frame, palette);
    expect(result.getPixel(0, 0)).toEqual(red);
    expect(result.getPixel(1, 0)).toEqual(blue);
  });

  it('snaps to nearest palette color', () => {
    // A color close to red should snap to red
    const almostRed: RGBA = [250, 5, 5, 255];
    const frame = new Frame([[almostRed]]);
    const palette: PaletteMap = {
      '.': 'transparent',
      '0': [255, 0, 0, 255] as RGBA,
      '1': [0, 0, 255, 255] as RGBA,
    };

    const result = quantize(frame, palette);
    expect(result.getPixel(0, 0)).toEqual([255, 0, 0, 255]);
  });

  it('preserves fully transparent pixels', () => {
    const transparent: RGBA = [0, 0, 0, 0];
    const red: RGBA = [255, 0, 0, 255];
    const frame = new Frame([[transparent, red]]);
    const palette: PaletteMap = {
      '.': 'transparent',
      '0': [0, 255, 0, 255] as RGBA,
    };

    const result = quantize(frame, palette);
    expect(result.getPixel(0, 0)).toEqual([0, 0, 0, 0]);
    expect(result.getPixel(1, 0)).toEqual([0, 255, 0, 255]);
  });

  it('throws when palette has no opaque colors', () => {
    const red: RGBA = [255, 0, 0, 255];
    const frame = new Frame([[red]]);
    const palette: PaletteMap = {
      '.': 'transparent',
      '0': [0, 0, 0, 0] as RGBA,
    };

    expect(() => quantize(frame, palette)).toThrow(
      'Palette must contain at least one opaque color for quantization',
    );
  });

  it('handles mid-value gray snapping to closest', () => {
    const gray: RGBA = [128, 128, 128, 255];
    const frame = new Frame([[gray]]);
    const palette: PaletteMap = {
      '.': 'transparent',
      '0': [0, 0, 0, 255] as RGBA,
      '1': [255, 255, 255, 255] as RGBA,
    };

    const result = quantize(frame, palette);
    // Distance to black: 128^2*3 = 49152
    // Distance to white: 127^2*3 = 48387
    // Should snap to white (closer)
    expect(result.getPixel(0, 0)).toEqual([255, 255, 255, 255]);
  });
});
