import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase is optional. If env vars are missing, the leaderboard and auth
 * features are disabled but the rest of the app works fine. This makes
 * local development frictionless.
 */
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

export const supabaseEnabled = supabase !== null;

export interface Profile {
  id: string;
  username: string;
  city: string | null;
  elo: number;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  created_at: string;
}

export interface GameRecord {
  id: string;
  user_id: string;
  pgn: string;
  result: 'win' | 'loss' | 'draw';
  sensei_id: string;
  difficulty: string;
  elo_delta: number;
  created_at: string;
}
