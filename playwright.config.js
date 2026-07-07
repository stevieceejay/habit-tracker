const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    headless: true,
    viewport: { width: 1200, height: 900 },
    actionTimeout: 5_000,
    ignoreHTTPSErrors: true,
  },
});
