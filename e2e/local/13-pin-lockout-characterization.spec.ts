import { test, expect } from '@playwright/test';

// wallet-api #9 — PIN lockout doesn't persist (rollback bug).
// Three wrong PINs followed by a correct PIN STILL succeeds. Fixed
// behavior: the account is locked after the 3rd wrong PIN and the 4th
// attempt (correct or not) is rejected.
//
// We drive this through the transfer endpoint directly (via fetch in
// the page context, using the JWT in sessionStorage) so we can submit
// PINs as fast as possible without re-walking the send wizard.
test.describe('13 — pin lockout characterization', () => {
  test.fail(
    'PIN lockout does not persist after rollback — issue jeffgicharu/wallet-api#9',
    async ({ page, browserName }) => {
      // Webkit's fetch ordering serializes the three wrong-PIN POSTs
      // differently from chromium/firefox; the wrong-PIN counter ends up
      // sticking on webkit (the bug is masked). The bug is real and
      // reproduced on the other two browsers + on the curl side
      // (verify-endpoints-local.sh against `pin:9999` x3 + correct).
      // Skipping webkit here to keep the characterization deterministic
      // until the fix lands.
      test.skip(browserName === 'webkit',
        'wallet-api#9 does not reproduce on webkit (different request serialization)');

      // Log bob in — we'll attack his own account from his own session.
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

        // Three deliberately wrong PINs against bob's withdraw — should
        // each return 401/403 and increment the wrong-pin counter.
        const wrong = [] as number[];
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

        // Now the correct PIN. Fixed behavior: still rejected (locked).
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

      // Fixed behavior: the 4th attempt should NOT succeed because the
      // account is locked. Currently it succeeds (200) because the
      // wrong-PIN counter rolls back with the failed transaction.
      expect(result.correctStatus, `wrong PIN statuses: ${result.wrong.join(',')}`).not.toBe(200);
    }
  );
});
