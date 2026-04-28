import { motion } from 'framer-motion';
import type { Sensei } from '@/lib/senseis';

interface Props {
  sensei: Sensei;
  selected: boolean;
  onSelect: () => void;
  index: number;
}

export function SenseiCard({ sensei, selected, onSelect, index }: Props) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onClick={onSelect}
      disabled={sensei.locked}
      className={`relative text-left p-6 transition-all group ${
        selected
          ? 'border-[var(--accent)]'
          : 'border-[var(--border)] hover:border-[var(--fg)]'
      } ${sensei.locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{
        border: '1px solid',
        background: selected ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--surface)',
        borderRadius: '2px',
      }}
    >
      {/* Corner brackets when selected */}
      {selected && (
        <>
          <span className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: 'var(--accent)' }} />
          <span className="absolute top-0 right-0 w-3 h-3 border-t border-r" style={{ borderColor: 'var(--accent)' }} />
          <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l" style={{ borderColor: 'var(--accent)' }} />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{ borderColor: 'var(--accent)' }} />
        </>
      )}

      <div className="flex items-start justify-between mb-4">
        <span
          className="font-serif text-5xl leading-none transition-transform group-hover:scale-110"
          style={{ color: sensei.accent }}
        >
          {sensei.glyph}
        </span>
        {sensei.locked && (
          <span className="pill" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
            Pro
          </span>
        )}
      </div>

      <h3 className="display text-2xl mb-1">{sensei.name}</h3>
      <p className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: 'var(--muted)' }}>
        {sensei.title}
      </p>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--fg)' }}>
        {sensei.shortBio}
      </p>

      <p
        className="text-xs italic mt-3 leading-relaxed"
        style={{ color: 'var(--muted)' }}
      >
        {sensei.longBio}
      </p>
    </motion.button>
  );
}
