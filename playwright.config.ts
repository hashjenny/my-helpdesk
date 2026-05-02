import { defineConfig, devices } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * Parse .env.test file and return key-value pairs
 */
function parseEnvFile(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const equalIndex = trimmed.indexOf("=");
      if (equalIndex > 0) {
        const key = trimmed.slice(0, equalIndex);
        const value = trimmed.slice(equalIndex + 1).replace(/^["']|["']$/g, "");
        env[key] = value;
      }
    }
  }
  return env;
}

const envTestPath = path.join(__dirname, ".env.test");
const envVars = fs.existsSync(envTestPath) ? parseEnvFile(envTestPath) : {};
const apiBaseUrl = envVars.BETTER_AUTH_URL || `http://localhost:${envVars.PORT || "3001"}`;
const apiPort = (() => {
  try {
    return new URL(apiBaseUrl).port || envVars.PORT || "3001";
  } catch {
    return envVars.PORT || "3001";
  }
})();
const frontendBaseUrl = "http://localhost:5173";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["json", { outputFile: "e2e/test-results/results.json" }]] : [["list"], ["html", { outputFile: path.join(__dirname, "e2e", "playwright-report") }]],
  timeout: 30000,
  use: {
    baseURL: frontendBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  outputDir: 'e2e/test-results',
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter backend dev",
      cwd: ".",
      url: `${apiBaseUrl}/api/health`,
      reuseExistingServer: true,
      timeout: 120 * 1000,
      env: {
        ...envVars,
        PORT: apiPort,
        NODE_ENV: "test",
      },
    },
    {
      command: "pnpm --filter frontend dev --host",
      cwd: ".",
      url: frontendBaseUrl,
      reuseExistingServer: true,
      timeout: 120 * 1000,
      env: {
        NODE_ENV: "test",
        VITE_API_URL: apiBaseUrl,
      },
    },
  ],
});
