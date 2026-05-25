import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, renderWithRouter } from '../test/render';
import { server } from '../test/msw-server';

// Force the desktop branch. jsdom's matchMedia stub always reports
// `matches:false`, so the cosmetic-only `lg:` utilities can't be unit
// tested — but the pages that *structurally* swap layout do so via
// useIsDesktop(), which this mock pins to the desktop side. These
// assertions are deliberately behavioural (computed values, navigation,
// status text) so the desktop branches are mutation-covered, not merely
// reached.
vi.mock('../lib/useMediaQuery', () => ({
  useMediaQuery: () => true,
  useIsDesktop: () => true,
}));

import { HistoryPage } from './HistoryPage';
import { DepositPage } from './DepositPage';
import { WithdrawPage } from './WithdrawPage';
import { SendPage } from './SendPage';
import { TransactionDetailPage } from './TransactionDetailPage';

const auth = { token: 't', fullName: 'Alice Demo', phone: '+254700000001' };
const detailRoute = { path: '/history/:ref', element: <div>tx-detail-route</div> };

describe('desktop layout — HistoryPage table', () => {
  it('renders a column-headed table with status and signed amounts', async () => {
    renderWithProviders(<HistoryPage />, {
      initialEntries: ['/history'],
      authenticated: auth,
    });

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    for (const col of ['Date', 'Description', 'Type', 'Status', 'Amount']) {
      expect(screen.getByRole('columnheader', { name: col })).toBeInTheDocument();
    }

    // Direction-signed amounts: deposit/incoming transfer are "+", the
    // outgoing transfer/withdrawal are "-".
    expect(screen.getByText('+ KES 25,000.00')).toBeInTheDocument();
    expect(screen.getByText('+ KES 3,000.00')).toBeInTheDocument();
    expect(screen.getByText('- KES 5,000.00')).toBeInTheDocument();
    expect(screen.getByText('- KES 1,000.00')).toBeInTheDocument();

    // Reversal entry is labelled; the reversed original keeps REVERSED;
    // ordinary rows print COMPLETED in the desktop table.
    expect(screen.getByText('Reversal')).toBeInTheDocument();
    expect(screen.getByText('REVERSED')).toBeInTheDocument();
    expect(screen.getAllByText('COMPLETED').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Cash withdrawal')).toBeInTheDocument();
    expect(screen.getAllByText('DEPOSIT').length).toBeGreaterThanOrEqual(1);

    // Standalone FEE row is folded out.
    expect(screen.queryByText(/Transfer fee/i)).not.toBeInTheDocument();
  });

  it('opens the detail route on row click and on Enter', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithProviders(<HistoryPage />, {
      initialEntries: ['/history'],
      authenticated: auth,
      extraRoutes: [detailRoute],
    });
    await waitFor(() => expect(screen.getByText('Cash deposit')).toBeInTheDocument());
    await user.click(screen.getByText('Cash deposit'));
    expect(await screen.findByText('tx-detail-route')).toBeInTheDocument();
    unmount();

    renderWithProviders(<HistoryPage />, {
      initialEntries: ['/history'],
      authenticated: auth,
      extraRoutes: [detailRoute],
    });
    await waitFor(() => expect(screen.getByText('Cash deposit')).toBeInTheDocument());
    const row = screen.getByText('Cash deposit').closest('tr') as HTMLElement;
    row.focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByText('tx-detail-route')).toBeInTheDocument();
  });

  it('shows the empty state when there are no transactions', async () => {
    server.use(
      http.get('*/api/wallet/transactions', () =>
        HttpResponse.json({
          success: true,
          data: { content: [], totalElements: 0, totalPages: 0, number: 0 },
        }),
      ),
    );
    renderWithProviders(<HistoryPage />, { initialEntries: ['/history'], authenticated: auth });
    await waitFor(() =>
      expect(screen.getByText('No transactions yet')).toBeInTheDocument(),
    );
    expect(screen.queryByText('Cash deposit')).not.toBeInTheDocument();
    expect(screen.queryByText('DEPOSIT')).not.toBeInTheDocument();
  });

  describe('summary strip', () => {
    beforeAll(() => {
      // Pin so the May-8 fixture rows fall in this month and the
      // last-30-day window — the strip computes both off the txn list.
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-05-15T12:00:00Z'));
    });
    afterAll(() => vi.useRealTimers());

    it('shows the month transaction count and net amount on desktop', async () => {
      renderWithProviders(<HistoryPage />, {
        initialEntries: ['/history'],
        authenticated: auth,
      });
      // 6 non-FEE rows in May → plural.
      await waitFor(() =>
        expect(
          screen.getByText('6 transactions this month'),
        ).toBeInTheDocument(),
      );
      // Net = 25,000 - 5,000 + 3,000 - 1,000 - 2,000 + 2,000 = 22,000 (the
      // reversal pair cancels). Positive → green.
      expect(screen.getByText('+ KES 22,000.00 net')).toBeInTheDocument();
    });
  });
});

describe('desktop layout — Deposit summary panel', () => {
  it('shows the live balance projection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DepositPage />, { authenticated: auth });

    expect(await screen.findByText('Current balance')).toBeInTheDocument();
    expect(await screen.findByText('KES 50,000.00')).toBeInTheDocument();
    expect(screen.getByText('After this deposit')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);

    await user.type(screen.getByPlaceholderText('0.00'), '500');
    await waitFor(() =>
      expect(screen.getByText('KES 50,500.00')).toBeInTheDocument(),
    );
    expect(
      screen.getByText(/Deposits are credited instantly\. No fee is charged on deposits\./),
    ).toBeInTheDocument();
  });
});

describe('desktop layout — Withdraw summary panel', () => {
  it('shows the post-withdrawal projection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<WithdrawPage />, { authenticated: auth });

    expect(await screen.findByText('Available balance')).toBeInTheDocument();
    expect(await screen.findByText('KES 50,000.00')).toBeInTheDocument();
    expect(screen.getByText('After this withdrawal')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('0.00'), '500');
    await waitFor(() =>
      expect(screen.getByText('KES 49,500.00')).toBeInTheDocument(),
    );
    expect(
      screen.getByText(/Minimum withdrawal is KES 10\.00\. You'll confirm with your PIN\./),
    ).toBeInTheDocument();
  });
});

describe('desktop layout — Send summary panel', () => {
  it('mirrors recipient, amount, fee, total and remaining limit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SendPage />, { authenticated: auth });

    expect(await screen.findByText('Transfer summary')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);

    await user.type(screen.getByPlaceholderText(/0712/), '0712345678');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByText('Recipient')).toBeInTheDocument());
    expect(screen.getAllByText('0712345678').length).toBeGreaterThanOrEqual(1);

    await user.type(screen.getByPlaceholderText('0.00'), '1000');
    // Fee = 1% of 1000 = 10.00, total = 1010.00, remaining = 300,000.00.
    await waitFor(() =>
      expect(screen.getAllByText('KES 10.00').length).toBeGreaterThanOrEqual(1),
    );
    expect(screen.getAllByText('KES 1,000.00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('KES 1,010.00')).toBeInTheDocument();
    expect(screen.getByText('KES 300,000.00')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Confirm Transfer')).toBeInTheDocument();
  });
});

describe('desktop layout — Transaction detail', () => {
  it('renders the receipt and about panel and navigates back', async () => {
    server.use(
      http.get('*/api/wallet/transactions/TRF-xyz', () =>
        HttpResponse.json({
          success: true,
          data: {
            reference: 'TRF-xyz',
            type: 'TRANSFER',
            status: 'COMPLETED',
            amount: 4200,
            fee: 42,
            senderPhone: '+254700000001',
            receiverPhone: '+254700000002',
            description: 'Rent share',
            createdAt: '2026-05-14T09:00:00.000Z',
          },
        }),
      ),
    );
    const user = userEvent.setup();
    renderWithRouter(
      <Routes>
        <Route path="/history/:ref" element={<TransactionDetailPage />} />
        <Route path="/history" element={<div>history-list-route</div>} />
      </Routes>,
      { initialEntries: ['/history/TRF-xyz'] },
    );

    // Reference shows in the receipt body AND in the about-panel mini-list.
    await waitFor(() =>
      expect(screen.getAllByText('TRF-xyz').length).toBeGreaterThanOrEqual(2),
    );
    // Alice is the sender → outgoing → signed minus.
    expect(screen.getByText('- KES 4,200.00')).toBeInTheDocument();
    expect(screen.getByText('Rent share')).toBeInTheDocument();
    expect(screen.getByText('TRANSFER')).toBeInTheDocument();
    expect(screen.getByText('KES 42.00')).toBeInTheDocument(); // fee > 0 branch
    // Known counterparties resolve to "Name · number" on the receipt.
    expect(
      screen.getByText('Alice · +254700000001'),
    ).toBeInTheDocument(); // From
    expect(
      screen.getByText('Bob · +254700000002'),
    ).toBeInTheDocument(); // To
    // Outgoing TRANSFER to Bob → about sentence names the counterparty
    // and the debit direction.
    expect(
      screen.getByText(/Transfer to Bob\. The amount has been debited/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to history' }));
    expect(await screen.findByText('history-list-route')).toBeInTheDocument();
  });
});
