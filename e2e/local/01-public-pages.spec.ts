import { test, expect } from '@playwright/test';

// Public, unauthenticated surface of the wallet-app SPA. The only public
// route in the router is /login — everything else gates on auth and
// redirects there via <AppShell />. This file does the basics every
// project should have: page loads cleanly, title/heading present, no
// console errors, no 4xx/5xx for document/script/stylesheet resources.
test.describe('01 — public pages', () => {
  test('login page renders with no console errors and no broken assets', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const badResponses: string[] = [];
    page.on('response', (res) => {
      const rt = res.request().resourceType();
      if (['document', 'script', 'stylesheet'].includes(rt)) {
        const status = res.status();
        if (status >= 400) badResponses.push(`${status} ${rt} ${res.url()}`);
      }
    });

    await page.goto('/login');

    // The login form's branded heading is the canonical landmark.
    await expect(page.getByRole('heading', { name: 'M-Wallet' })).toBeVisible();
    await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // Give the SPA a beat for any deferred network / hydration errors.
    await page.waitForLoadState('networkidle');

    // TODO: wire up @axe-core/playwright once the dep is added so we can
    // fail builds on a11y regressions on the public surface.

    expect(consoleErrors, `unexpected console errors: ${consoleErrors.join('\n')}`).toEqual([]);
    expect(badResponses, `unexpected 4xx/5xx asset responses: ${badResponses.join('\n')}`).toEqual([]);
  });

  test('document title is set', async ({ page }) => {
    await page.goto('/login');
    // Vite default index.html title is "M-Wallet" or similar — assert a
    // non-empty document.title rather than a hard string match.
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
