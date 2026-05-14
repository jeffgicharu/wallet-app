#!/usr/bin/env bash
# Seeds alice/bob/carol on a fresh local wallet-api at http://localhost:8080.
# Idempotent: re-running against an already-seeded API returns 409s that are
# treated as success.
set -eu

API="${API:-http://localhost:8080}"

register() {
  local name=$1 email=$2 phone=$3
  echo "[seed] register $email"
  curl -sS -o /dev/null -w '%{http_code}\n' \
    -X POST "$API/api/auth/register" \
    -H 'Content-Type: application/json' \
    -d "{\"fullName\":\"$name\",\"email\":\"$email\",\"phoneNumber\":\"$phone\",\"password\":\"pass1234\",\"pin\":\"1234\"}" \
    || true
}

login_token() {
  local email=$1
  curl -sS -X POST "$API/api/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$email\",\"password\":\"pass1234\"}" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['token'])"
}

deposit() {
  local token=$1 amount=$2 key=$3
  echo "[seed] deposit $amount via key $key"
  curl -sS -o /dev/null -w '%{http_code}\n' \
    -X POST "$API/api/wallet/deposit" \
    -H "Authorization: Bearer $token" \
    -H 'Content-Type: application/json' \
    -d "{\"amount\":$amount,\"idempotencyKey\":\"$key\"}" \
    || true
}

# Register the three demo users (409 on retry is fine).
register "Alice Demo" "alice@demo.local" "+254700000001"
register "Bob Demo"   "bob@demo.local"   "+254700000002"
register "Carol Demo" "carol@demo.local" "+254700000003"

# Deposit canonical balances.
deposit "$(login_token alice@demo.local)" 50000 seed-alice
deposit "$(login_token bob@demo.local)"   25000 seed-bob
deposit "$(login_token carol@demo.local)" 10000 seed-carol

echo "[seed] done"
