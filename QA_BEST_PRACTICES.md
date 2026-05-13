# QA Best Practices — wallet-app

See [`wallet-api/QA_BEST_PRACTICES.md`](https://github.com/jeffgicharu/wallet-api/blob/main/QA_BEST_PRACTICES.md) for the system-wide standards: code-review checklist, BDD test naming, test-independence rules, flaky-test policy, mock-vs-real defaults, conventional-commit prefixes for tests, PR requirements, and cross-repo coordination flow.

What follows are the **frontend-specific additions** that don't show up on the API side.

## Frontend-specific additions

- **Accessibility review checklist** — every PR that adds or modifies a page or interactive component reviews against this short list before approve:
  - Every interactive element is reachable by keyboard (Tab / Shift-Tab order is logical, focus is visible).
  - Every form input has a programmatically associated label.
  - Colour is not the only signal: status / error states have an icon or text in addition to colour.
  - All images have meaningful `alt` text or `alt=""` if decorative.
  - Modals and bottom sheets (the `PinPad` is the obvious one) trap focus while open and restore it on close.
  - The page has a single `<h1>` and a sensible heading hierarchy.
  - axe-core in the matching Playwright spec reports zero `serious` / `critical` violations.

- **Performance budget enforcement.** Every PR that touches `package.json` or anything in `src/` runs the bundle-size check. If `dist/` grows beyond 500 kB ungzipped, the PR description must explain why; lazy-loading via `React.lazy` is the first thing to try.

- **Design-system component reuse rule.** Before introducing a new bespoke button / input / modal in a page component, check whether `src/components/` already has one (`AppShell`, `BottomNav`, `PinPad`, plus whatever lands later). If a near-match exists, extend it. Reviewers ask "could this have used the existing component" before approving a new one.

- **Lighthouse on the built dist.** Performance ≥ 85 (mobile profile), Accessibility = 100, Best Practices ≥ 90, SEO not gated. Failures must be addressed in the PR or explicitly waived in the description with reasoning.

- **No console.log, no commented-out code in `src/`.** Tests for hooks, components, and helpers do not leave debugging artefacts behind; the eslint config gates this.

- **JWT handling in tests.** Tests that exercise the auth interceptor should not pin `sessionStorage` as the storage location — assert against `useAuth()` state. This keeps the tests valid when the storage location moves to in-memory state or `httpOnly` cookies.

- **Snapshot tests are last-resort.** Prefer behavioural assertions ("the error toast is visible", "the balance is `KES 50,000`") over `toMatchSnapshot()`. Snapshots are accepted only for deeply nested rendered output where a structural assertion would be unreadable, and every snapshot has a brief comment explaining what change should re-bless it.

## See also

- [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) — frontend-specific notes pointing at the system-wide strategy.
- [`AUDIT.md`](./AUDIT.md) — current state and gap list.
