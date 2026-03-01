import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { paletteFrom, paletteFromHex, paletteFromFile, PALETTES } from '../src/palette.js';

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
    expect(map['0']).toEqual([0, 0, 0, 255]); // black
    expect(map['8']).toEqual([255, 0, 77, 255]); // red
    expect(map['f']).toEqual([255, 204, 170, 255]); // peach

    const gb = paletteFrom('gameboy');
    expect(gb['0']).toEqual([15, 56, 15, 255]); // darkest
    expect(gb['3']).toEqual([155, 188, 15, 255]); // lightest
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
      expect.arrayContaining(['pico8', 'gameboy', 'sweetie16', 'cga']),
    );
    expect(Object.keys(PALETTES).length).toBe(4);
  });
});

describe('paletteFromHex()', () => {
  it('creates palette from hex strings', () => {
    const map = paletteFromHex(['ff0000', '00ff00', '0000ff']);
    expect(map['.']).toBe('transparent');
    expect(map['0']).toEqual([255, 0, 0, 255]);
    expect(map['1']).toEqual([0, 255, 0, 255]);
    expect(map['2']).toEqual([0, 0, 255, 255]);
  });

  it('accepts hex strings with # prefix', () => {
    const map = paletteFromHex(['#ff0000']);
    expect(map['0']).toEqual([255, 0, 0, 255]);
  });

  it('assigns keys 0-9 then a-z', () => {
    const colors = Array.from({ length: 12 }, (_, i) =>
      i.toString(16).padStart(2, '0').repeat(3),
    );
    const map = paletteFromHex(colors);
    expect(map).toHaveProperty('0');
    expect(map).toHaveProperty('9');
    expect(map).toHaveProperty('a');
    expect(map).toHaveProperty('b');
  });

  it('throws if more than 36 colors', () => {
    const colors = Array.from({ length: 37 }, () => 'ff0000');
    expect(() => paletteFromHex(colors)).toThrow('36');
  });

  it('throws on invalid hex (non-hex format)', () => {
    expect(() => paletteFromHex(['not a color'])).toThrow();
  });
});

describe('paletteFromFile()', () => {
  function writeTmpFile(ext: string, content: string): string {
    const filePath = path.join(os.tmpdir(), `test-palette-${Date.now()}${ext}`);
    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  it('parses .hex file', () => {
    const filePath = writeTmpFile('.hex', 'ff0000\n00ff00\n0000ff\n');
    const map = paletteFromFile(filePath);
    expect(map['.']).toBe('transparent');
    expect(map['0']).toEqual([255, 0, 0, 255]);
    expect(map['1']).toEqual([0, 255, 0, 255]);
    expect(map['2']).toEqual([0, 0, 255, 255]);
    fs.unlinkSync(filePath);
  });

  it('parses .gpl file', () => {
    const content = [
      'GIMP Palette',
      'Name: Test',
      '#',
      '255   0   0\tRed',
      '  0 255   0\tGreen',
      '  0   0 255\tBlue',
    ].join('\n');
    const filePath = writeTmpFile('.gpl', content);
    const map = paletteFromFile(filePath);
    expect(map['0']).toEqual([255, 0, 0, 255]);
    expect(map['1']).toEqual([0, 255, 0, 255]);
    expect(map['2']).toEqual([0, 0, 255, 255]);
    fs.unlinkSync(filePath);
  });

  it('skips comment and header lines in .gpl', () => {
    const content = [
      'GIMP Palette',
      '# This is a comment',
      'Name: MyPalette',
      'Columns: 4',
      '128 128 128',
    ].join('\n');
    const filePath = writeTmpFile('.gpl', content);
    const map = paletteFromFile(filePath);
    expect(Object.keys(map).length).toBe(2); // '.' + '0'
    expect(map['0']).toEqual([128, 128, 128, 255]);
    fs.unlinkSync(filePath);
  });

  it('throws on unsupported extension', () => {
    const filePath = writeTmpFile('.txt', 'ff0000');
    expect(() => paletteFromFile(filePath)).toThrow('Unsupported palette file extension');
    fs.unlinkSync(filePath);
  });
});
