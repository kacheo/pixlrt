# pixlrt

Programmatic pixel art framework for TypeScript.

Define sprites as ASCII grids, apply transforms, and export to PNG, SVG, or sprite sheets.

## Features

- **ASCII grid sprites** — define pixel art with text using single-character palettes
- **Built-in palettes** — pico8, gameboy, sweetie16, cga
- **PNG & SVG export** — render at any integer scale
- **Sprite sheets** — combine animation frames with JSON metadata
- **Immutable transforms** — flipX, flipY, rotate, scale, recolor
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
    'x': '#1a1c2c',
    's': '#f4cca1',
    'b': '#3b5dc9',
  },
  frames: [`
    ..xx..
    .xssx.
    ..xx..
    .xbbx.
    .xbbx.
    .x..x.
  `],
});

toPNG(hero, 'hero.png', { scale: 8 });
```

## API Overview

### Factory Functions

| Function | Description |
|---|---|
| `sprite(config)` | Create a sprite from ASCII grid frames |
| `tileset(config)` | Create a tileset from named tile definitions |
| `compose()` | Create a composer for layering renderables |
| `paletteFrom(name)` | Get a palette map from a built-in palette name |

### Renderers

| Function | Description |
|---|---|
| `toPNG(renderable, path, opts?)` | Render to PNG file, returns Buffer |
| `toSVG(renderable, path, opts?)` | Render to SVG file, returns string |
| `toSpriteSheet(sprite, path, opts?)` | Render animation frames to sprite sheet + JSON metadata |

### Sprite Methods

All transforms return new `Sprite` instances (immutable).

| Method | Description |
|---|---|
| `.flipX()` | Flip horizontally |
| `.flipY()` | Flip vertically |
| `.rotate(degrees)` | Rotate 90, 180, or 270 degrees clockwise |
| `.scale(factor)` | Scale by integer factor |
| `.recolor(mapping)` | Palette swap using `{ key: newColor }` |
| `.frame(index)` | Get a specific frame |

### Color Utilities

`parseColor`, `lighten`, `darken`, `lerp` — for working with colors programmatically.

## Built-in Palettes

| Name | Colors | Description |
|---|---|---|
| `pico8` | 16 | PICO-8 fantasy console palette |
| `gameboy` | 4 | Classic Game Boy greens |
| `sweetie16` | 16 | Sweetie-16 palette |
| `cga` | 4 | CGA mode 4 palette |

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
