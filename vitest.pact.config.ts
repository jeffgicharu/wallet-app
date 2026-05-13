import { defineConfig } from 'vitest/config';

/**
 * Dedicated Vitest config for consumer Pact tests. They run in a node
 * environment (the Pact mock server is a real native HTTP server), use
 * no DOM-side setup, and live under `src/test/pact/`. The pact file is
 * regenerated on every run and committed to `./pacts/` so that the
 * provider repo can fetch it via raw.githubusercontent.com.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/test/pact/**/*.pact.test.ts'],
    globals: false,
    // Pact instances are stateful; running pact files in parallel would
    // race on the shared output file. Single fork keeps deterministic.
    fileParallelism: false,
    pool: 'forks',
    singleFork: true,
    // Native pact_ffi can take a moment to spin up the first time.
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
