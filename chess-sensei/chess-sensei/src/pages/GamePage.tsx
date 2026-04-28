import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Chess, Square } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { ChessBoard } from '@/components/ChessBoard';
import { MoveList } from '@/components/MoveList';
import { SenseiPanel } from '@/components/SenseiPanel';
import { AuthModal } from '@/components/AuthModal';
import { getSensei } from '@/lib/senseis';
import { getEngine, DIFFICULTY, type Difficulty } from '@/lib/stockfish';
import { supabase } from '@/lib/supabase';
import { eloDelta, DIFFICULTY_TO_ELO } from '@/lib/elo';

type Result = 'win' | 'loss' | 'draw';

export function GamePage() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const senseiId = params.get('sensei') ?? 'master-ren';
  const difficulty = (params.get('difficulty') ?? 'apprentice') as Difficulty;
  const playerColor = (params.get('color') ?? 'white') as 'white' | 'black';

  const sensei = getSensei(senseiId);

  // chess.js instance is held in a ref so React doesn't re-create it.
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [history, setHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [thinking, setThinking] = useState(false);
  const [gameOver, setGameOver] = useState<{ result: Result; reason: string } | null>(null);
  const [senseiMessage, setSenseiMessage] = useState<string | null>(null);
  const [senseiLoading, setSenseiLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Boot Stockfish at the right difficulty
  useEffect(() => {
    getEngine().configure(difficulty);
  }, [difficulty]);

  // If player is black, Stockfish moves first
  useEffect(() => {
    if (playerColor === 'black' && history.length === 0) {
      // small delay so the board mounts cleanly
      const t = setTimeout(() => engineMove(), 600);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerColor]);

  const isPlayerTurn = useMemo(() => {
    const turn = gameRef.current.turn(); // 'w' | 'b'
    return (turn === 'w' && playerColor === 'white') || (turn === 'b' && playerColor === 'black');
  }, [fen, playerColor]);

  const checkSquare = useMemo<string | null>(() => {
    const game = gameRef.current;
    if (!game.inCheck()) return null;
    const turnColor = game.turn();
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turnColor) {
          const file = 'abcdefgh'[c];
          const rank = 8 - r;
          return `${file}${rank}`;
        }
      }
    }
    return null;
  }, [fen]);

  function checkGameOver() {
    const g = gameRef.current;
    if (g.isGameOver()) {
      let result: Result = 'draw';
      let reason = 'Draw';
      if (g.isCheckmate()) {
        // The side to move just got mated
        const losingColor = g.turn() === 'w' ? 'white' : 'black';
        result = losingColor === playerColor ? 'loss' : 'win';
        reason = result === 'win' ? 'Checkmate. You won.' : 'Checkmate. You lost.';
      } else if (g.isStalemate()) reason = 'Stalemate.';
      else if (g.isThreefoldRepetition()) reason = 'Draw by threefold repetition.';
      else if (g.isInsufficientMaterial()) reason = 'Draw by insufficient material.';
      else if (g.isDraw()) reason = 'Draw by 50-move rule.';
      setGameOver({ result, reason });
      // Trigger end-of-game analysis automatically
      runFinalAnalysis(result, reason);
      return true;
    }
    return false;
  }

  async function engineMove() {
    setThinking(true);
    try {
      const uci = await getEngine().bestMove(gameRef.current.fen(), difficulty);
      if (!uci || uci === '(none)') return;
      const from = uci.slice(0, 2) as Square;
      const to = uci.slice(2, 4) as Square;
      const promo = uci.length > 4 ? uci.slice(4, 5) : undefined;
      gameRef.current.move({ from, to, promotion: promo });
      setFen(gameRef.current.fen());
      setHistory(gameRef.current.history());
      setLastMove({ from, to });
      checkGameOver();
    } finally {
      setThinking(false);
    }
  }

  function onUserMove(from: string, to: string, promotion?: string): boolean {
    if (gameOver) return false;
    if (!isPlayerTurn) return false;
    const move = gameRef.current.move({ from, to, promotion: promotion ?? 'q' });
    if (!move) return false;
    setFen(gameRef.current.fen());
    setHistory(gameRef.current.history());
    setLastMove({ from, to });
    if (checkGameOver()) return true;
    // engine's turn
    setTimeout(() => engineMove(), 200);
    return true;
  }

  async function askSensei() {
    if (senseiLoading) return;
    setSenseiLoading(true);
    setSenseiMessage(null);
    try {
      const pgn = gameRef.current.pgn();
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pgn,
          fen: gameRef.current.fen(),
          senseiId,
          mode: 'midgame',
          playerColor,
        }),
      });
      const data = await res.json();
      setSenseiMessage(data.message ?? data.error ?? 'The sensei has nothing to say.');
    } catch {
      setSenseiMessage('The sensei is meditating. Try again in a moment.');
    } finally {
      setSenseiLoading(false);
    }
  }

  async function runFinalAnalysis(result: Result, reason: string) {
    setSenseiLoading(true);
    setSenseiMessage(null);
    try {
      const pgn = gameRef.current.pgn();
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pgn,
          fen: gameRef.current.fen(),
          senseiId,
          mode: 'postgame',
          result,
          reason,
          playerColor,
        }),
      });
      const data = await res.json();
      setSenseiMessage(data.message ?? data.error ?? 'The sensei has nothing to say.');
    } catch {
      setSenseiMessage('The sensei could not be reached. Your moves will speak for themselves.');
    } finally {
      setSenseiLoading(false);
    }
  }

  async function submitToLadder(username: string, city: string) {
    if (!gameOver) return;
    setShowAuth(false);
    setSubmitted(true);

    if (!supabase) return; // local-only mode

    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('elo, games_played, wins, losses, draws')
        .eq('id', userId)
        .single();
      if (!profile) return;

      const opponentElo = DIFFICULTY_TO_ELO[difficulty] ?? 1200;
      const delta = eloDelta(profile.elo, opponentElo, gameOver.result, profile.games_played);
      const newElo = profile.elo + delta;

      await supabase.from('profiles').update({
        elo: newElo,
        games_played: profile.games_played + 1,
        wins: profile.wins + (gameOver.result === 'win' ? 1 : 0),
        losses: profile.losses + (gameOver.result === 'loss' ? 1 : 0),
        draws: profile.draws + (gameOver.result === 'draw' ? 1 : 0),
        username,
        city,
      }).eq('id', userId);

      await supabase.from('games').insert({
        user_id: userId,
        pgn: gameRef.current.pgn(),
        result: gameOver.result,
        sensei_id: senseiId,
        difficulty,
        elo_delta: delta,
      });
    } catch (e) {
      console.error('Ladder submit failed:', e);
    }
  }

  function newGame() {
    nav('/');
  }

  function rematch() {
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setHistory([]);
    setLastMove(null);
    setGameOver(null);
    setSenseiMessage(null);
    setSubmitted(false);
    if (playerColor === 'black') {
      setTimeout(() => engineMove(), 600);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:py-12">
      {/* Game meta */}
      <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-widest"
           style={{ color: 'var(--muted)' }}>
        <span className="pill">{sensei.name}</span>
        <span className="pill">{DIFFICULTY[difficulty].label} · ≈{DIFFICULTY[difficulty].approxElo} elo</span>
        <span className="pill capitalize">You: {playerColor}</span>
        {thinking && <span className="pill" style={{ color: 'var(--accent)' }}>Sensei thinking…</span>}
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-8 lg:gap-12 items-start justify-items-center lg:justify-items-start">
        {/* Board */}
        <div className="flex justify-center w-full lg:w-auto">
          <ChessBoard
            fen={fen}
            onMove={onUserMove}
            orientation={playerColor}
            lastMove={lastMove}
            isCheck={gameRef.current.inCheck()}
            checkSquare={checkSquare}
            disabled={!!gameOver || thinking || !isPlayerTurn}
          />
        </div>

        {/* Sidebar */}
        <div className="w-full max-w-md flex flex-col gap-4">
          <SenseiPanel sensei={sensei} message={senseiMessage} loading={senseiLoading} />

          {!gameOver && (
            <button
              onClick={askSensei}
              disabled={senseiLoading || history.length < 4}
              className="btn-ghost w-full justify-center"
            >
              {history.length < 4 ? 'Ask Sensei (after move 2)' : 'Ask Sensei about this position'}
            </button>
          )}

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest"
                    style={{ color: 'var(--muted)' }}>
                Move scroll
              </span>
              <span className="text-[10px] font-mono"
                    style={{ color: 'var(--muted)' }}>
                {Math.ceil(history.length / 2)} moves
              </span>
            </div>
            <MoveList moves={history} />
          </div>

          <button onClick={newGame} className="btn-ghost w-full justify-center">
            Resign / New game
          </button>
        </div>
      </div>

      {/* Game over overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4 lg:p-8"
            style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="card w-full max-w-2xl p-8 sm:p-10"
              style={{ background: 'var(--bg)' }}
            >
              <div className="text-xs font-mono uppercase tracking-widest mb-4"
                   style={{ color: 'var(--muted)' }}>
                {gameOver.reason}
              </div>

              <h2 className="display text-4xl sm:text-5xl mb-2">
                {gameOver.result === 'win' && (
                  <>You <span className="vermillion-stamp italic">won.</span></>
                )}
                {gameOver.result === 'loss' && (
                  <>You <span className="italic" style={{ color: 'var(--muted)' }}>lost.</span></>
                )}
                {gameOver.result === 'draw' && (
                  <>A <span className="italic">draw.</span></>
                )}
              </h2>

              <div className="text-sm font-serif italic mb-6" style={{ color: 'var(--muted)' }}>
                Now hear what {sensei.name} has to say.
              </div>

              <SenseiPanel sensei={sensei} message={senseiMessage} loading={senseiLoading} />

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button onClick={rematch} className="btn-primary">
                  Rematch
                </button>
                <button onClick={newGame} className="btn-ghost">
                  New sensei
                </button>
                {!submitted && (
                  <button
                    onClick={() => setShowAuth(true)}
                    className="btn-ghost ml-auto"
                  >
                    Post to Ladder →
                  </button>
                )}
                {submitted && (
                  <span className="ml-auto text-xs font-mono uppercase tracking-widest"
                        style={{ color: 'var(--moss)' }}>
                    ✓ Posted to Ladder
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={submitToLadder}
      />
    </div>
  );
}
