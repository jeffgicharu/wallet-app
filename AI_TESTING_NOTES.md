# AI testing notes — wallet-app

Frontend-specific addendum to the system-wide playbook at [`wallet-api/AI_TESTING_PLAYBOOK.md`](https://github.com/jeffgicharu/wallet-api/blob/main/AI_TESTING_PLAYBOOK.md). The system playbook covers the four-step workflow (Frame / Prompt-with-context / Review-with-skepticism / Run-plus-harden) and three worked examples — one of which is the `PinPad` component from PR #4 in this repo, walked through end-to-end.

What follows is the short list of things that are specific to the SPA.

---

## RTL queries vs implementation detail

The AI's defaults skew toward `getByTestId` because it's the easiest answer. Refuse it. Query priority in this repo (from `QA_BEST_PRACTICES.md`):

1. `getByRole` with an accessible name
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByDisplayValue`
6. `getByTestId` — only when none of the above can express the intent

When an AI draft uses `getByTestId('submit-button')`, the production code usually has `<button>Submit</button>` and `getByRole('button', { name: 'Submit' })` works. The rewrite is mechanical but matters because tests anchored on accessible names also act as an a11y check — if the role/name query stops working, an a11y regression is part of the cause.

## jest-axe for a11y assertions

Three patterns the AI gets wrong:

1. **Asserts no violations against the *page* when the test only renders one component** — axe accepts the rendered container, so pass the `container` from `render()`, not `document.body`.
2. **Forgets to disable known-violations rules** — see `LoginPage.test.tsx` and `PinPad.test.tsx`: each disables exactly one axe rule (`label` and `button-name` respectively) with a comment naming the gap. The AI's default is either to assert no-violations against everything (red test today because we know those rules fail) or to disable so much that the test stops checking anything.
3. **Asserts violations array length but not the rule** — `expect(results.violations).toHaveLength(0)` doesn't tell you *which* rule fired when the test fails. `expect(results).toHaveNoViolations()` (from `jest-axe`) produces a much better failure message.

## MSW prompt patterns

When prompting for a component test that needs API mocking, paste **the existing handler that matches the endpoint** from `src/test/msw-server.ts` so the AI's draft uses the same response shape. Without that, the AI invents a response shape that doesn't match what the consumer Pact (PR #9) records — and the test passes but doesn't catch the real shape mismatch.

Quick template snippet (drop into Template 2 from the system playbook):

```
EXISTING MSW HANDLER FOR THIS ENDPOINT (paste from src/test/msw-server.ts):
[paste]

IF YOUR TEST NEEDS A DIFFERENT RESPONSE THAN THE DEFAULT, use server.use(...)
with a fresh handler inside the test — do not edit msw-server.ts.
```

## Stryker scope decisions

Stryker mutates eight files (the component-tested ones from PR #4). The AI's instinct when asked to write a test that "improves the mutation score" is to write microassertions that target specific mutants. Resist.

Better: read the mutant in the HTML report, form a hypothesis about the missing assertion, write a test that asserts that observable behaviour. The mutant getting killed is the side-effect, not the goal.

Example: PinPad mutant on line 15 (`ConditionalExpression` → `true`) survived because the overflow-protection test asserted `onComplete called once` but didn't read `pin` state back. The fix isn't "write a test that targets the mutation operator" — the fix is "add an assertion that the indicator dots stay at 4 after extra taps." Same mutation killed, same behavioural test, but the test is readable as a real user-facing behavioural claim.

## When NOT to reach for AI on the SPA side

In addition to the system playbook's list:

- **Visual regression / pixel-diff tests** — there are no images for the AI to compare against.
- **Animation timing** — `await user.click(...)` and React state batching interact in ways the AI's drafts often get wrong; debug manually.
- **TanStack Query cache invalidation tests** — the AI tends to assert on the cache itself, but the readable assertion is on the rendered output after the invalidation.

## See also

- [System AI_TESTING_PLAYBOOK.md](https://github.com/jeffgicharu/wallet-api/blob/main/AI_TESTING_PLAYBOOK.md) — full workflow + three worked examples + five prompt templates
- [TEST_STRATEGY.md](./TEST_STRATEGY.md) — frontend-specific notes pointing at the system strategy
- [QA_BEST_PRACTICES.md](./QA_BEST_PRACTICES.md) — frontend conventions
- [MUTATION_TESTING.md](./MUTATION_TESTING.md) — Stryker setup with the survivor register
- [System QUALITY_DASHBOARD.md](https://github.com/jeffgicharu/wallet-api/blob/main/QUALITY_DASHBOARD.md) — current metrics
