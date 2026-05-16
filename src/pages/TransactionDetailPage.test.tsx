import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { TransactionDetailPage } from './TransactionDetailPage';
import { renderWithRouter } from '../test/render';
import { server } from '../test/msw-server';

function renderAt(ref: string) {
  return renderWithRouter(
    <Routes>
      <Route path="/history/:ref" element={<TransactionDetailPage />} />
      <Route path="/history" element={<div>History list</div>} />
    </Routes>,
    { initialEntries: [`/history/${ref}`] },
  );
}

describe('TransactionDetailPage', () => {
  it('renders the transaction detail for a valid reference (fix for #8)', async () => {
    server.use(
      http.get('*/api/wallet/transactions/DEP-abc', () =>
        HttpResponse.json({
          success: true,
          data: {
            reference: 'DEP-abc',
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

    renderAt('DEP-abc');

    expect(
      screen.getByRole('heading', { name: 'Transaction Detail' }),
    ).toBeInTheDocument();
    // Wait for the query to resolve and the detail body to render.
    await waitFor(() =>
      expect(screen.getByText('DEP-abc')).toBeInTheDocument(),
    );
    expect(screen.getByText('DEPOSIT')).toBeInTheDocument();
    expect(screen.getByText(/\+ KES 5,000\.00/)).toBeInTheDocument();
  });

  it('shows a not-found message when the lookup fails (fix for #8)', async () => {
    server.use(
      http.get('*/api/wallet/transactions/MISSING', () =>
        HttpResponse.json({ success: false }, { status: 404 }),
      ),
    );

    renderAt('MISSING');

    await waitFor(() =>
      expect(screen.getByText(/couldn't find that transaction/i)).toBeInTheDocument(),
    );
  });
});
