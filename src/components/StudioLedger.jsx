import { motion, useReducedMotion } from 'framer-motion'
import FolderCell from './FolderCell.jsx'
import CornerBloom from './CornerBloom.jsx'
import { SPRING, CARD_BG } from '../lib/site.js'
import { LEDGER } from '../content.js'
import usePinchZoomed from '../hooks/usePinchZoom.js'

/**
 * The studio ledger — a hand-ruled register of real nights painted, filed in
 * the same folder family as the offerings. Social proof in the studio-admin
 * register the folders introduced: date, names, venue, pieces, one ruled row
 * per evening.
 *
 * Renders NOTHING until LEDGER.entries has real bookings in it (see
 * content.js — entries are never invented), so the section simply appears the
 * day the first real night is added.
 */
export default function StudioLedger() {
  const reduce = useReducedMotion()
  const zoomed = usePinchZoomed()
  if (!LEDGER.entries.length) return null

  const reveal = (i = 0) => ({
    initial: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 24 },
    whileInView: { opacity: 1, y: 0 },
    animate: zoomed ? { opacity: 1, y: 0 } : undefined,
    viewport: { once: true, margin: '-60px' },
    transition: { ...SPRING, delay: reduce ? 0 : i * 0.05 },
  })

  return (
    <section aria-label="Recent live bookings" className="relative w-full px-[5vw] pb-[clamp(3rem,7vw,6rem)]">
      <div className="mx-auto max-w-[88rem]">
        <FolderCell
          peek
          label={LEDGER.label}
          gradient={['#E3B7C8', '#96385A']}
          bg={CARD_BG}
          reveal={reveal()}
          topGap="1.25rem"
          bloom={<CornerBloom from="rgba(176,74,118,0.10)" to="rgba(140,54,86,0.07)" />}
          contentClassName="px-6 pb-7 sm:px-8 sm:pb-8"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h3 className="font-sentient text-2xl tracking-[-0.02em] text-ink">
              {LEDGER.title[0]} <em>{LEDGER.title[1]}</em>
            </h3>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft">
              {LEDGER.note}
            </p>
          </div>

          {/* The register — ruled rows under a double head rule, with the
              claret margin line every hand-ruled ledger has. */}
          <div className="relative mt-6">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-[4.75rem] hidden w-px bg-[rgba(150,56,90,0.35)] sm:block"
            />
            <ul className="border-t-2 border-ink/70">
              {LEDGER.entries.map((e, i) => (
                <motion.li
                  key={`${e.date}-${e.names}`}
                  {...reveal(i)}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-line py-3.5 sm:grid-cols-[4rem_1fr_auto] sm:pl-0"
                >
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-ink-soft sm:pr-4">
                    {e.date}
                  </span>
                  <span className="col-span-2 sm:col-span-1 sm:pl-6">
                    <span className="font-sentient text-base tracking-[-0.01em] text-ink">{e.names}</span>
                    <span className="text-sm text-ink-soft">
                      {' '}· {e.event}
                      {e.venue ? `, ${e.venue}` : ''}
                    </span>
                  </span>
                  <span className="col-start-2 row-start-1 justify-self-end font-mono text-[0.62rem] uppercase tracking-[0.15em] text-rust sm:col-start-3">
                    {e.pieces}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </FolderCell>
      </div>
    </section>
  )
}
