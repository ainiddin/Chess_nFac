-- Chess Sensei — Supabase schema
-- Run this in the SQL editor of your Supabase project.

-- 1. Profiles table — one row per player
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 20),
  city text,
  elo integer not null default 1200,
  games_played integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  created_at timestamp with time zone default now()
);

-- 2. Games table — one row per game played
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  pgn text not null,
  result text not null check (result in ('win', 'loss', 'draw')),
  sensei_id text not null,
  difficulty text not null,
  elo_delta integer not null,
  created_at timestamp with time zone default now()
);

-- Index for leaderboard queries
create index if not exists profiles_elo_idx on public.profiles (elo desc);
create index if not exists profiles_city_elo_idx on public.profiles (city, elo desc);
create index if not exists games_user_idx on public.games (user_id, created_at desc);

-- 3. Row Level Security
alter table public.profiles enable row level security;
alter table public.games enable row level security;

-- Anyone can read profiles (public leaderboard).
create policy "profiles are public" on public.profiles for select using (true);

-- A user can insert/update only their own profile.
create policy "users insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "users update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Games: a user can read their own games; anyone can read for the leaderboard if you want
-- (we keep it user-scoped for now; relax later if needed).
create policy "users read their own games" on public.games
  for select using (auth.uid() = user_id);
create policy "users insert their own games" on public.games
  for insert with check (auth.uid() = user_id);
