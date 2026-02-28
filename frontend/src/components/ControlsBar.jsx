import { memo } from 'react';

function ControlsBar({ paused, soundEnabled, darkMode, onRestart, onPauseToggle, onSoundToggle, onThemeToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onRestart} label="Restart" />
      <Button onClick={onPauseToggle} label={paused ? 'Resume' : 'Pause'} />
      <Button onClick={onSoundToggle} label={soundEnabled ? 'Sound: On' : 'Sound: Off'} />
      <Button onClick={onThemeToggle} label={darkMode ? 'Light Theme' : 'Dark Theme'} />
    </div>
  );
}

function Button({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
    >
      {label}
    </button>
  );
}

export default memo(ControlsBar);
