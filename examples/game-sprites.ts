/**
 * Game Sprite Workflows Example
 *
 * Demonstrates template(), patchRows(), shiftRows(), silhouette(),
 * animateSlots(), and paletteSchema() for game sprite creation.
 */
import {
  template, sprite, paletteSchema, toPNG,
} from '../src/index.js';

// --- 1. Palette Schema: validated color sets ---
const shipColors = paletteSchema([
  'body', 'wing', 'cockpit', 'engine', 'engineHot', 'outline',
]);

const heroShip = shipColors.create({
  body: '#CCDDFF',
  wing: '#99AACC',
  cockpit: '#44DDFF',
  engine: '#FF8844',
  engineHot: '#FFFF88',
  outline: '#334466',
});

console.log('Hero ship palette:', heroShip);

// --- 2. Sprite Template: reusable grid with named slots ---
const bossTemplate = template({
  name: 'boss',
  slots: {
    B: 'body',
    L: 'light',
    C: 'core',
    G: 'glow',
    O: 'outline',
  },
  frames: [`
    . . O O O O O . .
    . O B B B B B O .
    O B B L B L B B O
    O B L L L L L B O
    O B B C G C B B O
    O B B B C B B B O
    . O B B B B B O .
    . . O O O O O . .
  `],
});

// Fill with different palettes to create boss variants
const boss1 = bossTemplate.fill({
  body: '#CC2244', light: '#FF5566', core: '#FFDD44',
  glow: '#FFFF88', outline: '#440011',
});

const boss2 = bossTemplate.fill({
  body: '#2244CC', light: '#5566FF', core: '#44FFDD',
  glow: '#88FFFF', outline: '#001144',
});

console.log(`Boss 1: ${boss1.width}x${boss1.height}`);
console.log(`Boss 2: ${boss2.width}x${boss2.height}`);

// --- 3. Row Patching: animation frame variants ---
// Patch the engine row to create a thruster flicker
const bossFrame2 = bossTemplate.patchRows({
  6: '. O B C G C B O .',
  7: '. . O G G G O . .',
});
const boss1Flicker = bossFrame2.fill({
  body: '#CC2244', light: '#FF5566', core: '#FFDD44',
  glow: '#FFFF88', outline: '#440011',
});
console.log(`Boss 1 flicker variant: ${boss1Flicker.width}x${boss1Flicker.height}`);

// --- 4. Slot Animation: multi-frame from keyframes ---
const bossIdle = bossTemplate.animateSlots({
  keyframes: [
    { core: '#FFDD44', glow: '#FFFF88' },   // normal
    { core: '#FFFF88', glow: '#FFFFCC' },   // bright
    { core: '#FFDD44', glow: '#FFFF88' },   // normal
    { core: '#DDBB33', glow: '#EEDD66' },   // dim
  ],
  base: {
    body: '#CC2244', light: '#FF5566', core: '#FFDD44',
    glow: '#FFFF88', outline: '#440011',
  },
  frameDuration: 200,
});
console.log(`Boss idle animation: ${bossIdle.frames.length} frames`);

// --- 5. shiftRows: lean animation ---
const ship = sprite({
  palette: {
    '.': 'transparent',
    B: '#CCDDFF',
    W: '#99AACC',
    C: '#44DDFF',
    E: '#FF8844',
  },
  frames: [`
    . . B . .
    . B C B .
    B W B W B
    . B B B .
    . . E . .
  `],
  name: 'ship',
});

const leanLeft = ship.shiftRows({ from: 0, to: 2, dx: -1 });
const leanRight = ship.shiftRows({ from: 0, to: 2, dx: 1 });
console.log(`Ship lean-left pixel (0,0): ${leanLeft.getPixel(0, 0)}`);
console.log(`Ship lean-right pixel (0,0): ${leanRight.getPixel(0, 0)}`);

// --- 6. Silhouette: white mask for runtime tinting ---
const bulletMask = ship.silhouette('#FFFFFF');
console.log(`Bullet mask pixel (2,0): ${bulletMask.getPixel(2, 0)}`);
// All non-transparent pixels are now white

// --- Export ---
toPNG(boss1, 'examples/boss1.png', { scale: 8 });
toPNG(boss2, 'examples/boss2.png', { scale: 8 });
toPNG(bulletMask, 'examples/bullet-mask.png', { scale: 8 });

console.log('Done! Check examples/ for output PNGs.');
