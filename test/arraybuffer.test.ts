import { describe, it, expect } from 'vitest';
import { sprite } from '../src/sprite.js';
import { toArrayBuffer } from '../src/render/arraybuffer.js';

const palette = {
  '.': 'transparent',
  x: '#ff0000',
  o: '#0000ff',
};

describe('toArrayBuffer', () => {
  it('returns an ArrayBuffer', () => {
    const s = sprite({ palette, frames: ['x'] });
    const result = toArrayBuffer(s);
    expect(result).toBeInstanceOf(ArrayBuffer);
  });

  it('has correct byte length', () => {
    const s = sprite({ palette, frames: ['xo\n.x'] });
    const result = toArrayBuffer(s);
    expect(result.byteLength).toBe(2 * 2 * 4);
  });

  it('contains correct RGBA data', () => {
    const s = sprite({ palette, frames: ['x'] });
    const result = toArrayBuffer(s);
    const view = new Uint8Array(result);
    expect(view[0]).toBe(255); // R
    expect(view[1]).toBe(0); // G
    expect(view[2]).toBe(0); // B
    expect(view[3]).toBe(255); // A
  });

  it('applies scale option', () => {
    const s = sprite({ palette, frames: ['x'] });
    const result = toArrayBuffer(s, { scale: 2 });
    expect(result.byteLength).toBe(2 * 2 * 4);
  });
});
