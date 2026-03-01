import * as fs from 'node:fs';
import type { SpriteSheetOptions, SpriteSheetMeta } from '../types.js';
import { PixelCanvas } from '../canvas.js';
import { Sprite } from '../sprite.js';
import { toPNG } from './png.js';

/**
 * Render a multi-frame Sprite to a sprite sheet.
 * Returns { buffer, metadata } containing the PNG buffer and JSON metadata.
 * Optionally writes both to disk.
 */
export function toSpriteSheet(
  source: Sprite,
  path?: string,
  opts?: SpriteSheetOptions
): { buffer: Buffer; metadata: SpriteSheetMeta };
export function toSpriteSheet(
  source: Sprite,
  opts?: SpriteSheetOptions
): { buffer: Buffer; metadata: SpriteSheetMeta };
export function toSpriteSheet(
  source: Sprite,
  pathOrOpts?: string | SpriteSheetOptions,
  maybeOpts?: SpriteSheetOptions
): { buffer: Buffer; metadata: SpriteSheetMeta } {
  let path: string | undefined;
  let opts: SpriteSheetOptions | undefined;

  if (typeof pathOrOpts === 'string') {
    path = pathOrOpts;
    opts = maybeOpts;
  } else {
    opts = pathOrOpts;
  }

  const scale = opts?.scale ?? 1;
  const padding = opts?.padding ?? 0;
  const columns = opts?.columns ?? Math.ceil(Math.sqrt(source.frames.length));
  const rows = Math.ceil(source.frames.length / columns);

  const frameW = source.width;
  const frameH = source.height;
  const cellW = frameW + padding;
  const cellH = frameH + padding;
  const sheetW = columns * cellW - padding;
  const sheetH = rows * cellH - padding;

  const canvas = new PixelCanvas(sheetW, sheetH);

  const frameMeta: SpriteSheetMeta['frames'] = [];

  for (let i = 0; i < source.frames.length; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = col * cellW;
    const y = row * cellH;

    canvas.drawFrame(source.frames[i]!, x, y);

    frameMeta.push({
      index: i,
      x,
      y,
      w: frameW,
      h: frameH,
      duration: source.frameDuration[i],
    });
  }

  const metadata: SpriteSheetMeta = {
    image: path ?? '',
    frameWidth: frameW,
    frameHeight: frameH,
    scale,
    frames: frameMeta,
  };

  const buffer = toPNG(canvas, { scale });

  if (path) {
    fs.writeFileSync(path, buffer);
    const metaPath = path.replace(/\.png$/i, '.json');
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');
  }

  return { buffer, metadata };
}
