import { describe, it, expect } from 'vitest';
import { sprite, paletteFrom, toSpriteSheet } from '../src/index.js';
import { fromSpriteSheet } from '../src/import/spritesheet.js';

describe('fromSpriteSheet()', () => {
  it('round-trips a multi-frame sprite through sprite sheet export and import', () => {
    const palette = paletteFrom('pico8');
    const original = sprite({
      palette,
      frames: [
        `
        08
        80
        `,
        `
        80
        08
        `,
        `
        ab
        ba
        `,
      ],
      name: 'anim',
      frameDuration: [100, 200, 150],
    });

    const { buffer, metadata } = toSpriteSheet(original);
    const imported = fromSpriteSheet(buffer, metadata);

    expect(imported.frames.length).toBe(3);
    expect(imported.width).toBe(original.width);
    expect(imported.height).toBe(original.height);
    expect(imported.frameDuration).toEqual([100, 200, 150]);

    for (let f = 0; f < original.frames.length; f++) {
      for (let y = 0; y < original.height; y++) {
        for (let x = 0; x < original.width; x++) {
          expect(imported.frames[f]!.getPixel(x, y)).toEqual(
            original.frames[f]!.getPixel(x, y),
          );
        }
      }
    }
  });

  it('round-trips with scale > 1', () => {
    const palette = paletteFrom('pico8');
    const original = sprite({
      palette,
      frames: [
        `
        08
        80
        `,
        `
        80
        08
        `,
      ],
      name: 'scaled',
    });

    const { buffer, metadata } = toSpriteSheet(original, { scale: 3 });
    const imported = fromSpriteSheet(buffer, metadata);

    expect(imported.frames.length).toBe(2);
    expect(imported.width).toBe(original.width);
    expect(imported.height).toBe(original.height);

    for (let f = 0; f < original.frames.length; f++) {
      for (let y = 0; y < original.height; y++) {
        for (let x = 0; x < original.width; x++) {
          expect(imported.frames[f]!.getPixel(x, y)).toEqual(
            original.frames[f]!.getPixel(x, y),
          );
        }
      }
    }
  });

  it('handles single-frame sprite sheet', () => {
    const palette = paletteFrom('pico8');
    const original = sprite({
      palette,
      frames: [
        `
        abc
        def
        `,
      ],
    });

    const { buffer, metadata } = toSpriteSheet(original);
    const imported = fromSpriteSheet(buffer, metadata);

    expect(imported.frames.length).toBe(1);
    for (let y = 0; y < original.height; y++) {
      for (let x = 0; x < original.width; x++) {
        expect(imported.getPixel(x, y)).toEqual(original.getPixel(x, y));
      }
    }
  });
});
