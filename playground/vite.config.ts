import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'pixlrt/core': resolve(__dirname, '../src/core.ts'),
      pixlrt: resolve(__dirname, '../src/index.ts'),
    },
  },
  server: {
    port: 5173,
  },
});
