import { test, expect } from '@playwright/test';

// Characterization tests for known bugs filed in the wallet-app /
// wallet-api repos. Each uses test.fail() with a comment referencing
// the GitHub issue. The contract:
//
//   - assertion describes the FIXED behavior
//   - test currently fails because the fix has not landed
//   - when the fix ships, Playwright reports "unexpected pass" and the
//     annotation can be removed.
test.describe('11 — known bug characterization', () => {
  // ------------------------------------------------------------------
  // wallet-app #5 — LoginPage now does client-side validation.
  // Submitting an empty form surfaces "Email is required" /
  // "Password is required" inline and does NOT call /api/auth/login.
  // ------------------------------------------------------------------
  test('login form rejects empty submit before API — issue jeffgicharu/wallet-app#5', async ({ page }) => {
    let loginCalled = false;
    await page.route('**/api/auth/login', async (route) => {
      loginCalled = true;
      await route.continue();
    });

    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
    expect(loginCalled, 'login API should NOT be called for empty form').toBe(false);
  });

  test('login form rejects malformed email before API — issue jeffgicharu/wallet-app#5', async ({ page }) => {
    let loginCalled = false;
    await page.route('**/api/auth/login', async (route) => {
      loginCalled = true;
      await route.continue();
    });

    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('not-an-email');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Enter a valid email address')).toBeVisible();
    expect(loginCalled, 'login API should NOT be called for invalid email').toBe(false);
  });

  // ------------------------------------------------------------------
  // wallet-app #6 — Send confirm now shows Amount / Fee / Total.
  // ------------------------------------------------------------------
  test('send confirm shows transfer fee and total — issue jeffgicharu/wallet-app#6', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');

    await page.goto('/send');
    await page.locator('input[placeholder="0712 345 678"]').fill('0700000002');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.locator('input[placeholder="0.00"]').fill('1000');
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByRole('heading', { name: 'Confirm Transfer' })).toBeVisible();

    // 1% of 1000 = 10. Total = 1010.
    await expect(page.getByText(/Fee/)).toBeVisible();
    await expect(page.getByText('KES 10.00')).toBeVisible();
    await expect(page.getByText('KES 1,010.00')).toBeVisible();
  });

  // ------------------------------------------------------------------
  // wallet-app #7 — Send amount step omits the daily-limit hint.
  // Send amount step now shows the "Remaining today" hint sourced from
  // /api/wallet's dailyTransferLimit / dailyTransferUsed.
  // ------------------------------------------------------------------
  test('send amount step shows remaining daily limit — issue jeffgicharu/wallet-app#7', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');

    await page.goto('/send');
    await page.locator('input[placeholder="0712 345 678"]').fill('0700000002');
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByText(/Remaining today/i)).toBeVisible();
    // Verify the limit line references the daily limit configured in
    // wallet-api (KES 300,000 unless changed).
    await expect(page.getByText(/limit KES/i)).toBeVisible();
  });

  // wallet-app #8 — tapping a transaction row now routes to
  // /history/:ref and renders the TransactionDetailPage.
  // ------------------------------------------------------------------
  test('transaction row opens the detail page — issue jeffgicharu/wallet-app#8', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');

    await page.goto('/history');
    await expect(page.getByRole('heading', { name: 'Transaction History' })).toBeVisible();
    const firstRow = page.locator('div.bg-white > button').first();
    await firstRow.click();

    await page.waitForURL(/\/history\/.+/);
    await expect(page.getByRole('heading', { name: 'Transaction Detail' })).toBeVisible();
    await expect(page.getByText('Reference')).toBeVisible();
  });

  // ------------------------------------------------------------------
  // wallet-api #2 — AdminController accessible to regular users.
  // Fixed behavior: 403 Forbidden for non-admin tokens.
  // ------------------------------------------------------------------
  test.fail(
    'admin stats accessible to regular user — issue jeffgicharu/wallet-api#2',
    async ({ page }) => {
      await page.goto('/login');
      await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
      await page.locator('input[placeholder="Password"]').fill('pass1234');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL('**/');

      const status = await page.evaluate(async () => {
        const token = sessionStorage.getItem('token');
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.status;
      });

      // Fixed behavior: regular user gets 403.
      expect(status).toBe(403);
    }
  );

  // ------------------------------------------------------------------
  // wallet-api #20 — Cross-user transaction lookup.
  // Alice fetches DEP-seed-bob. Fixed behavior: 403 or 404.
  // ------------------------------------------------------------------
  test.fail(
    'cross-user transaction lookup returns 200 — issue jeffgicharu/wallet-api#20',
    async ({ page }) => {
      await page.goto('/login');
      await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
      await page.locator('input[placeholder="Password"]').fill('pass1234');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL('**/');

      const status = await page.evaluate(async () => {
        const token = sessionStorage.getItem('token');
        const res = await fetch('/api/wallet/transactions/DEP-seed-bob', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.status;
      });

      // Fixed behavior: not 200.
      expect(status).not.toBe(200);
    }
  );
});
