import { describe, it, expect } from 'vitest';
import { paletteFrom, PALETTES } from '../src/palette.js';

describe('paletteFrom()', () => {
  it('pico8 returns 17 entries (. + 0-f)', () => {
    const map = paletteFrom('pico8');
    expect(Object.keys(map).length).toBe(17);
  });

  it('gameboy returns 5 entries (. + 0-3)', () => {
    const map = paletteFrom('gameboy');
    expect(Object.keys(map).length).toBe(5);
  });

  it('sweetie16 returns 17 entries', () => {
    const map = paletteFrom('sweetie16');
    expect(Object.keys(map).length).toBe(17);
  });

  it('cga returns 5 entries', () => {
    const map = paletteFrom('cga');
    expect(Object.keys(map).length).toBe(5);
  });

  it('"." always maps to transparent', () => {
    for (const name of Object.keys(PALETTES)) {
      const map = paletteFrom(name);
      expect(map['.']).toBe('transparent');
    }
  });

  it('character keys match 0-f ordering', () => {
    const map = paletteFrom('pico8');
    const chars = '0123456789abcdef';
    for (const ch of chars) {
      expect(map).toHaveProperty(ch);
    }
  });

  it('color values match expected RGBA tuples', () => {
    const map = paletteFrom('pico8');
    expect(map['0']).toEqual([0, 0, 0, 255]);       // black
    expect(map['8']).toEqual([255, 0, 77, 255]);     // red
    expect(map['f']).toEqual([255, 204, 170, 255]);  // peach

    const gb = paletteFrom('gameboy');
    expect(gb['0']).toEqual([15, 56, 15, 255]);      // darkest
    expect(gb['3']).toEqual([155, 188, 15, 255]);    // lightest
  });

  it('is case-insensitive', () => {
    const lower = paletteFrom('pico8');
    const upper = paletteFrom('PICO8');
    const mixed = paletteFrom('Pico8');
    expect(upper).toEqual(lower);
    expect(mixed).toEqual(lower);
  });

  it('throws on unknown palette name', () => {
    expect(() => paletteFrom('nosuch')).toThrow('Unknown palette');
    expect(() => paletteFrom('nosuch')).toThrow('nosuch');
  });
});

describe('PALETTES', () => {
  it('has all four named palettes', () => {
    expect(Object.keys(PALETTES)).toEqual(
      expect.arrayContaining(['pico8', 'gameboy', 'sweetie16', 'cga'])
    );
    expect(Object.keys(PALETTES).length).toBe(4);
  });
});
