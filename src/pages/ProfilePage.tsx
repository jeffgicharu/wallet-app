import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../api/wallet';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Wallet, LogOut } from 'lucide-react';
import { formatKES } from '../lib/money';

export function ProfilePage() {
  const { fullName, phone, logout } = useAuth();

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.getWallet().then(r => r.data.data),
  });

  const details = [
    { icon: Phone, label: 'Phone Number', value: wallet?.phoneNumber || phone },
    { icon: Wallet, label: 'Wallet Balance', value: wallet ? formatKES(wallet.balance) : 'Loading...' },
    { icon: Wallet, label: 'Daily Transfer Limit', value: wallet ? formatKES(wallet.dailyTransferLimit) : '-' },
  ];

  return (
    <div className="px-6 pt-6 lg:px-0 lg:pt-4">
      <h2 className="text-xl font-bold text-gray-900 mb-6 lg:text-2xl">Profile</h2>

      <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
        {/* Identity card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 lg:mb-0 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <User size={28} className="text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-gray-900 truncate">{fullName}</p>
              <p className="text-sm text-gray-500 truncate">{phone}</p>
            </div>
          </div>
          <button onClick={logout}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-2xl font-medium hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Account details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Account details</h3>
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
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
      </div>
    </div>
  );
}
