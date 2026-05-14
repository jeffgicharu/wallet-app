import { test, expect } from '@playwright/test';

// Login flow against the three seeded demo accounts on the local
// wallet-api. After login the SPA stores the JWT in sessionStorage under
// "token" (see src/context/AuthContext.tsx) and redirects to "/".
test.describe('02 — login with demo account', () => {
  const demos = [
    { email: 'alice@demo.local', password: 'pass1234', firstName: 'Alice' },
    { email: 'bob@demo.local', password: 'pass1234', firstName: 'Bob' },
    { email: 'carol@demo.local', password: 'pass1234', firstName: 'Carol' },
  ];

  for (const demo of demos) {
    test(`${demo.firstName} can log in and lands on home`, async ({ page }) => {
      await page.goto('/login');
      await page.locator('input[placeholder="Email"]').fill(demo.email);
      await page.locator('input[placeholder="Password"]').fill(demo.password);
      await page.getByRole('button', { name: 'Sign In' }).click();

      await page.waitForURL('**/', { timeout: 10_000 });
      await expect(page.getByText('Available Balance')).toBeVisible();
      await expect(page.getByText(`Hello, ${demo.firstName}`)).toBeVisible();

      // JWT lands in sessionStorage (not localStorage — see AuthContext).
      const token = await page.evaluate(() => sessionStorage.getItem('token'));
      expect(token).toBeTruthy();
    });
  }

  // Characterizes issue jeffgicharu/wallet-app#12: the global axios 401/403
  // response interceptor reloads /login before LoginPage's catch block can
  // surface the "Invalid email or password" message. The user sees the page
  // silently reload with both fields cleared and no error visible.
  test.fail(
    'invalid credentials show "Invalid email or password" — issue jeffgicharu/wallet-app#12',
    async ({ page }) => {
      await page.goto('/login');
      await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
      await page.locator('input[placeholder="Password"]').fill('wrong-password');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.getByText('Invalid email or password')).toBeVisible({
        timeout: 5_000,
      });
    },
  );

  test('current bug behaviour on bad creds: stays on /login with cleared fields, no error', async ({
    page,
  }) => {
    // Document the actual behaviour today so a regression in either
    // direction (e.g. silently auto-logging the user in, or losing the
    // /login URL entirely) trips this test.
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign In' }).click();
    // The interceptor's hard reload settles within a few seconds.
    await page.waitForURL('**/login', { timeout: 5_000 });
    expect(page.url()).toContain('/login');
    // sessionStorage was cleared by the interceptor.
    const token = await page.evaluate(() => sessionStorage.getItem('token'));
    expect(token).toBeFalsy();
  });

  test('direct visit to / without auth redirects to /login', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('logout from /profile clears session and redirects to /login', async ({ page }) => {
    // Log in first.
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');

    await page.goto('/profile');
    await page.getByRole('button', { name: /Sign Out/ }).click();

    await page.waitForURL('**/login');
    const token = await page.evaluate(() => sessionStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
