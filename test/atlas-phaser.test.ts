import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { toAtlasPhaser } from '../src/render/atlas-phaser.js';
import type { AtlasMeta } from '../src/types.js';
import type { PhaserHashOutput, PhaserArrayOutput } from '../src/render/atlas-phaser.js';

const sampleMeta: AtlasMeta = {
  image: 'atlas.png',
  width: 32,
  height: 16,
  scale: 1,
  frames: [
    { name: 'hero', x: 0, y: 0, w: 16, h: 16, sourceW: 16, sourceH: 16 },
    { name: 'enemy', x: 16, y: 0, w: 8, h: 8, sourceW: 8, sourceH: 8 },
  ],
};

describe('toAtlasPhaser', () => {
  describe('hash format', () => {
    it('produces frames as a keyed object', () => {
      const result = toAtlasPhaser(sampleMeta) as PhaserHashOutput;

      expect(result.frames['hero']).toBeDefined();
      expect(result.frames['enemy']).toBeDefined();
      expect(result.frames['hero']!.frame).toEqual({ x: 0, y: 0, w: 16, h: 16 });
      expect(result.frames['hero']!.rotated).toBe(false);
      expect(result.frames['hero']!.trimmed).toBe(false);
    });

    it('includes correct meta', () => {
      const result = toAtlasPhaser(sampleMeta) as PhaserHashOutput;

      expect(result.meta.app).toBe('pixlrt');
      expect(result.meta.image).toBe('atlas.png');
      expect(result.meta.format).toBe('RGBA8888');
      expect(result.meta.size).toEqual({ w: 32, h: 16 });
      expect(result.meta.scale).toBe(1);
    });

    it('includes spriteSourceSize and sourceSize', () => {
      const result = toAtlasPhaser(sampleMeta) as PhaserHashOutput;
      const frame = result.frames['enemy']!;

      expect(frame.spriteSourceSize).toEqual({ x: 0, y: 0, w: 8, h: 8 });
      expect(frame.sourceSize).toEqual({ w: 8, h: 8 });
    });
  });

  describe('array format', () => {
    it('produces frames as an array with filename field', () => {
      const result = toAtlasPhaser(sampleMeta, undefined, 'array') as PhaserArrayOutput;

      expect(Array.isArray(result.frames)).toBe(true);
      expect(result.frames).toHaveLength(2);
      expect(result.frames[0]!.filename).toBe('hero');
      expect(result.frames[0]!.frame).toEqual({ x: 0, y: 0, w: 16, h: 16 });
    });
  });

  describe('file write', () => {
    let tmpDir: string | undefined;

    afterEach(() => {
      if (tmpDir) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        tmpDir = undefined;
      }
    });

    it('writes JSON to disk', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixlrt-phaser-'));
      const jsonPath = path.join(tmpDir, 'atlas.json');

      toAtlasPhaser(sampleMeta, jsonPath);

      expect(fs.existsSync(jsonPath)).toBe(true);
      const written = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      expect(written.meta.app).toBe('pixlrt');
      expect(written.frames['hero']).toBeDefined();
    });
  });
});
