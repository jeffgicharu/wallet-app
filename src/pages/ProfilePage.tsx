import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../api/wallet';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Wallet, LogOut } from 'lucide-react';

export function ProfilePage() {
  const { fullName, phone, logout } = useAuth();

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.getWallet().then(r => r.data.data),
  });

  const fmt = (n: number) => `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

  return (
    <div className="px-6 pt-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Profile</h2>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <User size={28} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{fullName}</p>
            <p className="text-sm text-gray-500">{phone}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Phone size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Phone Number</p>
              <p className="text-sm font-medium">{wallet?.phoneNumber || phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Wallet size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Wallet Balance</p>
              <p className="text-sm font-medium">{wallet ? fmt(wallet.balance) : 'Loading...'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Wallet size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Daily Transfer Limit</p>
              <p className="text-sm font-medium">{wallet ? fmt(wallet.dailyTransferLimit) : '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <button onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3.5 border border-red-200 text-red-600 rounded-2xl font-medium hover:bg-red-50 transition-colors">
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}
