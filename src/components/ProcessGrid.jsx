import { motion, useReducedMotion } from 'framer-motion'
import { SPRING } from '../lib/site.js'

const STEPS = [
  {
    no: '01',
    title: 'Enquire',
    tint: '#E4889C', // blush
    blurb: 'Tell me your date, your venue and the feeling you want held.',
    detail:
      'A short conversation about the day, the people who matter most, and whether the painting is made live or from photographs. I take a limited number of weddings each season.',
  },
  {
    no: '02',
    title: 'Compose',
    tint: '#ED8A33', // orange
    blurb: 'We settle on size, figures and where the piece will live.',
    detail:
      'Archival A3 or A2 cotton-rag, the number of figures, optional guest vignettes, and framing. A deposit holds your date — from that point it is yours.',
  },
  {
    no: '03',
    title: 'Paint',
    tint: '#3A7F9D', // teal
    blurb: 'I work in pigment as the reception unfolds around me.',
    detail:
      'Four to six hours, usually through the reception. Guests watch the portrait take shape — it tends to become a quiet highlight of the evening.',
  },
  {
    no: '04',
    title: 'Deliver',
    tint: '#6E7E4E', // sage
    blurb: 'A finished work, plus a high-resolution scan for keeps.',
    detail:
      'Live pieces are usually in your hands on the night; refined or framed work follows within weeks. Every couple receives a lightfast, archival original.',
  },
]

/**
 * Section D — the interactive "How It Works" process grid.
 * Steps reveal on scroll with a spring; each card expands, shifts to its
 * pastel pigment, and slides up a hidden detail layer on hover/focus.
 */
export default function ProcessGrid() {
  const reduce = useReducedMotion()

  return (
    <section
      id="process"
      className="relative mx-auto max-w-wrap px-[clamp(1.25rem,4vw,4rem)] py-[clamp(4rem,10vw,9rem)]"
    >
      <div className="mb-[clamp(2.5rem,6vw,5rem)] flex flex-col gap-4">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-ink-soft">
          The Process
        </span>
        <h2 className="max-w-2xl font-display text-[clamp(2rem,5vw,3.75rem)] font-light uppercase leading-[0.95] tracking-[-0.03em] text-ink">
          Four unhurried steps
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <ProcessCard key={step.no} step={step} index={i} reduce={reduce} />
        ))}
      </div>
    </section>
  )
}

function ProcessCard({ step, index, reduce }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: reduce ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ ...SPRING, delay: reduce ? 0 : index * 0.08 }}
      whileHover={reduce ? {} : { y: -8, scale: 1.02 }}
      tabIndex={0}
      style={{ '--tint': step.tint }}
      className="group relative flex min-h-[18rem] flex-col justify-between overflow-hidden rounded-[1.25rem] border border-line bg-paper p-7 transition-colors duration-500 ease-organic hover:border-transparent focus-visible:border-transparent"
    >
      {/* Pastel pigment wash that floods in on hover/focus */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-0 opacity-0 transition-opacity duration-500 ease-organic group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          background: `radial-gradient(120% 100% at 20% 0%, color-mix(in srgb, var(--tint) 38%, transparent), transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <span className="font-mono text-xs tracking-[0.2em] text-ink-soft">
          {step.no}
        </span>
        <span
          className="h-3 w-3 rounded-full transition-transform duration-500 ease-organic group-hover:scale-150"
          style={{ backgroundColor: step.tint }}
        />
      </div>

      <div className="relative z-10">
        <h3 className="font-display text-[clamp(1.6rem,2.5vw,2.25rem)] font-light uppercase tracking-[-0.02em] text-ink">
          {step.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {step.blurb}
        </p>

        {/* Hidden detail layer — slides up and fades in on reveal */}
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-organic group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <p className="mt-4 text-[0.82rem] leading-relaxed text-ink/80">
              {step.detail}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
