import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 20000,
    fileParallelism: false,
    maxConcurrency: 1,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@goalmills/core-sports': path.resolve(__dirname, '../../core/sports/src/index.ts'),
      '@goalmills/core-commercial': path.resolve(__dirname, '../../core/commercial/src/index.ts'),
      '@goalmills/core-content': path.resolve(__dirname, '../../core/content/src/index.ts'),
      '@goalmills/core-audience': path.resolve(__dirname, '../../core/audience/src/index.ts'),
      '@goalmills/core-identity': path.resolve(__dirname, '../../core/identity/src/index.ts'),
      '@goalmills/core-analytics': path.resolve(__dirname, '../../core/analytics/src/index.ts'),
      '@goalmills/core-warehouse': path.resolve(__dirname, '../../core/warehouse/src/index.ts'),
      '@goalmills/infrastructure-database': path.resolve(__dirname, '../../infrastructure/database/src/index.ts'),
      '@goalmills/infrastructure-redis': path.resolve(__dirname, '../../infrastructure/redis/src/index.ts'),
      '@goalmills/infrastructure-events': path.resolve(__dirname, '../../infrastructure/events/src/index.ts'),
      '@goalmills/infrastructure-logging': path.resolve(__dirname, '../../infrastructure/logging/src/index.ts'),
      '@goalmills/contracts': path.resolve(__dirname, '../../packages/contracts/src/index.ts'),
      '@goalmills/types': path.resolve(__dirname, '../../packages/types/index.ts'),
    },
  },
});
