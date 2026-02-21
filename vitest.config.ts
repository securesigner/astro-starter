import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@content': path.resolve(__dirname, './src/content'),
      '@data': path.resolve(__dirname, './src/data'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.{js,ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.astro'],
      // Coverage thresholds - gradually increase as coverage improves
      // Current coverage: ~58% statements, 61% branches, 54% functions, 58% lines
      thresholds: {
        lines: 55,
        functions: 50,
        branches: 55,
        statements: 55,
      },
    },
  },
});
