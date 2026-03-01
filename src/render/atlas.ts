import * as fs from 'node:fs';
import type { AtlasEntry, AtlasOptions, AtlasMeta, AtlasFrame, Renderable } from '../types.js';
import { Sprite } from '../sprite.js';
import { PixelCanvas } from '../canvas.js';
import { toPNG } from './png.js';
import { validateScale } from './validate.js';

interface Shelf {
  y: number;
  height: number;
  x: number;
}

function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function normalizeEntries(
  sprites: (Sprite | AtlasEntry)[],
): AtlasEntry[] {
  return sprites.map((s) => {
    if (s instanceof Sprite) {
      return { name: s.name, source: s as Renderable };
    }
    return s;
  });
}

/**
 * Pack renderables into a texture atlas using shelf next-fit bin-packing.
 * Returns the PNG buffer and atlas metadata.
 */
export function toAtlas(
  sprites: (Sprite | AtlasEntry)[],
  path?: string,
  opts?: AtlasOptions,
): { buffer: Buffer; metadata: AtlasMeta };
export function toAtlas(
  sprites: (Sprite | AtlasEntry)[],
  opts?: AtlasOptions,
): { buffer: Buffer; metadata: AtlasMeta };
export function toAtlas(
  sprites: (Sprite | AtlasEntry)[],
  pathOrOpts?: string | AtlasOptions,
  maybeOpts?: AtlasOptions,
): { buffer: Buffer; metadata: AtlasMeta } {
  let outPath: string | undefined;
  let opts: AtlasOptions | undefined;

  if (typeof pathOrOpts === 'string') {
    outPath = pathOrOpts;
    opts = maybeOpts;
  } else {
    opts = pathOrOpts;
  }

  if (sprites.length === 0) {
    throw new Error('Atlas requires at least one entry');
  }

  const padding = opts?.padding ?? 1;
  const scale = opts?.scale ?? 1;
  validateScale(scale);
  const maxWidth = opts?.maxWidth ?? 4096;
  const maxHeight = opts?.maxHeight ?? 4096;
  const pot = opts?.pot ?? false;

  const entries = normalizeEntries(sprites);

  // Validate unique names
  const names = new Set<string>();
  for (const entry of entries) {
    if (names.has(entry.name)) {
      throw new Error(`Duplicate atlas entry name: "${entry.name}"`);
    }
    names.add(entry.name);
  }

  // Sort by height descending for better shelf packing
  const sorted = entries
    .map((entry, originalIndex) => ({ entry, originalIndex }))
    .sort((a, b) => b.entry.source.height - a.entry.source.height);

  // Shelf Next Fit with best-height-fit shelf selection
  const shelves: Shelf[] = [];
  const placements: Array<{ entry: AtlasEntry; x: number; y: number }> = [];

  for (const { entry } of sorted) {
    const w = entry.source.width;
    const h = entry.source.height;

    // Find best-fit shelf (smallest height that fits)
    let bestShelf: Shelf | undefined;
    let bestWaste = Infinity;

    for (const shelf of shelves) {
      if (shelf.x + w + (shelf.x > 0 ? padding : 0) <= maxWidth && shelf.height >= h) {
        const waste = shelf.height - h;
        if (waste < bestWaste) {
          bestWaste = waste;
          bestShelf = shelf;
        }
      }
    }

    if (bestShelf) {
      const x = bestShelf.x + (bestShelf.x > 0 ? padding : 0);
      placements.push({ entry, x, y: bestShelf.y });
      bestShelf.x = x + w;
    } else {
      // Create new shelf
      const shelfY =
        shelves.length === 0
          ? 0
          : shelves[shelves.length - 1]!.y +
            shelves[shelves.length - 1]!.height +
            padding;
      const newShelf: Shelf = { y: shelfY, height: h, x: w };
      shelves.push(newShelf);
      placements.push({ entry, x: 0, y: shelfY });
    }
  }

  // Compute final dimensions
  let atlasWidth = 0;
  let atlasHeight = 0;
  for (const p of placements) {
    atlasWidth = Math.max(atlasWidth, p.x + p.entry.source.width);
    atlasHeight = Math.max(atlasHeight, p.y + p.entry.source.height);
  }

  if (pot) {
    atlasWidth = nextPowerOfTwo(atlasWidth);
    atlasHeight = nextPowerOfTwo(atlasHeight);
  }

  if (atlasWidth > maxWidth || atlasHeight > maxHeight) {
    throw new Error(
      `Atlas exceeds maximum dimensions: ${atlasWidth}x${atlasHeight} > ${maxWidth}x${maxHeight}`,
    );
  }

  // Render onto canvas
  const canvas = new PixelCanvas(atlasWidth, atlasHeight);
  for (const p of placements) {
    canvas.drawRenderable(p.entry.source, p.x, p.y);
  }

  // Build frames metadata
  const frames: AtlasFrame[] = placements.map((p) => ({
    name: p.entry.name,
    x: p.x,
    y: p.y,
    w: p.entry.source.width,
    h: p.entry.source.height,
    sourceW: p.entry.source.width,
    sourceH: p.entry.source.height,
  }));

  const metadata: AtlasMeta = {
    image: outPath ?? '',
    width: atlasWidth,
    height: atlasHeight,
    scale,
    frames,
  };

  const buffer = toPNG(canvas, { scale });

  if (outPath) {
    fs.writeFileSync(outPath, buffer);
    const metaPath = outPath.replace(/\.png$/i, '.json');
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');
  }

  return { buffer, metadata };
}
