import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DepositPage } from './DepositPage';
import { renderWithProviders } from '../test/render';

const auth = { token: 't', fullName: 'Alice', phone: '+254700000001' };

describe('DepositPage', () => {
  it('keeps the Deposit button disabled until the amount is at least 1', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DepositPage />, { initialEntries: ['/deposit'], authenticated: auth });

    expect(screen.getByRole('button', { name: 'Deposit' })).toBeDisabled();
    await user.type(screen.getByPlaceholderText('0.00'), '5');
    expect(screen.getByRole('button', { name: 'Deposit' })).toBeEnabled();
  });

  it('preset buttons populate the amount input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DepositPage />, { initialEntries: ['/deposit'], authenticated: auth });

    await user.click(screen.getByRole('button', { name: '5,000' }));
    expect(screen.getByPlaceholderText('0.00')).toHaveValue(5000);
  });

  it('shows the success screen after a successful deposit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DepositPage />, { initialEntries: ['/deposit'], authenticated: auth });

    await user.click(screen.getByRole('button', { name: '1,000' }));
    await user.click(screen.getByRole('button', { name: 'Deposit' }));

    await waitFor(() =>
      expect(screen.getByText(/Deposit Successful/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });
});
