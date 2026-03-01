/**
 * Game Boy Reference Sprites
 *
 * Demonstrates pixlrt's Game Boy palette with original retro-inspired pixel art.
 * All sprites use `paletteFrom('gameboy')` which maps:
 *   0 → #0f380f (darkest)
 *   1 → #306230 (dark)
 *   2 → #8bac0f (light)
 *   3 → #9bbc0f (lightest)
 *   . → transparent
 */

import {
  sprite,
  tileset,
  compose,
  toPNG,
  toSVG,
  toSpriteSheet,
  paletteFrom,
} from '../src/index.js';

const gb = paletteFrom('gameboy');

// ---------------------------------------------------------------------------
// 1. Adventurer — front-facing RPG hero (16×16)
// ---------------------------------------------------------------------------
const adventurer = sprite({
  name: 'adventurer',
  palette: gb,
  frames: [
    `
    ....00000000....
    ...0112211120...
    ..011222221110..
    ..012233332210..
    ..012232232210..
    ..012233332210..
    ..011222322110..
    ...0112211120...
    ....01111110....
    ...0112222110...
    ..011200021110..
    ..012200022110..
    ..012222222210..
    ...0122222210...
    ...0110001100...
    ..011000001100..
  `,
  ],
});

// ---------------------------------------------------------------------------
// 2. Creature — collectible round monster (16×16)
// ---------------------------------------------------------------------------
const creature = sprite({
  name: 'creature',
  palette: gb,
  frames: [
    `
    ......0000......
    ....00222200....
    ...0222222220...
    ..022222222220..
    ..022233223320..
    .02223002300220.
    .02223002300220.
    .02222332233020.
    .02222222222020.
    .02220222202020.
    ..022022220200..
    ..022222222200..
    ...0222222220...
    ...0211221120...
    ....01100110....
    .....00..00.....
  `,
  ],
});

// ---------------------------------------------------------------------------
// 3. Puffball — round platformer character, 2-frame walk cycle (16×16)
// ---------------------------------------------------------------------------
const puffball = sprite({
  name: 'puffball',
  palette: gb,
  frameDuration: [200, 200],
  frames: [
    // Frame 0: standing
    `
    ......0000......
    ....00333300....
    ...0333333330...
    ..033333333330..
    ..033303303330..
    ..033000003330..
    .03333333333330.
    .03333333333330.
    .03332233223330.
    .03333322333330.
    ..033333333330..
    ..033333333330..
    ...0333333330...
    ....00000000....
    ....01....10....
    ....00....00....
    `,
    // Frame 1: step
    `
    ......0000......
    ....00333300....
    ...0333333330...
    ..033333333330..
    ..033303303330..
    ..033000003330..
    .03333333333330.
    .03333333333330.
    .03332233223330.
    .03333322333330.
    ..033333333330..
    ..033333333330..
    ...0333333330...
    ....00000000....
    ...01......10...
    ...00......00...
    `,
  ],
});

// ---------------------------------------------------------------------------
// 4. Overworld Tiles — 8×8 RPG tiles
// ---------------------------------------------------------------------------
const overworldTiles = tileset({
  tileSize: 8,
  palette: gb,
  tiles: {
    grass: `
      23232323
      32323232
      23232323
      32323232
      23232323
      32323232
      23232323
      32323232
    `,
    path: `
      21212121
      12121212
      21212121
      12121212
      21212121
      12121212
      21212121
      12121212
    `,
    water: `
      11011101
      10110110
      01101011
      11011101
      10110110
      01101011
      11011101
      10110110
    `,
    tree: `
      ..0110..
      .012210.
      01222210
      01222210
      01222210
      .012210.
      ...00...
      ...11...
    `,
  },
});

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

// Individual PNGs at 8x scale
toPNG(adventurer, 'examples/gb-adventurer.png', { scale: 8 });
console.log('Adventurer PNG → examples/gb-adventurer.png');

toPNG(creature, 'examples/gb-creature.png', { scale: 8 });
console.log('Creature PNG → examples/gb-creature.png');

toPNG(puffball, 'examples/gb-puffball.png', { scale: 8 });
console.log('Puffball PNG → examples/gb-puffball.png');

// SVG of the adventurer
toSVG(adventurer, 'examples/gb-adventurer.svg', { scale: 8 });
console.log('Adventurer SVG → examples/gb-adventurer.svg');

// Sprite sheet of puffball walk cycle
const { buffer, metadata } = toSpriteSheet(puffball, 'examples/gb-puffball-sheet.png', {
  columns: 2,
  scale: 8,
});
console.log(`Puffball sheet: ${metadata.frames.length} frames → examples/gb-puffball-sheet.png`);

// Flipped adventurer
const adventurerFlipped = adventurer.flipX();
toPNG(adventurerFlipped, 'examples/gb-adventurer-flipped.png', { scale: 8 });
console.log('Adventurer flipped → examples/gb-adventurer-flipped.png');

// Recolored creature variant (swap light/dark shades for an "ice" look)
const creatureVariant = creature.recolor({
  '2': '#9bbc0f', // light → lightest
  '3': '#8bac0f', // lightest → light (invert shading)
});
toPNG(creatureVariant, 'examples/gb-creature-variant.png', { scale: 8 });
console.log('Creature variant → examples/gb-creature-variant.png');

// Composed overworld scene (4×4 grid of 8×8 tiles = 32×32)
const grass = overworldTiles.tile('grass');
const path = overworldTiles.tile('path');
const water = overworldTiles.tile('water');
const tree = overworldTiles.tile('tree');

const scene = compose()
  // Row 0
  .place(tree, { x: 0, y: 0 })
  .place(grass, { x: 8, y: 0 })
  .place(grass, { x: 16, y: 0 })
  .place(tree, { x: 24, y: 0 })
  // Row 1
  .place(grass, { x: 0, y: 8 })
  .place(path, { x: 8, y: 8 })
  .place(path, { x: 16, y: 8 })
  .place(grass, { x: 24, y: 8 })
  // Row 2
  .place(grass, { x: 0, y: 16 })
  .place(path, { x: 8, y: 16 })
  .place(water, { x: 16, y: 16 })
  .place(water, { x: 24, y: 16 })
  // Row 3
  .place(tree, { x: 0, y: 24 })
  .place(grass, { x: 8, y: 24 })
  .place(water, { x: 16, y: 24 })
  .place(water, { x: 24, y: 24 })
  .render();

toPNG(scene, 'examples/gb-overworld.png', { scale: 8 });
console.log('Overworld scene → examples/gb-overworld.png');

// Export tileset sheet
toPNG(overworldTiles, 'examples/gb-tileset.png', { scale: 8 });
console.log('Tileset sheet → examples/gb-tileset.png');

console.log('Done!');
