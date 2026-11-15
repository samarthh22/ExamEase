import { defineConfig, devices } from "@playwright/test";
const browser = process.env.E2E_BROWSER || "chromium";
export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3002",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    reducedMotion: "reduce",
  },
  projects: [
    {
      name: browser,
      use:
        browser === "firefox"
          ? { ...devices["Desktop Firefox"] }
          : {
              ...devices["Desktop Chrome"],
              ...(browser === "msedge"
                ? { channel: "msedge" }
                : browser === "chrome"
                  ? { channel: "chrome" }
                  : {}),
            },
    },
  ],
  webServer: {
    command: "node --experimental-sqlite --import tsx scripts/test-server.ts",
    url: "http://127.0.0.1:3002/api/health",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
