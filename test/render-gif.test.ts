import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { sprite } from '../src/sprite.js';
import { toGIF } from '../src/render/gif.js';

const palette = {
  '.': 'transparent',
  x: '#ff0000',
  y: '#00ff00',
};

function readU16LE(buf: Buffer, offset: number): number {
  return buf[offset]! | (buf[offset + 1]! << 8);
}

describe('toGIF', () => {
  it('starts with GIF89a header and ends with trailer 0x3B', () => {
    const s = sprite({ palette, frames: ['x'] });
    const buf = toGIF(s);
    expect(buf.subarray(0, 6).toString('ascii')).toBe('GIF89a');
    expect(buf[buf.length - 1]).toBe(0x3b);
  });

  it('encodes correct dimensions in Logical Screen Descriptor', () => {
    const s = sprite({
      palette,
      frames: [
        `
        xy
        yx
      `,
      ],
    });
    const buf = toGIF(s);
    expect(readU16LE(buf, 6)).toBe(2); // width
    expect(readU16LE(buf, 8)).toBe(2); // height
  });

  it('contains NETSCAPE2.0 extension with correct loop count', () => {
    const s = sprite({ palette, frames: ['x'] });

    function findNetscape(buf: Buffer): number {
      for (let i = 0; i < buf.length - 11; i++) {
        if (buf.toString('ascii', i, i + 11) === 'NETSCAPE2.0') return i;
      }
      return -1;
    }

    // Default loop=0 (infinite)
    const buf0 = toGIF(s);
    const nsOff = findNetscape(buf0);
    expect(nsOff).toBeGreaterThan(0);
    // Loop count is at nsOff + 11 (end of string) + 1 (sub-block size) + 1 (sub-block id)
    const loopOff = nsOff + 13;
    expect(readU16LE(buf0, loopOff)).toBe(0);

    // Custom loop count
    const buf3 = toGIF(s, { loop: 3 });
    const nsOff3 = findNetscape(buf3);
    expect(readU16LE(buf3, nsOff3 + 13)).toBe(3);
  });

  it('produces valid buffer for single-frame sprite', () => {
    const s = sprite({ palette, frames: ['x'] });
    const buf = toGIF(s);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(20);
  });

  it('produces valid buffer for multi-frame sprite', () => {
    const s = sprite({
      palette,
      frames: ['x', 'y'],
      frameDuration: [100, 200],
    });
    const buf = toGIF(s);
    expect(buf).toBeInstanceOf(Buffer);

    // Should contain two GCE blocks (0x21 0xF9)
    let gceCount = 0;
    for (let i = 0; i < buf.length - 1; i++) {
      if (buf[i] === 0x21 && buf[i + 1] === 0xf9) {
        gceCount++;
      }
    }
    expect(gceCount).toBe(2);
  });

  it('per-frame GCE delay matches frameDuration', () => {
    const s = sprite({
      palette,
      frames: ['x', 'y'],
      frameDuration: [100, 200],
    });
    const buf = toGIF(s);

    // Find GCE blocks and read delays
    const delays: number[] = [];
    for (let i = 0; i < buf.length - 5; i++) {
      if (buf[i] === 0x21 && buf[i + 1] === 0xf9 && buf[i + 2] === 0x04) {
        delays.push(readU16LE(buf, i + 4));
      }
    }
    expect(delays).toEqual([10, 20]); // 100ms/10=10cs, 200ms/10=20cs
  });

  it('scale option produces scaled dimensions', () => {
    const s = sprite({ palette, frames: ['x'] });
    const buf = toGIF(s, { scale: 4 });
    expect(readU16LE(buf, 6)).toBe(4);
    expect(readU16LE(buf, 8)).toBe(4);
  });

  it('transparency sets GCE transparent color flag', () => {
    const s = sprite({
      palette,
      frames: [
        `
        x.
        .x
      `,
      ],
    });
    const buf = toGIF(s);

    // Find first GCE and check packed byte
    for (let i = 0; i < buf.length - 5; i++) {
      if (buf[i] === 0x21 && buf[i + 1] === 0xf9 && buf[i + 2] === 0x04) {
        const packed = buf[i + 3]!;
        expect(packed & 0x01).toBe(1); // Transparent color flag set
        break;
      }
    }
  });

  it('opaque-only sprite does NOT set GCE transparent flag', () => {
    const opaquePalette = { x: '#ff0000', y: '#00ff00' };
    const s = sprite({
      palette: opaquePalette,
      frames: [
        `
        xy
        yx
      `,
      ],
    });
    const buf = toGIF(s);

    // Find first GCE and check packed byte
    for (let i = 0; i < buf.length - 5; i++) {
      if (buf[i] === 0x21 && buf[i + 1] === 0xf9 && buf[i + 2] === 0x04) {
        const packed = buf[i + 3]!;
        expect(packed & 0x01).toBe(0); // Transparent color flag NOT set
        break;
      }
    }
  });

  it('throws when sprite has >256 unique colors', () => {
    // Build a palette with 257 unique opaque colors
    const bigPalette: Record<string, string> = {};
    // We need 257 unique colors; generate them programmatically
    const colors: string[] = [];
    for (let r = 0; colors.length < 257; r++) {
      for (let g = 0; g < 16 && colors.length < 257; g++) {
        const hex = `#${(r * 16).toString(16).padStart(2, '0')}${(g * 17).toString(16).padStart(2, '0')}00`;
        colors.push(hex);
      }
    }
    // Create single-pixel frames, each with a unique color
    // We need all 257 colors visible in the sprite. Use a 257-pixel single frame.
    // Build a 257-char wide single-row frame
    const allChars: string[] = [];
    for (let i = 0; i < 257; i++) {
      // Use two-char keys to get enough unique palette entries
      const key = String.fromCharCode(33 + Math.floor(i / 94), 33 + (i % 94));
      bigPalette[key] = colors[i]!;
      allChars.push(key);
    }
    // sprite() needs single-char palette keys, so use a different approach:
    // Create the sprite manually via Sprite constructor with pre-built frames
    // Actually, let's just verify the error from buildColorTable indirectly via toGIF
    // We need a sprite with >256 colors. Since palette keys must be single char,
    // and we only have ~90 printable chars, we need multiple frames with different palettes.
    // Simpler: use the Sprite constructor directly with crafted Frame objects.

    // Alternative approach: patch a sprite's frames to have >256 colors
    // Let's use a realistic approach - create frames with many colors
    // Actually the simplest way: create a large palette and wide frame
    const widePalette: Record<string, string> = { '.': 'transparent' };
    const row: string[] = [];
    // Use printable ASCII chars (skip '.' which is transparent)
    let charCode = 33; // '!'
    for (let i = 0; i < 256; i++) {
      let ch = String.fromCharCode(charCode);
      if (ch === '.') {
        charCode++;
        ch = String.fromCharCode(charCode);
      }
      const r = i & 0xff;
      const g = (i >> 2) & 0xff;
      const b = (i * 7) & 0xff;
      widePalette[ch] =
        `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      row.push(ch);
      charCode++;
    }
    // 256 opaque colors + 1 transparent = 257 colors
    row.push('.');
    const s = sprite({ palette: widePalette, frames: [row.join('')] });
    expect(() => toGIF(s)).toThrow('quantize()');
  });

  it('all overload signatures work', () => {
    const s = sprite({ palette, frames: ['x'] });

    // (source)
    const buf1 = toGIF(s);
    expect(buf1).toBeInstanceOf(Buffer);

    // (source, opts)
    const buf2 = toGIF(s, { scale: 2 });
    expect(buf2).toBeInstanceOf(Buffer);
  });
});

describe('toGIF file writing', () => {
  let tmpDir: string;
  let tmpFiles: string[] = [];

  afterEach(() => {
    for (const f of tmpFiles) {
      try {
        fs.unlinkSync(f);
      } catch {
        // ignore
      }
    }
    tmpFiles = [];
  });

  function tmpPath(name: string): string {
    if (!tmpDir) {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixlrt-gif-'));
    }
    const p = path.join(tmpDir, name);
    tmpFiles.push(p);
    return p;
  }

  it('writes GIF file to disk', () => {
    const s = sprite({ palette, frames: ['x'] });
    const filePath = tmpPath('test.gif');
    const buf = toGIF(s, filePath);

    expect(buf).toBeInstanceOf(Buffer);
    expect(fs.existsSync(filePath)).toBe(true);
    const fileData = fs.readFileSync(filePath);
    expect(fileData.subarray(0, 6).toString('ascii')).toBe('GIF89a');
  });

  it('writes GIF with options to disk', () => {
    const s = sprite({ palette, frames: ['x'] });
    const filePath = tmpPath('test-opts.gif');
    const buf = toGIF(s, filePath, { scale: 2, loop: 1 });

    expect(buf).toBeInstanceOf(Buffer);
    const fileData = fs.readFileSync(filePath);
    expect(readU16LE(fileData, 6)).toBe(2); // scaled width
  });
});
