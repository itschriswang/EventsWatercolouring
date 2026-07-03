import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import CornerBloom from './CornerBloom.jsx'
import { SPRING, ENQUIRE_HREF } from '../lib/site.js'
import { PACKAGES } from '../content.js'
import { withUnderline } from './Underline.jsx'

// Warm pigment pairs for the little keepsake thumbnails — cycled so the
// grid reads as a spread of different paintings, not a repeat pattern.
const THUMB_TINTS = [
  ['rgba(194,97,60,0.55)', 'rgba(201,162,58,0.35)'],
  ['rgba(228,136,156,0.5)', 'rgba(194,97,60,0.3)'],
  ['rgba(201,162,58,0.5)', 'rgba(154,74,43,0.35)'],
  ['rgba(201,139,140,0.5)', 'rgba(237,138,51,0.3)'],
]

const PIECES_PER_HOUR = 8
// Coverage is described at the usual two guests to a piece — groups of up to
// four can share one, but that's a bonus on the night, not the plan.
const GUESTS_PER_PIECE = 2
const HOURS = [3, 4, 5]

/**
 * "What does a booking cover?" — a small planner that shows what the booked
 * hours buy. Pick the hours and the arithmetic (8 pieces an hour, usually two
 * guests a piece) shows how many keepsakes get painted live. Coverage beyond
 * that is the after-event add-on or extra hours — the planner points there
 * rather than promising it. The numbers are the same ones the copy already
 * commits to; this just lets people put their own event into them.
 */
export default function NightPlanner() {
  const reduce = useReducedMotion()
  const p = PACKAGES.planner
  const [hours, setHours] = useState(3)

  const pieces = PIECES_PER_HOUR * hours
  const covers = pieces * GUESTS_PER_PIECE

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={SPRING}
      className="relative mt-[clamp(2.5rem,6vw,4rem)] overflow-hidden rounded-2xl border border-line/45 shadow-[0_24px_50px_-20px_rgba(173,98,49,0.25)]"
      style={{ background: 'radial-gradient(ellipse 120% 90% at 50% 0%, #FBF8F2 0%, #F4EFE6 62%)' }}
    >
      <CornerBloom from="rgba(228,136,156,0.13)" to="rgba(194,97,60,0.14)" />
      <div className="relative z-10 grid grid-cols-1 gap-8 p-7 sm:p-8 lg:grid-cols-2 lg:gap-12">
        {/* Controls */}
        <div>
          <h3 className="font-sentient text-2xl tracking-[-0.02em] text-ink">{p.title}</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
            {withUnderline(p.lede, '8 pieces an hour', { className: 'text-terracotta' })}
          </p>

          <div className="mt-7">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft">
              {p.hoursLabel}
            </span>
            <div role="group" aria-label={p.hoursLabel} className="mt-3 flex gap-2">
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHours(h)}
                  aria-pressed={hours === h}
                  className={
                    'rounded-full border px-4 py-1.5 font-mono text-sm transition-colors duration-300 ' +
                    (hours === h
                      ? 'border-terracotta bg-terracotta text-paper'
                      : 'border-line text-ink-soft hover:border-terracotta/60 hover:text-ink')
                  }
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The arithmetic */}
        <div className="flex flex-col justify-center border-t border-line/60 pt-7 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
          <p className="flex items-baseline gap-3">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={pieces}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={SPRING}
                className="num-wide text-[clamp(2.5rem,4vw,3.5rem)] leading-none text-rust"
              >
                {pieces}
              </motion.span>
            </AnimatePresence>
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-ink-soft">
              {p.piecesUnit}
            </span>
          </p>
          {/* The count as objects: one tiny sleeved card per keepsake, so
              "24 pieces" is something you can see stack up as the hours
              change, not just a number changing. Decorative — the figures
              above carry the accessible version. */}
          <div aria-hidden="true" className="mt-5 flex max-w-md flex-wrap gap-1.5">
            {Array.from({ length: pieces }, (_, i) => {
              const [a, b] = THUMB_TINTS[i % THUMB_TINTS.length]
              return (
                <motion.span
                  key={i}
                  initial={reduce ? false : { opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...SPRING, delay: reduce ? 0 : (i % 8) * 0.02 }}
                  className="relative h-7 w-5 overflow-hidden rounded-[3px] border border-line bg-paper shadow-[0_2px_6px_-2px_rgba(173,98,49,0.35)]"
                >
                  <span
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at 50% 42%, ${a}, transparent 68%), radial-gradient(circle at 60% 70%, ${b}, transparent 72%)`,
                    }}
                  />
                </motion.span>
              )
            })}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink/85">
            {p.coversUnit} <b className="num-wide text-ink">{covers}</b> {p.coversTail}.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink/85">{p.more}</p>
          <p className="mt-5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ink-soft">
            {p.small}
          </p>

          {/* Carry the chosen hours straight into the enquiry form — the
              visitor has already done their maths; don't make them retype it. */}
          <a
            href={ENQUIRE_HREF}
            onClick={() =>
              window.dispatchEvent(new CustomEvent('ew:planner-enquire', { detail: { hours } }))
            }
            className="group mt-6 inline-flex w-fit items-center gap-2.5 rounded-full bg-terracotta px-5 py-2.5 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-rust"
          >
            {p.cta}
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>
    </motion.div>
  )
}
