import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { toAtlasUnity } from '../src/render/atlas-unity.js';
import type { AtlasMeta } from '../src/types.js';

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

describe('toAtlasUnity', () => {
  it('produces frames with pivot points', () => {
    const result = toAtlasUnity(sampleMeta);

    expect(result.frames['hero']).toBeDefined();
    expect(result.frames['hero']!.pivot).toEqual({ x: 0.5, y: 0.5 });
    expect(result.frames['enemy']!.pivot).toEqual({ x: 0.5, y: 0.5 });
  });

  it('includes frame coordinates', () => {
    const result = toAtlasUnity(sampleMeta);

    expect(result.frames['hero']!.frame).toEqual({ x: 0, y: 0, w: 16, h: 16 });
    expect(result.frames['enemy']!.frame).toEqual({ x: 16, y: 0, w: 8, h: 8 });
  });

  it('includes smartupdate hash in meta', () => {
    const result = toAtlasUnity(sampleMeta);

    expect(result.meta.smartupdate).toMatch(
      /^\$TexturePacker:SmartUpdate:[a-f0-9]+\$$/,
    );
  });

  it('includes correct meta fields', () => {
    const result = toAtlasUnity(sampleMeta);

    expect(result.meta.app).toBe('pixlrt');
    expect(result.meta.image).toBe('atlas.png');
    expect(result.meta.format).toBe('RGBA8888');
    expect(result.meta.size).toEqual({ w: 32, h: 16 });
  });

  it('produces deterministic smartupdate for same input', () => {
    const r1 = toAtlasUnity(sampleMeta);
    const r2 = toAtlasUnity(sampleMeta);
    expect(r1.meta.smartupdate).toBe(r2.meta.smartupdate);
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
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixlrt-unity-'));
      const jsonPath = path.join(tmpDir, 'atlas.json');

      toAtlasUnity(sampleMeta, jsonPath);

      expect(fs.existsSync(jsonPath)).toBe(true);
      const written = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      expect(written.frames['hero'].pivot).toEqual({ x: 0.5, y: 0.5 });
    });
  });
});
