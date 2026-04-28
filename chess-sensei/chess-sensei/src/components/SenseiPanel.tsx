import { motion, AnimatePresence } from 'framer-motion';
import type { Sensei } from '@/lib/senseis';

interface Props {
  sensei: Sensei;
  message: string | null;
  loading: boolean;
}

export function SenseiPanel({ sensei, message, loading }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-4 mb-4">
        <div
          className="font-serif text-4xl leading-none flex-shrink-0"
          style={{ color: sensei.accent }}
        >
          {sensei.glyph}
        </div>
        <div className="min-w-0">
          <div className="display text-lg leading-tight">{sensei.name}</div>
          <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
            {sensei.title}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sensei-quote"
          >
            <span className="loading-dots">
              <span>—</span> <span>—</span> <span>—</span>
            </span>
            <div className="mt-2 text-xs not-italic font-mono uppercase tracking-wider"
                 style={{ color: 'var(--muted)' }}>
              Sensei is considering
            </div>
          </motion.div>
        ) : message ? (
          <motion.div
            key={message.slice(0, 32)}
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0)' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="sensei-quote whitespace-pre-wrap"
          >
            {message}
          </motion.div>
        ) : (
          <motion.div
            key="silent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-serif italic leading-relaxed"
            style={{ color: 'var(--muted)' }}
          >
            {sensei.shortBio}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
