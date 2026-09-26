import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3000);

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One retry everywhere: under parallel load the dev server now and then answers a page with a 500
  // ("Unexpected end of JSON input" in its own compile output), which is not the app.
  retries: 1,
  reporter: process.env.CI ? "github" : "list",
  // The dev server renders pages on demand; under parallel load a first render can pass 5s.
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
