import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8082";
const startDevServer = process.env.PLAYWRIGHT_START_DEV === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  timeout: 60000,
  use: {
    baseURL,
    trace: "on-first-retry",
    ...devices["Pixel 5"],
  },
  webServer: startDevServer
    ? {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      }
    : undefined,
});
