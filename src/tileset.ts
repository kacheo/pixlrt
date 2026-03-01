import type { PaletteMap, TilesetConfig, Renderable, RGBA } from './types.js';
import { Frame } from './frame.js';
import { parseGrid } from './parser.js';
import { Sprite } from './sprite.js';

/**
 * A Tileset groups multiple named tiles with a shared palette and uniform tile size.
 */
export class Tileset implements Renderable {
  readonly tileSize: number;
  readonly palette: PaletteMap;
  readonly tileNames: string[];
  private readonly tileFrames: Map<string, Frame>;

  // Renderable dimensions (full tileset sheet)
  readonly width: number;
  readonly height: number;
  private readonly columns: number;

  constructor(config: TilesetConfig) {
    this.tileSize = config.tileSize;
    this.palette = config.palette;
    this.tileNames = Object.keys(config.tiles);
    this.tileFrames = new Map();

    for (const [name, ascii] of Object.entries(config.tiles)) {
      const grid = parseGrid(ascii, config.palette);

      if (grid.length !== config.tileSize || grid[0]!.length !== config.tileSize) {
        throw new Error(
          `Tile "${name}" has dimensions ${grid[0]!.length}x${grid.length}, ` +
            `expected ${config.tileSize}x${config.tileSize}`,
        );
      }

      this.tileFrames.set(name, new Frame(grid));
    }

    this.columns = Math.ceil(Math.sqrt(this.tileNames.length));
    const rows = Math.ceil(this.tileNames.length / this.columns);
    this.width = this.columns * this.tileSize;
    this.height = rows * this.tileSize;
  }

  /** Get a single tile as a Sprite */
  tile(name: string): Sprite {
    const frame = this.tileFrames.get(name);
    if (!frame) {
      throw new Error(`Unknown tile "${name}". Available tiles: ${this.tileNames.join(', ')}`);
    }
    return new Sprite({
      name,
      frames: [frame],
      palette: this.palette,
      origin: { x: 0, y: 0 },
      frameDuration: [100],
    });
  }

  /** Get pixel at (x, y) from the full tileset sheet layout */
  getPixel(x: number, y: number): RGBA {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return [0, 0, 0, 0];
    }

    const tileCol = Math.floor(x / this.tileSize);
    const tileRow = Math.floor(y / this.tileSize);
    const tileIndex = tileRow * this.columns + tileCol;

    if (tileIndex >= this.tileNames.length) {
      return [0, 0, 0, 0];
    }

    const frame = this.tileFrames.get(this.tileNames[tileIndex]!)!;
    const localX = x % this.tileSize;
    const localY = y % this.tileSize;
    return frame.getPixel(localX, localY);
  }
}

/** Create a Tileset from a configuration */
export function tileset(config: TilesetConfig): Tileset {
  return new Tileset(config);
}
