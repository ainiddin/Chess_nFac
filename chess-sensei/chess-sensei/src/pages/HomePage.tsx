import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SENSEIS } from '@/lib/senseis';
import type { Difficulty } from '@/lib/stockfish';
import { DIFFICULTY } from '@/lib/stockfish';
import { SenseiCard } from '@/components/SenseiCard';

export function HomePage() {
  const nav = useNavigate();
  const [selectedSensei, setSelectedSensei] = useState<string>(SENSEIS[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>('apprentice');
  const [color, setColor] = useState<'white' | 'black'>('white');

  const start = () => {
    const params = new URLSearchParams({
      sensei: selectedSensei,
      difficulty,
      color,
    });
    nav(`/play?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:py-20">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16 lg:mb-24 max-w-3xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="rule flex-1" />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            chess · with consequences
          </span>
        </div>

        <h1 className="display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] mb-6">
          Lose to a <span className="vermillion-stamp italic">stranger.</span>
          <br />
          Get told <span className="italic">why.</span>
        </h1>

        <p className="text-lg sm:text-xl font-serif italic max-w-2xl leading-relaxed"
           style={{ color: 'var(--muted)' }}>
          Most chess sites let you play. Few teach you anything. Pick a sensei,
          play a game, and walk away with the one critique that actually matters.
        </p>
      </motion.div>

      {/* Step 1: Choose sensei */}
      <section className="mb-16">
        <div className="flex items-baseline gap-4 mb-6">
          <span className="vermillion-stamp font-serif text-2xl">壹</span>
          <h2 className="display text-2xl">Choose your sensei</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SENSEIS.map((s, i) => (
            <SenseiCard
              key={s.id}
              sensei={s}
              selected={selectedSensei === s.id}
              onSelect={() => !s.locked && setSelectedSensei(s.id)}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Step 2: Configure */}
      <section className="mb-16 grid lg:grid-cols-2 gap-12">
        <div>
          <div className="flex items-baseline gap-4 mb-6">
            <span className="vermillion-stamp font-serif text-2xl">貳</span>
            <h2 className="display text-2xl">Set the level</h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(DIFFICULTY) as Difficulty[]).map((d) => {
              const cfg = DIFFICULTY[d];
              const active = difficulty === d;
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="text-left p-4 transition-all"
                  style={{
                    border: '1px solid',
                    borderColor: active ? 'var(--accent)' : 'var(--border)',
                    background: active ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--surface)',
                    borderRadius: '2px',
                  }}
                >
                  <div className="display text-xl">{cfg.label}</div>
                  <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                    ≈ {cfg.approxElo} elo
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-4 mb-6">
            <span className="vermillion-stamp font-serif text-2xl">參</span>
            <h2 className="display text-2xl">Pick your side</h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(['white', 'black'] as const).map((c) => {
              const active = color === c;
              return (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="text-left p-4 transition-all"
                  style={{
                    border: '1px solid',
                    borderColor: active ? 'var(--accent)' : 'var(--border)',
                    background: active ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--surface)',
                    borderRadius: '2px',
                  }}
                >
                  <div className="display text-xl capitalize">{c}</div>
                  <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                    {c === 'white' ? 'You move first' : 'Sensei moves first'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-6 border-t border-[var(--border)]">
        <button onClick={start} className="btn-primary text-base px-8 py-4">
          Begin the game →
        </button>
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          No signup required to play. Sign up only to climb the Ladder.
        </span>
      </div>
    </div>
  );
}
