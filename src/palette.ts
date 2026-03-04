import type { ColorInput, PaletteMap, RGBA } from './types.js';
import { parseColor } from './color.js';

/** PICO-8 16-color palette */
const PICO8: RGBA[] = [
  [0, 0, 0, 255], // 0 black
  [29, 43, 83, 255], // 1 dark blue
  [126, 37, 83, 255], // 2 dark purple
  [0, 135, 81, 255], // 3 dark green
  [171, 82, 54, 255], // 4 brown
  [95, 87, 79, 255], // 5 dark grey
  [194, 195, 199, 255], // 6 light grey
  [255, 241, 232, 255], // 7 white
  [255, 0, 77, 255], // 8 red
  [255, 163, 0, 255], // 9 orange
  [255, 236, 39, 255], // a yellow
  [0, 228, 54, 255], // b green
  [41, 173, 255, 255], // c blue
  [131, 118, 156, 255], // d indigo
  [255, 119, 168, 255], // e pink
  [255, 204, 170, 255], // f peach
];

/** GameBoy 4-color palette */
const GAMEBOY: RGBA[] = [
  [15, 56, 15, 255], // 0 darkest
  [48, 98, 48, 255], // 1 dark
  [139, 172, 15, 255], // 2 light
  [155, 188, 15, 255], // 3 lightest
];

/** Sweetie-16 palette */
const SWEETIE16: RGBA[] = [
  [26, 28, 44, 255], // 0
  [93, 39, 93, 255], // 1
  [177, 62, 83, 255], // 2
  [239, 125, 87, 255], // 3
  [255, 205, 117, 255], // 4
  [167, 240, 112, 255], // 5
  [56, 183, 100, 255], // 6
  [37, 113, 121, 255], // 7
  [41, 54, 111, 255], // 8
  [59, 93, 201, 255], // 9
  [65, 166, 246, 255], // a
  [115, 239, 247, 255], // b
  [244, 244, 244, 255], // c
  [148, 176, 194, 255], // d
  [86, 108, 134, 255], // e
  [51, 60, 87, 255], // f
];

/** CGA 4-color palette (mode 4, palette 1, high intensity) */
const CGA: RGBA[] = [
  [0, 0, 0, 255], // 0 black
  [85, 255, 255, 255], // 1 cyan
  [255, 85, 255, 255], // 2 magenta
  [255, 255, 255, 255], // 3 white
];

const PALETTE_CHARS = '.0123456789abcdef';
const HEX_KEYS = '0123456789abcdefghijklmnopqrstuvwxyz';

/** Commodore 64 VIC-II chip palette (16 colors) */
const C64: RGBA[] = [
  [0, 0, 0, 255], // 0 black
  [255, 255, 255, 255], // 1 white
  [136, 0, 0, 255], // 2 red
  [170, 255, 238, 255], // 3 cyan
  [204, 68, 204, 255], // 4 purple
  [0, 204, 85, 255], // 5 green
  [0, 0, 170, 255], // 6 blue
  [238, 238, 119, 255], // 7 yellow
  [221, 136, 85, 255], // 8 orange
  [102, 68, 0, 255], // 9 brown
  [255, 119, 119, 255], // a light red
  [51, 51, 51, 255], // b dark grey
  [119, 119, 119, 255], // c grey
  [170, 255, 102, 255], // d light green
  [0, 136, 255, 255], // e light blue
  [187, 187, 187, 255], // f light grey
];

/** ZX Spectrum palette (15 colors — normal + bright, no duplicate black) */
const ZXSPECTRUM: RGBA[] = [
  [0, 0, 0, 255], // 0 black
  [0, 0, 205, 255], // 1 blue
  [205, 0, 0, 255], // 2 red
  [205, 0, 205, 255], // 3 magenta
  [0, 205, 0, 255], // 4 green
  [0, 205, 205, 255], // 5 cyan
  [205, 205, 0, 255], // 6 yellow
  [205, 205, 205, 255], // 7 white
  [0, 0, 255, 255], // 8 bright blue
  [255, 0, 0, 255], // 9 bright red
  [255, 0, 255, 255], // a bright magenta
  [0, 255, 0, 255], // b bright green
  [0, 255, 255, 255], // c bright cyan
  [255, 255, 0, 255], // d bright yellow
  [255, 255, 255, 255], // e bright white
];

/** NES PPU standard palette (55 colors) */
const NES: RGBA[] = [
  [101, 101, 101, 255],
  [0, 45, 105, 255],
  [19, 31, 127, 255],
  [60, 19, 124, 255],
  [96, 11, 98, 255],
  [115, 10, 55, 255],
  [113, 15, 7, 255],
  [90, 26, 0, 255],
  [52, 40, 0, 255],
  [11, 52, 0, 255],
  [0, 60, 0, 255],
  [0, 61, 16, 255],
  [0, 56, 64, 255],
  [0, 0, 0, 255],
  [174, 174, 174, 255],
  [15, 99, 179, 255],
  [64, 81, 208, 255],
  [120, 65, 204, 255],
  [167, 54, 169, 255],
  [192, 52, 112, 255],
  [189, 60, 48, 255],
  [159, 74, 0, 255],
  [109, 92, 0, 255],
  [54, 109, 0, 255],
  [7, 119, 4, 255],
  [0, 121, 61, 255],
  [0, 114, 125, 255],
  [0, 0, 0, 255],
  [254, 254, 255, 255],
  [93, 179, 255, 255],
  [143, 161, 255, 255],
  [200, 144, 255, 255],
  [247, 133, 250, 255],
  [255, 131, 192, 255],
  [255, 139, 127, 255],
  [239, 154, 73, 255],
  [189, 172, 44, 255],
  [133, 188, 47, 255],
  [85, 199, 83, 255],
  [60, 201, 140, 255],
  [62, 194, 205, 255],
  [78, 78, 78, 255],
  [254, 254, 255, 255],
  [188, 223, 255, 255],
  [209, 216, 255, 255],
  [232, 209, 255, 255],
  [251, 205, 253, 255],
  [255, 204, 229, 255],
  [255, 207, 202, 255],
  [248, 213, 180, 255],
  [228, 220, 168, 255],
  [204, 227, 169, 255],
  [185, 232, 184, 255],
  [174, 232, 208, 255],
  [175, 229, 234, 255],
];

/** Endesga 32 palette by Endesga (32 colors) */
const ENDESGA32: RGBA[] = [
  [190, 74, 47, 255],
  [215, 118, 67, 255],
  [234, 212, 170, 255],
  [228, 166, 114, 255],
  [184, 111, 80, 255],
  [115, 62, 57, 255],
  [62, 39, 49, 255],
  [162, 38, 51, 255],
  [228, 59, 68, 255],
  [247, 118, 34, 255],
  [254, 174, 52, 255],
  [254, 231, 97, 255],
  [99, 199, 77, 255],
  [62, 137, 72, 255],
  [38, 92, 66, 255],
  [25, 60, 62, 255],
  [18, 78, 137, 255],
  [0, 153, 219, 255],
  [44, 232, 245, 255],
  [192, 203, 220, 255],
  [139, 155, 180, 255],
  [90, 105, 136, 255],
  [58, 68, 102, 255],
  [38, 43, 68, 255],
  [24, 20, 37, 255],
  [255, 0, 68, 255],
  [104, 56, 108, 255],
  [181, 80, 136, 255],
  [246, 117, 122, 255],
  [232, 183, 150, 255],
  [194, 133, 105, 255],
  [115, 85, 72, 255],
];

/** Apollo palette by AdamCYounis (16 colors) */
const APOLLO: RGBA[] = [
  [23, 14, 25, 255], // 0
  [35, 25, 66, 255], // 1
  [58, 46, 131, 255], // 2
  [37, 89, 133, 255], // 3
  [46, 133, 110, 255], // 4
  [70, 182, 111, 255], // 5
  [147, 215, 108, 255], // 6
  [235, 248, 184, 255], // 7
  [248, 225, 124, 255], // 8
  [228, 154, 80, 255], // 9
  [198, 98, 67, 255], // a
  [155, 60, 68, 255], // b
  [107, 42, 74, 255], // c
  [91, 83, 93, 255], // d
  [153, 148, 150, 255], // e
  [220, 220, 204, 255], // f
];

/** Resurrect 64 palette by Kerrie Lake (64 colors) */
const RESURRECT64: RGBA[] = [
  [46, 34, 47, 255],
  [62, 53, 70, 255],
  [98, 85, 101, 255],
  [150, 108, 108, 255],
  [171, 148, 122, 255],
  [105, 79, 98, 255],
  [127, 112, 138, 255],
  [155, 171, 178, 255],
  [199, 220, 208, 255],
  [255, 255, 255, 255],
  [155, 227, 175, 255],
  [107, 198, 165, 255],
  [67, 152, 126, 255],
  [40, 111, 112, 255],
  [30, 69, 80, 255],
  [24, 45, 54, 255],
  [27, 30, 40, 255],
  [31, 51, 56, 255],
  [43, 77, 76, 255],
  [57, 110, 90, 255],
  [86, 166, 76, 255],
  [136, 206, 72, 255],
  [192, 231, 75, 255],
  [244, 244, 100, 255],
  [255, 207, 92, 255],
  [255, 168, 68, 255],
  [232, 106, 23, 255],
  [184, 61, 37, 255],
  [124, 44, 37, 255],
  [76, 33, 40, 255],
  [49, 27, 37, 255],
  [106, 41, 51, 255],
  [168, 50, 62, 255],
  [218, 76, 79, 255],
  [236, 127, 88, 255],
  [240, 180, 125, 255],
  [247, 228, 183, 255],
  [226, 193, 155, 255],
  [189, 147, 121, 255],
  [151, 114, 99, 255],
  [112, 76, 74, 255],
  [80, 55, 61, 255],
  [58, 38, 53, 255],
  [84, 44, 83, 255],
  [121, 58, 128, 255],
  [153, 75, 163, 255],
  [183, 107, 181, 255],
  [199, 155, 195, 255],
  [224, 205, 224, 255],
  [195, 157, 203, 255],
  [162, 118, 179, 255],
  [118, 88, 163, 255],
  [71, 62, 131, 255],
  [57, 47, 98, 255],
  [48, 45, 74, 255],
  [56, 55, 97, 255],
  [63, 73, 127, 255],
  [79, 106, 163, 255],
  [108, 152, 195, 255],
  [159, 200, 219, 255],
  [188, 224, 238, 255],
  [155, 197, 227, 255],
  [113, 162, 208, 255],
  [68, 118, 176, 255],
];

/** Virtual Boy 4-color palette (red monochrome) */
const VIRTUALBOY: RGBA[] = [
  [0, 0, 0, 255], // 0 black
  [85, 0, 0, 255], // 1 dark red
  [170, 0, 0, 255], // 2 medium red
  [255, 0, 0, 255], // 3 bright red
];

/** MSX TMS9918 VDP chip palette (15 colors) */
const MSX: RGBA[] = [
  [0, 0, 0, 255], // 0 transparent (black)
  [0, 0, 0, 255], // 1 black
  [33, 200, 66, 255], // 2 medium green
  [94, 220, 120, 255], // 3 light green
  [84, 85, 237, 255], // 4 dark blue
  [125, 118, 252, 255], // 5 light blue
  [212, 82, 77, 255], // 6 dark red
  [66, 235, 245, 255], // 7 cyan
  [252, 85, 84, 255], // 8 medium red
  [255, 121, 120, 255], // 9 light red
  [212, 193, 84, 255], // a dark yellow
  [230, 206, 128, 255], // b light yellow
  [33, 176, 59, 255], // c dark green
  [201, 91, 186, 255], // d magenta
  [204, 204, 204, 255], // e grey
];

/** ENDESGA-16 palette by Endesga (16 colors) */
const ENDESGA16: RGBA[] = [
  [228, 166, 114, 255], // 0
  [184, 111, 80, 255], // 1
  [115, 62, 57, 255], // 2
  [62, 39, 49, 255], // 3
  [162, 38, 51, 255], // 4
  [228, 59, 68, 255], // 5
  [247, 118, 34, 255], // 6
  [254, 174, 52, 255], // 7
  [254, 231, 97, 255], // 8
  [99, 199, 77, 255], // 9
  [62, 137, 72, 255], // a
  [38, 92, 66, 255], // b
  [25, 60, 62, 255], // c
  [18, 78, 137, 255], // d
  [0, 153, 219, 255], // e
  [44, 232, 245, 255], // f
];

/** DawnBringer 16 palette (DB16) */
const DAWNBRINGER16: RGBA[] = [
  [20, 12, 28, 255], // 0
  [68, 36, 52, 255], // 1
  [48, 52, 109, 255], // 2
  [78, 74, 78, 255], // 3
  [133, 76, 48, 255], // 4
  [52, 101, 36, 255], // 5
  [208, 70, 72, 255], // 6
  [117, 113, 97, 255], // 7
  [89, 125, 206, 255], // 8
  [210, 125, 44, 255], // 9
  [133, 149, 161, 255], // a
  [109, 170, 44, 255], // b
  [210, 170, 153, 255], // c
  [109, 194, 202, 255], // d
  [218, 212, 94, 255], // e
  [222, 238, 214, 255], // f
];

/** DawnBringer 32 palette (DB32) */
const DAWNBRINGER32: RGBA[] = [
  [0, 0, 0, 255],
  [34, 32, 52, 255],
  [69, 40, 60, 255],
  [102, 57, 49, 255],
  [143, 86, 59, 255],
  [223, 113, 38, 255],
  [217, 160, 102, 255],
  [238, 195, 154, 255],
  [251, 242, 54, 255],
  [153, 229, 80, 255],
  [106, 190, 48, 255],
  [55, 148, 110, 255],
  [75, 105, 47, 255],
  [82, 75, 36, 255],
  [50, 60, 57, 255],
  [63, 63, 116, 255],
  [48, 96, 130, 255],
  [91, 110, 225, 255],
  [99, 155, 255, 255],
  [95, 205, 228, 255],
  [203, 219, 252, 255],
  [255, 255, 255, 255],
  [155, 173, 183, 255],
  [132, 126, 135, 255],
  [105, 106, 106, 255],
  [89, 86, 82, 255],
  [118, 66, 138, 255],
  [172, 50, 50, 255],
  [217, 87, 99, 255],
  [215, 123, 186, 255],
  [143, 151, 74, 255],
  [138, 111, 48, 255],
];

/** Bubblegum 16 palette by Adam Saltsman */
const BUBBLEGUM16: RGBA[] = [
  [22, 23, 26, 255], // 0
  [57, 49, 75, 255], // 1
  [86, 64, 100, 255], // 2
  [142, 77, 120, 255], // 3
  [206, 108, 131, 255], // 4
  [255, 158, 157, 255], // 5
  [255, 205, 178, 255], // 6
  [255, 241, 232, 255], // 7
  [160, 225, 149, 255], // 8
  [95, 186, 148, 255], // 9
  [61, 139, 148, 255], // a
  [46, 91, 133, 255], // b
  [41, 54, 111, 255], // c
  [129, 174, 210, 255], // d
  [190, 212, 235, 255], // e
  [255, 235, 214, 255], // f
];

/** Oil 6 palette (6 colors) */
const OIL6: RGBA[] = [
  [40, 27, 35, 255], // 0
  [92, 46, 62, 255], // 1
  [163, 93, 92, 255], // 2
  [212, 168, 124, 255], // 3
  [194, 216, 165, 255], // 4
  [246, 244, 228, 255], // 5
];

/** SLSO8 palette (8 colors) */
const SLSO8: RGBA[] = [
  [13, 43, 69, 255], // 0
  [32, 60, 86, 255], // 1
  [84, 78, 104, 255], // 2
  [141, 105, 122, 255], // 3
  [208, 129, 89, 255], // 4
  [255, 170, 94, 255], // 5
  [255, 212, 163, 255], // 6
  [255, 246, 214, 255], // 7
];

/** Ammo-8 palette (8 colors) */
const AMMO8: RGBA[] = [
  [4, 4, 4, 255], // 0
  [48, 52, 109, 255], // 1
  [78, 74, 78, 255], // 2
  [52, 101, 164, 255], // 3
  [136, 192, 112, 255], // 4
  [218, 212, 94, 255], // 5
  [237, 195, 154, 255], // 6
  [255, 255, 255, 255], // 7
];

/** 1-Bit Monitor Glow palette by Polyducks (2 colors) */
const ONEBIT: RGBA[] = [
  [34, 35, 35, 255], // 0 dark
  [31, 255, 48, 255], // 1 phosphor green
];

/** Nord Arctic color scheme (16 colors) */
const NORD: RGBA[] = [
  [46, 52, 64, 255], // 0 nord0  polar night
  [59, 66, 82, 255], // 1 nord1
  [67, 76, 94, 255], // 2 nord2
  [76, 86, 106, 255], // 3 nord3
  [216, 222, 233, 255], // 4 nord4  snow storm
  [229, 233, 240, 255], // 5 nord5
  [236, 239, 244, 255], // 6 nord6
  [143, 188, 187, 255], // 7 nord7  frost
  [136, 192, 208, 255], // 8 nord8
  [129, 161, 193, 255], // 9 nord9
  [94, 129, 172, 255], // a nord10
  [191, 97, 106, 255], // b nord11 aurora
  [208, 135, 112, 255], // c nord12
  [235, 203, 139, 255], // d nord13
  [163, 190, 140, 255], // e nord14
  [180, 142, 173, 255], // f nord15
];

/** Gruvbox warm retro theme (16 colors) */
const GRUVBOX: RGBA[] = [
  [40, 40, 40, 255], // 0 bg
  [204, 36, 29, 255], // 1 red
  [152, 151, 26, 255], // 2 green
  [215, 153, 33, 255], // 3 yellow
  [69, 133, 136, 255], // 4 blue
  [177, 98, 134, 255], // 5 purple
  [104, 157, 106, 255], // 6 aqua
  [235, 219, 178, 255], // 7 fg
  [146, 131, 116, 255], // 8 grey
  [251, 73, 52, 255], // 9 bright red
  [184, 187, 38, 255], // a bright green
  [250, 189, 47, 255], // b bright yellow
  [131, 165, 152, 255], // c bright blue
  [211, 134, 155, 255], // d bright purple
  [142, 192, 124, 255], // e bright aqua
  [253, 244, 193, 255], // f bright fg
];

/** Solarized precision color scheme (16 colors) */
const SOLARIZED: RGBA[] = [
  [0, 43, 54, 255], // 0 base03
  [7, 54, 66, 255], // 1 base02
  [88, 110, 117, 255], // 2 base01
  [101, 123, 131, 255], // 3 base00
  [131, 148, 150, 255], // 4 base0
  [147, 161, 161, 255], // 5 base1
  [238, 232, 213, 255], // 6 base2
  [253, 246, 227, 255], // 7 base3
  [181, 137, 0, 255], // 8 yellow
  [203, 75, 22, 255], // 9 orange
  [220, 50, 47, 255], // a red
  [211, 54, 130, 255], // b magenta
  [108, 113, 196, 255], // c violet
  [38, 139, 210, 255], // d blue
  [42, 161, 152, 255], // e cyan
  [133, 153, 0, 255], // f green
];

/** Dracula dark theme (8 colors) */
const DRACULA: RGBA[] = [
  [40, 42, 54, 255], // 0 background
  [68, 71, 90, 255], // 1 current line
  [248, 248, 242, 255], // 2 foreground
  [139, 233, 253, 255], // 3 cyan
  [80, 250, 123, 255], // 4 green
  [255, 184, 108, 255], // 5 orange
  [255, 121, 198, 255], // 6 pink
  [189, 147, 249, 255], // 7 purple
];

/** All built-in palettes */
export const PALETTES: Record<string, RGBA[]> = {
  pico8: PICO8,
  gameboy: GAMEBOY,
  sweetie16: SWEETIE16,
  cga: CGA,
  c64: C64,
  zxspectrum: ZXSPECTRUM,
  nes: NES,
  endesga32: ENDESGA32,
  apollo: APOLLO,
  resurrect64: RESURRECT64,
  virtualboy: VIRTUALBOY,
  msx: MSX,
  endesga16: ENDESGA16,
  dawnbringer16: DAWNBRINGER16,
  dawnbringer32: DAWNBRINGER32,
  bubblegum16: BUBBLEGUM16,
  oil6: OIL6,
  slso8: SLSO8,
  ammo8: AMMO8,
  '1bit': ONEBIT,
  nord: NORD,
  gruvbox: GRUVBOX,
  solarized: SOLARIZED,
  dracula: DRACULA,
};

/**
 * Create a PaletteMap from a named built-in palette.
 * Maps '.' to transparent, then '0'-'9', 'a'-'f' for ≤16 colors,
 * or '0'-'9', 'a'-'z' for >16 colors (up to 36 mappable).
 */
export function paletteFrom(name: string): PaletteMap {
  const colors = PALETTES[name.toLowerCase()];
  if (!colors) {
    throw new Error(`Unknown palette: "${name}". Available: ${Object.keys(PALETTES).join(', ')}`);
  }

  const keys = colors.length > 16 ? HEX_KEYS : PALETTE_CHARS.slice(1);
  const map: PaletteMap = { '.': 'transparent' };
  const limit = Math.min(colors.length, keys.length);
  for (let i = 0; i < limit; i++) {
    map[keys[i]!] = colors[i]!;
  }
  return map;
}

/**
 * Create a PaletteMap from an array of hex color strings.
 * Auto-assigns single-char keys: '.' → transparent, '0'-'9', 'a'-'z' for up to 36 colors.
 */
export function paletteFromHex(hexColors: string[]): PaletteMap {
  if (hexColors.length > 36) {
    throw new Error(
      `paletteFromHex supports at most 36 colors (0-9, a-z), got ${hexColors.length}`,
    );
  }

  const map: PaletteMap = { '.': 'transparent' };
  for (let i = 0; i < hexColors.length; i++) {
    const hex = hexColors[i]!;
    const color = parseColor(hex.startsWith('#') ? hex : `#${hex}`);
    map[HEX_KEYS[i]!] = color;
  }
  return map;
}

/** A validated palette with named roles */
export interface PaletteSchema<R extends string = string> {
  /** The role names in this schema */
  readonly roles: readonly R[];
  /** Create a validated PaletteMap from a mapping of role → color. Throws if any role is missing or extra. */
  create(mapping: Record<R, ColorInput>): PaletteMap;
}

/**
 * Create a PaletteSchema that validates all named roles are present when creating palettes.
 * Useful for ensuring consistent color sets across related sprites.
 */
export function paletteSchema<R extends string>(roles: readonly R[]): PaletteSchema<R> {
  if (roles.length === 0) {
    throw new Error('paletteSchema requires at least one role');
  }
  const uniqueRoles = [...new Set(roles)];
  if (uniqueRoles.length !== roles.length) {
    throw new Error('paletteSchema roles must be unique');
  }

  return {
    roles,
    create(mapping: Record<R, ColorInput>): PaletteMap {
      const provided = Object.keys(mapping);
      const missing = uniqueRoles.filter((r) => !(r in mapping));
      if (missing.length > 0) {
        throw new Error(`Missing palette roles: ${missing.join(', ')}`);
      }
      const extra = provided.filter((k) => !uniqueRoles.includes(k as R));
      if (extra.length > 0) {
        throw new Error(`Unknown palette roles: ${extra.join(', ')}`);
      }

      // Return a PaletteMap keyed by role names
      const map: PaletteMap = {};
      for (const role of uniqueRoles) {
        map[role] = mapping[role];
      }
      return map;
    },
  };
}
