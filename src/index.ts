// Core types
export type {
  RGBA,
  ColorInput,
  PaletteMap,
  PixelGrid,
  SpriteConfig,
  TilesetConfig,
  PNGOptions,
  SVGOptions,
  GIFOptions,
  SpriteSheetOptions,
  SpriteSheetMeta,
  Renderable,
  SceneOptions,
  LayerConfig,
  NinePatchEdges,
  NinePatchMeta,
  Rect,
  AtlasEntry,
  AtlasOptions,
  AtlasFrame,
  AtlasMeta,
  MultiScaleOptions,
  CollisionMaskOptions,
} from './types.js';

// Color utilities
export { parseColor, lighten, darken, lerp } from './color.js';

// Palettes
export { PALETTES, paletteFrom, paletteFromHex, paletteFromFile } from './palette.js';

// Parser
export { parseGrid, parseFrames } from './parser.js';

// Frame & Canvas
export { Frame } from './frame.js';
export { PixelCanvas } from './canvas.js';

// Transforms
export {
  flipX,
  flipY,
  rotate,
  rotate90,
  rotate180,
  rotate270,
  scale,
  pad,
  crop,
  opacity,
  outline,
} from './transform.js';

// Animation
export { reverseFrames, pingPong, pickFrames, setDuration } from './animation.js';

// Nine-patch
export { ninePatchMeta, ninePatchResize } from './nine-patch.js';

// Sprite
export { Sprite, sprite } from './sprite.js';

// Composition
export { Composer, compose, type ComposeOptions } from './compose.js';

// Tileset
export { Tileset, tileset } from './tileset.js';

// Renderers
export { toPNG } from './render/png.js';
export { toSVG } from './render/svg.js';
export { toSpriteSheet } from './render/spritesheet.js';
export { toGIF } from './render/gif.js';
export { toTiled } from './render/tiled.js';
export type { TiledMap, TiledTileLayer, TiledTilesetRef, TiledExportOptions } from './render/tiled.js';
export { toAtlas } from './render/atlas.js';
export { toAtlasPhaser } from './render/atlas-phaser.js';
export type { PhaserHashOutput, PhaserArrayOutput } from './render/atlas-phaser.js';
export { toAtlasUnity } from './render/atlas-unity.js';
export type { UnityOutput } from './render/atlas-unity.js';
export { toAtlasGodot } from './render/atlas-godot.js';
export { toMultiScale } from './render/multiscale.js';
export type { MultiScaleResult } from './render/multiscale.js';
export { toCollisionMask } from './render/collision-mask.js';
export type { CollisionMaskResult } from './render/collision-mask.js';

// Import
export { fromPNG } from './import/png.js';
export { fromSpriteSheet } from './import/spritesheet.js';

// Quantize
export { quantize } from './quantize.js';
