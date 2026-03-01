import * as fs from 'node:fs';
import type { AtlasMeta } from '../types.js';

interface PhaserFrame {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
}

interface PhaserMeta {
  app: string;
  image: string;
  format: string;
  size: { w: number; h: number };
  scale: number;
}

export interface PhaserHashOutput {
  frames: Record<string, PhaserFrame>;
  meta: PhaserMeta;
}

export interface PhaserArrayOutput {
  frames: Array<PhaserFrame & { filename: string }>;
  meta: PhaserMeta;
}

function buildMeta(metadata: AtlasMeta): PhaserMeta {
  return {
    app: 'pixlrt',
    image: metadata.image,
    format: 'RGBA8888',
    size: { w: metadata.width, h: metadata.height },
    scale: metadata.scale,
  };
}

function buildFrame(f: AtlasMeta['frames'][number]): PhaserFrame {
  return {
    frame: { x: f.x, y: f.y, w: f.w, h: f.h },
    rotated: false,
    trimmed: false,
    spriteSourceSize: { x: 0, y: 0, w: f.sourceW, h: f.sourceH },
    sourceSize: { w: f.sourceW, h: f.sourceH },
  };
}

/**
 * Convert AtlasMeta to Phaser/PixiJS JSON format.
 * Supports 'hash' (default) and 'array' formats.
 */
export function toAtlasPhaser(
  metadata: AtlasMeta,
  path?: string,
  format?: 'hash' | 'array',
): PhaserHashOutput | PhaserArrayOutput {
  const fmt = format ?? 'hash';
  const meta = buildMeta(metadata);

  let result: PhaserHashOutput | PhaserArrayOutput;

  if (fmt === 'array') {
    const frames = metadata.frames.map((f) => ({
      filename: f.name,
      ...buildFrame(f),
    }));
    result = { frames, meta };
  } else {
    const frames: Record<string, PhaserFrame> = {};
    for (const f of metadata.frames) {
      frames[f.name] = buildFrame(f);
    }
    result = { frames, meta };
  }

  if (path) {
    fs.writeFileSync(path, JSON.stringify(result, null, 2), 'utf-8');
  }

  return result;
}
