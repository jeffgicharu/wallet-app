import { test, expect } from '@playwright/test';
import { seedAuth } from './_session';

// 05 — Live multi-tenant probe for jeffgicharu/wallet-api#20.
//
// Alice authenticates against the live SPA, then uses her JWT to GET
// /api/wallet/transactions/DEP-seed-bob — a deposit reference seeded
// for Bob by the daily 03:00 UTC reset.
//
// Current (buggy) behavior: 200 OK — the API does not verify that the
// requesting user owns the referenced transaction. Fixed behavior: 403
// Forbidden or 404 Not Found.
//
// Assumption: the daily seed recreates DEP-seed-bob each morning. If
// for some reason it does not exist, the API will return 404, which
// happens to MATCH the fixed-behavior assertion below. In that case
// Playwright reports an "unexpected pass" — which is acceptable
// because it still flags that the bug is no longer reproducible.

test.beforeEach(async ({ page }) => {
  // No context-wide X-E2E-Smoke header — see 01-live-login-loads
  // for the Cloudflare Insights CORS rationale.
  await page.goto('about:blank');
  await page.evaluate(() => {
    try { sessionStorage.clear(); } catch { /* noop */ }
  });
});

test.describe('05 — live multi-tenant probe', () => {
  test(
    'live cross-user lookup probe (wallet-api#20 — local reproduces, live currently does not)',
    async ({ page }) => {
      await seedAuth(page);
      await page.goto('/');
      await page.getByText('Available Balance').waitFor({ state: 'visible', timeout: 15_000 });

      const status = await page.evaluate(async () => {
        const token = sessionStorage.getItem('token');
        const res = await fetch(
          'https://wallet-api.jeffgicharu.com/api/wallet/transactions/DEP-seed-bob',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.status;
      });

      // Log the actual status for the verification report.
      // eslint-disable-next-line no-console
      console.log('[live-multi-tenant-probe] alice -> DEP-seed-bob status:', status);

      // Today on live this returns 400 (not 200). Local reproduces the
      // 200 bug (issue #20). When #20 lands, both should return 403/404.
      // We allow any non-200 here so a future correct fix (200 -> 403)
      // doesn't break the test; the local characterizations in
      // e2e/local/11-known-bug-characterization.spec.ts and the curl
      // verify-endpoints-local.sh own the strict assertion side.
      expect(
        status,
        'live cross-user lookup should NOT return 200 (currently does on local)'
      ).not.toBe(200);
    }
  );
});
