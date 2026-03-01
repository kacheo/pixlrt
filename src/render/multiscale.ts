import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Renderable, MultiScaleOptions } from '../types.js';
import { toPNG } from './png.js';

export interface MultiScaleResult {
  scales: Array<{ scale: number; path: string; buffer: Buffer }>;
}

/**
 * Render a Renderable at multiple scale factors (@1x, @2x, @3x by default).
 * Optionally writes files to disk using the base path with scale suffixes.
 */
export function toMultiScale(
  source: Renderable,
  path_: string,
  opts?: MultiScaleOptions,
): MultiScaleResult;
export function toMultiScale(
  source: Renderable,
  opts?: MultiScaleOptions,
): MultiScaleResult;
export function toMultiScale(
  source: Renderable,
  pathOrOpts?: string | MultiScaleOptions,
  maybeOpts?: MultiScaleOptions,
): MultiScaleResult {
  let outPath: string | undefined;
  let opts: MultiScaleOptions | undefined;

  if (typeof pathOrOpts === 'string') {
    outPath = pathOrOpts;
    opts = maybeOpts;
  } else {
    opts = pathOrOpts;
  }

  const scales = opts?.scales ?? [1, 2, 3];
  const suffix = opts?.suffix ?? ((s: number) => `@${s}x`);

  const results: MultiScaleResult['scales'] = [];

  for (const scale of scales) {
    const buffer = toPNG(source, { scale });

    let filePath = '';
    if (outPath) {
      const ext = path.extname(outPath);
      const base = outPath.slice(0, outPath.length - ext.length);
      filePath = `${base}${suffix(scale)}${ext}`;
      fs.writeFileSync(filePath, buffer);
    }

    results.push({ scale, path: filePath, buffer });
  }

  return { scales: results };
}
