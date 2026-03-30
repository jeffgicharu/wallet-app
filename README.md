# Wallet App

A mobile-first React frontend for the [wallet-api](https://github.com/jeffgicharu/wallet-api). This is the customer-facing app where users check their balance, send money, deposit, withdraw, and view transaction history. Built to look and feel like a real mobile money app.

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

## License

MIT
