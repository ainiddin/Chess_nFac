import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/Header';
import { HomePage } from '@/pages/HomePage';
import { GamePage } from '@/pages/GamePage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { ProPage } from '@/pages/ProPage';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/play" element={<GamePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/pro" element={<ProPage />} />
        </Routes>
      </main>
      <footer className="mt-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-widest"
             style={{ color: 'var(--muted)' }}>
          <span>chess sensei · learn to lose better</span>
          <span>禪 · built with chess.js, stockfish, and a sensei's patience</span>
        </div>
      </footer>
    </BrowserRouter>
  );
}
