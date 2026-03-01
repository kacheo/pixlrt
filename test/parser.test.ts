import { describe, it, expect } from 'vitest';
import { parseGrid, parseFrames } from '../src/parser.js';

const palette = {
  '.': 'transparent',
  'x': '#ff0000',
  'o': '#0000ff',
};

describe('parseGrid', () => {
  it('parses a simple grid', () => {
    const grid = parseGrid('xo\nox', palette);
    expect(grid.length).toBe(2);
    expect(grid[0]!.length).toBe(2);
    expect(grid[0]![0]).toEqual([255, 0, 0, 255]);
    expect(grid[0]![1]).toEqual([0, 0, 255, 255]);
    expect(grid[1]![0]).toEqual([0, 0, 255, 255]);
    expect(grid[1]![1]).toEqual([255, 0, 0, 255]);
  });

  it('handles template literal with leading/trailing blank lines', () => {
    const grid = parseGrid(`
      x.
      .x
    `, palette);
    expect(grid.length).toBe(2);
    expect(grid[0]![0]).toEqual([255, 0, 0, 255]);
    expect(grid[0]![1]).toEqual([0, 0, 0, 0]); // transparent
    expect(grid[1]![0]).toEqual([0, 0, 0, 0]);
    expect(grid[1]![1]).toEqual([255, 0, 0, 255]);
  });

  it('pads shorter lines with transparent', () => {
    const grid = parseGrid('xo\nx', palette);
    expect(grid[0]!.length).toBe(2);
    expect(grid[1]!.length).toBe(2);
    expect(grid[1]![1]).toEqual([0, 0, 0, 0]);
  });

  it('treats spaces as transparent when not in palette', () => {
    const grid = parseGrid('x x', palette);
    expect(grid[0]![1]).toEqual([0, 0, 0, 0]);
  });

  it('throws on unknown character', () => {
    expect(() => parseGrid('xzy', palette)).toThrow("Unknown palette character 'z'");
    expect(() => parseGrid('xzy', palette)).toThrow('row 1, col 2');
  });

  it('throws on empty grid', () => {
    expect(() => parseGrid('', palette)).toThrow('Empty grid');
    expect(() => parseGrid('   \n   ', palette)).toThrow('Empty grid');
  });
});

describe('parseFrames', () => {
  it('parses multiple frames', () => {
    const frames = parseFrames(['xo\nox', 'ox\nxo'], palette);
    expect(frames.length).toBe(2);
    expect(frames[0]![0]![0]).toEqual([255, 0, 0, 255]);
    expect(frames[1]![0]![0]).toEqual([0, 0, 255, 255]);
  });

  it('throws on dimension mismatch', () => {
    expect(() => parseFrames(['xo\nox', 'x\no'], palette)).toThrow("don't match");
  });

  it('throws on empty frames array', () => {
    expect(() => parseFrames([], palette)).toThrow('At least one frame');
  });
});
