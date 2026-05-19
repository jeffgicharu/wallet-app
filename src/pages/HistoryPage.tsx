import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { walletApi } from '../api/wallet';
import { useAuth } from '../context/AuthContext';
import { formatSignedKES } from '../lib/money';
import { direction, isFeeRow, transactionLabel } from '../lib/transactions';
import { useIsDesktop } from '../lib/useMediaQuery';
import { TransactionIcon } from '../components/TransactionIcon';

export function HistoryPage() {
  const navigate = useNavigate();
  const { phone } = useAuth();
  const isDesktop = useIsDesktop();

  const { data, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () =>
      walletApi
        .getTransactions(0, 100)
        .then(r => r.data.data.content.filter(t => !isFeeRow(t))),
  });

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

  const rows = data || [];

  return (
    <div className="px-6 pt-6 lg:px-0 lg:pt-4">
      <h2 className="text-xl font-bold text-gray-900 mb-6 lg:text-2xl">Transaction History</h2>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : isDesktop ? (
        /* Desktop: a real table that uses the horizontal space. */
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(t => {
                const dir = direction(t, phone);
                const color = dir === 'out' ? 'text-red-600' : 'text-green-600';
                const bg = dir === 'out' ? 'bg-red-50' : 'bg-green-50';
                return (
                  <tr
                    key={t.reference}
                    onClick={() => navigate(`/history/${t.reference}`)}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') navigate(`/history/${t.reference}`); }}
                    className="cursor-pointer transition-colors hover:bg-gray-50 focus:outline-none focus-visible:bg-indigo-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">{fmtDate(t.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${color} ${bg}`}>
                          <TransactionIcon t={t} dir={dir} size={16} />
                        </span>
                        <span className="font-medium text-gray-900">{transactionLabel(t, phone)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{t.type}</td>
                    <td className="px-6 py-4">
                      <span className={t.status === 'COMPLETED' ? 'text-gray-500' : t.status === 'PENDING' ? 'text-amber-600' : 'text-red-600'}>
                        {t.status}
                      </span>
                    </td>
                    <td className={`whitespace-nowrap px-6 py-4 text-right font-semibold ${color}`}>
                      {formatSignedKES(t.amount, dir)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="py-16 text-center text-sm text-gray-400">No transactions yet</p>
          )}
        </div>
      ) : (
        /* Mobile: stacked card rows. */
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {rows.map(t => {
            const dir = direction(t, phone);
            const color = dir === 'out' ? 'text-red-500' : 'text-green-500';
            const bg = dir === 'out' ? 'bg-red-50' : 'bg-green-50';
            return (
              <button key={t.reference} onClick={() => navigate(`/history/${t.reference}`)}
                className="flex items-center gap-3 p-4 w-full text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} ${bg}`}>
                  <TransactionIcon t={t} dir={dir} />
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
          {rows.length === 0 && (
            <p className="text-center py-12 text-gray-400 text-sm">No transactions yet</p>
          )}
        </div>
      )}
    </div>
  );
}
