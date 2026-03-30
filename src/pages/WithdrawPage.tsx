import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../api/wallet';
import { PinPad } from '../components/PinPad';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function WithdrawPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: (pin: string) => walletApi.withdraw(parseFloat(amount), pin, 'WDR-' + Date.now()),
    onSuccess: () => {
      setDone(true);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
      setShowPin(false);
    },
  });

  const fmt = (n: number) => n.toLocaleString('en-KE', { minimumFractionDigits: 2 });

  if (done) {
    return (
      <div className="px-6 pt-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Successful</h3>
        <p className="text-gray-500">KES {fmt(parseFloat(amount))} withdrawn</p>
        <button onClick={() => navigate('/')} className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-medium">Done</button>
      </div>
    );
  }

  return (
    <div className="px-6 pt-6">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 text-sm mb-6">
        <ArrowLeft size={16} /> Home
      </button>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Withdraw Money</h2>
      <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" autoFocus
        className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl text-2xl text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
      <button onClick={() => setShowPin(true)} disabled={!amount || parseFloat(amount) < 10}
        className="w-full mt-6 py-3.5 bg-orange-600 text-white rounded-2xl font-medium disabled:opacity-40">
        Withdraw
      </button>
      {showPin && <PinPad title="Enter PIN to withdraw" onComplete={pin => mutation.mutate(pin)}
        onCancel={() => setShowPin(false)} loading={mutation.isPending} />}
    </div>
  );
}
