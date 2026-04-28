import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const loc = useLocation();
  const onGame = loc.pathname.startsWith('/play');

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md border-b border-[var(--border)]"
            style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-baseline gap-3 group">
          <span className="text-xl font-serif italic tracking-tightest"
                style={{ color: 'var(--accent)' }}>
            禪
          </span>
          <span className="display text-lg leading-none">
            Chess <span className="italic">Sensei</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {!onGame && (
            <Link
              to="/play"
              className="hidden sm:inline-flex px-3 py-2 text-sm font-mono uppercase tracking-wider hover:text-[var(--accent)] transition"
            >
              Play
            </Link>
          )}
          <Link
            to="/leaderboard"
            className="px-3 py-2 text-sm font-mono uppercase tracking-wider hover:text-[var(--accent)] transition"
          >
            Ladder
          </Link>
          <Link
            to="/pro"
            className="hidden sm:inline-flex px-3 py-2 text-sm font-mono uppercase tracking-wider hover:text-[var(--accent)] transition"
          >
            Pro
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
