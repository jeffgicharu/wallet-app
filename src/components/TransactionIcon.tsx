import { ArrowDownLeft, ArrowUpRight, RotateCcw } from 'lucide-react';
import type { Transaction } from '../types';
import { type Direction, isReversal } from '../lib/transactions';

/**
 * The visual marker for a transaction row. Replaces the literal "+"/"-"
 * text characters that used to sit in the coloured circle. A reversal
 * gets a distinct rotate icon; everything else is keyed off direction
 * (incoming = arrow-down-left, outgoing = arrow-up-right) which already
 * covers deposits, withdrawals, transfers and reversal credits
 * consistently.
 */
export function TransactionIcon({
  t,
  dir,
  size = 18,
  className = '',
}: {
  t: Transaction;
  dir: Direction;
  size?: number;
  className?: string;
}) {
  const Icon = isReversal(t)
    ? RotateCcw
    : dir === 'out'
      ? ArrowUpRight
      : ArrowDownLeft;
  return <Icon size={size} className={className} aria-hidden="true" />;
}
