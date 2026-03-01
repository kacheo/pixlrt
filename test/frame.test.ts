import { describe, it, expect } from 'vitest';
import { Frame } from '../src/frame.js';
import type { RGBA, PixelGrid } from '../src/types.js';

describe('Frame', () => {
  const red: RGBA = [255, 0, 0, 255];
  const blue: RGBA = [0, 0, 255, 255];
  const transparent: RGBA = [0, 0, 0, 0];

  const pixels: PixelGrid = [
    [red, blue],
    [blue, red],
  ];

  it('sets width and height from pixel grid', () => {
    const f = new Frame(pixels);
    expect(f.width).toBe(2);
    expect(f.height).toBe(2);
  });

  it('getPixel returns correct RGBA value', () => {
    const f = new Frame(pixels);
    expect(f.getPixel(0, 0)).toEqual(red);
    expect(f.getPixel(1, 0)).toEqual(blue);
    expect(f.getPixel(0, 1)).toEqual(blue);
    expect(f.getPixel(1, 1)).toEqual(red);
  });

  it('out-of-bounds coordinates return transparent', () => {
    const f = new Frame(pixels);
    expect(f.getPixel(5, 0)).toEqual(transparent);
    expect(f.getPixel(0, 5)).toEqual(transparent);
    expect(f.getPixel(99, 99)).toEqual(transparent);
  });

  it('negative coordinates return transparent', () => {
    const f = new Frame(pixels);
    expect(f.getPixel(-1, 0)).toEqual(transparent);
    expect(f.getPixel(0, -1)).toEqual(transparent);
    expect(f.getPixel(-1, -1)).toEqual(transparent);
  });

  it('empty grid produces width: 0, height: 0', () => {
    const f = new Frame([]);
    expect(f.width).toBe(0);
    expect(f.height).toBe(0);
  });

  it('implements Renderable interface', () => {
    const f = new Frame(pixels);
    expect(typeof f.width).toBe('number');
    expect(typeof f.height).toBe('number');
    expect(typeof f.getPixel).toBe('function');
  });
});
