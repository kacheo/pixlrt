import { describe, it, expect } from 'vitest';
import { parseColor, lighten, darken, lerp, toHex, mix, saturate, desaturate } from '../src/color.js';

describe('parseColor', () => {
  it('parses #rgb shorthand', () => {
    expect(parseColor('#f00')).toEqual([255, 0, 0, 255]);
    expect(parseColor('#0f0')).toEqual([0, 255, 0, 255]);
    expect(parseColor('#00f')).toEqual([0, 0, 255, 255]);
  });

  it('parses #rrggbb', () => {
    expect(parseColor('#1a1c2c')).toEqual([26, 28, 44, 255]);
    expect(parseColor('#ffffff')).toEqual([255, 255, 255, 255]);
  });

  it('parses #rrggbbaa', () => {
    expect(parseColor('#ff000080')).toEqual([255, 0, 0, 128]);
    expect(parseColor('#00000000')).toEqual([0, 0, 0, 0]);
  });

  it('parses named colors', () => {
    expect(parseColor('red')).toEqual([255, 0, 0, 255]);
    expect(parseColor('transparent')).toEqual([0, 0, 0, 0]);
    expect(parseColor('Black')).toEqual([0, 0, 0, 255]);
  });

  it('passes through RGBA tuples', () => {
    expect(parseColor([10, 20, 30, 40])).toEqual([10, 20, 30, 40]);
  });

  it('throws on invalid hex', () => {
    expect(() => parseColor('#12')).toThrow('Invalid hex');
  });

  it('throws on unknown color name', () => {
    expect(() => parseColor('foobar')).toThrow('Unknown color');
  });

  it('throws on wrong tuple length', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => parseColor([1, 2, 3] as any)).toThrow('4 elements');
  });
});

describe('lighten', () => {
  it('lightens a color by given amount', () => {
    const result = lighten('#000000', 0.5);
    expect(result).toEqual([128, 128, 128, 255]);
  });

  it('returns white at amount=1', () => {
    expect(lighten('#000000', 1)).toEqual([255, 255, 255, 255]);
  });
});

describe('darken', () => {
  it('darkens a color by given amount', () => {
    const result = darken('#ffffff', 0.5);
    expect(result).toEqual([128, 128, 128, 255]);
  });

  it('returns black at amount=1', () => {
    expect(darken('#ffffff', 1)).toEqual([0, 0, 0, 255]);
  });
});

describe('lerp', () => {
  it('interpolates between two colors', () => {
    expect(lerp('#000000', '#ffffff', 0.5)).toEqual([128, 128, 128, 255]);
  });

  it('returns first color at t=0', () => {
    expect(lerp('#ff0000', '#0000ff', 0)).toEqual([255, 0, 0, 255]);
  });

  it('returns second color at t=1', () => {
    expect(lerp('#ff0000', '#0000ff', 1)).toEqual([0, 0, 255, 255]);
  });
});

describe('toHex', () => {
  it('converts opaque color to #rrggbb', () => {
    expect(toHex([255, 0, 0, 255])).toBe('#ff0000');
    expect(toHex([0, 0, 0, 255])).toBe('#000000');
    expect(toHex([255, 255, 255, 255])).toBe('#ffffff');
  });

  it('includes alpha when < 255', () => {
    expect(toHex([255, 0, 0, 128])).toBe('#ff000080');
    expect(toHex([0, 0, 0, 0])).toBe('#00000000');
  });

  it('accepts string input via parseColor', () => {
    expect(toHex('red')).toBe('#ff0000');
    expect(toHex('#0f0')).toBe('#00ff00');
  });

  it('pads single-digit hex values', () => {
    expect(toHex([1, 2, 3, 255])).toBe('#010203');
  });
});

describe('mix', () => {
  it('blends equally by default (ratio=0.5)', () => {
    expect(mix('#000000', '#ffffff')).toEqual([128, 128, 128, 255]);
  });

  it('supports custom ratio', () => {
    expect(mix('#000000', '#ffffff', 0.25)).toEqual([64, 64, 64, 255]);
  });

  it('matches lerp behavior', () => {
    expect(mix('#ff0000', '#0000ff', 0.3)).toEqual(lerp('#ff0000', '#0000ff', 0.3));
  });
});

describe('saturate', () => {
  it('has no effect on fully saturated color', () => {
    const result = saturate([255, 0, 0, 255], 0.5);
    expect(result).toEqual([255, 0, 0, 255]);
  });

  it('has no effect at amount=0', () => {
    expect(saturate([128, 100, 80, 255], 0)).toEqual([128, 100, 80, 255]);
  });

  it('increases saturation of a muted color', () => {
    const muted: [number, number, number, number] = [150, 120, 120, 255];
    const result = saturate(muted, 0.5);
    // Red channel should increase, others should decrease (more saturated)
    expect(result[0]).toBeGreaterThan(muted[0]);
    expect(result[1]).toBeLessThan(muted[1]);
  });

  it('preserves alpha', () => {
    const result = saturate([150, 120, 120, 100], 0.5);
    expect(result[3]).toBe(100);
  });
});

describe('desaturate', () => {
  it('fully desaturates at amount=1', () => {
    const result = desaturate([255, 0, 0, 255], 1);
    // All channels should be equal (gray)
    expect(result[0]).toBe(result[1]);
    expect(result[1]).toBe(result[2]);
  });

  it('has no effect on gray', () => {
    expect(desaturate([128, 128, 128, 255], 0.5)).toEqual([128, 128, 128, 255]);
  });

  it('has no effect at amount=0', () => {
    expect(desaturate([255, 0, 0, 255], 0)).toEqual([255, 0, 0, 255]);
  });

  it('preserves alpha', () => {
    const result = desaturate([255, 0, 0, 80], 0.5);
    expect(result[3]).toBe(80);
  });
});
