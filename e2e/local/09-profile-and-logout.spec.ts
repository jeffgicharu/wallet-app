import { test, expect } from '@playwright/test';

// ProfilePage shows full name + phone + wallet info + Sign Out. Logout
// clears sessionStorage and redirects to /login.
test.describe('09 — profile and logout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');
  });

  test('profile shows alice\'s details', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
    await expect(page.getByText('Alice Demo')).toBeVisible();
    await expect(page.getByText('+254700000001').first()).toBeVisible();
    await expect(page.getByText('Wallet Balance')).toBeVisible();
    await expect(page.getByText('Daily Transfer Limit')).toBeVisible();
  });

  test('sign out clears sessionStorage and redirects to /login', async ({ page }) => {
    await page.goto('/profile');
    await page.getByRole('button', { name: /Sign Out/ }).click();

    await page.waitForURL('**/login');

    const session = await page.evaluate(() => ({
      token: sessionStorage.getItem('token'),
      fullName: sessionStorage.getItem('fullName'),
      phone: sessionStorage.getItem('phone'),
    }));
    expect(session.token).toBeNull();
    expect(session.fullName).toBeNull();
    expect(session.phone).toBeNull();
  });

  test('after logout, visiting / redirects back to /login', async ({ page }) => {
    await page.goto('/profile');
    await page.getByRole('button', { name: /Sign Out/ }).click();
    await page.waitForURL('**/login');

    await page.goto('/');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });
});
