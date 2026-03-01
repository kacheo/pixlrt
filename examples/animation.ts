import { sprite, toSpriteSheet } from '../src/index.js';

const walk = sprite({
  name: 'walk-cycle',
  palette: {
    '.': 'transparent',
    x: '#1a1c2c',
    s: '#f4cca1',
    b: '#3b5dc9',
  },
  frameDuration: [150, 150, 150, 150],
  frames: [
    // Frame 0: standing
    `
    .xxx.
    xsssx
    .xxx.
    xbbbx
    xbbbx
    .x.x.
    `,
    // Frame 1: step left
    `
    .xxx.
    xsssx
    .xxx.
    xbbbx
    xbbbx
    x..x.
    `,
    // Frame 2: standing
    `
    .xxx.
    xsssx
    .xxx.
    xbbbx
    xbbbx
    .x.x.
    `,
    // Frame 3: step right
    `
    .xxx.
    xsssx
    .xxx.
    xbbbx
    xbbbx
    .x..x
    `,
  ],
});

const { buffer, metadata } = toSpriteSheet(walk, 'examples/walk-sheet.png', {
  columns: 4,
  scale: 4,
});

console.log(`Sprite sheet: ${buffer.length} bytes → examples/walk-sheet.png`);
console.log(
  `Metadata: ${metadata.frames.length} frames, ${metadata.frameWidth}x${metadata.frameHeight} each`,
);
console.log('Done!');
