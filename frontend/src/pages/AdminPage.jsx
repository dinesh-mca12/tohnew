import { useEffect, useMemo, useState } from 'react';
import { useSocket } from '../hooks/useSocket';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminPage() {
  const [adminUsername, setAdminUsername] = useState(() => sessionStorage.getItem('admin_username') || '');
  const [adminPassword, setAdminPassword] = useState(() => sessionStorage.getItem('admin_password') || '');
  const [authenticated, setAuthenticated] = useState(false);
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [diskCount, setDiskCount] = useState(4);
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [message, setMessage] = useState('');

  const handlers = useMemo(
    () => ({
      'admin:auth:ok': () => {
        setAuthenticated(true);
        setMessage('Admin login successful');
      },
      'admin:auth:error': ({ message: socketMessage }) => {
        setAuthenticated(false);
        setMessage(socketMessage || 'Invalid admin credentials');
      },
      'admin:matches': (list) => setMatches(list),
    }),
    []
  );

  const socket = useSocket(handlers);

  const getAuthHeaders = () => {
    const encoded = btoa(`${adminUsername}:${adminPassword}`);
    return {
      Authorization: `Basic ${encoded}`,
    };
  };

  const loadAll = async () => {
    const [mRes, lRes] = await Promise.all([
      fetch(`${apiUrl}/api/admin/matches/live`, {
        headers: getAuthHeaders(),
      }),
      fetch(`${apiUrl}/api/admin/leaderboard`, {
        headers: getAuthHeaders(),
      }),
    ]);

    if (mRes.status === 401 || lRes.status === 401) {
      setAuthenticated(false);
      setMessage('Admin auth failed. Please log in again.');
      return;
    }

    const [mData, lData] = await Promise.all([mRes.json(), lRes.json()]);
    setMatches(Array.isArray(mData) ? mData : []);
    setLeaderboard(Array.isArray(lData) ? lData : []);
  };

  useEffect(() => {
    if (!authenticated) {
      return;
    }
    loadAll();
  }, [authenticated]);

  const loginAdmin = (event) => {
    event.preventDefault();
    if (!adminUsername || !adminPassword) {
      setMessage('Username and password are required');
      return;
    }
    sessionStorage.setItem('admin_username', adminUsername);
    sessionStorage.setItem('admin_password', adminPassword);
    socket.emit('admin:auth', {
      username: adminUsername,
      password: adminPassword,
    });
  };

  const logoutAdmin = () => {
    sessionStorage.removeItem('admin_username');
    sessionStorage.removeItem('admin_password');
    setAuthenticated(false);
    setMessage('Logged out');
    setMatches([]);
    setLeaderboard([]);
  };

  const createMatch = async (event) => {
    event.preventDefault();
    const response = await fetch(`${apiUrl}/api/admin/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ player1: player1 || null, player2: player2 || null, diskCount: Number(diskCount) }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || 'Create failed');
      return;
    }
    setMessage(`Match created: ${data._id}`);
    loadAll();
  };

  const startAll = async () => {
    const response = await fetch(`${apiUrl}/api/admin/matches/start-all`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    setMessage(`Started ${data.started || 0} matches`);
    loadAll();
  };

  const resetTournament = async () => {
    await fetch(`${apiUrl}/api/admin/reset`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    setMessage('Tournament reset complete');
    loadAll();
  };

  const downloadLeaderboardCsv = async () => {
    const response = await fetch(`${apiUrl}/api/admin/leaderboard.csv`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      setMessage('Failed to download leaderboard CSV');
      return;
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'leaderboard.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  };

  if (!authenticated) {
    return (
      <section className="mx-auto max-w-md rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 text-lg font-semibold">Admin Login</h2>
        <form className="space-y-3" onSubmit={loginAdmin}>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            placeholder="Admin username"
            value={adminUsername}
            onChange={(e) => setAdminUsername(e.target.value)}
            required
          />
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            placeholder="Admin password"
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />
          <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Login</button>
        </form>
        {message && <p className="mt-3 text-sm text-rose-600">{message}</p>}
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm">Admin: {adminUsername}</p>
        <button onClick={logoutAdmin} className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-600">Logout</button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <form onSubmit={createMatch} className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-3 text-lg font-semibold">Create New Match</h2>
          <div className="space-y-2">
            <input
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              placeholder="Player 1 name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <input
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              placeholder="Player 2 name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <input
              type="number"
              min="3"
              max="8"
              value={diskCount}
              onChange={(e) => setDiskCount(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Create Match</button>
          </div>
        </form>

        <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-3 text-lg font-semibold">Tournament Controls</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={startAll} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500">Start All Matches</button>
            <button
              onClick={downloadLeaderboardCsv}
              className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500"
            >
              Download Leaderboard CSV
            </button>
            <button onClick={resetTournament} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500">Reset Tournament</button>
          </div>
          {message && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{message}</p>}
        </div>
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="mb-2 text-lg font-semibold">Live Matches</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500 dark:text-slate-300">
              <tr>
                <th className="py-2 pr-4">Match ID</th>
                <th className="py-2 pr-4">P1</th>
                <th className="py-2 pr-4">P2</th>
                <th className="py-2 pr-4">Disks</th>
                <th className="py-2 pr-4">Started</th>
                <th className="py-2 pr-4">Winner</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match._id || match.matchId} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="py-2 pr-4">{match._id || match.matchId}</td>
                  <td className="py-2 pr-4">{match.player1 || '-'}</td>
                  <td className="py-2 pr-4">{match.player2 || '-'}</td>
                  <td className="py-2 pr-4">{match.diskCount}</td>
                  <td className="py-2 pr-4">{match.started ? 'Yes' : 'No'}</td>
                  <td className="py-2 pr-4">{match.winner || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="mb-2 text-lg font-semibold">Leaderboard</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500 dark:text-slate-300">
              <tr>
                <th className="py-2 pr-4">Player</th>
                <th className="py-2 pr-4">Score</th>
                <th className="py-2 pr-4">Time(s)</th>
                <th className="py-2 pr-4">Moves</th>
                <th className="py-2 pr-4">Match ID</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry._id} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="py-2 pr-4">{entry.playerName}</td>
                  <td className="py-2 pr-4">{entry.score}</td>
                  <td className="py-2 pr-4">{entry.time}</td>
                  <td className="py-2 pr-4">{entry.moves}</td>
                  <td className="py-2 pr-4">{entry.matchId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
