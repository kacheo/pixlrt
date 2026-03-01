import type { RGBA, PixelGrid } from './types.js';
import { Frame } from './frame.js';

/** Flip a frame horizontally (mirror left-right) */
export function flipX(frame: Frame): Frame {
  const pixels: RGBA[][] = [];
  for (let r = 0; r < frame.height; r++) {
    const row: RGBA[] = [];
    for (let c = 0; c < frame.width; c++) {
      row.push(frame.getPixel(frame.width - 1 - c, r));
    }
    pixels.push(row);
  }
  return new Frame(pixels);
}

/** Flip a frame vertically (mirror top-bottom) */
export function flipY(frame: Frame): Frame {
  const pixels: RGBA[][] = [];
  for (let r = 0; r < frame.height; r++) {
    const row: RGBA[] = [];
    for (let c = 0; c < frame.width; c++) {
      row.push(frame.getPixel(c, frame.height - 1 - r));
    }
    pixels.push(row);
  }
  return new Frame(pixels);
}

/** Rotate a frame by 90° clockwise. Result dimensions are HxW. */
export function rotate90(frame: Frame): Frame {
  const pixels: RGBA[][] = [];
  for (let r = 0; r < frame.width; r++) {
    const row: RGBA[] = [];
    for (let c = 0; c < frame.height; c++) {
      row.push(frame.getPixel(r, frame.height - 1 - c));
    }
    pixels.push(row);
  }
  return new Frame(pixels);
}

/** Rotate a frame by 180°. */
export function rotate180(frame: Frame): Frame {
  const pixels: RGBA[][] = [];
  for (let r = 0; r < frame.height; r++) {
    const row: RGBA[] = [];
    for (let c = 0; c < frame.width; c++) {
      row.push(frame.getPixel(frame.width - 1 - c, frame.height - 1 - r));
    }
    pixels.push(row);
  }
  return new Frame(pixels);
}

/** Rotate a frame by 270° clockwise (90° counter-clockwise). Result dimensions are HxW. */
export function rotate270(frame: Frame): Frame {
  const pixels: RGBA[][] = [];
  for (let r = 0; r < frame.width; r++) {
    const row: RGBA[] = [];
    for (let c = 0; c < frame.height; c++) {
      row.push(frame.getPixel(frame.width - 1 - r, c));
    }
    pixels.push(row);
  }
  return new Frame(pixels);
}

/** Rotate a frame by the given degrees (90, 180, 270) clockwise. */
export function rotate(frame: Frame, degrees: 90 | 180 | 270): Frame {
  switch (degrees) {
    case 90:
      return rotate90(frame);
    case 180:
      return rotate180(frame);
    case 270:
      return rotate270(frame);
  }
}

/** Scale a frame by an integer factor using nearest-neighbor interpolation. */
export function scale(frame: Frame, factor: number): Frame {
  if (factor < 1 || !Number.isInteger(factor)) {
    throw new Error(`Scale factor must be a positive integer, got ${factor}`);
  }
  if (factor === 1) return frame;

  const pixels: RGBA[][] = [];
  for (let r = 0; r < frame.height * factor; r++) {
    const row: RGBA[] = [];
    const srcY = Math.floor(r / factor);
    for (let c = 0; c < frame.width * factor; c++) {
      const srcX = Math.floor(c / factor);
      row.push(frame.getPixel(srcX, srcY));
    }
    pixels.push(row);
  }
  return new Frame(pixels);
}
