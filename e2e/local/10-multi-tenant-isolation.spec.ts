import { test, expect } from '@playwright/test';

// Multi-tenant isolation — alice should not be able to read bob's
// wallet or transactions. This file exercises the SPA's wallet view
// only (i.e. alice sees her own balance + phone). The cross-user
// transaction lookup bug (wallet-api #20) is characterized separately
// in 11-known-bug-characterization.spec.ts.
test.describe('10 — multi-tenant isolation', () => {
  test('alice sees alice\'s wallet, not bob\'s', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');

    await expect(page.getByText('Hello, Alice')).toBeVisible();
    await page.goto('/profile');
    await expect(page.getByText('+254700000001').first()).toBeVisible();
    await expect(page.getByText('+254700000002')).toHaveCount(0);
    await expect(page.getByText('+254700000003')).toHaveCount(0);
  });

  test('bob sees bob\'s wallet, not alice\'s', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('bob@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');

    await expect(page.getByText('Hello, Bob')).toBeVisible();
    await page.goto('/profile');
    await expect(page.getByText('+254700000002').first()).toBeVisible();
    await expect(page.getByText('+254700000001')).toHaveCount(0);
  });

  test('alice\'s history does not contain bob\'s DEP-seed-bob amount', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');

    await page.goto('/history');
    await expect(page.getByRole('heading', { name: 'Transaction History' })).toBeVisible();
    // bob's seeded deposit is exactly 25,000.00 — alice's is 50,000.00.
    // Make sure alice doesn't see a 25,000.00 row from bob.
    const bobAmount = page.getByText('KES 25,000.00');
    await expect(bobAmount).toHaveCount(0);
  });
});
