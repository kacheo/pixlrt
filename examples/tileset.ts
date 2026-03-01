import { tileset, toPNG, compose } from '../src/index.js';

const tiles = tileset({
  tileSize: 4,
  palette: {
    '.': 'transparent',
    'g': '#38b764',  // grass green
    'G': '#257953',  // dark grass
    'w': '#41a6f6',  // water blue
    'W': '#2971cc',  // deep water
    's': '#a0a08b',  // stone grey
    'S': '#696a6a',  // dark stone
  },
  tiles: {
    grass: `
      gGgg
      ggGg
      gggG
      Gggg
    `,
    water: `
      wWww
      wwWw
      wWwW
      WwwW
    `,
    stone: `
      sSss
      ssSs
      SssS
      ssss
    `,
  },
});

// Export full tileset
toPNG(tiles, 'examples/tileset.png', { scale: 8 });
console.log('Tileset sheet → examples/tileset.png');

// Compose a small scene using individual tiles
const grass = tiles.tile('grass');
const water = tiles.tile('water');
const stone = tiles.tile('stone');

const scene = compose({ background: '#87ceeb' })
  .place(grass, { x: 0, y: 0 })
  .place(grass, { x: 4, y: 0 })
  .place(stone, { x: 8, y: 0 })
  .place(grass, { x: 0, y: 4 })
  .place(water, { x: 4, y: 4 })
  .place(water, { x: 8, y: 4 })
  .place(stone, { x: 0, y: 8 })
  .place(water, { x: 4, y: 8 })
  .place(water, { x: 8, y: 8 })
  .render();

toPNG(scene, 'examples/scene.png', { scale: 8 });
console.log('Scene → examples/scene.png');
console.log('Done!');
