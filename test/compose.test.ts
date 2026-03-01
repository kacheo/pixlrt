import { describe, it, expect } from 'vitest';
import { compose } from '../src/compose.js';
import { sprite } from '../src/sprite.js';

const palette = {
  '.': 'transparent',
  'x': '#ff0000',
  'o': '#0000ff',
};

describe('compose', () => {
  it('places sprites on a canvas', () => {
    const s = sprite({ palette, frames: ['x'] });
    const canvas = compose()
      .place(s, { x: 0, y: 0 })
      .render();
    expect(canvas.width).toBe(1);
    expect(canvas.height).toBe(1);
    expect(canvas.getPixel(0, 0)).toEqual([255, 0, 0, 255]);
  });

  it('computes bounding box from placed items', () => {
    const s = sprite({ palette, frames: ['x'] });
    const canvas = compose()
      .place(s, { x: 0, y: 0 })
      .place(s, { x: 4, y: 4 })
      .render();
    expect(canvas.width).toBe(5);
    expect(canvas.height).toBe(5);
  });

  it('fills background color', () => {
    const s = sprite({ palette, frames: ['x'] });
    const canvas = compose({ background: '#00ff00' })
      .place(s, { x: 1, y: 1 })
      .render();
    // Background at (0,0)
    expect(canvas.getPixel(0, 0)).toEqual([0, 255, 0, 255]);
    // Sprite at (1,1)
    expect(canvas.getPixel(1, 1)).toEqual([255, 0, 0, 255]);
  });

  it('handles negative coordinates', () => {
    const s = sprite({ palette, frames: ['x'] });
    const canvas = compose()
      .place(s, { x: -2, y: -2 })
      .place(s, { x: 2, y: 2 })
      .render();
    // Canvas should shift to accommodate negative coords
    expect(canvas.width).toBe(5);
    expect(canvas.height).toBe(5);
    // The sprite at (-2,-2) should be at (0,0) after shifting
    expect(canvas.getPixel(0, 0)).toEqual([255, 0, 0, 255]);
  });

  it('respects fixed width/height', () => {
    const s = sprite({ palette, frames: ['x'] });
    const canvas = compose({ width: 10, height: 10 })
      .place(s, { x: 0, y: 0 })
      .render();
    expect(canvas.width).toBe(10);
    expect(canvas.height).toBe(10);
  });
});
