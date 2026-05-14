import { test, expect } from '@playwright/test';

// HistoryPage renders the full transaction list from
// /api/wallet/transactions?page=0&size=50. No filter UI is implemented
// yet — verify only the list renders correctly. The seeded DEP-seed-*
// row guarantees at least one entry per user.
test.describe('08 — transaction history', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');
  });

  test('history page renders with at least one transaction row', async ({ page }) => {
    await page.goto('/history');
    await expect(page.getByRole('heading', { name: 'Transaction History' })).toBeVisible();

    // Rows are <button>s containing a "KES <amount>" line.
    const kesAmounts = page.getByText(/KES\s[\d,]+\.\d{2}/);
    await expect.poll(async () => kesAmounts.count(), { timeout: 10_000 }).toBeGreaterThan(0);
  });

  test('seeded deposit appears in history', async ({ page }) => {
    await page.goto('/history');
    await expect(page.getByText('Cash deposit').first()).toBeVisible({ timeout: 10_000 });
    // Status badge ("COMPLETED") shows alongside the amount.
    await expect(page.getByText('COMPLETED').first()).toBeVisible();
  });

  test('history is reachable from the bottom-nav', async ({ page }) => {
    await page.getByRole('link', { name: /History/ }).click();
    await page.waitForURL('**/history');
    await expect(page.getByRole('heading', { name: 'Transaction History' })).toBeVisible();
  });
});
