import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config.
 *
 * One project (Chromium desktop) for the smoke pass — keeps CI fast.
 * Adding mobile + Firefox is one config block away; we just don't need
 * those signals on a smoke run.
 */

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tests/e2e/.artifacts',

  // CI behaviors
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    // Use the dev server for speed — the static export build is also valid
    // but takes ~30s; smoke tests don't need it.
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
