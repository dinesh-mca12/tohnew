import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function WinnerModal({ winner, playerName, onClose }) {
  useEffect(() => {
    if (!winner) {
      return;
    }
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  }, [winner]);

  if (!winner) {
    return null;
  }

  const isYou = winner === playerName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 text-center shadow-xl dark:bg-slate-900">
        <h2 className="text-xl font-bold">{isYou ? 'You Win!' : 'Match Complete'}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Winner: {winner}</p>
        <button
          onClick={onClose}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  );
}
