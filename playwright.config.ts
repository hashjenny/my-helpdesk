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

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["json", { outputFile: "test-results/results.json" }]] : "list",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
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
      command: "npm run build && node dist/index.js",
      cwd: "./backend",
      url: "http://localhost:3001/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        ...envVars,
        PORT: "3001",
        NODE_ENV: "test",
      },
    },
    {
      command: "npm run dev",
      cwd: "./frontend",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        NODE_ENV: "test",
        VITE_API_URL: "http://localhost:3001",
      },
    },
  ],
});
