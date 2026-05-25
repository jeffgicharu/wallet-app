import { describe, it, expect } from 'vitest';
import {
  todayNet,
  lastNDaysNet,
  monthlyTransactionCount,
  dailyLimitPercent,
  topOutgoingRecipients,
} from './homeStats';
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
    createdAt: '2026-05-15T10:00:00Z',
    ...p,
  };
}

// Pin every clock-dependent assertion against this reference so the
// suite is deterministic regardless of wall-clock at test run.
const NOW = new Date('2026-05-15T12:00:00Z');

describe('todayNet', () => {
  it('sums incoming positive and outgoing negative for today only', () => {
    const txns = [
      tx({ senderPhone: OTHER, receiverPhone: ME, amount: 500, createdAt: '2026-05-15T08:00:00Z' }),
      tx({ senderPhone: ME, receiverPhone: OTHER, amount: 200, createdAt: '2026-05-15T18:00:00Z' }),
      tx({ senderPhone: ME, receiverPhone: OTHER, amount: 1000, createdAt: '2026-05-14T12:00:00Z' }), // yesterday
    ];
    expect(todayNet(txns, ME, NOW)).toBe(300);
  });

  it('returns 0 when nothing happened today', () => {
    const txns = [tx({ createdAt: '2026-05-14T12:00:00Z' })];
    expect(todayNet(txns, ME, NOW)).toBe(0);
    expect(todayNet([], ME, NOW)).toBe(0);
  });
});

describe('lastNDaysNet', () => {
  it('includes transactions within the last n days (inclusive of today)', () => {
    const txns = [
      tx({ senderPhone: OTHER, receiverPhone: ME, amount: 100, createdAt: '2026-05-15T08:00:00Z' }), // today
      tx({ senderPhone: OTHER, receiverPhone: ME, amount: 200, createdAt: '2026-05-09T08:00:00Z' }), // day 7
      tx({ senderPhone: OTHER, receiverPhone: ME, amount: 500, createdAt: '2026-05-08T08:00:00Z' }), // outside the window for n=7
    ];
    expect(lastNDaysNet(txns, ME, 7, NOW)).toBe(300);
  });

  it('excludes transactions strictly older than the cutoff', () => {
    const old = tx({ amount: 9999, createdAt: '2026-04-01T00:00:00Z' });
    expect(lastNDaysNet([old], ME, 7, NOW)).toBe(0);
  });

  it('treats reversals as a net-zero pair', () => {
    const txns = [
      tx({ reference: 'TRF-9', senderPhone: ME, receiverPhone: OTHER, amount: 2000, status: 'REVERSED' }),
      tx({ reference: 'REV-TRF-9', senderPhone: OTHER, receiverPhone: ME, amount: 2000 }),
    ];
    expect(lastNDaysNet(txns, ME, 7, NOW)).toBe(0);
  });
});

describe('monthlyTransactionCount', () => {
  it('counts only transactions in the same calendar month', () => {
    const txns = [
      // Midday UTC so the local-time month doesn't shift across common
      // TZ offsets (the production code uses local-time getMonth()).
      tx({ createdAt: '2026-05-01T12:00:00Z' }),
      tx({ createdAt: '2026-05-31T12:00:00Z' }),
      tx({ createdAt: '2026-04-30T12:00:00Z' }),
      tx({ createdAt: '2026-06-01T12:00:00Z' }),
    ];
    expect(monthlyTransactionCount(txns, NOW)).toBe(2);
  });

  it('returns 0 for an empty list', () => {
    expect(monthlyTransactionCount([], NOW)).toBe(0);
  });
});

describe('dailyLimitPercent', () => {
  it('returns the fraction as a 0..100 percentage', () => {
    expect(dailyLimitPercent(0, 300000)).toBe(0);
    expect(dailyLimitPercent(150000, 300000)).toBe(50);
    expect(dailyLimitPercent(300000, 300000)).toBe(100);
  });

  it('clamps to [0, 100] for over-limit or negative inputs', () => {
    expect(dailyLimitPercent(450000, 300000)).toBe(100);
    expect(dailyLimitPercent(-100, 300000)).toBe(0);
  });

  it('returns 0 for a missing or non-positive limit', () => {
    expect(dailyLimitPercent(100, 0)).toBe(0);
    expect(dailyLimitPercent(100, -1)).toBe(0);
    expect(dailyLimitPercent(100, undefined as unknown as number)).toBe(0);
  });
});

describe('topOutgoingRecipients', () => {
  const OTHER2 = '+254700000099';
  const OTHER3 = '+254700000088';
  it('returns the most-sent-to phones for the signed-in wallet, sorted by count', () => {
    const txns = [
      tx({ type: 'TRANSFER', senderPhone: ME, receiverPhone: OTHER }),
      tx({ type: 'TRANSFER', senderPhone: ME, receiverPhone: OTHER }),
      tx({ type: 'TRANSFER', senderPhone: ME, receiverPhone: OTHER2 }),
      tx({ type: 'TRANSFER', senderPhone: ME, receiverPhone: OTHER3 }),
      tx({ type: 'TRANSFER', senderPhone: ME, receiverPhone: OTHER3 }),
      tx({ type: 'TRANSFER', senderPhone: ME, receiverPhone: OTHER3 }),
    ];
    expect(topOutgoingRecipients(txns, ME, 2)).toEqual([
      { phone: OTHER3, count: 3 },
      { phone: OTHER, count: 2 },
    ]);
  });

  it('ignores incoming transfers, withdrawals, deposits and fee rows', () => {
    const txns = [
      tx({ type: 'TRANSFER', senderPhone: OTHER, receiverPhone: ME }), // incoming
      tx({ type: 'WITHDRAWAL', senderPhone: ME, receiverPhone: null }),
      tx({ type: 'DEPOSIT', senderPhone: null, receiverPhone: ME }),
      tx({ type: 'FEE', senderPhone: ME, receiverPhone: null }),
    ];
    expect(topOutgoingRecipients(txns, ME)).toEqual([]);
  });

  it('returns an empty list when the signed-in phone is unknown', () => {
    const txns = [tx({ type: 'TRANSFER', senderPhone: ME, receiverPhone: OTHER })];
    expect(topOutgoingRecipients(txns, null)).toEqual([]);
  });
});
