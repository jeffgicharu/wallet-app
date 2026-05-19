import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { renderWithRouter } from '../test/render';

const auth = { token: 't', fullName: 'Alice Demo', phone: '+254700000001' };

function setup(initial = '/') {
  // Sidebar reads auth; seed it the way renderWithProviders would.
  sessionStorage.setItem('token', auth.token);
  sessionStorage.setItem('fullName', auth.fullName);
  sessionStorage.setItem('phone', auth.phone);
  return renderWithRouter(
    <Routes>
      <Route
        path="*"
        element={
          <>
            <Sidebar />
            <p>login-screen</p>
          </>
        }
      />
    </Routes>,
    { initialEntries: [initial] },
  );
}

describe('Sidebar', () => {
  it('renders the brand, the signed-in name and every destination', () => {
    setup();
    expect(screen.getByText('M-Wallet')).toBeInTheDocument();
    expect(screen.getByText('Alice Demo')).toBeInTheDocument();
    for (const label of ['Home', 'Send', 'History', 'Profile']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('marks the active route', () => {
    setup('/history');
    const active = screen.getByRole('link', { name: 'History' });
    expect(active.className).toContain('bg-indigo-50');
    const inactive = screen.getByRole('link', { name: 'Home' });
    expect(inactive.className).not.toContain('bg-indigo-50');
  });

  it('logs out and routes to /login', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: /Sign Out/i }));
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(await screen.findByText('login-screen')).toBeInTheDocument();
  });
});
