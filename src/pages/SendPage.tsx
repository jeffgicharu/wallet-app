import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../api/wallet';
import { PinPad } from '../components/PinPad';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type Step = 'phone' | 'amount' | 'confirm' | 'pin' | 'success';

export function SendPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');

  const mutation = useMutation({
    mutationFn: (pin: string) => walletApi.transfer(
      phone.startsWith('0') ? '+254' + phone.substring(1) : phone,
      parseFloat(amount), pin,
      'TRF-' + Date.now()
    ),
    onSuccess: (res) => {
      setReference(res.data.data.reference);
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['recent-txns'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Transfer failed');
      setStep('confirm');
    },
  });

  const fmt = (n: number) => n.toLocaleString('en-KE', { minimumFractionDigits: 2 });

  return (
    <div className="px-6 pt-6">
      {step !== 'success' && (
        <button onClick={() => step === 'phone' ? navigate('/') : setStep(step === 'amount' ? 'phone' : step === 'confirm' ? 'amount' : 'phone')}
          className="flex items-center gap-2 text-gray-500 text-sm mb-6">
          <ArrowLeft size={16} /> {step === 'phone' ? 'Home' : 'Back'}
        </button>
      )}

      <h2 className="text-xl font-bold text-gray-900 mb-6">Send Money</h2>

      {step === 'phone' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Phone Number</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="0712 345 678" autoFocus
            className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          <button onClick={() => phone.length >= 10 && setStep('amount')} disabled={phone.length < 10}
            className="w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-medium disabled:opacity-40">
            Next
          </button>
        </div>
      )}

      {step === 'amount' && (
        <div>
          <p className="text-sm text-gray-500 mb-4">To: {phone}</p>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0.00" autoFocus
            className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl text-2xl text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
          <button onClick={() => parseFloat(amount) >= 10 && setStep('confirm')} disabled={!amount || parseFloat(amount) < 10}
            className="w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-medium disabled:opacity-40">
            Next
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-center mb-6">Confirm Transfer</h3>
          <div className="space-y-4">
            <div className="flex justify-between"><span className="text-gray-500">To</span><span className="font-medium">{phone}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-medium">KES {fmt(parseFloat(amount))}</span></div>
            <hr />
            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="text-lg font-bold">KES {fmt(parseFloat(amount))}</span></div>
          </div>
          <button onClick={() => setStep('pin')} className="w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-medium">
            Enter PIN to Confirm
          </button>
        </div>
      )}

      {step === 'pin' && (
        <PinPad title="Enter M-Wallet PIN" onComplete={pin => mutation.mutate(pin)}
          onCancel={() => setStep('confirm')} loading={mutation.isPending} />
      )}

      {step === 'success' && (
        <div className="text-center pt-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful</h3>
          <p className="text-gray-500 mb-1">KES {fmt(parseFloat(amount))} sent to {phone}</p>
          <p className="text-xs text-gray-400 font-mono">{reference}</p>
          <button onClick={() => navigate('/')} className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-medium">
            Done
          </button>
        </div>
      )}
    </div>
  );
}
