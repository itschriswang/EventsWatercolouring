import { useReducedMotion } from 'framer-motion'
import { SPRING } from '../lib/site.js'
import { FAQ } from '../content.js'
import FolderCell from './FolderCell.jsx'
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
 * The list is set as a card catalogue: each question is an index card cut
 * with the same tab silhouette as the homepage folders (FolderCell), the tab
 * carrying its running number as the index cut. Cards past the first stagger
 * a step to the right, like cards standing behind one another in a drawer.
 * Each card stays a plain paper tile — opaque, grained, no colour of its
 * own — so the bloom only shows in the negative space around the cards,
 * like paper cut-outs laid over a wet wash.
 */
export default function Faq() {
  const reduce = useReducedMotion()
  const zoomed = usePinchZoomed()

  const reveal = (i) => ({
    initial: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 20 },
    whileInView: { opacity: 1, y: 0 },
    animate: zoomed ? { opacity: 1, y: 0 } : undefined,
    viewport: { once: true, margin: '-60px' },
    transition: { ...SPRING, delay: reduce ? 0 : Math.min(i, 5) * 0.05 },
  })

  return (
    <section id="faq" className="relative w-full px-[5vw] pt-[clamp(1rem,3vw,2rem)] pb-[clamp(5.5rem,11vw,10rem)]">
      <div className="relative z-10 max-w-3xl">
        <ul className="space-y-4 sm:space-y-5">
          {FAQ.items.map((item, i) => (
            <FolderCell
              key={i}
              as="li"
              label={`Q.${String(i + 1).padStart(2, '0')}`}
              gradient={['#F2E982', '#BCB438']}
              bg="#F7F4EF"
              reveal={reveal(i)}
              topGap="0.15rem"
              // The drawer stagger — every second card steps right, so the
              // numbered tabs read as two offset index runs.
              wrapperClassName={i % 2 === 1 ? 'sm:ml-12' : ''}
              cellClassName="paper-grain"
              contentClassName="px-6 pb-5 sm:px-7"
            >
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
            </FolderCell>
          ))}
        </ul>
      </div>
    </section>
  )
}
