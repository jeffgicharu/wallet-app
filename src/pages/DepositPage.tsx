import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../api/wallet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatKES } from '../lib/money';
import { newIdempotencyKey } from '../lib/idempotency';
import { useIsDesktop } from '../lib/useMediaQuery';

export function DepositPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDesktop = useIsDesktop();
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState(false);
  // Stable for this deposit attempt so a retry replays rather than
  // double-credits; the backend prefixes it as DEP-{key}.
  const [idemKey] = useState(newIdempotencyKey);

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.getWallet().then(r => r.data.data),
    staleTime: 15_000,
  });

  const mutation = useMutation({
    mutationFn: () => walletApi.deposit(parseFloat(amount), idemKey),
    onSuccess: () => {
      setDone(true);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Deposit failed'),
  });

  if (done) {
    return (
      <div className="px-6 pt-16 text-center lg:pt-24">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Deposit Successful</h3>
        <p className="text-gray-500">{formatKES(parseFloat(amount))} deposited</p>
        <button onClick={() => navigate('/')} className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-medium">Done</button>
      </div>
    );
  }

  const form = (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" autoFocus
        className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl text-2xl text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
      <div className="flex gap-2 mt-4">
        {[500, 1000, 5000, 10000].map(v => (
          <button key={v} onClick={() => setAmount(String(v))}
            className="flex-1 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">{v.toLocaleString()}</button>
        ))}
      </div>
      <button onClick={() => mutation.mutate()} disabled={!amount || parseFloat(amount) < 1 || mutation.isPending}
        className="w-full mt-6 py-3.5 bg-green-600 text-white rounded-2xl font-medium disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
        {mutation.isPending ? 'Processing...' : 'Deposit'}
      </button>
    </div>
  );

  return (
    <div className="px-6 pt-6 lg:px-0 lg:pt-4">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 text-sm mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
        <ArrowLeft size={16} /> Home
      </button>
      <h2 className="text-xl font-bold text-gray-900 mb-6 lg:text-2xl">Deposit Money</h2>
      <div className="lg:grid lg:grid-cols-[minmax(0,32rem)_20rem] lg:gap-8 lg:items-start">
        <div className="lg:rounded-2xl lg:border lg:border-gray-100 lg:bg-white lg:p-6">
          {form}
        </div>
        {isDesktop && (
          <aside className="rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Current balance</dt>
                <dd className="font-medium text-gray-900">{wallet ? formatKES(wallet.balance) : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">After this deposit</dt>
                <dd className="font-medium text-gray-900">
                  {wallet && amount && parseFloat(amount) > 0
                    ? formatKES(wallet.balance + parseFloat(amount))
                    : '—'}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-gray-400">
              Deposits are credited instantly. No fee is charged on deposits.
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}
