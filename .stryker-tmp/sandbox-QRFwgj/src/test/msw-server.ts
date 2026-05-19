// @ts-nocheck
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// The axios client uses the relative base URL "/api" by default in tests,
// which jsdom resolves against http://localhost:3000. Match all hosts so the
// handlers fire whether the test runs in jsdom or a real browser harness.
const url = (path: string) => '*/api' + path;

export const handlers = [
  http.post(url('/auth/login'), async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.password === 'password123' && body.email) {
      return HttpResponse.json({
        success: true,
        message: 'Login successful',
        data: {
          token: 'test.jwt.token',
          email: body.email,
          fullName: 'Alice Demo',
          phoneNumber: '+254700000001',
        },
      });
    }
    return HttpResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 },
    );
  }),

  http.get(url('/wallet'), () =>
    HttpResponse.json({
      success: true,
      data: {
        walletId: 1,
        ownerName: 'Alice Demo',
        phoneNumber: '+254700000001',
        balance: 50000.0,
        currency: 'KES',
        active: true,
        dailyTransferLimit: 300000.0,
        dailyTransferUsed: 0,
        createdAt: '2026-05-08T09:00:00.000Z',
      },
    }),
  ),

  http.get(url('/wallet/transactions'), () =>
    HttpResponse.json({
      success: true,
      data: {
        content: [
          {
            reference: 'DEP-001',
            type: 'DEPOSIT',
            status: 'COMPLETED',
            amount: 25000,
            fee: 0,
            senderPhone: null,
            receiverPhone: '+254700000001',
            description: 'Cash deposit',
            createdAt: '2026-05-08T09:30:00Z',
          },
          {
            reference: 'TRF-001',
            type: 'TRANSFER',
            status: 'COMPLETED',
            amount: 5000,
            fee: 50,
            description: 'Transfer to Bob',
            senderPhone: '+254700000001',
            receiverPhone: '+254700000002',
            createdAt: '2026-05-08T10:00:00Z',
          },
          {
            // Standalone fee row — the UI must fold this out of the list.
            reference: 'TRF-001-FEE',
            type: 'FEE',
            status: 'COMPLETED',
            amount: 50,
            fee: 0,
            senderPhone: '+254700000001',
            receiverPhone: null,
            description: 'Transfer fee for TRF-001',
            createdAt: '2026-05-08T10:00:01Z',
          },
          {
            // Incoming transfer — Alice is the receiver, not the sender.
            reference: 'TRF-002',
            type: 'TRANSFER',
            status: 'COMPLETED',
            amount: 3000,
            fee: 0,
            senderPhone: '+254700000003',
            receiverPhone: '+254700000001',
            description: 'Transfer to +254700000001',
            createdAt: '2026-05-08T10:30:00Z',
          },
          {
            reference: 'WDR-001',
            type: 'WITHDRAWAL',
            status: 'COMPLETED',
            amount: 1000,
            fee: 0,
            senderPhone: '+254700000001',
            receiverPhone: null,
            description: 'Cash withdrawal',
            createdAt: '2026-05-08T11:00:00Z',
          },
          {
            // A reversed outgoing transfer keeps a REVERSED status.
            reference: 'TRF-009',
            type: 'TRANSFER',
            status: 'REVERSED',
            amount: 2000,
            fee: 20,
            senderPhone: '+254700000001',
            receiverPhone: '+254700000002',
            description: 'Transfer to Bob',
            createdAt: '2026-05-08T12:00:00Z',
          },
          {
            // The reversal entry itself (REV- reference).
            reference: 'REV-TRF-009',
            type: 'TRANSFER',
            status: 'COMPLETED',
            amount: 2000,
            fee: 0,
            senderPhone: '+254700000002',
            receiverPhone: '+254700000001',
            description: 'Reversal of TRF-009: customer request',
            createdAt: '2026-05-08T12:00:05Z',
          },
        ],
        totalElements: 7,
        totalPages: 1,
        number: 0,
      },
    }),
  ),

  http.post(url('/wallet/deposit'), async ({ request }) => {
    const body = (await request.json()) as { amount: number; idempotencyKey: string };
    return HttpResponse.json({
      success: true,
      data: {
        reference: 'DEP-' + body.idempotencyKey,
        type: 'DEPOSIT',
        status: 'COMPLETED',
        amount: body.amount,
        createdAt: new Date().toISOString(),
      },
    });
  }),

  http.post(url('/wallet/withdraw'), async ({ request }) => {
    const body = (await request.json()) as { amount: number; pin: string; idempotencyKey: string };
    if (body.pin !== '1234') {
      return HttpResponse.json(
        { success: false, message: 'Invalid PIN' },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      success: true,
      data: {
        reference: 'WDR-' + body.idempotencyKey,
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        amount: body.amount,
        createdAt: new Date().toISOString(),
      },
    });
  }),

  http.post(url('/wallet/transfer'), async ({ request }) => {
    const body = (await request.json()) as { amount: number; pin: string; idempotencyKey: string };
    if (body.pin !== '1234') {
      return HttpResponse.json(
        { success: false, message: 'Invalid PIN' },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      success: true,
      data: {
        reference: 'TRF-' + body.idempotencyKey,
        type: 'TRANSFER',
        status: 'COMPLETED',
        amount: body.amount,
        createdAt: new Date().toISOString(),
      },
    });
  }),
];

export const server = setupServer(...handlers);
