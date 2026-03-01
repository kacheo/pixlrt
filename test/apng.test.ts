import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { sprite } from '../src/sprite.js';
import { toAPNG } from '../src/render/apng.js';

const palette = {
  '.': 'transparent',
  x: '#ff0000',
  y: '#00ff00',
};

/** Find a chunk type in a PNG buffer and return its data offset and length. */
function findChunk(buf: Buffer, type: string): { offset: number; length: number } | null {
  let offset = 8; // skip PNG signature
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const chunkType = buf.toString('ascii', offset + 4, offset + 8);
    if (chunkType === type) {
      return { offset: offset + 8, length };
    }
    offset += 12 + length;
  }
  return null;
}

/** Count occurrences of a chunk type in a PNG buffer. */
function countChunks(buf: Buffer, type: string): number {
  let count = 0;
  let offset = 8;
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const chunkType = buf.toString('ascii', offset + 4, offset + 8);
    if (chunkType === type) count++;
    offset += 12 + length;
  }
  return count;
}

describe('toAPNG', () => {
  it('starts with PNG signature', () => {
    const s = sprite({ palette, frames: ['x'] });
    const buf = toAPNG(s);
    expect(buf.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
  });

  it('contains acTL chunk with correct frame count', () => {
    const s = sprite({ palette, frames: ['x', 'y'], frameDuration: [100, 200] });
    const buf = toAPNG(s);

    const acTL = findChunk(buf, 'acTL');
    expect(acTL).not.toBeNull();

    const numFrames = buf.readUInt32BE(acTL!.offset);
    expect(numFrames).toBe(2);

    const numPlays = buf.readUInt32BE(acTL!.offset + 4);
    expect(numPlays).toBe(0); // infinite loop by default
  });

  it('contains fcTL chunks for each frame', () => {
    const s = sprite({ palette, frames: ['x', 'y', 'x'], frameDuration: [100, 200, 150] });
    const buf = toAPNG(s);

    const fcTLCount = countChunks(buf, 'fcTL');
    expect(fcTLCount).toBe(3);
  });

  it('frame 0 uses IDAT, subsequent frames use fdAT', () => {
    const s = sprite({ palette, frames: ['x', 'y', 'x'] });
    const buf = toAPNG(s);

    const idatCount = countChunks(buf, 'IDAT');
    expect(idatCount).toBeGreaterThanOrEqual(1);

    const fdATCount = countChunks(buf, 'fdAT');
    expect(fdATCount).toBeGreaterThanOrEqual(2); // at least 1 per non-first frame
  });

  it('ends with IEND chunk', () => {
    const s = sprite({ palette, frames: ['x'] });
    const buf = toAPNG(s);

    // Last chunk should be IEND (0 data length)
    // IEND = 4-byte length(0) + "IEND" + 4-byte CRC = 12 bytes
    const iendType = buf.toString('ascii', buf.length - 8, buf.length - 4);
    expect(iendType).toBe('IEND');
  });

  it('respects loop option', () => {
    const s = sprite({ palette, frames: ['x', 'y'] });
    const buf = toAPNG(s, { loop: 3 });

    const acTL = findChunk(buf, 'acTL');
    const numPlays = buf.readUInt32BE(acTL!.offset + 4);
    expect(numPlays).toBe(3);
  });

  it('single-frame produces valid APNG', () => {
    const s = sprite({ palette, frames: ['x'] });
    const buf = toAPNG(s);

    expect(buf).toBeInstanceOf(Buffer);

    const acTL = findChunk(buf, 'acTL');
    expect(acTL).not.toBeNull();
    expect(buf.readUInt32BE(acTL!.offset)).toBe(1);
  });

  it('scale option produces larger frames', () => {
    const s = sprite({ palette, frames: ['x'] });
    const buf = toAPNG(s, { scale: 4 });

    // Check IHDR for dimensions
    const ihdrData = buf.subarray(16, 16 + 8); // IHDR data starts at offset 16 (8 sig + 4 len + 4 type)
    const width = ihdrData.readUInt32BE(0);
    const height = ihdrData.readUInt32BE(4);
    expect(width).toBe(4);
    expect(height).toBe(4);
  });

  it('all overload signatures work', () => {
    const s = sprite({ palette, frames: ['x', 'y'] });

    const buf1 = toAPNG(s);
    expect(buf1).toBeInstanceOf(Buffer);

    const buf2 = toAPNG(s, { scale: 2 });
    expect(buf2).toBeInstanceOf(Buffer);
  });

  describe('file write', () => {
    let tmpDir: string | undefined;

    afterEach(() => {
      if (tmpDir) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        tmpDir = undefined;
      }
    });

    it('writes APNG file to disk', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixlrt-apng-'));
      const filePath = path.join(tmpDir, 'test.png');

      const s = sprite({ palette, frames: ['x', 'y'], frameDuration: [100, 200] });
      const buf = toAPNG(s, filePath);

      expect(buf).toBeInstanceOf(Buffer);
      expect(fs.existsSync(filePath)).toBe(true);

      const fileData = fs.readFileSync(filePath);
      expect(fileData).toEqual(buf);
    });

    it('writes APNG with options to disk', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pixlrt-apng-'));
      const filePath = path.join(tmpDir, 'test-opts.png');

      const s = sprite({ palette, frames: ['x', 'y'] });
      const buf = toAPNG(s, filePath, { scale: 2, loop: 1 });

      expect(buf).toBeInstanceOf(Buffer);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});
