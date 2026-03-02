import { describe, it, expect } from 'vitest';
import { sprite } from '../src/sprite.js';
import { toImageData } from '../src/render/imagedata.js';

const palette = {
  '.': 'transparent',
  x: '#ff0000',
  o: '#0000ff',
};

describe('toImageData', () => {
  it('returns correct dimensions', () => {
    const s = sprite({ palette, frames: ['xo\n.x'] });
    const result = toImageData(s);
    expect(result.width).toBe(2);
    expect(result.height).toBe(2);
  });

  it('returns Uint8ClampedArray of correct length', () => {
    const s = sprite({ palette, frames: ['xo\n.x'] });
    const result = toImageData(s);
    expect(result.data).toBeInstanceOf(Uint8ClampedArray);
    expect(result.data.length).toBe(2 * 2 * 4);
  });

  it('writes correct RGBA values', () => {
    const s = sprite({ palette, frames: ['x'] });
    const result = toImageData(s);
    // Red pixel: [255, 0, 0, 255]
    expect(result.data[0]).toBe(255);
    expect(result.data[1]).toBe(0);
    expect(result.data[2]).toBe(0);
    expect(result.data[3]).toBe(255);
  });

  it('handles transparent pixels', () => {
    const s = sprite({ palette, frames: ['.'] });
    const result = toImageData(s);
    // Transparent: [0, 0, 0, 0]
    expect(result.data[0]).toBe(0);
    expect(result.data[1]).toBe(0);
    expect(result.data[2]).toBe(0);
    expect(result.data[3]).toBe(0);
  });

  it('applies scale option', () => {
    const s = sprite({ palette, frames: ['x'] });
    const result = toImageData(s, { scale: 3 });
    expect(result.width).toBe(3);
    expect(result.height).toBe(3);
    expect(result.data.length).toBe(3 * 3 * 4);
    // Every pixel should be red
    for (let i = 0; i < 9; i++) {
      expect(result.data[i * 4]).toBe(255);
      expect(result.data[i * 4 + 1]).toBe(0);
      expect(result.data[i * 4 + 2]).toBe(0);
      expect(result.data[i * 4 + 3]).toBe(255);
    }
  });

  it('preserves pixel order (row-major)', () => {
    const s = sprite({ palette, frames: ['xo'] });
    const result = toImageData(s);
    // pixel 0: red
    expect(result.data[0]).toBe(255);
    expect(result.data[1]).toBe(0);
    expect(result.data[2]).toBe(0);
    // pixel 1: blue
    expect(result.data[4]).toBe(0);
    expect(result.data[5]).toBe(0);
    expect(result.data[6]).toBe(255);
  });
});
