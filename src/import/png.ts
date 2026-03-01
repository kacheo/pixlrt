import * as fs from 'node:fs';
import { PNG } from 'pngjs';
import type { RGBA } from '../types.js';
import { Frame } from '../frame.js';
import { Sprite } from '../sprite.js';

/**
 * Import a PNG as a single-frame Sprite.
 * Accepts a Buffer containing PNG data, or a file path string.
 */
export function fromPNG(input: Buffer | string): Sprite {
  const buffer = typeof input === 'string' ? fs.readFileSync(input) : input;
  const png = PNG.sync.read(buffer);

  const pixels: RGBA[][] = [];
  for (let y = 0; y < png.height; y++) {
    const row: RGBA[] = [];
    for (let x = 0; x < png.width; x++) {
      const i = (y * png.width + x) * 4;
      row.push([png.data[i]!, png.data[i + 1]!, png.data[i + 2]!, png.data[i + 3]!]);
    }
    pixels.push(row);
  }

  const frame = new Frame(pixels);
  return new Sprite({
    name: 'imported',
    frames: [frame],
    palette: {},
    origin: { x: 0, y: 0 },
    frameDuration: [100],
  });
}
