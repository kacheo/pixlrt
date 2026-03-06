import { describe, it, expect } from 'vitest';
import { template, SpriteTemplate } from '../src/template.js';
import type { RGBA } from '../src/types.js';

const T: RGBA = [0, 0, 0, 0];

describe('template()', () => {
  it('creates a SpriteTemplate from config', () => {
    const t = template({
      slots: { B: 'body', L: 'light' },
      frames: [
        `
        . B .
        B L B
        . B .
      `,
      ],
    });
    expect(t).toBeInstanceOf(SpriteTemplate);
    expect(t.width).toBe(3);
    expect(t.height).toBe(3);
    expect(t.roles).toContain('body');
    expect(t.roles).toContain('light');
  });

  it('defaults name to untitled', () => {
    const t = template({
      slots: { B: 'body' },
      frames: ['B'],
    });
    expect(t.name).toBe('untitled');
  });

  it('accepts custom name and origin', () => {
    const t = template({
      slots: { B: 'body' },
      frames: ['B'],
      name: 'boss',
      origin: { x: 5, y: 5 },
    });
    expect(t.name).toBe('boss');
    expect(t.origin).toEqual({ x: 5, y: 5 });
  });

  it('throws on empty frames', () => {
    expect(() => template({ slots: { B: 'body' }, frames: [] })).toThrow(
      'At least one frame is required',
    );
  });

  it('throws on multi-char slot key', () => {
    expect(() => template({ slots: { BB: 'body' }, frames: ['BB'] })).toThrow('single character');
  });

  it('throws on unknown slot key in frame', () => {
    expect(() => template({ slots: { B: 'body' }, frames: ['X'] })).toThrow("unknown slot key 'X'");
  });

  it('throws on mismatched frame dimensions', () => {
    expect(() =>
      template({
        slots: { B: 'body' },
        frames: ['B B\nB B', 'B B B\nB B B'],
      }),
    ).toThrow("don't match");
  });
});

describe('SpriteTemplate.fill()', () => {
  const t = template({
    slots: { B: 'body', L: 'light' },
    frames: [
      `
      . B .
      B L B
      . B .
    `,
    ],
  });

  it('produces a Sprite with correct colors', () => {
    const s = t.fill({ body: '#ff0000', light: '#00ff00' });
    expect(s.width).toBe(3);
    expect(s.height).toBe(3);
    // Center is light
    expect(s.getPixel(1, 1)).toEqual([0, 255, 0, 255]);
    // Top-center is body
    expect(s.getPixel(1, 0)).toEqual([255, 0, 0, 255]);
    // Corner is transparent
    expect(s.getPixel(0, 0)).toEqual(T);
  });

  it('throws on missing slot fills', () => {
    expect(() => t.fill({ body: '#ff0000' })).toThrow('Missing slot fills: light');
  });

  it('produces correct palette on resulting sprite', () => {
    const s = t.fill({ body: '#ff0000', light: '#00ff00' });
    expect(s.palette['B']).toBe('#ff0000');
    expect(s.palette['L']).toBe('#00ff00');
  });

  it('works with multi-frame templates', () => {
    const t2 = template({
      slots: { A: 'a' },
      frames: ['A', 'A'],
      frameDuration: [100, 200],
    });
    const s = t2.fill({ a: '#ff0000' });
    expect(s.frames.length).toBe(2);
    expect(s.frameDuration).toEqual([100, 200]);
  });

  it('produces different sprites from same template with different fills', () => {
    const s1 = t.fill({ body: '#ff0000', light: '#00ff00' });
    const s2 = t.fill({ body: '#0000ff', light: '#ffff00' });
    expect(s1.getPixel(1, 0)).toEqual([255, 0, 0, 255]);
    expect(s2.getPixel(1, 0)).toEqual([0, 0, 255, 255]);
  });
});

describe('SpriteTemplate.patchRows()', () => {
  const t = template({
    slots: { B: 'body', L: 'light' },
    frames: [
      `
      B B B
      L L L
      B B B
    `,
    ],
  });

  it('replaces specified rows', () => {
    const patched = t.patchRows({ 1: 'B L B' });
    const s = patched.fill({ body: '#ff0000', light: '#00ff00' });
    // Row 1 center should still be light, but sides now body
    expect(s.getPixel(0, 1)).toEqual([255, 0, 0, 255]);
    expect(s.getPixel(1, 1)).toEqual([0, 255, 0, 255]);
    expect(s.getPixel(2, 1)).toEqual([255, 0, 0, 255]);
  });

  it('returns a new template (immutable)', () => {
    const patched = t.patchRows({ 1: 'B B B' });
    expect(patched).not.toBe(t);
    // Original unchanged
    const orig = t.fill({ body: '#ff0000', light: '#00ff00' });
    expect(orig.getPixel(0, 1)).toEqual([0, 255, 0, 255]);
  });

  it('throws on out-of-range row', () => {
    expect(() => t.patchRows({ 5: 'B B B' })).toThrow('out of range');
  });

  it('throws on wrong row width', () => {
    expect(() => t.patchRows({ 1: 'B B' })).toThrow("doesn't match");
  });

  it('throws on unknown slot key in patch', () => {
    expect(() => t.patchRows({ 1: 'X X X' })).toThrow("Unknown slot key 'X'");
  });

  it('throws on out-of-range frame index', () => {
    expect(() => t.patchRows({ 0: 'B B B' }, 5)).toThrow('out of range');
  });

  it('supports transparent in patch rows', () => {
    const patched = t.patchRows({ 0: '. B .' });
    const s = patched.fill({ body: '#ff0000', light: '#00ff00' });
    expect(s.getPixel(0, 0)).toEqual(T);
    expect(s.getPixel(1, 0)).toEqual([255, 0, 0, 255]);
    expect(s.getPixel(2, 0)).toEqual(T);
  });
});

describe('SpriteTemplate.animateSlots()', () => {
  const t = template({
    slots: { C: 'core', G: 'glow', B: 'body' },
    frames: [
      `
      B C B
      C G C
      B C B
    `,
    ],
  });

  it('generates multi-frame sprite from keyframes', () => {
    const s = t.animateSlots({
      keyframes: [{ core: '#ff0000' }, { core: '#00ff00' }, { core: '#0000ff' }],
      base: { core: '#ff0000', glow: '#ffff00', body: '#880000' },
    });
    expect(s.frames.length).toBe(3);
    // Frame 0: core is red
    expect(s.frame(0).getPixel(1, 0)).toEqual([255, 0, 0, 255]);
    // Frame 1: core is green
    expect(s.frame(1).getPixel(1, 0)).toEqual([0, 255, 0, 255]);
    // Frame 2: core is blue
    expect(s.frame(2).getPixel(1, 0)).toEqual([0, 0, 255, 255]);
    // Body stays same across all frames
    expect(s.frame(0).getPixel(0, 0)).toEqual([136, 0, 0, 255]);
    expect(s.frame(2).getPixel(0, 0)).toEqual([136, 0, 0, 255]);
  });

  it('supports custom frame durations', () => {
    const s = t.animateSlots({
      keyframes: [{ core: '#ff0000' }, { core: '#00ff00' }],
      base: { core: '#ff0000', glow: '#ffff00', body: '#880000' },
      frameDuration: [200, 300],
    });
    expect(s.frameDuration).toEqual([200, 300]);
  });

  it('supports uniform frame duration', () => {
    const s = t.animateSlots({
      keyframes: [{ core: '#ff0000' }, { core: '#00ff00' }],
      base: { core: '#ff0000', glow: '#ffff00', body: '#880000' },
      frameDuration: 150,
    });
    expect(s.frameDuration).toEqual([150, 150]);
  });

  it('throws on empty keyframes', () => {
    expect(() =>
      t.animateSlots({
        keyframes: [],
        base: { core: '#ff0000', glow: '#ffff00', body: '#880000' },
      }),
    ).toThrow('At least one keyframe');
  });

  it('throws on missing base fill', () => {
    expect(() =>
      t.animateSlots({
        keyframes: [{ core: '#ff0000' }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        base: { core: '#ff0000', glow: '#ffff00' } as any,
      }),
    ).toThrow('Missing base slot fills');
  });

  it('throws on mismatched frameDuration array length', () => {
    expect(() =>
      t.animateSlots({
        keyframes: [{ core: '#ff0000' }, { core: '#00ff00' }],
        base: { core: '#ff0000', glow: '#ffff00', body: '#880000' },
        frameDuration: [100],
      }),
    ).toThrow('frameDuration length');
  });
});

describe('SpriteTemplate.roles', () => {
  it('returns unique role names', () => {
    const t = template({
      slots: { B: 'body', L: 'body', C: 'core' },
      frames: ['B L C'],
    });
    const roles = t.roles;
    expect(roles).toContain('body');
    expect(roles).toContain('core');
    expect(roles.length).toBe(2);
  });
});
