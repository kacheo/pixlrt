import type { RGBA } from './types.js';
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

/** Pad a frame with extra pixels on each side. */
export function pad(
  frame: Frame,
  top: number,
  right: number,
  bottom: number,
  left: number,
  color: RGBA = [0, 0, 0, 0],
): Frame {
  if (
    !Number.isInteger(top) ||
    !Number.isInteger(right) ||
    !Number.isInteger(bottom) ||
    !Number.isInteger(left)
  ) {
    throw new Error('Padding values must be integers');
  }
  if (top < 0 || right < 0 || bottom < 0 || left < 0) {
    throw new Error('Padding values must be non-negative');
  }

  const newW = frame.width + left + right;
  const newH = frame.height + top + bottom;
  const pixels: RGBA[][] = [];

  for (let r = 0; r < newH; r++) {
    const row: RGBA[] = [];
    for (let c = 0; c < newW; c++) {
      const srcX = c - left;
      const srcY = r - top;
      if (srcX >= 0 && srcX < frame.width && srcY >= 0 && srcY < frame.height) {
        row.push(frame.getPixel(srcX, srcY));
      } else {
        row.push(color);
      }
    }
    pixels.push(row);
  }
  return new Frame(pixels);
}

/** Crop a sub-region from a frame. */
export function crop(frame: Frame, x: number, y: number, w: number, h: number): Frame {
  if (
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    !Number.isInteger(w) ||
    !Number.isInteger(h)
  ) {
    throw new Error('Crop parameters must be integers');
  }
  if (w <= 0 || h <= 0) {
    throw new Error('Crop dimensions must be positive');
  }
  if (x < 0 || y < 0 || x + w > frame.width || y + h > frame.height) {
    throw new Error(
      `Crop region (${x},${y},${w},${h}) extends beyond frame bounds (${frame.width}x${frame.height})`,
    );
  }

  const pixels: RGBA[][] = [];
  for (let r = 0; r < h; r++) {
    const row: RGBA[] = [];
    for (let c = 0; c < w; c++) {
      row.push(frame.getPixel(x + c, y + r));
    }
    pixels.push(row);
  }
  return new Frame(pixels);
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
