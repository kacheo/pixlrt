import * as fs from 'node:fs';
import type { RGBA } from '../types.js';
import type { GIFOptions } from '../types.js';
import { Sprite } from '../sprite.js';
import { validateScale } from './validate.js';

// ── Helpers ──────────────────────────────────────────────────────────

/** Pack a 16-bit little-endian value into a buffer at offset. */
function writeU16LE(buf: Buffer, value: number, offset: number): void {
  buf[offset] = value & 0xff;
  buf[offset + 1] = (value >> 8) & 0xff;
}

/** LSB-first bit writer that accumulates bytes. */
class BitWriter {
  private buf: number[] = [];
  private byte = 0;
  private bitPos = 0;

  writeBits(value: number, count: number): void {
    for (let i = 0; i < count; i++) {
      if (value & (1 << i)) {
        this.byte |= 1 << this.bitPos;
      }
      this.bitPos++;
      if (this.bitPos === 8) {
        this.buf.push(this.byte);
        this.byte = 0;
        this.bitPos = 0;
      }
    }
  }

  flush(): number[] {
    if (this.bitPos > 0) {
      this.buf.push(this.byte);
      this.byte = 0;
      this.bitPos = 0;
    }
    return this.buf;
  }
}

// ── Color Table ─────────────────────────────────────────────────────

function rgbaKey(c: RGBA): string {
  return `${c[0]},${c[1]},${c[2]},${c[3]}`;
}

interface ColorTable {
  /** Flat RGB bytes for the GIF color table (3 * tableSize). */
  tableBytes: Buffer;
  /** Number of entries in the padded table (power of 2). */
  tableSize: number;
  /** Map from RGBA key → palette index. */
  indexMap: Map<string, number>;
  /** Index used for transparent pixels, or -1 if none. */
  transparentIndex: number;
  /** log2(tableSize) - 1, used in packed field. */
  tableBits: number;
}

function buildColorTable(sprite: Sprite): ColorTable {
  const unique = new Map<string, RGBA>();
  let hasTransparent = false;

  for (const frame of sprite.frames) {
    for (let y = 0; y < frame.height; y++) {
      for (let x = 0; x < frame.width; x++) {
        const px = frame.getPixel(x, y);
        if (px[3] === 0) {
          hasTransparent = true;
        } else {
          const key = rgbaKey(px);
          if (!unique.has(key)) {
            unique.set(key, px);
          }
        }
      }
    }
  }

  // Transparent gets a dedicated slot
  const numColors = unique.size + (hasTransparent ? 1 : 0);
  if (numColors > 256) {
    throw new Error(
      `GIF supports at most 256 colors, found ${numColors}. Consider using quantize() first.`,
    );
  }

  // Build index map: transparent first (if needed), then opaque colors
  const indexMap = new Map<string, number>();
  let transparentIndex = -1;
  let idx = 0;

  if (hasTransparent) {
    transparentIndex = idx;
    // Map the transparent key
    indexMap.set('0,0,0,0', idx);
    idx++;
  }

  for (const [key] of unique) {
    indexMap.set(key, idx);
    idx++;
  }

  // Pad to next power of 2 (minimum 2)
  let tableSize = 2;
  while (tableSize < idx) {
    tableSize *= 2;
  }

  const tableBits = Math.log2(tableSize) - 1;
  const tableBytes = Buffer.alloc(tableSize * 3);

  // Write transparent slot as black (arbitrary — it's transparent)
  if (hasTransparent) {
    const off = transparentIndex * 3;
    tableBytes[off] = 0;
    tableBytes[off + 1] = 0;
    tableBytes[off + 2] = 0;
  }

  for (const [key, rgba] of unique) {
    const i = indexMap.get(key)!;
    const off = i * 3;
    tableBytes[off] = rgba[0];
    tableBytes[off + 1] = rgba[1];
    tableBytes[off + 2] = rgba[2];
  }

  return { tableBytes, tableSize, indexMap, transparentIndex, tableBits };
}

// ── LZW Encoder ─────────────────────────────────────────────────────

function lzwEncode(indices: number[], minCodeSize: number): Buffer {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  const writer = new BitWriter();
  let codeSize = minCodeSize + 1;

  // Dictionary: string → code
  let dict = new Map<string, number>();
  let nextCode = eoiCode + 1;

  // Initialize dictionary with single-character entries
  function resetDict(): void {
    dict = new Map<string, number>();
    for (let i = 0; i < clearCode; i++) {
      dict.set(String(i), i);
    }
    nextCode = eoiCode + 1;
    codeSize = minCodeSize + 1;
  }

  // Start with clear code
  resetDict();
  writer.writeBits(clearCode, codeSize);

  if (indices.length === 0) {
    writer.writeBits(eoiCode, codeSize);
    const bytes = writer.flush();
    return subBlock(bytes);
  }

  let current = String(indices[0]);

  for (let i = 1; i < indices.length; i++) {
    const next = current + ',' + indices[i];
    if (dict.has(next)) {
      current = next;
    } else {
      // Output code for current
      writer.writeBits(dict.get(current)!, codeSize);

      // Add new entry
      if (nextCode < 4096) {
        dict.set(next, nextCode);
        if (nextCode > (1 << codeSize) - 1) {
          codeSize++;
        }
        nextCode++;
      } else {
        // Dictionary full — emit clear code and reset
        writer.writeBits(clearCode, codeSize);
        resetDict();
      }

      current = String(indices[i]);
    }
  }

  // Output remaining
  writer.writeBits(dict.get(current)!, codeSize);
  writer.writeBits(eoiCode, codeSize);

  const bytes = writer.flush();
  return subBlock(bytes);
}

/** Package byte array into GIF sub-blocks (max 255 bytes each). */
function subBlock(bytes: number[]): Buffer {
  const blocks: number[] = [];
  let offset = 0;

  while (offset < bytes.length) {
    const chunk = Math.min(255, bytes.length - offset);
    blocks.push(chunk);
    for (let i = 0; i < chunk; i++) {
      blocks.push(bytes[offset + i]!);
    }
    offset += chunk;
  }

  blocks.push(0); // Block terminator

  return Buffer.from(blocks);
}

// ── GIF Assembly ────────────────────────────────────────────────────

/**
 * Render a multi-frame Sprite to GIF89a format.
 * Writes to file if path is given; always returns the Buffer.
 */
export function toGIF(source: Sprite, path: string, opts?: GIFOptions): Buffer;
export function toGIF(source: Sprite, opts?: GIFOptions): Buffer;
export function toGIF(
  source: Sprite,
  pathOrOpts?: string | GIFOptions,
  maybeOpts?: GIFOptions,
): Buffer {
  let path: string | undefined;
  let opts: GIFOptions | undefined;

  if (typeof pathOrOpts === 'string') {
    path = pathOrOpts;
    opts = maybeOpts;
  } else {
    opts = pathOrOpts;
  }

  const scale = opts?.scale ?? 1;
  validateScale(scale);
  const loop = opts?.loop ?? 0;

  const w = source.width * scale;
  const h = source.height * scale;

  const ct = buildColorTable(source);
  const minCodeSize = ct.tableBits + 1 < 2 ? 2 : ct.tableBits + 1;

  // Pre-encode all frames to compute total size
  const frameDataList: { gce: Buffer; imageDesc: Buffer; lzw: Buffer }[] = [];

  for (let f = 0; f < source.frames.length; f++) {
    const frame = source.frames[f]!;
    const delayMs = source.frameDuration[f] ?? 100;
    const delayCentisecs = Math.max(2, Math.round(delayMs / 10));

    // Graphic Control Extension
    const gce = Buffer.alloc(8);
    gce[0] = 0x21; // Extension introducer
    gce[1] = 0xf9; // GCE label
    gce[2] = 0x04; // Block size
    // Packed: disposal=2 (restore to bg), user input=0, transparent flag
    const hasTransparent = ct.transparentIndex >= 0;
    gce[3] = (2 << 2) | (hasTransparent ? 1 : 0);
    writeU16LE(gce, delayCentisecs, 4);
    gce[6] = hasTransparent ? ct.transparentIndex : 0;
    gce[7] = 0x00; // Block terminator

    // Image Descriptor
    const imageDesc = Buffer.alloc(10);
    imageDesc[0] = 0x2c; // Image separator
    writeU16LE(imageDesc, 0, 1); // left
    writeU16LE(imageDesc, 0, 3); // top
    writeU16LE(imageDesc, w, 5); // width
    writeU16LE(imageDesc, h, 7); // height
    imageDesc[9] = 0x00; // No local color table, not interlaced

    // Build pixel index array (scaled)
    const indices: number[] = new Array(w * h);
    for (let py = 0; py < h; py++) {
      const sy = Math.floor(py / scale);
      for (let px = 0; px < w; px++) {
        const sx = Math.floor(px / scale);
        const pixel = frame.getPixel(sx, sy);
        const key = pixel[3] === 0 ? '0,0,0,0' : rgbaKey(pixel);
        indices[py * w + px] = ct.indexMap.get(key)!;
      }
    }

    // LZW compress
    const lzwData = lzwEncode(indices, minCodeSize);

    frameDataList.push({ gce, imageDesc, lzw: lzwData });
  }

  // Calculate total buffer size
  let totalSize = 0;
  totalSize += 6; // Header
  totalSize += 7; // Logical Screen Descriptor
  totalSize += ct.tableBytes.length; // Global Color Table
  totalSize += 19; // NETSCAPE2.0 Application Extension
  for (const fd of frameDataList) {
    totalSize += fd.gce.length;
    totalSize += fd.imageDesc.length;
    totalSize += 1; // Min code size byte
    totalSize += fd.lzw.length;
  }
  totalSize += 1; // Trailer

  const buf = Buffer.alloc(totalSize);
  let offset = 0;

  // 1. Header
  buf.write('GIF89a', offset);
  offset += 6;

  // 2. Logical Screen Descriptor
  writeU16LE(buf, w, offset);
  offset += 2;
  writeU16LE(buf, h, offset);
  offset += 2;
  // Packed: global color table flag=1, color resolution, sort=0, size of GCT
  buf[offset] = 0x80 | (ct.tableBits << 4) | ct.tableBits;
  offset += 1;
  buf[offset] = 0x00; // Background color index
  offset += 1;
  buf[offset] = 0x00; // Pixel aspect ratio
  offset += 1;

  // 3. Global Color Table
  ct.tableBytes.copy(buf, offset);
  offset += ct.tableBytes.length;

  // 4. NETSCAPE2.0 Application Extension (loop control)
  buf[offset++] = 0x21; // Extension introducer
  buf[offset++] = 0xff; // Application extension label
  buf[offset++] = 0x0b; // Block size (11)
  buf.write('NETSCAPE2.0', offset);
  offset += 11;
  buf[offset++] = 0x03; // Sub-block size
  buf[offset++] = 0x01; // Sub-block ID
  writeU16LE(buf, loop, offset);
  offset += 2;
  buf[offset++] = 0x00; // Block terminator

  // 5. Frames
  for (const fd of frameDataList) {
    fd.gce.copy(buf, offset);
    offset += fd.gce.length;
    fd.imageDesc.copy(buf, offset);
    offset += fd.imageDesc.length;
    buf[offset++] = minCodeSize; // Min LZW code size
    fd.lzw.copy(buf, offset);
    offset += fd.lzw.length;
  }

  // 6. Trailer
  buf[offset] = 0x3b;

  if (path) {
    fs.writeFileSync(path, buf);
  }

  return buf;
}
