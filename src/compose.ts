import type { RGBA, ColorInput, Renderable } from './types.js';
import { parseColor } from './color.js';
import { PixelCanvas } from './canvas.js';

interface PlaceEntry {
  source: Renderable;
  x: number;
  y: number;
}

interface ComposeOptions {
  width?: number;
  height?: number;
  background?: ColorInput;
}

/**
 * Fluent composition builder for layering sprites onto a canvas.
 */
export class Composer {
  private entries: PlaceEntry[] = [];
  private bgColor: RGBA | null = null;
  private fixedWidth: number | undefined;
  private fixedHeight: number | undefined;

  constructor(options?: ComposeOptions) {
    if (options?.background) {
      this.bgColor = parseColor(options.background);
    }
    this.fixedWidth = options?.width;
    this.fixedHeight = options?.height;
  }

  /** Place a renderable at the given position */
  place(source: Renderable, pos: { x: number; y: number }): Composer {
    this.entries.push({ source, x: pos.x, y: pos.y });
    return this;
  }

  /** Set the background color */
  background(color: ColorInput): Composer {
    this.bgColor = parseColor(color);
    return this;
  }

  /** Render all placed items onto a new PixelCanvas */
  render(): PixelCanvas {
    // Compute bounding box
    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;

    for (const entry of this.entries) {
      minX = Math.min(minX, entry.x);
      minY = Math.min(minY, entry.y);
      maxX = Math.max(maxX, entry.x + entry.source.width);
      maxY = Math.max(maxY, entry.y + entry.source.height);
    }

    const width = this.fixedWidth ?? (maxX - minX);
    const height = this.fixedHeight ?? (maxY - minY);

    // Shift offset if there are negative coordinates and no fixed size
    const offsetX = this.fixedWidth ? 0 : -minX;
    const offsetY = this.fixedHeight ? 0 : -minY;

    const canvas = new PixelCanvas(width, height);

    if (this.bgColor) {
      canvas.fill(this.bgColor);
    }

    for (const entry of this.entries) {
      canvas.drawRenderable(entry.source, entry.x + offsetX, entry.y + offsetY);
    }

    return canvas;
  }
}

/** Create a new composition builder */
export function compose(options?: ComposeOptions): Composer {
  return new Composer(options);
}
