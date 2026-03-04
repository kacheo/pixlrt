import { sprite, Sprite, tileset, paletteFrom, compose, renderToCanvas, PALETTES, toHex,
  template, pingPong, lighten, darken, mix } from 'pixlrt/core';
import type { RGBA } from 'pixlrt/core';

const editor = document.getElementById('code-editor') as HTMLTextAreaElement;
const canvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
const scaleSelect = document.getElementById('scale-select') as HTMLSelectElement;
const errorOverlay = document.getElementById('error-overlay') as HTMLDivElement;

const DEFAULT_CODE = `sprite({
  name: 'example',
  palette: {
    '.': 'transparent',
    'x': '#1a1c2c', // outline
    'r': '#b13e53', // red
    'w': '#f4f4f4', // white
  },
  frames: [
    \`
    .xxxx.
    xrrrrx
    xwwwwx
    xrrrrx
    .xxxx.
    \`
  ]
})`;

// ---- Animation helpers ----
let activeAnimationId: number | null = null;

function stopAnimation() {
  if (activeAnimationId !== null) {
    cancelAnimationFrame(activeAnimationId);
    activeAnimationId = null;
  }
}

function startAnimation(spr: Sprite, targetCanvas: HTMLCanvasElement, scale: number) {
  stopAnimation();
  const startTime = performance.now();
  function tick() {
    const elapsed = performance.now() - startTime;
    const frame = spr.frameAt(elapsed, 'loop');
    renderToCanvas(frame, targetCanvas, { scale });
    activeAnimationId = requestAnimationFrame(tick);
  }
  activeAnimationId = requestAnimationFrame(tick);
}

function animateCanvas(spr: Sprite, cvs: HTMLCanvasElement, scale: number) {
  const start = performance.now();
  function tick() {
    renderToCanvas(spr.frameAt(performance.now() - start, 'loop'), cvs, { scale });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function safelyEvaluateSprite(code: string) {
  try {
    const evaluate = new Function(
      'sprite', 'tileset', 'paletteFrom', 'compose',
      'template', 'pingPong', 'lighten', 'darken', 'mix',
      `return ${code}`
    );
    return evaluate(sprite, tileset, paletteFrom, compose,
      template, pingPong, lighten, darken, mix);
  } catch (err) {
    throw err;
  }
}

function updatePreview() {
  const code = editor.value;
  try {
    const scale = parseInt(scaleSelect.value, 10);
    const resultSprite = safelyEvaluateSprite(code);

    // Clear previous errors
    errorOverlay.textContent = '';
    errorOverlay.classList.add('hidden');

    // Render (animate multi-frame sprites)
    stopAnimation();
    if (resultSprite instanceof Sprite && resultSprite.frames.length > 1) {
      startAnimation(resultSprite, canvas, scale);
    } else {
      renderToCanvas(resultSprite, canvas, { scale });
    }
  } catch (err: any) {
    console.error(err);
    errorOverlay.textContent = err.message || 'Error parsing sprite definition';
    errorOverlay.classList.remove('hidden');
  }
}

editor.addEventListener('input', updatePreview);
scaleSelect.addEventListener('change', updatePreview);

// ---- Background mode toggle ----
const bgToggle = document.getElementById('bg-toggle') as HTMLButtonElement;
const storedMode = localStorage.getItem('pixlrt-bg-mode');
if (storedMode === 'light') {
  document.body.classList.add('bg-light');
  bgToggle.textContent = 'Light';
}
bgToggle.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('bg-light');
  bgToggle.textContent = isLight ? 'Light' : 'Dark';
  localStorage.setItem('pixlrt-bg-mode', isLight ? 'light' : 'dark');
});

// Initialize
editor.value = DEFAULT_CODE;
updatePreview();

// Reset button
document.getElementById('reset-btn')?.addEventListener('click', () => {
  editor.value = DEFAULT_CODE;
  updatePreview();
});

// Format button — simple indentation normalizer
document.getElementById('format-btn')?.addEventListener('click', () => {
  const code = editor.value;
  try {
    // Try to parse and re-serialize the code structure
    // We do basic formatting: normalize indentation and spacing
    let formatted = code;
    // Normalize line endings
    formatted = formatted.replace(/\r\n/g, '\n');
    // Remove trailing whitespace per line
    formatted = formatted.replace(/[ \t]+$/gm, '');
    // Collapse multiple blank lines into one
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    // Trim leading/trailing whitespace
    formatted = formatted.trim();
    editor.value = formatted;
    updatePreview();
  } catch {
    // If formatting fails, just leave the code as-is
  }
});

// Render the logo
const logoCanvas = document.getElementById('logo-canvas') as HTMLCanvasElement;
if (logoCanvas) {
  const logoSprite = sprite({
    name: 'logo',
    palette: { '.': 'transparent', p: '#3b5dc9', i: '#b13e53', x: '#1a1c2c' },
    frames: [
      `
            .px.
            pxxp
            .px.
            ixxi
            `,
    ],
  });
  renderToCanvas(logoSprite, logoCanvas, { scale: 8 });
}

// ---- Tab switching ----
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => {
      c.classList.remove('active-tab');
      c.classList.add('hidden-tab');
    });
    btn.classList.add('active');
    const targetId = btn.getAttribute('data-target');
    const targetEl = document.getElementById(targetId!);
    if (targetEl) {
      targetEl.classList.remove('hidden-tab');
      targetEl.classList.add('active-tab');
    }
  });
});

// ---- Examples ----
interface Example {
  name: string;
  description: string;
  code: string;
}

const examples: Example[] = [
  {
    name: 'Armored Knight',
    description: 'Character with sword, shield, and armor',
    code: `sprite({
  name: 'knight',
  palette: {
    '.': 'transparent',
    'x': '#1a1c2c',
    'h': '#5d275d',
    'f': '#f4f4f4',
    'a': '#94a3b8',
    's': '#3b5dc9',
    'w': '#e2e8f0',
    'g': '#b13e53',
  },
  frames: [\`
    ...xhhx...
    ..xhhhhx..
    ..xfxxfx..
    ...xffx...
    .xxaaaxx..
    xssxaaxwx.
    xssxaaxwx.
    .xxaaaxxgx
    ...xaax...
    ..xx..xx..
    ..xa..ax..
    ..xx..xx..
  \`]
})`,
  },
  {
    name: 'Gameboy Style',
    description: 'Using paletteFrom() with built-in palettes',
    code: `sprite({
  name: 'gb-face',
  palette: paletteFrom('gameboy'),
  frames: [\`
    ..1111..
    .122221.
    12233221
    12233221
    12222221
    12300321
    .122221.
    ..1111..
  \`]
})`,
  },
  {
    name: 'Animation',
    description: 'Multi-frame sprite with animation',
    code: `sprite({
  name: 'blinker',
  frameDuration: 400,
  palette: {
    '.': 'transparent',
    'x': '#1a1c2c',
    'w': '#f4f4f4',
    'r': '#b13e53',
  },
  frames: [
    \`
    .xxxx.
    xwrrwx
    xrrrrx
    .xxxx.
    \`,
    \`
    .xxxx.
    xxxxxr
    xrrrrx
    .xxxx.
    \`,
  ]
})`,
  },
  {
    name: 'Tileset Scene',
    description: 'Tile-based scene composition',
    code: `tileset({
  name: 'forest',
  palette: {
    '.': 'transparent',
    'g': '#38b764',
    'd': '#257953',
    'b': '#5d275d',
    's': '#a7f070',
  },
  tileSize: 4,
  tiles: {
    G: \`
      sgsg
      gsgs
      sgsg
      gsgs
    \`,
    T: \`
      .dd.
      dddd
      .bb.
      .bb.
    \`,
  },
  scene: \`
    GTGTG
    TGGGT
    GGGGG
  \`,
})`,
  },
  {
    name: 'Compose Layers',
    description: 'Layering sprites with compose()',
    code: `compose()
  .place(sprite({
    name: 'bg',
    palette: { '.': '#29366f' },
    frames: [\`
      ........
      ........
      ........
      ........
      ........
      ........
    \`]
  }), {x:0, y:0})
  .place(sprite({
    name: 'star',
    palette: { '.': 'transparent', '*': '#ffcd75' },
    frames: [\`
      ..*..
      .***.
      *****
      .***.
      ..*..
    \`]
  }), {x:1, y:0})
  .render()`,
  },
  {
    name: 'Transforms',
    description: 'flipX(), flipY() and rotate(90)',
    code: `(() => {
  const s = sprite({
    name: 'boot',
    palette: { '.': 'transparent', 'x': '#1a1c2c', 'b': '#5d275d', 'l': '#94a3b8' },
    frames: [\`
      ..xb..
      ..xb..
      ..xb..
      .xlb..
      .xlbbxx
      .xllbxx
    \`]
  });
  return compose()
    .place(s, {x:0, y:0})
    .place(s.flipX(), {x:9, y:0})
    .place(s.flipY(), {x:18, y:0})
    .place(s.rotate(90), {x:27, y:0})
    .render();
})()`,
  },
  {
    name: 'Recolor',
    description: 'Palette-swap gems with recolor()',
    code: `(() => {
  const gem = sprite({
    name: 'gem',
    palette: { '.': 'transparent', 'o': '#1a1c2c', 'g': '#b13e53', 's': '#f4f4f4' },
    frames: [\`
      ..o..
      .ogo.
      ogsgo
      ogsgo
      .ogo.
      ..o..
    \`]
  });
  return compose()
    .place(gem, {x:0, y:0})
    .place(gem.recolor({ g: '#3b82f6', s: '#93c5fd' }), {x:7, y:0})
    .place(gem.recolor({ g: '#22c55e', s: '#86efac' }), {x:14, y:0})
    .render();
})()`,
  },
  {
    name: 'Outline Glow',
    description: 'Add a colored outline border',
    code: `sprite({
  name: 'star',
  palette: { '.': 'transparent', 'x': '#1a1c2c', 'y': '#ffcd75' },
  frames: [\`
    ..x..
    .xyx.
    xyxyx
    .xyx.
    ..x..
  \`]
}).outline('#ff6b6b')`,
  },
  {
    name: 'Silhouette',
    description: 'Shadow/ghost effect with silhouette()',
    code: `(() => {
  const knight = sprite({
    name: 'knight',
    palette: { '.': 'transparent', 'x': '#1a1c2c', 'a': '#94a3b8', 'r': '#b13e53' },
    frames: [\`
      ..xx..
      .xaax.
      xaaaax
      .xrrx.
      .xaax.
      .x..x.
    \`]
  });
  return compose()
    .place(knight.silhouette('#1a1c2c44'), {x:2, y:1})
    .place(knight, {x:0, y:0})
    .render();
})()`,
  },
  {
    name: 'Sprite Template',
    description: 'Reusable template with fill() variants',
    code: `(() => {
  const char = template({
    name: 'character',
    slots: { O: 'outline', H: 'hair', S: 'skin', B: 'body' },
    frames: [\`
      ..OO..
      .OHHO.
      OHSSHO
      .OSSO.
      .OBBO.
      OB..BO
    \`]
  });
  return compose()
    .place(char.fill({ outline:'#1a1c2c', hair:'#b13e53', skin:'#f4f4f4', body:'#3b5dc9' }), {x:0, y:0})
    .place(char.fill({ outline:'#1a1c2c', hair:'#ffcd75', skin:'#c28569', body:'#38b764' }), {x:8, y:0})
    .place(char.fill({ outline:'#1a1c2c', hair:'#a855f7', skin:'#fbbf24', body:'#6366f1' }), {x:16, y:0})
    .render();
})()`,
  },
  {
    name: 'Slot Animation',
    description: 'Color-cycling keyframes with animateSlots()',
    code: `template({
  name: 'traffic-light',
  slots: { F: 'frame', T: 'top', M: 'mid', B: 'bottom' },
  frames: [\`
    .FF.
    FTTF
    FMMF
    FBBF
    .FF.
  \`]
}).animateSlots({
  base: { frame: '#333333', top: '#661111', mid: '#665511', bottom: '#116633' },
  keyframes: [
    { top: '#ff4444' },
    { mid: '#ffcc00' },
    { bottom: '#44ff44' },
  ],
  frameDuration: 800,
})`,
  },
  {
    name: 'PingPong Loop',
    description: 'Smooth bounce reversal with pingPong()',
    code: `pingPong(sprite({
  name: 'bounce',
  frameDuration: 120,
  palette: { '.': 'transparent', 'x': '#1a1c2c', 'r': '#b13e53' },
  frames: [
    \`
    ..xx..
    .xrrx.
    .xrrx.
    ..xx..
    ......
    ......
    \`,
    \`
    ......
    ..xx..
    .xrrx.
    .xrrx.
    ..xx..
    ......
    \`,
    \`
    ......
    ......
    ..xx..
    .xrrx.
    .xrrx.
    ..xx..
    \`,
  ]
}))`,
  },
  {
    name: 'Color Mixing',
    description: 'Procedural gradient with lighten/darken/mix',
    code: `sprite({
  name: 'orb',
  palette: {
    '.': 'transparent',
    'o': '#1a1c2c',
    '0': darken('#3b82f6', 0.5),
    '1': darken('#3b82f6', 0.25),
    '2': '#3b82f6',
    '3': lighten('#3b82f6', 0.3),
    '4': lighten('#3b82f6', 0.6),
    '5': mix('#3b82f6', '#f4f4f4'),
  },
  frames: [\`
    ..oooo..
    .o0011o.
    o012234o
    o123345o
    o123345o
    o012234o
    .o0011o.
    ..oooo..
  \`]
})`,
  },
];

// Populate examples UI
const examplesContainer = document.querySelector('.examples-container') as HTMLElement;
if (examplesContainer) {
  examples.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = ex.name;

    const content = document.createElement('div');
    content.className = 'card-content';

    // Render a canvas preview (animate multi-frame sprites)
    try {
      const previewCanvas = document.createElement('canvas');
      previewCanvas.style.imageRendering = 'pixelated';
      const result = safelyEvaluateSprite(ex.code);
      if (result instanceof Sprite && result.frames.length > 1) {
        renderToCanvas(result.frameAt(0), previewCanvas, { scale: 4 });
        animateCanvas(result, previewCanvas, 4);
      } else {
        renderToCanvas(result, previewCanvas, { scale: 4 });
      }
      content.appendChild(previewCanvas);
    } catch {
      content.textContent = 'Preview unavailable';
      content.style.color = 'var(--text-muted)';
      content.style.fontSize = '0.8rem';
    }

    const desc = document.createElement('div');
    desc.className = 'card-description';
    desc.textContent = ex.description;

    card.appendChild(title);
    card.appendChild(content);
    card.appendChild(desc);

    card.addEventListener('click', () => {
      const editorTabBtn = document.querySelector('.tab-btn[data-target="tab-editor"]') as HTMLElement;
      editorTabBtn?.click();
      editor.value = ex.code;
      updatePreview();
    });

    examplesContainer.appendChild(card);
  });
}

// ---- Palettes ----
interface PaletteInfo {
  name: string;
  colors: RGBA[];
}

const palettes: PaletteInfo[] = Object.entries(PALETTES).map(([name, colors]) => ({
  name,
  colors,
}));

// Toast notification helper
function showToast(message: string) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  // Force reflow for animation
  toast.offsetHeight;
  toast.classList.add('toast-visible');
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Per-palette preview sprites — varied sizes & themes showcasing each palette's character
const PALETTE_PREVIEWS: Record<string, string> = {
  pico8: `
    00000000000000
    05555555555550
    05000000000050
    050b3c8a9b0050
    050c89ab3c0050
    0509a3cb890050
    050b8c9a3b0050
    05000000000050
    05555555555550
    00000000000000
    .....0880.....
    ...00000000...
  `,
  gameboy: `
    .000000.
    01111110
    01233210
    01233210
    01111110
    00000000
    0.1221.0
    01122110
    0.1221.0
    0..33..0
    01111110
    .000000.
  `,
  sweetie16: `
    ...0000...
    ..0ddd90..
    ..099990..
    .09a99a90.
    .0a9999a0.
    ..099990..
    ..055550..
    ..054450..
    ...0550...
    ...0540...
    ....00....
    ..........
  `,
  cga: `
    0000000000
    0111111100
    0133333310
    0133333310
    0111111110
    0111111110
    0100000010
    0102002010
    0100000010
    0000000000
  `,
  c64: `
    ..........
    ..000000..
    ..066660..
    ..067860..
    ..066660..
    ..006600..
    ..006600..
    .00066000.
    0555555550
    0533333350
    0555555550
    ..........
  `,
  zxspectrum: `
    0000111122223333
    0001111222233334
    0011112222333344
    0111122223333445
    1111222233334455
    1112222333344556
    1122223333445566
    1222233334455667
  `,
  nes: `
    ....0000....
    ..00899800..
    .0899aa9980.
    089a9aa9a980
    089a9aa9a980
    .0899aa9980.
    ..00899800..
    ...011110...
    ..01122110..
    ..01122110..
    ..01111110..
    ...000000...
  `,
  endesga32: `
    ...0...
    ..070..
    ..070..
    .07670.
    .07670.
    .07770.
    0e777e0
    .09990.
    .09890.
    .09990.
    ..0a0..
    ..0g0..
    ..0j0..
    ..000..
  `,
  apollo: `
    ...00...
    ..0110..
    ..0110..
    .011110.
    .012210.
    .012210.
    .011110.
    01311310
    01311310
    .011110.
    ..0550..
    ..0670..
    .067770.
    ..0000..
  `,
  resurrect64: `
    ..00000000..
    .0111111110.
    011a1111a110
    011a1111a110
    .0111111110.
    ..01111110..
    ..01100110..
    ..01233210..
    ..01211210..
    ...011110...
    ...011110...
    ....0000....
  `,
  virtualboy: `
    ..........
    .000..000.
    03322332.0
    03211123.0
    03211123.0
    03322332.0
    .000..000.
    ...0000...
    ..033330..
    ..........
  `,
  msx: `
    ..eeeeee..
    .eeeeeeee.
    ee22222222
    ee22222222
    ee88886688
    ee88886688
    .eeeeeeee.
    ..ee33ee..
    ..ee33ee..
    ..00..00..
  `,
  endesga16: `
    ....33....
    ...3cc3...
    ..3cccc3..
    .3cccccc3.
    3333333333
    ..365563..
    ..356653..
    ..366663..
    .33888833.
    3388888833
    ..388883..
    ...3883...
  `,
  dawnbringer16: `
    eeeeeeeeee
    eeeee8888e
    eee888888e
    e88888888e
    e888ccccce
    ccccccccce
    ccccc77cce
    5555577cce
    5555555cce
    0055555000
    0000000000
  `,
  dawnbringer32: `
    ....00000000....
    ..001414141400..
    .01313131313130.
    0131313131313130
    0888888888888880
    0888866668888880
    0888866668888880
    0777777777777770
    .07777aa7777770.
    ..077aaaa77770..
    ...0777777770...
    ....00000000....
  `,
  bubblegum16: `
    ....7777....
    ..77555577..
    .7555555557.
    .7554455447.
    75544554457.
    75555555557.
    .7556556557.
    .7555555557.
    ..77555577..
    ....7777....
    ...886688...
    ...886688...
  `,
  oil6: `
    0000000000
    0000110000
    0001111000
    0011221100
    0112222110
    1122332211
    1223333221
    2233443322
    3344554433
    4455555544
  `,
  slso8: `
    ..0000..
    .012210.
    01233210
    01234210
    01234210
    01233210
    .012210.
    ..0000..
  `,
  ammo8: `
    00000000
    07766770
    07600670
    06600660
    06600660
    07600670
    07766770
    00000000
  `,
  '1bit': `
    ..1111..
    .111111.
    11.11.11
    11111111
    11111111
    11.11.11
    .1....1.
    ..1111..
  `,
  nord: `
    0000000000
    0044444400
    0487778940
    048e77e840
    0487778940
    0044444400
    00bb33dd00
    000bcdb000
    0000000000
    0000000000
  `,
  gruvbox: `
    0000000000
    0777777770
    0713333170
    0730000370
    0730000370
    0730000370
    0713333170
    0777777770
    0000000000
    0000000000
  `,
  solarized: `
    ..00000000..
    .0088888800.
    008dd88dd800
    08dddddddd80
    08dddddddd80
    008dd88dd800
    .0088888800.
    ..00000000..
    ...0eeee0...
    ...0eeee0...
  `,
  dracula: `
    ....00....
    .0.0770.0.
    00077770.0
    .007777700
    .007777700
    ..0077700.
    ...07770..
    ...07070..
    ....000...
    ..........
  `,
};

const PALETTE_PREVIEW_NAMES: Record<string, string> = {
  pico8: 'tv',
  gameboy: 'robot',
  sweetie16: 'flower',
  cga: 'computer',
  c64: 'lamp',
  zxspectrum: 'rainbow',
  nes: 'ornament',
  endesga32: 'sword',
  apollo: 'rocket',
  resurrect64: 'ghost',
  virtualboy: 'goggles',
  msx: 'monitor',
  endesga16: 'tree',
  dawnbringer16: 'landscape',
  dawnbringer32: 'gem',
  bubblegum16: 'face',
  oil6: 'gradient',
  slso8: 'orb',
  ammo8: 'frame',
  '1bit': 'alien',
  nord: 'snowflake',
  gruvbox: 'box',
  solarized: 'owl',
  dracula: 'bat',
};

const FALLBACK_GRID = `
  ..0000..
  .011110.
  01233210
  01233210
  01111110
  01300310
  .011110.
  ..0000..
`;

// Populate palettes UI — grouped by category
const PALETTE_CATEGORIES: { label: string; names: string[] }[] = [
  {
    label: 'Retro Consoles',
    names: ['pico8', 'gameboy', 'cga', 'c64', 'zxspectrum', 'nes', 'virtualboy', 'msx'],
  },
  {
    label: 'Community',
    names: [
      'sweetie16', 'endesga32', 'endesga16', 'apollo', 'resurrect64',
      'dawnbringer16', 'dawnbringer32', 'bubblegum16', 'oil6', 'slso8', 'ammo8', '1bit',
    ],
  },
  {
    label: 'Modern',
    names: ['nord', 'gruvbox', 'solarized', 'dracula'],
  },
];

const palettesByName = new Map(palettes.map(p => [p.name, p]));

const palettesContainer = document.querySelector('.palettes-container') as HTMLElement;
if (palettesContainer) {
  PALETTE_CATEGORIES.forEach(category => {
    // Category header
    const header = document.createElement('div');
    header.className = 'palette-category-header';
    header.innerHTML = `<span class="chevron">&#9660;</span> ${category.label} <span style="color:var(--text-muted);font-weight:400">(${category.names.length})</span>`;

    // Category grid
    const grid = document.createElement('div');
    grid.className = 'palette-category-grid';

    header.addEventListener('click', () => {
      header.classList.toggle('collapsed');
      grid.classList.toggle('collapsed');
    });

    category.names.forEach(name => {
      const p = palettesByName.get(name);
      if (!p) return;

      const card = document.createElement('div');
      card.className = 'card';

      const title = document.createElement('div');
      title.className = 'card-title';
      title.textContent = p.name;

      // Canvas preview with reference sprite
      const content = document.createElement('div');
      content.className = 'card-content';
      try {
        const previewCanvas = document.createElement('canvas');
        previewCanvas.style.imageRendering = 'pixelated';
        const previewSprite = sprite({
          name: `${p.name}-preview`,
          palette: paletteFrom(p.name),
          frames: [PALETTE_PREVIEWS[p.name] ?? FALLBACK_GRID],
        });
        renderToCanvas(previewSprite, previewCanvas, { scale: 3 });
        content.appendChild(previewCanvas);
      } catch {
        content.textContent = 'Preview unavailable';
        content.style.color = 'var(--text-muted)';
        content.style.fontSize = '0.8rem';
      }

      // Compact swatches below the preview
      const swatchSection = document.createElement('div');
      swatchSection.className = 'card-swatches';
      const swatchContainer = document.createElement('div');
      swatchContainer.className = 'palette-swatches';
      p.colors.forEach(rgba => {
        const hex = toHex(rgba);
        const sw = document.createElement('div');
        sw.className = 'swatch';
        sw.style.backgroundColor = hex;
        sw.title = hex;
        swatchContainer.appendChild(sw);
      });
      swatchSection.appendChild(swatchContainer);

      card.appendChild(title);
      card.appendChild(content);
      card.appendChild(swatchSection);

      // On click, load palette into editor with example sprite
      card.addEventListener('click', () => {
        const grid = PALETTE_PREVIEWS[p.name] ?? FALLBACK_GRID;
        const code = `sprite({
  name: '${PALETTE_PREVIEW_NAMES[p.name] ?? p.name}',
  palette: paletteFrom('${p.name}'),
  frames: [\`${grid}\`]
})`;
        const editorTabBtn = document.querySelector('.tab-btn[data-target="tab-editor"]') as HTMLElement;
        editorTabBtn?.click();
        editor.value = code;
        updatePreview();
        showToast(`Loaded palette: ${p.name}`);
      });

      grid.appendChild(card);
    });

    palettesContainer.appendChild(header);
    palettesContainer.appendChild(grid);
  });
}
