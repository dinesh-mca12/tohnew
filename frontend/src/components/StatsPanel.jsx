import { memo } from 'react';
import { formatTime } from '../utils/time';

function StatsPanel({ elapsedSeconds, moveCount, minimumMoves, score, accuracy, completed }) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-3 lg:grid-cols-6">
      <Stat label="Timer" value={formatTime(elapsedSeconds)} />
      <Stat label="Moves" value={moveCount} />
      <Stat label="Min Moves" value={minimumMoves} />
      <Stat label="Score" value={score.toFixed(2)} />
      <Stat label="Accuracy" value={`${accuracy.toFixed(2)}%`} />
      <Stat label="Completed" value={completed ? 'Yes' : 'No'} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-100 p-2 text-center dark:bg-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

export default memo(StatsPanel);
