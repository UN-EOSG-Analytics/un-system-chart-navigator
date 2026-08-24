import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  use: { baseURL: BASE_URL, trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // NOT `pnpm build` — that chains scripts/encrypt-site.js, which staticrypts
    // every HTML file in out/ (and hard-exits without STATICRYPT_PASSWORD).
    // `build:test` exists solely to produce a plain, servable out/.
    command: `pnpm run build:test && pnpm exec serve out -l tcp://127.0.0.1:${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
