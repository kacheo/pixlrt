import { describe, it, expect } from 'vitest';
import { sprite } from '../src/sprite.js';

const palette = {
  '.': 'transparent',
  x: '#ff0000',
  o: '#0000ff',
};

describe('sprite()', () => {
  it('creates a sprite from ASCII grid', () => {
    const s = sprite({
      palette,
      frames: [
        `
        xo
        ox
      `,
      ],
    });
    expect(s.width).toBe(2);
    expect(s.height).toBe(2);
    expect(s.frames.length).toBe(1);
    expect(s.getPixel(0, 0)).toEqual([255, 0, 0, 255]);
    expect(s.getPixel(1, 0)).toEqual([0, 0, 255, 255]);
  });

  it('creates multi-frame sprite', () => {
    const s = sprite({
      palette,
      frames: ['xo\nox', 'ox\nxo'],
    });
    expect(s.frames.length).toBe(2);
  });

  it('sets name and origin', () => {
    const s = sprite({
      palette,
      frames: ['x'],
      name: 'test',
      origin: { x: 4, y: 8 },
    });
    expect(s.name).toBe('test');
    expect(s.origin).toEqual({ x: 4, y: 8 });
  });

  it('defaults name to untitled', () => {
    const s = sprite({ palette, frames: ['x'] });
    expect(s.name).toBe('untitled');
  });
});

describe('Sprite transforms', () => {
  const s = sprite({
    palette,
    frames: [
      `
      xo
      .x
    `,
    ],
  });

  it('flipX returns a new sprite', () => {
    const f = s.flipX();
    expect(f).not.toBe(s);
    expect(f.width).toBe(2);
    expect(f.height).toBe(2);
    // Original top-left is red, flipped top-left should be blue
    expect(f.getPixel(0, 0)).toEqual([0, 0, 255, 255]);
  });

  it('flipY returns a new sprite', () => {
    const f = s.flipY();
    expect(f).not.toBe(s);
  });

  it('rotate returns a new sprite', () => {
    const r = s.rotate(90);
    expect(r).not.toBe(s);
  });

  it('scale returns a new sprite', () => {
    const sc = s.scale(3);
    expect(sc.width).toBe(6);
    expect(sc.height).toBe(6);
  });
});

describe('Sprite.frame()', () => {
  it('returns specific frame', () => {
    const s = sprite({ palette, frames: ['xo\nox', 'ox\nxo'] });
    const f0 = s.frame(0);
    const f1 = s.frame(1);
    expect(f0.getPixel(0, 0)).toEqual([255, 0, 0, 255]);
    expect(f1.getPixel(0, 0)).toEqual([0, 0, 255, 255]);
  });

  it('throws on out-of-range index', () => {
    const s = sprite({ palette, frames: ['x'] });
    expect(() => s.frame(5)).toThrow('out of range');
  });
});

describe('Sprite.recolor()', () => {
  it('swaps palette colors', () => {
    const s = sprite({ palette, frames: ['xo\nox'] });
    const r = s.recolor({ x: '#00ff00', o: '#ffff00' });
    expect(r.getPixel(0, 0)).toEqual([0, 255, 0, 255]);
    expect(r.getPixel(1, 0)).toEqual([255, 255, 0, 255]);
  });

  it('ignores unknown palette keys', () => {
    const s = sprite({ palette, frames: ['xo'] });
    const r = s.recolor({ z: '#00ff00' });
    // Pixels unchanged
    expect(r.getPixel(0, 0)).toEqual([255, 0, 0, 255]);
    expect(r.getPixel(1, 0)).toEqual([0, 0, 255, 255]);
  });

  it('handles empty mapping', () => {
    const s = sprite({ palette, frames: ['xo'] });
    const r = s.recolor({});
    expect(r.getPixel(0, 0)).toEqual([255, 0, 0, 255]);
    expect(r.getPixel(1, 0)).toEqual([0, 0, 255, 255]);
  });

  it('recolors all frames in a multi-frame sprite', () => {
    const s = sprite({ palette, frames: ['xo', 'ox'] });
    const r = s.recolor({ x: '#00ff00' });
    // Frame 0: green, blue
    expect(r.getPixel(0, 0)).toEqual([0, 255, 0, 255]);
    expect(r.getPixel(1, 0)).toEqual([0, 0, 255, 255]);
    // Frame 1: blue, green
    expect(r.frame(1).getPixel(0, 0)).toEqual([0, 0, 255, 255]);
    expect(r.frame(1).getPixel(1, 0)).toEqual([0, 255, 0, 255]);
  });
});
