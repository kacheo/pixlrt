import * as fs from 'node:fs';
import type { Renderable, SVGOptions } from '../types.js';
import { toSVG as toSVGCore } from './svg.js';

export function toSVG(source: Renderable, path: string, opts?: SVGOptions): string;
export function toSVG(source: Renderable, opts?: SVGOptions): string;
export function toSVG(
  source: Renderable,
  pathOrOpts?: string | SVGOptions,
  maybeOpts?: SVGOptions,
): string {
  let path: string | undefined;
  let opts: SVGOptions | undefined;

  if (typeof pathOrOpts === 'string') {
    path = pathOrOpts;
    opts = maybeOpts;
  } else {
    opts = pathOrOpts;
  }

  const svg = toSVGCore(source, opts);

  if (path) {
    fs.writeFileSync(path, svg, 'utf-8');
  }

  return svg;
}
