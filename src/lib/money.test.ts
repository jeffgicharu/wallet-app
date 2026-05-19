import { describe, it, expect } from 'vitest';
import { formatKES, formatSignedKES } from './money';

describe('formatKES', () => {
  it('always renders KES with two decimals and grouped thousands', () => {
    expect(formatKES(0)).toBe('KES 0.00');
    expect(formatKES(5)).toBe('KES 5.00');
    expect(formatKES(1234.5)).toBe('KES 1,234.50');
    expect(formatKES(1234567.891)).toBe('KES 1,234,567.89');
  });

  it('coerces null / undefined / NaN to zero', () => {
    expect(formatKES(null)).toBe('KES 0.00');
    expect(formatKES(undefined)).toBe('KES 0.00');
    expect(formatKES(NaN)).toBe('KES 0.00');
  });
});

describe('formatSignedKES', () => {
  it('prefixes a sign with consistent spacing', () => {
    expect(formatSignedKES(1000, 'in')).toBe('+ KES 1,000.00');
    expect(formatSignedKES(1000, 'out')).toBe('- KES 1,000.00');
    expect(formatSignedKES(null, 'in')).toBe('+ KES 0.00');
  });
});
