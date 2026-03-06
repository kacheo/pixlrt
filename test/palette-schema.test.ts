import { describe, it, expect } from 'vitest';
import { paletteSchema } from '../src/palette.js';

describe('paletteSchema()', () => {
  it('creates a schema with role names', () => {
    const schema = paletteSchema(['body', 'outline', 'shadow']);
    expect(schema.roles).toEqual(['body', 'outline', 'shadow']);
  });

  it('create() produces a valid PaletteMap', () => {
    const schema = paletteSchema(['body', 'outline']);
    const pal = schema.create({ body: '#ff0000', outline: '#000000' });
    expect(pal['body']).toBe('#ff0000');
    expect(pal['outline']).toBe('#000000');
  });

  it('create() throws on missing roles', () => {
    const schema = paletteSchema(['body', 'outline', 'shadow']);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => schema.create({ body: '#ff0000', outline: '#000000' } as any)).toThrow(
      'Missing palette roles: shadow',
    );
  });

  it('create() throws on extra roles', () => {
    const schema = paletteSchema(['body', 'outline']);
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schema.create({ body: '#ff0000', outline: '#000000', extra: '#ffffff' } as any),
    ).toThrow('Unknown palette roles: extra');
  });

  it('throws on empty roles', () => {
    expect(() => paletteSchema([])).toThrow('at least one role');
  });

  it('throws on duplicate roles', () => {
    expect(() => paletteSchema(['body', 'body'])).toThrow('unique');
  });

  it('accepts RGBA tuples as color values', () => {
    const schema = paletteSchema(['a', 'b']);
    const pal = schema.create({
      a: [255, 0, 0, 255] as [number, number, number, number],
      b: '#00ff00',
    });
    expect(pal['a']).toEqual([255, 0, 0, 255]);
    expect(pal['b']).toBe('#00ff00');
  });
});
