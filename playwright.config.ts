import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config. Chromium only, driven against a production preview build so what we
 * verify matches what actually ships. Kept entirely separate from the vitest unit-test run and
 * from `npm run check` so CI stays fast — invoke explicitly via `npm run test:e2e`.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: '.playwright/report' }]],
  outputDir: '.playwright/test-results',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
