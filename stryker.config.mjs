// @ts-check

/**
 * Stryker mutation testing configuration.
 *
 * Mutation testing complements line / branch coverage. Coverage tells you a
 * line was reached during a test; it does not tell you the test verified
 * what the line does. Stryker mutates the source (flips an `<` to `<=`,
 * removes a conditional, replaces a return value with `undefined`) and
 * re-runs the test suite. Each surviving mutation is a place where the
 * test suite walked over the code without checking what it does.
 *
 * Scoped to the eight files covered by the component test suite. Broaden as
 * more tests land. Strategy targets in TEST_STRATEGY.md (Stryker score
 * ≥ 65 % on src/components and src/pages).
 *
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  testRunner: 'vitest',
  testRunnerNodeArgs: [],
  vitest: {
    configFile: 'vite.config.ts',
    // Run the full test suite per mutant rather than letting Vitest filter
    // by "related" tests. Vitest's related-detection misses some imports
    // (notably barrel files and re-exports) which can cause Stryker to
    // see zero tests covering a mutant. `coverageAnalysis: 'perTest'`
    // still narrows the actual per-mutant run to tests that touched the
    // mutated line, so this is correctness not cost.
    related: false,
  },

  // Explicit test file list — Stryker's vitest runner doesn't always
  // pick up tests from the Vite config's `test.include` glob when the
  // dry-run is invoked with no related-files filter. Listing the eight
  // test files explicitly bypasses the discovery step.
  testFiles: [
    'src/components/PinPad.test.tsx',
    'src/pages/LoginPage.test.tsx',
    'src/pages/SendPage.test.tsx',
    'src/pages/DepositPage.test.tsx',
    'src/pages/WithdrawPage.test.tsx',
    'src/pages/HomePage.test.tsx',
    'src/pages/HistoryPage.test.tsx',
    'src/pages/ProfilePage.test.tsx',
  ],

  // Only mutate the source files that actually have tests. Including
  // untested files would inflate "no coverage" without telling us anything
  // useful — the audit covers that gap separately.
  mutate: [
    'src/components/PinPad.tsx',
    'src/pages/LoginPage.tsx',
    'src/pages/SendPage.tsx',
    'src/pages/DepositPage.tsx',
    'src/pages/WithdrawPage.tsx',
    'src/pages/HomePage.tsx',
    'src/pages/HistoryPage.tsx',
    'src/pages/ProfilePage.tsx',
  ],

  // Re-run only the tests that exercise each mutated line. Roughly halves
  // wall time on this code base vs the default 'all'.
  coverageAnalysis: 'perTest',

  // Half of available cores — leaves room for the OS to keep the laptop
  // responsive without leaving capacity on the table.
  concurrency: 2,

  reporters: ['clear-text', 'progress', 'html', 'json'],
  htmlReporter: {
    fileName: 'reports/mutation/mutation.html',
  },
  jsonReporter: {
    fileName: 'reports/mutation/mutation.json',
  },

  /*
   * Interim ratchet. Baseline run measured a 58.61 % mutation score
   * across the eight files in scope (262 killed / 149 survived / 36
   * no-coverage out of 447 mutants). `low` and `break` sit two points
   * below the baseline so a small good-faith refactor has headroom but
   * a regression fails the build; `high` sits five points above as a
   * stretch target the suite is expected to grow into. The strategic
   * target documented in TEST_STRATEGY.md is ≥ 65 % on
   * src/components and src/pages.
   */
  thresholds: {
    high: 64,
    low: 56,
    break: 56,
  },

  timeoutMS: 60000,
  timeoutFactor: 1.5,

};
