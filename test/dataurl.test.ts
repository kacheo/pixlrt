import { describe, it, expect } from 'vitest';
import { sprite } from '../src/sprite.js';
import { toDataURL } from '../src/render/dataurl.js';

const palette = {
  '.': 'transparent',
  x: '#ff0000',
};

describe('toDataURL', () => {
  it('returns a data URI with SVG mime type', () => {
    const s = sprite({ palette, frames: ['x'] });
    const result = toDataURL(s);
    expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it('contains valid base64-encoded SVG', () => {
    const s = sprite({ palette, frames: ['x'] });
    const result = toDataURL(s);
    const base64 = result.replace('data:image/svg+xml;base64,', '');
    const decoded = atob(base64);
    expect(decoded).toContain('<svg');
    expect(decoded).toContain('</svg>');
    expect(decoded).toContain('fill="#ff0000"');
  });

  it('respects scale option', () => {
    const s = sprite({ palette, frames: ['x'] });
    const result = toDataURL(s, { scale: 4 });
    const base64 = result.replace('data:image/svg+xml;base64,', '');
    const decoded = atob(base64);
    expect(decoded).toContain('width="4"');
    expect(decoded).toContain('height="4"');
  });
});
