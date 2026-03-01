import { describe, it, expect } from 'vitest';
import { sprite, Sprite } from '../src/sprite.js';
import { Frame } from '../src/frame.js';

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

  it('accepts RGBA tuple', () => {
    const s = sprite({ palette, frames: ['xo'] });
    const r = s.recolor({ x: [0, 255, 0, 255] as [number, number, number, number] });
    expect(r.getPixel(0, 0)).toEqual([0, 255, 0, 255]);
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

describe('Sprite.opacity()', () => {
  const s = sprite({
    palette,
    frames: [`xo\nox`],
  });

  it('halves alpha of all pixels', () => {
    const o = s.opacity(0.5);
    expect(o).not.toBe(s);
    expect(o.getPixel(0, 0)).toEqual([255, 0, 0, 128]);
    expect(o.getPixel(1, 0)).toEqual([0, 0, 255, 128]);
  });
});

describe('Sprite.outline()', () => {
  const s = sprite({
    palette,
    frames: [`x`],
  });

  it('adds outline with ColorInput string', () => {
    const o = s.outline('#ffff00');
    expect(o.width).toBe(3);
    expect(o.height).toBe(3);
    // Center pixel preserved
    expect(o.getPixel(1, 1)).toEqual([255, 0, 0, 255]);
    // Outline pixels
    expect(o.getPixel(0, 0)).toEqual([255, 255, 0, 255]);
  });
});

describe('Sprite.pad()', () => {
  const s = sprite({
    palette,
    frames: [`xo\nox`],
  });

  it('returns new sprite with increased dimensions', () => {
    const p = s.pad(1, 1, 1, 1);
    expect(p).not.toBe(s);
    expect(p.width).toBe(4);
    expect(p.height).toBe(4);
    // Original content at (1,1)
    expect(p.getPixel(1, 1)).toEqual([255, 0, 0, 255]);
  });

  it('accepts ColorInput (hex string)', () => {
    const p = s.pad(1, 0, 0, 0, '#ff00ff');
    expect(p.getPixel(0, 0)).toEqual([255, 0, 255, 255]);
  });

  it('transforms all frames in multi-frame sprite', () => {
    const ms = sprite({ palette, frames: ['xo\nox', 'ox\nxo'] });
    const p = ms.pad(1, 0, 0, 0);
    expect(p.frames.length).toBe(2);
    expect(p.width).toBe(2);
    expect(p.height).toBe(3);
  });
});

describe('Sprite.crop()', () => {
  const s = sprite({
    palette,
    frames: [`xo\nox`],
  });

  it('returns new sprite with decreased dimensions', () => {
    const c = s.crop(0, 0, 1, 2);
    expect(c).not.toBe(s);
    expect(c.width).toBe(1);
    expect(c.height).toBe(2);
    expect(c.getPixel(0, 0)).toEqual([255, 0, 0, 255]);
    expect(c.getPixel(0, 1)).toEqual([0, 0, 255, 255]);
  });

  it('transforms all frames in multi-frame sprite', () => {
    const ms = sprite({ palette, frames: ['xo\nox', 'ox\nxo'] });
    const c = ms.crop(0, 0, 1, 2);
    expect(c.frames.length).toBe(2);
    expect(c.frame(0).getPixel(0, 0)).toEqual([255, 0, 0, 255]);
    expect(c.frame(1).getPixel(0, 0)).toEqual([0, 0, 255, 255]);
  });

  it('chains with pad', () => {
    const result = s.pad(1, 1, 1, 1).crop(1, 1, 2, 2);
    expect(result.width).toBe(2);
    expect(result.height).toBe(2);
    expect(result.getPixel(0, 0)).toEqual([255, 0, 0, 255]);
  });
});

describe('Sprite constructor validation', () => {
  it('throws when frameDuration length does not match frames length', () => {
    const frame = new Frame([[[255, 0, 0, 255]]]);
    expect(
      () =>
        new Sprite({
          name: 'test',
          frames: [frame, frame],
          palette: { x: '#ff0000' },
          origin: { x: 0, y: 0 },
          frameDuration: [100],
        }),
    ).toThrow('frameDuration length (1) must match frames length (2)');
  });
});
