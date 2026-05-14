import { test, expect } from '@playwright/test';

// 04 — Live send wizard, read-only.
//
// Walk the send-money wizard up to the confirm step WITHOUT clicking
// "Enter PIN to Confirm". The live deploy holds real ledger state so
// the suite must not mutate it.
//
// One assertion (the missing "Fee" line) characterizes
// jeffgicharu/wallet-app#6 and is wrapped in its own test.fail block.

test.beforeEach(async ({ page }) => {
  // No context-wide X-E2E-Smoke header — see 01-live-login-loads
  // for the Cloudflare Insights CORS rationale.
  await page.goto('about:blank');
  await page.evaluate(() => {
    try { sessionStorage.clear(); } catch { /* noop */ }
  });
});

async function loginAsAlice(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
  await page.locator('input[placeholder="Password"]').fill('pass1234');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await Promise.race([
    page.waitForURL('**/', { timeout: 15_000 }),
    page.getByText('Available Balance').waitFor({ state: 'visible', timeout: 15_000 }),
  ]);
}

test.describe('04 — live send wizard (read-only)', () => {
  test('send wizard confirm step shows amount and recipient — no submit', async ({ page }) => {
    await loginAsAlice(page);

    // Click the Send quick-action.
    await page.getByRole('button', { name: 'Send' }).click();
    await page.waitForURL('**/send');

    // Phone step — bob's local-format number.
    await page.locator('input[placeholder="0712 345 678"]').fill('0700000002');
    await page.getByRole('button', { name: 'Next' }).click();

    // Amount step — KES 10 (minimum). We will NOT submit.
    await page.locator('input[placeholder="0.00"]').fill('10');
    await page.getByRole('button', { name: 'Next' }).click();

    // Confirm step.
    await expect(page.getByRole('heading', { name: 'Confirm Transfer' })).toBeVisible();

    // The amount row shows "KES 10.00" (en-KE locale fmt with 2 decimals).
    await expect(page.getByText(/KES\s*10(\.00)?/).first()).toBeVisible();

    // Recipient row shows the phone. SendPage.tsx renders the raw
    // input value (0700000002) on the confirm row, not the +254 form,
    // and not the receiver's name (the SPA never fetches it).
    await expect(page.getByText('0700000002')).toBeVisible();

    // STOP: we do not click "Enter PIN to Confirm" — that would
    // actually transfer money on the live deploy.
  });

  // wallet-app#6 is fixed in code but the live deploy still serves the
  // pre-fix bundle. The local characterization in
  // e2e/local/11-known-bug-characterization.spec.ts already asserts the
  // corrected behavior; this live-smoke counterpart will flip to
  // expected-pass in PR 21 once the redeploy lands the new wallet-app
  // bundle.
  test.fail('send confirm step omits transfer fee — issue jeffgicharu/wallet-app#6', async ({ page }) => {
    await loginAsAlice(page);

    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await page.waitForURL('**/send');
    await page.locator('input[placeholder="0712 345 678"]').fill('0700000002');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.locator('input[placeholder="0.00"]').fill('10');
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByRole('heading', { name: 'Confirm Transfer' })).toBeVisible();

    // Fixed behavior post-redeploy: Fee + Total rows visible.
    await expect(page.getByText(/Fee/)).toBeVisible({ timeout: 2_000 });

    // Still do NOT submit — read-only verification ends before the PIN pad.
  });
});
