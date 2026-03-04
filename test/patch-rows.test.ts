import { describe, it, expect } from 'vitest';
import { sprite } from '../src/sprite.js';
import type { RGBA } from '../src/types.js';

const palette = {
  '.': 'transparent',
  x: '#ff0000',
  o: '#0000ff',
  g: '#00ff00',
};

const T: RGBA = [0, 0, 0, 0];

describe('Sprite.patchRows()', () => {
  const s = sprite({
    palette,
    frames: ['xo\nox'],
  });

  it('replaces specified rows', () => {
    const patched = s.patchRows({ 0: 'oo' });
    expect(patched.getPixel(0, 0)).toEqual([0, 0, 255, 255]);
    expect(patched.getPixel(1, 0)).toEqual([0, 0, 255, 255]);
    // Row 1 unchanged
    expect(patched.getPixel(0, 1)).toEqual([0, 0, 255, 255]);
    expect(patched.getPixel(1, 1)).toEqual([255, 0, 0, 255]);
  });

  it('returns a new sprite (immutable)', () => {
    const patched = s.patchRows({ 0: 'oo' });
    expect(patched).not.toBe(s);
    // Original unchanged
    expect(s.getPixel(0, 0)).toEqual([255, 0, 0, 255]);
  });

  it('supports space-separated row strings', () => {
    const s3 = sprite({
      palette,
      frames: ['xox\nooo'],
    });
    const patched = s3.patchRows({ 0: 'o x o' });
    expect(patched.getPixel(0, 0)).toEqual([0, 0, 255, 255]);
    expect(patched.getPixel(1, 0)).toEqual([255, 0, 0, 255]);
    expect(patched.getPixel(2, 0)).toEqual([0, 0, 255, 255]);
  });

  it('supports transparent in patches', () => {
    const patched = s.patchRows({ 0: '..' });
    expect(patched.getPixel(0, 0)).toEqual(T);
    expect(patched.getPixel(1, 0)).toEqual(T);
  });

  it('throws on wrong row width', () => {
    expect(() => s.patchRows({ 0: 'xox' })).toThrow("doesn't match");
  });

  it('throws on unknown palette character', () => {
    expect(() => s.patchRows({ 0: 'zz' })).toThrow("Unknown palette character 'z'");
  });

  it('throws on out-of-range frame index', () => {
    expect(() => s.patchRows({ 0: 'xx' }, 5)).toThrow('out of range');
  });

  it('only patches the specified frame', () => {
    const ms = sprite({
      palette,
      frames: ['xo\nox', 'ox\nxo'],
    });
    const patched = ms.patchRows({ 0: 'oo' }, 0);
    // Frame 0 patched
    expect(patched.frame(0).getPixel(0, 0)).toEqual([0, 0, 255, 255]);
    // Frame 1 untouched
    expect(patched.frame(1).getPixel(0, 0)).toEqual([0, 0, 255, 255]);
    expect(patched.frame(1).getPixel(1, 0)).toEqual([255, 0, 0, 255]);
  });

  it('patches multiple rows at once', () => {
    const s3 = sprite({
      palette,
      frames: ['xo\nox\nxo'],
    });
    const patched = s3.patchRows({ 0: 'oo', 2: 'xx' });
    expect(patched.getPixel(0, 0)).toEqual([0, 0, 255, 255]);
    expect(patched.getPixel(0, 2)).toEqual([255, 0, 0, 255]);
    expect(patched.getPixel(1, 2)).toEqual([255, 0, 0, 255]);
  });
});
