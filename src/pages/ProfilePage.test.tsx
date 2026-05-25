import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfilePage } from './ProfilePage';
import { renderWithProviders } from '../test/render';

const auth = { token: 'authed.jwt.token', fullName: 'Alice Demo', phone: '+254700000001' };

describe('ProfilePage', () => {
  it('renders the authenticated user profile and the wallet balance', async () => {
    renderWithProviders(<ProfilePage />, { initialEntries: ['/profile'], authenticated: auth });

    expect(screen.getByText('Alice Demo')).toBeInTheDocument();
    expect(screen.getAllByText('+254700000001').length).toBeGreaterThanOrEqual(1);
    await waitFor(() =>
      expect(screen.getByText(/KES\s*50,000\.00/)).toBeInTheDocument(),
    );
  });

  it('lists the account-detail rows with their values', async () => {
    renderWithProviders(<ProfilePage />, { initialEntries: ['/profile'], authenticated: auth });

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByText('Account details')).toBeInTheDocument();
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
    expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
    expect(screen.getByText('Daily Transfer Limit')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText(/KES\s*300,000\.00/)).toBeInTheDocument(),
    );
  });

  describe('activity card', () => {
    beforeAll(() => {
      // Pin date so the MSW fixture (May 8, 2026) falls inside the
      // "last 30 days" window and in the same calendar month as `now`.
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-05-15T12:00:00Z'));
    });
    afterAll(() => vi.useRealTimers());

    it('renders the heading and the month transaction count', async () => {
      renderWithProviders(<ProfilePage />, { authenticated: auth });
      expect(
        await screen.findByText('Activity (last 30 days)'),
      ).toBeInTheDocument();
      // Six non-FEE transactions in May → plural.
      await waitFor(() =>
        expect(screen.getByText('6 transactions this month')).toBeInTheDocument(),
      );
      expect(screen.getByText('In')).toBeInTheDocument();
      expect(screen.getByText('Out')).toBeInTheDocument();
      expect(screen.getByText('Net')).toBeInTheDocument();
    });

    it('computes In / Out / Net from the transaction list', async () => {
      renderWithProviders(<ProfilePage />, { authenticated: auth });
      // Alice incoming = DEP-001 (25,000) + TRF-002 (3,000) + REV-TRF-009 (2,000) = 30,000
      await waitFor(() =>
        expect(screen.getByText('KES 30,000.00')).toBeInTheDocument(),
      );
      // Alice outgoing = TRF-001 (5,000) + WDR-001 (1,000) + TRF-009 (2,000) = 8,000
      expect(screen.getByText('KES 8,000.00')).toBeInTheDocument();
      // Net = 30,000 - 8,000 = 22,000 → green +.
      expect(screen.getByText('+ KES 22,000.00')).toBeInTheDocument();
    });
  });

  it('clears session storage when Sign Out is tapped', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />, { initialEntries: ['/profile'], authenticated: auth });

    expect(sessionStorage.getItem('token')).toBe('authed.jwt.token');
    await user.click(screen.getByRole('button', { name: /Sign Out/i }));
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('fullName')).toBeNull();
  });
});
