import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { HistoryPage } from './HistoryPage';
import { renderWithProviders } from '../test/render';
import { server } from '../test/msw-server';

const auth = { token: 't', fullName: 'Alice', phone: '+254700000001' };

describe('HistoryPage', () => {
  it('renders the transaction list from the API with sign-coded amounts', async () => {
    renderWithProviders(<HistoryPage />, { initialEntries: ['/history'], authenticated: auth });

    await waitFor(() =>
      expect(screen.getByText(/Cash deposit/i)).toBeInTheDocument(),
    );
    // +254700000002 → Bob, +254700000003 → Carol (seeded demo users).
    expect(screen.getAllByText(/Sent to Bob/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Received from Carol/i)).toBeInTheDocument();
    expect(screen.getByText(/Cash withdrawal/i)).toBeInTheDocument();
    // The reversal entry is labelled, and the reversed original keeps a
    // visible REVERSED badge (COMPLETED rows print no status).
    expect(screen.getByText('Reversal')).toBeInTheDocument();
    expect(screen.getByText('REVERSED')).toBeInTheDocument();
    expect(screen.queryByText('COMPLETED')).not.toBeInTheDocument();

    // The standalone FEE row is folded out of the list.
    expect(screen.queryByText(/Transfer fee/i)).not.toBeInTheDocument();

    expect(screen.getAllByText(/^- KES/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/^\+ KES/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('+ KES 3,000.00')).toBeInTheDocument();
  });

  it('shows a friendly empty state when the API returns no transactions', async () => {
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
      expect(screen.getByText(/No transactions yet/i)).toBeInTheDocument(),
    );
  });
});
