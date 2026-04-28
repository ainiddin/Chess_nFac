interface Props {
  moves: string[];
}

export function MoveList({ moves }: Props) {
  // Group into pairs: white move + black move
  const rows: { num: number; white: string; black: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    rows.push({
      num: i / 2 + 1,
      white: moves[i],
      black: moves[i + 1] ?? '',
    });
  }

  if (rows.length === 0) {
    return (
      <div className="text-xs italic font-serif text-center py-4" style={{ color: 'var(--muted)' }}>
        The game awaits its first stroke.
      </div>
    );
  }

  return (
    <div className="font-mono text-xs leading-relaxed scroll-pretty overflow-y-auto max-h-[280px]">
      {rows.map((r) => (
        <div key={r.num} className="grid grid-cols-[2rem_1fr_1fr] gap-2 py-0.5">
          <span style={{ color: 'var(--muted)' }}>{r.num}.</span>
          <span>{r.white}</span>
          <span style={{ color: 'var(--muted)' }}>{r.black}</span>
        </div>
      ))}
    </div>
  );
}
