import type { RGBA, PixelGrid, Renderable } from './types.js';

const TRANSPARENT: RGBA = [0, 0, 0, 0];

/**
 * Immutable frame of pixel data. No null pixels — transparent is [0,0,0,0].
 */
export class Frame implements Renderable {
  readonly width: number;
  readonly height: number;
  readonly pixels: PixelGrid;

  constructor(pixels: PixelGrid) {
    this.height = pixels.length;
    this.width = this.height > 0 ? pixels[0]!.length : 0;
    this.pixels = pixels;
  }

  /** Get the RGBA color at (x, y). Returns transparent for out-of-bounds. */
  getPixel(x: number, y: number): RGBA {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return TRANSPARENT;
    }
    return this.pixels[y]![x]!;
  }
}
