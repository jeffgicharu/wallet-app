import { describe, it, expect } from 'vitest';
import { counterpartyName, counterpartyLabel } from './counterparty';

describe('counterparty resolution', () => {
  it('resolves seeded demo users by first name', () => {
    expect(counterpartyName('+254700000001')).toBe('Alice');
    expect(counterpartyName('+254700000002')).toBe('Bob');
    expect(counterpartyName('+254700000003')).toBe('Carol');
  });

  it('resolves the 8 seeded contacts by full name', () => {
    expect(counterpartyName('+254711100201')).toBe('James Mwangi');
    expect(counterpartyName('+254711100208')).toBe('Sarah Wambui');
  });

  it('trims surrounding whitespace before lookup', () => {
    expect(counterpartyName('  +254711100204 ')).toBe('Grace Achieng');
  });

  it('returns null for an unknown or empty number', () => {
    expect(counterpartyName('+254712999888')).toBeNull();
    expect(counterpartyName(null)).toBeNull();
    expect(counterpartyName(undefined)).toBeNull();
    expect(counterpartyName('')).toBeNull();
  });

  it('label falls back to the raw number for unknowns', () => {
    expect(counterpartyLabel('+254711100205')).toBe('Peter Kamau');
    expect(counterpartyLabel('+254712999888')).toBe('+254712999888');
    expect(counterpartyLabel(null)).toBe('Unknown');
    expect(counterpartyLabel(undefined)).toBe('Unknown');
  });
});
