# Quality baseline — wallet-app

A snapshot of what exists today on `main` and where the gaps are. Mirrors the audit pattern applied to [`wallet-api`](https://github.com/jeffgicharu/wallet-api/blob/docs/quality-baseline/AUDIT.md), so each repo has a single page to anchor follow-up changes against.

---

## Stack and versions

| Layer | Choice | Version (from `package.json` on main) |
|---|---|---|
| Library | React | ^19.2.4 |
| Language | TypeScript | ~5.9.3 |
| Build tool | Vite | ^8.0.1 |
| Styling | Tailwind CSS + `@tailwindcss/vite` | ^4.2.2 |
| Data fetching | TanStack React Query | ^5.95.2 |
| Routing | React Router DOM | ^7.13.2 |
| HTTP client | Axios | ^1.14.0 |
| Icons | lucide-react | ^1.7.0 |
| Toasts | react-hot-toast | ^2.6.0 |
| Linter | ESLint + typescript-eslint + eslint-plugin-react-hooks + eslint-plugin-react-refresh | 9.x / 8.x |
| Test runner | _none_ | — |
| Component-test library | _none_ | — |
| E2E framework | _none_ | — |

(Note: the README still says React 18; the actual dependency on `main` is React 19. Worth a docs sync in a separate change.)

Live deployment: `https://wallet.jeffgicharu.com`. Built from the open `feat/env-driven-api-base-url` branch (PR #1) so the dist that's actually serving has `VITE_API_BASE_URL=https://wallet-api.jeffgicharu.com/api` baked in.

## Architecture

Single Vite SPA, TypeScript throughout. Source organised under `src/`:

| Folder | Files | Responsibility |
|---|---|---|
| `src/main.tsx` | 1 | React 19 entry point. Mounts `<App />` into `#root`. |
| `src/App.tsx` | 1 | `BrowserRouter` shell, route table, React Query provider, auth context provider, `Toaster`. |
| `src/api/` | 2 | `client.ts` — Axios instance with bearer-token interceptor and 401 / 403 redirect logic. `wallet.ts` — typed wrappers for every backend call (`authApi.login`, `authApi.register`, `walletApi.getWallet`, `.deposit`, `.withdraw`, `.transfer`, `.getTransactions`, `.getTransaction`). |
| `src/components/` | 3 | `AppShell` (mobile-frame layout), `BottomNav` (tab bar across home / history / profile), `PinPad` (custom slide-up numeric keypad with 4-dot indicator). |
| `src/context/` | 1 | `AuthContext` — login / logout state, persisted in `sessionStorage`, exposes `isAuthenticated`, `fullName`, `phone`. |
| `src/pages/` | 7 | `LoginPage`, `HomePage`, `SendPage` (multi-step wizard), `DepositPage`, `WithdrawPage`, `HistoryPage`, `ProfilePage`. |
| `src/types/index.ts` | 1 | Shared TypeScript types: `ApiResponse<T>`, `WalletInfo`, `Transaction`, `PageData`, `AuthResponse`. |

Routes defined in `App.tsx` and matched against URL paths:

| Path | Page | Auth required |
|---|---|---|
| `/login` | `LoginPage` | no |
| `/` | `HomePage` | yes (redirects to `/login` if no token) |
| `/send` | `SendPage` | yes |
| `/deposit` | `DepositPage` | yes |
| `/withdraw` | `WithdrawPage` | yes |
| `/history` | `HistoryPage` | yes |
| `/profile` | `ProfilePage` | yes |

The PIN pad component is the most distinctive piece: a portable React component that renders a four-dot indicator above a numeric keypad, slides up as a bottom sheet, and feeds its value into whatever wizard is hosting it (Send, Withdraw). Worth its own component test once a test runner exists.

## Build and run

Verified on this baseline:

```bash
npm ci                         # install
npm run dev                    # Vite dev server on :3002, proxies /api to :8080
npm run build                  # tsc -b && vite build → dist/
npm run preview                # serves the built dist locally for spot-check
npm run lint                   # eslint . (currently not invoked in CI)
```

`npm run build` on `main` produces:

| File | Size | Gzipped |
|---|---|---|
| `dist/index.html` | 0.46 kB | 0.29 kB |
| `dist/assets/index-*.css` | 20.33 kB | 4.71 kB |
| `dist/assets/index-*.js` | 346.44 kB | 110.80 kB |
| **Total dist** | **~392 kB** | — |

Build wall time on a developer laptop is ~600 ms after the warm `tsc -b`.

## Live deployment context

`https://wallet.jeffgicharu.com` is served by nginx from `/var/www/wallet.jeffgicharu.com/html/` on the same VPS that runs the API. The deployed build was made from `feat/env-driven-api-base-url` (PR #1) with `VITE_API_BASE_URL=https://wallet-api.jeffgicharu.com/api` set at build time, so the bundle ships with the production origin baked in. The default behaviour (no env var) still falls back to `/api` for the Vite dev proxy.

CORS on the API side is allow-listed to `https://wallet.jeffgicharu.com`, so a real browser session against the deployed app works end-to-end (this was the missing link the audit on the API side captured in its own commit history). Demo credentials reset daily at 03:00 UTC: `alice@demo.local` / `pass1234` / PIN `1234`.

## Existing tests

**Zero.** Stated explicitly because that's the baseline. Concretely:

- No Vitest installed, no `vitest.config.ts`, no `*.test.ts` / `*.test.tsx` files anywhere.
- No React Testing Library, no jest-dom, no MSW.
- No Playwright or Cypress, no `playwright.config.ts`, no E2E folder.
- No `npm test` script in `package.json` — the `scripts` section is `dev`, `build`, `lint`, `preview`.
- No mock service worker or contract tests against the wallet-api OpenAPI doc.

The PIN pad, the multi-step Send wizard, the auth interceptor (which redirects to `/login` on 401/403), and the React Query cache invalidation are all currently un-asserted by anything.

## Existing CI

`.github/workflows/ci.yml` is a single job:

```yaml
name: CI
on:
  push:    { branches: [main] }
  pull_request: { branches: [main] }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run build
      - run: docker build -t wallet-app:${{ github.sha }} .
```

What it covers:

- `npm ci` — dependency install (clean, no lockfile drift).
- `npx tsc --noEmit` — the TypeScript compiler in dry-run mode acts as the only type-safety check.
- `npm run build` — Vite production build must succeed.
- `docker build` — the multi-stage `Dockerfile` (node:22-alpine build → nginx:alpine runtime, port 3002) must build.

What it does **not** cover:

- ESLint is configured but `npm run lint` is not invoked.
- No tests, because there are none.
- No bundle-size budget check.
- No accessibility lint (`@axe-core/react` or `eslint-plugin-jsx-a11y`).
- No deploy step.
- No SAST / SCA (no Trivy, no Snyk, no `npm audit` step).

## Identified gaps

### Test surface

- **No unit tests.** Vitest is the natural fit (it shares Vite's transform pipeline so config is minimal). The PIN pad's keypress handling, the `formatCurrency` / `parseAmount` helpers (currently inline), and the `AuthContext` reducer-style state would all benefit from unit tests.
- **No component tests.** `@testing-library/react` plus `vitest` would cover the seven page components: input validation on Login, the multi-step state transitions on Send, the show / hide toggle on the balance card, the preset-amount buttons on Deposit / Withdraw.
- **No E2E tests.** Playwright would cover the cross-page flows: login → home → send → success → history. With the live demo accounts that reset nightly, E2E can hit `https://wallet.jeffgicharu.com` directly in CI on a schedule, or hit a locally-built preview server on every PR.
- **No API integration tests.** A small MSW handler set, generated against the OpenAPI doc that wallet-api already exposes, would let component tests pretend the real API is there without spinning up Spring Boot.
- **No contract tests on the consumer side.** Pact (consumer side) would write expectations for every `walletApi` and `authApi` call; the matching provider verification on `wallet-api` would replay them. Today the two repos can drift silently.

### Build quality

- **No bundle-size budget.** 392 kB is small for a financial-app SPA, but there's no failing check that catches a 4× regression. `vite-plugin-bundle-analyzer` or a simple `bundlewatch` step in CI would close this.
- **ESLint configured but not enforced.** Adding `npm run lint` to CI is a one-line change.
- **No accessibility lint.** `eslint-plugin-jsx-a11y` would catch obvious a11y misses (missing labels, role mismatches) at lint time. With a finance SPA this matters: keyboard-only PIN entry, screen-reader-friendly transaction lists, sufficient colour contrast.

### Security

- **JWT stored in `sessionStorage`.** Currently used in `src/api/client.ts:9` and `src/context/AuthContext.tsx`. Better than `localStorage` (cleared on tab close, less likely to leak across origins) but still reachable from any JavaScript that runs on the page — an XSS in any third-party library or even a misconfigured `dangerouslySetInnerHTML` would expose it. `httpOnly` cookies via the API would be safer; that's a coordinated change with `wallet-api`, not something the frontend can do alone.
- **No XSS-input audit.** Inputs (email, phone, amount, description, PIN) are passed straight to `axios.post` without sanitisation. React's default escaping protects against XSS at the rendering boundary, but anything that ever ends up in `dangerouslySetInnerHTML` or as an `href` attribute would need explicit handling.
- **No CSP header.** The bundled `nginx.conf` (used inside the Docker image) sets no `Content-Security-Policy`. The deployed nginx site config also doesn't.
- **Open npm advisories on `main`.** `npm audit` on `main` reports **4 advisories (2 moderate, 2 high)** — axios SSRF / prototype-pollution chain, follow-redirects header leak, postcss XSS, vite path-traversal / WebSocket / `server.fs.deny` bypass. All four are non-breaking-fix-available and **PR #1 (`feat/env-driven-api-base-url`) already runs `npm audit fix` and clears them** — so the fix is in flight, just not on `main` yet.
- **No SAST / SCA in CI.** Snyk, Trivy on the nginx image, and `npm audit --audit-level=moderate` should all live in CI before non-demo use.

### Performance

- **No runtime perf budget.** No Lighthouse run in CI, no Core-Web-Vitals threshold, no WebPageTest harness.
- **No code-split.** Single bundle today; route-based code-splitting via `React.lazy` would shave the initial download for users who only ever hit `/login` and `/`.

### Reporting and observability

- **No frontend telemetry.** No analytics, no error reporter (Sentry / Rollbar / Bugsnag), no Web-Vitals beacon. A live demo session that hits an unhandled promise rejection just disappears.
- **No quality dashboard.** Same finding as on the API side: aggregated coverage / a11y / lint / bundle-size view does not exist.

### Documentation

- README claims React 18; actual is React 19.
- No `CONTRIBUTING.md`, no architecture diagram, no design-decision log.
- No screenshot or short clip of the deployed app in the README.

## Cross-references

- API-side audit and findings: [`jeffgicharu/wallet-api` PR #6](https://github.com/jeffgicharu/wallet-api/pull/6).
- API issues filed during deployment: jeffgicharu/wallet-api #2 (admin role check), #3 (ddl-auto update), #4 (hardcoded JWT default), #5 (open-in-view).

## What this audit is not

It does not propose fixes, and it does not change any application code. The only commit on this branch is this `AUDIT.md`.
