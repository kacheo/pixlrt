# pixlrt

Programmatic pixel art framework for TypeScript.

Define sprites as ASCII grids, apply transforms, and export to PNG, SVG, GIF, APNG, sprite sheets, texture atlases, and game engine formats.

## Features

- **ASCII grid sprites** — define pixel art with text using single-character palettes
- **Built-in palettes** — pico8, gameboy, sweetie16, cga, c64, zxspectrum, nes, endesga32, apollo, resurrect64
- **PNG & SVG export** — render at any integer scale
- **GIF & APNG animation export** — animated sprites with configurable frame timing
- **Sprite sheets** — combine animation frames with JSON metadata; tagged sprite sheets for animation grouping
- **Texture atlas packing** — shelf next-fit bin packing for multiple sprites
- **Game engine formats** — Phaser/PixiJS, Unity, Godot 4.x, Tiled
- **Immutable transforms** — flipX, flipY, rotate, scale, recolor, pad, crop, opacity, outline
- **Animation utilities** — frameAt, reverseFrames, pingPong, pickFrames, setDuration
- **Nine-patch resizing** — stretch sprites with defined edge/corner regions
- **Color quantization** — reduce color count for GIF export or stylistic effect
- **Collision mask generation** — binary masks from sprite alpha data
- **Multi-scale PNG export** — @1x, @2x, @3x in a single call
- **PNG & sprite sheet import** — load existing assets back into the framework
- **Tilesets** — define tile libraries and compose scenes
- **Composition** — layer multiple renderables with offsets

## Install

```
npm install pixlrt
```

## Quick Start

```ts
import { sprite, toPNG } from 'pixlrt';

const hero = sprite({
  name: 'hero',
  palette: {
    '.': 'transparent',
    x: '#1a1c2c',
    s: '#f4cca1',
    b: '#3b5dc9',
  },
  frames: [
    `
    ..xx..
    .xssx.
    ..xx..
    .xbbx.
    .xbbx.
    .x..x.
  `,
  ],
});

toPNG(hero, 'hero.png', { scale: 8 });
```

## API Reference

For complete API documentation with full type signatures, see **[API.md](./API.md)**.

## API Overview

### Factory Functions

| Function                | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `sprite(config)`        | Create a sprite from ASCII grid frames          |
| `tileset(config)`       | Create a tileset from named tile definitions    |
| `compose()`             | Create a composer for layering renderables      |
| `paletteFrom(name)`     | Get a palette map from a built-in palette name  |
| `paletteFromHex(map)`   | Create a palette map from hex color strings     |
| `paletteFromFile(path)` | Load a palette map from a `.hex` or `.gpl` file |

### Renderers

| Function                                   | Description                                              |
| ------------------------------------------ | -------------------------------------------------------- |
| `toPNG(renderable, path, opts?)`           | Render to PNG file                                       |
| `toSVG(renderable, path, opts?)`           | Render to SVG file                                       |
| `toSpriteSheet(sprite, path, opts?)`       | Render animation frames to sprite sheet + JSON metadata  |
| `toTaggedSpriteSheet(sprite, path, opts?)` | Sprite sheet with animation tag groups                   |
| `toGIF(sprite, path, opts?)`               | Export animated GIF                                      |
| `toAPNG(sprite, path, opts?)`              | Export animated PNG                                      |
| `toAtlas(entries, path, opts?)`            | Pack multiple sprites into a texture atlas               |
| `toAtlasPhaser(entries, path, opts?)`      | Texture atlas in Phaser/PixiJS JSON hash or array format |
| `toAtlasUnity(entries, path, opts?)`       | Texture atlas for Unity                                  |
| `toAtlasGodot(entries, path, opts?)`       | Texture atlas for Godot 4.x                              |
| `toTiled(tileset, grid, path, opts?)`      | Export a Tiled-compatible map                            |
| `toMultiScale(renderable, path, opts?)`    | Export PNG at multiple scales (@1x, @2x, @3x)            |
| `toCollisionMask(renderable, path, opts?)` | Generate a binary collision mask from alpha data         |

### Sprite Methods

All transforms return new `Sprite` instances (immutable).

| Method                                   | Description                                        |
| ---------------------------------------- | -------------------------------------------------- |
| `.flipX()`                               | Flip horizontally                                  |
| `.flipY()`                               | Flip vertically                                    |
| `.rotate(degrees)`                       | Rotate 90, 180, or 270 degrees clockwise           |
| `.scale(factor)`                         | Scale by integer factor                            |
| `.recolor(mapping)`                      | Palette swap using `{ key: newColor }`             |
| `.pad(top, right, bottom, left, color?)` | Add padding around the sprite                      |
| `.crop(x, y, w, h)`                      | Crop to a rectangular region                       |
| `.opacity(alpha)`                        | Adjust alpha (0–1)                                 |
| `.outline(color, thickness?)`            | Add an outline around opaque pixels                |
| `.ninePatch(edges, width, height)`       | Nine-patch resize with defined edge/corner regions |
| `.frame(index)`                          | Get a specific frame                               |
| `.frameAt(timeMs, mode?)`                | Get a frame at a given time (loop or clamp)        |

### Animation Utilities

Standalone functions for manipulating sprite frame sequences.

| Function                         | Description                                 |
| -------------------------------- | ------------------------------------------- |
| `reverseFrames(sprite)`          | Reverse the order of animation frames       |
| `pingPong(sprite)`               | Append reversed frames for a ping-pong loop |
| `pickFrames(sprite, indices)`    | Select specific frames by index             |
| `setDuration(sprite, durations)` | Set per-frame durations in milliseconds     |

### Import Functions

| Function                      | Description                                   |
| ----------------------------- | --------------------------------------------- |
| `fromPNG(path)`               | Load a PNG file as a Sprite                   |
| `fromSpriteSheet(path, meta)` | Import a sprite sheet using its JSON metadata |

### Color Utilities

| Function                    | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| `parseColor(input)`         | Parse a hex string or named color to RGBA             |
| `toHex(color)`              | Convert RGBA to hex string (`#rrggbb` or `#rrggbbaa`) |
| `lighten(color, amount)`    | Lighten a color by a factor (0–1)                     |
| `darken(color, amount)`     | Darken a color by a factor (0–1)                      |
| `lerp(a, b, t)`             | Linear interpolation between two colors               |
| `mix(a, b, ratio?)`         | Mix two colors (defaults to equal 50/50 blend)        |
| `saturate(color, amount)`   | Increase saturation by amount (0–1)                   |
| `desaturate(color, amount)` | Decrease saturation by amount (0–1)                   |

### Quantization

```ts
import { quantize } from 'pixlrt';

const reduced = quantize(spriteOrFrame, maxColors);
```

`quantize()` reduces the number of distinct colors in a renderable. Useful before GIF export (which is limited to 256 colors) or for a deliberate low-color aesthetic.

### Palette Preview

| Function                        | Description                                               |
| ------------------------------- | --------------------------------------------------------- |
| `paletteSwatch(palette, opts?)` | Create a Renderable grid of color swatches from a palette |

```ts
import { paletteFrom, paletteSwatch, toPNG } from 'pixlrt';

const swatch = paletteSwatch(paletteFrom('pico8'), { scale: 16, columns: 8 });
toPNG(swatch, 'pico8-preview.png');
```

Options: `scale` (pixels per swatch, default 1), `columns` (grid width, default auto square-ish layout).

## Built-in Palettes

| Name          | Colors | Description                         |
| ------------- | ------ | ----------------------------------- |
| `pico8`       | 16     | PICO-8 fantasy console palette      |
| `gameboy`     | 4      | Classic Game Boy greens             |
| `sweetie16`   | 16     | Sweetie-16 palette                  |
| `cga`         | 4      | CGA mode 4 palette                  |
| `c64`         | 16     | Commodore 64 VIC-II chip palette    |
| `zxspectrum`  | 15     | ZX Spectrum normal + bright colors  |
| `nes`         | 55     | NES PPU standard palette            |
| `endesga32`   | 32     | Endesga 32 pixel art palette        |
| `apollo`      | 16     | Apollo palette by AdamCYounis       |
| `resurrect64` | 64     | Resurrect 64 palette by Kerrie Lake |

Palettes with ≤16 colors map to keys `0`–`f`. Palettes with >16 colors use extended keys `0`–`9`, `a`–`z` (up to 36 mappable characters).

```ts
import { paletteFrom } from 'pixlrt';
const palette = paletteFrom('pico8');
```

## Examples

See the [`examples/`](./examples) directory:

- **basic-sprite.ts** — create a character sprite, export PNG/SVG, apply transforms
- **animation.ts** — multi-frame sprite with sprite sheet export
- **tileset.ts** — define tiles and compose a scene
- **gameboy-sprites.ts** — Game Boy–style sprites using the gameboy palette

## License

MIT
