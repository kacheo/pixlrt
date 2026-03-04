import type { Renderable } from '../types.js';
import { toImageData } from './imagedata.js';
import { validateScale } from './validate.js';

/** Options for canvas rendering */
export interface CanvasOptions {
  scale?: number;
}

/**
 * Render a Renderable to an OffscreenCanvas.
 * Browser-only — requires OffscreenCanvas and ImageData globals.
 */
export function toCanvas(source: Renderable, opts?: CanvasOptions): OffscreenCanvas {
  const scale = opts?.scale ?? 1;
  validateScale(scale);

  const { width, height, data } = toImageData(source, { scale });
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(
    new ImageData(data as unknown as Uint8ClampedArray<ArrayBuffer>, width, height),
    0,
    0,
  );

  return canvas;
}

/**
 * Render a Renderable onto an existing canvas element or OffscreenCanvas.
 * Draws at position (0, 0), resizing the canvas to fit.
 */
export function renderToCanvas(
  source: Renderable,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  opts?: CanvasOptions,
): void {
  const scale = opts?.scale ?? 1;
  validateScale(scale);

  const { width, height, data } = toImageData(source, { scale });
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  (ctx as CanvasRenderingContext2D).putImageData(
    new ImageData(data as unknown as Uint8ClampedArray<ArrayBuffer>, width, height),
    0,
    0,
  );
}
