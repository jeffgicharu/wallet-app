// Single source of truth for money formatting. Every screen, receipt,
// history row, and disclosure renders amounts through these helpers so
// the currency symbol, decimal places, and thousands separators are
// identical everywhere: always "KES 1,234.50".

const nf = new Intl.NumberFormat('en-KE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "KES 1,234.50" — two decimals and grouped thousands, always. */
export function formatKES(n: number | null | undefined): string {
  return `KES ${nf.format(Number.isFinite(n as number) ? (n as number) : 0)}`;
}

/** "+ KES 1,234.50" / "- KES 1,234.50" for sign-coded amounts. */
export function formatSignedKES(
  n: number | null | undefined,
  direction: 'in' | 'out',
): string {
  return `${direction === 'out' ? '-' : '+'} ${formatKES(n)}`;
}
