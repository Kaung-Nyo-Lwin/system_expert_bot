import { defineConfig, devices } from "@playwright/test";

const python = process.platform === "win32" ? ".venv/Scripts/python.exe" : ".venv/bin/python";
const reuseServers = process.env.REUSE_TEST_SERVERS === "1";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:15173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: `${python} -m flask --app app.backend.app run --host 127.0.0.1 --port 18081`,
      cwd: "../..",
      env: { APP_MODE: "demo", PYTHONPATH: "." },
      ...(reuseServers
        ? { url: "http://127.0.0.1:18081/api/health", reuseExistingServer: true }
        : { wait: { stderr: /Running on http:\/\/127\.0\.0\.1:18081/ } }),
      timeout: 30000,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 15173",
      env: { API_PROXY_TARGET: "http://127.0.0.1:18081" },
      ...(reuseServers
        ? { url: "http://127.0.0.1:15173", reuseExistingServer: true }
        : { wait: { stdout: /Local:/ } }),
      timeout: 30000,
    },
  ],
});
