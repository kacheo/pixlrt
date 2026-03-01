import type { RGBA, Renderable } from './types.js';
import { Frame } from './frame.js';

/**
 * Mutable pixel canvas backed by a flat Uint8Array RGBA buffer.
 * Directly compatible with pngjs for efficient PNG encoding.
 */
export class PixelCanvas implements Renderable {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 4);
  }

  /** Get the RGBA color at (x, y) */
  getPixel(x: number, y: number): RGBA {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return [0, 0, 0, 0];
    }
    const i = (y * this.width + x) * 4;
    return [this.data[i]!, this.data[i + 1]!, this.data[i + 2]!, this.data[i + 3]!];
  }

  /** Set a pixel at (x, y). Out-of-bounds writes are silently ignored. */
  setPixel(x: number, y: number, color: RGBA): void {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const i = (y * this.width + x) * 4;
    this.data[i] = color[0];
    this.data[i + 1] = color[1];
    this.data[i + 2] = color[2];
    this.data[i + 3] = color[3];
  }

  /** Fill the entire canvas with a single color */
  fill(color: RGBA): void {
    for (let i = 0; i < this.data.length; i += 4) {
      this.data[i] = color[0];
      this.data[i + 1] = color[1];
      this.data[i + 2] = color[2];
      this.data[i + 3] = color[3];
    }
  }

  /**
   * Draw a Frame onto this canvas at (dx, dy) with Porter-Duff source-over alpha compositing.
   */
  drawFrame(frame: Frame, dx: number, dy: number): void {
    for (let fy = 0; fy < frame.height; fy++) {
      for (let fx = 0; fx < frame.width; fx++) {
        const tx = dx + fx;
        const ty = dy + fy;
        if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) continue;

        const src = frame.getPixel(fx, fy);
        const srcA = src[3] / 255;

        if (srcA === 0) continue; // fully transparent, skip
        if (srcA === 1) {
          // fully opaque, no blending needed
          this.setPixel(tx, ty, src);
          continue;
        }

        // Porter-Duff source-over
        const dst = this.getPixel(tx, ty);
        const dstA = dst[3] / 255;
        const outA = srcA + dstA * (1 - srcA);

        if (outA === 0) {
          this.setPixel(tx, ty, [0, 0, 0, 0]);
          continue;
        }

        const r = Math.round((src[0] * srcA + dst[0] * dstA * (1 - srcA)) / outA);
        const g = Math.round((src[1] * srcA + dst[1] * dstA * (1 - srcA)) / outA);
        const b = Math.round((src[2] * srcA + dst[2] * dstA * (1 - srcA)) / outA);
        const a = Math.round(outA * 255);

        this.setPixel(tx, ty, [r, g, b, a]);
      }
    }
  }

  /**
   * Draw a Renderable (Frame, PixelCanvas, etc.) onto this canvas at (dx, dy)
   * with Porter-Duff source-over alpha compositing.
   */
  drawRenderable(source: Renderable, dx: number, dy: number): void {
    for (let sy = 0; sy < source.height; sy++) {
      for (let sx = 0; sx < source.width; sx++) {
        const tx = dx + sx;
        const ty = dy + sy;
        if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) continue;

        const src = source.getPixel(sx, sy);
        const srcA = src[3] / 255;

        if (srcA === 0) continue;
        if (srcA === 1) {
          this.setPixel(tx, ty, src);
          continue;
        }

        const dst = this.getPixel(tx, ty);
        const dstA = dst[3] / 255;
        const outA = srcA + dstA * (1 - srcA);

        if (outA === 0) {
          this.setPixel(tx, ty, [0, 0, 0, 0]);
          continue;
        }

        const r = Math.round((src[0] * srcA + dst[0] * dstA * (1 - srcA)) / outA);
        const g = Math.round((src[1] * srcA + dst[1] * dstA * (1 - srcA)) / outA);
        const b = Math.round((src[2] * srcA + dst[2] * dstA * (1 - srcA)) / outA);
        const a = Math.round(outA * 255);

        this.setPixel(tx, ty, [r, g, b, a]);
      }
    }
  }
}
