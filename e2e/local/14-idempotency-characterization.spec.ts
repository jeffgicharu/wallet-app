import { test, expect } from '@playwright/test';

// wallet-api #10 — duplicate idempotency key now replays the original
// response: a repeat transfer with the same key returns 200 + the same
// reference as the first call (no second transfer, no 409).
test.describe('14 — idempotency characterization', () => {
  test(
    'duplicate idempotency key replays the original 200 — issue jeffgicharu/wallet-api#10',
    async ({ page }) => {
      await page.goto('/login');
      await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
      await page.locator('input[placeholder="Password"]').fill('pass1234');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL('**/');

      const result = await page.evaluate(async () => {
        const token = sessionStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        // Unique-but-stable key for this test run.
        const key = `trf-dup-${Date.now()}`;
        const body = JSON.stringify({
          recipientPhone: '+254700000002',
          amount: 25,
          pin: '1234',
          idempotencyKey: key,
        });

        const r1 = await fetch('/api/wallet/transfer', { method: 'POST', headers, body });
        const j1 = await r1.json();
        const r2 = await fetch('/api/wallet/transfer', { method: 'POST', headers, body });
        let j2: unknown = null;
        try { j2 = await r2.json(); } catch { /* may be empty */ }
        return {
          first: { status: r1.status, body: j1 },
          second: { status: r2.status, body: j2 },
        };
      });

      // First call should succeed.
      expect(result.first.status).toBe(200);

      // Fixed behavior: second call ALSO returns 200 with the same
      // reference. Currently it returns 409 (conflict).
      expect(result.second.status).toBe(200);
      // Same reference returned both times.
      const firstRef = (result.first.body as { data?: { reference?: string } })?.data?.reference;
      const secondRef = (result.second.body as { data?: { reference?: string } } | null)?.data?.reference;
      expect(secondRef).toBe(firstRef);
    }
  );
});
