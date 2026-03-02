import type { Renderable, SVGOptions } from '../types.js';
import { validateScale } from './validate.js';

export function toSVG(source: Renderable, opts?: SVGOptions): string {
  const scale = opts?.scale ?? 1;
  validateScale(scale);
  const w = source.width * scale;
  const h = source.height * scale;

  const rects: string[] = [];

  for (let y = 0; y < source.height; y++) {
    let x = 0;
    while (x < source.width) {
      const [r, g, b, a] = source.getPixel(x, y);

      // Skip transparent pixels
      if (a === 0) {
        x++;
        continue;
      }

      // Run-length encode: find consecutive same-color pixels
      let runLen = 1;
      while (x + runLen < source.width) {
        const [nr, ng, nb, na] = source.getPixel(x + runLen, y);
        if (nr === r && ng === g && nb === b && na === a) {
          runLen++;
        } else {
          break;
        }
      }

      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      const opacity = a < 255 ? ` opacity="${(a / 255).toFixed(3)}"` : '';

      rects.push(
        `  <rect x="${x * scale}" y="${y * scale}" width="${runLen * scale}" height="${scale}" fill="${hex}"${opacity}/>`,
      );

      x += runLen;
    }
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" shape-rendering="crispEdges">`,
    ...rects,
    '</svg>',
  ].join('\n');

  return svg;
}
