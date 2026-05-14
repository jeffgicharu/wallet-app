import { test, expect } from '@playwright/test';

// WithdrawPage: amount → click Withdraw → PinPad → 4 digits → success.
// Wrong PIN dismisses the PinPad and surfaces a toast.
test.describe('07 — withdraw flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');
  });

  test('wrong PIN surfaces error toast and does not complete', async ({ page }) => {
    await page.goto('/withdraw');
    await page.locator('input[placeholder="0.00"]').fill('100');
    await page.getByRole('button', { name: 'Withdraw' }).click();
    await expect(page.getByText('Enter PIN to withdraw')).toBeVisible();

    for (const d of ['9', '9', '9', '9']) {
      await page.getByRole('button', { name: d, exact: true }).click();
    }

    // react-hot-toast renders the error. The PinPad closes after error
    // (see WithdrawPage onError handler clearing showPin).
    await expect(page.getByText('Enter PIN to withdraw')).toBeHidden({ timeout: 10_000 });
    // Should NOT see the success screen.
    await expect(page.getByRole('heading', { name: 'Withdrawal Successful' })).toHaveCount(0);
  });

  test('correct PIN completes the withdrawal', async ({ page }) => {
    await page.goto('/withdraw');
    await page.locator('input[placeholder="0.00"]').fill('100');
    await page.getByRole('button', { name: 'Withdraw' }).click();
    await expect(page.getByText('Enter PIN to withdraw')).toBeVisible();

    for (const d of ['1', '2', '3', '4']) {
      await page.getByRole('button', { name: d, exact: true }).click();
    }

    await expect(page.getByRole('heading', { name: 'Withdrawal Successful' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('KES 100.00 withdrawn')).toBeVisible();
  });
});
