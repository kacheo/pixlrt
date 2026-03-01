import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { PNG } from 'pngjs';
import { sprite } from '../src/sprite.js';
import { toMultiScale } from '../src/render/multiscale.js';

const palette = {
  '.': 'transparent',
  x: '#ff0000',
};

describe('toMultiScale', () => {
  it('generates buffers at default scales (1, 2, 3)', () => {
    const s = sprite({ palette, frames: ['xx\nxx'] });
    const result = toMultiScale(s);

    expect(result.scales).toHaveLength(3);
    expect(result.scales.map((r) => r.scale)).toEqual([1, 2, 3]);

    // Verify dimensions at each scale
    for (const { scale, buffer } of result.scales) {
      const png = PNG.sync.read(buffer);
      expect(png.width).toBe(2 * scale);
      expect(png.height).toBe(2 * scale);
    }
  });

  it('respects custom scales', () => {
    const s = sprite({ palette, frames: ['x'] });
    const result = toMultiScale(s, { scales: [1, 4] });

    expect(result.scales).toHaveLength(2);
    expect(result.scales[0]!.scale).toBe(1);
    expect(result.scales[1]!.scale).toBe(4);
  });

  describe('file write', () => {
    let tmpDir: string | undefined;

    afterEach(() => {
      if (tmpDir) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        tmpDir = undefined;
      }
    });

    it('writes files with scale suffixes', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixlrt-ms-'));
      const outPath = path.join(tmpDir, 'hero.png');

      const s = sprite({ palette, frames: ['x'] });
      const result = toMultiScale(s, outPath, { scales: [1, 2] });

      expect(fs.existsSync(path.join(tmpDir, 'hero@1x.png'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, 'hero@2x.png'))).toBe(true);
      expect(result.scales[0]!.path).toContain('hero@1x.png');
      expect(result.scales[1]!.path).toContain('hero@2x.png');
    });

    it('respects custom suffix function', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixlrt-ms-'));
      const outPath = path.join(tmpDir, 'hero.png');

      const s = sprite({ palette, frames: ['x'] });
      toMultiScale(s, outPath, {
        scales: [1, 2],
        suffix: (sc) => `-${sc}x`,
      });

      expect(fs.existsSync(path.join(tmpDir, 'hero-1x.png'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, 'hero-2x.png'))).toBe(true);
    });
  });
});
