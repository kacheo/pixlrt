import { describe, it, expect } from 'vitest';
import { sprite } from '../src/sprite.js';

const palette = {
  a: '#ff0000',
  b: '#00ff00',
  c: '#0000ff',
  d: '#ffff00',
};

function makeSprite(frameCount: number, durations?: number[]) {
  const keys = ['a', 'b', 'c', 'd'];
  const frames = keys.slice(0, frameCount);
  return sprite({
    palette,
    frames,
    frameDuration: durations ?? new Array(frameCount).fill(100),
  });
}

describe('Sprite.frameAt', () => {
  describe('single-frame sprite', () => {
    it('always returns frame 0 regardless of time or mode', () => {
      const s = makeSprite(1);
      expect(s.frameAt(0)).toBe(s.frames[0]);
      expect(s.frameAt(500)).toBe(s.frames[0]);
      expect(s.frameAt(0, 'once')).toBe(s.frames[0]);
      expect(s.frameAt(0, 'pingpong')).toBe(s.frames[0]);
    });
  });

  describe('loop mode (default)', () => {
    it('returns frame 0 at time 0', () => {
      const s = makeSprite(3);
      expect(s.frameAt(0)).toBe(s.frames[0]);
    });

    it('returns correct frame based on elapsed time', () => {
      const s = makeSprite(3, [100, 200, 100]);
      // 0-99 → frame 0, 100-299 → frame 1, 300-399 → frame 2
      expect(s.frameAt(50)).toBe(s.frames[0]);
      expect(s.frameAt(100)).toBe(s.frames[1]);
      expect(s.frameAt(150)).toBe(s.frames[1]);
      expect(s.frameAt(300)).toBe(s.frames[2]);
      expect(s.frameAt(350)).toBe(s.frames[2]);
    });

    it('wraps around at total duration', () => {
      const s = makeSprite(3, [100, 100, 100]);
      // Total = 300ms. At 300ms wraps to 0.
      expect(s.frameAt(300)).toBe(s.frames[0]);
      expect(s.frameAt(400)).toBe(s.frames[1]);
      expect(s.frameAt(600)).toBe(s.frames[0]);
    });

    it('clamps negative time to 0', () => {
      const s = makeSprite(3);
      expect(s.frameAt(-100)).toBe(s.frames[0]);
    });
  });

  describe('once mode', () => {
    it('returns frame 0 at time 0', () => {
      const s = makeSprite(3);
      expect(s.frameAt(0, 'once')).toBe(s.frames[0]);
    });

    it('returns last frame at and beyond total duration', () => {
      const s = makeSprite(3, [100, 100, 100]);
      expect(s.frameAt(300, 'once')).toBe(s.frames[2]);
      expect(s.frameAt(9999, 'once')).toBe(s.frames[2]);
    });

    it('returns correct frame during playback', () => {
      const s = makeSprite(3, [100, 200, 100]);
      expect(s.frameAt(50, 'once')).toBe(s.frames[0]);
      expect(s.frameAt(150, 'once')).toBe(s.frames[1]);
      expect(s.frameAt(350, 'once')).toBe(s.frames[2]);
    });
  });

  describe('pingpong mode', () => {
    it('returns frame 0 at time 0', () => {
      const s = makeSprite(3);
      expect(s.frameAt(0, 'pingpong')).toBe(s.frames[0]);
    });

    it('traverses forward then reverse (excluding endpoints)', () => {
      // 3 frames [a, b, c], durations [100, 100, 100]
      // Forward: a(100) b(100) c(100) = 300ms
      // Reverse: b(100) = 100ms (exclude endpoints c and a)
      // Total cycle: 400ms
      const s = makeSprite(3, [100, 100, 100]);

      // Forward pass: 0-99 → frame 0, 100-199 → frame 1, 200-299 → frame 2
      expect(s.frameAt(0, 'pingpong')).toBe(s.frames[0]);
      expect(s.frameAt(50, 'pingpong')).toBe(s.frames[0]);
      expect(s.frameAt(150, 'pingpong')).toBe(s.frames[1]);
      expect(s.frameAt(250, 'pingpong')).toBe(s.frames[2]);

      // Reverse pass: 300-399 → frame 1
      expect(s.frameAt(350, 'pingpong')).toBe(s.frames[1]);

      // Wraps at 400 back to frame 0
      expect(s.frameAt(400, 'pingpong')).toBe(s.frames[0]);
    });

    it('with 2 frames behaves like loop (no reverse middle frames)', () => {
      const s = makeSprite(2, [100, 100]);
      // No middle frames to reverse, so total = 200
      // Forward: a(100) b(100), reverse durations = [] → pingPongTotal = 200
      expect(s.frameAt(0, 'pingpong')).toBe(s.frames[0]);
      expect(s.frameAt(100, 'pingpong')).toBe(s.frames[1]);
      expect(s.frameAt(200, 'pingpong')).toBe(s.frames[0]);
    });

    it('with 4 frames includes middle frames in reverse', () => {
      // 4 frames [a, b, c, d], durations [100, 100, 100, 100]
      // Forward: a(100) b(100) c(100) d(100) = 400ms
      // Reverse (middle): c(100) b(100) = 200ms
      // Total: 600ms
      const s = makeSprite(4, [100, 100, 100, 100]);

      expect(s.frameAt(0, 'pingpong')).toBe(s.frames[0]); // a
      expect(s.frameAt(150, 'pingpong')).toBe(s.frames[1]); // b
      expect(s.frameAt(250, 'pingpong')).toBe(s.frames[2]); // c
      expect(s.frameAt(350, 'pingpong')).toBe(s.frames[3]); // d
      // Reverse: 400-499 → frame 2 (c), 500-599 → frame 1 (b)
      expect(s.frameAt(450, 'pingpong')).toBe(s.frames[2]); // c
      expect(s.frameAt(550, 'pingpong')).toBe(s.frames[1]); // b
      // Wraps
      expect(s.frameAt(600, 'pingpong')).toBe(s.frames[0]); // a
    });
  });
});
