# Wallet App

[![CI](https://github.com/jeffgicharu/wallet-app/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/jeffgicharu/wallet-app/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/line%20coverage-90%25-brightgreen)](./MUTATION_TESTING.md)
[![Mutation](https://img.shields.io/badge/Stryker%20mutation-58%25-yellow)](./MUTATION_TESTING.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

A mobile-first React frontend for the [wallet-api](https://github.com/jeffgicharu/wallet-api). This is the customer-facing app where users check their balance, send money, deposit, withdraw, and view transaction history. Built to look and feel like a real mobile money app.

## Live Demo

- **Web app:** https://wallet.jeffgicharu.com
- **API:** https://wallet-api.jeffgicharu.com
- **Swagger UI:** https://wallet-api.jeffgicharu.com/swagger-ui.html

Demo accounts (state resets daily at 03:00 UTC):

| Email | Password | PIN | Approx. balance |
|---|---|---|---|
| `alice@demo.local` | `pass1234` | `1234` | KES 50,000 |
| `bob@demo.local`   | `pass1234` | `1234` | KES 25,000 |
| `carol@demo.local` | `pass1234` | `1234` | KES 10,000 |

This is a public demo. Do not use real PII, real money, or real credentials.

The key difference from the other two frontends (merchant-dashboard and lending-portal) is that this one is designed for phones: bottom tab navigation, touch-friendly buttons, a custom numeric PIN pad, mobile-width layout, and transaction flows that work like step-by-step wizards.

## What It Does

**Home screen:**
- Balance card with show/hide toggle
- Daily transfer limit and usage
- Quick action buttons (Send, Deposit, Withdraw)
- Recent transactions feed

**Send money:**
- Step-by-step wizard: enter phone, enter amount, confirm, enter PIN via numeric keypad
- Success screen with transaction reference

**Deposit and withdraw:**
- Amount entry with quick-select preset buttons (500, 1000, 5000, 10000)
- Withdrawal requires PIN via the numeric keypad

**Transaction history:**
- Full scrollable history with color-coded amounts (green for incoming, red for outgoing)
- Click any transaction for details

**Profile:**
- Account info, phone number, wallet balance, daily limits
- Sign out

## The PIN Pad

The custom `PinPad` component slides up from the bottom like a native mobile sheet. Four dots fill as you type. No text input, no keyboard: just a grid of number buttons. This is how M-Pesa works on real phones, and building it as a React component shows you understand mobile UX.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS (mobile-first) |
| Data Fetching | TanStack React Query |
| Routing | React Router v6 |
| HTTP Client | Axios with JWT interceptors |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Container | Docker (nginx) |
| CI | GitHub Actions |

## Quick Start

```bash
npm install
npm run dev
# Opens at http://localhost:3002
```

Proxies `/api/*` to `http://localhost:8080` (wallet-api).

## Configuration

The API base URL is read from `VITE_API_BASE_URL` at build time and falls back to `/api` so the Vite dev server's proxy keeps working without any setup. Override it for production builds:

```bash
VITE_API_BASE_URL=https://wallet-api.jeffgicharu.com/api npm run build
```

Anything you set is used as the axios `baseURL`, so include the `/api` segment that the wallet-api Spring controllers expect.

## Screens

| Screen | Path | Description |
|---|---|---|
| Login | `/login` | Email + password authentication |
| Home | `/` | Balance, quick actions, recent transactions |
| Send Money | `/send` | Multi-step transfer wizard with PIN pad |
| Deposit | `/deposit` | Amount entry with preset buttons |
| Withdraw | `/withdraw` | Amount + PIN pad |
| History | `/history` | Full transaction list |
| Profile | `/profile` | Account info and sign out |

## Quality engineering

This repo is one half of a polyglot wallet system; the API is at [`jeffgicharu/wallet-api`](https://github.com/jeffgicharu/wallet-api). **The system-wide quality dashboard with current metrics and the full open backlog lives there:** [`wallet-api/QUALITY_DASHBOARD.md`](https://github.com/jeffgicharu/wallet-api/blob/main/QUALITY_DASHBOARD.md).

**Frontend-specific quality docs at this repo root:**

| Document | Covers |
|---|---|
| [AUDIT.md](./AUDIT.md) | Baseline state — what exists, what doesn't, what's measured |
| [TEST_STRATEGY.md](./TEST_STRATEGY.md) | Frontend addendum pointing at the system-wide strategy |
| [QA_BEST_PRACTICES.md](./QA_BEST_PRACTICES.md) | Frontend addendum (a11y checklist, perf budget, design-system reuse) |
| [PACT.md](./PACT.md) | Consumer-side Pact contract setup and brittleness notes |
| [MUTATION_TESTING.md](./MUTATION_TESTING.md) | Stryker setup, baseline, surviving-mutant register |
| [AI_TESTING_NOTES.md](./AI_TESTING_NOTES.md) | Frontend addendum to the system-wide AI testing playbook |

System-wide docs (in wallet-api) for the strategy, plan, conventions, performance budgets, security threat model, and AI playbook:

- [System TEST_STRATEGY.md](https://github.com/jeffgicharu/wallet-api/blob/main/TEST_STRATEGY.md)
- [System QA_BEST_PRACTICES.md](https://github.com/jeffgicharu/wallet-api/blob/main/QA_BEST_PRACTICES.md)
- [AI_TESTING_PLAYBOOK.md](https://github.com/jeffgicharu/wallet-api/blob/main/AI_TESTING_PLAYBOOK.md)
- [PERFORMANCE_TESTING.md](https://github.com/jeffgicharu/wallet-api/blob/main/PERFORMANCE_TESTING.md)
- [SECURITY_TESTING.md](https://github.com/jeffgicharu/wallet-api/blob/main/SECURITY_TESTING.md)

## License

MIT
