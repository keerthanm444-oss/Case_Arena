import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Vitest configuration.
 *
 * Environment per-file via the docblock `// @vitest-environment jsdom` —
 * tests that render components opt in to jsdom; pure-logic tests stay in
 * the faster node environment by default.
 */

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    // Per-file environment via `@vitest-environment` docblock when needed
    environmentMatchGlobs: [
      ['tests/unit/**/*.test.tsx', 'jsdom'],
    ],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      include: [
        'lib/**/*.ts',
        'components/**/*.{ts,tsx}',
        'scripts/**/*.ts',
        'types/**/*.ts',
      ],
      exclude: ['**/*.test.*', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});
