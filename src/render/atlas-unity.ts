import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import type { AtlasMeta } from '../types.js';

interface UnityFrame {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
  pivot: { x: number; y: number };
}

export interface UnityOutput {
  frames: Record<string, UnityFrame>;
  meta: {
    app: string;
    image: string;
    format: string;
    size: { w: number; h: number };
    scale: number;
    smartupdate: string;
  };
}

/**
 * Convert AtlasMeta to TexturePacker-compatible Unity JSON format.
 * Adds pivot points and smartupdate hash.
 */
export function toAtlasUnity(metadata: AtlasMeta, path?: string): UnityOutput {
  const frames: Record<string, UnityFrame> = {};

  for (const f of metadata.frames) {
    frames[f.name] = {
      frame: { x: f.x, y: f.y, w: f.w, h: f.h },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: f.sourceW, h: f.sourceH },
      sourceSize: { w: f.sourceW, h: f.sourceH },
      pivot: { x: 0.5, y: 0.5 },
    };
  }

  const smartupdate = crypto
    .createHash('md5')
    .update(JSON.stringify(metadata.frames))
    .digest('hex')
    .slice(0, 16);

  const result: UnityOutput = {
    frames,
    meta: {
      app: 'pixlrt',
      image: metadata.image,
      format: 'RGBA8888',
      size: { w: metadata.width, h: metadata.height },
      scale: metadata.scale,
      smartupdate: `$TexturePacker:SmartUpdate:${smartupdate}$`,
    },
  };

  if (path) {
    fs.writeFileSync(path, JSON.stringify(result, null, 2), 'utf-8');
  }

  return result;
}
