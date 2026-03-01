import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { PNG } from 'pngjs';
import { sprite } from '../src/sprite.js';
import { toAtlas } from '../src/render/atlas.js';
import { Frame } from '../src/frame.js';
import type { AtlasEntry } from '../src/types.js';

const palette = {
  '.': 'transparent',
  x: '#ff0000',
  o: '#0000ff',
};

describe('toAtlas', () => {
  it('packs sprites into an atlas', () => {
    const s1 = sprite({ palette, frames: ['xx\nxx'], name: 'red' });
    const s2 = sprite({ palette, frames: ['oo\noo'], name: 'blue' });

    const { buffer, metadata } = toAtlas([s1, s2]);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(metadata.frames).toHaveLength(2);
    expect(metadata.frames.map((f) => f.name).sort()).toEqual(['blue', 'red']);
  });

  it('produces non-overlapping frame placements', () => {
    const s1 = sprite({ palette, frames: ['xxx\nxxx\nxxx'], name: 'big' });
    const s2 = sprite({ palette, frames: ['oo\noo'], name: 'small' });
    const s3 = sprite({ palette, frames: ['x'], name: 'tiny' });

    const { metadata } = toAtlas([s1, s2, s3]);

    // Check no overlapping frames
    for (let i = 0; i < metadata.frames.length; i++) {
      for (let j = i + 1; j < metadata.frames.length; j++) {
        const a = metadata.frames[i]!;
        const b = metadata.frames[j]!;
        const overlapX = a.x < b.x + b.w && a.x + a.w > b.x;
        const overlapY = a.y < b.y + b.h && a.y + a.h > b.y;
        expect(overlapX && overlapY).toBe(false);
      }
    }
  });

  it('atlas dimensions match or exceed all frames', () => {
    const s1 = sprite({ palette, frames: ['xxxx'], name: 'wide' });
    const s2 = sprite({ palette, frames: ['o\no\no\no'], name: 'tall' });

    const { metadata } = toAtlas([s1, s2]);

    for (const frame of metadata.frames) {
      expect(frame.x + frame.w).toBeLessThanOrEqual(metadata.width);
      expect(frame.y + frame.h).toBeLessThanOrEqual(metadata.height);
    }
  });

  it('supports AtlasEntry input', () => {
    const frame = new Frame([[
      [255, 0, 0, 255],
      [0, 255, 0, 255],
    ]]);
    const entry: AtlasEntry = { name: 'custom', source: frame };
    const { metadata } = toAtlas([entry]);

    expect(metadata.frames).toHaveLength(1);
    expect(metadata.frames[0]!.name).toBe('custom');
  });

  it('throws on empty input', () => {
    expect(() => toAtlas([])).toThrow('at least one entry');
  });

  it('throws on duplicate names', () => {
    const s1 = sprite({ palette, frames: ['x'], name: 'hero' });
    const s2 = sprite({ palette, frames: ['o'], name: 'hero' });
    expect(() => toAtlas([s1, s2])).toThrow('Duplicate');
  });

  it('throws when exceeding max dimensions', () => {
    const s = sprite({ palette, frames: ['xxxx'], name: 'wide' });
    expect(() => toAtlas([s], { maxWidth: 2, maxHeight: 2 })).toThrow('exceeds');
  });

  it('applies padding between entries', () => {
    const s1 = sprite({ palette, frames: ['x'], name: 'a' });
    const s2 = sprite({ palette, frames: ['o'], name: 'b' });

    const { metadata } = toAtlas([s1, s2], { padding: 2 });

    // Both 1x1, same shelf, so b starts at x=3 (1 + 2 padding)
    const frameA = metadata.frames.find((f) => f.name === 'a')!;
    const frameB = metadata.frames.find((f) => f.name === 'b')!;
    // They should be on the same row with padding between them
    if (frameA.y === frameB.y) {
      const gap = Math.abs(frameB.x - (frameA.x + frameA.w));
      expect(gap).toBeGreaterThanOrEqual(2);
    }
  });

  it('rounds to power-of-two when pot=true', () => {
    const s = sprite({ palette, frames: ['xxx\nxxx\nxxx'], name: 'a' });
    const { metadata } = toAtlas([s], { pot: true, padding: 0 });

    // 3x3 → rounds up to 4x4
    expect(metadata.width).toBe(4);
    expect(metadata.height).toBe(4);
  });

  it('renders correct pixels in atlas PNG', () => {
    const s1 = sprite({ palette, frames: ['x'], name: 'red' });
    const s2 = sprite({ palette, frames: ['o'], name: 'blue' });

    const { buffer, metadata } = toAtlas([s1, s2], { padding: 0 });
    const png = PNG.sync.read(buffer);

    for (const frame of metadata.frames) {
      const i = (frame.y * png.width + frame.x) * 4;
      if (frame.name === 'red') {
        expect(png.data[i]).toBe(255);     // R
        expect(png.data[i + 1]).toBe(0);   // G
        expect(png.data[i + 2]).toBe(0);   // B
      } else {
        expect(png.data[i]).toBe(0);       // R
        expect(png.data[i + 1]).toBe(0);   // G
        expect(png.data[i + 2]).toBe(255); // B
      }
    }
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
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixlrt-atlas-'));
      const pngPath = path.join(tmpDir, 'atlas.png');
      const jsonPath = path.join(tmpDir, 'atlas.json');

      const s = sprite({ palette, frames: ['x'], name: 'hero' });
      const { buffer, metadata } = toAtlas([s], pngPath);

      expect(fs.existsSync(pngPath)).toBe(true);
      expect(fs.existsSync(jsonPath)).toBe(true);

      const writtenPng = fs.readFileSync(pngPath);
      expect(writtenPng).toEqual(buffer);

      const writtenMeta = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      expect(writtenMeta).toEqual(metadata);
    });
  });
});
