import type { Transaction } from '../types';
import { direction } from './transactions';

// Stats that feed the desktop home dashboard tiles. Pure functions over
// the same transactions list the page already fetches — no extra API
// round-trips. "now" is injectable so tests can pin a reference time;
// production defaults to wall-clock.

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isWithinLastDays(d: Date, now: Date, n: number): boolean {
  // Cutoff is the start of the day `n` days before today, so the cutoff
  // day is fully included (n=6 + today = the conventional "last 7 days").
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - n);
  cutoff.setHours(0, 0, 0, 0);
  return d >= cutoff && d <= now;
}

function signedAmount(t: Transaction, myPhone: string | null): number {
  return direction(t, myPhone) === 'in' ? t.amount : -t.amount;
}

/**
 * Net of in − out for transactions whose timestamp falls on today's
 * calendar date. A reversal entry naturally cancels its original (the
 * REV-/original pair sums to zero), so reversed activity contributes
 * nothing to net — which is what a user would expect.
 */
export function todayNet(
  txns: Transaction[],
  myPhone: string | null,
  now: Date = new Date(),
): number {
  return txns
    .filter(t => sameDay(new Date(t.createdAt), now))
    .reduce((acc, t) => acc + signedAmount(t, myPhone), 0);
}

/**
 * Net of in − out over the previous `n` days inclusive of today. n must
 * be >= 1; n=7 gives "this week" (today + the six prior days).
 */
export function lastNDaysNet(
  txns: Transaction[],
  myPhone: string | null,
  n: number,
  now: Date = new Date(),
): number {
  return txns
    .filter(t => isWithinLastDays(new Date(t.createdAt), now, n - 1))
    .reduce((acc, t) => acc + signedAmount(t, myPhone), 0);
}

/**
 * Count of transactions whose timestamp falls in the same calendar
 * month as `now`. The caller is expected to pass a list already with
 * standalone FEE rows filtered out.
 */
export function monthlyTransactionCount(
  txns: Transaction[],
  now: Date = new Date(),
): number {
  return txns.filter(t => {
    const d = new Date(t.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
}

/**
 * Daily-limit usage as a percentage, clamped to [0, 100]. Returns 0 if
 * the limit is missing or non-positive (defensive — the API should
 * never send that, but a divide-by-zero would render NaN width).
 */
export function dailyLimitPercent(used: number, limit: number): number {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, Math.max(0, (used / limit) * 100));
}

/**
 * The phones the signed-in wallet has sent transfers to most often.
 * Powers the Send-page "Recent recipients" chips so a user can re-pay
 * the same person without retyping a number. Only TRANSFER rows where
 * `myPhone` is the sender count.
 */
export function topOutgoingRecipients(
  txns: Transaction[],
  myPhone: string | null,
  limit = 3,
): Array<{ phone: string; count: number }> {
  if (!myPhone) return [];
  const counts = new Map<string, number>();
  for (const t of txns) {
    if (t.type !== 'TRANSFER') continue;
    if (t.senderPhone !== myPhone) continue;
    if (!t.receiverPhone) continue;
    counts.set(t.receiverPhone, (counts.get(t.receiverPhone) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([phone, count]) => ({ phone, count }));
}
