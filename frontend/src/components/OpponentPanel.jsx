import { memo } from 'react';
import { formatTime } from '../utils/time';

function OpponentPanel({ opponent }) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-2 font-semibold">Opponent Live</h3>
      <div className="grid grid-cols-2 gap-2">
        <Item label="Moves" value={opponent.moves} />
        <Item label="Timer" value={formatTime(opponent.elapsedSeconds)} />
        <Item label="Completed" value={opponent.completed ? 'Yes' : 'No'} />
        <Item label="Status" value={opponent.connected ? 'Online' : 'Offline'} />
      </div>
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export default memo(OpponentPanel);
