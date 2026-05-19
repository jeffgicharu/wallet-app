import type { Transaction } from '../types';
import { counterpartyLabel } from './counterparty';

export type Direction = 'in' | 'out';

// The API returns a separate FEE transaction for the 1% transfer fee and
// also reports the fee on the TRANSFER row itself. Showing the standalone
// FEE row in the user-facing list would double-count the fee and (since
// it has no receiver) render mis-signed. Real mobile-money apps fold the
// fee into the transfer, which is exactly what the transfer detail does.
export function isFeeRow(t: Transaction): boolean {
  return t.type === 'FEE';
}

export function isReversal(t: Transaction): boolean {
  return t.reference.startsWith('REV-');
}

// Direction is decided purely by whether the signed-in wallet is the
// sender or the receiver of the transaction — not by type. A TRANSFER
// row carries BOTH senderPhone and receiverPhone, so a type-only rule
// (the old code) flagged every transfer as outgoing even when the user
// was the one receiving the money. Comparing against the user's own
// phone is correct for deposits, withdrawals, transfers, and reversals
// alike (a reversal swaps the sender/receiver wallets).
export function direction(t: Transaction, myPhone: string | null): Direction {
  if (myPhone && t.senderPhone === myPhone) return 'out';
  if (myPhone && t.receiverPhone === myPhone) return 'in';
  // Fallbacks when the wallet phone isn't known yet.
  if (t.type === 'DEPOSIT') return 'in';
  if (t.type === 'WITHDRAWAL' || t.type === 'FEE') return 'out';
  return t.senderPhone ? 'out' : 'in';
}

// A human label for the row. Transfers read naturally for BOTH parties
// ("Sent to …" / "Received from …") instead of echoing the sender-side
// description back to the receiver.
export function transactionLabel(t: Transaction, myPhone: string | null): string {
  if (isReversal(t)) return 'Reversal';
  switch (t.type) {
    case 'DEPOSIT':
      return t.description || 'Cash deposit';
    case 'WITHDRAWAL':
      return t.description || 'Cash withdrawal';
    case 'FEE':
      return t.description || 'Transfer fee';
    case 'TRANSFER':
      return direction(t, myPhone) === 'out'
        ? t.receiverPhone
          ? `Sent to ${counterpartyLabel(t.receiverPhone)}`
          : t.description || 'Money sent'
        : t.senderPhone
          ? `Received from ${counterpartyLabel(t.senderPhone)}`
          : t.description || 'Money received';
    default:
      return t.description || t.type;
  }
}
