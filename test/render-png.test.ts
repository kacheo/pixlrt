import { describe, it, expect } from 'vitest';
import { PNG } from 'pngjs';
import { sprite } from '../src/sprite.js';
import { PixelCanvas } from '../src/canvas.js';
import { toPNG } from '../src/render/png.js';

const palette = {
  '.': 'transparent',
  'x': '#ff0000',
};

describe('toPNG', () => {
  it('returns a valid PNG buffer from a sprite', () => {
    const s = sprite({
      palette,
      frames: [`
        x.
        .x
      `],
    });
    const buf = toPNG(s);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(0);

    // Parse back and verify
    const png = PNG.sync.read(buf);
    expect(png.width).toBe(2);
    expect(png.height).toBe(2);
    // Top-left pixel should be red
    expect(png.data[0]).toBe(255);
    expect(png.data[1]).toBe(0);
    expect(png.data[2]).toBe(0);
    expect(png.data[3]).toBe(255);
  });

  it('scales output', () => {
    const s = sprite({ palette, frames: ['x'] });
    const buf = toPNG(s, { scale: 4 });
    const png = PNG.sync.read(buf);
    expect(png.width).toBe(4);
    expect(png.height).toBe(4);
  });

  it('renders from PixelCanvas', () => {
    const canvas = new PixelCanvas(2, 2);
    canvas.setPixel(0, 0, [0, 255, 0, 255]);
    const buf = toPNG(canvas);
    const png = PNG.sync.read(buf);
    expect(png.width).toBe(2);
    expect(png.data[0]).toBe(0);
    expect(png.data[1]).toBe(255);
  });
});
