# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### M1: Code Quality & Developer Experience

- ESLint and Prettier configuration for consistent code style
- Vitest test coverage reporting

#### M2: Transforms

- `pad()` and `crop()` transform functions
- `opacity()` transform for alpha blending
- `outline()` transform for sprite outlines
- `ninePatch()` for scalable UI elements

#### M3: Tilemap Scene Builder

- Tileset layers and tile index support
- Tiled JSON export for map editor interop

#### M4: Import & Interop

- `fromPNG()` for importing existing PNG images
- `fromSpriteSheet()` for extracting frames from sprite sheets
- `quantize()` for reducing color palettes
- Palette conversion utilities

#### M5: Animation & GIF Export

- Animation utilities and frame sequencing
- GIF export support
- Game engine output formats: atlas, engine metadata, multiscale, collision masks

#### M6: Sprite Sheets & APNG

- `frameAt()` for frame-based animation access
- Tagged sprite sheet export
- APNG (animated PNG) export

#### M7: Cross-Platform Rendering

- Split entry points: `pixlrt/core` (browser-safe) and `pixlrt/node` (Node.js with file I/O)
- All renderers available without Node.js dependencies in core bundle

#### M8: Palettes & Color Tools

- `toHex()`, `mix()`, `saturate()`, `desaturate()` color utilities
- 6 retro palettes: pico8, gameboy, sweetie16, cga, nes, commodore64
- `paletteSwatch()` for palette preview rendering

#### M9: Browser Rendering

- `toCanvas()` for rendering to HTML Canvas elements
- `renderToCanvas()` for direct canvas context rendering

#### M10: Game Sprite Workflows

- Sprite templates for common game character layouts
- Row patching for efficient sprite sheet editing
- `shift()` transform for position adjustments
- `silhouette()` for generating sprite silhouettes
- Slot-based animation system
- Palette schema validation
