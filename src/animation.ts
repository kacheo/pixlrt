import { Sprite } from './sprite.js';

/**
 * Reverse the frame order of a sprite.
 * Single-frame sprites return a clone.
 */
export function reverseFrames(sprite: Sprite): Sprite {
  return new Sprite({
    name: sprite.name,
    frames: [...sprite.frames].reverse(),
    palette: sprite.palette,
    origin: sprite.origin,
    frameDuration: [...sprite.frameDuration].reverse(),
  });
}

/**
 * Produce a ping-pong sequence: [0, 1, …, n-1, n-2, …, 1].
 * For ≤2 frames, returns a clone (no interior frames to mirror).
 */
export function pingPong(sprite: Sprite): Sprite {
  if (sprite.frames.length <= 2) {
    return new Sprite({
      name: sprite.name,
      frames: [...sprite.frames],
      palette: sprite.palette,
      origin: sprite.origin,
      frameDuration: [...sprite.frameDuration],
    });
  }

  const frames = [...sprite.frames, ...sprite.frames.slice(1, -1).reverse()];
  const durations = [...sprite.frameDuration, ...sprite.frameDuration.slice(1, -1).reverse()];

  return new Sprite({
    name: sprite.name,
    frames,
    palette: sprite.palette,
    origin: sprite.origin,
    frameDuration: durations,
  });
}

/**
 * Select frames by index array. Supports reordering and duplicates.
 * Throws on empty array or out-of-range index.
 */
export function pickFrames(sprite: Sprite, indices: number[]): Sprite {
  if (indices.length === 0) {
    throw new Error('indices array must not be empty');
  }

  const frames = indices.map((i) => {
    if (i < 0 || i >= sprite.frames.length) {
      throw new Error(`Frame index ${i} out of range (0-${sprite.frames.length - 1})`);
    }
    return sprite.frames[i]!;
  });

  const durations = indices.map((i) => sprite.frameDuration[i]!);

  return new Sprite({
    name: sprite.name,
    frames,
    palette: sprite.palette,
    origin: sprite.origin,
    frameDuration: durations,
  });
}

/**
 * Set frame durations. Single number applies to all frames.
 * Array must match frame count.
 */
export function setDuration(sprite: Sprite, duration: number | number[]): Sprite {
  let durations: number[];

  if (typeof duration === 'number') {
    durations = new Array(sprite.frames.length).fill(duration);
  } else {
    if (duration.length !== sprite.frames.length) {
      throw new Error(
        `Duration array length (${duration.length}) must match frame count (${sprite.frames.length})`,
      );
    }
    durations = [...duration];
  }

  return new Sprite({
    name: sprite.name,
    frames: [...sprite.frames],
    palette: sprite.palette,
    origin: sprite.origin,
    frameDuration: durations,
  });
}
