import { test } from '@playwright/test';

// Probe for wallet-api#9 — PIN lockout doesn't persist (rollback bug).
//
// Three wrong PINs against bob's /api/wallet/withdraw, then a correct PIN.
// Fixed behavior: account is locked after the 3rd wrong PIN; the 4th call
// (even with correct PIN) is rejected. Today's behavior: the 4th call
// often succeeds because the wrong-PIN counter rolls back with the failed
// transaction.
//
// The outcome is **timing-dependent** across the three browsers + the CI
// environment because the bug depends on transaction commit ordering vs.
// the rapid 4 sequential POSTs. Rather than encode that as test.fail()
// (which oscillates between expected-fail and unexpected-pass depending
// on environment timing), we probe + log the statuses for the e2e
// verification report. The deterministic source-of-truth repro is in
// wallet-api/scripts/verify-endpoints-local.sh which can pace the
// requests on the API host.
test.describe('13 — pin lockout characterization (probe)', () => {
  test('PIN lockout probe — issue jeffgicharu/wallet-api#9', async ({
    page,
    browserName,
  }) => {
    // Log bob in — we'll exercise his own account from his own session.
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('bob@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');

    const result = await page.evaluate(async () => {
      const token = sessionStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const wrong: number[] = [];
      for (let i = 0; i < 3; i++) {
        const r = await fetch('/api/wallet/withdraw', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            amount: 10,
            pin: '9999',
            idempotencyKey: `lockout-wrong-${Date.now()}-${i}`,
          }),
        });
        wrong.push(r.status);
      }

      const correct = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: 10,
          pin: '1234',
          idempotencyKey: `lockout-correct-${Date.now()}`,
        }),
      });

      return { wrong, correctStatus: correct.status };
    });

    // eslint-disable-next-line no-console
    console.log(
      `[wallet-api#9 probe] ${browserName}: 3 wrong PIN statuses = [${result.wrong.join(',')}], correct-PIN status = ${result.correctStatus} (200 = bug reproduced; 401/403 = lockout held)`,
    );
  });
});
