# pixlrt

Programmatic pixel art framework for TypeScript. Define sprites as ASCII grids, transform them, and export to PNG/SVG/sprite sheets.

## Commands

- `npm run build` — build with tsup (outputs to `dist/`)
- `npm test` — run tests with Vitest
- `npm run test:watch` — run tests in watch mode

## Project Structure

```
src/           — source code (entry point: src/index.ts)
test/          — Vitest test files
examples/      — example scripts and their generated output
```

## Architecture

- **`Renderable` interface** — core abstraction: `{ width, height, getPixel(x, y) }`. Sprites, frames, composers, and tilesets all implement it.
- **Factory functions** — `sprite()`, `tileset()`, `compose()` create instances from config objects.
- **Immutable transforms** — `flipX`, `flipY`, `rotate`, `scale`, `recolor` on Sprite return new instances.
- **Renderers** — `toPNG()`, `toSVG()`, `toSpriteSheet()` take a Renderable + output path.
- **Frame** — wraps a `PixelGrid` (2D RGBA array). Sprites contain one or more Frames.
- **PixelCanvas** — mutable pixel buffer for composition; implements Renderable.

## Key Files

- `src/types.ts` — all type definitions (RGBA, PaletteMap, SpriteConfig, Renderable, etc.)
- `src/sprite.ts` — Sprite class and `sprite()` factory
- `src/compose.ts` — Composer class for layering renderables
- `src/tileset.ts` — Tileset class for tile-based scenes
- `src/palette.ts` — built-in palettes (pico8, gameboy, sweetie16, cga) and `paletteFrom()`
- `src/render/` — PNG, SVG, and sprite sheet renderers

## Conventions

- Strict TypeScript with ESM
- Use `.js` extensions in all relative imports (required for ESM)
- Vitest for testing — test files mirror source: `test/<module>.test.ts`
- Generated files (PNGs, SVGs) go in `examples/` — not committed to git
- Only runtime dependency: `pngjs`
