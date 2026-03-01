import { describe, it, expect } from 'vitest';
import { sprite, paletteFrom, toPNG } from '../src/index.js';
import { fromPNG } from '../src/import/png.js';

describe('fromPNG()', () => {
  it('round-trips a sprite through PNG export and import', () => {
    const palette = paletteFrom('pico8');
    const original = sprite({
      palette,
      frames: [
        `
        08
        80
        `,
      ],
      name: 'test',
    });

    const buffer = toPNG(original);
    const imported = fromPNG(buffer);

    expect(imported.width).toBe(original.width);
    expect(imported.height).toBe(original.height);
    expect(imported.frames.length).toBe(1);

    for (let y = 0; y < original.height; y++) {
      for (let x = 0; x < original.width; x++) {
        expect(imported.getPixel(x, y)).toEqual(original.getPixel(x, y));
      }
    }
  });

  it('preserves transparent pixels', () => {
    const palette = paletteFrom('pico8');
    const original = sprite({
      palette,
      frames: [
        `
        .8
        8.
        `,
      ],
    });

    const buffer = toPNG(original);
    const imported = fromPNG(buffer);

    expect(imported.getPixel(0, 0)).toEqual([0, 0, 0, 0]);
    expect(imported.getPixel(1, 1)).toEqual([0, 0, 0, 0]);
    expect(imported.getPixel(1, 0)[3]).toBe(255);
    expect(imported.getPixel(0, 1)[3]).toBe(255);
  });

  it('imports a larger sprite correctly', () => {
    const palette = paletteFrom('pico8');
    const original = sprite({
      palette,
      frames: [
        `
        0123
        4567
        89ab
        cdef
        `,
      ],
    });

    const buffer = toPNG(original);
    const imported = fromPNG(buffer);

    expect(imported.width).toBe(4);
    expect(imported.height).toBe(4);

    for (let y = 0; y < original.height; y++) {
      for (let x = 0; x < original.width; x++) {
        expect(imported.getPixel(x, y)).toEqual(original.getPixel(x, y));
      }
    }
  });
});
