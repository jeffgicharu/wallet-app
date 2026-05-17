import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';

// The app stores its JWT in sessionStorage (see AuthContext), which
// Playwright's storageState does NOT persist. Instead we replay the
// single session captured by _auth.setup.ts via an init script, so
// every navigation in the page starts authenticated with no UI login —
// keeping the suite under the live #21 login rate limit.

const AUTH_FILE = path.join(process.cwd(), 'playwright', '.auth', 'live-alice.json');

export async function seedAuth(page: Page): Promise<void> {
  const a = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
  await page.addInitScript((s) => {
    sessionStorage.setItem('token', s.token);
    sessionStorage.setItem('fullName', s.fullName);
    sessionStorage.setItem('phone', s.phone);
  }, a);
}
