import { motion, useReducedMotion } from 'framer-motion'
import { SPRING } from '../lib/site.js'
import { FAQ } from '../content.js'
import FolderCell from './FolderCell.jsx'
import { Drop } from './Label.jsx'

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
 *
 * The questions are filed into drawers (FAQ.categories) rather than one flat
 * run, with a jump nav up top. Two things follow from that, both deliberate:
 *
 *  - Each drawer gets its OWN <ul>, which is what makes the pile behave. A
 *    sticky element only stays stuck while its containing block is on screen,
 *    so one shared list would have kept every card from every drawer parked at
 *    the top and fanned thirteen deep by the end. Per-drawer lists mean a
 *    drawer's pile releases as its own list scrolls past and the next drawer
 *    takes over the header — the stack stays four cards deep at most.
 *  - The stick offset and z-index count from the card's index WITHIN its
 *    drawer, so every drawer's pile starts fresh rather than inheriting the
 *    fan of everything above it.
 */

// A tighter drop-shadow than the homepage folders' big lift: when the cards
// stack ~11px apart near the header, the default 20px-offset/22px-blur shadow
// bleeds above each sliver and the halos compound into dark bands. This one
// hugs the card's bottom edge (offset ≈ blur, so almost no upward bleed) and
// runs at low opacity, so a pile of a dozen cards still reads as clean layered
// paper. Stays on the approved burgundy shadow tint (no grey).
const CARD_SHADOW =
  'drop-shadow(0 7px 8px rgba(126,40,72,0.15)) drop-shadow(0 1px 2px rgba(126,40,72,0.10))'

// The chartreuse pair the FAQ's tabs and eyebrow already use.
const TAB_GRADIENT = ['#F2E982', '#BCB438']

function FaqCard({ item, i, number, reduce }) {
  return (
    <motion.li
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ ...SPRING, delay: reduce ? 0 : Math.min(i, 5) * 0.04 }}
      // The stack: each card sticks a step lower than the one before and sits
      // a layer higher, so as they reach the header they pile onto one another
      // rather than scrolling away. Counted within the drawer (see above).
      // Dropped entirely under reduced motion.
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
        // Numbering runs across the whole page, not per drawer, so "Q.09" still
        // means the ninth question on the page and the tabs never repeat.
        label={`Q.${String(number).padStart(2, '0')}`}
        gradient={TAB_GRADIENT}
        bg="#F7F4EF"
        shadow={CARD_SHADOW}
        // More air between the tab band and the question than the tight
        // homepage folders — the FAQ card is a reading surface first.
        topGap="0.85rem"
        cellClassName="paper-grain"
        contentClassName="px-6 pb-6 sm:px-7 sm:pb-7"
      >
        {/* h3, under the drawer's h2, under the page's single h1. (This was an
            h2 while the list was flat and the questions were the page's only
            content level; the drawer headings now occupy that rung.) Weight +
            a lifted size floor make each question a clear scan anchor in a
            long list. Utility classes only, three-font voice unchanged. */}
        <h3 className="font-body font-semibold text-[clamp(1.05rem,1.4vw,1.25rem)] tracking-[-0.01em] leading-snug text-ink">
          {item.q}
        </h3>
        {/* Full ink-soft (5.49:1), not /85 (4.0:1, under AA); measure capped
            so the answer holds a comfortable 65-75ch even on the wide tile. */}
        <p className="mt-2 max-w-[64ch] leading-relaxed text-ink-soft">
          {item.a}
        </p>
      </FolderCell>
    </motion.li>
  )
}

/** The row of drawer names up top — an offer to skip ahead, in the site's
 *  pill language rather than a tab bar. Plain anchors, so it works before
 *  hydration and a middle-click still opens the section. */
function JumpNav({ reduce }) {
  return (
    <motion.nav
      aria-label="Question categories"
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={SPRING}
      className="mx-auto mb-[clamp(2.5rem,6vw,4rem)] max-w-3xl"
    >
      <span className="eyebrow">{FAQ.jumpLabel}</span>
      <ul className="mt-3 flex flex-wrap gap-2">
        {FAQ.categories.map((c) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              className="inline-flex rounded-full border border-line bg-paper/60 px-3.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft outline-none transition-colors duration-300 hover:border-terracotta hover:text-terracotta focus-visible:border-terracotta focus-visible:text-terracotta"
            >
              {c.label}
            </a>
          </li>
        ))}
      </ul>
    </motion.nav>
  )
}

export default function Faq() {
  const reduce = useReducedMotion()
  // Question numbers run continuously across the drawers, so the tab cuts read
  // as one catalogue rather than four restarting at Q.01.
  let n = 0

  return (
    <section id="faq" className="relative w-full px-[5vw] pt-[clamp(1rem,3vw,2rem)] pb-[clamp(5.5rem,11vw,10rem)]">
      <div className="relative z-10">
        <JumpNav reduce={reduce} />

        {FAQ.categories.map((cat) => (
          // Its own <ul> per drawer is load-bearing for the stack — see the
          // component docblock.
          //
          // The `!` on scroll-mt is doing real work, not decoration. index.css
          // sets `section[id] { scroll-margin-top: 3.5rem }` for every anchored
          // section, and that selector (0,1,1) outranks a plain utility class
          // (0,1,0) whatever the source order — so an unprefixed `scroll-mt-*`
          // here computes to 56px and silently loses. The desktop header is
          // 64px, so a jump would have parked each drawer heading BEHIND it.
          // These land it clear of the header, and clear of where the card pile
          // parks (--faq-stick).
          <section
            key={cat.id}
            id={cat.id}
            aria-labelledby={`${cat.id}-head`}
            className="mx-auto max-w-3xl !scroll-mt-20 md:!scroll-mt-28"
          >
            {/* The drawer divider: the site's orchid, the drawer's name in the
                eyebrow voice, and a hairline running out to the margin. */}
            <motion.h2
              id={`${cat.id}-head`}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={SPRING}
              className="eyebrow mb-7 flex items-center gap-3 sm:mb-8"
            >
              <Drop className="h-4 w-auto shrink-0" gradient={TAB_GRADIENT} />
              {cat.label}
              <span className="h-px flex-1 bg-line" aria-hidden="true" />
            </motion.h2>

            <ul className="mb-[clamp(3.5rem,8vw,6rem)] [--faq-step:0.7rem] [--faq-stick:1.25rem] md:[--faq-stick:4.75rem]">
              {cat.items.map((item, i) => {
                n += 1
                return (
                  <FaqCard key={item.q} item={item} i={i} number={n} reduce={reduce} />
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </section>
  )
}
