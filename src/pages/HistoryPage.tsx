import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { walletApi } from '../api/wallet';
import type { Transaction } from '../types';

export function HistoryPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => walletApi.getTransactions(0, 50).then(r => r.data.data.content),
  });

  const fmt = (n: number) => n.toLocaleString('en-KE', { minimumFractionDigits: 2 });
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

  const txnDisplay = (t: Transaction) => {
    const isOutgoing = t.type === 'WITHDRAWAL' || (t.type === 'TRANSFER' && t.receiverPhone);
    return {
      symbol: isOutgoing ? '-' : '+',
      color: isOutgoing ? 'text-red-500' : 'text-green-500',
      bg: isOutgoing ? 'bg-red-50' : 'bg-green-50',
    };
  };

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
            const d = txnDisplay(t);
            return (
              <button key={t.reference} onClick={() => navigate(`/history/${t.reference}`)}
                className="flex items-center gap-3 p-4 w-full text-left hover:bg-gray-50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${d.color} ${d.bg}`}>
                  {d.symbol}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.description || t.type}</p>
                  <p className="text-xs text-gray-400">{fmtDate(t.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${d.color}`}>{d.symbol}KES {fmt(t.amount)}</p>
                  <p className="text-xs text-gray-400">{t.status}</p>
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
