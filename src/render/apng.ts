import * as fs from 'node:fs';
import * as zlib from 'node:zlib';
import { PNG } from 'pngjs';
import type { APNGOptions } from '../types.js';
import { Sprite } from '../sprite.js';
import { validateScale } from './validate.js';

// ── Helpers ──────────────────────────────────────────────────────────

/** Compute CRC32 over a buffer (used for PNG chunk checksums). */
function crc32(buf: Buffer): number {
  return zlib.crc32(buf);
}

/** Build a PNG chunk: 4-byte length + 4-byte type + data + 4-byte CRC. */
function writeChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(typeAndData) >>> 0, 0);

  return Buffer.concat([len, typeAndData, checksum]);
}

/** Extract all IDAT chunk data payloads from a raw PNG buffer. */
function extractIDATData(pngBuffer: Buffer): Buffer[] {
  const chunks: Buffer[] = [];
  // Skip 8-byte PNG signature
  let offset = 8;

  while (offset < pngBuffer.length) {
    const length = pngBuffer.readUInt32BE(offset);
    const type = pngBuffer.toString('ascii', offset + 4, offset + 8);

    if (type === 'IDAT') {
      chunks.push(pngBuffer.subarray(offset + 8, offset + 8 + length));
    }

    // Move past: length(4) + type(4) + data(length) + crc(4)
    offset += 12 + length;
  }

  return chunks;
}

/** Extract the IHDR chunk (length + type + data + crc) from a PNG buffer. */
function extractIHDR(pngBuffer: Buffer): Buffer {
  // IHDR is always the first chunk after the 8-byte signature
  const length = pngBuffer.readUInt32BE(8);
  return pngBuffer.subarray(8, 8 + 12 + length);
}

/** Encode a single sprite frame to a raw PNG buffer using pngjs. */
function encodeFrame(spr: Sprite, frameIndex: number, scale: number): Buffer {
  const frame = spr.frames[frameIndex]!;
  const w = spr.width * scale;
  const h = spr.height * scale;
  const png = new PNG({ width: w, height: h });

  for (let sy = 0; sy < spr.height; sy++) {
    for (let sx = 0; sx < spr.width; sx++) {
      const [r, g, b, a] = frame.getPixel(sx, sy);
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const px = sx * scale + dx;
          const py = sy * scale + dy;
          const i = (py * w + px) * 4;
          png.data[i] = r;
          png.data[i + 1] = g;
          png.data[i + 2] = b;
          png.data[i + 3] = a;
        }
      }
    }
  }

  return PNG.sync.write(png);
}

/** Build an fcTL chunk. */
function buildFcTL(
  seq: number,
  width: number,
  height: number,
  delayNum: number,
  delayDen: number,
): Buffer {
  const data = Buffer.alloc(26);
  data.writeUInt32BE(seq, 0);       // sequence_number
  data.writeUInt32BE(width, 4);     // width
  data.writeUInt32BE(height, 8);    // height
  data.writeUInt32BE(0, 12);        // x_offset
  data.writeUInt32BE(0, 16);        // y_offset
  data.writeUInt16BE(delayNum, 20); // delay_num
  data.writeUInt16BE(delayDen, 22); // delay_den
  data[24] = 0; // dispose_op: APNG_DISPOSE_OP_NONE
  data[25] = 0; // blend_op: APNG_BLEND_OP_SOURCE
  return writeChunk('fcTL', data);
}

// ── Main Export ──────────────────────────────────────────────────────

/**
 * Render a multi-frame Sprite to APNG (Animated PNG) format.
 * Writes to file if path is given; always returns the Buffer.
 */
export function toAPNG(source: Sprite, path: string, opts?: APNGOptions): Buffer;
export function toAPNG(source: Sprite, opts?: APNGOptions): Buffer;
export function toAPNG(
  source: Sprite,
  pathOrOpts?: string | APNGOptions,
  maybeOpts?: APNGOptions,
): Buffer {
  let path: string | undefined;
  let opts: APNGOptions | undefined;

  if (typeof pathOrOpts === 'string') {
    path = pathOrOpts;
    opts = maybeOpts;
  } else {
    opts = pathOrOpts;
  }

  const scale = opts?.scale ?? 1;
  validateScale(scale);
  const loop = opts?.loop ?? 0;
  const numFrames = source.frames.length;

  // Encode all frames as individual PNGs
  const framePNGs = source.frames.map((_, i) => encodeFrame(source, i, scale));

  const parts: Buffer[] = [];

  // 1. PNG signature
  parts.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  // 2. IHDR from frame 0
  parts.push(extractIHDR(framePNGs[0]!));

  // 3. acTL chunk (animation control)
  const acTLData = Buffer.alloc(8);
  acTLData.writeUInt32BE(numFrames, 0); // num_frames
  acTLData.writeUInt32BE(loop, 4);      // num_plays (0 = infinite)
  parts.push(writeChunk('acTL', acTLData));

  const w = source.width * scale;
  const h = source.height * scale;
  let seq = 0;

  // 4. Frame 0: fcTL + original IDAT chunks
  const delay0 = source.frameDuration[0] ?? 100;
  parts.push(buildFcTL(seq++, w, h, delay0, 1000));

  const frame0IDATs = extractIDATData(framePNGs[0]!);
  for (const idatData of frame0IDATs) {
    parts.push(writeChunk('IDAT', idatData));
  }

  // 5. Frames 1+: fcTL + fdAT chunks
  for (let f = 1; f < numFrames; f++) {
    const delay = source.frameDuration[f] ?? 100;
    parts.push(buildFcTL(seq++, w, h, delay, 1000));

    const idats = extractIDATData(framePNGs[f]!);
    for (const idatData of idats) {
      // fdAT = 4-byte sequence number + IDAT data
      const seqBuf = Buffer.alloc(4);
      seqBuf.writeUInt32BE(seq++, 0);
      const fdATData = Buffer.concat([seqBuf, idatData]);
      parts.push(writeChunk('fdAT', fdATData));
    }
  }

  // 6. IEND
  parts.push(writeChunk('IEND', Buffer.alloc(0)));

  const buf = Buffer.concat(parts);

  if (path) {
    fs.writeFileSync(path, buf);
  }

  return buf;
}
