import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../api/wallet';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Wallet, LogOut, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatKES } from '../lib/money';
import { isFeeRow } from '../lib/transactions';
import {
  lastNDaysNet,
  monthlyTransactionCount,
} from '../lib/homeStats';

export function ProfilePage() {
  const { fullName, phone, logout } = useAuth();

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.getWallet().then(r => r.data.data),
  });

  // Same cache key as Home + History so this is a free hit when the
  // user reaches Profile from elsewhere.
  const { data: txns } = useQuery({
    queryKey: ['recent-txns'],
    queryFn: () =>
      walletApi
        .getTransactions(0, 100)
        .then(r => r.data.data.content.filter(t => !isFeeRow(t))),
    staleTime: 15_000,
  });

  const details = [
    { icon: Phone, label: 'Phone Number', value: wallet?.phoneNumber || phone },
    { icon: Wallet, label: 'Wallet Balance', value: wallet ? formatKES(wallet.balance) : 'Loading...' },
    { icon: Wallet, label: 'Daily Transfer Limit', value: wallet ? formatKES(wallet.dailyTransferLimit) : '-' },
  ];

  const monthCount = txns ? monthlyTransactionCount(txns) : 0;
  // Split the last 30 days into incoming and outgoing for an at-a-glance
  // sense of activity. Reversal pairs cancel naturally.
  const last30In = txns
    ? txns
        .filter(t => t.receiverPhone === (wallet?.phoneNumber || phone))
        .filter(t => {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 30);
          cutoff.setHours(0, 0, 0, 0);
          return new Date(t.createdAt) >= cutoff;
        })
        .reduce((acc, t) => acc + t.amount, 0)
    : 0;
  const last30Out = txns
    ? txns
        .filter(t => t.senderPhone === (wallet?.phoneNumber || phone))
        .filter(t => {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 30);
          cutoff.setHours(0, 0, 0, 0);
          return new Date(t.createdAt) >= cutoff;
        })
        .reduce((acc, t) => acc + t.amount, 0)
    : 0;
  const monthNet = txns ? lastNDaysNet(txns, wallet?.phoneNumber || phone, 30) : 0;

  return (
    <div className="px-6 pt-6 lg:px-0 lg:pt-4">
      <h2 className="text-xl font-bold text-gray-900 mb-6 lg:text-2xl">Profile</h2>

      <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
        {/* Identity card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 lg:mb-0 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
              <User size={26} className="text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-gray-900 truncate">{fullName}</p>
              <p className="text-sm text-gray-500 truncate">{phone}</p>
            </div>
          </div>
          <button onClick={logout}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 rounded-2xl font-medium hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Account details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 lg:mb-0 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Account details</h3>
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Icon size={18} className="text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-medium truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity summary — fills the right column under the identity
            card on desktop, sits below the details on mobile. */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:col-span-3">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Activity (last 30 days)</h3>
            <p className="text-xs text-gray-400">{monthCount} {monthCount === 1 ? 'transaction' : 'transactions'} this month</p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
            <ActivityStat
              icon={ArrowDownLeft}
              tone="green"
              label="In"
              value={formatKES(last30In)}
            />
            <ActivityStat
              icon={ArrowUpRight}
              tone="red"
              label="Out"
              value={formatKES(last30Out)}
            />
            <ActivityStat
              icon={TrendingUp}
              tone={monthNet >= 0 ? 'green' : 'red'}
              label="Net"
              value={`${monthNet >= 0 ? '+' : '-'} ${formatKES(Math.abs(monthNet))}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type Tone = 'green' | 'red';
type IconCmp = React.ComponentType<{ size?: number; className?: string }>;

function ActivityStat({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: IconCmp;
  tone: Tone;
  label: string;
  value: string;
}) {
  const iconColor = tone === 'green' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  const valueColor = tone === 'green' ? 'text-green-600' : 'text-red-600';
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${iconColor}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm font-semibold truncate ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}
