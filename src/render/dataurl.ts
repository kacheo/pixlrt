import type { Renderable, SVGOptions } from '../types.js';
import { toSVG } from './svg.js';

export function toDataURL(source: Renderable, opts?: SVGOptions): string {
  const svg = toSVG(source, opts);
  const encoded = btoa(svg);
  return `data:image/svg+xml;base64,${encoded}`;
}
