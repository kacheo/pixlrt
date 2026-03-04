# pixlrt API Reference

Complete API documentation for pixlrt. All examples use ESM imports.

---

## Table of Contents

1. [Package Entry Points](#package-entry-points)
2. [Creating Sprites](#creating-sprites)
3. [Templates](#templates)
4. [Composition](#composition)
5. [Tilesets](#tilesets)
6. [Transforms](#transforms)
7. [Animation](#animation)
8. [Color & Palettes](#color--palettes)
9. [Renderers](#renderers)
10. [Importers](#importers)
11. [Utilities](#utilities)
12. [Types Reference](#types-reference)

---

## Package Entry Points

pixlrt ships three entry points. Use the one that fits your environment:

| Import        | Environment   | Description                                  |
| ------------- | ------------- | -------------------------------------------- |
| `pixlrt`      | Node.js       | Full API — core + file I/O + Node renderers  |
| `pixlrt/core` | Browser / any | Pure computation — no Node.js dependencies   |
| `pixlrt/node` | Node.js       | File I/O renderers only (toPNG, toGIF, etc.) |

```ts
// Node.js — use the main entry point
import { sprite, toPNG, toSVG } from 'pixlrt';

// Browser — use core (no fs, no pngjs)
import { sprite, toImageData, toCanvas } from 'pixlrt/core';

// Node-only renderers separately
import { toPNG, toGIF } from 'pixlrt/node';
```

The main `pixlrt` entry re-exports everything from `pixlrt/core` and `pixlrt/node`, with two exceptions: `toCanvas`, `renderToCanvas`, and `CanvasOptions` are only available from `pixlrt/core` (they require browser APIs).

---

## Creating Sprites

### sprite

> `pixlrt` `pixlrt/core`

```ts
function sprite(config: SpriteConfig): Sprite;
```

Create a `Sprite` from ASCII grid frames. Each character in the grid maps to a color via the palette.

| Param  | Type           | Description                      |
| ------ | -------------- | -------------------------------- |
| config | `SpriteConfig` | Sprite configuration (see below) |

#### SpriteConfig

| Field         | Type                 | Default          | Description                                  |
| ------------- | -------------------- | ---------------- | -------------------------------------------- |
| palette       | `PaletteMap`         | —                | Single-character key to color mapping        |
| frames        | `string[]`           | —                | ASCII grid strings (one per animation frame) |
| name          | `string`             | `'untitled'`     | Sprite name (used in atlas exports)          |
| origin        | `{ x, y }`           | `{ x: 0, y: 0 }` | Origin point for positioning                 |
| frameDuration | `number \| number[]` | `100`            | Per-frame duration in milliseconds           |

```ts
import { sprite } from 'pixlrt';

const coin = sprite({
  name: 'coin',
  palette: { '.': 'transparent', y: '#f0c040', o: '#c08020' },
  frames: [
    `
    .yy.
    yoyy
    yoyy
    .yy.
    `,
    `
    .oo.
    oyoo
    oyoo
    .oo.
    `,
  ],
  frameDuration: 200,
});
```

### Sprite class

> `pixlrt` `pixlrt/core`

`Sprite` is an immutable collection of `Frame` objects with shared palette and metadata. Implements `Renderable` (proxies to frame 0). All transform methods return new `Sprite` instances.

#### Properties

| Property      | Type         | Description                              |
| ------------- | ------------ | ---------------------------------------- |
| name          | `string`     | Sprite name                              |
| width         | `number`     | Frame width in pixels                    |
| height        | `number`     | Frame height in pixels                   |
| frames        | `Frame[]`    | Array of animation frames                |
| palette       | `PaletteMap` | Color palette used to create this sprite |
| origin        | `{ x, y }`   | Origin point                             |
| frameDuration | `number[]`   | Per-frame durations in ms                |

#### Methods

##### getPixel

```ts
getPixel(x: number, y: number): RGBA
```

Get pixel color at (x, y) from frame 0. Returns transparent `[0,0,0,0]` for out-of-bounds coordinates.

##### frame

```ts
frame(index?: number): Frame
```

Get a specific frame. Defaults to frame 0. Throws if index is out of range.

##### frameAt

```ts
frameAt(timeMs: number, mode?: AnimationMode): Frame
```

Get the frame visible at a given time in milliseconds. Mode can be `'loop'` (default), `'pingpong'`, or `'once'`.

##### flipX

```ts
flipX(): Sprite
```

Flip all frames horizontally (mirror left-right).

##### flipY

```ts
flipY(): Sprite
```

Flip all frames vertically (mirror top-bottom).

##### rotate

```ts
rotate(degrees: 90 | 180 | 270): Sprite
```

Rotate all frames clockwise by the given degrees.

##### scale

```ts
scale(factor: number): Sprite
```

Scale all frames by an integer factor using nearest-neighbor interpolation.

##### pad

```ts
pad(top: number, right: number, bottom: number, left: number, color?: ColorInput): Sprite
```

Pad all frames with extra pixels on each side. Color defaults to transparent.

##### crop

```ts
crop(x: number, y: number, w: number, h: number): Sprite
```

Crop a sub-region from all frames.

##### opacity

```ts
opacity(alpha: number): Sprite
```

Adjust opacity of all frames. Alpha must be 0–1.

##### outline

```ts
outline(color: ColorInput, thickness?: number): Sprite
```

Add an outline around non-transparent pixels. Thickness defaults to 1. Expands the frame by thickness on all sides.

##### silhouette

```ts
silhouette(color: ColorInput): Sprite
```

Replace all non-transparent pixels with a single color, preserving alpha.

##### shiftRows

```ts
shiftRows(opts: { from: number; to: number; dx: number }): Sprite
```

Shift a range of rows laterally by `dx` pixels. Exposed pixels become transparent.

##### patchRows

```ts
patchRows(patches: Record<number, string>, frameIndex?: number): Sprite
```

Replace specific rows by index using palette character strings. `frameIndex` defaults to 0.

```ts
const patched = hero.patchRows({ 3: 'xrrx', 4: 'xrrx' });
```

##### recolor

```ts
recolor(mapping: Record<string, ColorInput>): Sprite
```

Create a palette-swapped copy. Keys are palette characters, values are new colors.

```ts
const alt = hero.recolor({ b: '#e03030' }); // blue armor → red
```

##### ninePatch

```ts
ninePatch(edges: NinePatchEdges, width: number, height: number): Sprite
```

Resize using nine-patch rules: corners stay fixed, edges tile, center tiles.

---

## Templates

### template

> `pixlrt` `pixlrt/core`

```ts
function template(config: SpriteTemplateConfig): SpriteTemplate;
```

Create a `SpriteTemplate` that defines grid structure with named slots instead of colors. Call `.fill()` to bind slot roles to colors and produce a Sprite.

| Param  | Type                   | Description                        |
| ------ | ---------------------- | ---------------------------------- |
| config | `SpriteTemplateConfig` | Template configuration (see below) |

#### SpriteTemplateConfig

| Field         | Type                 | Default          | Description                                                 |
| ------------- | -------------------- | ---------------- | ----------------------------------------------------------- |
| slots         | `SlotMap`            | —                | Single-character key to role name mapping                   |
| frames        | `string[]`           | —                | ASCII grid frames using slot keys and `'.'` for transparent |
| name          | `string`             | `'untitled'`     | Template name                                               |
| origin        | `{ x, y }`           | `{ x: 0, y: 0 }` | Origin point                                                |
| frameDuration | `number \| number[]` | `100`            | Per-frame durations in ms                                   |

```ts
import { template } from 'pixlrt';

const charTemplate = template({
  slots: { s: 'skin', h: 'hair', a: 'armor' },
  frames: [
    `
    .hh.
    hssh
    .aa.
    .aa.
  `,
  ],
});

const warrior = charTemplate.fill({
  skin: '#f4cca1',
  hair: '#1a1c2c',
  armor: '#3b5dc9',
});
```

### SpriteTemplate class

> `pixlrt` `pixlrt/core`

#### Properties

| Property | Type       | Description               |
| -------- | ---------- | ------------------------- |
| name     | `string`   | Template name             |
| slots    | `SlotMap`  | Character-to-role mapping |
| origin   | `{ x, y }` | Origin point              |
| width    | `number`   | Grid width in pixels      |
| height   | `number`   | Grid height in pixels     |

#### roles (getter)

```ts
get roles(): string[]
```

All role names defined in this template's slots.

#### fill

```ts
fill(mapping: SlotFill): Sprite
```

Fill all slots with colors to produce a Sprite. Every role must have a corresponding color. Throws if any role is missing.

| Param   | Type       | Description                                       |
| ------- | ---------- | ------------------------------------------------- |
| mapping | `SlotFill` | `Record<string, ColorInput>` — role name to color |

#### patchRows

```ts
patchRows(patches: Record<number, string>, frameIndex?: number): SpriteTemplate
```

Patch specific rows in a frame using slot keys. Returns a new `SpriteTemplate`.

#### animateSlots

```ts
animateSlots(options: AnimateSlotsOptions): Sprite
```

Generate a multi-frame Sprite by varying slot colors per keyframe.

| Param                 | Type                 | Description                                      |
| --------------------- | -------------------- | ------------------------------------------------ |
| options.keyframes     | `SlotFill[]`         | Per-keyframe slot color overrides                |
| options.base          | `SlotFill`           | Base fill for slots not overridden in a keyframe |
| options.frameDuration | `number \| number[]` | Optional per-frame duration in ms                |

```ts
const blinking = charTemplate.animateSlots({
  base: { skin: '#f4cca1', hair: '#1a1c2c', armor: '#3b5dc9' },
  keyframes: [
    {}, // normal
    { skin: '#e0b890' }, // blink
  ],
  frameDuration: [800, 100],
});
```

---

## Composition

### compose

> `pixlrt` `pixlrt/core`

```ts
function compose(options?: ComposeOptions): Composer;
```

Create a fluent composition builder for layering sprites onto a canvas.

| Param              | Type         | Description                                |
| ------------------ | ------------ | ------------------------------------------ |
| options.width      | `number`     | Canvas width (auto-calculated if omitted)  |
| options.height     | `number`     | Canvas height (auto-calculated if omitted) |
| options.background | `ColorInput` | Background fill color                      |

### Composer class

> `pixlrt` `pixlrt/core`

#### place

```ts
place(source: Renderable, pos: { x: number; y: number }): Composer
```

Place a renderable at the given position. Returns `this` for chaining.

#### background

```ts
background(color: ColorInput): Composer
```

Set the background color. Returns `this` for chaining.

#### render

```ts
render(): PixelCanvas
```

Render all placed items onto a new `PixelCanvas`.

```ts
import { sprite, compose, toPNG } from 'pixlrt';

const scene = compose({ width: 32, height: 32, background: '#87ceeb' })
  .place(hero, { x: 8, y: 16 })
  .place(coin, { x: 20, y: 10 })
  .render();

toPNG(scene, 'scene.png', { scale: 4 });
```

---

## Tilesets

### tileset

> `pixlrt` `pixlrt/core`

```ts
function tileset(config: TilesetConfig): Tileset;
```

Create a `Tileset` from named tile definitions sharing a palette and uniform tile size.

| Param           | Type                     | Description                             |
| --------------- | ------------------------ | --------------------------------------- |
| config.tileSize | `number`                 | Width and height of each tile in pixels |
| config.palette  | `PaletteMap`             | Shared color palette                    |
| config.tiles    | `Record<string, string>` | Tile name to ASCII grid mapping         |

### Tileset class

> `pixlrt` `pixlrt/core`

Implements `Renderable` (renders the full tileset sheet layout).

#### Properties

| Property  | Type         | Description                 |
| --------- | ------------ | --------------------------- |
| tileSize  | `number`     | Tile width/height in pixels |
| palette   | `PaletteMap` | Shared palette              |
| tileNames | `string[]`   | Ordered list of tile names  |
| width     | `number`     | Full tileset sheet width    |
| height    | `number`     | Full tileset sheet height   |

#### tile

```ts
tile(name: string): Sprite
```

Get a single tile as a `Sprite`. Throws if name is unknown.

#### tileIndex

```ts
tileIndex(cell: string): number
```

Get the 0-based index for a tile by name or numeric string. Throws if unknown.

#### scene

```ts
scene(layout: string, options?: SceneOptions): PixelCanvas
scene(options: SceneOptions & { layers: LayerConfig[] }): PixelCanvas
```

Build a scene from a text layout of tile names. Supports single-layout or multi-layer scenes.

| Param              | Type            | Description                               |
| ------------------ | --------------- | ----------------------------------------- |
| layout             | `string`        | Text grid of tile names (space-separated) |
| options.background | `ColorInput`    | Background fill color                     |
| options.scale      | `number`        | Integer upscale factor                    |
| options.layers     | `LayerConfig[]` | Multiple layout layers (bottom to top)    |

```ts
import { tileset, toPNG } from 'pixlrt';

const tiles = tileset({
  tileSize: 8,
  palette: { '.': 'transparent', g: '#2d5a27', w: '#4488cc' },
  tiles: {
    grass: `
      gggggggg
      gggggggg
      gggggggg
      gggggggg
      gggggggg
      gggggggg
      gggggggg
      gggggggg
    `,
    water: `
      wwwwwwww
      wwwwwwww
      wwwwwwww
      wwwwwwww
      wwwwwwww
      wwwwwwww
      wwwwwwww
      wwwwwwww
    `,
  },
});

const map = tiles.scene(
  `
  grass grass grass
  grass water grass
  grass grass grass
`,
  { scale: 4 },
);

toPNG(map, 'map.png');
```

---

## Transforms

Frame-level transform functions. These operate on `Frame` objects directly. For sprite-level transforms, use the corresponding `Sprite` methods.

### flipX

> `pixlrt` `pixlrt/core`

```ts
function flipX(frame: Frame): Frame;
```

Flip a frame horizontally (mirror left-right).

### flipY

> `pixlrt` `pixlrt/core`

```ts
function flipY(frame: Frame): Frame;
```

Flip a frame vertically (mirror top-bottom).

### rotate

> `pixlrt` `pixlrt/core`

```ts
function rotate(frame: Frame, degrees: 90 | 180 | 270): Frame;
```

Rotate a frame clockwise by the given degrees.

### rotate90 / rotate180 / rotate270

> `pixlrt` `pixlrt/core`

```ts
function rotate90(frame: Frame): Frame;
function rotate180(frame: Frame): Frame;
function rotate270(frame: Frame): Frame;
```

Rotate a frame by a specific angle. `rotate90` and `rotate270` swap width and height.

### scale

> `pixlrt` `pixlrt/core`

```ts
function scale(frame: Frame, factor: number): Frame;
```

Scale a frame by an integer factor using nearest-neighbor interpolation. Throws if factor is not a positive integer.

### pad

> `pixlrt` `pixlrt/core`

```ts
function pad(
  frame: Frame,
  top: number,
  right: number,
  bottom: number,
  left: number,
  color?: RGBA,
): Frame;
```

Pad a frame with extra pixels on each side. Color defaults to transparent `[0,0,0,0]`. Throws if padding values are not non-negative integers.

### crop

> `pixlrt` `pixlrt/core`

```ts
function crop(frame: Frame, x: number, y: number, w: number, h: number): Frame;
```

Crop a sub-region from a frame. Throws if the region extends beyond frame bounds or dimensions are not positive.

### opacity

> `pixlrt` `pixlrt/core`

```ts
function opacity(frame: Frame, alpha: number): Frame;
```

Adjust the opacity of all pixels by multiplying their alpha channel. Alpha must be 0–1.

### outline

> `pixlrt` `pixlrt/core`

```ts
function outline(frame: Frame, color: RGBA, thickness?: number): Frame;
```

Add an outline around non-transparent pixels using Chebyshev distance. Expands the frame by `thickness` on all sides. Thickness defaults to 1.

### silhouette

> `pixlrt` `pixlrt/core`

```ts
function silhouette(frame: Frame, color: RGBA): Frame;
```

Replace all non-transparent pixels with a single color, preserving alpha values.

### shiftRows

> `pixlrt` `pixlrt/core`

```ts
function shiftRows(frame: Frame, opts: { from: number; to: number; dx: number }): Frame;
```

Shift a range of rows laterally by `dx` pixels. Exposed pixels become transparent. Throws if parameters are not integers or row range is invalid.

| Param     | Type     | Description                                          |
| --------- | -------- | ---------------------------------------------------- |
| opts.from | `number` | Start row (inclusive)                                |
| opts.to   | `number` | End row (inclusive)                                  |
| opts.dx   | `number` | Horizontal shift (positive = right, negative = left) |

---

## Animation

Standalone functions for manipulating sprite frame sequences. All return new `Sprite` instances.

### reverseFrames

> `pixlrt` `pixlrt/core`

```ts
function reverseFrames(sprite: Sprite): Sprite;
```

Reverse the frame order. Single-frame sprites return a clone.

### pingPong

> `pixlrt` `pixlrt/core`

```ts
function pingPong(sprite: Sprite): Sprite;
```

Produce a ping-pong sequence: frames play forward then backward (without repeating endpoints). For 2 or fewer frames, returns a clone.

### pickFrames

> `pixlrt` `pixlrt/core`

```ts
function pickFrames(sprite: Sprite, indices: number[]): Sprite;
```

Select frames by index array. Supports reordering and duplicates. Throws on empty array or out-of-range index.

### setDuration

> `pixlrt` `pixlrt/core`

```ts
function setDuration(sprite: Sprite, duration: number | number[]): Sprite;
```

Set frame durations. A single number applies to all frames. An array must match the frame count.

---

## Color & Palettes

### parseColor

> `pixlrt` `pixlrt/core`

```ts
function parseColor(input: ColorInput): RGBA;
```

Parse a color input into an RGBA tuple.

Supported formats:

- Hex: `'#rgb'`, `'#rrggbb'`, `'#rrggbbaa'`
- Named: `'transparent'`, `'black'`, `'white'`, `'red'`, `'green'`, `'blue'`, `'yellow'`, `'cyan'`, `'magenta'`, `'orange'`, `'purple'`, `'pink'`, `'brown'`, `'gray'`/`'grey'`, `'lime'`, `'navy'`, `'teal'`, `'maroon'`, `'olive'`, `'silver'`
- RGBA tuple: `[r, g, b, a]` (passed through)

### toHex

> `pixlrt` `pixlrt/core`

```ts
function toHex(color: ColorInput): string;
```

Convert a color to hex string. Returns `'#rrggbb'` or `'#rrggbbaa'` if alpha < 255.

### mix

> `pixlrt` `pixlrt/core`

```ts
function mix(a: ColorInput, b: ColorInput, ratio?: number): RGBA;
```

Mix two colors together. Ratio defaults to 0.5 (equal blend). Ratio of 0 returns `a`, ratio of 1 returns `b`.

### lighten

> `pixlrt` `pixlrt/core`

```ts
function lighten(color: ColorInput, amount: number): RGBA;
```

Lighten a color by an amount (0–1).

### darken

> `pixlrt` `pixlrt/core`

```ts
function darken(color: ColorInput, amount: number): RGBA;
```

Darken a color by an amount (0–1).

### lerp

> `pixlrt` `pixlrt/core`

```ts
function lerp(a: ColorInput, b: ColorInput, t: number): RGBA;
```

Linearly interpolate between two colors. `t=0` returns `a`, `t=1` returns `b`.

### saturate

> `pixlrt` `pixlrt/core`

```ts
function saturate(color: ColorInput, amount: number): RGBA;
```

Increase saturation by amount (0–1). Amount of 1 fully saturates.

### desaturate

> `pixlrt` `pixlrt/core`

```ts
function desaturate(color: ColorInput, amount: number): RGBA;
```

Decrease saturation by amount (0–1). Amount of 1 fully desaturates (grayscale).

### PALETTES

> `pixlrt` `pixlrt/core`

```ts
const PALETTES: Record<string, RGBA[]>;
```

All built-in palettes as RGBA arrays.

| Name          | Colors | Description                 |
| ------------- | ------ | --------------------------- |
| `pico8`       | 16     | PICO-8 fantasy console      |
| `gameboy`     | 4      | Classic Game Boy greens     |
| `sweetie16`   | 16     | Sweetie-16 palette          |
| `cga`         | 4      | CGA mode 4                  |
| `c64`         | 16     | Commodore 64 VIC-II         |
| `zxspectrum`  | 15     | ZX Spectrum normal + bright |
| `nes`         | 55     | NES PPU standard            |
| `endesga32`   | 32     | Endesga 32 pixel art        |
| `apollo`      | 16     | Apollo by AdamCYounis       |
| `resurrect64` | 64     | Resurrect 64 by Kerrie Lake |

### paletteFrom

> `pixlrt` `pixlrt/core`

```ts
function paletteFrom(name: string): PaletteMap;
```

Create a `PaletteMap` from a built-in palette name. Maps `'.'` to transparent, then assigns `'0'`–`'9'`, `'a'`–`'f'` for palettes with 16 or fewer colors, or `'0'`–`'9'`, `'a'`–`'z'` for larger palettes (up to 36).

### paletteFromHex

> `pixlrt` `pixlrt/core`

```ts
function paletteFromHex(hexColors: string[]): PaletteMap;
```

Create a `PaletteMap` from an array of hex color strings. Auto-assigns keys like `paletteFrom`. Throws if more than 36 colors.

### paletteSchema

> `pixlrt` `pixlrt/core`

```ts
function paletteSchema<R extends string>(roles: readonly R[]): PaletteSchema<R>;
```

Create a `PaletteSchema` that validates all named roles are present when creating palettes. Useful for ensuring consistent color sets across related sprites.

```ts
import { paletteSchema } from 'pixlrt';

const charColors = paletteSchema(['skin', 'hair', 'armor', 'boots'] as const);

// Validated — throws if any role is missing
const palette = charColors.create({
  skin: '#f4cca1',
  hair: '#1a1c2c',
  armor: '#3b5dc9',
  boots: '#5a3a28',
});
```

#### PaletteSchema

| Property/Method | Type                                    | Description                                                            |
| --------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| roles           | `readonly R[]`                          | The role names in this schema                                          |
| create(mapping) | `(Record<R, ColorInput>) => PaletteMap` | Create a validated PaletteMap. Throws if any role is missing or extra. |

### paletteFromFile

> `pixlrt` `pixlrt/node`

```ts
function paletteFromFile(filePath: string): PaletteMap;
```

Parse a palette file into a `PaletteMap`. Supports `.hex` (one hex color per line) and `.gpl` (GIMP Palette format). Throws on unsupported extension.

### paletteSwatch

> `pixlrt` `pixlrt/core`

```ts
function paletteSwatch(palette: PaletteMap, opts?: PaletteSwatchOptions): Renderable;
```

Create a `Renderable` showing each non-transparent palette color as a swatch grid.

| Param        | Type     | Default | Description                                |
| ------------ | -------- | ------- | ------------------------------------------ |
| opts.scale   | `number` | `1`     | Pixels per swatch                          |
| opts.columns | `number` | auto    | Grid width (defaults to square-ish layout) |

---

## Renderers

### Image Renderers

#### toPNG

> `pixlrt` `pixlrt/node`

```ts
function toPNG(source: Renderable, path: string, opts?: PNGOptions): Buffer;
function toPNG(source: Renderable, opts?: PNGOptions): Buffer;
```

Render to PNG. When a path is given, writes the file and returns the Buffer. Without a path, returns the Buffer only.

| Param      | Type     | Default | Description            |
| ---------- | -------- | ------- | ---------------------- |
| opts.scale | `number` | `1`     | Integer upscale factor |

#### toSVG

> `pixlrt` `pixlrt/node` `pixlrt/core`

```ts
// pixlrt / pixlrt/node — with file write support
function toSVG(source: Renderable, path: string, opts?: SVGOptions): string;
function toSVG(source: Renderable, opts?: SVGOptions): string;

// pixlrt/core — string output only
function toSVG(source: Renderable, opts?: SVGOptions): string;
```

Render to SVG string using run-length encoding for compact output. The Node version can write to a file when a path is given.

| Param      | Type     | Default | Description            |
| ---------- | -------- | ------- | ---------------------- |
| opts.scale | `number` | `1`     | Integer upscale factor |

#### toDataURL

> `pixlrt` `pixlrt/core`

```ts
function toDataURL(source: Renderable, opts?: SVGOptions): string;
```

Render to a base64-encoded SVG data URL. Returns `'data:image/svg+xml;base64,...'`.

| Param      | Type     | Default | Description            |
| ---------- | -------- | ------- | ---------------------- |
| opts.scale | `number` | `1`     | Integer upscale factor |

#### toImageData

> `pixlrt` `pixlrt/core`

```ts
function toImageData(source: Renderable, opts?: { scale?: number }): ImageDataResult;
```

Render to a raw RGBA pixel buffer compatible with the browser `ImageData` API.

| Param      | Type     | Default | Description            |
| ---------- | -------- | ------- | ---------------------- |
| opts.scale | `number` | `1`     | Integer upscale factor |

Returns `{ width, height, data: Uint8ClampedArray }`.

#### toArrayBuffer

> `pixlrt` `pixlrt/core`

```ts
function toArrayBuffer(source: Renderable, opts?: { scale?: number }): ArrayBuffer;
```

Render to an `ArrayBuffer` of raw RGBA pixel data.

| Param      | Type     | Default | Description            |
| ---------- | -------- | ------- | ---------------------- |
| opts.scale | `number` | `1`     | Integer upscale factor |

### Browser Renderers

#### toCanvas

> `pixlrt/core`

```ts
function toCanvas(source: Renderable, opts?: CanvasOptions): OffscreenCanvas;
```

Render to a new `OffscreenCanvas`. Browser-only — requires `OffscreenCanvas` and `ImageData` globals.

| Param      | Type     | Default | Description            |
| ---------- | -------- | ------- | ---------------------- |
| opts.scale | `number` | `1`     | Integer upscale factor |

#### renderToCanvas

> `pixlrt/core`

```ts
function renderToCanvas(
  source: Renderable,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  opts?: CanvasOptions,
): void;
```

Render onto an existing canvas element or `OffscreenCanvas`. Resizes the canvas to fit the rendered output.

| Param      | Type                                   | Description                        |
| ---------- | -------------------------------------- | ---------------------------------- |
| source     | `Renderable`                           | Source to render                   |
| canvas     | `HTMLCanvasElement \| OffscreenCanvas` | Target canvas                      |
| opts.scale | `number`                               | Integer upscale factor (default 1) |

### Animated Renderers

#### toGIF

> `pixlrt` `pixlrt/node`

```ts
function toGIF(source: Sprite, path: string, opts?: GIFOptions): Buffer;
function toGIF(source: Sprite, opts?: GIFOptions): Buffer;
```

Render a multi-frame Sprite to GIF89a format. Supports up to 256 colors — use `quantize()` first if needed.

| Param      | Type     | Default | Description               |
| ---------- | -------- | ------- | ------------------------- |
| opts.scale | `number` | `1`     | Integer upscale factor    |
| opts.loop  | `number` | `0`     | Loop count (0 = infinite) |

#### toAPNG

> `pixlrt` `pixlrt/node`

```ts
function toAPNG(source: Sprite, path: string, opts?: APNGOptions): Buffer;
function toAPNG(source: Sprite, opts?: APNGOptions): Buffer;
```

Render a multi-frame Sprite to Animated PNG format.

| Param      | Type     | Default | Description               |
| ---------- | -------- | ------- | ------------------------- |
| opts.scale | `number` | `1`     | Integer upscale factor    |
| opts.loop  | `number` | `0`     | Loop count (0 = infinite) |

### Sprite Sheet Renderers

#### toSpriteSheet

> `pixlrt` `pixlrt/node`

```ts
function toSpriteSheet(
  source: Sprite,
  path?: string,
  opts?: SpriteSheetOptions,
): { buffer: Buffer; metadata: SpriteSheetMeta };
function toSpriteSheet(
  source: Sprite,
  opts?: SpriteSheetOptions,
): { buffer: Buffer; metadata: SpriteSheetMeta };
```

Render animation frames to a sprite sheet PNG with JSON metadata. When a path is given, writes both `.png` and `.json` files.

| Param        | Type     | Default         | Description                      |
| ------------ | -------- | --------------- | -------------------------------- |
| opts.columns | `number` | `ceil(sqrt(n))` | Number of columns in the sheet   |
| opts.padding | `number` | `0`             | Padding between frames in pixels |
| opts.scale   | `number` | `1`             | Integer upscale factor           |

#### toTaggedSpriteSheet

> `pixlrt` `pixlrt/node`

```ts
function toTaggedSpriteSheet(
  sprites: Record<string, Sprite>,
  path: string,
  opts?: TaggedSpriteSheetOptions,
): { buffer: Buffer; metadata: TaggedSpriteSheetMeta };
function toTaggedSpriteSheet(
  sprites: Record<string, Sprite>,
  opts?: TaggedSpriteSheetOptions,
): { buffer: Buffer; metadata: TaggedSpriteSheetMeta };
```

Render multiple named Sprites into a single tagged sprite sheet. All sprites must have the same width and height. Tags group frames by sprite name for animation playback.

| Param        | Type     | Default         | Description            |
| ------------ | -------- | --------------- | ---------------------- |
| opts.columns | `number` | `ceil(sqrt(n))` | Number of columns      |
| opts.padding | `number` | `0`             | Padding between frames |
| opts.scale   | `number` | `1`             | Integer upscale factor |

### Atlas Renderers

#### toAtlas

> `pixlrt` `pixlrt/node`

```ts
function toAtlas(
  sprites: (Sprite | AtlasEntry)[],
  path?: string,
  opts?: AtlasOptions,
): { buffer: Buffer; metadata: AtlasMeta };
function toAtlas(
  sprites: (Sprite | AtlasEntry)[],
  opts?: AtlasOptions,
): { buffer: Buffer; metadata: AtlasMeta };
```

Pack renderables into a texture atlas using shelf next-fit bin-packing. Accepts `Sprite` instances (uses `sprite.name`) or explicit `AtlasEntry` objects. When a path is given, writes both `.png` and `.json` files.

| Param          | Type      | Default | Description                      |
| -------------- | --------- | ------- | -------------------------------- |
| opts.padding   | `number`  | `1`     | Padding between entries          |
| opts.scale     | `number`  | `1`     | Integer upscale factor           |
| opts.maxWidth  | `number`  | `4096`  | Maximum atlas width              |
| opts.maxHeight | `number`  | `4096`  | Maximum atlas height             |
| opts.pot       | `boolean` | `false` | Round to power-of-two dimensions |

#### toAtlasPhaser

> `pixlrt` `pixlrt/node`

```ts
function toAtlasPhaser(
  metadata: AtlasMeta,
  path?: string,
  format?: 'hash' | 'array',
): PhaserHashOutput | PhaserArrayOutput;
```

Convert `AtlasMeta` to Phaser/PixiJS JSON format. When a path is given, writes the JSON file.

| Param    | Type                | Default  | Description                   |
| -------- | ------------------- | -------- | ----------------------------- |
| metadata | `AtlasMeta`         | —        | Atlas metadata from `toAtlas` |
| path     | `string`            | —        | Optional output file path     |
| format   | `'hash' \| 'array'` | `'hash'` | Phaser JSON format            |

#### toAtlasUnity

> `pixlrt` `pixlrt/node`

```ts
function toAtlasUnity(metadata: AtlasMeta, path?: string): UnityOutput;
```

Convert `AtlasMeta` to TexturePacker-compatible Unity JSON format with pivot points and smartupdate hash.

#### toAtlasGodot

> `pixlrt` `pixlrt/node`

```ts
function toAtlasGodot(metadata: AtlasMeta, path?: string): string;
```

Convert `AtlasMeta` to Godot 4.x SpriteFrames `.tres` format. Groups frames by sprite name into animations. Returns the `.tres` content string.

### Game Engine Renderers

#### toTiled

> `pixlrt` `pixlrt/node`

```ts
function toTiled(
  tileset: Tileset,
  layout: string | string[],
  path: string,
  options?: TiledExportOptions,
): TiledMap;
function toTiled(
  tileset: Tileset,
  layout: string | string[],
  options?: TiledExportOptions,
): TiledMap;
```

Export a tileset and layout(s) to a Tiled `.tmj` JSON structure. A single string layout produces one layer; a string array produces multiple layers.

| Param        | Type     | Default | Description                   |
| ------------ | -------- | ------- | ----------------------------- |
| options.name | `string` | `'map'` | Tileset name in the Tiled map |

#### toMultiScale

> `pixlrt` `pixlrt/node`

```ts
function toMultiScale(source: Renderable, path: string, opts?: MultiScaleOptions): MultiScaleResult;
function toMultiScale(source: Renderable, opts?: MultiScaleOptions): MultiScaleResult;
```

Render at multiple scale factors. Writes files with scale suffixes when a path is given.

| Param       | Type                        | Default               | Description              |
| ----------- | --------------------------- | --------------------- | ------------------------ |
| opts.scales | `number[]`                  | `[1, 2, 3]`           | Scale factors to render  |
| opts.suffix | `(scale: number) => string` | `` (s) => `@${s}x` `` | Filename suffix function |

Returns `{ scales: Array<{ scale, path, buffer }> }`.

#### toCollisionMask

> `pixlrt` `pixlrt/core`

```ts
function toCollisionMask(source: Renderable, opts?: CollisionMaskOptions): CollisionMaskResult;
```

Generate a 1-bit alpha collision mask from a Renderable.

| Param          | Type     | Default | Description                          |
| -------------- | -------- | ------- | ------------------------------------ |
| opts.threshold | `number` | `1`     | Minimum alpha to be considered solid |

Returns `{ width, height, data: boolean[][], packed: Uint8Array }`. The `packed` field is 1-bit per pixel, row-major, MSB-first.

---

## Importers

### fromPNG

> `pixlrt` `pixlrt/node`

```ts
function fromPNG(input: Buffer | string): Sprite;
```

Import a PNG as a single-frame Sprite. Accepts a `Buffer` containing PNG data or a file path string.

### fromSpriteSheet

> `pixlrt` `pixlrt/node`

```ts
function fromSpriteSheet(png: Buffer | string, meta: SpriteSheetMeta): Sprite;
```

Reconstruct a multi-frame Sprite from a sprite sheet PNG and its metadata. Inverse of `toSpriteSheet`.

| Param | Type               | Description                   |
| ----- | ------------------ | ----------------------------- |
| png   | `Buffer \| string` | PNG buffer or file path       |
| meta  | `SpriteSheetMeta`  | Metadata from `toSpriteSheet` |

---

## Utilities

### quantize

> `pixlrt` `pixlrt/core`

```ts
function quantize(frame: Frame, palette: PaletteMap): Frame;
```

Map each pixel to the nearest palette color using Euclidean distance in RGBA space. Fully transparent pixels are preserved. Throws if palette contains no opaque colors.

### PixelCanvas

> `pixlrt` `pixlrt/core`

```ts
class PixelCanvas implements Renderable {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;

  constructor(width: number, height: number);

  getPixel(x: number, y: number): RGBA;
  setPixel(x: number, y: number, color: RGBA): void;
  fill(color: RGBA): void;
  drawFrame(frame: Frame, dx: number, dy: number): void;
  drawRenderable(source: Renderable, dx: number, dy: number): void;
}
```

Mutable pixel canvas backed by a flat `Uint8Array` RGBA buffer. Uses Porter-Duff source-over alpha compositing for `drawFrame` and `drawRenderable`.

### Frame

> `pixlrt` `pixlrt/core`

```ts
class Frame implements Renderable {
  readonly width: number;
  readonly height: number;
  readonly pixels: PixelGrid;

  constructor(pixels: PixelGrid);

  getPixel(x: number, y: number): RGBA;
}
```

Immutable frame of pixel data. Returns transparent `[0,0,0,0]` for out-of-bounds coordinates.

### parseGrid

> `pixlrt` `pixlrt/core`

```ts
function parseGrid(ascii: string, palette: PaletteMap): PixelGrid;
```

Parse an ASCII grid string into a 2D RGBA pixel grid. Handles leading/trailing whitespace, tab expansion, and transparent padding. Error messages include row/col positions.

### parseFrames

> `pixlrt` `pixlrt/core`

```ts
function parseFrames(frames: string[], palette: PaletteMap): PixelGrid[];
```

Parse multiple ASCII grid strings, validating that all frames have the same dimensions.

### ninePatchMeta

> `pixlrt` `pixlrt/core`

```ts
function ninePatchMeta(frame: Frame, edges: NinePatchEdges): NinePatchMeta;
```

Compute the 9 region rectangles for a nine-patch source frame. Throws if edges exceed frame dimensions.

### ninePatchResize

> `pixlrt` `pixlrt/core`

```ts
function ninePatchResize(frame: Frame, edges: NinePatchEdges, width: number, height: number): Frame;
```

Resize a frame using nine-patch rules: corners stay fixed, edges tile, center tiles. Throws if target dimensions are smaller than edge sums.

---

## Types Reference

All types are exported from `pixlrt` and `pixlrt/core` unless noted otherwise.

### Core Types

| Type            | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `RGBA`          | `[number, number, number, number]` — color tuple, each 0–255 |
| `ColorInput`    | `string \| RGBA` — hex, named color, or RGBA tuple           |
| `PaletteMap`    | `Record<string, ColorInput>` — char key to color mapping     |
| `PixelGrid`     | `readonly (readonly RGBA[])[]` — 2D pixel array (row-major)  |
| `AnimationMode` | `'loop' \| 'pingpong' \| 'once'`                             |
| `Renderable`    | `{ width, height, getPixel(x, y) }` — core render interface  |

### Config Types

| Type                   | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `SpriteConfig`         | Configuration for `sprite()` factory              |
| `TilesetConfig`        | Configuration for `tileset()` factory             |
| `ComposeOptions`       | Options for `compose()` factory                   |
| `SpriteTemplateConfig` | Configuration for `template()` factory            |
| `SlotMap`              | `Record<string, string>` — char key to role name  |
| `SlotFill`             | `Record<string, ColorInput>` — role name to color |
| `AnimateSlotsOptions`  | Options for `SpriteTemplate.animateSlots()`       |
| `PaletteSchema<R>`     | Validated palette with named roles                |

### Render Options

| Type                       | Description                                         |
| -------------------------- | --------------------------------------------------- |
| `PNGOptions`               | `{ scale? }`                                        |
| `SVGOptions`               | `{ scale? }`                                        |
| `GIFOptions`               | `{ scale?, loop? }`                                 |
| `APNGOptions`              | `{ scale?, loop? }`                                 |
| `SpriteSheetOptions`       | `{ columns?, padding?, scale? }`                    |
| `TaggedSpriteSheetOptions` | `{ columns?, padding?, scale? }`                    |
| `AtlasOptions`             | `{ padding?, scale?, maxWidth?, maxHeight?, pot? }` |
| `MultiScaleOptions`        | `{ scales?, suffix? }`                              |
| `CollisionMaskOptions`     | `{ threshold? }`                                    |
| `CanvasOptions`            | `{ scale? }` — `pixlrt/core` only                   |
| `PaletteSwatchOptions`     | `{ scale?, columns? }` — `pixlrt/core` only         |

### Metadata Types

| Type                    | Description                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| `SpriteSheetMeta`       | Sprite sheet metadata (frames, dimensions)                          |
| `TaggedSpriteSheetMeta` | Tagged sprite sheet metadata (frames + animation tags)              |
| `AnimationTag`          | `{ name, from, to, direction }` — animation range in a sheet        |
| `AtlasEntry`            | `{ name, source }` — named renderable for atlas packing             |
| `AtlasFrame`            | `{ name, x, y, w, h, sourceW, sourceH }` — frame placement in atlas |
| `AtlasMeta`             | `{ image, width, height, scale, frames }` — atlas metadata          |
| `MultiScaleResult`      | `{ scales: Array<{ scale, path, buffer }> }` — `pixlrt/node` only   |
| `CollisionMaskResult`   | `{ width, height, data, packed }`                                   |
| `ImageDataResult`       | `{ width, height, data: Uint8ClampedArray }`                        |

### Scene & Layout Types

| Type           | Description                                        |
| -------------- | -------------------------------------------------- |
| `SceneOptions` | `{ background?, scale?, layers? }`                 |
| `LayerConfig`  | `{ layout }` — single layer in a multi-layer scene |

### Nine-Patch Types

| Type             | Description                                 |
| ---------------- | ------------------------------------------- |
| `NinePatchEdges` | `{ top, right, bottom, left }` — edge sizes |
| `NinePatchMeta`  | 9 region rects + source dimensions + edges  |
| `Rect`           | `{ x, y, w, h }` — region rectangle         |

### Tiled Export Types

| Type                 | Description                           |
| -------------------- | ------------------------------------- |
| `TiledMap`           | Complete Tiled `.tmj` map structure   |
| `TiledTileLayer`     | Single tile layer in a Tiled map      |
| `TiledTilesetRef`    | Tileset reference in a Tiled map      |
| `TiledExportOptions` | `{ name? }` — tileset name in the map |

### Game Engine Types

| Type                | Description                                |
| ------------------- | ------------------------------------------ |
| `PhaserHashOutput`  | Phaser JSON hash format output             |
| `PhaserArrayOutput` | Phaser JSON array format output            |
| `UnityOutput`       | TexturePacker-compatible Unity JSON output |
