// Re-export everything from core (pure computation, no Node deps)
export {
  // Types
  type RGBA, type ColorInput, type PaletteMap, type PixelGrid, type SpriteConfig, type TilesetConfig,
  type PNGOptions, type SVGOptions, type GIFOptions, type SpriteSheetOptions, type SpriteSheetMeta,
  type Renderable, type SceneOptions, type LayerConfig, type NinePatchEdges, type NinePatchMeta, type Rect,
  type AtlasEntry, type AtlasOptions, type AtlasFrame, type AtlasMeta, type MultiScaleOptions,
  type CollisionMaskOptions, type AnimationMode, type AnimationTag, type TaggedSpriteSheetOptions,
  type TaggedSpriteSheetMeta, type APNGOptions,

  // Color
  parseColor, lighten, darken, lerp,

  // Palettes
  PALETTES, paletteFrom, paletteFromHex,

  // Parser
  parseGrid, parseFrames,

  // Frame & Canvas
  Frame, PixelCanvas,

  // Transforms
  flipX, flipY, rotate, rotate90, rotate180, rotate270, scale, pad, crop, opacity, outline,

  // Animation
  reverseFrames, pingPong, pickFrames, setDuration,

  // Nine-patch
  ninePatchMeta, ninePatchResize,

  // Sprite
  Sprite, sprite,

  // Composition
  Composer, compose, type ComposeOptions,

  // Tileset
  Tileset, tileset,

  // Quantize
  quantize,

  // Pure renderers
  toCollisionMask, type CollisionMaskResult,
  toImageData, type ImageDataResult,
  toArrayBuffer,
  toDataURL,
} from './core.js';

// Re-export everything from node (file I/O, pngjs, etc.)
// Note: node's toSVG (with file-write overload) overrides core's toSVG
export {
  paletteFromFile,
  toPNG,
  toGIF,
  toAPNG,
  toSpriteSheet, toTaggedSpriteSheet,
  toAtlas,
  toAtlasPhaser, type PhaserHashOutput, type PhaserArrayOutput,
  toAtlasUnity, type UnityOutput,
  toAtlasGodot,
  toTiled, type TiledMap, type TiledTileLayer, type TiledTilesetRef, type TiledExportOptions,
  toMultiScale, type MultiScaleResult,
  toSVG,
  fromPNG,
  fromSpriteSheet,
} from './node.js';
