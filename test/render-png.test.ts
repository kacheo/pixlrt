import { describe, it, expect, afterEach } from 'vitest';
import { PNG } from 'pngjs';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { sprite } from '../src/sprite.js';
import { PixelCanvas } from '../src/canvas.js';
import { toPNG } from '../src/render/png.js';

const palette = {
  '.': 'transparent',
  x: '#ff0000',
};

describe('toPNG', () => {
  it('returns a valid PNG buffer from a sprite', () => {
    const s = sprite({
      palette,
      frames: [
        `
        x.
        .x
      `,
      ],
    });
    const buf = toPNG(s);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(0);

    // Parse back and verify
    const png = PNG.sync.read(buf);
    expect(png.width).toBe(2);
    expect(png.height).toBe(2);
    // Top-left pixel should be red
    expect(png.data[0]).toBe(255);
    expect(png.data[1]).toBe(0);
    expect(png.data[2]).toBe(0);
    expect(png.data[3]).toBe(255);
  });

  it('scales output', () => {
    const s = sprite({ palette, frames: ['x'] });
    const buf = toPNG(s, { scale: 4 });
    const png = PNG.sync.read(buf);
    expect(png.width).toBe(4);
    expect(png.height).toBe(4);
  });

  it('throws on invalid scale values', () => {
    const s = sprite({ palette, frames: ['x'] });
    expect(() => toPNG(s, { scale: 0 })).toThrow('Scale must be a positive integer, got 0');
    expect(() => toPNG(s, { scale: -1 })).toThrow('Scale must be a positive integer, got -1');
    expect(() => toPNG(s, { scale: 0.5 })).toThrow('Scale must be a positive integer, got 0.5');
  });

  it('renders from PixelCanvas', () => {
    const canvas = new PixelCanvas(2, 2);
    canvas.setPixel(0, 0, [0, 255, 0, 255]);
    const buf = toPNG(canvas);
    const png = PNG.sync.read(buf);
    expect(png.width).toBe(2);
    expect(png.data[0]).toBe(0);
    expect(png.data[1]).toBe(255);
  });
});

describe('toPNG file writing', () => {
  let tmpDir: string;
  let tmpFiles: string[] = [];

  afterEach(() => {
    for (const f of tmpFiles) {
      try {
        fs.unlinkSync(f);
      } catch {
        // ignore cleanup errors
      }
    }
    tmpFiles = [];
  });

  function tmpPath(name: string): string {
    if (!tmpDir) {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixlrt-test-'));
    }
    const p = path.join(tmpDir, name);
    tmpFiles.push(p);
    return p;
  }

  it('writes a valid PNG file to disk', () => {
    const s = sprite({
      palette,
      frames: [
        `
        x.
        .x
      `,
      ],
    });
    const filePath = tmpPath('test-output.png');
    const buf = toPNG(s, filePath);

    // Returns a buffer
    expect(buf).toBeInstanceOf(Buffer);

    // File exists and is valid PNG
    expect(fs.existsSync(filePath)).toBe(true);
    const fileData = fs.readFileSync(filePath);
    const png = PNG.sync.read(fileData);
    expect(png.width).toBe(2);
    expect(png.height).toBe(2);
  });

  it('writes a scaled PNG file to disk', () => {
    const s = sprite({ palette, frames: ['x'] });
    const filePath = tmpPath('test-scaled.png');
    toPNG(s, filePath, { scale: 2 });

    const fileData = fs.readFileSync(filePath);
    const png = PNG.sync.read(fileData);
    expect(png.width).toBe(2);
    expect(png.height).toBe(2);
  });

  it('preserves transparent pixels in output', () => {
    const s = sprite({
      palette,
      frames: [
        `
        x.
        .x
      `,
      ],
    });
    const buf = toPNG(s);
    const png = PNG.sync.read(buf);

    // Top-right pixel (index 1,0) should be transparent
    const idx = (0 * png.width + 1) * 4; // x=1, y=0
    expect(png.data[idx + 3]).toBe(0); // alpha = 0
  });
});
