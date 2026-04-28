import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, supabaseEnabled, type Profile } from '@/lib/supabase';

export function LeaderboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState<string>('all');

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('elo', { ascending: false })
        .limit(100);
      setProfiles(data ?? []);
      setLoading(false);
    })();
  }, []);

  const cities = useMemo(() => {
    const set = new Set<string>();
    profiles.forEach((p) => {
      if (p.city) set.add(p.city);
    });
    return Array.from(set).sort();
  }, [profiles]);

  const filtered = useMemo(() => {
    if (cityFilter === 'all') return profiles;
    return profiles.filter((p) => p.city === cityFilter);
  }, [profiles, cityFilter]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="rule flex-1" />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            the ladder
          </span>
        </div>

        <h1 className="display text-5xl sm:text-7xl leading-[0.95] mb-4">
          Top <span className="vermillion-stamp italic">100</span>.
          <br />
          By city, if you like.
        </h1>

        <p className="text-base font-serif italic max-w-2xl" style={{ color: 'var(--muted)' }}>
          Climbing requires a name and a city. Your ELO moves up or down based on the level
          of sensei you defeat — beating Master at Master level matters more.
        </p>
      </motion.div>

      {!supabaseEnabled && (
        <div className="card p-6 mb-8 text-sm" style={{ borderColor: 'var(--accent)' }}>
          <div className="vermillion-stamp font-mono uppercase tracking-widest text-xs mb-2">
            Demo mode
          </div>
          The Ladder requires Supabase to be configured. Add{' '}
          <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
          <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to your environment to enable it.
        </div>
      )}

      {/* City filter */}
      {cities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setCityFilter('all')}
            className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition"
            style={{
              border: '1px solid',
              borderColor: cityFilter === 'all' ? 'var(--accent)' : 'var(--border)',
              color: cityFilter === 'all' ? 'var(--accent)' : 'var(--fg)',
              borderRadius: '999px',
            }}
          >
            All cities
          </button>
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition"
              style={{
                border: '1px solid',
                borderColor: cityFilter === c ? 'var(--accent)' : 'var(--border)',
                color: cityFilter === c ? 'var(--accent)' : 'var(--fg)',
                borderRadius: '999px',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="card p-12 text-center text-sm font-serif italic" style={{ color: 'var(--muted)' }}>
          Reading the scrolls…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-sm font-serif italic" style={{ color: 'var(--muted)' }}>
          The Ladder is empty. Be the first to claim a rung.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-mono uppercase tracking-widest"
                  style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">City</th>
                <th className="px-4 py-3 text-right">Elo</th>
                <th className="px-4 py-3 text-right hidden md:table-cell">W / L / D</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <td className="px-4 py-3 font-mono text-xs"
                      style={{ color: i < 3 ? 'var(--accent)' : 'var(--muted)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td className="px-4 py-3 font-serif text-base">{p.username}</td>
                  <td className="px-4 py-3 text-xs font-mono uppercase tracking-wider hidden sm:table-cell"
                      style={{ color: 'var(--muted)' }}>
                    {p.city ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{p.elo}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs hidden md:table-cell"
                      style={{ color: 'var(--muted)' }}>
                    {p.wins}/{p.losses}/{p.draws}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
