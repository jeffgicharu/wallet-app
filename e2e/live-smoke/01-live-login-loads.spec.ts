import { test, expect, type ConsoleMessage, type Response } from '@playwright/test';

// 01 — Live login page loads cleanly.
//
// Lightweight reachability + asset-health check against the public
// deploy. Asserts the login form is rendered, no error-level console
// messages, and no broken document/script/stylesheet responses.
//
// This is the canary: if this fails, every other live-smoke spec is
// expected to fail too.

test.beforeEach(async ({ page }) => {
  // NOTE: We intentionally do NOT set an X-E2E-Smoke header on the
  // global context. Cloudflare Insights' beacon.min.js is a CORS
  // request whose Access-Control-Allow-Headers does not list it, so
  // adding it causes spurious console errors. If per-spec request
  // tagging is needed, send it on specific page.request.* / fetch
  // calls instead of context-wide.
  //
  // Even on a fresh page object Playwright sometimes carries over
  // sessionStorage on retry; clear after first navigation in each test.
  await page.goto('about:blank');
  await page.evaluate(() => {
    try { sessionStorage.clear(); } catch { /* about:blank has no storage on some browsers */ }
  });
});

test.describe('01 — live login page loads', () => {
  test('login page renders, no console errors, no broken assets', async ({ page }) => {
    // Filter out third-party noise (Cloudflare Insights beacon,
    // analytics, etc.) — we only care about errors that originate
    // from app-controlled origins.
    const THIRD_PARTY_NOISE = [
      'cloudflareinsights.com',
      'static.cloudflareinsights.com',
      'beacon.min.js',
      'cf-beacon',
      'google-analytics',
      'googletagmanager',
    ];
    const isThirdPartyNoise = (text: string) =>
      THIRD_PARTY_NOISE.some((needle) => text.includes(needle));

    const consoleErrors: string[] = [];
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!isThirdPartyNoise(text)) {
          consoleErrors.push(text);
        }
      }
    });

    const brokenAssets: Array<{ url: string; status: number; type: string }> = [];
    page.on('response', (res: Response) => {
      const req = res.request();
      const type = req.resourceType();
      const url = res.url();
      if (
        (type === 'document' || type === 'script' || type === 'stylesheet') &&
        res.status() >= 400 &&
        !isThirdPartyNoise(url)
      ) {
        brokenAssets.push({ url, status: res.status(), type });
      }
    });

    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    // Form should be visible.
    await expect(page.getByRole('heading', { name: 'M-Wallet' })).toBeVisible();
    await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // Give the page a moment for any deferred console errors to surface.
    await page.waitForTimeout(500);

    expect(consoleErrors, `unexpected console errors: ${consoleErrors.join(' | ')}`).toEqual([]);
    expect(
      brokenAssets,
      `broken document/script/stylesheet responses: ${JSON.stringify(brokenAssets)}`
    ).toEqual([]);
  });
});
