import { test as setup, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// One login per browser project, via the API (not the UI). The live
// deploy enforces the issue #21 brute-force guard (5 login attempts /
// 60s / IP). The smoke suite used to log in through the UI in almost
// every test, which tripped that limit and produced login flakes. This
// setup authenticates exactly once; seedAuth() (see _session.ts) then
// injects the resulting session into every spec without another login.

const AUTH_FILE = path.join(process.cwd(), 'playwright', '.auth', 'live-alice.json');
const API = process.env.LIVE_API_URL ?? 'https://wallet-api.jeffgicharu.com';

setup('authenticate alice once', async ({ request }) => {
  const res = await request.post(`${API}/api/auth/login`, {
    data: { email: 'alice@demo.local', password: 'pass1234' },
  });
  expect(res.ok(), `login failed: ${res.status()}`).toBeTruthy();
  const body = await res.json();
  const d = body.data;
  expect(d.token, 'no token in login response').toBeTruthy();

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  fs.writeFileSync(
    AUTH_FILE,
    JSON.stringify({ token: d.token, fullName: d.fullName, phone: d.phoneNumber }),
  );
});
