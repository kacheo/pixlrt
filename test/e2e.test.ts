import { describe, it, expect, afterEach } from 'vitest';
import { PNG } from 'pngjs';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  sprite,
  tileset,
  compose,
  paletteFrom,
  toPNG,
  toSVG,
  toSpriteSheet,
} from '../src/index.js';

// ── Helpers ──────────────────────────────────────────────────────────────

let tmpDir: string;
const tmpFiles: string[] = [];

function tmpPath(name: string): string {
  if (!tmpDir) {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixlrt-e2e-'));
  }
  const p = path.join(tmpDir, name);
  tmpFiles.push(p);
  return p;
}

afterEach(() => {
  for (const f of tmpFiles) {
    try {
      fs.unlinkSync(f);
    } catch {
      // ignore cleanup errors
    }
  }
  tmpFiles.length = 0;
});

// ── Tests ────────────────────────────────────────────────────────────────

describe('E2E: full sprite workflow', () => {
  it('palette → sprite → transform chain → PNG with correct pixels', () => {
    const pico8 = paletteFrom('pico8');

    // 3×3 sprite using pico8 palette chars
    // '0' = black [0,0,0,255], '8' = red [255,0,77,255], '.' = transparent
    const s = sprite({
      palette: pico8,
      frames: [
        `
        080
        808
        080
      `,
      ],
    });

    expect(s.width).toBe(3);
    expect(s.height).toBe(3);

    // flipX then scale 2x
    const transformed = s.flipX().scale(2);
    expect(transformed.width).toBe(6);
    expect(transformed.height).toBe(6);

    const buf = toPNG(transformed);
    const png = PNG.sync.read(buf);
    expect(png.width).toBe(6);
    expect(png.height).toBe(6);

    // After flipX of "080", first row becomes "080" (symmetric).
    // After scale(2), pixel (0,0) is the top-left of the original (0,0)='0' → black
    const idx00 = 0; // pixel (0,0)
    expect(png.data[idx00]).toBe(0); // r
    expect(png.data[idx00 + 1]).toBe(0); // g
    expect(png.data[idx00 + 2]).toBe(0); // b
    expect(png.data[idx00 + 3]).toBe(255); // a

    // Original top-right is '0' (black). After flipX it moves to top-left.
    // But "080" is symmetric, so (0,0) is still '0'.
    // Pixel (2,0) in scaled output corresponds to original (1,0) = '8' (red)
    const idx20 = (0 * 6 + 2) * 4;
    expect(png.data[idx20]).toBe(255); // r
    expect(png.data[idx20 + 1]).toBe(0); // g
    expect(png.data[idx20 + 2]).toBe(77); // b
    expect(png.data[idx20 + 3]).toBe(255);
  });
});

describe('E2E: multi-frame sprite → sprite sheet', () => {
  it('produces valid sprite sheet with correct metadata', () => {
    const palette = { '.': 'transparent', x: '#ff0000', o: '#00ff00' };

    const s = sprite({
      palette,
      frameDuration: [100, 200],
      frames: [
        `
          xo
          ox
        `,
        `
          ox
          xo
        `,
      ],
    });

    expect(s.frames.length).toBe(2);

    const { buffer, metadata } = toSpriteSheet(s, { columns: 2 });

    // Valid PNG buffer
    const png = PNG.sync.read(buffer);
    // 2 columns × 2px wide = 4px, 1 row × 2px tall = 2px
    expect(png.width).toBe(4);
    expect(png.height).toBe(2);

    // Metadata
    expect(metadata.frames).toHaveLength(2);
    expect(metadata.frameWidth).toBe(2);
    expect(metadata.frameHeight).toBe(2);

    // Frame positions
    expect(metadata.frames[0]).toMatchObject({ index: 0, x: 0, y: 0, w: 2, h: 2 });
    expect(metadata.frames[1]).toMatchObject({ index: 1, x: 2, y: 0, w: 2, h: 2 });

    // Durations
    expect(metadata.frames[0]!.duration).toBe(100);
    expect(metadata.frames[1]!.duration).toBe(200);
  });
});

describe('E2E: tileset → composition → PNG', () => {
  it('composes tiles and renders correct pixels', () => {
    const palette = { '.': 'transparent', r: '#ff0000', b: '#0000ff' };

    const ts = tileset({
      tileSize: 2,
      palette,
      tiles: {
        red: `
          rr
          rr
        `,
        blue: `
          bb
          bb
        `,
      },
    });

    const red = ts.tile('red');
    const blue = ts.tile('blue');

    // Place red at (0,0) and blue at (2,0) → 4×2 canvas
    const canvas = compose().place(red, { x: 0, y: 0 }).place(blue, { x: 2, y: 0 }).render();

    expect(canvas.width).toBe(4);
    expect(canvas.height).toBe(2);

    const buf = toPNG(canvas);
    const png = PNG.sync.read(buf);
    expect(png.width).toBe(4);
    expect(png.height).toBe(2);

    // (0,0) should be red
    const idx00 = 0;
    expect(png.data[idx00]).toBe(255);
    expect(png.data[idx00 + 1]).toBe(0);
    expect(png.data[idx00 + 2]).toBe(0);

    // (2,0) should be blue
    const idx20 = (0 * 4 + 2) * 4;
    expect(png.data[idx20]).toBe(0);
    expect(png.data[idx20 + 1]).toBe(0);
    expect(png.data[idx20 + 2]).toBe(255);
  });
});

describe('E2E: SVG rendering pipeline', () => {
  it('produces valid SVG with correct structure', () => {
    const palette = { '.': 'transparent', x: '#ff0000' };

    const s = sprite({
      palette,
      frames: [
        `
        x.
        .x
      `,
      ],
    });

    const svg = toSVG(s, { scale: 4 });

    // SVG root with correct dimensions (2×4=8, 2×4=8)
    expect(svg).toContain('width="8"');
    expect(svg).toContain('height="8"');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('shape-rendering="crispEdges"');

    // Should contain red rect elements
    expect(svg).toContain('fill="#ff0000"');
    expect(svg).toContain('<rect');
    expect(svg).toContain('</svg>');
  });
});

describe('E2E: file output round-trip', () => {
  it('writes PNG and SVG files that can be read back', () => {
    const palette = { '.': 'transparent', g: '#00ff00' };

    const s = sprite({
      palette,
      frames: [
        `
        gg
        gg
      `,
      ],
    });

    // PNG round-trip
    const pngPath = tmpPath('roundtrip.png');
    toPNG(s, pngPath);

    expect(fs.existsSync(pngPath)).toBe(true);
    const pngData = fs.readFileSync(pngPath);
    const png = PNG.sync.read(pngData);
    expect(png.width).toBe(2);
    expect(png.height).toBe(2);
    // All pixels green
    for (let i = 0; i < 4; i++) {
      const idx = i * 4;
      expect(png.data[idx]).toBe(0);
      expect(png.data[idx + 1]).toBe(255);
      expect(png.data[idx + 2]).toBe(0);
      expect(png.data[idx + 3]).toBe(255);
    }

    // SVG round-trip
    const svgPath = tmpPath('roundtrip.svg');
    toSVG(s, svgPath);

    expect(fs.existsSync(svgPath)).toBe(true);
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    expect(svgContent).toContain('<svg');
    expect(svgContent).toContain('fill="#00ff00"');
    expect(svgContent).toContain('</svg>');
  });
});
