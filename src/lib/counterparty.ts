// The wallet-api demo seed (wallet-api `scripts/seed-demo.py`) registers a
// fixed roster: the 3 demo users plus 8 named contacts. The API exposes no
// user-lookup endpoint, so that seed roster — the single source of truth —
// is mirrored here and resolved at render time. Demo users are shown by
// first name (the seed registers them as "Alice Demo" etc.; "Alice" reads
// the way a real contact would); the 8 contacts keep their full name.
const DIRECTORY: Readonly<Record<string, string>> = {
  '+254700000001': 'Alice',
  '+254700000002': 'Bob',
  '+254700000003': 'Carol',
  '+254711100201': 'James Mwangi',
  '+254711100202': 'Mary Njeri',
  '+254711100203': 'John Otieno',
  '+254711100204': 'Grace Achieng',
  '+254711100205': 'Peter Kamau',
  '+254711100206': 'Faith Chebet',
  '+254711100207': 'Daniel Kiprop',
  '+254711100208': 'Sarah Wambui',
};

/** Resolved display name for a known counterparty, or null if unknown. */
export function counterpartyName(phone: string | null | undefined): string | null {
  if (!phone) return null;
  return DIRECTORY[phone.trim()] ?? null;
}

/**
 * Display label for a counterparty: the seeded contact name when the
 * number is known, otherwise the raw number unchanged so an unknown
 * party is still identifiable.
 */
export function counterpartyLabel(phone: string | null | undefined): string {
  if (!phone) return 'Unknown';
  return DIRECTORY[phone.trim()] ?? phone;
}
