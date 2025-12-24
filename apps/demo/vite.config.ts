import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@docforge/core': path.resolve(__dirname, '../../packages/core/src'),
      '@docforge/spreadsheet': path.resolve(__dirname, '../../packages/spreadsheet/src'),
      '@docforge/file-io': path.resolve(__dirname, '../../packages/file-io/src'),
      '@docforge/ai-bridge': path.resolve(__dirname, '../../packages/ai-bridge/src'),
    },
  },
  optimizeDeps: {
    exclude: ['@docforge/core', '@docforge/spreadsheet', '@docforge/file-io', '@docforge/ai-bridge'],
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
