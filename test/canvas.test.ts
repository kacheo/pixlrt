import { describe, it, expect } from 'vitest';
import { PixelCanvas } from '../src/canvas.js';
import { Frame } from '../src/frame.js';
import type { Renderable, RGBA } from '../src/types.js';

describe('PixelCanvas', () => {
  it('initializes with transparent pixels', () => {
    const canvas = new PixelCanvas(4, 4);
    expect(canvas.getPixel(0, 0)).toEqual([0, 0, 0, 0]);
    expect(canvas.getPixel(3, 3)).toEqual([0, 0, 0, 0]);
  });

  it('sets and gets pixels', () => {
    const canvas = new PixelCanvas(4, 4);
    canvas.setPixel(1, 2, [255, 0, 0, 255]);
    expect(canvas.getPixel(1, 2)).toEqual([255, 0, 0, 255]);
    expect(canvas.getPixel(0, 0)).toEqual([0, 0, 0, 0]);
  });

  it('ignores out-of-bounds writes', () => {
    const canvas = new PixelCanvas(4, 4);
    canvas.setPixel(-1, 0, [255, 0, 0, 255]);
    canvas.setPixel(4, 0, [255, 0, 0, 255]);
    // no throw
  });

  it('returns transparent for out-of-bounds reads', () => {
    const canvas = new PixelCanvas(4, 4);
    expect(canvas.getPixel(-1, 0)).toEqual([0, 0, 0, 0]);
    expect(canvas.getPixel(4, 4)).toEqual([0, 0, 0, 0]);
  });

  it('fills entire canvas', () => {
    const canvas = new PixelCanvas(2, 2);
    canvas.fill([0, 128, 255, 255]);
    expect(canvas.getPixel(0, 0)).toEqual([0, 128, 255, 255]);
    expect(canvas.getPixel(1, 1)).toEqual([0, 128, 255, 255]);
  });

  it('draws a Frame with opaque pixels', () => {
    const frame = new Frame([
      [
        [255, 0, 0, 255],
        [0, 255, 0, 255],
      ],
      [
        [0, 0, 255, 255],
        [255, 255, 0, 255],
      ],
    ]);
    const canvas = new PixelCanvas(4, 4);
    canvas.drawFrame(frame, 1, 1);
    expect(canvas.getPixel(1, 1)).toEqual([255, 0, 0, 255]);
    expect(canvas.getPixel(2, 1)).toEqual([0, 255, 0, 255]);
    expect(canvas.getPixel(1, 2)).toEqual([0, 0, 255, 255]);
    expect(canvas.getPixel(0, 0)).toEqual([0, 0, 0, 0]); // untouched
  });

  it('skips transparent source pixels', () => {
    const frame = new Frame([
      [
        [0, 0, 0, 0],
        [255, 0, 0, 255],
      ],
    ]);
    const canvas = new PixelCanvas(4, 4);
    canvas.fill([0, 128, 0, 255]);
    canvas.drawFrame(frame, 0, 0);
    // Transparent source should not overwrite
    expect(canvas.getPixel(0, 0)).toEqual([0, 128, 0, 255]);
    expect(canvas.getPixel(1, 0)).toEqual([255, 0, 0, 255]);
  });

  it('drawRenderable with a mock Renderable', () => {
    const mock: Renderable = {
      width: 2,
      height: 1,
      getPixel(x: number): RGBA {
        return x === 0 ? [255, 0, 0, 255] : [0, 0, 255, 255];
      },
    };
    const canvas = new PixelCanvas(4, 4);
    canvas.drawRenderable(mock, 1, 2);
    expect(canvas.getPixel(1, 2)).toEqual([255, 0, 0, 255]);
    expect(canvas.getPixel(2, 2)).toEqual([0, 0, 255, 255]);
    expect(canvas.getPixel(0, 2)).toEqual([0, 0, 0, 0]);
  });

  it('drawRenderable blends semi-transparent pixels (Porter-Duff)', () => {
    const canvas = new PixelCanvas(1, 1);
    canvas.fill([255, 0, 0, 255]); // opaque red background

    const semi: Renderable = {
      width: 1,
      height: 1,
      getPixel(): RGBA {
        return [0, 0, 255, 128]; // semi-transparent blue
      },
    };
    canvas.drawRenderable(semi, 0, 0);

    const [r, g, b, a] = canvas.getPixel(0, 0);
    // Blue should be blended over red
    expect(r).toBeLessThan(255);
    expect(b).toBeGreaterThan(0);
    expect(a).toBe(255); // result should be fully opaque
    expect(g).toBe(0);
  });

  it('drawRenderable clips out-of-bounds pixels', () => {
    const mock: Renderable = {
      width: 3,
      height: 3,
      getPixel(): RGBA {
        return [255, 0, 0, 255];
      },
    };
    const canvas = new PixelCanvas(2, 2);
    canvas.drawRenderable(mock, 1, 1);
    // Only (1,1) should be drawn; (2,2) and beyond are out of bounds
    expect(canvas.getPixel(1, 1)).toEqual([255, 0, 0, 255]);
    expect(canvas.getPixel(0, 0)).toEqual([0, 0, 0, 0]);
  });

  it('drawFrame blends semi-transparent pixels (Porter-Duff)', () => {
    const canvas = new PixelCanvas(1, 1);
    canvas.fill([255, 0, 0, 255]);

    const frame = new Frame([[[0, 0, 255, 128]]]);
    canvas.drawFrame(frame, 0, 0);

    const pixel = canvas.getPixel(0, 0);
    expect(pixel[0]).toBeLessThan(255);
    expect(pixel[2]).toBeGreaterThan(0);
    expect(pixel[3]).toBe(255);
  });
});
