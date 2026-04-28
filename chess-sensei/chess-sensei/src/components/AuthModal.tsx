import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (username: string, city: string) => void;
}

export function AuthModal({ open, onClose, onSuccess }: Props) {
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!username.trim() || username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!supabase) {
      // Local-only mode
      onSuccess(username.trim(), city.trim() || 'Unknown');
      return;
    }
    setLoading(true);
    try {
      // Sign in anonymously, then create profile.
      const { data: authData, error: authErr } = await supabase.auth.signInAnonymously();
      if (authErr) throw authErr;
      const userId = authData.user?.id;
      if (!userId) throw new Error('No user id returned.');

      const { error: profileErr } = await supabase.from('profiles').insert({
        id: userId,
        username: username.trim(),
        city: city.trim() || null,
        elo: 1200,
        games_played: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      });
      if (profileErr && profileErr.code !== '23505') {
        // 23505 = unique_violation — profile already exists, that's fine
        throw profileErr;
      }
      onSuccess(username.trim(), city.trim() || 'Unknown');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-md p-8"
            style={{ background: 'var(--bg)' }}
          >
            <div className="mb-6">
              <div className="vermillion-stamp text-3xl font-serif mb-1">登</div>
              <h2 className="display text-2xl">Claim your seat at the table.</h2>
              <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
                Pick a name and city. Your ELO and games will live on the public Ladder.
              </p>
            </div>

            <div className="space-y-3">
              <input
                className="input"
                placeholder="Username (e.g. silent_rook)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
              />
              <input
                className="input"
                placeholder="City (e.g. Almaty) — optional"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                maxLength={30}
              />
            </div>

            {error && (
              <div className="mt-3 text-xs font-mono" style={{ color: 'var(--accent)' }}>
                {error}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button onClick={onClose} className="btn-ghost">
                Cancel
              </button>
              <button onClick={submit} disabled={loading} className="btn-primary">
                {loading ? 'Sealing...' : 'Take my seat'}
              </button>
            </div>

            {!supabase && (
              <p className="mt-4 text-[11px] font-mono uppercase tracking-wider"
                 style={{ color: 'var(--muted)' }}>
                Note: Supabase is not configured. Running in local-only mode — your profile won't sync.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
