import { test, expect } from '@playwright/test';

// SendPage is a four-step wizard: phone → amount → confirm → pin →
// success. The buttons advancing each step are all labelled "Next" up to
// confirm, then "Enter PIN to Confirm", then the PinPad. On success a
// TRF-xxxx reference is shown. Send a small amount alice → bob.
test.describe('05 — send money wizard', () => {
  test('alice sends KES 100 to bob and reaches success step', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');

    await page.goto('/send');
    await expect(page.getByRole('heading', { name: 'Send Money' })).toBeVisible();

    // Phone step.
    await page.locator('input[placeholder="0712 345 678"]').fill('0700000002');
    await page.getByRole('button', { name: 'Next' }).click();

    // Amount step.
    await expect(page.getByText('To: 0700000002')).toBeVisible();
    await page.locator('input[placeholder="0.00"]').fill('100');
    await page.getByRole('button', { name: 'Next' }).click();

    // Confirm step.
    await expect(page.getByRole('heading', { name: 'Confirm Transfer' })).toBeVisible();
    await page.getByRole('button', { name: 'Enter PIN to Confirm' }).click();

    // Pin step.
    await expect(page.getByText('Enter M-Wallet PIN')).toBeVisible();
    for (const d of ['1', '2', '3', '4']) {
      await page.getByRole('button', { name: d, exact: true }).click();
    }

    // Success step.
    await expect(page.getByRole('heading', { name: 'Transfer Successful' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/^TRF-/)).toBeVisible();
    await expect(page.getByText('KES 100.00 sent to 0700000002')).toBeVisible();
  });

  test('Done button on success returns to home', async ({ page }) => {
    // Quick login + transfer to reach success, then click Done.
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('carol@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');

    await page.goto('/send');
    await page.locator('input[placeholder="0712 345 678"]').fill('0700000002');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.locator('input[placeholder="0.00"]').fill('50');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Enter PIN to Confirm' }).click();
    for (const d of ['1', '2', '3', '4']) {
      await page.getByRole('button', { name: d, exact: true }).click();
    }
    await expect(page.getByRole('heading', { name: 'Transfer Successful' })).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Done' }).click();
    await page.waitForURL('**/');
    await expect(page.getByText('Available Balance')).toBeVisible();
  });
});
