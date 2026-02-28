import { useEffect, useMemo, useState } from 'react';
import ControlsBar from '../components/ControlsBar';
import OpponentPanel from '../components/OpponentPanel';
import StatsPanel from '../components/StatsPanel';
import TowerBoard from '../components/TowerBoard';
import WinnerModal from '../components/WinnerModal';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/useGameStore';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function GamePage() {
  const [nameInput, setNameInput] = useState('');
  const [matchInput, setMatchInput] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(null);

  const {
    matchId,
    playerName,
    side,
    towers,
    moveCount,
    minimumMoves,
    elapsedSeconds,
    score,
    accuracy,
    completed,
    started,
    paused,
    soundEnabled,
    darkMode,
    opponent,
    winner,
    setSession,
    setStarted,
    tick,
    applyMove,
    togglePause,
    toggleSound,
    toggleTheme,
    setOpponentFromStats,
    setPresence,
    setWinner,
    restartBoard,
  } = useGameStore();

  const handlers = useMemo(
    () => ({
      'match:error': ({ message }) => setError(message),
      'match:state': (payload) => {
        setSession({
          matchId: payload.matchId,
          playerName: payload.playerName,
          side: payload.side,
          diskCount: payload.diskCount,
        });
        setOpponentFromStats(payload.stats, payload.side);
      },
      'match:started': ({ startAt }) => {
        const delaySeconds = Math.max(0, Math.ceil((startAt - Date.now()) / 1000));
        setCountdown(delaySeconds);
      },
      'match:stats': ({ stats }) => {
        setOpponentFromStats(stats, side || useGameStore.getState().side);
      },
      'match:winner': ({ winner: serverWinner }) => {
        setWinner(serverWinner);
      },
      'match:presence': (presence) => {
        setPresence(presence);
      },
    }),
    [setOpponentFromStats, setPresence, setSession, setWinner, side]
  );

  const socket = useSocket(handlers);

  useEffect(() => {
    const timer = setInterval(() => tick(), 1000);
    return () => clearInterval(timer);
  }, [tick]);

  useEffect(() => {
    if (countdown === null) {
      return undefined;
    }
    if (countdown <= 0) {
      setStarted();
      setCountdown(null);
      return undefined;
    }
    const timer = setTimeout(() => setCountdown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, setStarted]);

  const handleJoin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const trimmedName = nameInput.trim();
      const trimmedMatchId = matchInput.trim();
      if (!trimmedName || !trimmedMatchId) {
        setError('Please enter both player name and match ID.');
        return;
      }

      const response = await fetch(`${apiUrl}/api/matches/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: trimmedMatchId, playerName: trimmedName }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Unable to join.');
      }
      socket.emit('match:join', {
        matchId: data.matchId,
        playerName: trimmedName,
      });
    } catch (err) {
      setError(err?.message || 'Unable to join match.');
    }
  };

  const handleMove = (from, to) => {
    const result = applyMove(from, to);
    if (result.ok) {
      socket.emit('match:progress', {
        matchId,
        moves: result.moveCount,
        elapsedSeconds: result.elapsedSeconds,
        isCompleted: result.completed,
      });
      return true;
    }
    return false;
  };

  const handleRestart = () => {
    restartBoard();
    if (started) {
      setStarted();
    }
  };

  const triggerStart = () => {
    if (!matchId) {
      return;
    }
    socket.emit('match:start', { matchId });
  };

  if (!side) {
    return (
      <section className="mx-auto max-w-md rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 text-lg font-semibold">Join Match</h2>
        <form className="space-y-3" onSubmit={handleJoin}>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            placeholder="Your name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            required
          />
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            placeholder="Match ID"
            value={matchInput}
            onChange={(e) => setMatchInput(e.target.value)}
            required
          />
          <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Join</button>
        </form>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <div>
          <p className="text-sm font-medium">Player: {playerName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Match: {matchId}</p>
        </div>
        <button
          onClick={triggerStart}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Sync Start
        </button>
      </div>

      {countdown !== null && (
        <div className="rounded-lg bg-indigo-600 p-2 text-center text-lg font-bold text-white">
          Starting in {countdown}
        </div>
      )}

      <StatsPanel
        elapsedSeconds={elapsedSeconds}
        moveCount={moveCount}
        minimumMoves={minimumMoves}
        score={score}
        accuracy={accuracy}
        completed={completed}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <TowerBoard towers={towers} onMove={handleMove} soundEnabled={soundEnabled} />
        </div>
        <OpponentPanel opponent={opponent} />
      </div>

      <ControlsBar
        paused={paused}
        soundEnabled={soundEnabled}
        darkMode={darkMode}
        onRestart={handleRestart}
        onPauseToggle={togglePause}
        onSoundToggle={toggleSound}
        onThemeToggle={toggleTheme}
      />

      <WinnerModal winner={winner} playerName={playerName} onClose={() => setWinner(null)} />
    </section>
  );
}
