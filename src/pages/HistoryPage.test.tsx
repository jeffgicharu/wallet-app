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
    expect(screen.getByText(/Transfer to Bob/i)).toBeInTheDocument();
    expect(screen.getByText(/Cash withdrawal/i)).toBeInTheDocument();

    expect(screen.getAllByText(/^-KES/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/^\+KES/).length).toBeGreaterThanOrEqual(1);
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
