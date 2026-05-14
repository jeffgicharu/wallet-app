import { test, expect } from '@playwright/test';

// 07 — Cloudflare + page-load perf baseline.
//
// One-off baseline for the live deploy:
//   - navigation timings via PerformanceNavigationTiming
//   - cf-ray + server-timing response headers from a static asset
//
// Cloudflare-fronted React SPA at the comparable ContractorOS deploy
// landed at ~700ms full load. The 5000ms assertion below is a very
// generous ceiling intended to flag a regression, not enforce a SLO.
//
// Chromium-only — there's nothing browser-specific about CF edge
// timings, and running this on all three engines just spends quota.

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.project.name !== 'live-smoke-chromium') {
    test.skip(true, 'perf baseline runs on chromium only');
  }
  // No context-wide X-E2E-Smoke header — see 01-live-login-loads
  // for the Cloudflare Insights CORS rationale.
  await page.goto('about:blank');
  await page.evaluate(() => {
    try { sessionStorage.clear(); } catch { /* noop */ }
  });
});

test.describe('07 — Cloudflare + page-load perf baseline', () => {
  test('login page navigation timing under 5000ms; log cf-ray + server-timing', async ({ page, request }) => {
    const start = Date.now();
    await page.goto('/login', { waitUntil: 'load' });
    const wallClockMs = Date.now() - start;

    const nav = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const e = entries[0];
      if (!e) return null;
      return {
        domContentLoadedEventEnd: e.domContentLoadedEventEnd,
        loadEventEnd: e.loadEventEnd,
        responseStart: e.responseStart,
        requestStart: e.requestStart,
        serverResponseMs: e.responseStart - e.requestStart,
        transferSize: e.transferSize,
        encodedBodySize: e.encodedBodySize,
      };
    });

    // eslint-disable-next-line no-console
    console.log('[live-perf] wallClock(ms):', wallClockMs);
    // eslint-disable-next-line no-console
    console.log('[live-perf] navigationTiming:', JSON.stringify(nav, null, 2));

    // Capture Cloudflare edge headers on a small static fetch.
    const assetRes = await request.get('https://wallet.jeffgicharu.com/index.html');
    const headers = assetRes.headers();
    // eslint-disable-next-line no-console
    console.log('[live-perf] /index.html cf-ray:', headers['cf-ray'] || '(missing)');
    // eslint-disable-next-line no-console
    console.log('[live-perf] /index.html server-timing:', headers['server-timing'] || '(missing)');
    // eslint-disable-next-line no-console
    console.log('[live-perf] /index.html cache-status:', headers['cf-cache-status'] || '(missing)');

    // Sanity: navigation entry exists and loadEventEnd is under the ceiling.
    expect(nav).not.toBeNull();
    expect(nav!.loadEventEnd, 'loadEventEnd should be under 5000ms').toBeLessThan(5000);
  });
});
