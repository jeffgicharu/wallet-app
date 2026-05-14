# Playwright E2E suite

End-to-end browser verification for the wallet app, organized into two layers:

| Folder | Target | Discipline | Project names |
|---|---|---|---|
| `e2e/local/` | local docker-compose / `npm run dev` against a fresh `wallet-api` | comprehensive — 14 specs, characterizations of known bugs, can mutate state | `local-chromium`, `local-firefox`, `local-webkit` |
| `e2e/live-smoke/` | `https://wallet.jeffgicharu.com` + `https://wallet-api.jeffgicharu.com` | gentle — 7 specs, read-only on server state, retries 2, workers 1, no money-moving submits | `live-smoke-chromium`, `live-smoke-firefox`, `live-smoke-webkit` |

The intent: local proves the **code** works; live-smoke proves the **deployed system** works. Recruiters click the live URL; production-quality verification needs both layers.

## Running the suites

```bash
# Comprehensive local run (needs docker-compose stack + wallet-app dev server)
npm run test:e2e:local

# Live smoke against the public deploy (gentle, retried, serial)
npm run test:e2e:live

# Both (CI uses these separately)
npm run test:e2e

# Interactive UI mode for debugging
npm run test:e2e:ui
```

Set `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1` if you're on a host without the exact `libicu` Playwright wants but the browsers can otherwise launch (e.g. Ubuntu 24.04 with libicu76 installed).

## Local prerequisites

The local layer expects:

1. `wallet-api` reachable on `http://localhost:8080` — bring it up via `docker compose up -d` from the wallet-api repo.
2. The dev server reachable on `http://localhost:3002` — run `npm run dev` here.
3. Three demo users seeded on the local API. Seed them once after a fresh `docker compose up -d`:

```bash
for name in alice bob carol; do
  case $name in alice) phone=+254700000001;; bob) phone=+254700000002;; carol) phone=+254700000003;; esac
  curl -s -X POST http://localhost:8080/api/auth/register \
    -H 'Content-Type: application/json' \
    -d "{\"fullName\":\"${name^} Demo\",\"email\":\"$name@demo.local\",\"phoneNumber\":\"$phone\",\"password\":\"pass1234\",\"pin\":\"1234\"}"
done
# then seed balances by logging in and depositing — see e2e/local/05-send-money-wizard.spec.ts beforeAll for the pattern
```

## Demo accounts (local + live)

The same credentials work on local (after seeding) and live (kept fresh by a daily 03:00 UTC reseed cron on the VPS). Tests treat balances as approximate because money moves through the demo all day:

| Email | Password | PIN | Phone | Balance after fresh seed |
|---|---|---|---|---|
| `alice@demo.local` | `pass1234` | `1234` | `+254700000001` | ~KES 50,000 |
| `bob@demo.local` | `pass1234` | `1234` | `+254700000002` | ~KES 25,000 |
| `carol@demo.local` | `pass1234` | `1234` | `+254700000003` | ~KES 10,000 |

Live tests tolerate balance drift between seeds — they assert presence of `KES` and the balance section, not specific amounts.

## Characterization tests (`test.fail()`)

A characterization test reproduces a known bug. It expects-fail today; when the bug is fixed it flips to unexpected-pass and forces the test to be updated to the corrected behavior. Each carries a comment linking to the GitHub issue.

Coverage today (8 local + 5 live = 13 characterizations):

| Issue | Layer | Spec file | What it documents |
|---|---|---|---|
| `wallet-app#5` | local + live | `11-known-bug-characterization`, `06-live-bug-characterization` | LoginPage has no client-side validation; submits empty form to API |
| `wallet-app#6` | local + live | `11-known-bug-characterization`, `04-live-send-wizard-readonly` | Send confirm step omits the transfer fee row |
| `wallet-app#7` | local + live | `11-known-bug-characterization`, `06-live-bug-characterization` | Send wizard's amount step omits the daily transfer limit hint |
| `wallet-app#8` | local + live | `11-known-bug-characterization`, `06-live-bug-characterization` | Tapping a transaction navigates to `/history/{ref}` — an unregistered route |
| `wallet-api#2` | local | `11-known-bug-characterization` | AdminController endpoints accept any authenticated JWT |
| `wallet-api#9` | local | `13-pin-lockout-characterization` | PIN lockout counter rolls back on validation failure (3 wrong + correct still succeeds) |
| `wallet-api#10` | local | `14-idempotency-characterization` | Duplicate idempotency key returns 409 instead of the original response |
| `wallet-api#20` | local + live | `11-known-bug-characterization`, `05-live-multi-tenant-probe` | `GET /api/wallet/transactions/{ref}` returns any user's transaction by reference |

## Mobile viewport

`12-mobile-viewport.spec.ts` re-runs the canonical login → send → confirm flow on a Pixel 5 emulated viewport to catch mobile-only regressions in the bottom nav, the PIN pad sheet, and the wizard layout.

## CI

- `.github/workflows/e2e-local.yml` — PR + push: brings up docker-compose, seeds demo users, runs `test:e2e:local`, uploads `playwright-report/` as an artifact.
- `.github/workflows/e2e-live-smoke.yml` — PR + push + daily 06:00 UTC cron + `workflow_dispatch`: runs `test:e2e:live` against the public deploy.

Both workflows skip Playwright's host-dependency validation (`PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`) because the GitHub runner image already has the binaries Playwright needs.
