import { describe, it, expect } from 'vitest';
import { sprite } from '../src/sprite.js';
import { reverseFrames, pingPong, pickFrames, setDuration } from '../src/animation.js';

const palette = {
  '.': 'transparent',
  a: '#ff0000',
  b: '#00ff00',
  c: '#0000ff',
};

function makeSprite(frameCount: number, durations?: number[]) {
  const chars = ['a', 'b', 'c'];
  const frames = [];
  for (let i = 0; i < frameCount; i++) {
    frames.push(chars[i % chars.length]!);
  }
  return sprite({
    palette,
    frames,
    frameDuration: durations ?? frames.map((_, i) => (i + 1) * 100),
  });
}

describe('reverseFrames', () => {
  it('reverses frame order and durations for 3-frame sprite', () => {
    const s = makeSprite(3, [100, 200, 300]);
    const reversed = reverseFrames(s);

    expect(reversed.frames.length).toBe(3);
    expect(reversed.frameDuration).toEqual([300, 200, 100]);

    // First frame of reversed should be last frame of original
    expect(reversed.frames[0]!.getPixel(0, 0)).toEqual(s.frames[2]!.getPixel(0, 0));
    expect(reversed.frames[2]!.getPixel(0, 0)).toEqual(s.frames[0]!.getPixel(0, 0));
  });

  it('single-frame returns clone', () => {
    const s = makeSprite(1, [100]);
    const reversed = reverseFrames(s);
    expect(reversed.frames.length).toBe(1);
    expect(reversed.frameDuration).toEqual([100]);
    expect(reversed).not.toBe(s);
  });
});

describe('pingPong', () => {
  it('3-frame [A,B,C] → [A,B,C,B]', () => {
    const s = makeSprite(3, [100, 200, 300]);
    const pp = pingPong(s);

    expect(pp.frames.length).toBe(4);
    expect(pp.frameDuration).toEqual([100, 200, 300, 200]);

    // Frame 3 should match original frame 1
    expect(pp.frames[3]!.getPixel(0, 0)).toEqual(s.frames[1]!.getPixel(0, 0));
  });

  it('single-frame returns clone', () => {
    const s = makeSprite(1);
    const pp = pingPong(s);
    expect(pp.frames.length).toBe(1);
    expect(pp).not.toBe(s);
  });

  it('2-frame returns clone', () => {
    const s = makeSprite(2, [100, 200]);
    const pp = pingPong(s);
    expect(pp.frames.length).toBe(2);
    expect(pp.frameDuration).toEqual([100, 200]);
  });
});

describe('pickFrames', () => {
  it('selects subset of frames', () => {
    const s = makeSprite(3, [100, 200, 300]);
    const picked = pickFrames(s, [0, 2]);
    expect(picked.frames.length).toBe(2);
    expect(picked.frameDuration).toEqual([100, 300]);
  });

  it('supports reordering', () => {
    const s = makeSprite(3, [100, 200, 300]);
    const picked = pickFrames(s, [2, 0, 1]);
    expect(picked.frames.length).toBe(3);
    expect(picked.frameDuration).toEqual([300, 100, 200]);
    expect(picked.frames[0]!.getPixel(0, 0)).toEqual(s.frames[2]!.getPixel(0, 0));
  });

  it('supports duplicates', () => {
    const s = makeSprite(2, [100, 200]);
    const picked = pickFrames(s, [0, 0, 1, 1]);
    expect(picked.frames.length).toBe(4);
    expect(picked.frameDuration).toEqual([100, 100, 200, 200]);
  });

  it('throws on empty array', () => {
    const s = makeSprite(2);
    expect(() => pickFrames(s, [])).toThrow('indices array must not be empty');
  });

  it('throws on out-of-range index', () => {
    const s = makeSprite(2);
    expect(() => pickFrames(s, [0, 5])).toThrow('out of range');
  });

  it('throws on negative index', () => {
    const s = makeSprite(3);
    expect(() => pickFrames(s, [0, -1])).toThrow('out of range');
  });
});

describe('setDuration', () => {
  it('single number sets all frames', () => {
    const s = makeSprite(3, [100, 200, 300]);
    const result = setDuration(s, 50);
    expect(result.frameDuration).toEqual([50, 50, 50]);
  });

  it('array sets per-frame durations', () => {
    const s = makeSprite(3, [100, 200, 300]);
    const result = setDuration(s, [10, 20, 30]);
    expect(result.frameDuration).toEqual([10, 20, 30]);
  });

  it('throws on array length mismatch', () => {
    const s = makeSprite(3);
    expect(() => setDuration(s, [10, 20])).toThrow('must match frame count');
  });
});
