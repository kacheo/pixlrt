// Core types
export type {
  RGBA, ColorInput, PaletteMap, PixelGrid, SpriteConfig, TilesetConfig,
  PNGOptions, SVGOptions, GIFOptions, SpriteSheetOptions, SpriteSheetMeta,
  Renderable, SceneOptions, LayerConfig, NinePatchEdges, NinePatchMeta, Rect,
  AtlasEntry, AtlasOptions, AtlasFrame, AtlasMeta, MultiScaleOptions,
  CollisionMaskOptions, AnimationMode, AnimationTag, TaggedSpriteSheetOptions,
  TaggedSpriteSheetMeta, APNGOptions,
} from './types.js';

// Color utilities
export { parseColor, lighten, darken, lerp, toHex, mix, saturate, desaturate } from './color.js';

// Palettes (pure computation only — no paletteFromFile)
export { PALETTES, paletteFrom, paletteFromHex } from './palette.js';

// Parser
export { parseGrid, parseFrames } from './parser.js';

// Frame & Canvas
export { Frame } from './frame.js';
export { PixelCanvas } from './canvas.js';

// Transforms
export { flipX, flipY, rotate, rotate90, rotate180, rotate270, scale, pad, crop, opacity, outline } from './transform.js';

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

// Quantize
export { quantize } from './quantize.js';

// Pure renderers (no Node.js dependencies)
export { toSVG } from './render/svg.js';
export { toCollisionMask } from './render/collision-mask.js';
export type { CollisionMaskResult } from './render/collision-mask.js';
export { toImageData } from './render/imagedata.js';
export type { ImageDataResult } from './render/imagedata.js';
export { toArrayBuffer } from './render/arraybuffer.js';
export { toDataURL } from './render/dataurl.js';
export { paletteSwatch } from './render/palette-preview.js';
