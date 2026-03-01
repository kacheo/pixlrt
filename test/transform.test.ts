import { describe, it, expect } from 'vitest';
import { Frame } from '../src/frame.js';
import { flipX, flipY, rotate, scale } from '../src/transform.js';
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
