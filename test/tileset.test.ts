import { describe, it, expect } from 'vitest';
import { tileset } from '../src/tileset.js';

const palette = {
  '.': 'transparent',
  'g': '#00ff00',
  'b': '#0000ff',
  'w': '#808080',
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
      })
    ).toThrow('dimensions');
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
