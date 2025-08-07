import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts', './vitest.setup.components.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.d.ts',
        '**/*.svelte',
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/test-utils/**'
      ],
      all: true,
      include: ['src/**/*.{js,jsx,ts,tsx}'],
    },
    alias: {
      $lib: resolve(__dirname, './src/lib'),
    },
    // Isolate tests from each other
    isolate: true,
    // Clear mocks between tests
    clearMocks: true,
    // Mock all .svelte files by default
    mockReset: true,
    // Setup global test environment
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:5173',
      },
    },
  },
});
