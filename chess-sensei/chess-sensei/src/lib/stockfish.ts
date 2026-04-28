/**
 * Stockfish wrapper with graceful fallback.
 *
 * Strategy:
 *   1. Try to load Stockfish from a CDN as a Blob worker (avoids CORS).
 *   2. If that fails (network blocked, CDN down, Worker error),
 *      fall back to a tiny "random legal move" engine so the app
 *      remains demoable end-to-end.
 *
 * The fallback is intentionally weak — it's a safety net, not a feature.
 * The Sensei still works, the leaderboard still works, the Pro page still
 * works, and the game is still playable.
 */

import { Chess } from 'chess.js';

const STOCKFISH_CDN =
  'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js';

export type Difficulty = 'novice' | 'apprentice' | 'adept' | 'master';

interface DifficultySettings {
  skill: number;
  movetimeMs: number;
  label: string;
  approxElo: number;
}

export const DIFFICULTY: Record<Difficulty, DifficultySettings> = {
  novice:     { skill: 1,  movetimeMs: 200,  label: 'Novice',     approxElo: 800 },
  apprentice: { skill: 6,  movetimeMs: 400,  label: 'Apprentice', approxElo: 1200 },
  adept:      { skill: 12, movetimeMs: 800,  label: 'Adept',      approxElo: 1600 },
  master:     { skill: 20, movetimeMs: 1500, label: 'Master',     approxElo: 2200 },
};

class StockfishEngine {
  private worker: Worker | null = null;
  private resolveBestmove: ((m: string) => void) | null = null;
  private bootPromise: Promise<boolean> | null = null;
  private fallbackMode = false;

  /**
   * @returns true if real Stockfish booted, false if running on fallback.
   */
  private async boot(): Promise<boolean> {
    if (this.bootPromise) return this.bootPromise;

    this.bootPromise = new Promise((resolve) => {
      (async () => {
        try {
          const res = await fetch(STOCKFISH_CDN);
          if (!res.ok) throw new Error(`Stockfish fetch failed: ${res.status}`);
          const text = await res.text();
          const blob = new Blob([text], { type: 'application/javascript' });
          const url = URL.createObjectURL(blob);
          const w = new Worker(url);

          let ready = false;
          const fail = (reason: string) => {
            if (ready) return;
            console.warn('[Stockfish] falling back to random engine:', reason);
            this.fallbackMode = true;
            try { w.terminate(); } catch { /* noop */ }
            resolve(false);
          };

          w.onmessage = (e: MessageEvent<string>) => {
            const line = e.data;
            if (typeof line !== 'string') return;
            if (line.startsWith('bestmove')) {
              const move = line.split(' ')[1];
              this.resolveBestmove?.(move);
              this.resolveBestmove = null;
            }
            if (line === 'uciok') w.postMessage('isready');
            if (line === 'readyok' && !ready) {
              ready = true;
              this.worker = w;
              resolve(true);
            }
          };
          w.onerror = (err) => fail(String(err.message ?? err));
          w.postMessage('uci');

          // Boot timeout — if Stockfish doesn't respond in 8 seconds, fall back.
          setTimeout(() => fail('boot timeout'), 8000);
        } catch (err) {
          console.warn('[Stockfish] CDN load failed, using fallback engine:', err);
          this.fallbackMode = true;
          resolve(false);
        }
      })();
    });

    return this.bootPromise;
  }

  private send(cmd: string) {
    this.worker?.postMessage(cmd);
  }

  async configure(difficulty: Difficulty) {
    const ok = await this.boot();
    if (!ok) return;
    const cfg = DIFFICULTY[difficulty];
    this.send(`setoption name Skill Level value ${cfg.skill}`);
    if (cfg.skill < 5) {
      this.send(`setoption name Skill Level Maximum Error value 900`);
      this.send(`setoption name Skill Level Probability value 128`);
    }
    this.send('ucinewgame');
    this.send('isready');
  }

  /**
   * Best move for a FEN. Returns UCI ("e2e4" or "e7e8q").
   */
  async bestMove(fen: string, difficulty: Difficulty): Promise<string> {
    const ok = await this.boot();
    if (!ok || this.fallbackMode) return this.fallbackBestMove(fen, difficulty);
    const cfg = DIFFICULTY[difficulty];
    return new Promise((resolve) => {
      this.resolveBestmove = resolve;
      this.send(`position fen ${fen}`);
      this.send(`go movetime ${cfg.movetimeMs}`);
    });
  }

  /**
   * Tiny fallback: pick a legal move, biased slightly by simple heuristics
   * (prefer captures, avoid hanging the queen). Adequate for a demo.
   */
  private fallbackBestMove(fen: string, difficulty: Difficulty): string {
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return '(none)';

    const skill = DIFFICULTY[difficulty].skill;
    const scored = moves.map((m) => {
      let score = Math.random() * 10;
      if (m.captured) score += 30;
      if (m.flags.includes('p')) score += 20;
      if (m.san.includes('+')) score += 5;
      if (m.piece === 'q' && !m.captured) score -= 5;
      return { m, score: skill > 5 ? score : score * 0.3 + Math.random() * 30 };
    });

    scored.sort((a, b) => b.score - a.score);
    const chosen = scored[0].m;
    return `${chosen.from}${chosen.to}${chosen.promotion ?? ''}`;
  }

  isUsingFallback(): boolean {
    return this.fallbackMode;
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
    this.bootPromise = null;
  }
}

let _engine: StockfishEngine | null = null;
export function getEngine(): StockfishEngine {
  if (!_engine) _engine = new StockfishEngine();
  return _engine;
}
