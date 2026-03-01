import type { RGBA, ColorInput, PaletteMap, SpriteConfig, NinePatchEdges, Renderable } from './types.js';
import { Frame } from './frame.js';
import { parseColor } from './color.js';
import { parseFrames } from './parser.js';
import * as transform from './transform.js';
import { ninePatchResize } from './nine-patch.js';

/**
 * A Sprite is a named collection of immutable frames with shared palette and metadata.
 * Transform methods return new Sprite instances (immutable).
 */
export class Sprite implements Renderable {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly frames: Frame[];
  readonly palette: PaletteMap;
  readonly origin: { x: number; y: number };
  readonly frameDuration: number[];

  constructor(config: {
    name: string;
    frames: Frame[];
    palette: PaletteMap;
    origin: { x: number; y: number };
    frameDuration: number[];
  }) {
    this.name = config.name;
    this.frames = config.frames;
    this.palette = config.palette;
    this.origin = config.origin;
    this.frameDuration = config.frameDuration;

    if (this.frames.length === 0) {
      throw new Error('Sprite must have at least one frame');
    }
    this.width = this.frames[0]!.width;
    this.height = this.frames[0]!.height;
  }

  /** Get a specific frame (defaults to frame 0) */
  frame(index: number = 0): Frame {
    if (index < 0 || index >= this.frames.length) {
      throw new Error(`Frame index ${index} out of range (0-${this.frames.length - 1})`);
    }
    return this.frames[index]!;
  }

  /** Get pixel from frame 0 (for Renderable interface) */
  getPixel(x: number, y: number): RGBA {
    return this.frames[0]!.getPixel(x, y);
  }

  /** Flip all frames horizontally */
  flipX(): Sprite {
    return this._withFrames(this.frames.map((f) => transform.flipX(f)));
  }

  /** Flip all frames vertically */
  flipY(): Sprite {
    return this._withFrames(this.frames.map((f) => transform.flipY(f)));
  }

  /** Rotate all frames by degrees (90, 180, 270) clockwise */
  rotate(degrees: 90 | 180 | 270): Sprite {
    return this._withFrames(this.frames.map((f) => transform.rotate(f, degrees)));
  }

  /** Scale all frames by an integer factor */
  scale(factor: number): Sprite {
    return this._withFrames(this.frames.map((f) => transform.scale(f, factor)));
  }

  /** Pad all frames with extra pixels on each side */
  pad(top: number, right: number, bottom: number, left: number, color?: ColorInput): Sprite {
    const fill: RGBA = color ? parseColor(color) : [0, 0, 0, 0];
    return this._withFrames(
      this.frames.map((f) => transform.pad(f, top, right, bottom, left, fill)),
    );
  }

  /** Crop a sub-region from all frames */
  crop(x: number, y: number, w: number, h: number): Sprite {
    return this._withFrames(this.frames.map((f) => transform.crop(f, x, y, w, h)));
  }

  /** Adjust opacity of all frames */
  opacity(alpha: number): Sprite {
    return this._withFrames(this.frames.map((f) => transform.opacity(f, alpha)));
  }

  /** Add an outline around non-transparent pixels */
  outline(color: ColorInput, thickness?: number): Sprite {
    const rgba = parseColor(color);
    return this._withFrames(this.frames.map((f) => transform.outline(f, rgba, thickness)));
  }

  /** Resize using nine-patch rules */
  ninePatch(edges: NinePatchEdges, width: number, height: number): Sprite {
    return this._withFrames(this.frames.map((f) => ninePatchResize(f, edges, width, height)));
  }

  /** Create a palette-swapped copy */
  recolor(mapping: Record<string, ColorInput>): Sprite {
    // Build old→new RGBA mapping
    const colorMap = new Map<string, RGBA>();
    for (const [key, newColor] of Object.entries(mapping)) {
      const oldColor = this.palette[key];
      if (oldColor !== undefined) {
        const oldRGBA = parseColor(oldColor);
        const newRGBA = parseColor(newColor);
        colorMap.set(oldRGBA.join(','), newRGBA);
      }
    }

    const newFrames = this.frames.map((frame) => {
      const pixels: RGBA[][] = [];
      for (let y = 0; y < frame.height; y++) {
        const row: RGBA[] = [];
        for (let x = 0; x < frame.width; x++) {
          const pixel = frame.getPixel(x, y);
          const key = pixel.join(',');
          const mapped = colorMap.get(key);
          row.push(mapped ?? pixel);
        }
        pixels.push(row);
      }
      return new Frame(pixels);
    });

    const newPalette = { ...this.palette };
    for (const [key, newColor] of Object.entries(mapping)) {
      if (key in newPalette) {
        newPalette[key] = newColor;
      }
    }

    return new Sprite({
      name: this.name,
      frames: newFrames,
      palette: newPalette,
      origin: this.origin,
      frameDuration: this.frameDuration,
    });
  }

  private _withFrames(frames: Frame[]): Sprite {
    return new Sprite({
      name: this.name,
      frames,
      palette: this.palette,
      origin: this.origin,
      frameDuration: this.frameDuration,
    });
  }
}

/** Create a Sprite from an ASCII grid configuration */
export function sprite(config: SpriteConfig): Sprite {
  const grids = parseFrames(config.frames, config.palette);
  const frames = grids.map((grid) => new Frame(grid));

  const frameDuration = Array.isArray(config.frameDuration)
    ? config.frameDuration
    : new Array(frames.length).fill(config.frameDuration ?? 100);

  return new Sprite({
    name: config.name ?? 'untitled',
    frames,
    palette: config.palette,
    origin: config.origin ?? { x: 0, y: 0 },
    frameDuration,
  });
}
