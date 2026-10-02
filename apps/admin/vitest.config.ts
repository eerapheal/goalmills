import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    fileParallelism: false,
    maxConcurrency: 1,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@goalmills/core-sports': path.resolve(__dirname, '../../core/sports/src/index.ts'),
      '@goalmills/core-commercial': path.resolve(__dirname, '../../core/commercial/src/index.ts'),
      '@goalmills/core-content': path.resolve(__dirname, '../../core/content/src/index.ts'),
      '@goalmills/types': path.resolve(__dirname, '../../packages/types/index.ts'),
    },
  },
});
