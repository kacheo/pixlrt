# Examples

Working scripts demonstrating pixlrt features. Each script runs against the local source and writes output files to this directory.

## Running an example

```bash
npm run build
npx tsx examples/basic-sprite.ts
```

---

## basic-sprite.ts

A 10×8 character sprite using a custom 5-color palette. Demonstrates PNG/SVG export and transforms (flip, scale).

| Output                            | File                            |
| --------------------------------- | ------------------------------- |
| ![hero](hero.png)                 | `hero.png`                      |
| ![hero flipped](hero-flipped.png) | `hero-flipped.png` — `.flipX()` |
| ![hero 2x](hero-2x.png)           | `hero-2x.png` — `.scale(2)`     |

---

## gameboy-sprites.ts

RPG sprites and a tileset scene using the built-in `gameboy` palette (4 shades of green).

| Output                                           | File                                                      |
| ------------------------------------------------ | --------------------------------------------------------- |
| ![adventurer](gb-adventurer.png)                 | `gb-adventurer.png` — front-facing hero (16×16)           |
| ![adventurer flipped](gb-adventurer-flipped.png) | `gb-adventurer-flipped.png` — `.flipX()`                  |
| ![creature](gb-creature.png)                     | `gb-creature.png` — round collectible monster (16×16)     |
| ![creature variant](gb-creature-variant.png)     | `gb-creature-variant.png` — `.recolor()` ice variant      |
| ![puffball](gb-puffball.png)                     | `gb-puffball.png` — platformer character (16×16)          |
| ![puffball sheet](gb-puffball-sheet.png)         | `gb-puffball-sheet.png` — 2-frame walk cycle sprite sheet |
| ![overworld](gb-overworld.png)                   | `gb-overworld.png` — composed tile scene                  |
| ![tileset](gb-tileset.png)                       | `gb-tileset.png` — full tileset sheet                     |

---

## animation.ts

A 5×6 walking character with 4-frame animation cycle exported as a sprite sheet.

| Output                        | File                                  |
| ----------------------------- | ------------------------------------- |
| ![walk sheet](walk-sheet.png) | `walk-sheet.png` — 4-frame walk cycle |

---

## tileset.ts

A 3-tile tileset (grass, water, stone) composed into a small scene with a sky-blue background.

| Output                  | File                               |
| ----------------------- | ---------------------------------- |
| ![tileset](tileset.png) | `tileset.png` — tile library sheet |
| ![scene](scene.png)     | `scene.png` — composed scene       |

---

## game-sprites.ts

Demonstrates advanced features: `paletteSchema` for validated color sets, `template` for reusable sprite grids with named slots, `animateSlots` for keyframe animation, `shiftRows` for lean effects, and `silhouette` for white masks.

| Output                          | File                                      |
| ------------------------------- | ----------------------------------------- |
| ![boss1](boss1.png)             | `boss1.png` — red boss variant            |
| ![boss2](boss2.png)             | `boss2.png` — blue boss variant           |
| ![bullet mask](bullet-mask.png) | `bullet-mask.png` — white silhouette mask |
