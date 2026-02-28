import { Link, Route, Routes } from 'react-router-dom';
import GamePage from './pages/GamePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-300 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <h1 className="text-lg font-semibold">Tower of Hanoi 1v1</h1>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link to="/" className="hover:text-indigo-600">Game</Link>
            <Link to="/admin" className="hover:text-indigo-600">Admin</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}
