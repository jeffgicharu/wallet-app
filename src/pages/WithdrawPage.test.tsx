import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithdrawPage } from './WithdrawPage';
import { renderWithProviders } from '../test/render';

const auth = { token: 't', fullName: 'Alice', phone: '+254700000001' };

describe('WithdrawPage', () => {
  it('keeps the Withdraw button disabled until the amount is at least 10', async () => {
    const user = userEvent.setup();
    renderWithProviders(<WithdrawPage />, { initialEntries: ['/withdraw'], authenticated: auth });

    expect(screen.getByRole('button', { name: 'Withdraw' })).toBeDisabled();
    await user.type(screen.getByPlaceholderText('0.00'), '5');
    expect(screen.getByRole('button', { name: 'Withdraw' })).toBeDisabled();
    await user.clear(screen.getByPlaceholderText('0.00'));
    await user.type(screen.getByPlaceholderText('0.00'), '500');
    expect(screen.getByRole('button', { name: 'Withdraw' })).toBeEnabled();
  });

  it('reveals the PinPad after the Withdraw button is tapped', async () => {
    const user = userEvent.setup();
    renderWithProviders(<WithdrawPage />, { initialEntries: ['/withdraw'], authenticated: auth });

    await user.type(screen.getByPlaceholderText('0.00'), '500');
    await user.click(screen.getByRole('button', { name: 'Withdraw' }));

    expect(screen.getByText(/Enter PIN to withdraw/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
  });

  it('shows the success screen after the correct PIN is entered', async () => {
    const user = userEvent.setup();
    renderWithProviders(<WithdrawPage />, { initialEntries: ['/withdraw'], authenticated: auth });

    await user.type(screen.getByPlaceholderText('0.00'), '500');
    await user.click(screen.getByRole('button', { name: 'Withdraw' }));
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: '4' }));

    await waitFor(() =>
      expect(screen.getByText(/Withdrawal Successful/i)).toBeInTheDocument(),
    );
  });
});
