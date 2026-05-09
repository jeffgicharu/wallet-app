import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';
import { server } from './msw-server';

// jsdom does not implement matchMedia. react-hot-toast (and any other
// dependency that probes the user's reduced-motion preference) needs a
// stub so tests don't crash with "matchMedia is not a function".
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// MSW lifecycle — start once for the JVM, reset handlers between tests so
// per-test overrides do not leak.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
  // Keep tests independent of session state between cases.
  sessionStorage.clear();
});
afterAll(() => server.close());
