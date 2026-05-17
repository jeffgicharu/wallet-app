import { test, expect } from '@playwright/test';
import { seedAuth } from './_session';

// 03 — Live home dashboard.
//
// After Alice logs in, the home page should show the balance card,
// quick-action buttons, the daily-limit hint (which works correctly
// on home — wallet-app#7 only concerns the missing hint on the send
// wizard's amount step), and a recent transactions section.
//
// Balance drift between daily resets means we don't assert a specific
// number — just that "KES" appears near the balance label.

test.beforeEach(async ({ page }) => {
  // No context-wide X-E2E-Smoke header — see 01-live-login-loads
  // for the Cloudflare Insights CORS rationale.
  await page.goto('about:blank');
  await page.evaluate(() => {
    try { sessionStorage.clear(); } catch { /* noop */ }
  });
});

test.describe('03 — live home dashboard', () => {
  test('home dashboard shows balance, daily limit, actions, recent section', async ({ page }) => {
    await seedAuth(page);
    await page.goto('/');
    await page.getByText('Available Balance').waitFor({ state: 'visible', timeout: 15_000 });

    // Balance card.
    await expect(page.getByText('Available Balance')).toBeVisible();
    // The balance text appears as "KES 50,000.00" or similar. Match
    // the "KES" prefix somewhere in the page (drift-tolerant).
    await expect(page.getByText(/KES\s/).first()).toBeVisible();

    // Daily-limit hint is rendered on home (this WORKS — wallet-app#7
    // is only about its absence from the send wizard's amount step).
    await expect(page.getByText(/Daily limit:/i)).toBeVisible();

    // Quick-action buttons. `exact: true` so we match the icon-+-label
    // quick-action button and not transaction-history rows whose
    // accessible name embeds "Cash deposit" / etc.
    await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Deposit', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Withdraw', exact: true })).toBeVisible();

    // Recent transactions section header. HomePage.tsx renders
    // "Recent Transactions" as an h3.
    await expect(page.getByRole('heading', { name: /Recent|Transactions/ })).toBeVisible();
  });
});
