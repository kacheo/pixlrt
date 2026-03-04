/** RGBA color tuple: [r, g, b, a] each 0-255 */
export type RGBA = [number, number, number, number];

/** Color input: hex string, named color, 'transparent', or RGBA tuple */
export type ColorInput = string | RGBA;

/** Single-character key → color mapping for ASCII grid parsing */
export type PaletteMap = Record<string, ColorInput>;

/** Immutable 2D grid of RGBA pixels (row-major: pixels[row][col]) */
export type PixelGrid = readonly (readonly RGBA[])[];

/** Configuration for creating a Sprite */
export interface SpriteConfig {
  palette: PaletteMap;
  frames: string[];
  name?: string;
  origin?: { x: number; y: number };
  frameDuration?: number | number[];
}

/** Configuration for tileset creation */
export interface TilesetConfig {
  tileSize: number;
  palette: PaletteMap;
  tiles: Record<string, string>;
}

/** Render options for PNG output */
export interface PNGOptions {
  scale?: number;
}

/** Render options for SVG output */
export interface SVGOptions {
  scale?: number;
}

/** Render options for GIF output */
export interface GIFOptions {
  scale?: number; // integer upscale (default 1)
  loop?: number; // 0 = infinite (default), n = loop n times
}

/** Render options for sprite sheet output */
export interface SpriteSheetOptions {
  columns?: number;
  padding?: number;
  scale?: number;
}

/** Metadata for a sprite sheet */
export interface SpriteSheetMeta {
  image: string;
  frameWidth: number;
  frameHeight: number;
  scale: number;
  frames: Array<{
    index: number;
    x: number;
    y: number;
    w: number;
    h: number;
    duration?: number;
  }>;
}

/** A single layer in a multi-layer scene */
export interface LayerConfig {
  layout: string;
}

/** Options for Tileset.scene() */
export interface SceneOptions {
  background?: ColorInput;
  scale?: number;
  layers?: LayerConfig[];
}

/** Edge sizes for nine-patch slicing */
export interface NinePatchEdges {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Region rect within a frame */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Metadata describing the 9 regions of a nine-patch */
export interface NinePatchMeta {
  topLeft: Rect;
  topCenter: Rect;
  topRight: Rect;
  middleLeft: Rect;
  center: Rect;
  middleRight: Rect;
  bottomLeft: Rect;
  bottomCenter: Rect;
  bottomRight: Rect;
  sourceWidth: number;
  sourceHeight: number;
  edges: NinePatchEdges;
}

/** Anything that can be rendered: has width, height, and pixel data */
export interface Renderable {
  readonly width: number;
  readonly height: number;
  getPixel(x: number, y: number): RGBA;
}

/** A named renderable entry for texture atlas packing */
export interface AtlasEntry {
  name: string;
  source: Renderable;
}

/** Options for texture atlas generation */
export interface AtlasOptions {
  padding?: number;
  scale?: number;
  maxWidth?: number;
  maxHeight?: number;
  pot?: boolean;
}

/** A single frame's placement within a texture atlas */
export interface AtlasFrame {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  sourceW: number;
  sourceH: number;
}

/** Metadata describing a packed texture atlas */
export interface AtlasMeta {
  image: string;
  width: number;
  height: number;
  scale: number;
  frames: AtlasFrame[];
}

/** Options for multi-scale PNG output */
export interface MultiScaleOptions {
  scales?: number[];
  suffix?: (scale: number) => string;
}

/** Options for collision mask generation */
export interface CollisionMaskOptions {
  threshold?: number;
}

/** Animation playback mode */
export type AnimationMode = 'loop' | 'pingpong' | 'once';

/** A named animation range within a tagged sprite sheet */
export interface AnimationTag {
  name: string;
  from: number; // start frame index in sheet
  to: number; // end frame index (inclusive)
  direction: 'forward' | 'reverse' | 'pingpong';
}

/** Options for tagged sprite sheet output */
export interface TaggedSpriteSheetOptions {
  columns?: number;
  padding?: number;
  scale?: number;
}

/** Metadata for a tagged sprite sheet */
export interface TaggedSpriteSheetMeta {
  image: string;
  frameWidth: number;
  frameHeight: number;
  scale: number;
  frames: Array<{
    index: number;
    x: number;
    y: number;
    w: number;
    h: number;
    duration?: number;
  }>;
  tags: AnimationTag[];
}

/** Render options for APNG output */
export interface APNGOptions {
  scale?: number;
  loop?: number; // 0 = infinite (default)
}
