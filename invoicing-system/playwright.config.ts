import { defineConfig, devices } from '@playwright/test';

// Allow overriding baseURL via environment: E2E_BASE_URL or PORT/NEXT_PORT
const PORT = Number(process.env.PORT || process.env.NEXT_PORT || 3002);
const BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${PORT}`;

// Playwright configuration for local e2e runs against the dev server
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});