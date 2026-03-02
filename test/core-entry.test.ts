import { describe, it, expect } from 'vitest';
import * as core from '../src/core.js';

describe('pixlrt/core entry point', () => {
  it('exports sprite factory', () => {
    expect(typeof core.sprite).toBe('function');
  });

  it('exports Sprite class', () => {
    expect(typeof core.Sprite).toBe('function');
  });

  it('exports color utilities', () => {
    expect(typeof core.parseColor).toBe('function');
    expect(typeof core.lighten).toBe('function');
    expect(typeof core.darken).toBe('function');
    expect(typeof core.lerp).toBe('function');
  });

  it('exports palette utilities', () => {
    expect(typeof core.PALETTES).toBe('object');
    expect(typeof core.paletteFrom).toBe('function');
    expect(typeof core.paletteFromHex).toBe('function');
  });

  it('does not export paletteFromFile', () => {
    expect('paletteFromFile' in core).toBe(false);
  });

  it('exports parser functions', () => {
    expect(typeof core.parseGrid).toBe('function');
    expect(typeof core.parseFrames).toBe('function');
  });

  it('exports Frame and PixelCanvas', () => {
    expect(typeof core.Frame).toBe('function');
    expect(typeof core.PixelCanvas).toBe('function');
  });

  it('exports transforms', () => {
    expect(typeof core.flipX).toBe('function');
    expect(typeof core.flipY).toBe('function');
    expect(typeof core.rotate).toBe('function');
    expect(typeof core.scale).toBe('function');
    expect(typeof core.pad).toBe('function');
    expect(typeof core.crop).toBe('function');
    expect(typeof core.opacity).toBe('function');
    expect(typeof core.outline).toBe('function');
  });

  it('exports animation utils', () => {
    expect(typeof core.reverseFrames).toBe('function');
    expect(typeof core.pingPong).toBe('function');
    expect(typeof core.pickFrames).toBe('function');
    expect(typeof core.setDuration).toBe('function');
  });

  it('exports composition', () => {
    expect(typeof core.Composer).toBe('function');
    expect(typeof core.compose).toBe('function');
  });

  it('exports tileset', () => {
    expect(typeof core.Tileset).toBe('function');
    expect(typeof core.tileset).toBe('function');
  });

  it('exports pure renderers', () => {
    expect(typeof core.toSVG).toBe('function');
    expect(typeof core.toCollisionMask).toBe('function');
    expect(typeof core.toImageData).toBe('function');
    expect(typeof core.toArrayBuffer).toBe('function');
    expect(typeof core.toDataURL).toBe('function');
  });

  it('exports quantize', () => {
    expect(typeof core.quantize).toBe('function');
  });

  it('exports nine-patch', () => {
    expect(typeof core.ninePatchMeta).toBe('function');
    expect(typeof core.ninePatchResize).toBe('function');
  });

  it('does not export Node-specific functions', () => {
    expect('toPNG' in core).toBe(false);
    expect('toGIF' in core).toBe(false);
    expect('toAPNG' in core).toBe(false);
    expect('toSpriteSheet' in core).toBe(false);
    expect('fromPNG' in core).toBe(false);
    expect('fromSpriteSheet' in core).toBe(false);
  });
});
