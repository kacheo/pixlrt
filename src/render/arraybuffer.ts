import type { Renderable } from '../types.js';
import { toImageData } from './imagedata.js';

export function toArrayBuffer(source: Renderable, opts?: { scale?: number }): ArrayBuffer {
  const result = toImageData(source, opts);
  return result.data.buffer as ArrayBuffer;
}
