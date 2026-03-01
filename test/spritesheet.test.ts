import { describe, it, expect } from 'vitest';
import { PNG } from 'pngjs';
import { sprite } from '../src/sprite.js';
import { toSpriteSheet } from '../src/render/spritesheet.js';

const palette = {
  '.': 'transparent',
  'x': '#ff0000',
  'o': '#0000ff',
};

describe('toSpriteSheet', () => {
  it('creates a sprite sheet with metadata', () => {
    const s = sprite({
      palette,
      frames: ['xo\nox', 'ox\nxo', 'xx\noo', 'oo\nxx'],
    });
    const { buffer, metadata } = toSpriteSheet(s);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(metadata.frames.length).toBe(4);
    expect(metadata.frameWidth).toBe(2);
    expect(metadata.frameHeight).toBe(2);

    // Verify PNG dimensions - 4 frames, ceil(sqrt(4))=2 columns, 2 rows
    const png = PNG.sync.read(buffer);
    expect(png.width).toBe(4); // 2 cols * 2px
    expect(png.height).toBe(4); // 2 rows * 2px
  });

  it('respects custom columns', () => {
    const s = sprite({
      palette,
      frames: ['x', 'o', 'x', 'o'],
    });
    const { metadata } = toSpriteSheet(s, { columns: 4 });
    expect(metadata.frames[0]!.x).toBe(0);
    expect(metadata.frames[1]!.x).toBe(1);
    expect(metadata.frames[2]!.x).toBe(2);
    expect(metadata.frames[3]!.x).toBe(3);
  });

  it('includes padding between frames', () => {
    const s = sprite({
      palette,
      frames: ['x', 'o'],
    });
    const { buffer } = toSpriteSheet(s, { columns: 2, padding: 2 });
    const png = PNG.sync.read(buffer);
    // 2 cols of 1px with 2px padding between = 1 + 2 + 1 = 4
    expect(png.width).toBe(4);
  });

  it('includes frame durations in metadata', () => {
    const s = sprite({
      palette,
      frames: ['x', 'o'],
      frameDuration: [100, 200],
    });
    const { metadata } = toSpriteSheet(s);
    expect(metadata.frames[0]!.duration).toBe(100);
    expect(metadata.frames[1]!.duration).toBe(200);
  });
});
