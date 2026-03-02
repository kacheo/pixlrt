import type { Renderable } from '../types.js';
import { validateScale } from './validate.js';

export interface ImageDataResult {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export function toImageData(
  source: Renderable,
  opts?: { scale?: number },
): ImageDataResult {
  const scale = opts?.scale ?? 1;
  validateScale(scale);

  const width = source.width * scale;
  const height = source.height * scale;
  const data = new Uint8ClampedArray(width * height * 4);

  for (let sy = 0; sy < source.height; sy++) {
    for (let sx = 0; sx < source.width; sx++) {
      const [r, g, b, a] = source.getPixel(sx, sy);

      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const px = sx * scale + dx;
          const py = sy * scale + dy;
          const i = (py * width + px) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = a;
        }
      }
    }
  }

  return { width, height, data };
}
