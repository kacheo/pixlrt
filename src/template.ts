import type { RGBA, ColorInput, PaletteMap } from './types.js';
import { Frame } from './frame.js';
import { parseColor } from './color.js';
import { Sprite } from './sprite.js';

/** Mapping of slot keys to role names */
export type SlotMap = Record<string, string>;

/** Mapping of role names to colors */
export type SlotFill = Record<string, ColorInput>;

/** Configuration for creating a SpriteTemplate */
export interface SpriteTemplateConfig {
  /** Single-char key → role name mapping */
  slots: SlotMap;
  /** ASCII grid frames using slot keys and '.' for transparent */
  frames: string[];
  /** Optional sprite name */
  name?: string;
  /** Optional origin point */
  origin?: { x: number; y: number };
  /** Optional per-frame durations in ms */
  frameDuration?: number | number[];
}

/** Options for animateSlots() */
export interface AnimateSlotsOptions {
  /** Per-keyframe slot overrides — each entry maps role names to colors */
  keyframes: SlotFill[];
  /** Base fill for all slots not overridden in a keyframe */
  base: SlotFill;
  /** Per-frame duration in ms (single value or array matching keyframes length) */
  frameDuration?: number | number[];
}

const TRANSPARENT: RGBA = [0, 0, 0, 0];

/**
 * A SpriteTemplate defines a grid structure with named slots instead of colors.
 * Call .fill() to bind slot roles to colors and produce a Sprite.
 */
export class SpriteTemplate {
  readonly name: string;
  readonly slots: SlotMap;
  readonly origin: { x: number; y: number };
  /** Parsed char grids — each frame is a 2D array of chars */
  private readonly _charGrids: string[][][];
  readonly width: number;
  readonly height: number;
  private readonly _frameDuration: number | number[];

  constructor(config: SpriteTemplateConfig) {
    this.name = config.name ?? 'untitled';
    this.slots = { ...config.slots };
    this.origin = config.origin ?? { x: 0, y: 0 };
    this._frameDuration = config.frameDuration ?? 100;

    // Validate slot keys are single chars
    for (const key of Object.keys(this.slots)) {
      if ([...key].length !== 1) {
        throw new Error(`Slot key must be a single character, got '${key}'`);
      }
    }

    // Parse frames into char grids
    if (config.frames.length === 0) {
      throw new Error('At least one frame is required');
    }

    this._charGrids = config.frames.map((ascii, frameIdx) => {
      return this._parseCharGrid(ascii, frameIdx);
    });

    // Validate consistent dimensions
    this.height = this._charGrids[0]!.length;
    this.width = this._charGrids[0]![0]!.length;

    for (let i = 1; i < this._charGrids.length; i++) {
      const g = this._charGrids[i]!;
      if (g.length !== this.height || g[0]!.length !== this.width) {
        throw new Error(
          `Frame ${i} dimensions (${g[0]!.length}x${g.length}) don't match ` +
            `frame 0 dimensions (${this.width}x${this.height}). All frames must be the same size.`,
        );
      }
    }
  }

  /** All role names defined in this template's slots */
  get roles(): string[] {
    return [...new Set(Object.values(this.slots))];
  }

  /**
   * Fill all slots with colors to produce a Sprite.
   * Every role defined in slots must have a corresponding color in the fill mapping.
   */
  fill(mapping: SlotFill): Sprite {
    // Validate all roles are filled
    const roles = this.roles;
    const missing = roles.filter((role) => !(role in mapping));
    if (missing.length > 0) {
      throw new Error(`Missing slot fills: ${missing.join(', ')}`);
    }

    // Build slot key → RGBA
    const resolved = new Map<string, RGBA>();
    for (const [key, role] of Object.entries(this.slots)) {
      resolved.set(key, parseColor(mapping[role]!));
    }

    // Build palette map for the resulting sprite (role → color)
    const palette: PaletteMap = { '.': 'transparent' };
    for (const [key, role] of Object.entries(this.slots)) {
      palette[key] = mapping[role]!;
    }

    // Build frames
    const frames = this._charGrids.map((charGrid) => {
      return this._resolveFrame(charGrid, resolved);
    });

    const frameDuration = this._resolveFrameDuration(frames.length);

    return new Sprite({
      name: this.name,
      frames,
      palette,
      origin: this.origin,
      frameDuration,
    });
  }

  /**
   * Patch specific rows in a frame, using slot keys.
   * Returns a new SpriteTemplate with the patched frame.
   */
  patchRows(patches: Record<number, string>, frameIndex: number = 0): SpriteTemplate {
    if (frameIndex < 0 || frameIndex >= this._charGrids.length) {
      throw new Error(
        `Frame index ${frameIndex} out of range (0-${this._charGrids.length - 1})`,
      );
    }

    const newGrids = this._charGrids.map((g, i) => {
      if (i !== frameIndex) return g.map((row) => [...row]);
      const patched = g.map((row) => [...row]);
      for (const [rowStr, rowAscii] of Object.entries(patches)) {
        const rowIdx = Number(rowStr);
        if (rowIdx < 0 || rowIdx >= this.height) {
          throw new Error(`Row index ${rowIdx} out of range (0-${this.height - 1})`);
        }
        const chars = this._parseRowString(rowAscii);
        if (chars.length !== this.width) {
          throw new Error(
            `Patch row ${rowIdx} width (${chars.length}) doesn't match template width (${this.width})`,
          );
        }
        // Validate chars are valid slot keys or '.'
        for (const ch of chars) {
          if (ch !== '.' && ch !== ' ' && !(ch in this.slots)) {
            throw new Error(
              `Unknown slot key '${ch}' in patch row ${rowIdx}. ` +
                `Available: ${Object.keys(this.slots).join(', ')}, .`,
            );
          }
        }
        patched[rowIdx] = chars;
      }
      return patched;
    });

    return new SpriteTemplate({
      ...this._toConfig(newGrids),
    });
  }

  /**
   * Generate a multi-frame Sprite by varying slot colors per keyframe.
   * Base fill provides defaults; each keyframe overrides specific slots.
   */
  animateSlots(options: AnimateSlotsOptions): Sprite {
    const { keyframes, base } = options;

    if (keyframes.length === 0) {
      throw new Error('At least one keyframe is required');
    }

    // Validate base has all roles
    const roles = this.roles;
    const missingBase = roles.filter((role) => !(role in base));
    if (missingBase.length > 0) {
      throw new Error(`Missing base slot fills: ${missingBase.join(', ')}`);
    }

    // Generate one frame per keyframe (using this template's first char grid)
    const charGrid = this._charGrids[0]!;
    const frames: Frame[] = [];

    for (const kf of keyframes) {
      const merged: SlotFill = { ...base, ...kf };
      const resolved = new Map<string, RGBA>();
      for (const [key, role] of Object.entries(this.slots)) {
        resolved.set(key, parseColor(merged[role]!));
      }
      frames.push(this._resolveFrame(charGrid, resolved));
    }

    // Build palette from base
    const palette: PaletteMap = { '.': 'transparent' };
    for (const [key, role] of Object.entries(this.slots)) {
      palette[key] = base[role]!;
    }

    const frameDuration = this._resolveAnimDuration(options.frameDuration, keyframes.length);

    return new Sprite({
      name: this.name,
      frames,
      palette,
      origin: this.origin,
      frameDuration,
    });
  }

  /** Parse an ASCII string into a 2D char grid */
  private _parseCharGrid(ascii: string, frameIdx: number): string[][] {
    // Expand tabs
    const expanded = ascii.replace(/\t/g, '  ');
    let lines = expanded.split('\n');

    // Trim leading/trailing empty lines
    while (lines.length > 0 && lines[0]!.trim() === '') lines.shift();
    while (lines.length > 0 && lines[lines.length - 1]!.trim() === '') lines.pop();

    if (lines.length === 0) {
      throw new Error(`Frame ${frameIdx}: empty grid`);
    }

    // Dedent
    const indent = lines.reduce((min, line) => {
      if (line.trim() === '') return min;
      const match = line.match(/^(\s*)/);
      return Math.min(min, match ? match[1]!.length : 0);
    }, Infinity);
    if (indent > 0 && indent < Infinity) {
      lines = lines.map((line) => line.slice(indent));
    }

    // Parse into char tokens — space-separated chars
    const charRows: string[][] = [];
    for (let r = 0; r < lines.length; r++) {
      const line = lines[r]!.trim();
      if (line === '') {
        charRows.push([]);
        continue;
      }
      // If the line contains spaces between chars, split on whitespace
      // Otherwise treat each char individually
      const tokens = line.includes(' ')
        ? line.split(/\s+/).filter((t) => t.length > 0)
        : [...line];
      charRows.push(tokens);
    }

    // Find max width and validate chars
    const maxWidth = charRows.reduce((max, row) => Math.max(max, row.length), 0);
    if (maxWidth === 0) {
      throw new Error(`Frame ${frameIdx}: empty grid after parsing`);
    }

    const validKeys = new Set(['.', ...Object.keys(this.slots)]);

    // Right-pad and validate
    for (let r = 0; r < charRows.length; r++) {
      const row = charRows[r]!;
      for (const ch of row) {
        if (!validKeys.has(ch)) {
          throw new Error(
            `Frame ${frameIdx}: unknown slot key '${ch}' at row ${r + 1}. ` +
              `Available: ${[...validKeys].sort().join(', ')}`,
          );
        }
      }
      // Pad with '.'
      while (row.length < maxWidth) {
        row.push('.');
      }
    }

    return charRows;
  }

  /** Parse a single row string into char tokens */
  private _parseRowString(rowAscii: string): string[] {
    const line = rowAscii.trim();
    if (line.includes(' ')) {
      return line.split(/\s+/).filter((t) => t.length > 0);
    }
    return [...line];
  }

  /** Resolve a char grid to a Frame using a slot→RGBA mapping */
  private _resolveFrame(charGrid: string[][], resolved: Map<string, RGBA>): Frame {
    const pixels: RGBA[][] = [];
    for (const row of charGrid) {
      const pixelRow: RGBA[] = [];
      for (const ch of row) {
        if (ch === '.') {
          pixelRow.push(TRANSPARENT);
        } else {
          pixelRow.push(resolved.get(ch) ?? TRANSPARENT);
        }
      }
      pixels.push(pixelRow);
    }
    return new Frame(pixels);
  }

  /** Resolve frameDuration config for fill() */
  private _resolveFrameDuration(frameCount: number): number[] {
    if (Array.isArray(this._frameDuration)) {
      if (this._frameDuration.length !== frameCount) {
        throw new Error(
          `frameDuration length (${this._frameDuration.length}) must match frames length (${frameCount})`,
        );
      }
      return this._frameDuration;
    }
    return new Array(frameCount).fill(this._frameDuration);
  }

  /** Resolve frameDuration for animateSlots() */
  private _resolveAnimDuration(
    dur: number | number[] | undefined,
    keyframeCount: number,
  ): number[] {
    if (dur === undefined) return new Array(keyframeCount).fill(100);
    if (Array.isArray(dur)) {
      if (dur.length !== keyframeCount) {
        throw new Error(
          `frameDuration length (${dur.length}) must match keyframes length (${keyframeCount})`,
        );
      }
      return dur;
    }
    return new Array(keyframeCount).fill(dur);
  }

  /** Reconstruct config from modified char grids */
  private _toConfig(charGrids: string[][][]): SpriteTemplateConfig {
    // Convert char grids back to ASCII strings
    const frames = charGrids.map((grid) =>
      grid.map((row) => row.join(' ')).join('\n'),
    );

    return {
      slots: this.slots,
      frames,
      name: this.name,
      origin: this.origin,
      frameDuration: this._frameDuration,
    };
  }
}

/** Create a SpriteTemplate from a configuration */
export function template(config: SpriteTemplateConfig): SpriteTemplate {
  return new SpriteTemplate(config);
}
