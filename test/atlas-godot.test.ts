import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { toAtlasGodot } from '../src/render/atlas-godot.js';
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

describe('toAtlasGodot', () => {
  it('returns a .tres string', () => {
    const result = toAtlasGodot(sampleMeta);
    expect(typeof result).toBe('string');
  });

  it('includes gd_resource header with SpriteFrames type', () => {
    const result = toAtlasGodot(sampleMeta);
    expect(result).toContain('[gd_resource type="SpriteFrames"');
    expect(result).toContain('format=3');
  });

  it('includes ext_resource for the atlas texture', () => {
    const result = toAtlasGodot(sampleMeta);
    expect(result).toContain('[ext_resource type="Texture2D"');
    expect(result).toContain('res://atlas.png');
  });

  it('includes AtlasTexture sub-resources for each frame', () => {
    const result = toAtlasGodot(sampleMeta);
    expect(result).toContain('[sub_resource type="AtlasTexture"');
    expect(result).toContain('region = Rect2(0, 0, 16, 16)');
    expect(result).toContain('region = Rect2(16, 0, 8, 8)');
  });

  it('includes animation names from frame names', () => {
    const result = toAtlasGodot(sampleMeta);
    expect(result).toContain('"name": &"hero"');
    expect(result).toContain('"name": &"enemy"');
  });

  it('outputs separate frame objects for multi-frame animations', () => {
    const multiFrameMeta: AtlasMeta = {
      image: 'atlas.png',
      width: 48,
      height: 16,
      scale: 1,
      frames: [
        { name: 'walk', x: 0, y: 0, w: 16, h: 16, sourceW: 16, sourceH: 16 },
        { name: 'walk', x: 16, y: 0, w: 16, h: 16, sourceW: 16, sourceH: 16 },
        { name: 'walk', x: 32, y: 0, w: 16, h: 16, sourceW: 16, sourceH: 16 },
      ],
    };
    const result = toAtlasGodot(multiFrameMeta);
    // Each frame should be its own object with texture and duration
    expect(result).toContain('{ "texture": SubResource("2"), "duration": 1.0 }');
    expect(result).toContain('{ "texture": SubResource("3"), "duration": 1.0 }');
    expect(result).toContain('{ "texture": SubResource("4"), "duration": 1.0 }');
  });

  it('includes resource block with animations', () => {
    const result = toAtlasGodot(sampleMeta);
    expect(result).toContain('[resource]');
    expect(result).toContain('animations = [{');
  });

  describe('file write', () => {
    let tmpDir: string | undefined;

    afterEach(() => {
      if (tmpDir) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        tmpDir = undefined;
      }
    });

    it('writes .tres file to disk', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixlrt-godot-'));
      const tresPath = path.join(tmpDir, 'sprites.tres');

      toAtlasGodot(sampleMeta, tresPath);

      expect(fs.existsSync(tresPath)).toBe(true);
      const content = fs.readFileSync(tresPath, 'utf-8');
      expect(content).toContain('SpriteFrames');
    });
  });
});
