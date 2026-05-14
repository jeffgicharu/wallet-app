import { test, expect, devices } from '@playwright/test';

// The wallet-app is designed mobile-first. Verify the canonical
// login → send → confirm flow works under a true mobile device profile
// (Pixel 5) — viewport + touch + DPR.
test.use({ ...devices['Pixel 5'] });

test.describe('12 — mobile viewport', () => {
  test('login → send → confirm on Pixel 5', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'M-Wallet' })).toBeVisible();

    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');

    await expect(page.getByText('Available Balance')).toBeVisible();

    // Bottom nav is always visible on mobile.
    await expect(page.getByRole('link', { name: /Home/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Send/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /History/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Profile/ })).toBeVisible();

    // Walk the send wizard up through confirm.
    await page.goto('/send');
    await page.locator('input[placeholder="0712 345 678"]').fill('0700000002');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.locator('input[placeholder="0.00"]').fill('25');
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByRole('heading', { name: 'Confirm Transfer' })).toBeVisible();
  });

  test('viewport is mobile width', async ({ page }) => {
    await page.goto('/login');
    const w = page.viewportSize()?.width ?? 0;
    expect(w).toBeLessThan(500);
  });
});
