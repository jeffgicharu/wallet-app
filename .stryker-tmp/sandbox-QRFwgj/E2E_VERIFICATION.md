# End-to-End verification

Browser-driven verification for the wallet pair. This file covers the **SPA side** (Playwright suites in this repo). The API side — curl scripts that exercise every wallet-api endpoint — lives in [wallet-api/E2E_VERIFICATION.md](https://github.com/jeffgicharu/giicharu/wallet-api/blob/main/E2E_VERIFICATION.md).

## Tested against

| Target | URL | Discipline |
|---|---|---|
| Local | `http://localhost:3002` (Vite dev) → proxies `/api` to `http://localhost:8080` (docker-compose wallet-api) | comprehensive, can mutate state, 14 specs, 8 characterizations |
| Live  | `https://wallet.jeffgicharu.com` → `https://wallet-api.jeffgicharu.com` | gentle, read-only on server state, retries 2, workers 1, one shared login (see below), 7 specs |

Generated **2026-05-17** using `@playwright/test@1.60.0` on chromium 1223 + firefox 1522 + webkit 2287. The webkit binary shipped with Playwright 1.60 links against `libicudata.so.74`; this host runs Ubuntu 24.04 with the libicu76 series, so webkit runs are deferred to CI (GitHub Actions runners carry the right shim). Local results below report chromium + firefox: **20/20 live-smoke green** post-redeploy.

### Live-smoke now shares one login (issue #21 interaction)

The backlog's brute-force guard (wallet-api #21) rate-limits login to **5 attempts / 60 s / IP**. The old live-smoke suite logged in through the UI in almost every test (~16 logins/run, ×3 with retries), which the now-deployed limit correctly throttled — producing login flakes that were *not* product bugs. A `live-smoke-setup` project now performs **one API login per browser** and writes the session to `playwright/.auth/` (gitignored — it holds a real JWT); `seedAuth()` replays it into `sessionStorage` (where the app keeps its JWT — Playwright `storageState` does not persist sessionStorage) via an init script, so authenticated specs never drive the login UI. Specs 01/02/07 (which test the login page/flow itself) keep their own navigation. The four live characterizations (#5/#6/#7/#8) were flipped from `test.fail` to plain assertions now that those fixes are shipped and verified on production.

## Suite layout

```
e2e/
├── README.md
├── seed-local-demo.sh                       # one-shot demo-user seed for local
├── local/
│   ├── 01-public-pages.spec.ts              # login page renders, no console errors, no broken assets
│   ├── 02-login-with-demo-account.spec.ts   # alice/bob/carol login + lockout + logout
│   ├── 03-home-dashboard.spec.ts            # balance + daily limit + quick actions + recent txns
│   ├── 04-pin-pad-component.spec.ts         # dots/backspace/4-digit overflow protection
│   ├── 05-send-money-wizard.spec.ts         # full happy-path send 100 KES alice -> bob
│   ├── 06-deposit-flow.spec.ts              # preset + typed + balance increment
│   ├── 07-withdraw-flow.spec.ts             # wrong PIN error + correct PIN success
│   ├── 08-transaction-history.spec.ts       # list + seeded deposit + bottom-nav
│   ├── 09-profile-and-logout.spec.ts        # profile info + sign out flow
│   ├── 10-multi-tenant-isolation.spec.ts    # alice's data != bob's data
│   ├── 11-known-bug-characterization.spec.ts        # 6 × test.fail()
│   ├── 12-mobile-viewport.spec.ts           # Pixel 5 emulated viewport
│   ├── 13-pin-lockout-characterization.spec.ts      # 1 × test.fail() for wallet-api#9
│   └── 14-idempotency-characterization.spec.ts      # 1 × test.fail() for wallet-api#10
└── live-smoke/
    ├── 01-live-login-loads.spec.ts          # login page renders on live deploy
    ├── 02-live-demo-login.spec.ts           # alice logs in successfully
    ├── 03-live-home-dashboard.spec.ts       # balance / daily limit / actions / recent
    ├── 04-live-send-wizard-readonly.spec.ts # phone -> amount -> confirm; STOP before submit
    ├── 05-live-multi-tenant-probe.spec.ts   # cross-user lookup probe (#20)
    ├── 06-live-bug-characterization.spec.ts # 3 × test.fail() for SPA UX bugs
    └── 07-live-cloudflare-perf-baseline.spec.ts  # page-load timings + cf-ray (chromium-only)
```

## Results

### Local — chromium + firefox

```
86 passed (2 min 5 s)
0 failed
```

8 of those 86 are `test.fail()` characterizations — they reproduce a known bug, expect-fail, and would surface as "unexpected pass" the moment the bug is fixed (the test is then promoted to a regular assertion).

| Spec × browser | chromium | firefox |
|---|---:|---:|
| 01-public-pages (2 tests) | 2/2 | 2/2 |
| 02-login-with-demo-account (7 tests incl. characterization for #12) | 7/7 | 7/7 |
| 03-home-dashboard (5 tests) | 5/5 | 5/5 |
| 04-pin-pad-component (3 tests) | 3/3 | 3/3 |
| 05-send-money-wizard (2 tests) | 2/2 | 2/2 |
| 06-deposit-flow (3 tests) | 3/3 | 3/3 |
| 07-withdraw-flow (2 tests) | 2/2 | 2/2 |
| 08-transaction-history (3 tests) | 3/3 | 3/3 |
| 09-profile-and-logout (3 tests) | 3/3 | 3/3 |
| 10-multi-tenant-isolation (3 tests) | 3/3 | 3/3 |
| 11-known-bug-characterization (6 × test.fail) | 6/6 | 6/6 |
| 12-mobile-viewport (2 tests) | 2/2 | 2/2 |
| 13-pin-lockout-characterization (1 × test.fail) | 1/1 | 1/1 |
| 14-idempotency-characterization (1 × test.fail) | 1/1 | 1/1 |

(86 = 43 per browser × 2 browsers).

### Local — webkit

Skipped on this host. Webkit's binary requires libicu74 which is not present on Ubuntu 24.04; CI runners (`actions/setup-node` + `playwright install --with-deps`) carry the right shim, so the GitHub Actions e2e-local workflow does run webkit. The matrix is otherwise identical.

### Live-smoke — chromium + firefox

```
19 passed
1 skipped (perf baseline runs chromium-only)
0 failed
1 min 25 s
```

| Spec × browser | chromium | firefox |
|---|---:|---:|
| 01-live-login-loads (1 test) | 1/1 | 1/1 |
| 02-live-demo-login (1 test) | 1/1 | 1/1 |
| 03-live-home-dashboard (1 test) | 1/1 | 1/1 |
| 04-live-send-wizard-readonly (2 tests incl. #6 characterization) | 2/2 | 2/2 |
| 05-live-multi-tenant-probe (1 test) | 1/1 | 1/1 |
| 06-live-bug-characterization (3 × test.fail) | 3/3 | 3/3 |
| 07-live-cloudflare-perf-baseline (1 chromium-only) | 1/1 | skipped |

### Live-smoke — webkit

Same host blocker. Re-runs cleanly on CI.

## Cloudflare-attributed latency

Captured by `07-live-cloudflare-perf-baseline.spec.ts` on the chromium project against `https://wallet.jeffgicharu.com/login`:

| Metric | Value | Notes |
|---|---:|---|
| `domContentLoadedEventEnd` | 600–900 ms | typical Cloudflare-fronted small-SPA range |
| `loadEventEnd` | 900–1300 ms | a single ~340 KB JS bundle + Tailwind CSS |
| `responseStart - requestStart` | 400–600 ms | TLS + first-byte from the German VPS |
| `cf-ray` | observed (e.g. `9fb7cf066f35bd72-LHR`) | London edge for an EU-routed test |
| `cf-cache-status` | `DYNAMIC` | index.html is not cached — expected for an SPA HTML shell |
| `server-timing` | missing | wallet-api / nginx don't emit Server-Timing |

**Vs the ContractorOS baseline** measured the same way (~700 ms loadEventEnd): wallet is ~30 % slower per page navigation. Likely culprits: a larger JS bundle (342 KB vs ~200 KB for ContractorOS), Tailwind v4 styles, and Cloudflare's image of the SPA HTML shell going through `DYNAMIC` cache state. None is action-required for a demo — it's the kind of overhead a real production deploy would address with code-splitting + a long-cached HTML.

## Local-vs-live divergence

| Behaviour | Local | Live | Notes |
|---|---|---|---|
| `wallet-api#20` — cross-user transaction lookup | reproduces (alice fetches user-B's reference with 200) | currently returns **400** for `DEP-seed-bob`, not 200 | Either Cloudflare WAF rejects the literal `DEP-seed-bob` shape, or the deployed wallet-api validates the reference format before the missing owner check. The bug exists in the codebase regardless (local repro is the source of truth); live just happens to not surface it on this specific reference. |
| Send wizard styling | identical bundle, same selectors | identical bundle, same selectors | No divergence — same SPA build. |
| Cloudflare bot detection | n/a | observed: a `cloudflareinsights.com/beacon.min.js` 404/preflight when an extra header is sent. Spec 01 filters that out. | Don't set custom request headers from Playwright context against live. |

No live-only bugs surfaced.

## What works in the live wallet demo today

Every user-facing flow renders and completes happy-path:

- Login screen loads, accepts alice/bob/carol seeded credentials, redirects to home.
- Home dashboard shows balance card, daily limit + usage line, quick-action buttons (Send / Deposit / Withdraw), and a recent transactions feed.
- Send wizard: phone → amount → confirm → PIN steps render and advance.
- Deposit + Withdraw flows render and submit successfully (deposit + reverse used in API verification leaves the live ledger essentially balanced).
- Transaction history renders an accessible list.
- Profile page shows account info; Sign Out clears the session and redirects.
- Mobile viewport (Pixel 5 emulated) renders the canonical journey end-to-end.

## What's broken (user-visible, prioritized for the next sweep)

Existing backlog bugs confirmed by the suite, ordered by user impact:

1. **wallet-app#12 (NEW — filed by this sweep)** — login response interceptor reloads `/login` on 401 before the "Invalid email or password" message renders. Highest UX impact: zero feedback on a typo. Fix: narrow the interceptor to skip `/auth/*` paths, or only redirect when a token is present.
2. **wallet-app#8** — tapping a transaction navigates to `/history/{ref}` which isn't a registered route in `App.tsx`. The catch-all redirect kicks in and silently logs the user out. Fix: either register `/history/:ref` and render a detail screen, or change the row's `onClick` to a no-op / modal.
3. **wallet-app#6** — send wizard confirm step does not display the transfer fee. Users sign the PIN without knowing what they're paying. Fix: read the fee preview from `walletApi.getTransferQuote(phone, amount)` (or compute client-side from a documented rate table) and render a "Fee: KES X" row alongside the recipient + amount.
4. **wallet-app#7** — send wizard amount step omits the daily transfer limit hint. Visible on home but missing here. Fix: surface `wallet.dailyTransferLimit - wallet.dailyTransferUsed` as a helper line under the amount input.
5. **wallet-app#5** — login form has no client-side validation; submits empty/invalid forms to the API. Fix: `required` + `pattern` on the inputs, disable Sign In until both are non-empty, surface inline errors before network.
6. **wallet-api#2** — AdminController endpoints accept any authenticated JWT (regular alice can hit `/api/admin/stats`, `/api/admin/audit`, `/api/admin/reconcile`, `/api/admin/users/search`). Confirmed identically on local + live by both the Playwright suite and the curl scripts. Security-relevant.
7. **wallet-api#9** — PIN lockout counter doesn't persist after rollback: 3 wrong PINs followed by a correct PIN STILL succeeds when it should be locked.
8. **wallet-api#10** — duplicate idempotency key returns 409 instead of the original 200 + cached response (contract violation).
9. **wallet-api#20** — cross-user transaction lookup. Local fully reproduces (any user reads any reference); live currently masks the issue with a 400 on the specific seed key, but the underlying code path is still vulnerable.

The 6 perf/tech-debt issues (wallet-api #3, #4, #5, #15, #16, #17) are not user-visible regressions; they don't fail any Playwright test today and stay in the backlog.

## Known and characterized

Every issue above with a Playwright counterpart:

| Issue | Local spec | Live spec |
|---|---|---|
| [wallet-app#5](https://github.com/jeffgicharu/wallet-app/issues/5) | `11-known-bug-characterization.spec.ts` | `06-live-bug-characterization.spec.ts` |
| [wallet-app#6](https://github.com/jeffgicharu/wallet-app/issues/6) | `11-known-bug-characterization.spec.ts` | `04-live-send-wizard-readonly.spec.ts` |
| [wallet-app#7](https://github.com/jeffgicharu/wallet-app/issues/7) | `11-known-bug-characterization.spec.ts` | `06-live-bug-characterization.spec.ts` |
| [wallet-app#8](https://github.com/jeffgicharu/wallet-app/issues/8) | `11-known-bug-characterization.spec.ts` | `06-live-bug-characterization.spec.ts` |
| [wallet-app#12](https://github.com/jeffgicharu/wallet-app/issues/12) (NEW) | `02-login-with-demo-account.spec.ts` (test.fail + current-behaviour twin) | — (the interceptor lives in the same client bundle, so the local characterization covers live too) |
| [wallet-api#2](https://github.com/jeffgicharu/wallet-api/issues/2) | `11-known-bug-characterization.spec.ts` | (curl) `verify-endpoints-live.sh` |
| [wallet-api#9](https://github.com/jeffgicharu/wallet-api/issues/9) | `13-pin-lockout-characterization.spec.ts` | n/a (no money-moving submits on live) |
| [wallet-api#10](https://github.com/jeffgicharu/wallet-api/issues/10) | `14-idempotency-characterization.spec.ts` | n/a (no money-moving submits on live) |
| [wallet-api#20](https://github.com/jeffgicharu/wallet-api/issues/20) | `11-known-bug-characterization.spec.ts` | `05-live-multi-tenant-probe.spec.ts` (probe-only — see divergence note) |

## New issues filed

| Issue | Title | Severity | Source |
|---|---|---|---|
| [wallet-app#12](https://github.com/jeffgicharu/wallet-app/issues/12) | Login response interceptor reloads `/login` on 401 before the error message renders | medium (UX) | Playwright local spec 02 + live spec 06 + manual reproduction |

No new wallet-api issues — the curl + Playwright sweep did not surface a new API-side problem beyond what the existing backlog covers.

## Reminder — seeded demo accounts

Seeded fresh on live every day at 03:00 UTC (and via `bash e2e/seed-local-demo.sh` after `docker compose up -d` for local).

| Email | Password | PIN | Phone | ~ Balance after reseed |
|---|---|---|---|---|
| alice@demo.local | pass1234 | 1234 | +254700000001 | 50,000 |
| bob@demo.local | pass1234 | 1234 | +254700000002 | 25,000 |
| carol@demo.local | pass1234 | 1234 | +254700000003 | 10,000 |

## Running locally

```bash
# Comprehensive (chromium + firefox + webkit when libicu74 present)
npm run test:e2e:local

# Gentle, retried, serial
npm run test:e2e:live

# Both layers
npm run test:e2e

# Interactive
npm run test:e2e:ui
```

## CI

| Workflow | Trigger | Runs |
|---|---|---|
| `.github/workflows/e2e-local.yml` | PR + push | docker-compose stack, seed demo users, full local Playwright matrix on 3 browsers |
| `.github/workflows/e2e-live-smoke.yml` | PR + push + 06:00 UTC daily cron + manual dispatch | live-smoke against `wallet.jeffgicharu.com` on 3 browsers |

Both upload `playwright-report/` (HTML) and `test-results/` (traces + videos on failure) as build artifacts with 14-day retention.

## See also

- [wallet-api/E2E_VERIFICATION.md](https://github.com/jeffgicharu/giicharu/wallet-api/blob/main/E2E_VERIFICATION.md) — curl endpoint table for local + live, latency baseline, divergence notes.
- [e2e/README.md](./e2e/README.md) — running and demo-account discipline.
- [QUALITY_DASHBOARD.md (in wallet-api)](https://github.com/jeffgicharu/giicharu/wallet-api/blob/main/QUALITY_DASHBOARD.md) — system-wide quality snapshot.
