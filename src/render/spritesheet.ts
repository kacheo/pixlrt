import * as fs from 'node:fs';
import type { SpriteSheetOptions, SpriteSheetMeta, TaggedSpriteSheetOptions, TaggedSpriteSheetMeta, AnimationTag } from '../types.js';
import { PixelCanvas } from '../canvas.js';
import { Sprite } from '../sprite.js';
import { toPNG } from './png.js';
import { validateScale } from './validate.js';

/**
 * Render a multi-frame Sprite to a sprite sheet.
 * Returns { buffer, metadata } containing the PNG buffer and JSON metadata.
 * Optionally writes both to disk.
 */
export function toSpriteSheet(
  source: Sprite,
  path?: string,
  opts?: SpriteSheetOptions,
): { buffer: Buffer; metadata: SpriteSheetMeta };
export function toSpriteSheet(
  source: Sprite,
  opts?: SpriteSheetOptions,
): { buffer: Buffer; metadata: SpriteSheetMeta };
export function toSpriteSheet(
  source: Sprite,
  pathOrOpts?: string | SpriteSheetOptions,
  maybeOpts?: SpriteSheetOptions,
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
  validateScale(scale);
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

/**
 * Render multiple named Sprites into a single tagged sprite sheet.
 * All sprites must have the same width and height.
 * Returns { buffer, metadata } with animation tags per sprite.
 */
export function toTaggedSpriteSheet(
  sprites: Record<string, Sprite>,
  path: string,
  opts?: TaggedSpriteSheetOptions,
): { buffer: Buffer; metadata: TaggedSpriteSheetMeta };
export function toTaggedSpriteSheet(
  sprites: Record<string, Sprite>,
  opts?: TaggedSpriteSheetOptions,
): { buffer: Buffer; metadata: TaggedSpriteSheetMeta };
export function toTaggedSpriteSheet(
  sprites: Record<string, Sprite>,
  pathOrOpts?: string | TaggedSpriteSheetOptions,
  maybeOpts?: TaggedSpriteSheetOptions,
): { buffer: Buffer; metadata: TaggedSpriteSheetMeta } {
  let path: string | undefined;
  let opts: TaggedSpriteSheetOptions | undefined;

  if (typeof pathOrOpts === 'string') {
    path = pathOrOpts;
    opts = maybeOpts;
  } else {
    opts = pathOrOpts;
  }

  const entries = Object.entries(sprites);
  if (entries.length === 0) {
    throw new Error('toTaggedSpriteSheet requires at least one sprite');
  }

  const [, firstSprite] = entries[0]!;
  const frameW = firstSprite.width;
  const frameH = firstSprite.height;

  for (const [name, s] of entries) {
    if (s.width !== frameW || s.height !== frameH) {
      throw new Error(
        `All sprites must have the same dimensions. "${name}" is ${s.width}x${s.height}, expected ${frameW}x${frameH}`,
      );
    }
  }

  // Collect all frames and build tags
  const allFrames: { frame: import('../frame.js').Frame; duration?: number }[] = [];
  const tags: AnimationTag[] = [];

  for (const [name, s] of entries) {
    const from = allFrames.length;
    for (let i = 0; i < s.frames.length; i++) {
      allFrames.push({ frame: s.frames[i]!, duration: s.frameDuration[i] });
    }
    const to = allFrames.length - 1;
    tags.push({ name, from, to, direction: 'forward' });
  }

  const scale = opts?.scale ?? 1;
  validateScale(scale);
  const padding = opts?.padding ?? 0;
  const totalFrames = allFrames.length;
  const columns = opts?.columns ?? Math.ceil(Math.sqrt(totalFrames));
  const rows = Math.ceil(totalFrames / columns);

  const cellW = frameW + padding;
  const cellH = frameH + padding;
  const sheetW = columns * cellW - padding;
  const sheetH = rows * cellH - padding;

  const canvas = new PixelCanvas(sheetW, sheetH);
  const frameMeta: TaggedSpriteSheetMeta['frames'] = [];

  for (let i = 0; i < totalFrames; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = col * cellW;
    const y = row * cellH;

    canvas.drawFrame(allFrames[i]!.frame, x, y);

    frameMeta.push({
      index: i,
      x,
      y,
      w: frameW,
      h: frameH,
      duration: allFrames[i]!.duration,
    });
  }

  const metadata: TaggedSpriteSheetMeta = {
    image: path ?? '',
    frameWidth: frameW,
    frameHeight: frameH,
    scale,
    frames: frameMeta,
    tags,
  };

  const buffer = toPNG(canvas, { scale });

  if (path) {
    fs.writeFileSync(path, buffer);
    const metaPath = path.replace(/\.png$/i, '.json');
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');
  }

  return { buffer, metadata };
}
