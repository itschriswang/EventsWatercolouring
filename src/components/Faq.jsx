import { motion, useReducedMotion } from 'framer-motion'
import { SPRING } from '../lib/site.js'
import { FAQ } from '../content.js'
import FolderCell from './FolderCell.jsx'

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
 * carrying its running number as the index cut. The pile is graded down the
 * page: the cards near the top overlap — filed tight onto the stack — and the
 * spacing fans open into clear gaps toward the bottom, so the top of the page
 * reads as a settled stack and the newest questions have room to breathe. As
 * each card scrolls into view it drops onto the stack with a slight 3D hinge
 * (rotateX about its top edge, under a shared `perspective`) rather than a
 * flat slide. Each card stays a plain paper tile — opaque, grained, no colour
 * of its own — so the bloom only shows in the negative space around the
 * cards. Reduced-motion visitors get the graded stack with no hinge.
 */

// The spacing grade, in px: cards near the top of the list lap up over the one
// above (negative margin = overlap), easing to a clear gap by the bottom.
const OVERLAP = -16
const GAP = 44

function FaqCard({ item, i, marginTop, reduce }) {
  // The 3D drop: tilted back on its top edge and a little low, settling flat
  // onto the pile. Transform-only, so it composites cheaply; `once` so a filed
  // card never un-files on a scroll back up.
  const settled = { opacity: 1, y: 0, rotateX: 0 }
  return (
    <motion.li
      initial={reduce ? settled : { opacity: 0, y: 26, rotateX: -16 }}
      whileInView={settled}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ ...SPRING, delay: reduce ? 0 : Math.min(i, 5) * 0.04 }}
      style={{ marginTop }}
      className="origin-top will-change-transform"
    >
      <FolderCell
        as="div"
        label={`Q.${String(i + 1).padStart(2, '0')}`}
        gradient={['#F2E982', '#BCB438']}
        bg="#F7F4EF"
        // More air between the tab band and the question than the tight
        // homepage folders — the FAQ card is a reading surface first.
        topGap="0.85rem"
        cellClassName="paper-grain"
        contentClassName="px-6 pb-6 sm:px-7 sm:pb-7"
      >
        {/* h2 (not h3): the questions are the FAQ page's top-level content
            under its single h1 — h3 here skipped a level and read as
            sub-items of nothing to a screen reader. Weight + a lifted size
            floor make each question a clear scan anchor in a long flat list.
            Utility classes only, three-font voice unchanged. */}
        <h2 className="font-body font-semibold text-[clamp(1.05rem,1.4vw,1.25rem)] tracking-[-0.01em] leading-snug text-ink">
          {item.q}
        </h2>
        {/* Full ink-soft (5.49:1), not /85 (4.0:1, under AA); measure capped
            so the answer holds a comfortable 65-75ch even on the wide tile. */}
        <p className="mt-2 max-w-[64ch] leading-relaxed text-ink-soft">
          {item.a}
        </p>
      </FolderCell>
    </motion.li>
  )
}

export default function Faq() {
  const reduce = useReducedMotion()
  const n = FAQ.items.length

  return (
    <section id="faq" className="relative w-full px-[5vw] pt-[clamp(1rem,3vw,2rem)] pb-[clamp(5.5rem,11vw,10rem)]">
      {/* `perspective` on the list is what makes each card's rotateX read as a
          real hinge in depth rather than a squash; it lives here, above the
          per-card transforms, so all the cards share one vanishing point. */}
      <ul className="relative z-10 mx-auto max-w-3xl [perspective:1600px]">
        {FAQ.items.map((item, i) => {
          // First card flush; the rest grade from OVERLAP (top of the page) to
          // GAP (bottom), so the stack tightens upward and opens downward.
          const t = n > 2 ? (i - 1) / (n - 2) : 1
          const marginTop = i === 0 ? 0 : Math.round(OVERLAP + t * (GAP - OVERLAP))
          return (
            <FaqCard key={i} item={item} i={i} marginTop={marginTop} reduce={reduce} />
          )
        })}
      </ul>
    </section>
  )
}
