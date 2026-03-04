import { describe, it, expect } from 'vitest';
import { tileset } from '../src/tileset.js';

const palette = {
  '.': 'transparent',
  g: '#00ff00',
  b: '#0000ff',
  w: '#808080',
};

describe('tileset', () => {
  it('creates tiles of correct size', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: {
        grass: 'gg\ngg',
        water: 'bb\nbb',
      },
    });
    expect(ts.tileNames).toEqual(['grass', 'water']);
  });

  it('returns a Sprite for a named tile', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: {
        grass: 'gg\ngg',
        water: 'bb\nbb',
      },
    });
    const grass = ts.tile('grass');
    expect(grass.width).toBe(2);
    expect(grass.height).toBe(2);
    expect(grass.getPixel(0, 0)).toEqual([0, 255, 0, 255]);
  });

  it('throws on unknown tile name', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: { grass: 'gg\ngg' },
    });
    expect(() => ts.tile('lava')).toThrow('Unknown tile');
  });

  it('throws on wrong tile dimensions', () => {
    expect(() =>
      tileset({
        tileSize: 2,
        palette,
        tiles: { bad: 'g' },
      }),
    ).toThrow('dimensions');
  });

  it('builds a basic scene', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: {
        grass: 'gg\ngg',
        water: 'bb\nbb',
      },
    });
    const canvas = ts.scene('grass water\nwater grass');
    expect(canvas.width).toBe(4);
    expect(canvas.height).toBe(4);
    // Top-left tile is grass
    expect(canvas.getPixel(0, 0)).toEqual([0, 255, 0, 255]);
    // Top-right tile is water
    expect(canvas.getPixel(2, 0)).toEqual([0, 0, 255, 255]);
    // Bottom-left tile is water
    expect(canvas.getPixel(0, 2)).toEqual([0, 0, 255, 255]);
    // Bottom-right tile is grass
    expect(canvas.getPixel(2, 2)).toEqual([0, 255, 0, 255]);
  });

  it('skips empty cells with .', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: { grass: 'gg\ngg' },
    });
    const canvas = ts.scene('grass .\n. grass');
    // Empty cell (top-right) should be transparent
    expect(canvas.getPixel(2, 0)).toEqual([0, 0, 0, 0]);
  });

  it('fills background color in empty cells', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: { grass: 'gg\ngg' },
    });
    const canvas = ts.scene('grass .\n. grass', { background: '#ff0000' });
    // Empty cell filled with red
    expect(canvas.getPixel(2, 0)).toEqual([255, 0, 0, 255]);
  });

  it('scales tiles in scene', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: { grass: 'gg\ngg' },
    });
    const canvas = ts.scene('grass', { scale: 2 });
    expect(canvas.width).toBe(4);
    expect(canvas.height).toBe(4);
    expect(canvas.getPixel(0, 0)).toEqual([0, 255, 0, 255]);
    expect(canvas.getPixel(3, 3)).toEqual([0, 255, 0, 255]);
  });

  it('throws on unknown tile in scene', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: { grass: 'gg\ngg' },
    });
    expect(() => ts.scene('grass lava')).toThrow('Unknown tile "lava"');
  });

  it('throws on empty layout', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: { grass: 'gg\ngg' },
    });
    expect(() => ts.scene('')).toThrow('empty');
  });

  it('handles ragged rows', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: {
        grass: 'gg\ngg',
        water: 'bb\nbb',
      },
    });
    const canvas = ts.scene('grass water\ngrass');
    expect(canvas.width).toBe(4); // 2 columns
    expect(canvas.height).toBe(4); // 2 rows
    // Second row, second column should be transparent (ragged)
    expect(canvas.getPixel(2, 2)).toEqual([0, 0, 0, 0]);
  });

  it('resolves tile by numeric index in scene', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: {
        grass: 'gg\ngg',
        water: 'bb\nbb',
      },
    });
    const canvas = ts.scene('0 1\n1 0');
    expect(canvas.width).toBe(4);
    expect(canvas.height).toBe(4);
    // Index 0 = grass, index 1 = water
    expect(canvas.getPixel(0, 0)).toEqual([0, 255, 0, 255]);
    expect(canvas.getPixel(2, 0)).toEqual([0, 0, 255, 255]);
    expect(canvas.getPixel(0, 2)).toEqual([0, 0, 255, 255]);
    expect(canvas.getPixel(2, 2)).toEqual([0, 255, 0, 255]);
  });

  it('mixes names and indices in scene', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: {
        grass: 'gg\ngg',
        water: 'bb\nbb',
      },
    });
    const canvas = ts.scene('grass 1');
    expect(canvas.getPixel(0, 0)).toEqual([0, 255, 0, 255]);
    expect(canvas.getPixel(2, 0)).toEqual([0, 0, 255, 255]);
  });

  it('throws on invalid index/name with helpful message', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: { grass: 'gg\ngg' },
    });
    expect(() => ts.scene('5')).toThrow('indices');
    expect(() => ts.scene('lava')).toThrow('Available tiles');
  });

  it('tileIndex returns 0-based index by name', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: {
        grass: 'gg\ngg',
        water: 'bb\nbb',
      },
    });
    expect(ts.tileIndex('grass')).toBe(0);
    expect(ts.tileIndex('water')).toBe(1);
  });

  it('tileIndex resolves numeric string', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: {
        grass: 'gg\ngg',
        water: 'bb\nbb',
      },
    });
    expect(ts.tileIndex('0')).toBe(0);
    expect(ts.tileIndex('1')).toBe(1);
  });

  it('builds scene with layers', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: {
        grass: 'gg\ngg',
        water: 'bb\nbb',
        wall: 'ww\nww',
      },
    });
    const canvas = ts.scene({
      layers: [{ layout: 'grass grass\ngrass grass' }, { layout: '. wall\n. .' }],
    });
    expect(canvas.width).toBe(4);
    expect(canvas.height).toBe(4);
    // Bottom layer: all grass
    expect(canvas.getPixel(0, 0)).toEqual([0, 255, 0, 255]);
    expect(canvas.getPixel(0, 2)).toEqual([0, 255, 0, 255]);
    // Upper layer: wall at (1,0), rest is . (transparent, shows grass through)
    expect(canvas.getPixel(2, 0)).toEqual([128, 128, 128, 255]);
  });

  it('. in upper layer does not overwrite lower layer', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: {
        grass: 'gg\ngg',
        water: 'bb\nbb',
      },
    });
    const canvas = ts.scene({
      layers: [{ layout: 'grass grass' }, { layout: '. water' }],
    });
    // First cell: . in upper layer, grass shows through
    expect(canvas.getPixel(0, 0)).toEqual([0, 255, 0, 255]);
    // Second cell: water in upper layer
    expect(canvas.getPixel(2, 0)).toEqual([0, 0, 255, 255]);
  });

  it('single-element layers array matches direct layout result', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: {
        grass: 'gg\ngg',
        water: 'bb\nbb',
      },
    });
    const direct = ts.scene('grass water\nwater grass');
    const layered = ts.scene({
      layers: [{ layout: 'grass water\nwater grass' }],
    });
    // Should produce identical results
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        expect(layered.getPixel(x, y)).toEqual(direct.getPixel(x, y));
      }
    }
  });

  it('implements Renderable for full sheet', () => {
    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: {
        grass: 'gg\ngg',
        water: 'bb\nbb',
        wall: 'ww\nww',
      },
    });
    // 3 tiles, ceil(sqrt(3))=2 columns, 2 rows
    expect(ts.width).toBe(4);
    expect(ts.height).toBe(4);
    // First tile (grass) at (0,0)
    expect(ts.getPixel(0, 0)).toEqual([0, 255, 0, 255]);
    // Second tile (water) at (2,0)
    expect(ts.getPixel(2, 0)).toEqual([0, 0, 255, 255]);
    // Third tile (wall) at (0,2)
    expect(ts.getPixel(0, 2)).toEqual([128, 128, 128, 255]);
    // Empty slot at (2,2) should be transparent
    expect(ts.getPixel(2, 2)).toEqual([0, 0, 0, 0]);
  });
});
