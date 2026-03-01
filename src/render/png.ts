import { PNG } from 'pngjs';
import * as fs from 'node:fs';
import type { Renderable, PNGOptions } from '../types.js';
import { PixelCanvas } from '../canvas.js';

/**
 * Render a Renderable to a scaled PNG buffer.
 */
function renderToPNGBuffer(source: Renderable, scale: number): Buffer {
  const w = source.width * scale;
  const h = source.height * scale;
  const png = new PNG({ width: w, height: h });

  for (let sy = 0; sy < source.height; sy++) {
    for (let sx = 0; sx < source.width; sx++) {
      const [r, g, b, a] = source.getPixel(sx, sy);
      // Fill the scale×scale block
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const px = sx * scale + dx;
          const py = sy * scale + dy;
          const i = (py * w + px) * 4;
          png.data[i] = r;
          png.data[i + 1] = g;
          png.data[i + 2] = b;
          png.data[i + 3] = a;
        }
      }
    }
  }

  return PNG.sync.write(png);
}

/**
 * Render to PNG. Overloaded:
 * - toPNG(source, path, opts) — writes file and returns Buffer
 * - toPNG(source, opts) — returns Buffer only
 */
export function toPNG(source: Renderable, path: string, opts?: PNGOptions): Buffer;
export function toPNG(source: Renderable, opts?: PNGOptions): Buffer;
export function toPNG(
  source: Renderable,
  pathOrOpts?: string | PNGOptions,
  maybeOpts?: PNGOptions
): Buffer {
  let path: string | undefined;
  let opts: PNGOptions | undefined;

  if (typeof pathOrOpts === 'string') {
    path = pathOrOpts;
    opts = maybeOpts;
  } else {
    opts = pathOrOpts;
  }

  const scale = opts?.scale ?? 1;
  const buf = renderToPNGBuffer(source, scale);

  if (path) {
    fs.writeFileSync(path, buf);
  }

  return buf;
}
