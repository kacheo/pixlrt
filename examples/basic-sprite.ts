import { sprite, toPNG, toSVG } from '../src/index.js';

const hero = sprite({
  name: 'hero',
  palette: {
    '.': 'transparent',
    'x': '#1a1c2c',  // outline
    's': '#f4cca1',  // skin
    'h': '#5d275d',  // hair
    'b': '#3b5dc9',  // blue clothes
    'r': '#b13e53',  // red accent
  },
  frames: [`
    ..xhx...
    .xhhhx..
    .xsssxx.
    ..xssx..
    .xbbbbx.
    .xbrbxx.
    .xbbbbx.
    ..xbbx..
    ..x..x..
    .xx..xx.
  `],
});

// Export as PNG at 8x scale
const pngBuf = toPNG(hero, 'examples/hero.png', { scale: 8 });
console.log(`PNG: ${pngBuf.length} bytes → examples/hero.png`);

// Export as SVG at 8x scale
const svg = toSVG(hero, 'examples/hero.svg', { scale: 8 });
console.log(`SVG: ${svg.length} chars → examples/hero.svg`);

// Transform examples
const flipped = hero.flipX();
toPNG(flipped, 'examples/hero-flipped.png', { scale: 8 });
console.log('Flipped → examples/hero-flipped.png');

const big = hero.scale(2);
toPNG(big, 'examples/hero-2x.png', { scale: 4 });
console.log('Scaled 2x → examples/hero-2x.png');

console.log('Done!');
