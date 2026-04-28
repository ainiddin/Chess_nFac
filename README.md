# Chess Sensei

> Chess with consequences. Pick a sensei, play a game, and walk away with the
> one critique that actually matters.

**Live demo:** _add your Vercel URL here_  
**Repo:** _add your GitHub URL here_

---

## What this is

Chess Sensei is a chess platform built around one bet: **most people don't quit
chess because they lose. They quit because losing teaches them nothing.**

You pick a teacher with a personality — a Zen master, a drill sergeant, a CBT
therapist who also plays the Sicilian — and play a game against Stockfish at
your level. When the game ends (or anytime you want a read mid-game), the sensei
analyses your moves _in their own voice_, finds the one turning point that
mattered, and tells you exactly what to fix.

It's the post-game lesson you'd get from a real coach, except you can summon them
on a Tuesday at 2am, and they remember to be a character.

## Who it's for

- **Adult improvers** stuck around 800–1600 ELO who play a lot but don't get
  better, because they have no one to tell them why.
- **Students of the game** who'd prefer a teacher with a viewpoint over a
  spreadsheet of centipawn losses.
- **Casual players** who want a chess site that feels like a place — not another
  algorithmic, gamified treadmill.

## Why it's valuable

Existing chess sites optimise for one thing: **time on board.** They want you
playing more games. Chess Sensei optimises for the opposite — **lessons per
game.** Fewer games, deeper takeaways, better players.

This is a real product gap. Lichess and Chess.com both have engine analysis,
but neither has voice, and neither helps you understand _your patterns_ across
games. We do (Pro tier — see below).

## Features

### Free tier
- ✅ Play vs Stockfish at four difficulty levels (Novice → Master, ~800–2200 ELO)
- ✅ Three senseis with distinct personalities, each with a custom system prompt:
  - **Master Ren** — patient, asks questions, quotes invented wisdom
  - **Sgt. Volkov** — drill instructor, calls you "soldier", prescribes drills
  - **Dr. Marlowe** — CBT therapist who plays the Sicilian, frames mistakes as patterns
- ✅ Mid-game "Ask Sensei" — request a read on the current position
- ✅ Post-game analysis — full PGN sent to Claude, sensei picks the turning point
- ✅ Move history with algebraic notation
- ✅ Light & dark theme (a serif "paper / sumi ink" aesthetic, not another generic chess UI)
- ✅ Fully responsive — playable on phone
- ✅ Public Ladder (leaderboard) with per-city filters — climb from "Almaty"

### Pro (waitlist live, Stripe wired in next iteration)
- 🔒 Locked senseis (The Shark — old hustler from Bryant Park / Gorky Park)
- 🔒 **Weakness profile** — across all your games, what patterns of mistakes recur
- 🔒 Move-by-move analysis instead of just the turning point

### What we deliberately did NOT build (and why)

- **Real-time multiplayer.** It's a solved problem and adds nothing to the thesis.
  Lichess does it for free. We're not competing with chess infrastructure — we're
  competing with the absence of a teacher.
- **Opening book / puzzle trainer.** Off-thesis. A sensei isn't a flashcard deck.
- **Move-by-move full game replay UI.** Cut for time; the post-game summary
  delivers 80% of the value at 20% of the build cost.

## Tech stack

| Layer | Tech | Why |
|---|---|---|
| Frontend | Vite + React + TypeScript | Fast dev loop, type safety |
| Styling | Tailwind + custom CSS variables | Distinctive design system, not stock components |
| Animation | Framer Motion | Sensei messages "bleed in" like ink on paper |
| Chess rules | `chess.js` | Battle-tested, handles every rule |
| Board UI | `react-chessboard` | Drag/drop, accessibility, animations |
| AI opponent | Stockfish 10 (via Web Worker) | Strongest engine, runs entirely in browser, no server |
| Sensei AI | Anthropic Claude (Sonnet 4.6) | Best-in-class for character consistency + chess analysis |
| Backend (leaderboard) | Supabase (Postgres + Anonymous Auth) | Zero-config, free tier, RLS for security |
| Deploy | Vercel + serverless function for AI calls | One-click deploy, API key stays server-side |

## Design

Aesthetic: **"Dojo Editorial"** — a refined chess column in a magazine.

- **Palette:** parchment, sumi ink, single vermillion accent (the same red as
  the knight on the brief's own cover)
- **Typography:** Cormorant Garamond (display, italic) + Manrope (body) +
  JetBrains Mono (notation)
- **Texture:** subtle paper grain over everything; corner brackets on the board
  to evoke a tournament print; sensei messages animate in with an ink-bleed blur
- **Tone:** sparse, intentional. No gamification cruft. No XP bars. No animated
  trophies. The reward is the lesson.

## Run locally

```bash
# 1. Install
npm install

# 2. Configure (copy and fill in)
cp .env.example .env

# 3. Run dev server
npm run dev
```

The app works without env vars in **demo mode** — chess + Stockfish work, but
the leaderboard and AI-coach features stay disabled.

To get the full experience locally:

1. **Anthropic API key** (for the sensei voice)  
   Create one at <https://console.anthropic.com/> and put it in `.env` as
   `ANTHROPIC_API_KEY`. Note: the `/api/analyze` route runs as a Vercel
   serverless function — to test it locally, run `vercel dev` instead of
   `npm run dev`.

2. **Supabase** (for the leaderboard)  
   - Create a project at <https://app.supabase.com>
   - Run the SQL in `supabase/schema.sql` in the SQL editor
   - In **Authentication → Providers**, enable **Anonymous sign-ins**
   - Copy the project URL and anon key into `.env`

## Deploy

1. Push to GitHub
2. Import the repo into Vercel
3. Add the three env vars (`ANTHROPIC_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
4. Deploy

That's it. Vercel handles SPA routing, the serverless function, and HTTPS.

## Project structure

```
chess-sensei/
├── api/
│   └── analyze.ts          # Vercel serverless function — calls Claude
├── public/
│   └── favicon.svg
├── src/
│   ├── components/         # SenseiCard, ChessBoard, MoveList, AuthModal, Header, ThemeToggle, SenseiPanel
│   ├── pages/              # HomePage, GamePage, LeaderboardPage, ProPage
│   ├── lib/
│   │   ├── senseis.ts      # ⭐ The four sensei personalities — system prompts live here
│   │   ├── stockfish.ts    # Web Worker wrapper around Stockfish
│   │   ├── supabase.ts     # Supabase client (gracefully no-ops when not configured)
│   │   └── elo.ts          # Simple Elo update for the ladder
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css           # Design tokens, paper grain, ink-bleed animations
├── supabase/
│   └── schema.sql
└── README.md
```

## What I'd build next, given another week

1. **Personalised weakness profile.** Across a player's last 20 games, run an
   LLM aggregation to find recurring patterns ("you lose tempo when defending
   IQP positions"). This is the unlock for real Pro retention.
2. **Sensei conversations.** Let the user reply to the sensei's critique and
   ask follow-up questions. The PGN is already in context — it's a free upgrade.
3. **Stripe + actual Pro tier.** The fake Pro page has shown which features
   pull. Wire it up.
4. **Real-time multiplayer with sensei spectator mode.** Two friends play, both
   pick their own senseis, both get personalised post-mortems.
5. **Daily Sensei.** A "puzzle of the day" that's actually a position from a
   recent user game — the sensei poses it as a question.

## Acknowledgements

- Stockfish team for the open-source engine
- `chess.js` and `react-chessboard` maintainers
- The brief's red knight on white squares — that became the entire colour palette

---

*Built for the n!factorial Chess assignment. Submitted by `<Esirkep Ainiddin>`.*
