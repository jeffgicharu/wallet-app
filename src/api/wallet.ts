import api from './client';
import type { ApiResponse, WalletInfo, Transaction, PageData, AuthResponse } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

  register: (data: { fullName: string; email: string; phoneNumber: string; password: string; pin: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),
};

export const walletApi = {
  getWallet: () => api.get<ApiResponse<WalletInfo>>('/wallet'),

  deposit: (amount: number, idempotencyKey: string) =>
    api.post<ApiResponse<Transaction>>('/wallet/deposit', { amount, idempotencyKey }),

  withdraw: (amount: number, pin: string, idempotencyKey: string) =>
    api.post<ApiResponse<Transaction>>('/wallet/withdraw', { amount, pin, idempotencyKey }),

  transfer: (recipientPhone: string, amount: number, pin: string, idempotencyKey: string, description?: string) =>
    api.post<ApiResponse<Transaction>>('/wallet/transfer', { recipientPhone, amount, pin, idempotencyKey, description }),

  getTransactions: (page = 0, size = 20) =>
    api.get<ApiResponse<PageData<Transaction>>>(`/wallet/transactions?page=${page}&size=${size}`),

  getTransaction: (ref: string) =>
    api.get<ApiResponse<Transaction>>(`/wallet/transactions/${ref}`),
};
