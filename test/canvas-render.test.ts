import { describe, it, expect, vi, beforeAll } from 'vitest';
import { sprite } from '../src/sprite.js';

const palette = {
  '.': 'transparent',
  x: '#ff0000',
  o: '#0000ff',
};

// Mock browser canvas APIs for Node test environment
const putImageData = vi.fn();
const mockCtx = { putImageData };

beforeAll(() => {
  // Mock OffscreenCanvas globally
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).OffscreenCanvas = class {
    width: number;
    height: number;
    constructor(w: number, h: number) {
      this.width = w;
      this.height = h;
    }
    getContext() {
      return mockCtx;
    }
  };

  // Mock ImageData globally (not available in Node)
  if (typeof globalThis.ImageData === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).ImageData = class {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      constructor(data: Uint8ClampedArray, width: number, height: number) {
        this.data = data;
        this.width = width;
        this.height = height;
      }
    };
  }
});

describe('toCanvas', () => {
  it('returns an OffscreenCanvas with correct dimensions', async () => {
    const { toCanvas } = await import('../src/render/canvas-render.js');
    const s = sprite({ palette, frames: ['xo\n.x'] });
    const canvas = toCanvas(s);
    expect(canvas.width).toBe(2);
    expect(canvas.height).toBe(2);
  });

  it('applies scale', async () => {
    const { toCanvas } = await import('../src/render/canvas-render.js');
    const s = sprite({ palette, frames: ['x'] });
    const canvas = toCanvas(s, { scale: 4 });
    expect(canvas.width).toBe(4);
    expect(canvas.height).toBe(4);
  });

  it('calls putImageData with correct pixel data', async () => {
    putImageData.mockClear();
    const { toCanvas } = await import('../src/render/canvas-render.js');
    const s = sprite({ palette, frames: ['x'] });
    toCanvas(s);
    expect(putImageData).toHaveBeenCalledTimes(1);
    const imageData = putImageData.mock.calls[0][0];
    expect(imageData.width).toBe(1);
    expect(imageData.height).toBe(1);
    // Red pixel
    expect(imageData.data[0]).toBe(255);
    expect(imageData.data[1]).toBe(0);
    expect(imageData.data[2]).toBe(0);
    expect(imageData.data[3]).toBe(255);
  });

  it('throws on invalid scale', async () => {
    const { toCanvas } = await import('../src/render/canvas-render.js');
    const s = sprite({ palette, frames: ['x'] });
    expect(() => toCanvas(s, { scale: 0 })).toThrow();
    expect(() => toCanvas(s, { scale: 1.5 })).toThrow();
  });
});

describe('renderToCanvas', () => {
  it('renders onto an existing canvas and resizes it', async () => {
    putImageData.mockClear();
    const { renderToCanvas } = await import('../src/render/canvas-render.js');
    const s = sprite({ palette, frames: ['xo\nox'] });
    const target = { width: 0, height: 0, getContext: () => mockCtx };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderToCanvas(s, target as any);
    expect(target.width).toBe(2);
    expect(target.height).toBe(2);
    expect(putImageData).toHaveBeenCalledTimes(1);
  });

  it('applies scale to existing canvas', async () => {
    putImageData.mockClear();
    const { renderToCanvas } = await import('../src/render/canvas-render.js');
    const s = sprite({ palette, frames: ['x'] });
    const target = { width: 0, height: 0, getContext: () => mockCtx };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderToCanvas(s, target as any, { scale: 3 });
    expect(target.width).toBe(3);
    expect(target.height).toBe(3);
  });
});
