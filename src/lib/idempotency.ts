// Idempotency keys for money-moving requests.
//
// The wallet-api derives a transaction reference as `{PREFIX}-{key}`
// (TRF-, DEP-, WDR-). The key must therefore NOT carry its own prefix —
// passing "TRF-..." produced a doubled "TRF-TRF-..." reference on the
// success screen. It must also be stable across retries of the *same*
// intent so a lost-response retry replays the original transaction
// instead of charging twice; callers generate one key per confirmed
// intent and reuse it for every attempt.
//
// 8 uppercase hex chars matches the seed's reference style
// (e.g. TRF-9F4A2B1C) so demo and live transactions look identical.
export function newIdempotencyKey(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}
