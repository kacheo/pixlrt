import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { sprite } from '../src/sprite.js';
import { toSVG } from '../src/render/svg.js';
import { toSVG as toSVGNode } from '../src/render/svg-node.js';

const palette = {
  '.': 'transparent',
  x: '#ff0000',
  o: '#0000ff',
};

describe('toSVG', () => {
  it('returns a valid SVG string', () => {
    const s = sprite({
      palette,
      frames: [
        `
        xo
        .x
      `,
      ],
    });
    const svg = toSVG(s);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('width="2"');
    expect(svg).toContain('height="2"');
  });

  it('skips transparent pixels', () => {
    const s = sprite({
      palette,
      frames: [
        `
        x.
        .x
      `,
      ],
    });
    const svg = toSVG(s);
    // Should have 2 rects (one per red pixel), no rect for transparent
    const rectCount = (svg.match(/<rect/g) || []).length;
    expect(rectCount).toBe(2);
  });

  it('applies run-length encoding', () => {
    const s = sprite({
      palette,
      frames: ['xxx'],
    });
    const svg = toSVG(s);
    // Three consecutive same-color pixels should be one rect
    const rectCount = (svg.match(/<rect/g) || []).length;
    expect(rectCount).toBe(1);
    expect(svg).toContain('width="3"');
  });

  it('applies scale', () => {
    const s = sprite({ palette, frames: ['x'] });
    const svg = toSVG(s, { scale: 4 });
    expect(svg).toContain('width="4"');
    expect(svg).toContain('height="4"');
  });

  it('includes color as hex fill', () => {
    const s = sprite({ palette, frames: ['x'] });
    const svg = toSVG(s);
    expect(svg).toContain('fill="#ff0000"');
  });

  describe('file write (node wrapper)', () => {
    let tmpFile: string | undefined;

    afterEach(() => {
      if (tmpFile) {
        try {
          fs.unlinkSync(tmpFile);
        } catch {
          // ignore cleanup errors
        }
        tmpFile = undefined;
      }
    });

    it('writes SVG to file and returns matching string', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixlrt-svg-'));
      tmpFile = path.join(tmpDir, 'test.svg');

      const s = sprite({ palette, frames: ['xo'] });
      const svg = toSVGNode(s, tmpFile);

      expect(fs.existsSync(tmpFile)).toBe(true);
      const written = fs.readFileSync(tmpFile, 'utf-8');
      expect(written).toBe(svg);
    });
  });
});
