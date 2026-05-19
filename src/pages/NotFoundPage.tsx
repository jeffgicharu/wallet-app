import { useNavigate } from 'react-router-dom';
import { Wallet, Home } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-indigo-800 flex flex-col items-center justify-center p-6 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
        <Wallet className="text-white" size={28} />
      </div>
      <p className="text-5xl font-bold text-white">404</p>
      <h1 className="mt-3 text-xl font-semibold text-white">Page not found</h1>
      <p className="mt-2 max-w-xs text-sm text-indigo-200">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-2xl font-medium hover:bg-indigo-50 transition-colors"
      >
        <Home size={18} /> Back to Home
      </button>
    </div>
  );
}
