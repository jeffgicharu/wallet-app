# Mutation testing (Stryker)

Mutation testing complements line / branch coverage. Coverage tells you a line was *reached* during a test; it does not tell you the test *verified* what the line does. Stryker mutates the source (flips an `<` to `<=`, removes a conditional, replaces a return value with `undefined`) and re-runs the test suite. If a test fails, the mutation was *killed* — proving at least one test asserted the mutated behaviour. If every test still passes, the mutation *survived*: the test suite walked over the code without checking what it does, and a real bug there could ship green.

The matching tooling on the API side is PIT — see [`wallet-api/MUTATION_TESTING.md`](https://github.com/jeffgicharu/wallet-api/blob/main/MUTATION_TESTING.md).

---

## Setup

Stryker 9.6.1 with the Vitest runner, declared in `package.json` and configured in `stryker.config.mjs`. Configuration lives in a single file; the salient bits:

| Field | Value | Why |
|---|---|---|
| `testRunner` | `vitest` | Runs the existing component test suite directly. |
| `vitest.configFile` | `vite.config.ts` | Reuses the same Vitest setup that `npm run test:run` uses. |
| `vitest.related` | `false` | Vitest's "related-tests" filter sometimes misses imports through barrel files; turning it off makes Stryker rely on `coverageAnalysis` for narrowing instead. |
| `mutate` | the eight files covered by the component test suite — `src/components/PinPad.tsx`, `src/pages/{Login,Send,Deposit,Withdraw,Home,History,Profile}Page.tsx` | Mutating files with no tests would inflate "no coverage" without telling us anything useful. The audit's "untested files" gap is tracked separately. |
| `testFiles` | the eight matching `*.test.tsx` files | Listed explicitly because Stryker's project-reader doesn't always discover tests via the Vite config's `test.include` glob. |
| `coverageAnalysis` | `perTest` | Re-runs only the tests that exercise each mutated line. Roughly halves wall time vs the default `all`. |
| `concurrency` | `2` | Half of available cores on the developer laptop — leaves headroom for the OS without leaving capacity on the table. |
| `reporters` | `clear-text`, `progress`, `html`, `json` | HTML for human inspection (`reports/mutation/mutation.html`); JSON for the survivor-detection script in this doc. |

Run on demand:

```bash
npm run test:mutation       # interactive
npm run test:mutation:ci    # CI-friendly reporter set
```

Reports land in `reports/mutation/`. The directory and `.stryker-tmp/` are gitignored.

## Baseline (commit on `test/mutation-stryker`)

| Metric | Value |
|---|---|
| Wall time | **11 min 42 s** (704 s) |
| Source files mutated | 8 |
| Mutants generated | 447 |
| **Killed** | **262 (58.61 %)** |
| Survived | 149 |
| No coverage | 36 |
| Errors / timeouts | 0 |
| Score (covered) | 63.75 % |

Per file:

| File | Score (total) | Score (covered) | Killed | Survived | No cov |
|---|---|---|---|---|---|
| `components/PinPad.tsx` | 85.00 | 87.18 | 34 | 5 | 1 |
| `pages/LoginPage.tsx` | 69.57 | 69.57 | 16 | 7 | 0 |
| `pages/SendPage.tsx` | 66.67 | 72.41 | 84 | 32 | 10 |
| `pages/ProfilePage.tsx` | 56.25 | 56.25 | 9 | 7 | 0 |
| `pages/DepositPage.tsx` | 52.27 | 65.71 | 23 | 12 | 9 |
| `pages/HistoryPage.tsx` | 50.88 | 52.73 | 29 | 26 | 2 |
| `pages/WithdrawPage.tsx` | 50.00 | 65.71 | 23 | 12 | 11 |
| `pages/HomePage.tsx` | 46.32 | 47.83 | 44 | 48 | 3 |

Component tests in PR #4 do well on `PinPad` (the most behaviourally-rich unit) and acceptably well on `LoginPage` and `SendPage`. They thin out on the read-mostly pages where the tests assert "rendered" but not "rendered the *right* thing" — visible in `HomePage` (46.32 %) and `HistoryPage` (50.88 %).

## Thresholds (ratchet pattern)

`stryker.config.mjs`:

```js
thresholds: {
  high: 64,    // baseline + 5; stretch target the suite is expected to grow into
  low: 56,     // floor(baseline - 2); regression below this breaks CI
  break: 56,   // matches low so CI gates on the same floor
}
```

The strategic target documented in [`TEST_STRATEGY.md`](https://github.com/jeffgicharu/wallet-api/blob/main/TEST_STRATEGY.md) is **≥ 65 % Stryker score on `src/components` and `src/pages`**. Today's overall score is 58.61 %; `PinPad`, `LoginPage`, `SendPage`, and `DepositPage` already clear the strategic floor. Future PRs ratchet upward as more tests land — the page-level tests are the obvious place to grow.

## CI strategy

Wall time is **11 min 42 s**. That sits in the 5–15 min band from the QA standards: **path-filtered per-PR runs plus a nightly schedule**.

The new `stryker-mutation` job in `.github/workflows/ci.yml`:

- Runs on PRs whose changes touch `src/components/**`, `src/pages/**`, or any of the test-tooling files (`stryker.config.mjs`, `vite.config.ts`, `package.json`, `src/test/**`).
- Also runs on a nightly cron schedule (03:00 UTC) so the score is tracked even on weeks with no relevant PRs.
- Surfaces the kill / survived / no-coverage / score numbers to the GitHub step summary.
- Uploads the HTML and JSON reports as a 30-day artifact.

If wall time later climbs past 15 min (e.g., as more components and pages are added to `mutate`), the per-PR trigger flips to nightly-only.

## Reading the report

`reports/mutation/mutation.html` is the entry point. It opens with a tree of source files; click into any file to see line-by-line annotations:

- **Green** lines have all their mutants killed.
- **Yellow** lines have at least one survivor.
- **Red** lines have no coverage.

Each survivor expands to show the mutator name, the original code, the mutation, and the tests that ran without catching it. That is enough information to write a regression test.

## Investigating a surviving mutant

1. Find it in the HTML report (or `reports/mutation/mutation.json`). Note the mutator (`ConditionalExpression`, `BooleanLiteral`, etc.), the file:line, and the source snippet.
2. Read the source. Form a hypothesis about why the mutation does not change observable behaviour for any current test (most often: a missing assertion, a missing edge-case input, or a state read-back the test never performs).
3. Write a focused test that asserts the behaviour the mutation would break. Run that test once on the un-mutated code (it should pass) and once with the mutation applied (it should fail).
4. Re-run Stryker. The mutant should now show as KILLED, and the kill-rate ticks up.

The point is not to game the score by writing micro-asserts; it is to find the *real* gap the mutation pointed at.

## Top surviving mutants (baseline)

| # | Location | Mutator | Hypothesis |
|---|---|---|---|
| 1 | `PinPad.tsx:15` | `ConditionalExpression` → `true` | The `if (pin.length < 4)` overflow guard becomes always-true. Test "does not fire onComplete on additional taps after four digits" asserts `onComplete` was called once but never reads `pin` state back, so a 5- or 6-character `pin` after extra taps is invisible to the test. |
| 2 | `pages/HomePage.tsx` (48 survivors across the file) | mixed `ConditionalExpression`, `StringLiteral`, `ArrowFunction`, etc. | The home-page tests assert "balance shows", "transactions list rendered", "show / hide toggle works" — all rendered-content checks. They don't read back the *colour-coded* class on each transaction row, the daily-limit hint formatting, or the navigation target of each Quick Action button. Any mutation that breaks those finer points slides through. |
| 3 | `pages/HistoryPage.tsx` (26 survivors) | mixed | Similar to HomePage: the history test checks "list rendered, signs appear" but doesn't pin which specific transaction gets which colour, doesn't probe the empty-state empty-string copy, and doesn't read back the `data-testid` or `class` attribute on individual rows. |

**Rough effort to close the top three.**

- **#1 (PinPad overflow)**: small. One test that reads the dot indicator's filled count after typing five or six digits, asserting it stays at 4. **~30 min.**
- **#2 (HomePage)**: medium. Three or four extra assertions per existing test (assert specific `class` on each transaction row, assert daily-limit text formatting, assert `navigate(...)` call argument for each Quick Action). **~2–3 hours.**
- **#3 (HistoryPage)**: small-medium. Same pattern as HomePage but smaller surface — one or two `data-testid` reads per test plus one new test that filters on type. **~1–1.5 hours.**

**Total effort to close all three: about half a day** of test-writing work. Filed as a follow-up; not addressed in this PR.

## File layout

```
stryker.config.mjs                 (Stryker config; mutate scope, thresholds, reporters)
package.json                       (test:mutation, test:mutation:ci scripts)
reports/mutation/mutation.html     (gitignored — entry point)
reports/mutation/mutation.json     (gitignored — used by step-summary script)
.github/workflows/ci.yml           (stryker-mutation job, path-filtered + nightly cron)
.stryker-tmp/                      (gitignored — sandbox dirs)
```
