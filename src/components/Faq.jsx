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
 * carrying its running number as the index cut. The cards pile as you scroll:
 * each folder overlaps the tail of the one above it, and drops onto the stack
 * with a slight 3D hinge (rotateX about its top edge, under a shared
 * `perspective`) rather than a flat slide — so scrolling reads as filing one
 * card on top of the next. Each card stays a plain paper tile — opaque,
 * grained, no colour of its own — so the bloom only shows in the negative
 * space around the cards, like paper cut-outs laid over a wet wash.
 * Reduced-motion visitors get the resting stack with no hinge.
 */
export default function Faq() {
  const reduce = useReducedMotion()
  const zoomed = usePinchZoomed()

  // The 3D drop: the card starts tilted back on its top edge and a little
  // low, then settles flat onto the pile. Transform-only, so it composites
  // cheaply; `once` so a filed card never un-files on a scroll back up.
  const settled = { opacity: 1, y: 0, rotateX: 0 }
  const reveal = (i) => ({
    initial: reduce ? settled : { opacity: 0, y: 30, rotateX: -18 },
    whileInView: settled,
    animate: zoomed ? settled : undefined,
    viewport: { once: true, margin: '-80px' },
    transition: { ...SPRING, delay: reduce ? 0 : Math.min(i, 5) * 0.04 },
  })

  return (
    <section id="faq" className="relative w-full px-[5vw] pt-[clamp(1rem,3vw,2rem)] pb-[clamp(5.5rem,11vw,10rem)]">
      {/* `perspective` on the list is what makes each card's rotateX read as a
          real hinge in depth rather than a squash; it lives here, above the
          per-card transforms, so all the cards share one vanishing point. */}
      <ul className="relative z-10 mx-auto max-w-3xl [perspective:1600px]">
        {FAQ.items.map((item, i) => (
          <FolderCell
            key={i}
            as="li"
            label={`Q.${String(i + 1).padStart(2, '0')}`}
            gradient={['#F2E982', '#BCB438']}
            bg="#F7F4EF"
            reveal={reveal(i)}
            // More air between the tab band and the question than the tight
            // homepage folders — the FAQ card is a reading surface first.
            topGap="0.85rem"
            // The pile: every card but the first laps up over the tail of the
            // one above (into its bottom padding, so no answer text is
            // covered), and each hinges about its own top edge. Later cards
            // sit on top by DOM order, so the newest question crowns the stack.
            wrapperClassName={
              'origin-top will-change-transform ' + (i > 0 ? '-mt-3 sm:-mt-4' : '')
            }
            cellClassName="paper-grain"
            contentClassName="px-6 pb-6 sm:px-7 sm:pb-7"
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
    </section>
  )
}
