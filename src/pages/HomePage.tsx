import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { walletApi } from '../api/wallet';
import { useAuth } from '../context/AuthContext';
import { Send, Download, Upload, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { formatKES, formatSignedKES } from '../lib/money';
import { direction, isFeeRow, transactionLabel } from '../lib/transactions';

export function HomePage() {
  const navigate = useNavigate();
  const { fullName, phone } = useAuth();
  const [showBalance, setShowBalance] = useState(true);

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.getWallet().then(r => r.data.data),
    refetchInterval: 30000,
  });

  // Fetch a few extra so that, after folding out standalone FEE rows,
  // there are still up to 5 real transactions to show.
  const { data: txns } = useQuery({
    queryKey: ['recent-txns'],
    queryFn: () =>
      walletApi.getTransactions(0, 10).then(r =>
        r.data.data.content.filter(t => !isFeeRow(t)).slice(0, 5),
      ),
  });

  const myPhone = wallet?.phoneNumber ?? phone;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });

  const actions = [
    { label: 'Send', icon: Send, path: '/send', color: 'bg-blue-100 text-blue-600' },
    { label: 'Deposit', icon: Download, path: '/deposit', color: 'bg-green-100 text-green-600' },
    { label: 'Withdraw', icon: Upload, path: '/withdraw', color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div>
      {/* Top: balance + quick actions. Stacked on mobile (the gradient
          banner spans full width and the actions card overlaps it);
          a 3-column row on desktop so the horizontal space is used. */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Balance Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-b-3xl lg:rounded-2xl px-6 pt-10 pb-8 lg:p-8 text-white lg:flex lg:flex-col lg:justify-between lg:min-h-[15rem]">
          <div>
            <p className="text-sm text-indigo-200">Hello, {fullName?.split(' ')[0] || 'there'}</p>
            <div className="flex items-center gap-3 mt-2 lg:mt-4">
              <div>
                <p className="text-xs text-indigo-300 mb-1">Available Balance</p>
                {isLoading ? (
                  <div className="h-8 w-40 bg-indigo-500 rounded animate-pulse" />
                ) : (
                  <p className="text-3xl lg:text-5xl font-bold">
                    {showBalance ? formatKES(wallet?.balance) : 'KES ****'}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                className="ml-auto p-2 rounded-full bg-indigo-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {wallet && (
            <p className="text-xs text-indigo-300 mt-3 lg:mt-0 lg:text-sm">
              Daily limit: {formatKES(wallet.dailyTransferLimit)} (used: {formatKES(wallet.dailyTransferUsed)})
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-6 -mt-5 lg:mt-0 lg:px-0 lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 grid grid-cols-3 gap-4 lg:grid-cols-1 lg:gap-2 lg:h-full lg:content-center">
            {actions.map(({ label, icon: Icon, path, color }) => (
              <button key={label} onClick={() => navigate(path)}
                className="flex flex-col items-center gap-2 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:flex-row lg:justify-start lg:gap-4 lg:px-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-medium text-gray-700 lg:text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6 mt-6 lg:px-0 lg:mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 lg:text-base">Recent Transactions</h3>
          <button onClick={() => navigate('/history')} className="text-xs text-indigo-600 font-medium lg:text-sm">See All</button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {(txns || []).map(t => {
            const dir = direction(t, myPhone);
            const color = dir === 'out' ? 'text-red-500' : 'text-green-500';
            return (
              <button key={t.reference} onClick={() => navigate(`/history/${t.reference}`)}
                className="flex items-center gap-3 p-4 lg:px-6 w-full text-left hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${color} bg-gray-50`}>
                  {dir === 'out' ? '-' : '+'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{transactionLabel(t, myPhone)}</p>
                  <p className="text-xs text-gray-400">{fmtDate(t.createdAt)}</p>
                </div>
                <p className={`text-sm font-semibold ${color}`}>
                  {formatSignedKES(t.amount, dir)}
                </p>
              </button>
            );
          })}
          {(!txns || txns.length === 0) && (
            <p className="text-center py-8 text-gray-400 text-sm">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
