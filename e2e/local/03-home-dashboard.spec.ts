import { test, expect } from '@playwright/test';

// HomePage shows the balance card, the daily transfer limit, the three
// quick actions, and a recent-transactions feed sourced from
// /api/wallet/transactions?page=0&size=5. The seed transaction
// DEP-seed-alice ("Cash deposit", KES 50,000) should be in alice's feed.
test.describe('03 — home dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');
  });

  test('balance card shows KES prefix', async ({ page }) => {
    await expect(page.getByText('Available Balance')).toBeVisible();
    // Balance text is "KES 50,000.00" or similar.
    await expect(page.locator('p', { hasText: /^KES\s/ }).first()).toBeVisible();
  });

  test('daily limit line is visible', async ({ page }) => {
    await expect(page.getByText(/Daily limit:/)).toBeVisible();
  });

  test('Send, Deposit, Withdraw quick-action buttons are visible', async ({ page }) => {
    // `exact: true` so the matcher doesn't collide with transaction-history
    // rows whose accessible name embeds "Cash deposit" / "Withdraw" once
    // the test fixture seeds money flow.
    await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Deposit', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Withdraw', exact: true })).toBeVisible();
  });

  test('recent transactions feed shows seeded deposit', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Recent Transactions' })).toBeVisible();
    // DEP-seed-alice is "Cash deposit" — should be the first row.
    await expect(page.getByText('Cash deposit').first()).toBeVisible({ timeout: 10_000 });
  });

  test('Send quick action navigates to /send', async ({ page }) => {
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await page.waitForURL('**/send');
    await expect(page.getByRole('heading', { name: 'Send Money' })).toBeVisible();
  });
});
