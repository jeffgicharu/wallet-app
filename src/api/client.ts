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

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
