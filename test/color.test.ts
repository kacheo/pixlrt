import { describe, it, expect } from 'vitest';
import { parseColor, lighten, darken, lerp } from '../src/color.js';

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
