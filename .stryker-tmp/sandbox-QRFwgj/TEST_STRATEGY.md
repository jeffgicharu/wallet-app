# Test Strategy — wallet-app

This SPA is part of the **Wallet System**. The full system test strategy lives in [`wallet-api/TEST_STRATEGY.md`](https://github.com/jeffgicharu/wallet-api/blob/main/TEST_STRATEGY.md) and is the source of truth for which tools, layers, gates, and targets apply across both repos.

What follows is the short list of things that are *frontend-specific* — conventions and decisions that don't appear in the system doc because they only make sense on this side of the wire.

## Frontend-specific notes

- **React Testing Library queries.** Prefer the user-facing queries in this order: `getByRole`, `getByLabelText`, `getByPlaceholderText`, `getByText`, `getByDisplayValue`. Reach for `getByTestId` only when none of the above can express the intent — it is an escape hatch, not a default.
- **Accessibility gating.** Every Playwright spec runs `@axe-core/playwright` on every visited page and asserts zero `serious` / `critical` violations. The gate is part of the same job, not a separate one — if a page is broken for a screen reader, the suite is red.
- **Bundle-size budget.** `dist/` size is checked against a budget on every PR. Today the bundle is ~392 kB ungzipped; the budget is 500 kB ungzipped, raised only with explicit justification.
- **JWT lives in memory, not localStorage.** As the system strategy notes, `sessionStorage` was the migration path during the deployment recon. The next step is to move JWT into a React `AuthContext` ref (or, ideally, into `httpOnly` cookies once the API supports it). Tests that assert anything about JWT placement should not pin a specific storage mechanism — they should test "the auth context resolves the token" and "logout clears it."
- **MSW for component-test API mocking.** Component tests do not call a real backend. Each test file imports a shared MSW handler bundle and overrides only the responses that scenario cares about. Pact contracts pinned in `wallet-api` guarantee these handlers stay in sync with the real API shape.
- **Lighthouse on the built dist.** A CI job runs Lighthouse against `npm run preview` and gates on the system targets (performance ≥ 85 mobile, accessibility = 100, best-practices ≥ 90).
- **Test data factories.** `src/test/factories/` exports `makeUser()`, `makeWallet()`, `makeTransaction(type)`. Component tests build fixtures from these; no test contains a 50-line literal user object.
- **Routes-as-tests scaffolding.** Each of the seven routes (`/login`, `/`, `/send`, `/deposit`, `/withdraw`, `/history`, `/profile`) gets one component test file. The Send wizard, with its multi-step state and the PIN pad, gets the most coverage attention.

## Where to read next

- [`QA_BEST_PRACTICES.md`](./QA_BEST_PRACTICES.md) — frontend-specific addendum to the system-wide standards.
- [`AUDIT.md`](./AUDIT.md) — what exists today, where the gaps are.
- [`wallet-api/TEST_PLAN.md`](https://github.com/jeffgicharu/wallet-api/blob/main/TEST_PLAN.md) — the cross-repo workflow that drives the priority ordering of frontend tests.
