import { test, expect } from '@playwright/test';

// DepositPage: type or use a preset amount, click Deposit, see success
// confirmation. No PIN required (deposit is unauthenticated by design
// for the demo wallet — it represents a cash-in event at a "branch").
test.describe('06 — deposit flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');
  });

  test('500 preset fills amount field', async ({ page }) => {
    await page.goto('/deposit');
    await expect(page.getByRole('heading', { name: 'Deposit Money' })).toBeVisible();
    await page.getByRole('button', { name: '500', exact: true }).click();
    await expect(page.locator('input[placeholder="0.00"]')).toHaveValue('500');
  });

  test('deposit completes and balance increases', async ({ page, browserName }) => {
    // Webkit on the Linux CI image is materially slower at React hydration
    // + the success-screen transition. Give it more headroom.
    const successTimeout = browserName === 'webkit' ? 30_000 : 10_000;

    // Capture starting balance from home.
    const balanceLine = page.locator('p').filter({ hasText: /^KES\s[\d,.]+$/ }).first();
    await expect(balanceLine).toBeVisible({ timeout: 10_000 });
    const before = await balanceLine.textContent();
    const beforeNum = parseFloat((before || '').replace(/[^0-9.]/g, ''));

    await page.goto('/deposit');
    await page.getByRole('button', { name: '500', exact: true }).click();
    await page.getByRole('button', { name: 'Deposit' }).click();

    await expect(page.getByRole('heading', { name: 'Deposit Successful' })).toBeVisible({ timeout: successTimeout });
    await expect(page.getByText('KES 500.00 deposited')).toBeVisible();

    await page.getByRole('button', { name: 'Done' }).click();
    await page.waitForURL('**/');

    await expect(balanceLine).toBeVisible();
    const after = await balanceLine.textContent();
    const afterNum = parseFloat((after || '').replace(/[^0-9.]/g, ''));
    expect(afterNum).toBeGreaterThanOrEqual(beforeNum + 500);
  });

  test('typed amount also works', async ({ page, browserName }) => {
    // Firefox + webkit on the CI image are slower than chromium at the
    // /deposit POST round-trip + success-screen transition.
    const successTimeout = browserName === 'chromium' ? 10_000 : 30_000;
    await page.goto('/deposit');
    await page.locator('input[placeholder="0.00"]').fill('250');
    await page.getByRole('button', { name: 'Deposit' }).click();
    await expect(page.getByRole('heading', { name: 'Deposit Successful' })).toBeVisible({ timeout: successTimeout });
    await expect(page.getByText('KES 250.00 deposited')).toBeVisible();
  });
});
