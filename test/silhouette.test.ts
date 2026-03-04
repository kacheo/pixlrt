import { describe, it, expect } from 'vitest';
import { Frame } from '../src/frame.js';
import { silhouette } from '../src/transform.js';
import { sprite } from '../src/sprite.js';
import type { RGBA } from '../src/types.js';

const R: RGBA = [255, 0, 0, 255];
const G: RGBA = [0, 255, 0, 128];
const T: RGBA = [0, 0, 0, 0];
const W: RGBA = [255, 255, 255, 255];

describe('silhouette (transform)', () => {
  it('replaces all non-transparent pixels with given color', () => {
    const frame = new Frame([
      [R, G],
      [T, R],
    ]);
    const result = silhouette(frame, W);
    expect(result.getPixel(0, 0)).toEqual(W);
    expect(result.getPixel(1, 0)).toEqual([255, 255, 255, 128]); // alpha preserved
    expect(result.getPixel(0, 1)).toEqual(T);
    expect(result.getPixel(1, 1)).toEqual(W);
  });

  it('preserves alpha values', () => {
    const semi: RGBA = [100, 50, 25, 100];
    const frame = new Frame([[semi]]);
    const result = silhouette(frame, [0, 0, 0, 255]);
    expect(result.getPixel(0, 0)).toEqual([0, 0, 0, 100]);
  });

  it('returns all transparent for fully transparent frame', () => {
    const frame = new Frame([[T, T], [T, T]]);
    const result = silhouette(frame, W);
    expect(result.getPixel(0, 0)).toEqual(T);
    expect(result.getPixel(1, 1)).toEqual(T);
  });
});

describe('Sprite.silhouette()', () => {
  it('returns a new sprite with silhouetted pixels', () => {
    const s = sprite({
      palette: { '.': 'transparent', x: '#ff0000', o: '#0000ff' },
      frames: ['xo\n.x'],
    });
    const sil = s.silhouette('#ffffff');
    expect(sil).not.toBe(s);
    expect(sil.getPixel(0, 0)).toEqual(W);
    expect(sil.getPixel(1, 0)).toEqual(W);
    expect(sil.getPixel(0, 1)).toEqual(T);
    expect(sil.getPixel(1, 1)).toEqual(W);
  });

  it('silhouettes all frames', () => {
    const s = sprite({
      palette: { '.': 'transparent', x: '#ff0000', o: '#0000ff' },
      frames: ['xo', 'ox'],
    });
    const sil = s.silhouette('#00ff00');
    expect(sil.frame(0).getPixel(0, 0)).toEqual([0, 255, 0, 255]);
    expect(sil.frame(1).getPixel(0, 0)).toEqual([0, 255, 0, 255]);
  });
});
