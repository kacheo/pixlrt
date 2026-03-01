import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { tileset } from '../src/tileset.js';
import { toTiled } from '../src/render/tiled.js';

const palette = {
  '.': 'transparent',
  g: '#00ff00',
  b: '#0000ff',
  w: '#808080',
};

const ts = tileset({
  tileSize: 2,
  palette,
  tiles: {
    grass: 'gg\ngg',
    water: 'bb\nbb',
    wall: 'ww\nww',
  },
});

describe('toTiled', () => {
  it('produces valid structure for single-layer layout', () => {
    const map = toTiled(ts, 'grass water\nwall grass');
    expect(map.version).toBe('1.10');
    expect(map.type).toBe('map');
    expect(map.orientation).toBe('orthogonal');
    expect(map.renderorder).toBe('right-down');
    expect(map.width).toBe(2);
    expect(map.height).toBe(2);
    expect(map.tilewidth).toBe(2);
    expect(map.tileheight).toBe(2);
    expect(map.layers).toHaveLength(1);
    expect(map.tilesets).toHaveLength(1);
    expect(map.tilesets[0]!.firstgid).toBe(1);
  });

  it('produces correct GIDs (1-based)', () => {
    const map = toTiled(ts, 'grass water\nwall grass');
    const data = map.layers[0]!.data;
    // grass=0 → GID 1, water=1 → GID 2, wall=2 → GID 3
    expect(data).toEqual([1, 2, 3, 1]);
  });

  it('. cells produce 0 in data array', () => {
    const map = toTiled(ts, 'grass .\n. water');
    const data = map.layers[0]!.data;
    expect(data).toEqual([1, 0, 0, 2]);
  });

  it('multi-layer produces multiple tilelayer entries', () => {
    const map = toTiled(ts, ['grass grass\ngrass grass', '. wall\n. .']);
    expect(map.layers).toHaveLength(2);
    expect(map.layers[0]!.name).toBe('Layer 1');
    expect(map.layers[1]!.name).toBe('Layer 2');
    // Layer 1: all grass
    expect(map.layers[0]!.data).toEqual([1, 1, 1, 1]);
    // Layer 2: wall at (1,0), rest empty
    expect(map.layers[1]!.data).toEqual([0, 3, 0, 0]);
  });

  it('numeric indices in layout resolve correctly', () => {
    const map = toTiled(ts, '0 1\n2 0');
    const data = map.layers[0]!.data;
    expect(data).toEqual([1, 2, 3, 1]);
  });

  it('writes JSON file when path provided', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixlrt-tiled-'));
    const filePath = path.join(tmpDir, 'test.tmj');
    try {
      const map = toTiled(ts, 'grass water', filePath);
      expect(fs.existsSync(filePath)).toBe(true);
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(parsed.version).toBe('1.10');
      expect(parsed.layers[0].data).toEqual(map.layers[0]!.data);
    } finally {
      fs.rmSync(tmpDir, { recursive: true });
    }
  });

  it('accepts options with name', () => {
    const map = toTiled(ts, 'grass', { name: 'my-tileset' });
    expect(map.tilesets[0]!.name).toBe('my-tileset');
  });
});
