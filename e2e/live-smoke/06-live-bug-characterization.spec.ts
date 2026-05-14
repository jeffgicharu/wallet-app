import { test, expect, type Page } from '@playwright/test';

// 06 — Live bug characterization (wallet-app#5, #7, #8).
//
// Each block describes the FIXED behavior. Today every block fails
// because the fix has not landed. When the fix ships, Playwright
// reports "unexpected pass" and the test.fail annotation can be
// removed.
//
// Read-only on the live deploy — no submits that move money.

test.beforeEach(async ({ page }) => {
  // No context-wide X-E2E-Smoke header — see 01-live-login-loads
  // for the Cloudflare Insights CORS rationale.
  await page.goto('about:blank');
  await page.evaluate(() => {
    try { sessionStorage.clear(); } catch { /* noop */ }
  });
});

async function loginAsAlice(page: Page) {
  await page.goto('/login');
  await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
  await page.locator('input[placeholder="Password"]').fill('pass1234');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await Promise.race([
    page.waitForURL('**/', { timeout: 15_000 }),
    page.getByText('Available Balance').waitFor({ state: 'visible', timeout: 15_000 }),
  ]);
}

test.describe('06 — live known-bug characterization', () => {
  // -------------------------------------------------------------------
  // wallet-app#5 — LoginPage has no client-side validation. Clicking
  // Sign In with empty inputs fires POST /api/auth/login.
  // Fixed behavior: no network call until validation passes.
  // -------------------------------------------------------------------
  test.fail(
    'login submits empty form to API — issue jeffgicharu/wallet-app#5',
    async ({ page }) => {
      let loginCalled = false;
      await page.route('**/api/auth/login', async (route) => {
        loginCalled = true;
        await route.continue();
      });

      await page.goto('/login');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForTimeout(1500);

      expect(loginCalled, 'login API should NOT be called for an empty form').toBe(false);
    }
  );

  // -------------------------------------------------------------------
  // wallet-app#7 — Send amount step omits the daily-limit hint.
  // Fixed behavior: a "Daily limit" hint is visible on the amount step.
  // -------------------------------------------------------------------
  test.fail(
    'send amount step omits daily limit — issue jeffgicharu/wallet-app#7',
    async ({ page }) => {
      await loginAsAlice(page);

      await page.getByRole('button', { name: 'Send' }).click();
      await page.waitForURL('**/send');

      await page.locator('input[placeholder="0712 345 678"]').fill('0700000002');
      await page.getByRole('button', { name: 'Next' }).click();

      // Amount step is now visible. The amount input has placeholder
      // "0.00". The daily-limit hint should be visible nearby.
      await expect(page.locator('input[placeholder="0.00"]')).toBeVisible();
      await expect(page.getByText(/daily limit/i)).toBeVisible({ timeout: 2_000 });
    }
  );

  // -------------------------------------------------------------------
  // wallet-app#8 — Tapping a transaction row navigates to
  // /history/{reference}, which is not a registered route. The catch-
  // all route renders the login screen (when unauthenticated) or a
  // blank/fallback state.
  // Fixed behavior: a detail view renders for /history/{reference}.
  // -------------------------------------------------------------------
  test.fail(
    'transaction row navigates to unregistered /history/{ref} — issue jeffgicharu/wallet-app#8',
    async ({ page }) => {
      await loginAsAlice(page);

      await page.goto('/history');
      await expect(page.getByRole('heading', { name: 'Transaction History' })).toBeVisible();

      const firstRow = page.locator('div.bg-white > button').first();
      await firstRow.click();

      // URL should change to /history/<something>.
      await page.waitForURL(/\/history\/.+/, { timeout: 5_000 });

      // Fixed behavior: a "Transaction Detail" or "Details" heading is
      // rendered. Current behavior: catch-all renders LoginPage or a
      // blank state — neither has this heading.
      await expect(
        page.getByRole('heading', { name: /Transaction Detail|Details/i })
      ).toBeVisible({ timeout: 2_000 });
    }
  );
});
