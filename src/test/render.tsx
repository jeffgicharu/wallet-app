import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';

interface RenderOptions {
  /** Initial path the MemoryRouter starts on. Defaults to "/". */
  initialEntries?: string[];
  /** Extra routes to register so navigation can be asserted. */
  extraRoutes?: Array<{ path: string; element: ReactNode }>;
  /** Pre-seed sessionStorage so the auth context boots authenticated. */
  authenticated?: { token: string; fullName: string; phone: string };
}

/**
 * Render a component inside a fresh React Query client, an AuthProvider, a
 * MemoryRouter, and the Toaster. Each `renderWithProviders` call gets its
 * own QueryClient so cache state never leaks across tests.
 */
export function renderWithProviders(ui: ReactElement, opts: RenderOptions = {}) {
  if (opts.authenticated) {
    sessionStorage.setItem('token', opts.authenticated.token);
    sessionStorage.setItem('fullName', opts.authenticated.fullName);
    sessionStorage.setItem('phone', opts.authenticated.phone);
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={opts.initialEntries ?? ['/']}>
          <Routes>
            {/* extraRoutes go first so concrete paths take precedence
                over the catch-all that hosts the component under test. */}
            {(opts.extraRoutes ?? []).map(r => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
            <Route path="*" element={ui} />
          </Routes>
        </MemoryRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

/**
 * Variant that does not wrap the UI in a Route, so tests can supply their
 * own routing tree. Useful when the component under test internally uses
 * <Navigate> and the test wants to observe the destination.
 */
export function renderWithRouter(routes: ReactElement, opts: { initialEntries?: string[] } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={opts.initialEntries ?? ['/']}>
          {routes}
        </MemoryRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>,
  );
}
