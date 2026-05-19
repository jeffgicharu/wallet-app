import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotFoundPage } from './NotFoundPage';
import { renderWithProviders } from '../test/render';

describe('NotFoundPage', () => {
  it('renders a branded 404 with a way back home', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotFoundPage />, {
      initialEntries: ['/totally-unknown'],
      extraRoutes: [{ path: '/', element: <div data-testid="home">Home</div> }],
    });

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Back to Home/i }));
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });
});
