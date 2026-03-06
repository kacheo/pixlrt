# pixlrt

Pixel art as code. Define sprites as ASCII grids, transform them, and export to PNG, SVG, GIF, APNG, sprite sheets, and game engine formats.

No design tool required — just text and TypeScript.

## Install

```bash
npm install pixlrt
```

Requires Node.js ≥ 20.

## Quick Start

```ts
import { sprite, toPNG } from 'pixlrt';

const hero = sprite({
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

One character = one pixel. Each character maps to a color in the palette.

![hero sprite](examples/quickstart-hero.png)

## What it can do

- **Transforms** — `flipX`, `flipY`, `rotate`, `scale`, `recolor`, `pad`, `crop`, `opacity`, `outline`, `silhouette`
- **Animation** — multi-frame sprites, GIF/APNG export, sprite sheets with JSON metadata
- **Composition** — layer multiple sprites with `compose()`
- **Tilesets** — define tile libraries and compose scenes
- **Color tools** — `lighten`, `darken`, `mix`, `saturate`, `desaturate`, `toHex`, 24 built-in palettes
- **Game engine export** — Phaser, Unity, Godot 4, Tiled
- **Import** — load existing PNGs or sprite sheets back into the framework

→ Full API reference: **[API.md](./API.md)**

## Built-in Palettes

24 palettes including `pico8`, `gameboy`, `sweetie16`, `c64`, `zxspectrum`, `nes`, `apollo`, `nord`, `dracula`, and more.

```ts
import { sprite, paletteFrom, toPNG } from 'pixlrt';

const heart = sprite({
  palette: paletteFrom('pico8'),
  frames: [
    `
    .8.8.
    88888
    88888
    .888.
    ..8..
  `,
  ],
});

toPNG(heart, 'heart.png', { scale: 8 });
```

![pico8 heart](examples/pico8-heart.png)

→ Full palette list: **[API.md#built-in-palettes](./API.md#built-in-palettes)**

## Using with AI Agents

pixlrt works well with AI coding agents — sprites are plain text, so an agent can write them without any image model or design tool.

**One important caveat:** LLMs process text as tokens, which destroys 2D spatial relationships in grids. Research shows accuracy on grid-based spatial tasks drops 40–80% as grid size increases. Keep grids at **24×24 or smaller** when an AI is authoring them. For human-authored grids, there's no size limit.

### System prompt

Copy this into your agent's system prompt:

```text
You have access to the `pixlrt` TypeScript package for creating pixel art as code.

## How it works
Sprites are ASCII grids where each character maps to a color via a palette:

import { sprite, toPNG } from 'pixlrt';

const s = sprite({
  name: 'gem',
  palette: { '.': 'transparent', o: '#3b5dc9', w: '#f4f4f4', d: '#1a1c2c' },
  frames: [`
    ..ow..
    .owwo.
    owwwwo
    owwwwo
    .oddo.
    ..dd..
  `],
});
toPNG(s, 'gem.png', { scale: 8 });

## Rules
- One character = one pixel. Every row must be the same width.
- Keep grids at 24×24 pixels or smaller — LLM spatial accuracy degrades beyond this.
- Use '.' for transparent pixels by convention.
- Palette keys are single characters; values are hex colors or 'transparent'.

## Built-in palettes
Use `paletteFrom(name)` to get a pre-defined palette (keys '0'–'f' for ≤16 colors,
'0'–'9' then 'a'–'z' for >16 colors). Available palettes:
pico8 (16), gameboy (4), sweetie16 (16), cga (4), c64 (16), zxspectrum (15),
nes (55), endesga16 (16), endesga32 (32), apollo (16), resurrect64 (64),
dawnbringer16 (16), dawnbringer32 (32), bubblegum16 (16), oil6 (6), slso8 (8),
ammo8 (8), 1bit (2), nord (16), gruvbox (16), solarized (16), dracula (8),
virtualboy (4), msx (15)

## Transforms (all return new sprites)
.flipX() .flipY() .rotate(90|180|270) .scale(n) .recolor({key: color})
.outline(color) .pad(top, right, bottom, left) .crop(x, y, w, h) .opacity(0-1)
.silhouette(color) .ninePatch(edges, w, h) .shiftRows({from, to, dx})

## Composition
import { compose } from 'pixlrt';
const scene = compose().add(tree, 0, 0).add(hero, 10, 5).render(32, 24);
toPNG(scene, 'scene.png', { scale: 4 });

## Animation
Pass multiple template strings in the frames array. Export with:
toGIF(sprite, 'anim.gif', { scale: 4 })
toSpriteSheet(sprite, 'sheet.png', { scale: 4 })
```

### References on LLM spatial reasoning

- [Stuck in the Matrix: Probing Spatial Reasoning in LLMs](https://arxiv.org/abs/2510.20198) — tested LLMs on grids 2×2 to 300×300; ~43% average accuracy loss as size increases
- [Why LLMs Suck at ASCII Art](https://mailitics.com/index.php/2025/01/21/why-llms-suck-at-ascii-art-a9516cb880d5/) — how tokenization destroys spatial relationships
- [Draw me a swordsman: Can tool-calling LLMs draw pixel art?](https://ljvmiranda921.github.io/notebook/2025/07/20/draw-me-a-swordsman/) — practical experiments with LLM-generated pixel art
- [Can Multimodal LLMs Truly "See" Images?](https://blog.skypilot.co/can-multi-modal-llms-truely-see-images/) — ASCII art as a probe for LLM spatial understanding

## Playground

A local browser playground for experimenting with sprites and palettes in real time — live preview as you type, with built-in examples and a palette browser.

```bash
cd playground && npm install && npm run dev
```

## Examples

See [`examples/`](./examples) for working scripts — basic sprites, animation, tilesets, and game engine export.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Apache-2.0
