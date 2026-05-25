import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { walletApi } from '../api/wallet';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { formatKES, formatSignedKES } from '../lib/money';
import { direction } from '../lib/transactions';
import { counterpartyName } from '../lib/counterparty';
import { useIsDesktop } from '../lib/useMediaQuery';

export function TransactionDetailPage() {
  const { ref = '' } = useParams<{ ref: string }>();
  const navigate = useNavigate();
  const { phone } = useAuth();
  const isDesktop = useIsDesktop();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['transaction', ref],
    queryFn: () => walletApi.getTransaction(ref).then(r => r.data.data),
    enabled: ref.length > 0,
    retry: false,
  });

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="px-6 pt-6 lg:px-0 lg:pt-4">
      <button
        onClick={() => navigate('/history')}
        className="flex items-center gap-2 text-gray-500 text-sm mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
      >
        <ArrowLeft size={16} /> History
      </button>

      <h2 className="text-xl font-bold text-gray-900 mb-6 lg:text-2xl">Transaction Detail</h2>

      {isLoading && (
        <div className="space-y-3" aria-busy="true">
          <div className="h-6 w-40 bg-gray-100 rounded animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-2xl text-sm lg:max-w-xl">
          <AlertCircle size={18} />
          <span>
            We couldn't find that transaction. It may not exist or it isn't
            yours.
          </span>
        </div>
      )}

      {data && (
        <div className="lg:grid lg:grid-cols-[minmax(0,36rem)_20rem] lg:gap-8 lg:items-start">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-7">
            <div className="text-center mb-6">
              <p
                className={`text-3xl font-bold ${
                  direction(data, phone) === 'in' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatSignedKES(data.amount, direction(data, phone))}
              </p>
              <p className="mt-1 text-sm text-gray-500">{data.description}</p>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Reference</span>
                <span className="font-mono">{data.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium">{data.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium">{data.status}</span>
              </div>
              {data.fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Fee</span>
                  <span className="font-medium">{formatKES(data.fee)}</span>
                </div>
              )}
              {data.senderPhone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">From</span>
                  <span className="font-medium">
                    {counterpartyName(data.senderPhone)
                      ? `${counterpartyName(data.senderPhone)} · ${data.senderPhone}`
                      : data.senderPhone}
                  </span>
                </div>
              )}
              {data.receiverPhone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">To</span>
                  <span className="font-medium">
                    {counterpartyName(data.receiverPhone)
                      ? `${counterpartyName(data.receiverPhone)} · ${data.receiverPhone}`
                      : data.receiverPhone}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{fmtDate(data.createdAt)}</span>
              </div>
            </div>
          </div>

          {isDesktop && (
            <aside className="rounded-2xl border border-gray-100 bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-900">About this transaction</h3>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                {aboutSentence(data, phone)}
              </p>
              <dl className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Logged</dt>
                  <dd className="text-gray-700">{fmtDate(data.createdAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Reference</dt>
                  <dd className="font-mono text-gray-700">{data.reference}</dd>
                </div>
              </dl>
              <button
                onClick={() => navigate('/history')}
                className="mt-5 w-full rounded-2xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Back to history
              </button>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}

// A type/direction-aware summary line for the desktop about panel.
// Uses the counterparty resolver so a known number reads as a name.
function aboutSentence(
  t: import('../types').Transaction,
  myPhone: string | null,
): string {
  if (t.reference.startsWith('REV-')) {
    return 'This entry reverses a previous transaction. The amount has been credited back to the affected wallet.';
  }
  const status = t.status.toLowerCase();
  if (t.type === 'DEPOSIT') {
    return `This is a ${status} deposit credited to your wallet. Keep the reference for your records.`;
  }
  if (t.type === 'WITHDRAWAL') {
    return `This is a ${status} cash withdrawal from your wallet. Keep the reference for your records.`;
  }
  if (t.type === 'TRANSFER') {
    const dir = direction(t, myPhone);
    if (dir === 'out' && t.receiverPhone) {
      return `Transfer to ${counterpartyName(t.receiverPhone) ?? t.receiverPhone}. ${status === 'completed' ? 'The amount has been debited from your wallet.' : `Currently ${status}.`}`;
    }
    if (dir === 'in' && t.senderPhone) {
      return `Transfer received from ${counterpartyName(t.senderPhone) ?? t.senderPhone}. ${status === 'completed' ? 'The amount has been credited to your wallet.' : `Currently ${status}.`}`;
    }
  }
  return `This is a ${status} ${t.type.toLowerCase()}. Keep the reference for your records.`;
}
