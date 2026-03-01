import { describe, it, expect } from 'vitest';
import { sprite } from '../src/sprite.js';
import { toCollisionMask } from '../src/render/collision-mask.js';

const palette = {
  '.': 'transparent',
  x: '#ff0000',
};

describe('toCollisionMask', () => {
  it('returns boolean grid matching non-transparent pixels', () => {
    const s = sprite({ palette, frames: ['x.\n.x'] });
    const mask = toCollisionMask(s);

    expect(mask.width).toBe(2);
    expect(mask.height).toBe(2);
    expect(mask.data).toEqual([
      [true, false],
      [false, true],
    ]);
  });

  it('packs bits MSB-first in row-major order', () => {
    const s = sprite({ palette, frames: ['x.x.\n.x.x'] });
    const mask = toCollisionMask(s);

    // Row 0: 1010 -> 0xA0 (MSB-first, padded to byte)
    // Row 1: 0101 -> 0x50
    expect(mask.packed[0]).toBe(0xa0);
    expect(mask.packed[1]).toBe(0x50);
  });

  it('respects custom threshold', () => {
    // All pixels are either 0 or 255 alpha in this sprite
    const s = sprite({ palette, frames: ['x.'] });
    // threshold=256 means nothing passes
    const mask = toCollisionMask(s, { threshold: 256 });
    expect(mask.data[0]).toEqual([false, false]);
  });

  it('handles fully solid sprite', () => {
    const s = sprite({ palette: { x: '#ff0000' }, frames: ['xx\nxx'] });
    const mask = toCollisionMask(s);
    expect(mask.data).toEqual([
      [true, true],
      [true, true],
    ]);
  });

  it('handles fully transparent sprite', () => {
    const s = sprite({ palette: { '.': 'transparent' }, frames: ['..\n..'] });
    const mask = toCollisionMask(s);
    expect(mask.data).toEqual([
      [false, false],
      [false, false],
    ]);
  });

  it('packs wide rows correctly across byte boundaries', () => {
    // 10 pixels wide: xxxxxxxxx. (9 solid, 1 transparent)
    const s = sprite({
      palette,
      frames: ['xxxxxxxxx.'],
    });
    const mask = toCollisionMask(s);

    expect(mask.width).toBe(10);
    // First byte: 11111111 = 0xFF
    expect(mask.packed[0]).toBe(0xff);
    // Second byte: 10_000000 = 0x80
    expect(mask.packed[1]).toBe(0x80);
  });
});
