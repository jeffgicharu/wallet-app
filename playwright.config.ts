import { defineConfig, devices } from '@playwright/test';

const LOCAL_BASE_URL = process.env.LOCAL_BASE_URL ?? 'http://localhost:3002';
const LIVE_BASE_URL = process.env.LIVE_BASE_URL ?? 'https://wallet.jeffgicharu.com';

// Two layers of verification, one config:
//   - `local` projects hit a docker-compose / pnpm-dev wallet-app pointed at a
//     fresh wallet-api, run hot and parallel, comprehensive characterizations.
//   - `live-smoke` projects hit the public demo, run one-at-a-time with retries
//     to be gentle on the deploy and resilient to Cloudflare flake.
// Each layer fans out to chromium + firefox + webkit.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // ---------- local (comprehensive) ----------
    {
      name: 'local-chromium',
      testDir: './e2e/local',
      use: { ...devices['Desktop Chrome'], baseURL: LOCAL_BASE_URL },
    },
    {
      name: 'local-firefox',
      testDir: './e2e/local',
      use: { ...devices['Desktop Firefox'], baseURL: LOCAL_BASE_URL },
    },
    {
      name: 'local-webkit',
      testDir: './e2e/local',
      use: { ...devices['Desktop Safari'], baseURL: LOCAL_BASE_URL },
    },

    // ---------- live-smoke (gentle) ----------
    {
      name: 'live-smoke-chromium',
      testDir: './e2e/live-smoke',
      retries: 2,
      timeout: 30_000,
      use: { ...devices['Desktop Chrome'], baseURL: LIVE_BASE_URL },
    },
    {
      name: 'live-smoke-firefox',
      testDir: './e2e/live-smoke',
      retries: 2,
      timeout: 30_000,
      use: { ...devices['Desktop Firefox'], baseURL: LIVE_BASE_URL },
    },
    {
      name: 'live-smoke-webkit',
      testDir: './e2e/live-smoke',
      retries: 2,
      timeout: 30_000,
      use: { ...devices['Desktop Safari'], baseURL: LIVE_BASE_URL },
    },
  ],

  // local fan-out parallel; live-smoke is forced serial by --workers=1 in the
  // npm script so the public deploy doesn't get hammered.
  workers: process.env.PLAYWRIGHT_WORKERS
    ? Number(process.env.PLAYWRIGHT_WORKERS)
    : undefined,
});
