/**
 * Vitest setup file.
 *
 * Imported via `setupFiles` in vitest.config.ts. Loaded once per test file.
 * Detects jsdom vs node environment and conditionally extends matchers +
 * arranges DOM cleanup so node-environment tests aren't affected.
 */

import { afterEach } from 'vitest';

if (typeof document !== 'undefined') {
  // jsdom environment — load testing-library matchers + cleanup hooks
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  require('@testing-library/jest-dom/vitest');
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  const rtl = require('@testing-library/react') as { cleanup: () => void };
  afterEach(() => rtl.cleanup());
}
