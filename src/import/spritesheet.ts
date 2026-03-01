import * as fs from 'node:fs';
import { PNG } from 'pngjs';
import type { RGBA, SpriteSheetMeta } from '../types.js';
import { Frame } from '../frame.js';
import { Sprite } from '../sprite.js';

/**
 * Reconstruct a multi-frame Sprite from a sprite sheet PNG and its metadata.
 * Inverse of `toSpriteSheet`.
 */
export function fromSpriteSheet(png: Buffer | string, meta: SpriteSheetMeta): Sprite {
  const buffer = typeof png === 'string' ? fs.readFileSync(png) : png;
  const decoded = PNG.sync.read(buffer);

  const scale = meta.scale ?? 1;
  const frames: Frame[] = [];
  const durations: number[] = [];

  for (const frameMeta of meta.frames) {
    const pixels: RGBA[][] = [];
    for (let y = 0; y < frameMeta.h; y++) {
      const row: RGBA[] = [];
      for (let x = 0; x < frameMeta.w; x++) {
        // If scaled, pick every scale-th pixel from the PNG
        const px = (frameMeta.x + x) * scale;
        const py = (frameMeta.y + y) * scale;
        const i = (py * decoded.width + px) * 4;
        row.push([decoded.data[i]!, decoded.data[i + 1]!, decoded.data[i + 2]!, decoded.data[i + 3]!]);
      }
      pixels.push(row);
    }
    frames.push(new Frame(pixels));
    durations.push(frameMeta.duration ?? 100);
  }

  return new Sprite({
    name: 'imported',
    frames,
    palette: {},
    origin: { x: 0, y: 0 },
    frameDuration: durations,
  });
}
