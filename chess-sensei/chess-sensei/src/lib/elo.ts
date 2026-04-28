/**
 * Lightweight ELO update suitable for a casual ladder.
 * K-factor scales with games played for stability.
 */
export function eloDelta(
  playerElo: number,
  opponentElo: number,
  result: 'win' | 'loss' | 'draw',
  gamesPlayed: number
): number {
  const expected = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const actual = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
  const k = gamesPlayed < 20 ? 40 : gamesPlayed < 50 ? 24 : 16;
  return Math.round(k * (actual - expected));
}

export const DIFFICULTY_TO_ELO: Record<string, number> = {
  novice: 800,
  apprentice: 1200,
  adept: 1600,
  master: 2200,
};
