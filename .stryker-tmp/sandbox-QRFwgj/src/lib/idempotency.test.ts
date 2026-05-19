// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { newIdempotencyKey } from './idempotency';

describe('newIdempotencyKey', () => {
  it('is 8 uppercase hex chars and carries no type prefix', () => {
    const k = newIdempotencyKey();
    expect(k).toMatch(/^[0-9A-F]{8}$/);
    expect(k.startsWith('TRF-')).toBe(false);
    expect(k.startsWith('DEP-')).toBe(false);
    expect(k.startsWith('WDR-')).toBe(false);
  });

  it('is effectively unique across calls', () => {
    const keys = new Set(Array.from({ length: 200 }, () => newIdempotencyKey()));
    expect(keys.size).toBe(200);
  });
});
