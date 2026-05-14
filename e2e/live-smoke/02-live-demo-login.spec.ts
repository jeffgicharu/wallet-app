import { test, expect } from '@playwright/test';

// 02 — Live demo login.
//
// Alice should be able to authenticate against the public wallet-api
// via the live SPA. JWT lands in sessionStorage under "token" (see
// src/context/AuthContext.tsx). We do NOT assert a specific balance —
// the daily 03:00 UTC reset drifts amounts during the day.

test.beforeEach(async ({ page }) => {
  // No context-wide X-E2E-Smoke header — Cloudflare Insights' CORS
  // policy doesn't permit it and adding it produces console-error
  // noise. Tag specific request.* calls if a tag is needed.
  await page.goto('about:blank');
  await page.evaluate(() => {
    try { sessionStorage.clear(); } catch { /* noop */ }
  });
});

test.describe('02 — live demo login', () => {
  test('alice logs in and lands on home with a session token', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Either the URL settles on / or the Available Balance card appears —
    // wait for whichever resolves first. The live deploy sometimes
    // serves cached HTML behind Cloudflare and the URL update can lag.
    await Promise.race([
      page.waitForURL('**/', { timeout: 15_000 }),
      page.getByText('Available Balance').waitFor({ state: 'visible', timeout: 15_000 }),
    ]);

    await expect(page.getByText('Available Balance')).toBeVisible();

    const token = await page.evaluate(() => sessionStorage.getItem('token'));
    expect(token, 'JWT should be persisted in sessionStorage under "token"').toBeTruthy();
    expect((token || '').length).toBeGreaterThan(20);
  });
});
