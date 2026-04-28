import { Chessboard } from 'react-chessboard';
import { useEffect, useState } from 'react';

interface Props {
  fen: string;
  onMove: (from: string, to: string, promotion?: string) => boolean;
  orientation: 'white' | 'black';
  lastMove: { from: string; to: string } | null;
  isCheck: boolean;
  checkSquare: string | null;
  disabled: boolean;
}

export function ChessBoard({
  fen,
  onMove,
  orientation,
  lastMove,
  isCheck,
  checkSquare,
  disabled,
}: Props) {
  const [size, setSize] = useState(560);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setSize(Math.min(w - 48, 380));
      else if (w < 1024) setSize(480);
      else setSize(560);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const customSquareStyles: Record<string, React.CSSProperties> = {};
  if (lastMove) {
    customSquareStyles[lastMove.from] = {
      background: 'rgba(200, 67, 79, 0.18)',
      boxShadow: 'inset 0 0 0 2px rgba(200, 67, 79, 0.45)',
    };
    customSquareStyles[lastMove.to] = {
      background: 'rgba(200, 67, 79, 0.28)',
      boxShadow: 'inset 0 0 0 2px rgba(200, 67, 79, 0.55)',
    };
  }
  if (isCheck && checkSquare) {
    customSquareStyles[checkSquare] = {
      background: 'rgba(200, 67, 79, 0.45)',
      boxShadow: 'inset 0 0 24px rgba(200, 67, 79, 0.7)',
    };
  }

  return (
    <div className="board-wrap" style={{ width: size + 24, height: size + 24 }}>
      <Chessboard
        position={fen}
        onPieceDrop={(from, to, piece) => {
          if (disabled) return false;
          // Default-promote to queen; the chess.js side handles legality.
          const promotion = piece[1].toLowerCase() === 'p' &&
            (to[1] === '8' || to[1] === '1') ? 'q' : undefined;
          return onMove(from, to, promotion);
        }}
        boardOrientation={orientation}
        boardWidth={size}
        arePiecesDraggable={!disabled}
        animationDuration={220}
        customBoardStyle={{
          borderRadius: 0,
        }}
        customDarkSquareStyle={{
          background: '#3a342c',
        }}
        customLightSquareStyle={{
          background: '#e8dcc4',
        }}
        customSquareStyles={customSquareStyles}
      />
    </div>
  );
}
