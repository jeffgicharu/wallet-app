import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ArrowLeftRight, Clock, User, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// The desktop counterpart to BottomNav. Same destinations so the mental
// model is identical across viewports; the layout shell renders exactly
// one of the two depending on width. Kept deliberately small — it reuses
// the same lucide icons and active-route convention as the bottom bar.
const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/send', icon: ArrowLeftRight, label: 'Send' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { fullName, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Wallet size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">M-Wallet</p>
          <p className="truncate text-xs text-gray-500">
            {fullName || 'Signed in'}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
