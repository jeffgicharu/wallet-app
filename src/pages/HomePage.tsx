import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { walletApi } from '../api/wallet';
import { useAuth } from '../context/AuthContext';
import { Send, Download, Upload, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { formatKES, formatSignedKES } from '../lib/money';
import { direction, isFeeRow, transactionLabel } from '../lib/transactions';
import {
  todayNet,
  lastNDaysNet,
  monthlyTransactionCount,
  dailyLimitPercent,
} from '../lib/homeStats';
import { TransactionIcon } from '../components/TransactionIcon';

export function HomePage() {
  const navigate = useNavigate();
  const { fullName, phone } = useAuth();
  const [showBalance, setShowBalance] = useState(true);

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.getWallet().then(r => r.data.data),
    refetchInterval: 30000,
  });

  // Fetch a month-or-so of activity so the desktop stat tiles
  // (today / this week / this month) reflect a meaningful window.
  // FEE rows are folded out at the data layer; the recent list slices
  // the first 5 of what remains.
  const { data: txns } = useQuery({
    queryKey: ['recent-txns'],
    queryFn: () =>
      walletApi
        .getTransactions(0, 100)
        .then(r => r.data.data.content.filter(t => !isFeeRow(t))),
  });

  const myPhone = wallet?.phoneNumber ?? phone;
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });

  const actions = [
    { label: 'Send', icon: Send, path: '/send', color: 'bg-blue-100 text-blue-600' },
    { label: 'Deposit', icon: Download, path: '/deposit', color: 'bg-green-100 text-green-600' },
    { label: 'Withdraw', icon: Upload, path: '/withdraw', color: 'bg-orange-100 text-orange-600' },
  ];

  // Stat-tile values. Computed from the same list driving the recent
  // section so there is one source of truth and no extra API calls.
  const todayValue = txns ? todayNet(txns, myPhone) : 0;
  const weekValue = txns ? lastNDaysNet(txns, myPhone, 7) : 0;
  const monthCount = txns ? monthlyTransactionCount(txns) : 0;

  const recent = (txns || []).slice(0, 5);
  const limitPct = wallet ? dailyLimitPercent(wallet.dailyTransferUsed, wallet.dailyTransferLimit) : 0;

  return (
    <div>
      {/* Top: balance + quick actions. Stacked on mobile (gradient banner
          spans full width and the actions card overlaps it); a 3-column
          row on desktop. lg:items-start so neither card stretches to
          match the other — both take natural content height. */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
        {/* Balance card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-b-3xl lg:rounded-2xl px-6 pt-10 pb-7 lg:px-7 lg:pt-6 lg:pb-6 text-white">
          <p className="text-sm text-indigo-200">Hello, {fullName?.split(' ')[0] || 'there'}</p>
          <div className="flex items-end gap-3 mt-3">
            <div className="min-w-0">
              <p className="text-xs text-indigo-300 mb-1">Available Balance</p>
              {isLoading ? (
                <div className="h-8 w-40 bg-indigo-500 rounded animate-pulse" />
              ) : (
                <p className="text-3xl lg:text-4xl font-bold">
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
          {wallet && (
            <div className="mt-5">
              <div className="flex items-baseline justify-between text-xs text-indigo-200">
                <span>Daily transfer limit</span>
                <span className="font-medium text-white">
                  {formatKES(wallet.dailyTransferUsed)} / {formatKES(wallet.dailyTransferLimit)}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Daily transfer limit used"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(limitPct)}
                className="mt-2 h-1.5 rounded-full bg-indigo-500/40 overflow-hidden"
              >
                <div className="h-full bg-white transition-all" style={{ width: `${limitPct}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Quick actions card */}
        <div className="px-6 -mt-5 lg:mt-0 lg:px-0 lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-3 grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-1">
            {actions.map(({ label, icon: Icon, path, color }) => (
              <button key={label} onClick={() => navigate(path)}
                className="flex flex-col items-center gap-2 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                  <Icon size={18} />
                </div>
                <span className="text-xs font-medium text-gray-700 lg:text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat tiles — desktop only. Real numbers off the same list. */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4 lg:mt-6">
        <StatTile label="Today">
          <StatNet value={todayValue} emptyLabel="No activity today" />
        </StatTile>
        <StatTile label="This week (net)">
          <StatNet value={weekValue} emptyLabel="No activity this week" />
        </StatTile>
        <StatTile label="This month">
          <p className="text-2xl font-bold text-gray-900">
            {monthCount} <span className="text-sm font-normal text-gray-500">transactions</span>
          </p>
        </StatTile>
      </div>

      {/* Recent Transactions */}
      <div className="px-6 mt-6 lg:px-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 lg:text-base">Recent Transactions</h3>
          <button onClick={() => navigate('/history')} className="text-xs text-indigo-600 font-medium lg:text-sm">See All</button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {recent.map(t => {
            const dir = direction(t, myPhone);
            const color = dir === 'out' ? 'text-red-500' : 'text-green-500';
            return (
              <button key={t.reference} onClick={() => navigate(`/history/${t.reference}`)}
                className="flex items-center gap-3 p-4 lg:py-3 lg:px-5 w-full text-left hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} bg-gray-50`}>
                  <TransactionIcon t={t} dir={dir} />
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
          {recent.length === 0 && (
            <p className="text-center py-8 text-gray-400 text-sm">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Small local components for the desktop stat tiles ---

function StatTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/** Renders a signed KES amount with a coloured tone, or a quiet em-dash. */
function StatNet({ value, emptyLabel }: { value: number; emptyLabel: string }) {
  if (value === 0) {
    return <p className="text-sm text-gray-400">{emptyLabel}</p>;
  }
  const dir = value < 0 ? 'out' : 'in';
  const color = dir === 'out' ? 'text-red-600' : 'text-green-600';
  return (
    <p className={`text-2xl font-bold ${color}`}>
      {formatSignedKES(Math.abs(value), dir)}
    </p>
  );
}
