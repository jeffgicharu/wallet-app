import { describe, it, expect } from 'vitest';
import path from 'node:path';
import axios from 'axios';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';

const { like, regex, eachLike } = MatchersV3;

// Single provider instance shared across all interactions in this file. Each
// `it` block adds one interaction; on test-run completion @pact-foundation/pact
// writes the accumulated set to ./pacts/wallet-app-wallet-api.json.
const provider = new PactV3({
  consumer: 'wallet-app',
  provider: 'wallet-api',
  dir: path.resolve(process.cwd(), 'pacts'),
  spec: 3,
  logLevel: 'warn',
});

// ───────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────

const jsonHeaders = { 'Content-Type': 'application/json' };
const bearerHeaders = (t: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${t}`,
});

// JWT shape — three base64url segments separated by dots. The provider may
// return any valid JWT; the consumer matches on shape, not the literal value.
const jwtMatcher = regex(
  /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
  'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhbGljZUBkZW1vLmxvY2FsIn0.signature',
);

// Common transaction-shape matcher used in history responses.
const transactionShape = {
  reference: like('DEP-abc123'),
  type: regex(/DEPOSIT|WITHDRAWAL|TRANSFER|FEE|REVERSAL/, 'DEPOSIT'),
  status: regex(/PENDING|COMPLETED|FAILED|REVERSED/, 'COMPLETED'),
  amount: like(5000),
  description: like('Cash deposit'),
  createdAt: like('2026-05-08T09:30:00Z'),
};

// ───────────────────────────────────────────────────────────────────────
// AUTH
// ───────────────────────────────────────────────────────────────────────

describe('auth contracts', () => {
  it('POST /api/auth/register — happy path returns 201 with token + user', async () => {
    provider
      .given('no user with email alice@demo.local or phone +254700000099 exists')
      .uponReceiving('a registration with valid fields')
      .withRequest({
        method: 'POST',
        path: '/api/auth/register',
        headers: jsonHeaders,
        body: {
          fullName: 'Alice Demo',
          email: 'alice@demo.local',
          phoneNumber: '+254700000099',
          password: 'password123',
          pin: '1234',
        },
      })
      .willRespondWith({
        status: 201,
        headers: jsonHeaders,
        body: {
          success: true,
          message: like('User registered successfully'),
          data: {
            token: jwtMatcher,
            email: 'alice@demo.local',
            fullName: 'Alice Demo',
            phoneNumber: '+254700000099',
          },
          timestamp: like('2026-05-08T09:00:00Z'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const res = await axios.post(`${mockServer.url}/api/auth/register`, {
        fullName: 'Alice Demo',
        email: 'alice@demo.local',
        phoneNumber: '+254700000099',
        password: 'password123',
        pin: '1234',
      });
      expect(res.status).toBe(201);
      expect(res.data.data.token).toMatch(/\..+\..+/);
    });
  });

  it('POST /api/auth/login — happy path returns 200 with JWT', async () => {
    provider
      .given('alice exists with balance 50000 KES')
      .uponReceiving('a login with correct credentials')
      .withRequest({
        method: 'POST',
        path: '/api/auth/login',
        headers: jsonHeaders,
        body: { email: 'alice@demo.local', password: 'password123' },
      })
      .willRespondWith({
        status: 200,
        headers: jsonHeaders,
        body: {
          success: true,
          message: like('Login successful'),
          data: {
            token: jwtMatcher,
            email: 'alice@demo.local',
            fullName: like('Alice Demo'),
            phoneNumber: like('+254700000001'),
          },
          timestamp: like('2026-05-08T09:00:00Z'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const res = await axios.post(`${mockServer.url}/api/auth/login`, {
        email: 'alice@demo.local',
        password: 'password123',
      });
      expect(res.status).toBe(200);
      expect(res.data.data.token).toBeDefined();
    });
  });

  it('POST /api/auth/login — wrong password returns 401', async () => {
    provider
      .given('alice exists with balance 50000 KES')
      .uponReceiving('a login with the wrong password')
      .withRequest({
        method: 'POST',
        path: '/api/auth/login',
        headers: jsonHeaders,
        body: { email: 'alice@demo.local', password: 'WRONG' },
      })
      .willRespondWith({
        status: 401,
        headers: jsonHeaders,
        body: {
          success: false,
          message: like('Invalid email or password'),
          timestamp: like('2026-05-08T09:00:00Z'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      try {
        await axios.post(`${mockServer.url}/api/auth/login`, {
          email: 'alice@demo.local',
          password: 'WRONG',
        });
        throw new Error('expected 401');
      } catch (err: unknown) {
        const e = err as { response: { status: number; data: { success: boolean } } };
        expect(e.response.status).toBe(401);
        expect(e.response.data.success).toBe(false);
      }
    });
  });
});

// ───────────────────────────────────────────────────────────────────────
// WALLET
// ───────────────────────────────────────────────────────────────────────

describe('wallet contracts', () => {
  it('GET /api/wallet — returns balance and daily-limit info for authenticated user', async () => {
    provider
      .given('alice exists with balance 50000 KES')
      .uponReceiving('a wallet read for the authenticated user')
      .withRequest({
        method: 'GET',
        path: '/api/wallet',
        headers: { 'Authorization': regex(/^Bearer .+/, 'Bearer test.jwt.token') },
      })
      .willRespondWith({
        status: 200,
        headers: jsonHeaders,
        body: {
          success: true,
          data: {
            walletId: like(1),
            ownerName: like('Alice Demo'),
            phoneNumber: like('+254700000001'),
            balance: like(50000.0),
            currency: 'KES',
            active: true,
            dailyTransferLimit: like(300000.0),
            dailyTransferUsed: like(0),
            createdAt: like('2026-05-08T09:00:00Z'),
          },
          timestamp: like('2026-05-08T09:00:00Z'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const res = await axios.get(`${mockServer.url}/api/wallet`, {
        headers: bearerHeaders('test.jwt.token'),
      });
      expect(res.status).toBe(200);
      expect(res.data.data.currency).toBe('KES');
    });
  });

  it('POST /api/wallet/deposit — happy path returns 200 with transaction', async () => {
    provider
      .given('alice exists with balance 50000 KES')
      .uponReceiving('a deposit of 5000 KES with a fresh idempotency key')
      .withRequest({
        method: 'POST',
        path: '/api/wallet/deposit',
        headers: { 'Authorization': regex(/^Bearer .+/, 'Bearer test.jwt.token'),
                   'Content-Type': 'application/json' },
        body: { amount: 5000, idempotencyKey: 'dep-pact-001' },
      })
      .willRespondWith({
        status: 200,
        headers: jsonHeaders,
        body: {
          success: true,
          message: like('Deposit successful'),
          data: {
            reference: like('DEP-dep-pact-001'),
            type: 'DEPOSIT',
            status: 'COMPLETED',
            amount: 5000,
            createdAt: like('2026-05-08T09:00:00Z'),
          },
          timestamp: like('2026-05-08T09:00:00Z'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const res = await axios.post(
        `${mockServer.url}/api/wallet/deposit`,
        { amount: 5000, idempotencyKey: 'dep-pact-001' },
        { headers: bearerHeaders('test.jwt.token') },
      );
      expect(res.status).toBe(200);
      expect(res.data.data.type).toBe('DEPOSIT');
    });
  });
});

// ───────────────────────────────────────────────────────────────────────
// WITHDRAW + TRANSFER
// ───────────────────────────────────────────────────────────────────────

describe('withdraw and transfer contracts', () => {
  it('POST /api/wallet/withdraw — happy path with PIN returns 200', async () => {
    provider
      .given('alice exists with balance 50000 KES')
      .uponReceiving('a withdrawal of 1000 KES with the correct PIN')
      .withRequest({
        method: 'POST',
        path: '/api/wallet/withdraw',
        headers: { 'Authorization': regex(/^Bearer .+/, 'Bearer test.jwt.token'),
                   'Content-Type': 'application/json' },
        body: { amount: 1000, pin: '1234', idempotencyKey: 'wdr-pact-001' },
      })
      .willRespondWith({
        status: 200,
        headers: jsonHeaders,
        body: {
          success: true,
          message: like('Withdrawal successful'),
          data: {
            reference: like('WDR-wdr-pact-001'),
            type: 'WITHDRAWAL',
            status: 'COMPLETED',
            amount: 1000,
            createdAt: like('2026-05-08T09:00:00Z'),
          },
          timestamp: like('2026-05-08T09:00:00Z'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const res = await axios.post(
        `${mockServer.url}/api/wallet/withdraw`,
        { amount: 1000, pin: '1234', idempotencyKey: 'wdr-pact-001' },
        { headers: bearerHeaders('test.jwt.token') },
      );
      expect(res.status).toBe(200);
    });
  });

  it('POST /api/wallet/withdraw — wrong PIN returns 401', async () => {
    provider
      .given('alice exists with balance 50000 KES')
      .uponReceiving('a withdrawal with the wrong PIN')
      .withRequest({
        method: 'POST',
        path: '/api/wallet/withdraw',
        headers: { 'Authorization': regex(/^Bearer .+/, 'Bearer test.jwt.token'),
                   'Content-Type': 'application/json' },
        body: { amount: 1000, pin: '9999', idempotencyKey: 'wdr-pact-bad' },
      })
      .willRespondWith({
        status: 401,
        headers: jsonHeaders,
        body: {
          success: false,
          message: like('Invalid PIN'),
          timestamp: like('2026-05-08T09:00:00Z'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      try {
        await axios.post(
          `${mockServer.url}/api/wallet/withdraw`,
          { amount: 1000, pin: '9999', idempotencyKey: 'wdr-pact-bad' },
          { headers: bearerHeaders('test.jwt.token') },
        );
        throw new Error('expected 401');
      } catch (err: unknown) {
        const e = err as { response: { status: number } };
        expect(e.response.status).toBe(401);
      }
    });
  });

  it('POST /api/wallet/transfer — happy path returns 200 with TRANSFER transaction', async () => {
    provider
      .given('alice has balance 50000 KES and bob is registered with phone +254700000002')
      .uponReceiving('a transfer of 5000 KES from alice to bob')
      .withRequest({
        method: 'POST',
        path: '/api/wallet/transfer',
        headers: { 'Authorization': regex(/^Bearer .+/, 'Bearer test.jwt.token'),
                   'Content-Type': 'application/json' },
        body: {
          recipientPhone: '+254700000002',
          amount: 5000,
          pin: '1234',
          idempotencyKey: 'trf-pact-001',
        },
      })
      .willRespondWith({
        status: 200,
        headers: jsonHeaders,
        body: {
          success: true,
          message: like('Transfer successful'),
          data: {
            reference: like('TRF-trf-pact-001'),
            type: 'TRANSFER',
            status: 'COMPLETED',
            amount: 5000,
            createdAt: like('2026-05-08T09:00:00Z'),
          },
          timestamp: like('2026-05-08T09:00:00Z'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const res = await axios.post(
        `${mockServer.url}/api/wallet/transfer`,
        {
          recipientPhone: '+254700000002', amount: 5000,
          pin: '1234', idempotencyKey: 'trf-pact-001',
        },
        { headers: bearerHeaders('test.jwt.token') },
      );
      expect(res.status).toBe(200);
      expect(res.data.data.type).toBe('TRANSFER');
    });
  });

  it('POST /api/wallet/transfer — recipient not found returns 400', async () => {
    /*
     * The TEST_PLAN.md scenario originally said 404. The actual provider
     * implementation throws IllegalArgumentException for unknown recipients,
     * which the GlobalExceptionHandler maps to 400 Bad Request. The contract
     * pins the actual mapping; switching to 404 is a future provider change.
     */
    provider
      .given('alice exists; phone +254799000000 is not registered')
      .uponReceiving('a transfer to an unregistered phone number')
      .withRequest({
        method: 'POST',
        path: '/api/wallet/transfer',
        headers: { 'Authorization': regex(/^Bearer .+/, 'Bearer test.jwt.token'),
                   'Content-Type': 'application/json' },
        body: {
          recipientPhone: '+254799000000', amount: 1000, pin: '1234',
          idempotencyKey: 'trf-pact-nf',
        },
      })
      .willRespondWith({
        status: 400,
        headers: jsonHeaders,
        body: {
          success: false,
          message: like('Recipient not found: +254799000000'),
          timestamp: like('2026-05-08T09:00:00Z'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      try {
        await axios.post(
          `${mockServer.url}/api/wallet/transfer`,
          {
            recipientPhone: '+254799000000', amount: 1000, pin: '1234',
            idempotencyKey: 'trf-pact-nf',
          },
          { headers: bearerHeaders('test.jwt.token') },
        );
        throw new Error('expected 400');
      } catch (err: unknown) {
        const e = err as { response: { status: number } };
        expect(e.response.status).toBe(400);
      }
    });
  });

  it('POST /api/wallet/transfer — duplicate idempotency key returns 409 (issue #10)', async () => {
    /*
     * Issue jeffgicharu/wallet-api#10 captures that the README promises an
     * idempotent retry to RETURN the original transaction, while the current
     * provider rejects the retry with 409 DuplicateTransactionException. The
     * contract pins the present 409 behaviour. When #10 is fixed, this
     * interaction is updated to expect 200 with the original transaction
     * body, and provider verification re-runs against the new pact.
     */
    provider
      .given('alice has previously transferred with idempotency key idem-pact-dup')
      .uponReceiving('a retry of a transfer using an already-used idempotency key')
      .withRequest({
        method: 'POST',
        path: '/api/wallet/transfer',
        headers: { 'Authorization': regex(/^Bearer .+/, 'Bearer test.jwt.token'),
                   'Content-Type': 'application/json' },
        body: {
          recipientPhone: '+254700000002', amount: 5000, pin: '1234',
          idempotencyKey: 'idem-pact-dup',
        },
      })
      .willRespondWith({
        status: 409,
        headers: jsonHeaders,
        body: {
          success: false,
          message: like('Transaction with this idempotency key has already been processed'),
          timestamp: like('2026-05-08T09:00:00Z'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      try {
        await axios.post(
          `${mockServer.url}/api/wallet/transfer`,
          {
            recipientPhone: '+254700000002', amount: 5000, pin: '1234',
            idempotencyKey: 'idem-pact-dup',
          },
          { headers: bearerHeaders('test.jwt.token') },
        );
        throw new Error('expected 409');
      } catch (err: unknown) {
        const e = err as { response: { status: number } };
        expect(e.response.status).toBe(409);
      }
    });
  });

  it('POST /api/wallet/transfer — insufficient balance returns 400', async () => {
    provider
      .given('alice has balance 100 KES and bob is registered with phone +254700000002')
      .uponReceiving('a transfer larger than the sender balance')
      .withRequest({
        method: 'POST',
        path: '/api/wallet/transfer',
        headers: { 'Authorization': regex(/^Bearer .+/, 'Bearer test.jwt.token'),
                   'Content-Type': 'application/json' },
        body: {
          recipientPhone: '+254700000002', amount: 5000, pin: '1234',
          idempotencyKey: 'trf-pact-poor',
        },
      })
      .willRespondWith({
        status: 400,
        headers: jsonHeaders,
        body: {
          success: false,
          message: like('Insufficient balance. Available: KES 100.00, Required: KES 5050.00 (amount: 5000 + fee: 50.00)'),
          timestamp: like('2026-05-08T09:00:00Z'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      try {
        await axios.post(
          `${mockServer.url}/api/wallet/transfer`,
          {
            recipientPhone: '+254700000002', amount: 5000, pin: '1234',
            idempotencyKey: 'trf-pact-poor',
          },
          { headers: bearerHeaders('test.jwt.token') },
        );
        throw new Error('expected 400');
      } catch (err: unknown) {
        const e = err as { response: { status: number } };
        expect(e.response.status).toBe(400);
      }
    });
  });
});

// ───────────────────────────────────────────────────────────────────────
// HISTORY + REVERSAL
// ───────────────────────────────────────────────────────────────────────

describe('history and reversal contracts', () => {
  it('GET /api/wallet/transactions — paginated list of transactions', async () => {
    provider
      .given('alice has at least one historical transaction')
      .uponReceiving('a paginated transaction list request')
      .withRequest({
        method: 'GET',
        path: '/api/wallet/transactions',
        query: { page: '0', size: '20' },
        headers: { 'Authorization': regex(/^Bearer .+/, 'Bearer test.jwt.token') },
      })
      .willRespondWith({
        status: 200,
        headers: jsonHeaders,
        body: {
          success: true,
          data: {
            content: eachLike(transactionShape),
            totalElements: like(1),
            totalPages: like(1),
            number: like(0),
          },
          timestamp: like('2026-05-08T09:00:00Z'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const res = await axios.get(
        `${mockServer.url}/api/wallet/transactions?page=0&size=20`,
        { headers: bearerHeaders('test.jwt.token') },
      );
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.data.content)).toBe(true);
    });
  });

  it('GET /api/wallet/transactions — filtered by type', async () => {
    provider
      .given('alice has at least one DEPOSIT transaction')
      .uponReceiving('a transaction list filtered by type=DEPOSIT')
      .withRequest({
        method: 'GET',
        path: '/api/wallet/transactions',
        query: { page: '0', size: '20', type: 'DEPOSIT' },
        headers: { 'Authorization': regex(/^Bearer .+/, 'Bearer test.jwt.token') },
      })
      .willRespondWith({
        status: 200,
        headers: jsonHeaders,
        body: {
          success: true,
          data: {
            content: eachLike({ ...transactionShape, type: 'DEPOSIT' }),
            totalElements: like(1),
            totalPages: like(1),
            number: like(0),
          },
          timestamp: like('2026-05-08T09:00:00Z'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const res = await axios.get(
        `${mockServer.url}/api/wallet/transactions?page=0&size=20&type=DEPOSIT`,
        { headers: bearerHeaders('test.jwt.token') },
      );
      expect(res.status).toBe(200);
    });
  });

  it('GET /api/wallet/transactions/{ref} — lookup by reference', async () => {
    provider
      .given('alice has a deposit with reference DEP-pact-lookup')
      .uponReceiving('a transaction lookup by reference')
      .withRequest({
        method: 'GET',
        path: '/api/wallet/transactions/DEP-pact-lookup',
        headers: { 'Authorization': regex(/^Bearer .+/, 'Bearer test.jwt.token') },
      })
      .willRespondWith({
        status: 200,
        headers: jsonHeaders,
        body: {
          success: true,
          data: { ...transactionShape, reference: 'DEP-pact-lookup' },
          timestamp: like('2026-05-08T09:00:00Z'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const res = await axios.get(
        `${mockServer.url}/api/wallet/transactions/DEP-pact-lookup`,
        { headers: bearerHeaders('test.jwt.token') },
      );
      expect(res.status).toBe(200);
      expect(res.data.data.reference).toBe('DEP-pact-lookup');
    });
  });

  it('POST /api/wallet/transactions/{ref}/reverse — reverses a completed transaction', async () => {
    provider
      .given('alice has a completed deposit with reference DEP-pact-rev')
      .uponReceiving('a reversal of a completed deposit')
      .withRequest({
        method: 'POST',
        path: '/api/wallet/transactions/DEP-pact-rev/reverse',
        query: { reason: 'customer-request' },
        headers: { 'Authorization': regex(/^Bearer .+/, 'Bearer test.jwt.token') },
      })
      .willRespondWith({
        status: 200,
        headers: jsonHeaders,
        body: {
          success: true,
          message: like('Transaction reversed'),
          data: {
            reference: like('REV-DEP-pact-rev'),
            type: 'DEPOSIT',
            status: 'COMPLETED',
            amount: like(2000),
            createdAt: like('2026-05-08T09:00:00Z'),
          },
          timestamp: like('2026-05-08T09:00:00Z'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      const res = await axios.post(
        `${mockServer.url}/api/wallet/transactions/DEP-pact-rev/reverse?reason=customer-request`,
        null,
        { headers: bearerHeaders('test.jwt.token') },
      );
      expect(res.status).toBe(200);
      expect(res.data.data.reference).toMatch(/^REV-/);
    });
  });
});
