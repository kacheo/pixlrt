import { describe, it, expect } from 'vitest';
import { Frame } from '../src/frame.js';
import { flipX, flipY, rotate, scale, pad, crop, opacity, outline } from '../src/transform.js';
import type { RGBA } from '../src/types.js';

const R: RGBA = [255, 0, 0, 255];
const G: RGBA = [0, 255, 0, 255];
const B: RGBA = [0, 0, 255, 255];
const W: RGBA = [255, 255, 255, 255];

// 2x2 test frame:
// R G
// B W
const frame2x2 = new Frame([
  [R, G],
  [B, W],
]);

// 3x2 test frame (wider):
// R G B
// W R G
const frame3x2 = new Frame([
  [R, G, B],
  [W, R, G],
]);

describe('flipX', () => {
  it('mirrors pixels horizontally', () => {
    const f = flipX(frame2x2);
    expect(f.getPixel(0, 0)).toEqual(G);
    expect(f.getPixel(1, 0)).toEqual(R);
    expect(f.getPixel(0, 1)).toEqual(W);
    expect(f.getPixel(1, 1)).toEqual(B);
  });
});

describe('flipY', () => {
  it('mirrors pixels vertically', () => {
    const f = flipY(frame2x2);
    expect(f.getPixel(0, 0)).toEqual(B);
    expect(f.getPixel(1, 0)).toEqual(W);
    expect(f.getPixel(0, 1)).toEqual(R);
    expect(f.getPixel(1, 1)).toEqual(G);
  });
});

describe('rotate', () => {
  it('rotates 90° CW', () => {
    const f = rotate(frame2x2, 90);
    expect(f.width).toBe(2);
    expect(f.height).toBe(2);
    // Expected (90 CW of R G / B W):
    // B R
    // W G
    expect(f.getPixel(0, 0)).toEqual(B);
    expect(f.getPixel(1, 0)).toEqual(R);
    expect(f.getPixel(0, 1)).toEqual(W);
    expect(f.getPixel(1, 1)).toEqual(G);
  });

  it('rotates 90° CW for non-square frame', () => {
    const f = rotate(frame3x2, 90);
    // 3x2 → 2x3
    expect(f.width).toBe(2);
    expect(f.height).toBe(3);
  });

  it('rotates 180°', () => {
    const f = rotate(frame2x2, 180);
    expect(f.width).toBe(2);
    expect(f.height).toBe(2);
    // Expected (180 of R G / B W):
    // W B
    // G R
    expect(f.getPixel(0, 0)).toEqual(W);
    expect(f.getPixel(1, 0)).toEqual(B);
    expect(f.getPixel(0, 1)).toEqual(G);
    expect(f.getPixel(1, 1)).toEqual(R);
  });

  it('rotates 270° CW', () => {
    const f = rotate(frame2x2, 270);
    // Expected (270 CW of R G / B W):
    // G W
    // R B
    expect(f.getPixel(0, 0)).toEqual(G);
    expect(f.getPixel(1, 0)).toEqual(W);
    expect(f.getPixel(0, 1)).toEqual(R);
    expect(f.getPixel(1, 1)).toEqual(B);
  });
});

describe('scale', () => {
  it('scales by 2x', () => {
    const f = scale(frame2x2, 2);
    expect(f.width).toBe(4);
    expect(f.height).toBe(4);
    // Top-left 2x2 block should all be R
    expect(f.getPixel(0, 0)).toEqual(R);
    expect(f.getPixel(1, 0)).toEqual(R);
    expect(f.getPixel(0, 1)).toEqual(R);
    expect(f.getPixel(1, 1)).toEqual(R);
    // Top-right 2x2 block should all be G
    expect(f.getPixel(2, 0)).toEqual(G);
    expect(f.getPixel(3, 0)).toEqual(G);
  });

  it('scale(1) returns same frame', () => {
    const f = scale(frame2x2, 1);
    expect(f.getPixel(0, 0)).toEqual(R);
  });

  it('throws on non-integer factor', () => {
    expect(() => scale(frame2x2, 1.5)).toThrow('positive integer');
  });

  it('throws on factor < 1', () => {
    expect(() => scale(frame2x2, 0)).toThrow('positive integer');
  });
});

const T: RGBA = [0, 0, 0, 0];

describe('pad', () => {
  it('adds uniform padding', () => {
    const f = pad(frame2x2, 1, 1, 1, 1);
    expect(f.width).toBe(4);
    expect(f.height).toBe(4);
    // Corners are transparent (default)
    expect(f.getPixel(0, 0)).toEqual(T);
    expect(f.getPixel(3, 3)).toEqual(T);
    // Original content shifted by (1,1)
    expect(f.getPixel(1, 1)).toEqual(R);
    expect(f.getPixel(2, 1)).toEqual(G);
    expect(f.getPixel(1, 2)).toEqual(B);
    expect(f.getPixel(2, 2)).toEqual(W);
  });

  it('adds asymmetric padding', () => {
    const f = pad(frame2x2, 0, 2, 1, 0);
    expect(f.width).toBe(4); // 2 + 0 + 2
    expect(f.height).toBe(3); // 2 + 0 + 1
    expect(f.getPixel(0, 0)).toEqual(R);
    expect(f.getPixel(1, 0)).toEqual(G);
    expect(f.getPixel(2, 0)).toEqual(T);
  });

  it('uses custom fill color', () => {
    const fill: RGBA = [128, 128, 128, 255];
    const f = pad(frame2x2, 1, 0, 0, 0, fill);
    expect(f.getPixel(0, 0)).toEqual(fill);
    expect(f.getPixel(1, 0)).toEqual(fill);
  });

  it('zero padding returns same dimensions', () => {
    const f = pad(frame2x2, 0, 0, 0, 0);
    expect(f.width).toBe(2);
    expect(f.height).toBe(2);
    expect(f.getPixel(0, 0)).toEqual(R);
  });

  it('throws on negative padding', () => {
    expect(() => pad(frame2x2, -1, 0, 0, 0)).toThrow('non-negative');
  });

  it('throws on non-integer padding', () => {
    expect(() => pad(frame2x2, 1.5, 0, 0, 0)).toThrow('integers');
  });
});

describe('crop', () => {
  it('extracts a sub-region', () => {
    const f = crop(frame2x2, 1, 0, 1, 2);
    expect(f.width).toBe(1);
    expect(f.height).toBe(2);
    expect(f.getPixel(0, 0)).toEqual(G);
    expect(f.getPixel(0, 1)).toEqual(W);
  });

  it('full-frame crop returns same content', () => {
    const f = crop(frame2x2, 0, 0, 2, 2);
    expect(f.width).toBe(2);
    expect(f.height).toBe(2);
    expect(f.getPixel(0, 0)).toEqual(R);
    expect(f.getPixel(1, 1)).toEqual(W);
  });

  it('throws on out-of-bounds region', () => {
    expect(() => crop(frame2x2, 1, 1, 2, 2)).toThrow('extends beyond');
  });

  it('throws on negative x/y', () => {
    expect(() => crop(frame2x2, -1, 0, 1, 1)).toThrow('extends beyond');
  });

  it('throws on non-integer parameters', () => {
    expect(() => crop(frame2x2, 0.5, 0, 1, 1)).toThrow('integers');
  });

  it('throws on zero dimensions', () => {
    expect(() => crop(frame2x2, 0, 0, 0, 1)).toThrow('positive');
  });

  it('throws on negative dimensions', () => {
    expect(() => crop(frame2x2, 0, 0, -1, 1)).toThrow('positive');
  });
});

describe('opacity', () => {
  it('halves alpha at 0.5', () => {
    const f = opacity(frame2x2, 0.5);
    expect(f.getPixel(0, 0)).toEqual([255, 0, 0, 128]);
    expect(f.getPixel(1, 0)).toEqual([0, 255, 0, 128]);
  });

  it('makes fully transparent at 0', () => {
    const f = opacity(frame2x2, 0);
    expect(f.getPixel(0, 0)).toEqual([255, 0, 0, 0]);
    expect(f.getPixel(1, 1)).toEqual([255, 255, 255, 0]);
  });

  it('returns same frame at 1 (identity)', () => {
    const f = opacity(frame2x2, 1);
    expect(f).toBe(frame2x2);
  });

  it('preserves RGB channels', () => {
    const f = opacity(frame2x2, 0.5);
    const px = f.getPixel(0, 0);
    expect(px[0]).toBe(255);
    expect(px[1]).toBe(0);
    expect(px[2]).toBe(0);
  });

  it('already-transparent pixels stay transparent', () => {
    const frameWithTransparent = new Frame([
      [R, T],
      [T, G],
    ]);
    const f = opacity(frameWithTransparent, 0.5);
    expect(f.getPixel(1, 0)).toEqual([0, 0, 0, 0]);
    expect(f.getPixel(0, 1)).toEqual([0, 0, 0, 0]);
  });

  it('throws on alpha < 0', () => {
    expect(() => opacity(frame2x2, -0.1)).toThrow('between 0 and 1');
  });

  it('throws on alpha > 1', () => {
    expect(() => opacity(frame2x2, 1.5)).toThrow('between 0 and 1');
  });
});

describe('outline', () => {
  const outlineColor: RGBA = [255, 255, 0, 255];

  it('2x2 opaque frame + thickness=1 → 4x4 output with outline ring', () => {
    const f = outline(frame2x2, outlineColor, 1);
    expect(f.width).toBe(4);
    expect(f.height).toBe(4);
    // Corners should be outline color (adjacent to opaque pixels)
    expect(f.getPixel(0, 0)).toEqual(outlineColor);
    expect(f.getPixel(3, 3)).toEqual(outlineColor);
    // Original pixels preserved at offset (1,1)
    expect(f.getPixel(1, 1)).toEqual(R);
    expect(f.getPixel(2, 1)).toEqual(G);
    expect(f.getPixel(1, 2)).toEqual(B);
    expect(f.getPixel(2, 2)).toEqual(W);
  });

  it('uses custom outline color', () => {
    const pink: RGBA = [255, 0, 255, 255];
    const f = outline(frame2x2, pink, 1);
    expect(f.getPixel(0, 0)).toEqual(pink);
  });

  it('thickness=2 expands by 4 in each dimension', () => {
    const f = outline(frame2x2, outlineColor, 2);
    expect(f.width).toBe(6);
    expect(f.height).toBe(6);
    // Original pixels at offset (2,2)
    expect(f.getPixel(2, 2)).toEqual(R);
    expect(f.getPixel(3, 2)).toEqual(G);
  });

  it('throws on non-integer thickness', () => {
    expect(() => outline(frame2x2, outlineColor, 1.5)).toThrow('positive integer');
  });

  it('throws on zero thickness', () => {
    expect(() => outline(frame2x2, outlineColor, 0)).toThrow('positive integer');
  });

  it('only outlines around non-transparent pixels', () => {
    const sparseFrame = new Frame([
      [R, T],
      [T, T],
    ]);
    const f = outline(sparseFrame, outlineColor, 1);
    expect(f.width).toBe(4);
    expect(f.height).toBe(4);
    // (1,1) is original R pixel
    expect(f.getPixel(1, 1)).toEqual(R);
    // Neighbors of R should be outline
    expect(f.getPixel(0, 0)).toEqual(outlineColor);
    expect(f.getPixel(1, 0)).toEqual(outlineColor);
    expect(f.getPixel(2, 0)).toEqual(outlineColor);
    // Far from any opaque pixel should be transparent
    expect(f.getPixel(3, 3)).toEqual(T);
  });
});
