import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../api/wallet';
import { PinPad } from '../components/PinPad';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatKES } from '../lib/money';
import { newIdempotencyKey } from '../lib/idempotency';
import { useIsDesktop } from '../lib/useMediaQuery';
import { isFeeRow } from '../lib/transactions';
import { topOutgoingRecipients } from '../lib/homeStats';
import { counterpartyLabel } from '../lib/counterparty';

type Step = 'phone' | 'amount' | 'confirm' | 'pin' | 'success';

// wallet-api charges a 1% transfer fee (wallet.transfer-fee-percent in
// application.yml). Mirror the rate here so the confirm step can preview
// the fee before the user signs the PIN. If the backend rate changes,
// this is the one place to update on the client.
const TRANSFER_FEE_RATE = 0.01;
const round2 = (n: number) => Math.round(n * 100) / 100;

export function SendPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDesktop = useIsDesktop();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  // One key per confirmed intent: stable across PIN retries (a
  // lost-response retry replays the original transfer instead of
  // double-charging), regenerated when the user re-confirms a changed
  // amount/recipient. The backend prefixes it as TRF-{key}.
  const [idemKey, setIdemKey] = useState('');

  // Daily transfer limit is enforced server-side (wallet.daily-transfer-limit
   // in wallet-api). Read the current usage so we can show a "Remaining today"
   // hint and disable Continue if the entered amount + fee would exceed it.
  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.getWallet().then(r => r.data.data),
    staleTime: 15_000,
  });

  // Shared with the Home recent list — the cache hit means navigating
  // /send rarely costs an extra round-trip. Drives the "Recent
  // recipients" chips on the phone step.
  const { data: txns } = useQuery({
    queryKey: ['recent-txns'],
    queryFn: () =>
      walletApi
        .getTransactions(0, 100)
        .then(r => r.data.data.content.filter(t => !isFeeRow(t))),
    staleTime: 15_000,
  });

  const myPhone = wallet?.phoneNumber ?? null;
  const recentRecipients = txns ? topOutgoingRecipients(txns, myPhone, 3) : [];
  // The phone input expects the local "07.." format; convert when a
  // chip prefills from a stored +254 number.
  const toLocalPhoneFormat = (p: string) =>
    p.startsWith('+254') ? '0' + p.slice(4) : p;

  const mutation = useMutation({
    mutationFn: (pin: string) => walletApi.transfer(
      phone.startsWith('0') ? '+254' + phone.substring(1) : phone,
      parseFloat(amount), pin,
      idemKey
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

  const amountNum = parseFloat(amount);
  const liveFee = isNaN(amountNum) ? 0 : round2(amountNum * TRANSFER_FEE_RATE);
  const liveTotal = isNaN(amountNum) ? 0 : round2(amountNum + liveFee);
  const remaining = wallet
    ? round2(wallet.dailyTransferLimit - wallet.dailyTransferUsed)
    : undefined;

  const stepBody = (
    <>
      {step === 'phone' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Phone Number</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="0712 345 678" autoFocus
            className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          {recentRecipients.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Recent recipients</p>
              <div className="flex flex-wrap gap-2">
                {recentRecipients.map(r => (
                  <button
                    key={r.phone}
                    type="button"
                    onClick={() => setPhone(toLocalPhoneFormat(r.phone))}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    {counterpartyLabel(r.phone)}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => phone.length >= 10 && setStep('amount')} disabled={phone.length < 10}
            className="w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-medium disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            Next
          </button>
        </div>
      )}

      {step === 'amount' && (() => {
        const projectedFee = isNaN(amountNum) ? 0 : round2(amountNum * TRANSFER_FEE_RATE);
        const projectedDebit = isNaN(amountNum) ? 0 : round2(amountNum + projectedFee);
        const overLimit =
          remaining !== undefined && !isNaN(amountNum) && projectedDebit > remaining;
        const underMin = !amount || amountNum < 10;
        const disabled = underMin || overLimit;
        return (
          <div>
            <p className="text-sm text-gray-500 mb-4">To: {phone}</p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00" autoFocus
              className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl text-2xl text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
            {remaining !== undefined && (
              <p className="mt-2 text-xs text-gray-500">
                Remaining today: {formatKES(remaining)}{' '}
                <span className="text-gray-400">
                  (limit {formatKES(wallet!.dailyTransferLimit)}, used {formatKES(wallet!.dailyTransferUsed)})
                </span>
              </p>
            )}
            {overLimit && (
              <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle size={14} /> Amount + 1% fee would exceed today's transfer limit.
              </p>
            )}
            <button onClick={() => { if (!disabled) { setIdemKey(newIdempotencyKey()); setStep('confirm'); } }} disabled={disabled}
              className="w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-medium disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
              Next
            </button>
          </div>
        );
      })()}

      {step === 'confirm' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-center mb-6">Confirm Transfer</h3>
          <div className="space-y-4">
            <div className="flex justify-between"><span className="text-gray-500">To</span><span className="font-medium">{phone}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-medium">{formatKES(amountNum)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Fee (1%)</span><span className="font-medium">{formatKES(liveFee)}</span></div>
            <hr />
            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="text-lg font-bold">{formatKES(liveTotal)}</span></div>
          </div>
          <button onClick={() => setStep('pin')} className="w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            Enter PIN to Confirm
          </button>
        </div>
      )}

      {step === 'pin' && (
        <PinPad title="Enter M-Wallet PIN" onComplete={pin => mutation.mutate(pin)}
          onCancel={() => setStep('confirm')} loading={mutation.isPending} />
      )}
    </>
  );

  return (
    <div className="px-6 pt-6 lg:px-0 lg:pt-4">
      {step !== 'success' && (
        <button onClick={() => step === 'phone' ? navigate('/') : setStep(step === 'amount' ? 'phone' : step === 'confirm' ? 'amount' : 'phone')}
          className="flex items-center gap-2 text-gray-500 text-sm mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
          <ArrowLeft size={16} /> {step === 'phone' ? 'Home' : 'Back'}
        </button>
      )}

      <h2 className="text-xl font-bold text-gray-900 mb-6 lg:text-2xl">Send Money</h2>

      {step === 'success' ? (
        <div className="text-center pt-10 lg:pt-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful</h3>
          <p className="text-gray-500 mb-1">{formatKES(parseFloat(amount))} sent to {phone}</p>
          <p className="text-xs text-gray-400 font-mono">{reference}</p>
          <button onClick={() => navigate('/')} className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            Done
          </button>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-[minmax(0,32rem)_20rem] lg:gap-8 lg:items-start">
          <div className="lg:rounded-2xl lg:border lg:border-gray-100 lg:bg-white lg:p-6">
            {stepBody}
          </div>
          {isDesktop && (
            <aside className="rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-900">Transfer summary</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Recipient</dt>
                  <dd className="font-medium text-gray-900">{phone || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Amount</dt>
                  <dd className="font-medium text-gray-900">{amount ? formatKES(amountNum) : '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Fee (1%)</dt>
                  <dd className="font-medium text-gray-900">{amount ? formatKES(liveFee) : '—'}</dd>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3">
                  <dt className="text-gray-500">Total</dt>
                  <dd className="font-bold text-gray-900">{amount ? formatKES(liveTotal) : '—'}</dd>
                </div>
                {remaining !== undefined && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Remaining today</dt>
                    <dd className="font-medium text-gray-900">{formatKES(remaining)}</dd>
                  </div>
                )}
              </dl>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
