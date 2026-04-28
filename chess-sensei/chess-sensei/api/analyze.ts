import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { SENSEIS } from '../src/lib/senseis';

/**
 * POST /api/analyze
 *
 * Body:
 *   pgn: string                         (full game in PGN)
 *   fen: string                         (current position)
 *   senseiId: string
 *   mode: 'midgame' | 'postgame'
 *   playerColor: 'white' | 'black'
 *   result?: 'win' | 'loss' | 'draw'    (postgame only)
 *   reason?: string                     (postgame only)
 *
 * Returns: { message: string }
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        'ANTHROPIC_API_KEY is not configured. Add it to your Vercel project environment variables.',
    });
  }

  try {
    const { pgn, fen, senseiId, mode, playerColor, result, reason } = req.body ?? {};

    if (!pgn || !senseiId || !mode) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const sensei = SENSEIS.find((s) => s.id === senseiId);
    if (!sensei) {
      return res.status(400).json({ error: 'Unknown sensei.' });
    }

    const client = new Anthropic({ apiKey });

    const userPrompt =
      mode === 'postgame'
        ? buildPostgamePrompt({ pgn, fen, playerColor, result, reason })
        : buildMidgamePrompt({ pgn, fen, playerColor });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: sensei.prompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .filter(Boolean)
      .join('\n');

    return res.status(200).json({ message: text.trim() });
  } catch (err) {
    console.error('analyze error:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: msg });
  }
}

function buildPostgamePrompt(args: {
  pgn: string;
  fen: string;
  playerColor: string;
  result: string;
  reason: string;
}) {
  return `A student has just finished a game against me (the chess engine, configured to a specific level). They played as ${args.playerColor}.

Final result: ${args.result} (${args.reason})

Full game in PGN:
${args.pgn}

Final position FEN:
${args.fen}

Tell the student, in your voice, what they should learn from this game. Identify ONE key turning-point move where they went wrong (or could have done better) — name it by move number and notation. Then give one specific concrete lesson they can carry into their next game. If they won, point out one weakness in their play that almost cost them the game — winners need correction too.

Stay in character. Do not break voice.`;
}

function buildMidgamePrompt(args: { pgn: string; fen: string; playerColor: string }) {
  return `A student has paused mid-game and asked for your read on the position. They are playing as ${args.playerColor}.

Game so far in PGN:
${args.pgn}

Current position FEN:
${args.fen}

Give them a brief, in-character read of the position: what's the main strategic question right now, and one concrete idea to consider — without telling them the exact best move (let them find it). Stay in character.`;
}
