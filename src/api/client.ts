import axios from 'axios';

// VITE_API_BASE_URL points at the wallet-api root. Defaults to '/api' so
// the Vite dev server's proxy (vite.config.ts) handles local development
// without any env setup. In a production build, set VITE_API_BASE_URL to
// the public API origin, e.g. https://wallet-api.jeffgicharu.com
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401/403 the interceptor clears the session and hard-redirects to
// /login — correct for an expired token mid-session. But on the login
// page itself a 401 means "wrong password", not "session expired"; the
// hard reload there raced LoginPage's catch block and erased the
// "Invalid email or password" message before the user could see it
// (issue #12). Skip the redirect for the auth endpoints so the page's
// local error handling can render instead.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url: string = err.config?.url ?? '';
    const isAuthEndpoint =
      url.includes('/auth/login') || url.includes('/auth/register');
    if (
      (err.response?.status === 401 || err.response?.status === 403) &&
      !isAuthEndpoint
    ) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
