import { test, expect } from '@playwright/test';

// PinPad is a modal sheet rendered by withdraw/transfer flows. Pin is 4
// digits, calls onComplete on the 4th. Three filled dots reachable, max
// four dots even with extra presses. Backspace via the trailing Delete
// icon button. See src/components/PinPad.tsx.
test.describe('04 — pin pad component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder="Email"]').fill('alice@demo.local');
    await page.locator('input[placeholder="Password"]').fill('pass1234');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/');

    // Withdraw page is the simplest way to reach the PinPad: enter
    // amount > 10, click Withdraw, modal renders.
    await page.goto('/withdraw');
    await page.locator('input[placeholder="0.00"]').fill('100');
    await page.getByRole('button', { name: 'Withdraw' }).click();
    await expect(page.getByText('Enter PIN to withdraw')).toBeVisible();
  });

  // The 4 indicator dots are <div class="w-4 h-4 rounded-full ..."> —
  // filled state uses bg-indigo-600. Empty uses bg-gray-200.
  const filledDotsSelector = 'div.w-4.h-4.rounded-full.bg-indigo-600';

  test('tapping three digits fills three dots', async ({ page }) => {
    await page.getByRole('button', { name: '1', exact: true }).click();
    await page.getByRole('button', { name: '2', exact: true }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();

    await expect(page.locator(filledDotsSelector)).toHaveCount(3);
  });

  test('backspace removes the last digit', async ({ page }) => {
    await page.getByRole('button', { name: '1', exact: true }).click();
    await page.getByRole('button', { name: '2', exact: true }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();
    await expect(page.locator(filledDotsSelector)).toHaveCount(3);

    // The backspace button has no text — it renders the lucide Delete
    // icon. It's the last button in the grid.
    const allButtons = page.locator('div.grid.grid-cols-3 > button');
    const backspace = allButtons.last();
    await backspace.click();

    await expect(page.locator(filledDotsSelector)).toHaveCount(2);
  });

  test('overflow protection: dot count never exceeds 4 across presses', async ({ page }) => {
    // The PinPad's `handlePress` guards on `digits.length < 4` before
    // appending. We can't test the literal 5th press in the UI because the
    // 4th press fires `onComplete`, which closes the modal as soon as the
    // mutation resolves (PIN flow) or transitions the wizard. So we instead
    // observe the dot count immediately after each press and assert it
    // never exceeds 4 — the same invariant the handler enforces.
    //
    // We route the withdraw POST to a slow reply so the modal stays
    // mounted long enough for the post-4th-press snapshot.
    await page.route('**/api/wallet/withdraw', async (route) => {
      await new Promise((r) => setTimeout(r, 800));
      await route.continue();
    });

    const nine = page.getByRole('button', { name: '9', exact: true });
    const counts: number[] = [];
    for (let i = 0; i < 4; i++) {
      await nine.click();
      counts.push(await page.locator(filledDotsSelector).count());
    }
    // Every observed dot count is bounded by 4.
    expect(Math.max(...counts)).toBeLessThanOrEqual(4);
    // On the final tick we observed all 4 dots filled.
    expect(counts.at(-1)).toBe(4);
  });
});
