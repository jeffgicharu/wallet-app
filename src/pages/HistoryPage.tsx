import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { walletApi } from '../api/wallet';
import { useAuth } from '../context/AuthContext';
import { formatSignedKES } from '../lib/money';
import { direction, isFeeRow, transactionLabel } from '../lib/transactions';

export function HistoryPage() {
  const navigate = useNavigate();
  const { phone } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () =>
      walletApi
        .getTransactions(0, 100)
        .then(r => r.data.data.content.filter(t => !isFeeRow(t))),
  });

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="px-6 pt-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Transaction History</h2>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {(data || []).map(t => {
            const dir = direction(t, phone);
            const color = dir === 'out' ? 'text-red-500' : 'text-green-500';
            const bg = dir === 'out' ? 'bg-red-50' : 'bg-green-50';
            return (
              <button key={t.reference} onClick={() => navigate(`/history/${t.reference}`)}
                className="flex items-center gap-3 p-4 w-full text-left hover:bg-gray-50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${color} ${bg}`}>
                  {dir === 'out' ? '-' : '+'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{transactionLabel(t, phone)}</p>
                  <p className="text-xs text-gray-400">{fmtDate(t.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${color}`}>{formatSignedKES(t.amount, dir)}</p>
                  {t.status !== 'COMPLETED' && (
                    <p className={`text-xs ${t.status === 'REVERSED' || t.status === 'FAILED' ? 'text-red-500' : 'text-gray-400'}`}>
                      {t.status}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
          {(!data || data.length === 0) && (
            <p className="text-center py-12 text-gray-400 text-sm">No transactions yet</p>
          )}
        </div>
      )}
    </div>
  );
}
