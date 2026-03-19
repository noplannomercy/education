const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3012',
    headless: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx dotenv -e .env.local -- next dev -p 3012',
    url: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3012',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
