import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import api from './client';
import { server } from '../test/msw-server';

// Issue #12: the 401/403 interceptor must NOT hard-redirect for the
// /auth/* endpoints, otherwise a wrong-password login reloads /login
// before the page can show "Invalid email or password".
describe('api client 401/403 interceptor', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('does NOT clear the session on a 401 from /auth/login (fix for #12)', async () => {
    sessionStorage.setItem('token', 'pre-existing');
    server.use(
      http.post('*/api/auth/login', () =>
        HttpResponse.json({ success: false }, { status: 401 }),
      ),
    );

    await expect(
      api.post('/auth/login', { email: 'a@b.c', password: 'wrong' }),
    ).rejects.toMatchObject({ response: { status: 401 } });

    // Session left intact; LoginPage owns the error UX, not the interceptor.
    expect(sessionStorage.getItem('token')).toBe('pre-existing');
  });

  it('still clears the session on a 401 from a protected endpoint', async () => {
    sessionStorage.setItem('token', 'stale');
    server.use(
      http.get('*/api/wallet', () =>
        HttpResponse.json({ success: false }, { status: 401 }),
      ),
    );

    await expect(api.get('/wallet')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(sessionStorage.getItem('token')).toBeNull();
  });
});
