import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { PNG } from 'pngjs';
import { sprite } from '../src/sprite.js';
import { toTaggedSpriteSheet } from '../src/render/spritesheet.js';

const palette = {
  '.': 'transparent',
  x: '#ff0000',
  o: '#0000ff',
};

describe('toTaggedSpriteSheet', () => {
  it('creates tagged metadata with correct from/to indices', () => {
    const idle = sprite({ palette, frames: ['x', 'o'], name: 'idle' });
    const run = sprite({ palette, frames: ['x', 'o', 'x'], name: 'run' });

    const { metadata } = toTaggedSpriteSheet({ idle, run });

    expect(metadata.tags).toHaveLength(2);
    expect(metadata.tags[0]).toEqual({ name: 'idle', from: 0, to: 1, direction: 'forward' });
    expect(metadata.tags[1]).toEqual({ name: 'run', from: 2, to: 4, direction: 'forward' });
  });

  it('includes all frames from all sprites', () => {
    const idle = sprite({ palette, frames: ['x', 'o'], frameDuration: [100, 200] });
    const run = sprite({ palette, frames: ['x'], frameDuration: [150] });

    const { metadata } = toTaggedSpriteSheet({ idle, run });

    expect(metadata.frames).toHaveLength(3);
    expect(metadata.frames[0]!.duration).toBe(100);
    expect(metadata.frames[1]!.duration).toBe(200);
    expect(metadata.frames[2]!.duration).toBe(150);
  });

  it('produces valid PNG with correct dimensions', () => {
    const idle = sprite({
      palette,
      frames: ['xo\nox', 'ox\nxo'],
    });
    const run = sprite({
      palette,
      frames: ['xo\nox'],
    });

    const { buffer, metadata } = toTaggedSpriteSheet({ idle, run });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(metadata.frameWidth).toBe(2);
    expect(metadata.frameHeight).toBe(2);

    const png = PNG.sync.read(buffer);
    // 3 total frames, ceil(sqrt(3)) = 2 columns, 2 rows
    expect(png.width).toBe(4); // 2 cols * 2px
    expect(png.height).toBe(4); // 2 rows * 2px
  });

  it('throws when sprites have different dimensions', () => {
    const small = sprite({ palette, frames: ['x'] });
    const big = sprite({ palette, frames: ['xo\nox'] });

    expect(() => toTaggedSpriteSheet({ small, big })).toThrow('same dimensions');
  });

  it('throws when given no sprites', () => {
    expect(() => toTaggedSpriteSheet({})).toThrow('at least one sprite');
  });

  it('respects columns and padding options', () => {
    const idle = sprite({ palette, frames: ['x', 'x', 'x', 'x'] });

    const { buffer } = toTaggedSpriteSheet({ idle }, { columns: 2, padding: 1 });
    const png = PNG.sync.read(buffer);
    // 4 frames, 2 columns, 2 rows. Cell = 1+1 = 2. Sheet = 2*2-1 = 3.
    expect(png.width).toBe(3);
    expect(png.height).toBe(3);
  });

  describe('file write', () => {
    let tmpDir: string | undefined;

    afterEach(() => {
      if (tmpDir) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        tmpDir = undefined;
      }
    });

    it('writes .png and .json files to disk', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixlrt-tagged-'));
      const pngPath = path.join(tmpDir, 'sheet.png');
      const jsonPath = path.join(tmpDir, 'sheet.json');

      const idle = sprite({ palette, frames: ['x', 'o'] });
      const run = sprite({ palette, frames: ['x'] });

      const { buffer, metadata } = toTaggedSpriteSheet({ idle, run }, pngPath);

      expect(fs.existsSync(pngPath)).toBe(true);
      expect(fs.existsSync(jsonPath)).toBe(true);

      const writtenPng = fs.readFileSync(pngPath);
      expect(writtenPng).toEqual(buffer);

      const writtenMeta = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      expect(writtenMeta).toEqual(metadata);
      expect(writtenMeta.tags).toHaveLength(2);
    });
  });
});
