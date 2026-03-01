import { describe, it, expect } from 'vitest';
import { sprite } from '../src/sprite.js';
import { toSVG } from '../src/render/svg.js';

const palette = {
  '.': 'transparent',
  'x': '#ff0000',
  'o': '#0000ff',
};

describe('toSVG', () => {
  it('returns a valid SVG string', () => {
    const s = sprite({
      palette,
      frames: [`
        xo
        .x
      `],
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
      frames: [`
        x.
        .x
      `],
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
});
