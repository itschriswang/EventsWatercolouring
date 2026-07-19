import { motion, useReducedMotion } from 'framer-motion'
import { Drop } from './Label.jsx'
import { SPRING } from '../lib/site.js'
import { FAQ } from '../content.js'
import usePinchZoomed from '../hooks/usePinchZoom.js'

/**
 * The practical bits — every question answered plainly on the page, no
 * accordion to click through. Lives on its own /faq/ subpage (see
 * FaqPage.jsx, which also supplies the watercolour bloom this sits over,
 * and the label/title above this), so there's no scroll budget to protect
 * and no sidebar to share with other sections; showing every answer up
 * front in one reading column reads better here than a wall of collapsed
 * toggles would.
 *
 * Each card is a plain paper tile — opaque, grained, no colour of its own —
 * rather than the wash itself. The bloom only shows in the negative space
 * around and between the tiles, like paper cut-outs laid over a wet wash.
 */
export default function Faq() {
  const reduce = useReducedMotion()
  const zoomed = usePinchZoomed()

  return (
    <section id="faq" className="relative w-full px-[5vw] pt-[clamp(1rem,3vw,2rem)] pb-[clamp(5.5rem,11vw,10rem)]">
      <div className="relative z-10 max-w-3xl">
        <ul className="space-y-5 sm:space-y-6">
          {FAQ.items.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              animate={zoomed ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ ...SPRING, delay: reduce ? 0 : Math.min(i, 5) * 0.05 }}
              className="paper-grain relative overflow-hidden rounded-2xl border border-line/60 bg-paper shadow-[0_18px_36px_-24px_rgba(78,38,57,0.4)]"
            >
              <div className="relative z-10 flex items-start gap-4 px-6 py-5 sm:gap-5">
                <span
                  className="mt-0.5 shrink-0 rounded-full bg-paper-deep/80 p-2.5"
                  aria-hidden="true"
                >
                  <Drop className="h-4 w-auto" gradient={['#F2E982', '#BCB438']} />
                </span>
                <div>
                  {/* h2 (not h3): the questions are the FAQ page's top-level
                      content under its single h1 — h3 here skipped a level and
                      read as sub-items of nothing to a screen reader. Weight +
                      a lifted size floor make each question a clear scan anchor
                      in a long flat list. Utility classes only, three-font
                      voice unchanged. */}
                  <h2 className="font-body font-semibold text-[clamp(1.05rem,1.4vw,1.25rem)] tracking-[-0.01em] leading-snug text-ink">
                    {item.q}
                  </h2>
                  {/* Full ink-soft (5.49:1), not /85 (4.0:1, under AA); measure
                      capped so the answer holds a comfortable 65-75ch even on
                      the wide paper tile. */}
                  <p className="mt-2 max-w-[64ch] leading-relaxed text-ink-soft">
                    {item.a}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
