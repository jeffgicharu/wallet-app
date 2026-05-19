# Consumer-driven contract tests (Pact)

This repo is the **consumer** in a consumer-driven contract test against the [`wallet-api`](https://github.com/jeffgicharu/wallet-api) provider. The consumer expectations live here as Pact tests; the generated pact file is committed under [`./pacts/wallet-app-wallet-api.json`](./pacts/wallet-app-wallet-api.json) so the provider can fetch and verify it.

---

## What Pact testing buys us

Two repos that ship independently can drift silently:

- The frontend's component tests use MSW handlers that the SPA author wrote — they prove "the SPA handles a response of this shape correctly," but not "the API actually sends a response of that shape."
- The backend's integration tests prove "the API returns this shape when called this way," but the consumer's expectation set is invisible to it.
- E2E tests catch the drift only at runtime — too late to block a PR.

Pact closes the loop. The consumer writes pact tests that record every request it makes and every response shape it expects. The provider replays each interaction against a real running backend and verifies the response matches. A breaking change on either side fails CI on the side that has to coordinate.

This complements but does not replace component or integration tests:

| Layer | What it proves |
|---|---|
| Component (Vitest + MSW) | The SPA renders and behaves correctly given a mock response. |
| **Pact (this repo) consumer** | The SPA's expected shape of the API is recorded. |
| **Pact-JVM provider** | The deployed API actually returns that shape. |
| Integration (wallet-api Testcontainers) | The API works against a real Postgres for a given input. |
| E2E (Playwright, future) | Both sides work together end-to-end. |

## Cross-repo flow

```
┌──────────────────┐  1. consumer test                 ┌────────────────┐
│   wallet-app     │ ───── records pact ─────────────▶│ pacts/         │
│  (this repo)     │                                   │ *.json         │
│                  │ ◀──── 2. commit ───────────────── │                │
└──────────────────┘                                   └────────────────┘
                                                              │
                                                              │ 3. raw URL
                                                              ▼
                                                       ┌────────────────┐
                                                       │  wallet-api    │
                                                       │  PACT job in   │
                                                       │     CI         │
                                                       └────────────────┘
                                                              │
                                                              │ 4. verify
                                                              ▼
                                                       ┌────────────────┐
                                                       │ Spring Boot +  │
                                                       │ Testcontainers │
                                                       │ Postgres       │
                                                       └────────────────┘
```

## Transport: raw.githubusercontent.com (deliberate small-team choice)

The pact JSON is committed to this repo at `pacts/wallet-app-wallet-api.json`. The provider's CI fetches it with curl from:

```
https://raw.githubusercontent.com/jeffgicharu/wallet-app/main/pacts/wallet-app-wallet-api.json
```

While both PRs are still in draft, the URL points at the consumer feature branch:

```
https://raw.githubusercontent.com/jeffgicharu/wallet-app/test/pact-consumer-contracts/pacts/wallet-app-wallet-api.json
```

**Trade-off note.** The production pattern is a Pact Broker — either [PactFlow](https://pactflow.io/) (managed) or a self-hosted broker. The broker gives you can-i-deploy checks, webhook-driven verification on consumer pact publish, and tag-based cross-version compatibility. We're skipping it for now because: the small-team raw-URL pattern needs zero additional infrastructure, the consumer + provider repos live under the same GitHub org, and the workflow we currently want (provider verifies on every PR against the latest committed consumer pact) is well-served by `curl` + a static file. Migrating to a broker is a separate PR; nothing in this setup will need to change other than the `@PactUrl` source on the provider side.

## Running consumer tests locally

```bash
npm install
npm run test:pact
```

Output:

```
✓ src/test/pact/wallet-api.pact.test.ts  (15 tests)
  Test Files  1 passed (1)
       Tests  15 passed (15)
```

The pact file is rewritten to `pacts/wallet-app-wallet-api.json` on every run. Inspect with `cat` or `jq`.

## How to make a contract change

1. Edit or add an interaction in `src/test/pact/wallet-api.pact.test.ts`.
2. Run `npm run test:pact` — the regenerated pact file is written to `pacts/`.
3. Inspect the diff (`git diff pacts/`). Sanity-check the change is what you intended.
4. Commit the test code AND the regenerated pact JSON in the same PR.
5. CI on this PR fails if the test code and the committed JSON have diverged (drift-detection step compares `git status pacts/`).
6. Once this PR merges to `main`, the next provider PR pulls the new pact via the raw URL and verifies it.

If the verification on the provider side fails:
- The API needs to change (its current shape no longer matches the consumer's expectation), **or**
- The consumer's expectation is now wrong (revert the pact change here).

The PR description should make clear which side owns the fix. For breaking changes, follow the cross-repo coordination flow in [`wallet-api/QA_BEST_PRACTICES.md`](https://github.com/jeffgicharu/wallet-api/blob/main/QA_BEST_PRACTICES.md#breaking-api-changes).

## Provider side

See [`wallet-api/PACT.md`](https://github.com/jeffgicharu/wallet-api/blob/main/PACT.md).

## Spec version

Pact tests are authored using the V3 API of `@pact-foundation/pact` (consumer-side `PactV3` class). The serialised file lands as **Pact Specification V2** because the matchers used here (`like`, `regex`, `eachLike`) are all V2-compatible and the underlying `pact_ffi` library writes the lowest serialisation that covers the matchers. Pact-JVM 4.6.x on the provider side reads V2 pacts natively. If we ever need V3-only features (parametrised provider states, plurals matcher), the file metadata will move to V3 automatically.

## Known limitations

- Two consumer expectations are intentionally **brittle relative to backlog issues**:
  - The duplicate-idempotency-key interaction expects 409 today (per [`wallet-api`#10](https://github.com/jeffgicharu/wallet-api/issues/10)). When that issue is fixed, this pact must be regenerated to expect 200 with the original transaction body.
  - The transfer-not-found interaction expects 400 today (the provider's current `IllegalArgumentException` mapping). The `TEST_PLAN.md` aspires to 404; flipping it is a separate provider change.
- Filter-by-type on `GET /api/wallet/transactions` is currently a contract for an endpoint shape the SPA does not yet call. It is here so the API stays aware of consumer-side intent.

## File layout

```
pacts/
└── wallet-app-wallet-api.json     (generated; committed)

src/test/pact/
└── wallet-api.pact.test.ts        (15 interactions)

vitest.pact.config.ts              (node env, single fork)
```
