import { sprite, renderToCanvas } from 'pixlrt/core';

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

function safelyEvaluateSprite(code: string) {
  try {
    // We intentionally evaluate the user string, simulating them passing an object to sprite()
    // By wrapping it in a function that provides 'sprite', we can capture the result
    const evaluate = new Function('sprite', `return ${code}`);
    return evaluate(sprite);
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

    // Render
    renderToCanvas(resultSprite, canvas, { scale });
  } catch (err: any) {
    console.error(err);
    errorOverlay.textContent = err.message || 'Error parsing sprite definition';
    errorOverlay.classList.remove('hidden');
  }
}

editor.addEventListener('input', updatePreview);
scaleSelect.addEventListener('change', updatePreview);

// Initialize
editor.value = DEFAULT_CODE;
updatePreview();

// Optional: format / reset buttons (if implemented later)
document.getElementById('reset-btn')?.addEventListener('click', () => {
  editor.value = DEFAULT_CODE;
  updatePreview();
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
