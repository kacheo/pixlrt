import type {
  PaletteMap,
  TilesetConfig,
  Renderable,
  RGBA,
  SceneOptions,
  LayerConfig,
} from './types.js';
import { Frame } from './frame.js';
import { PixelCanvas } from './canvas.js';
import { parseColor } from './color.js';
import { parseGrid } from './parser.js';
import { scale as scaleFrame } from './transform.js';
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
  /** Resolve a cell string (name or numeric index) to its Frame. */
  private _resolveFrame(cell: string): Frame {
    // Try name lookup first
    const byName = this.tileFrames.get(cell);
    if (byName) return byName;

    // Fall back to numeric index
    if (/^\d+$/.test(cell)) {
      const idx = parseInt(cell, 10);
      if (idx >= 0 && idx < this.tileNames.length) {
        return this.tileFrames.get(this.tileNames[idx]!)!;
      }
    }

    const validRange = this.tileNames.length > 0 ? `0-${this.tileNames.length - 1}` : 'none';
    throw new Error(
      `Unknown tile "${cell}" in scene layout. Available tiles: ${this.tileNames.join(', ')} (indices: ${validRange})`,
    );
  }

  /** Get the 0-based index for a tile cell string (name or numeric index). */
  tileIndex(cell: string): number {
    // Try name lookup first
    const nameIdx = this.tileNames.indexOf(cell);
    if (nameIdx !== -1) return nameIdx;

    // Fall back to numeric index
    if (/^\d+$/.test(cell)) {
      const idx = parseInt(cell, 10);
      if (idx >= 0 && idx < this.tileNames.length) {
        return idx;
      }
    }

    const validRange = this.tileNames.length > 0 ? `0-${this.tileNames.length - 1}` : 'none';
    throw new Error(
      `Unknown tile "${cell}". Available tiles: ${this.tileNames.join(', ')} (indices: ${validRange})`,
    );
  }

  /** Parse a layout string into a 2D grid of cell strings. */
  private _parseGrid(layout: string): string[][] {
    const rows = layout
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (rows.length === 0) {
      throw new Error('Scene layout must not be empty');
    }

    return rows.map((r) => r.split(/\s+/));
  }

  /** Draw a single layer onto a canvas. */
  private _drawLayer(canvas: PixelCanvas, layout: string, scaleFactor: number): void {
    const grid = this._parseGrid(layout);
    const tileDrawSize = this.tileSize * scaleFactor;

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r]!.length; c++) {
        const cell = grid[r]![c]!;
        if (cell === '.') continue;

        const frame = this._resolveFrame(cell);
        const drawFrame = scaleFactor > 1 ? scaleFrame(frame, scaleFactor) : frame;
        canvas.drawFrame(drawFrame, c * tileDrawSize, r * tileDrawSize);
      }
    }
  }

  /** Build a scene from a text layout of tile names */
  scene(layout: string, options?: SceneOptions): PixelCanvas;
  scene(options: SceneOptions & { layers: LayerConfig[] }): PixelCanvas;
  scene(
    layoutOrOptions: string | (SceneOptions & { layers: LayerConfig[] }),
    maybeOptions?: SceneOptions,
  ): PixelCanvas {
    let layouts: string[];
    let options: SceneOptions | undefined;

    if (typeof layoutOrOptions === 'string') {
      layouts = [layoutOrOptions];
      options = maybeOptions;
    } else {
      layouts = layoutOrOptions.layers.map((l) => l.layout);
      options = layoutOrOptions;
    }

    if (layouts.length === 0) {
      throw new Error('Scene must have at least one layer');
    }

    // Compute max grid dimensions across all layers
    const allGrids = layouts.map((l) => this._parseGrid(l));
    const maxRows = Math.max(...allGrids.map((g) => g.length));
    const maxCols = Math.max(...allGrids.map((g) => Math.max(...g.map((r) => r.length))));

    const scaleFactor = options?.scale ?? 1;
    const tileDrawSize = this.tileSize * scaleFactor;

    const canvas = new PixelCanvas(maxCols * tileDrawSize, maxRows * tileDrawSize);

    if (options?.background) {
      canvas.fill(parseColor(options.background));
    }

    for (const layout of layouts) {
      this._drawLayer(canvas, layout, scaleFactor);
    }

    return canvas;
  }
}

/** Create a Tileset from a configuration */
export function tileset(config: TilesetConfig): Tileset {
  return new Tileset(config);
}
