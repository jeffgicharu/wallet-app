import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { walletApi } from '../api/wallet';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { formatKES, formatSignedKES } from '../lib/money';
import { direction } from '../lib/transactions';

export function TransactionDetailPage() {
  const { ref = '' } = useParams<{ ref: string }>();
  const navigate = useNavigate();
  const { phone } = useAuth();

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
    <div className="px-6 pt-6">
      <button
        onClick={() => navigate('/history')}
        className="flex items-center gap-2 text-gray-500 text-sm mb-6"
      >
        <ArrowLeft size={16} /> History
      </button>

      <h2 className="text-xl font-bold text-gray-900 mb-6">Transaction Detail</h2>

      {isLoading && (
        <div className="space-y-3" aria-busy="true">
          <div className="h-6 w-40 bg-gray-100 rounded animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-2xl text-sm">
          <AlertCircle size={18} />
          <span>
            We couldn't find that transaction. It may not exist or it isn't
            yours.
          </span>
        </div>
      )}

      {data && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
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
                <span className="font-medium">{data.senderPhone}</span>
              </div>
            )}
            {data.receiverPhone && (
              <div className="flex justify-between">
                <span className="text-gray-500">To</span>
                <span className="font-medium">{data.receiverPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium">{fmtDate(data.createdAt)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
