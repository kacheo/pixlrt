import { describe, it, expect } from 'vitest';
import { Frame } from '../src/frame.js';
import { ninePatchMeta, ninePatchResize } from '../src/nine-patch.js';
import type { RGBA, NinePatchEdges } from '../src/types.js';
import { sprite } from '../src/sprite.js';

// Build a 4x4 frame with distinct corners, edges, and center:
// A A B B
// A A B B
// C C D D
// C C D D
const A: RGBA = [255, 0, 0, 255];
const B: RGBA = [0, 255, 0, 255];
const C: RGBA = [0, 0, 255, 255];
const D: RGBA = [255, 255, 0, 255];

const frame4x4 = new Frame([
  [A, A, B, B],
  [A, A, B, B],
  [C, C, D, D],
  [C, C, D, D],
]);

const edges: NinePatchEdges = { top: 2, right: 2, bottom: 2, left: 2 };

describe('ninePatchMeta', () => {
  it('correctly computes 9 regions', () => {
    const meta = ninePatchMeta(frame4x4, edges);
    expect(meta.topLeft).toEqual({ x: 0, y: 0, w: 2, h: 2 });
    expect(meta.topCenter).toEqual({ x: 2, y: 0, w: 0, h: 2 });
    expect(meta.topRight).toEqual({ x: 2, y: 0, w: 2, h: 2 });
    expect(meta.middleLeft).toEqual({ x: 0, y: 2, w: 2, h: 0 });
    expect(meta.center).toEqual({ x: 2, y: 2, w: 0, h: 0 });
    expect(meta.middleRight).toEqual({ x: 2, y: 2, w: 2, h: 0 });
    expect(meta.bottomLeft).toEqual({ x: 0, y: 2, w: 2, h: 2 });
    expect(meta.bottomCenter).toEqual({ x: 2, y: 2, w: 0, h: 2 });
    expect(meta.bottomRight).toEqual({ x: 2, y: 2, w: 2, h: 2 });
    expect(meta.sourceWidth).toBe(4);
    expect(meta.sourceHeight).toBe(4);
  });

  it('throws if edges exceed frame width', () => {
    expect(() => ninePatchMeta(frame4x4, { top: 1, right: 3, bottom: 1, left: 3 })).toThrow(
      'exceed frame width',
    );
  });

  it('throws if edges exceed frame height', () => {
    expect(() => ninePatchMeta(frame4x4, { top: 3, right: 1, bottom: 3, left: 1 })).toThrow(
      'exceed frame height',
    );
  });
});

describe('ninePatchResize', () => {
  it('resize at source size returns same content', () => {
    const result = ninePatchResize(frame4x4, edges, 4, 4);
    expect(result.width).toBe(4);
    expect(result.height).toBe(4);
    expect(result.getPixel(0, 0)).toEqual(A);
    expect(result.getPixel(3, 0)).toEqual(B);
    expect(result.getPixel(0, 3)).toEqual(C);
    expect(result.getPixel(3, 3)).toEqual(D);
  });

  it('resize larger: corners fixed, center tiles', () => {
    // Edges are 1px each for a clearer test with center
    const smallEdges: NinePatchEdges = { top: 1, right: 1, bottom: 1, left: 1 };
    const result = ninePatchResize(frame4x4, smallEdges, 6, 6);
    expect(result.width).toBe(6);
    expect(result.height).toBe(6);
    // Top-left corner preserved
    expect(result.getPixel(0, 0)).toEqual(A);
    // Top-right corner preserved
    expect(result.getPixel(5, 0)).toEqual(B);
    // Bottom-left corner preserved
    expect(result.getPixel(0, 5)).toEqual(C);
    // Bottom-right corner preserved
    expect(result.getPixel(5, 5)).toEqual(D);
  });

  it('throws if target width too small', () => {
    expect(() => ninePatchResize(frame4x4, edges, 3, 4)).toThrow('smaller than left + right');
  });

  it('throws if target height too small', () => {
    expect(() => ninePatchResize(frame4x4, edges, 4, 3)).toThrow('smaller than top + bottom');
  });
});

describe('Sprite.ninePatch()', () => {
  const palette = { A: [255, 0, 0, 255] as RGBA, '.': 'transparent' };
  const s = sprite({
    palette,
    frames: ['AA\nAA'],
  });

  it('resizes sprite using nine-patch rules', () => {
    const np = s.ninePatch({ top: 1, right: 1, bottom: 1, left: 1 }, 4, 4);
    expect(np.width).toBe(4);
    expect(np.height).toBe(4);
    // All pixels should be A (corners preserved, center tiled)
    expect(np.getPixel(0, 0)).toEqual([255, 0, 0, 255]);
    expect(np.getPixel(3, 3)).toEqual([255, 0, 0, 255]);
  });
});
