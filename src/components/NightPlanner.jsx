import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import CornerBloom from './CornerBloom.jsx'
import { SPRING } from '../lib/site.js'
import { PACKAGES } from '../content.js'

const PIECES_PER_HOUR = 8
const GUESTS_PER_PIECE = 4
const HOURS = [3, 4, 5]

/**
 * "Will everyone get painted?" — a small planner that answers the question
 * every couple and organiser actually has. Slide to the guest list, pick the
 * hours, and the arithmetic (8 pieces an hour, up to four guests a piece,
 * studio finishing for anyone missed) does the reassuring. The numbers are
 * the same ones the copy already commits to; this just lets people put their
 * own event into them.
 */
export default function NightPlanner() {
  const reduce = useReducedMotion()
  const p = PACKAGES.planner
  const [guests, setGuests] = useState(100)
  const [hours, setHours] = useState(3)

  const pieces = PIECES_PER_HOUR * hours
  const covers = pieces * GUESTS_PER_PIECE
  const everyoneFits = guests <= covers

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={SPRING}
      className="relative mt-[clamp(2.5rem,6vw,4rem)] overflow-hidden rounded-2xl border border-line/45 shadow-[0_24px_50px_-20px_rgba(173,98,49,0.25)]"
      style={{ background: 'radial-gradient(ellipse 120% 90% at 50% 0%, #FBF8F2 0%, #F4EFE6 62%)' }}
    >
      <CornerBloom from="rgba(110,140,168,0.14)" to="rgba(194,97,60,0.14)" />
      <div className="relative z-10 grid grid-cols-1 gap-8 p-7 sm:p-8 lg:grid-cols-2 lg:gap-12">
        {/* Controls */}
        <div>
          <h3 className="font-sentient text-2xl tracking-[-0.02em] text-ink">{p.title}</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{p.lede}</p>

          <div className="mt-7">
            <div className="flex items-baseline justify-between">
              <label htmlFor="planner-guests" className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft">
                {p.guestsLabel}
              </label>
              <span className="num-wide text-xl text-ink">{guests}</span>
            </div>
            <input
              id="planner-guests"
              type="range"
              min="20"
              max="240"
              step="10"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="mt-3 w-full accent-terracotta"
            />
          </div>

          <div className="mt-6">
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
          <p className="mt-4 text-sm leading-relaxed text-ink/85">
            {p.coversUnit} <b className="num-wide text-ink">{covers}</b> {p.coversTail}.
          </p>
          <p aria-live="polite" className="mt-3 text-sm leading-relaxed text-ink/85">
            {everyoneFits ? p.fits : p.overflow}
          </p>
          <p className="mt-5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ink-soft">
            {p.small}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
