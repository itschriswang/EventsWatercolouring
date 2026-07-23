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
 * carrying its running number as the index cut. The cards flow with easy,
 * airy gaps while you read, then FILE THEMSELVES as you scroll: each card is
 * `position: sticky`, so once it reaches the top of the page it parks just
 * below the header and the next card slides up and stacks over it — the
 * questions you've passed pile into a fanned stack near the header while the
 * one you're reading sits full below. Successive stick points step down a
 * touch (`--faq-step`) and z-index rises with the index, so the pile fans
 * cleanly with the newest card on top. Each card stays a plain paper tile —
 * opaque, grained, no colour of its own — so the bloom only shows in the
 * negative space around the cards. Reduced-motion visitors get the plain
 * gapped list with no stacking (sticky, and the entrance, are both dropped).
 */

// A tighter drop-shadow than the homepage folders' big lift: when the cards
// stack ~11px apart near the header, the default 20px-offset/22px-blur shadow
// bleeds above each sliver and the halos compound into dark bands. This one
// hugs the card's bottom edge (offset ≈ blur, so almost no upward bleed) and
// runs at low opacity, so a pile of a dozen cards still reads as clean layered
// paper. Stays on the approved burgundy shadow tint (no grey).
const CARD_SHADOW =
  'drop-shadow(0 7px 8px rgba(126,40,72,0.15)) drop-shadow(0 1px 2px rgba(126,40,72,0.10))'

function FaqCard({ item, i, reduce }) {
  return (
    <motion.li
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ ...SPRING, delay: reduce ? 0 : Math.min(i, 5) * 0.04 }}
      // The stack: each card sticks a step lower than the one before and sits
      // a layer higher, so as they reach the header they pile onto one another
      // rather than scrolling away. Dropped entirely under reduced motion.
      style={
        reduce
          ? undefined
          : {
              position: 'sticky',
              top: `calc(var(--faq-stick) + ${i} * var(--faq-step))`,
              zIndex: i + 1,
            }
      }
      // Airy gap between cards while reading — this is the resting spacing the
      // stack eats into as the cards climb toward the header.
      className={i > 0 ? 'mt-10 sm:mt-12' : ''}
    >
      <FolderCell
        as="div"
        label={`Q.${String(i + 1).padStart(2, '0')}`}
        gradient={['#F2E982', '#BCB438']}
        bg="#F7F4EF"
        shadow={CARD_SHADOW}
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

  return (
    <section id="faq" className="relative w-full px-[5vw] pt-[clamp(1rem,3vw,2rem)] pb-[clamp(5.5rem,11vw,10rem)]">
      {/* `--faq-stick` is where the pile parks: clear of the sticky header on
          desktop, near the top on mobile (no top header there). `--faq-step`
          is how far each successive card parks below the last, fanning the
          stack instead of burying it flush. */}
      <ul className="relative z-10 mx-auto max-w-3xl [--faq-step:0.7rem] [--faq-stick:1.25rem] md:[--faq-stick:4.75rem]">
        {FAQ.items.map((item, i) => (
          <FaqCard key={i} item={item} i={i} reduce={reduce} />
        ))}
      </ul>
    </section>
  )
}
