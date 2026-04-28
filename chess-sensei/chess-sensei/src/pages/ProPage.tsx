import { motion } from 'framer-motion';
import { useState } from 'react';

export function ProPage() {
  const [waitlisted, setWaitlisted] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="rule flex-1" />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            chess sensei · pro
          </span>
        </div>

        <h1 className="display text-5xl sm:text-7xl leading-[0.95] mb-6">
          More <span className="vermillion-stamp italic">senseis.</span>
          <br />
          Sharper <span className="italic">lessons.</span>
        </h1>

        <p className="text-lg font-serif italic max-w-2xl mb-12" style={{ color: 'var(--muted)' }}>
          The free tier gives you three senseis and post-game critique. Pro unlocks
          deeper analysis, every sensei in the dojo, and a personal weakness profile
          that grows with every game you play.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { glyph: '鯊', label: 'Locked senseis', desc: 'The Shark, The Tournament Director, more.' },
            { glyph: '圖', label: 'Weakness profile', desc: 'A living portrait of how you blunder, updated each game.' },
            { glyph: '深', label: 'Move-by-move depth', desc: 'Every move analysed, not just the critical one.' },
          ].map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="card p-6"
            >
              <div className="font-serif text-3xl mb-3" style={{ color: 'var(--accent)' }}>
                {f.glyph}
              </div>
              <div className="display text-lg mb-1">{f.label}</div>
              <div className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                {f.desc}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="card p-8 sm:p-12">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="display text-5xl">$4</span>
            <span className="display text-2xl">.99</span>
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              / month
            </span>
          </div>

          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
            Cancel anytime. First week free. Bring your own GM ego.
          </p>

          {waitlisted ? (
            <div className="vermillion-stamp font-mono uppercase tracking-widest text-sm">
              ✓ You're on the list. We'll write when the dojo opens.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                className="input flex-1"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={() => email.includes('@') && setWaitlisted(true)}
                className="btn-primary whitespace-nowrap"
              >
                Join waitlist
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 text-xs font-mono uppercase tracking-widest text-center"
             style={{ color: 'var(--muted)' }}>
          MVP · Stripe integration coming soon
        </div>
      </motion.div>
    </div>
  );
}
