import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { walletApi } from '../api/wallet';
import { useAuth } from '../context/AuthContext';
import { Send, Download, Upload, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { Transaction } from '../types';

export function HomePage() {
  const navigate = useNavigate();
  const { fullName } = useAuth();
  const [showBalance, setShowBalance] = useState(true);

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.getWallet().then(r => r.data.data),
    refetchInterval: 30000,
  });

  const { data: txns } = useQuery({
    queryKey: ['recent-txns'],
    queryFn: () => walletApi.getTransactions(0, 5).then(r => r.data.data.content),
  });

  const fmt = (n: number) => n.toLocaleString('en-KE', { minimumFractionDigits: 2 });
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });

  const txnIcon = (t: Transaction) => {
    if (t.type === 'TRANSFER' && t.senderPhone) return { symbol: '-', color: 'text-red-500' };
    if (t.type === 'WITHDRAWAL') return { symbol: '-', color: 'text-red-500' };
    return { symbol: '+', color: 'text-green-500' };
  };

  return (
    <div>
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-b-3xl px-6 pt-10 pb-8 text-white">
        <p className="text-sm text-indigo-200">Hello, {fullName?.split(' ')[0] || 'there'}</p>
        <div className="flex items-center gap-3 mt-2">
          <div>
            <p className="text-xs text-indigo-300 mb-1">Available Balance</p>
            {isLoading ? (
              <div className="h-8 w-40 bg-indigo-500 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold">
                {showBalance ? `KES ${fmt(wallet?.balance || 0)}` : 'KES ****'}
              </p>
            )}
          </div>
          <button onClick={() => setShowBalance(!showBalance)} className="ml-auto p-2 rounded-full bg-indigo-500/30">
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {wallet && (
          <p className="text-xs text-indigo-300 mt-3">
            Daily limit: KES {fmt(wallet.dailyTransferLimit)} (used: KES {fmt(wallet.dailyTransferUsed)})
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 grid grid-cols-3 gap-4">
          {[
            { label: 'Send', icon: Send, path: '/send', color: 'bg-blue-100 text-blue-600' },
            { label: 'Deposit', icon: Download, path: '/deposit', color: 'bg-green-100 text-green-600' },
            { label: 'Withdraw', icon: Upload, path: '/withdraw', color: 'bg-orange-100 text-orange-600' },
          ].map(({ label, icon: Icon, path, color }) => (
            <button key={label} onClick={() => navigate(path)}
              className="flex flex-col items-center gap-2 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Recent Transactions</h3>
          <button onClick={() => navigate('/history')} className="text-xs text-indigo-600 font-medium">See All</button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {(txns || []).map(t => {
            const { symbol, color } = txnIcon(t);
            return (
              <button key={t.reference} onClick={() => navigate(`/history/${t.reference}`)}
                className="flex items-center gap-3 p-4 w-full text-left hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${color} bg-gray-50`}>
                  {symbol}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.description || t.type}</p>
                  <p className="text-xs text-gray-400">{fmtDate(t.createdAt)}</p>
                </div>
                <p className={`text-sm font-semibold ${color}`}>
                  {symbol}KES {fmt(t.amount)}
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
