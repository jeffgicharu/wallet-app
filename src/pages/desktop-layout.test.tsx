import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, renderWithRouter } from '../test/render';
import { server } from '../test/msw-server';

// Force the desktop branch. jsdom's matchMedia stub always reports
// `matches:false`, so the cosmetic-only `lg:` utilities can't be unit
// tested — but the pages that *structurally* swap layout do so via
// useIsDesktop(), which this mock pins to the desktop side.
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

describe('desktop layout', () => {
  it('HistoryPage renders a table with column headers and rows', async () => {
    renderWithProviders(<HistoryPage />, { initialEntries: ['/history'], authenticated: auth });

    await waitFor(() =>
      expect(screen.getByRole('table')).toBeInTheDocument(),
    );
    for (const col of ['Date', 'Description', 'Type', 'Status', 'Amount']) {
      expect(screen.getByRole('columnheader', { name: col })).toBeInTheDocument();
    }
    expect(screen.getByText(/Cash deposit/i)).toBeInTheDocument();
    expect(screen.getByText('+ KES 3,000.00')).toBeInTheDocument();
    // Desktop table prints status for every row, including COMPLETED.
    expect(screen.getAllByText('COMPLETED').length).toBeGreaterThanOrEqual(1);

    // A row click navigates to its detail route.
    const user = userEvent.setup();
    await user.click(screen.getByText(/Cash deposit/i));
  });

  it('DepositPage shows the account summary panel', async () => {
    renderWithProviders(<DepositPage />, { authenticated: auth });
    await waitFor(() =>
      expect(screen.getByText('Current balance')).toBeInTheDocument(),
    );
    expect(screen.getByText('After this deposit')).toBeInTheDocument();
  });

  it('WithdrawPage shows the account summary panel', async () => {
    renderWithProviders(<WithdrawPage />, { authenticated: auth });
    await waitFor(() =>
      expect(screen.getByText('Available balance')).toBeInTheDocument(),
    );
    expect(screen.getByText('After this withdrawal')).toBeInTheDocument();
  });

  it('SendPage shows the live transfer summary panel', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SendPage />, { authenticated: auth });
    expect(await screen.findByText('Transfer summary')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/0712/), '0712345678');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.type(screen.getByPlaceholderText('0.00'), '1000');
    // Fee preview (1% of 1000) appears in the summary aside.
    await waitFor(() =>
      expect(screen.getAllByText('KES 10.00').length).toBeGreaterThanOrEqual(1),
    );
  });

  it('TransactionDetailPage shows the about panel and a back action', async () => {
    server.use(
      http.get('*/api/wallet/transactions/DEP-xyz', () =>
        HttpResponse.json({
          success: true,
          data: {
            reference: 'DEP-xyz',
            type: 'DEPOSIT',
            status: 'COMPLETED',
            amount: 5000,
            fee: 0,
            senderPhone: null,
            receiverPhone: '+254700000001',
            description: 'Cash deposit',
            createdAt: '2026-05-14T09:00:00.000Z',
          },
        }),
      ),
    );
    renderWithRouter(
      <Routes>
        <Route path="/history/:ref" element={<TransactionDetailPage />} />
        <Route path="/history" element={<div>History list</div>} />
      </Routes>,
      { initialEntries: ['/history/DEP-xyz'] },
    );
    expect(await screen.findByText('About this transaction')).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Back to history' }));
    expect(await screen.findByText('History list')).toBeInTheDocument();
  });
});
