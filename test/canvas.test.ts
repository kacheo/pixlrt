import { describe, it, expect } from 'vitest';
import { PixelCanvas } from '../src/canvas.js';
import { Frame } from '../src/frame.js';
import type { RGBA } from '../src/types.js';

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
      [[255, 0, 0, 255], [0, 255, 0, 255]],
      [[0, 0, 255, 255], [255, 255, 0, 255]],
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
      [[0, 0, 0, 0], [255, 0, 0, 255]],
    ]);
    const canvas = new PixelCanvas(4, 4);
    canvas.fill([0, 128, 0, 255]);
    canvas.drawFrame(frame, 0, 0);
    // Transparent source should not overwrite
    expect(canvas.getPixel(0, 0)).toEqual([0, 128, 0, 255]);
    expect(canvas.getPixel(1, 0)).toEqual([255, 0, 0, 255]);
  });
});
