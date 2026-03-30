import { useState } from 'react';
import { Delete } from 'lucide-react';

interface PinPadProps {
  title: string;
  onComplete: (pin: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function PinPad({ title, onComplete, onCancel, loading }: PinPadProps) {
  const [pin, setPin] = useState('');

  const handlePress = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) {
        onComplete(next);
      }
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-8">
        <p className="text-center text-lg font-semibold text-gray-900 mb-2">{title}</p>

        <div className="flex justify-center gap-4 my-6">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full transition-colors ${i < pin.length ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Processing...</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {['1','2','3','4','5','6','7','8','9'].map(d => (
              <button key={d} onClick={() => handlePress(d)}
                className="h-14 rounded-xl bg-gray-50 text-xl font-semibold text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors">
                {d}
              </button>
            ))}
            <button onClick={onCancel} className="h-14 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50">Cancel</button>
            <button onClick={() => handlePress('0')}
              className="h-14 rounded-xl bg-gray-50 text-xl font-semibold text-gray-900 hover:bg-gray-100 active:bg-gray-200">0</button>
            <button onClick={handleDelete} className="h-14 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50">
              <Delete size={22} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
