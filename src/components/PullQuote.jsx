import { motion, useReducedMotion } from 'framer-motion'
import { Drop } from './Label.jsx'
import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { SPRING_SOFT } from '../lib/site.js'
import { PULLQUOTE } from '../content.js'

/**
 * The Clare & William quote, set as a centred editorial moment between the
 * hero and the story — the one place the site speaks in a client's voice
 * rather than Christopher's. Every other section sits on the left-aligned
 * grid, so the centring alone marks it as a held breath rather than a
 * section. Kept transparent so the hero-to-story wash runs through it.
 *
 * The words settle in one after another, each sharpening from a soft blur —
 * ink drying on the page. Lite devices (touch, reduced-motion) get a single
 * quiet fade instead.
 */
export default function PullQuote() {
  const reduce = useReducedMotion()
  const lite = reduce || !useHeavyFx()
  const words = PULLQUOTE.quote.split(' ')

  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { ...SPRING_SOFT, delay },
  })

  const wordContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.045, delayChildren: 0.1 } },
  }
  const wordItem = {
    hidden: { opacity: 0, y: 10, filter: 'blur(6px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] },
    },
  }

  return (
    <section
      aria-label="What a couple said"
      className="relative z-10 px-[5vw] py-[clamp(3.5rem,7vw,6rem)]"
    >
      <figure className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <motion.span
          {...rise(0)}
          aria-hidden="true"
          className="font-sentient text-[clamp(3.5rem,7vw,5.5rem)] leading-[0.4] text-terracotta/70"
        >
          &ldquo;
        </motion.span>
        <blockquote className="mt-6">
          {lite ? (
            <motion.p
              {...rise(0.08)}
              className="font-sentient text-[clamp(1.5rem,3.2vw,2.6rem)] leading-[1.15] tracking-[-0.015em] text-ink [text-wrap:balance]"
            >
              {PULLQUOTE.quote}
            </motion.p>
          ) : (
            <motion.p
              variants={wordContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              aria-label={PULLQUOTE.quote}
              className="font-sentient text-[clamp(1.5rem,3.2vw,2.6rem)] leading-[1.15] tracking-[-0.015em] text-ink [text-wrap:balance]"
            >
              {words.map((w, i) => (
                <motion.span
                  key={i}
                  variants={wordItem}
                  aria-hidden="true"
                  className="inline-block whitespace-pre"
                >
                  {w}
                  {i < words.length - 1 ? ' ' : ''}
                </motion.span>
              ))}
            </motion.p>
          )}
        </blockquote>
        <motion.figcaption
          {...rise(0.2)}
          className="mt-7 flex flex-col items-center gap-1.5"
        >
          <Drop className="h-5 w-auto opacity-80" gradient={['#C2613C', '#C9A23A']} />
          <span className="font-mono text-[0.95rem] text-ink">{PULLQUOTE.author}</span>
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-ink-soft">
            {PULLQUOTE.detail}
          </span>
        </motion.figcaption>
      </figure>
    </section>
  )
}
