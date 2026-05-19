import { describe, it, expect } from 'vitest';
import {
  direction,
  isFeeRow,
  isReversal,
  transactionLabel,
} from './transactions';
import type { Transaction } from '../types';

const ME = '+254700000001';
const OTHER = '+254700000002';

function tx(p: Partial<Transaction>): Transaction {
  return {
    reference: 'TRF-1',
    type: 'TRANSFER',
    status: 'COMPLETED',
    amount: 1000,
    fee: 0,
    senderPhone: null,
    receiverPhone: null,
    description: '',
    createdAt: '2026-05-01T10:00:00Z',
    ...p,
  };
}

describe('isFeeRow / isReversal', () => {
  it('detects FEE rows and REV- references', () => {
    expect(isFeeRow(tx({ type: 'FEE' }))).toBe(true);
    expect(isFeeRow(tx({ type: 'TRANSFER' }))).toBe(false);
    expect(isReversal(tx({ reference: 'REV-TRF-9' }))).toBe(true);
    expect(isReversal(tx({ reference: 'TRF-9' }))).toBe(false);
  });
});

describe('direction', () => {
  it('uses the signed-in phone first', () => {
    expect(direction(tx({ senderPhone: ME, receiverPhone: OTHER }), ME)).toBe('out');
    expect(direction(tx({ senderPhone: OTHER, receiverPhone: ME }), ME)).toBe('in');
  });

  it('falls back by type when the phone is unknown', () => {
    expect(direction(tx({ type: 'DEPOSIT' }), null)).toBe('in');
    expect(direction(tx({ type: 'WITHDRAWAL' }), null)).toBe('out');
    expect(direction(tx({ type: 'FEE' }), null)).toBe('out');
    expect(direction(tx({ type: 'TRANSFER', senderPhone: OTHER }), null)).toBe('out');
    expect(direction(tx({ type: 'TRANSFER', senderPhone: null }), null)).toBe('in');
  });
});

describe('transactionLabel', () => {
  it('labels reversals', () => {
    expect(transactionLabel(tx({ reference: 'REV-TRF-9' }), ME)).toBe('Reversal');
  });

  it('labels deposits and withdrawals from the description with fallbacks', () => {
    expect(transactionLabel(tx({ type: 'DEPOSIT', description: 'Salary' }), ME)).toBe('Salary');
    expect(transactionLabel(tx({ type: 'DEPOSIT', description: '' }), ME)).toBe('Cash deposit');
    expect(transactionLabel(tx({ type: 'WITHDRAWAL', description: '' }), ME)).toBe('Cash withdrawal');
    expect(transactionLabel(tx({ type: 'FEE', description: '' }), ME)).toBe('Transfer fee');
  });

  it('reads naturally for both sides of a transfer', () => {
    expect(
      transactionLabel(tx({ senderPhone: ME, receiverPhone: OTHER }), ME),
    ).toBe(`Sent to ${OTHER}`);
    expect(
      transactionLabel(tx({ senderPhone: OTHER, receiverPhone: ME }), ME),
    ).toBe(`Received from ${OTHER}`);
  });

  it('has graceful fallbacks when phones are missing', () => {
    expect(
      transactionLabel(tx({ senderPhone: ME, receiverPhone: null, description: '' }), ME),
    ).toBe('Money sent');
    expect(
      transactionLabel(tx({ senderPhone: null, receiverPhone: ME, description: '' }), ME),
    ).toBe('Money received');
    expect(
      transactionLabel(tx({ type: 'TRANSFER', senderPhone: null, receiverPhone: null }), null),
    ).toBe('Money received');
    // Unknown type falls back to the description / raw type.
    expect(
      transactionLabel(tx({ type: 'OTHER' as unknown as Transaction['type'], description: 'odd' }), ME),
    ).toBe('odd');
  });
});
