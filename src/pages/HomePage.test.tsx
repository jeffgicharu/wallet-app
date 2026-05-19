import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomePage } from './HomePage';
import { renderWithProviders } from '../test/render';

const auth = { token: 't', fullName: 'Alice Demo', phone: '+254700000001' };

describe('HomePage', () => {
  it('greets the user and renders the balance from the wallet API', async () => {
    renderWithProviders(<HomePage />, { authenticated: auth });

    expect(screen.getByText(/Hello, Alice/)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText(/KES\s*50,000\.00/)).toBeInTheDocument(),
    );
  });

  it('toggles the visible balance when the eye button is tapped', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<HomePage />, { authenticated: auth });

    await waitFor(() =>
      expect(screen.getByText(/KES\s*50,000\.00/)).toBeInTheDocument(),
    );

    // The eye button is the only button inside the balance card without a
    // visible text label (it uses an icon). Locate it by selecting the
    // EyeOff/Eye icon's parent button.
    const toggle = container.querySelector('button.bg-indigo-500\\/30') as HTMLElement;
    expect(toggle).toBeTruthy();
    await user.click(toggle);

    expect(screen.getByText(/KES \*\*\*\*/)).toBeInTheDocument();
    await user.click(toggle);
    expect(screen.getByText(/KES\s*50,000\.00/)).toBeInTheDocument();
  });

  it('renders the recent transactions list with sign-coded amounts', async () => {
    renderWithProviders(<HomePage />, { authenticated: auth });

    await waitFor(() =>
      expect(screen.getByText(/Cash deposit/i)).toBeInTheDocument(),
    );
    // Alice is the sender of TRF-001, so it reads as an outgoing send;
    // she is the receiver of TRF-002, so that reads as incoming.
    expect(screen.getAllByText(/Sent to \+254700000002/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Received from \+254700000003/i)).toBeInTheDocument();
    expect(screen.getByText(/Cash withdrawal/i)).toBeInTheDocument();

    // The standalone FEE row is folded out of the list.
    expect(screen.queryByText(/Transfer fee/i)).not.toBeInTheDocument();

    // Outgoing transactions render the red colour class; incoming the green.
    const outgoing = screen.getAllByText(/^- KES/);
    const incoming = screen.getAllByText(/^\+ KES/);
    expect(outgoing.length).toBeGreaterThanOrEqual(1);
    expect(incoming.length).toBeGreaterThanOrEqual(1);
    // The incoming transfer's amount is green and signed '+ KES 3,000.00'.
    expect(screen.getByText('+ KES 3,000.00')).toBeInTheDocument();
    expect(screen.getByText('- KES 5,000.00')).toBeInTheDocument();
  });
});
