import type { RGBA, NinePatchEdges, NinePatchMeta } from './types.js';
import { Frame } from './frame.js';

/** Compute the 9 region rects for a nine-patch source frame. */
export function ninePatchMeta(frame: Frame, edges: NinePatchEdges): NinePatchMeta {
  const { top, right, bottom, left } = edges;

  if (left + right > frame.width) {
    throw new Error(
      `Nine-patch horizontal edges (${left} + ${right} = ${left + right}) exceed frame width (${frame.width})`,
    );
  }
  if (top + bottom > frame.height) {
    throw new Error(
      `Nine-patch vertical edges (${top} + ${bottom} = ${top + bottom}) exceed frame height (${frame.height})`,
    );
  }

  const centerW = frame.width - left - right;
  const centerH = frame.height - top - bottom;

  return {
    topLeft: { x: 0, y: 0, w: left, h: top },
    topCenter: { x: left, y: 0, w: centerW, h: top },
    topRight: { x: left + centerW, y: 0, w: right, h: top },
    middleLeft: { x: 0, y: top, w: left, h: centerH },
    center: { x: left, y: top, w: centerW, h: centerH },
    middleRight: { x: left + centerW, y: top, w: right, h: centerH },
    bottomLeft: { x: 0, y: top + centerH, w: left, h: bottom },
    bottomCenter: { x: left, y: top + centerH, w: centerW, h: bottom },
    bottomRight: { x: left + centerW, y: top + centerH, w: right, h: bottom },
    sourceWidth: frame.width,
    sourceHeight: frame.height,
    edges,
  };
}

/** Copy a rectangular region from a source frame, tiling it to fill the target dimensions. */
function tileRegion(
  source: Frame,
  srcX: number,
  srcY: number,
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number,
): RGBA[][] {
  const rows: RGBA[][] = [];
  for (let r = 0; r < targetH; r++) {
    const row: RGBA[] = [];
    for (let c = 0; c < targetW; c++) {
      if (srcW > 0 && srcH > 0) {
        row.push(source.getPixel(srcX + (c % srcW), srcY + (r % srcH)));
      } else {
        row.push([0, 0, 0, 0]);
      }
    }
    rows.push(row);
  }
  return rows;
}

/** Resize a frame using nine-patch rules: corners fixed, edges tiled, center tiled. */
export function ninePatchResize(
  frame: Frame,
  edges: NinePatchEdges,
  width: number,
  height: number,
): Frame {
  const { top, right, bottom, left } = edges;

  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new Error('Nine-patch target dimensions must be positive integers');
  }
  if (width < left + right) {
    throw new Error(
      `Nine-patch target width (${width}) is smaller than left + right edges (${left + right})`,
    );
  }
  if (height < top + bottom) {
    throw new Error(
      `Nine-patch target height (${height}) is smaller than top + bottom edges (${top + bottom})`,
    );
  }

  const meta = ninePatchMeta(frame, edges);
  const midW = width - left - right;
  const midH = height - top - bottom;

  const pixels: RGBA[][] = [];

  // Top row of regions
  if (top > 0) {
    const tlRows = tileRegion(frame, meta.topLeft.x, meta.topLeft.y, left, top, left, top);
    const tcRows = tileRegion(
      frame,
      meta.topCenter.x,
      meta.topCenter.y,
      meta.topCenter.w,
      top,
      midW,
      top,
    );
    const trRows = tileRegion(frame, meta.topRight.x, meta.topRight.y, right, top, right, top);
    for (let r = 0; r < top; r++) {
      pixels.push([...tlRows[r]!, ...tcRows[r]!, ...trRows[r]!]);
    }
  }

  // Middle row of regions
  if (midH > 0) {
    const mlRows = tileRegion(
      frame,
      meta.middleLeft.x,
      meta.middleLeft.y,
      left,
      meta.middleLeft.h,
      left,
      midH,
    );
    const cRows = tileRegion(
      frame,
      meta.center.x,
      meta.center.y,
      meta.center.w,
      meta.center.h,
      midW,
      midH,
    );
    const mrRows = tileRegion(
      frame,
      meta.middleRight.x,
      meta.middleRight.y,
      right,
      meta.middleRight.h,
      right,
      midH,
    );
    for (let r = 0; r < midH; r++) {
      pixels.push([...mlRows[r]!, ...cRows[r]!, ...mrRows[r]!]);
    }
  }

  // Bottom row of regions
  if (bottom > 0) {
    const blRows = tileRegion(
      frame,
      meta.bottomLeft.x,
      meta.bottomLeft.y,
      left,
      bottom,
      left,
      bottom,
    );
    const bcRows = tileRegion(
      frame,
      meta.bottomCenter.x,
      meta.bottomCenter.y,
      meta.bottomCenter.w,
      bottom,
      midW,
      bottom,
    );
    const brRows = tileRegion(
      frame,
      meta.bottomRight.x,
      meta.bottomRight.y,
      right,
      bottom,
      right,
      bottom,
    );
    for (let r = 0; r < bottom; r++) {
      pixels.push([...blRows[r]!, ...bcRows[r]!, ...brRows[r]!]);
    }
  }

  return new Frame(pixels);
}
