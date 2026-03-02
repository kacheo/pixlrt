import type { Renderable, CollisionMaskOptions } from '../types.js';

export interface CollisionMaskResult {
  width: number;
  height: number;
  data: boolean[][];
  packed: Uint8Array;
}

/**
 * Generate a 1-bit alpha collision mask from a Renderable.
 * Pixels with alpha >= threshold are solid (true), others are empty (false).
 */
export function toCollisionMask(
  source: Renderable,
  opts?: CollisionMaskOptions,
): CollisionMaskResult {
  const threshold = opts?.threshold ?? 1;
  const { width, height } = source;

  const data: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < width; x++) {
      const [, , , a] = source.getPixel(x, y);
      row.push(a >= threshold);
    }
    data.push(row);
  }

  // Pack to 1 bit per pixel, row-major, MSB-first per byte
  const bytesPerRow = Math.ceil(width / 8);
  const packed = new Uint8Array(bytesPerRow * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[y]![x]) {
        const byteIndex = y * bytesPerRow + Math.floor(x / 8);
        const bitIndex = 7 - (x % 8);
        packed[byteIndex]! |= 1 << bitIndex;
      }
    }
  }

  return { width, height, data, packed };
}
