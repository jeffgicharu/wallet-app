import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../api/wallet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function DepositPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: () => walletApi.deposit(parseFloat(amount), 'DEP-' + Date.now()),
    onSuccess: () => {
      setDone(true);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Deposit failed'),
  });

  const fmt = (n: number) => n.toLocaleString('en-KE', { minimumFractionDigits: 2 });

  if (done) {
    return (
      <div className="px-6 pt-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Deposit Successful</h3>
        <p className="text-gray-500">KES {fmt(parseFloat(amount))} deposited</p>
        <button onClick={() => navigate('/')} className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-medium">Done</button>
      </div>
    );
  }

  return (
    <div className="px-6 pt-6">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 text-sm mb-6">
        <ArrowLeft size={16} /> Home
      </button>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Deposit Money</h2>
      <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" autoFocus
        className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl text-2xl text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
      <div className="flex gap-2 mt-4">
        {[500, 1000, 5000, 10000].map(v => (
          <button key={v} onClick={() => setAmount(String(v))}
            className="flex-1 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200">{v.toLocaleString()}</button>
        ))}
      </div>
      <button onClick={() => mutation.mutate()} disabled={!amount || parseFloat(amount) < 1 || mutation.isPending}
        className="w-full mt-6 py-3.5 bg-green-600 text-white rounded-2xl font-medium disabled:opacity-40">
        {mutation.isPending ? 'Processing...' : 'Deposit'}
      </button>
    </div>
  );
}
