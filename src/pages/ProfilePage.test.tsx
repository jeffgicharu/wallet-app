import { describe, it, expect } from 'vitest';
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

  it('clears session storage when Sign Out is tapped', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />, { initialEntries: ['/profile'], authenticated: auth });

    expect(sessionStorage.getItem('token')).toBe('authed.jwt.token');
    await user.click(screen.getByRole('button', { name: /Sign Out/i }));
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('fullName')).toBeNull();
  });
});
