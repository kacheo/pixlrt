// Node-specific exports (file I/O, pngjs, etc.)

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PaletteMap } from './types.js';
import { paletteFromHex } from './palette.js';

// Palette file loading
export { paletteFromHex };

/**
 * Parse a palette file (.hex or .gpl format) into a PaletteMap.
 * - `.hex`: one 6-digit hex color per line (no '#' prefix)
 * - `.gpl`: GIMP Palette format (header, optional comments, R G B per line)
 */
export function paletteFromFile(filePath: string): PaletteMap {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf-8');

  if (ext === '.hex') {
    const hexColors = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return paletteFromHex(hexColors);
  }

  if (ext === '.gpl') {
    const lines = content.split('\n');
    const hexColors: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        !trimmed ||
        trimmed === 'GIMP Palette' ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('Name:') ||
        trimmed.startsWith('Columns:')
      ) {
        continue;
      }
      const parts = trimmed.split(/\s+/);
      const r = parseInt(parts[0]!, 10);
      const g = parseInt(parts[1]!, 10);
      const b = parseInt(parts[2]!, 10);
      if (isNaN(r) || isNaN(g) || isNaN(b)) continue;
      const hex =
        r.toString(16).padStart(2, '0') +
        g.toString(16).padStart(2, '0') +
        b.toString(16).padStart(2, '0');
      hexColors.push(hex);
    }
    return paletteFromHex(hexColors);
  }

  throw new Error(`Unsupported palette file extension: "${ext}". Expected .hex or .gpl`);
}

// Node renderers (file I/O)
export { toPNG } from './render/png.js';
export { toGIF } from './render/gif.js';
export { toAPNG } from './render/apng.js';
export { toSpriteSheet, toTaggedSpriteSheet } from './render/spritesheet.js';
export { toAtlas } from './render/atlas.js';
export { toAtlasPhaser } from './render/atlas-phaser.js';
export type { PhaserHashOutput, PhaserArrayOutput } from './render/atlas-phaser.js';
export { toAtlasUnity } from './render/atlas-unity.js';
export type { UnityOutput } from './render/atlas-unity.js';
export { toAtlasGodot } from './render/atlas-godot.js';
export { toTiled } from './render/tiled.js';
export type {
  TiledMap,
  TiledTileLayer,
  TiledTilesetRef,
  TiledExportOptions,
} from './render/tiled.js';
export { toMultiScale } from './render/multiscale.js';
export type { MultiScaleResult } from './render/multiscale.js';

// Node SVG (with file-writing support)
export { toSVG } from './render/svg-node.js';

// Importers
export { fromPNG } from './import/png.js';
export { fromSpriteSheet } from './import/spritesheet.js';
