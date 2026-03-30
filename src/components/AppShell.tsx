import { Outlet, Navigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useAuth } from '../context/AuthContext';

export function AppShell() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto pb-20">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
