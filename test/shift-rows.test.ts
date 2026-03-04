import { describe, it, expect } from 'vitest';
import { Frame } from '../src/frame.js';
import { shiftRows } from '../src/transform.js';
import { sprite } from '../src/sprite.js';
import type { RGBA } from '../src/types.js';

const R: RGBA = [255, 0, 0, 255];
const G: RGBA = [0, 255, 0, 255];
const B: RGBA = [0, 0, 255, 255];
const T: RGBA = [0, 0, 0, 0];

// 3x3 test frame:
// R G B
// R G B
// R G B
const frame = new Frame([
  [R, G, B],
  [R, G, B],
  [R, G, B],
]);

describe('shiftRows (transform)', () => {
  it('shifts rows right (positive dx)', () => {
    const result = shiftRows(frame, { from: 0, to: 0, dx: 1 });
    // Row 0 shifted right by 1: T R G
    expect(result.getPixel(0, 0)).toEqual(T);
    expect(result.getPixel(1, 0)).toEqual(R);
    expect(result.getPixel(2, 0)).toEqual(G);
    // Row 1 unchanged
    expect(result.getPixel(0, 1)).toEqual(R);
  });

  it('shifts rows left (negative dx)', () => {
    const result = shiftRows(frame, { from: 0, to: 0, dx: -1 });
    // Row 0 shifted left by 1: G B T
    expect(result.getPixel(0, 0)).toEqual(G);
    expect(result.getPixel(1, 0)).toEqual(B);
    expect(result.getPixel(2, 0)).toEqual(T);
  });

  it('shifts multiple rows', () => {
    const result = shiftRows(frame, { from: 0, to: 1, dx: 1 });
    // Rows 0 and 1 shifted
    expect(result.getPixel(0, 0)).toEqual(T);
    expect(result.getPixel(0, 1)).toEqual(T);
    // Row 2 unchanged
    expect(result.getPixel(0, 2)).toEqual(R);
  });

  it('returns same frame for dx=0', () => {
    const result = shiftRows(frame, { from: 0, to: 2, dx: 0 });
    expect(result).toBe(frame);
  });

  it('throws on invalid row range', () => {
    expect(() => shiftRows(frame, { from: 2, to: 1, dx: 1 })).toThrow('invalid');
    expect(() => shiftRows(frame, { from: -1, to: 1, dx: 1 })).toThrow('invalid');
    expect(() => shiftRows(frame, { from: 0, to: 3, dx: 1 })).toThrow('invalid');
  });

  it('throws on non-integer parameters', () => {
    expect(() => shiftRows(frame, { from: 0.5, to: 1, dx: 1 })).toThrow('integers');
  });
});

describe('Sprite.shiftRows()', () => {
  it('shifts rows on all frames', () => {
    const s = sprite({
      palette: { '.': 'transparent', x: '#ff0000', o: '#0000ff' },
      frames: ['xo\nox', 'ox\nxo'],
    });
    const shifted = s.shiftRows({ from: 0, to: 0, dx: 1 });
    expect(shifted.frames.length).toBe(2);
    // Frame 0 row 0 shifted right: T x
    expect(shifted.frame(0).getPixel(0, 0)).toEqual(T);
    expect(shifted.frame(0).getPixel(1, 0)).toEqual([255, 0, 0, 255]);
    // Frame 0 row 1 unchanged
    expect(shifted.frame(0).getPixel(0, 1)).toEqual([0, 0, 255, 255]);
  });
});
