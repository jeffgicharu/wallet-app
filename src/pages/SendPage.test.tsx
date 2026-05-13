import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { http, HttpResponse } from 'msw';
import { SendPage } from './SendPage';
import { renderWithProviders } from '../test/render';
import { server } from '../test/msw-server';

const auth = { token: 't', fullName: 'Alice', phone: '+254700000001' };

describe('SendPage', () => {
  it('starts on the phone step with a phone input and a disabled Next button', () => {
    renderWithProviders(<SendPage />, { initialEntries: ['/send'], authenticated: auth });

    expect(screen.getByText('Recipient Phone Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/0712/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('advances to the amount step once a 10-digit phone number is entered', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SendPage />, { initialEntries: ['/send'], authenticated: auth });

    await user.type(screen.getByPlaceholderText(/0712/), '0712345678');
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText(/Amount \(KES\)/)).toBeInTheDocument();
    expect(screen.getByText('To: 0712345678')).toBeInTheDocument();
  });

  it('keeps the amount Next button disabled until the amount is at least 10', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SendPage />, { initialEntries: ['/send'], authenticated: auth });

    await user.type(screen.getByPlaceholderText(/0712/), '0712345678');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    const amountInput = screen.getByPlaceholderText('0.00');
    await user.type(amountInput, '5');
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    await user.clear(amountInput);
    await user.type(amountInput, '500');
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('shows the recipient and amount on the confirm step', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SendPage />, { initialEntries: ['/send'], authenticated: auth });

    await user.type(screen.getByPlaceholderText(/0712/), '0712345678');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.type(screen.getByPlaceholderText('0.00'), '500');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText(/Confirm Transfer/i)).toBeInTheDocument();
    expect(screen.getByText('0712345678')).toBeInTheDocument();
    expect(screen.getAllByText(/KES\s*500\.00/).length).toBeGreaterThanOrEqual(1);
  });

  it('submits the transfer when the correct PIN is entered and shows the success screen', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SendPage />, { initialEntries: ['/send'], authenticated: auth });

    await user.type(screen.getByPlaceholderText(/0712/), '0712345678');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.type(screen.getByPlaceholderText('0.00'), '500');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: /Enter PIN to Confirm/i }));

    // PinPad is now mounted — type the correct PIN.
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: '4' }));

    await waitFor(() =>
      expect(screen.getByText(/Transfer Successful/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('shows an error toast and returns to the confirm step when the API rejects the transfer', async () => {
    server.use(
      http.post('*/api/wallet/transfer', () =>
        HttpResponse.json(
          { success: false, message: 'Insufficient balance' },
          { status: 400 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<SendPage />, { initialEntries: ['/send'], authenticated: auth });

    await user.type(screen.getByPlaceholderText(/0712/), '0712345678');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.type(screen.getByPlaceholderText('0.00'), '500');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: /Enter PIN to Confirm/i }));
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: '4' }));

    await waitFor(() =>
      expect(screen.getByText(/Insufficient balance/i)).toBeInTheDocument(),
    );
    // Back on the confirm step — the wizard re-renders the confirmation UI.
    expect(screen.getByText(/Confirm Transfer/i)).toBeInTheDocument();
  });

  it('Back button on the amount step returns to the phone step', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SendPage />, { initialEntries: ['/send'], authenticated: auth });

    await user.type(screen.getByPlaceholderText(/0712/), '0712345678');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText(/Amount/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Back/i }));
    expect(screen.getByText('Recipient Phone Number')).toBeInTheDocument();
  });

  /**
   * Characterisation: the Confirm step today displays only "Amount" and
   * "Total" — and Total equals Amount because the frontend does not
   * surface the 1 % transfer fee anywhere. The wallet-api charges the fee
   * server-side; the user sees the post-fee balance change but never the
   * fee itself before confirming. README-implied transparency does not
   * match the current UI.
   */
  it('characterisation_confirmStepDoesNotShowTheTransferFee', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SendPage />, { initialEntries: ['/send'], authenticated: auth });

    await user.type(screen.getByPlaceholderText(/0712/), '0712345678');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.type(screen.getByPlaceholderText('0.00'), '1000');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.queryByText(/fee/i)).not.toBeInTheDocument();
  });

  it('has no accessibility violations on the phone step', async () => {
    const { container } = renderWithProviders(<SendPage />, {
      initialEntries: ['/send'], authenticated: auth,
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
