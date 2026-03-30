export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'FEE';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';

export interface WalletInfo {
  walletId: number;
  ownerName: string;
  phoneNumber: string;
  balance: number;
  currency: string;
  active: boolean;
  dailyTransferLimit: number;
  dailyTransferUsed: number;
  createdAt: string;
}

export interface Transaction {
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee: number;
  senderPhone: string | null;
  receiverPhone: string | null;
  description: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  phoneNumber: string;
}
