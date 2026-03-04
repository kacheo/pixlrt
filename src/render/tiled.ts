import * as fs from 'node:fs';
import { Tileset } from '../tileset.js';

/** Tiled .tmj tileset reference */
export interface TiledTilesetRef {
  firstgid: number;
  name: string;
  tilewidth: number;
  tileheight: number;
  tilecount: number;
  columns: number;
}

/** Tiled .tmj tile layer */
export interface TiledTileLayer {
  id: number;
  name: string;
  type: 'tilelayer';
  visible: boolean;
  opacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  data: number[];
}

/** Tiled .tmj map */
export interface TiledMap {
  version: string;
  type: 'map';
  orientation: 'orthogonal';
  renderorder: 'right-down';
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledTileLayer[];
  tilesets: TiledTilesetRef[];
}

/** Options for Tiled export */
export interface TiledExportOptions {
  name?: string;
}

/** Parse a layout string into a 2D grid of cell strings. */
function parseGrid(layout: string): string[][] {
  const rows = layout
    .split('\n')
    .map((r) => r.trim())
    .filter((r) => r.length > 0);
  return rows.map((r) => r.split(/\s+/));
}

/**
 * Export a tileset + layout(s) to a Tiled .tmj JSON structure.
 * - Single string layout = single layer
 * - String array = multiple layers
 * - If path is provided, writes the JSON file
 */
export function toTiled(
  tileset: Tileset,
  layout: string | string[],
  path: string,
  options?: TiledExportOptions,
): TiledMap;
export function toTiled(
  tileset: Tileset,
  layout: string | string[],
  options?: TiledExportOptions,
): TiledMap;
export function toTiled(
  tileset: Tileset,
  layout: string | string[],
  pathOrOptions?: string | TiledExportOptions,
  maybeOptions?: TiledExportOptions,
): TiledMap {
  let path: string | undefined;
  let options: TiledExportOptions | undefined;

  if (typeof pathOrOptions === 'string') {
    path = pathOrOptions;
    options = maybeOptions;
  } else {
    options = pathOrOptions;
  }

  const layouts = Array.isArray(layout) ? layout : [layout];
  const grids = layouts.map((l) => parseGrid(l));

  // Compute max dimensions across all layers
  const gridHeight = Math.max(...grids.map((g) => g.length));
  const gridWidth = Math.max(...grids.map((g) => Math.max(...g.map((r) => r.length))));

  const mapName = options?.name ?? 'map';
  const tileCount = tileset.tileNames.length;
  const columns = Math.ceil(Math.sqrt(tileCount));

  const layers: TiledTileLayer[] = grids.map((grid, idx) => {
    const data: number[] = [];
    for (let r = 0; r < gridHeight; r++) {
      for (let c = 0; c < gridWidth; c++) {
        const cell = grid[r]?.[c];
        if (!cell || cell === '.') {
          data.push(0);
        } else {
          data.push(tileset.tileIndex(cell) + 1); // GID is 1-based
        }
      }
    }

    return {
      id: idx + 1,
      name: `Layer ${idx + 1}`,
      type: 'tilelayer' as const,
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      width: gridWidth,
      height: gridHeight,
      data,
    };
  });

  const map: TiledMap = {
    version: '1.10',
    type: 'map',
    orientation: 'orthogonal',
    renderorder: 'right-down',
    width: gridWidth,
    height: gridHeight,
    tilewidth: tileset.tileSize,
    tileheight: tileset.tileSize,
    layers,
    tilesets: [
      {
        firstgid: 1,
        name: mapName,
        tilewidth: tileset.tileSize,
        tileheight: tileset.tileSize,
        tilecount: tileCount,
        columns,
      },
    ],
  };

  if (path) {
    fs.writeFileSync(path, JSON.stringify(map, null, 2));
  }

  return map;
}
