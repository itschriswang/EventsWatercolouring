import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
import { Drop } from './Label.jsx'
import ChapterPalette from './ChapterPalette.jsx'
import useCurrentSection from '../hooks/useCurrentSection.js'
import useMediaQuery from '../hooks/useMediaQuery.js'
import { SECTIONS } from '../content.js'

const EASE = [0.25, 1, 0.5, 1]

/**
 * The chapter you are reading, pinned to the top of a phone screen.
 *
 * WHY THIS EXISTS, rather than "make the mobile h2 bigger".
 *
 * On desktop this page carries its hierarchy in width and position: the
 * section title owns a wide column, cards sit in a 12-track grid, a folder tab
 * jogs out of its card, notes hang right. Every one of those collapses at the
 * `lg` breakpoint — on a phone a section title, a card heading and a body
 * paragraph are all the same full-bleed, left-aligned, 5vw-guttered block. So
 * type size is the only hierarchy channel left, and it is exactly the channel
 * that compresses hardest: measured on the built page, the h2 is 2.4x the
 * largest h3 at 1440px and only 1.33x at 390px. The display face scales down
 * (57.6 → 32px) while the card headings do not move at all (24px on both), so
 * the gap closes from both ends at once.
 *
 * No amount of retuning that ratio fixes it — 32px of a heavy display face
 * already wraps to three lines on a 390px screen, and the h3s cannot shrink
 * far before they collide with the 16px body. The way out is to stop asking
 * size to carry the distinction and add a channel that has nothing to do with
 * size: CONTEXT. If the chapter you are inside is named on screen the whole
 * time you are inside it, then a heading below it is self-evidently a heading
 * *within* that chapter. The reader never has to judge whether 32px is
 * meaningfully larger than 24px, because the page is telling them which level
 * they are at, continuously. Desktop needs none of this — it still has width.
 *
 * The other half of the same problem is distance. The homepage runs 12.7
 * screens on a phone against 10.2 on a desktop, and a section announces itself
 * exactly once, in a title that is gone within a swipe or two. Between those
 * announcements there was nothing.
 *
 * WHAT SITS ON THE RIGHT IS A PAINT PALETTE, not a progress bar. An earlier
 * version filled this bar's own bottom rule as a meter — economical, but it
 * reported a single number and could have belonged to any site. ChapterPalette
 * reports the page's whole structure, which chapter you are in, how far
 * through it you are and how much is left, with each pan as wide as its
 * chapter is long and painted in real pigment run through the Kubelka-Munk
 * model. See that file. (The rule itself is gone with the band it belonged to;
 * the pill's rim is the edge now.)
 *
 * It is `aria-hidden`: a visual echo of headings that are already in the
 * document, next to a dock that already carries the navigation semantics.
 * Announcing it again would just make a screen reader read every section name
 * twice.
 */
export default function ChapterBar() {
  const reduce = useReducedMotion()
  const current = useCurrentSection()
  // Pointer, not width, exactly as MobileNav gates its own ground: a narrow
  // desktop window gets this band too and blurs it happily. What the ground
  // keys off is the touch device, which is where the flashing lives.
  const touch = useMediaQuery('(pointer: coarse)')

  // A motion value, not state: this updates on every scroll frame, and a
  // setState here would re-render the bar (and re-run the label's exit/enter
  // animation bookkeeping) sixty times a second for a 2px rule.
  const progress = useMotionValue(0)
  // Springed for the same reason ScrollProgress springs: the raw value steps
  // with the scroll thread and reads as a stutter. Under reduced motion the
  // raw value is used directly — the bar still reports position, it just
  // stops easing toward it.
  const springed = useSpring(progress, { stiffness: 150, damping: 30, restDelta: 0.001 })
  const scaleX = reduce ? progress : springed

  useEffect(() => {
    if (!current) return
    const el = document.getElementById(current.id)
    if (!el) return

    let raf = 0
    // The first reading after a chapter change is a teleport, not a movement:
    // you leave one chapter near 1 and arrive in the next near 0, and letting
    // the spring travel that would drain the new pan from full every time you
    // cross a boundary. Jump the spring onto the first value, then let it ease
    // for the rest of the chapter.
    let arriving = true
    const measure = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      // How far the top of the viewport has travelled into this section,
      // over the distance it can travel before the section's end is on
      // screen. Sections shorter than the viewport have nowhere to travel,
      // so the span floors at 1 and the pan simply sits full.
      const travelled = -r.top
      const span = Math.max(1, r.height - window.innerHeight)
      const v = Math.min(1, Math.max(0, travelled / span))
      progress.set(v)
      if (arriving) {
        springed.jump?.(v)
        arriving = false
      }
    }

    // Coalesce to one measurement per frame — scroll fires far more often
    // than the page can paint, and this reads layout.
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [current, progress, springed])

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          aria-hidden="true"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -44 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -44 }}
          transition={{ duration: 0.34, ease: EASE }}
          // md:hidden — above this breakpoint SiteHeader is on screen and
          // already carries the section's name beside the wordmark. Two
          // running heads would just disagree with each other.
          //
          // IT IS A FLOATING PILL ON THE PAGE'S OWN GUTTER, not a full-bleed
          // band pinned to y=0. The band was the wrong object here in three
          // ways at once. It read as browser chrome, because a tinted strip
          // with a hairline under it, hard against the status bar, is exactly
          // what a phone browser's own toolbar looks like — so the page
          // appeared to have two of them. It disagreed with the dock, the only
          // other chrome a phone gets, which floats in its own air with a rim
          // and a lift. And a band's whole contract is that its edge IS the top
          // of the screen, which iOS breaks routinely: `position: fixed`
          // anchors to the layout viewport, so as soon as the visual one slides
          // under it a sliver of page shows above the band and reads as a bug.
          // A pill that already floats has no such contract to break — page
          // passing beside it is the same thing the dock has always done at the
          // other end of the screen.
          //
          // `viewport-fit=cover` is set site-wide, so the top inset is ours to
          // clear rather than the browser's.
          className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-[5vw] md:hidden"
          style={{ paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))' }}
        >
          {/* Full gutter width rather than hugging the name the way the dock
              hugs its tabs: the palette is read against a fixed right edge (see
              ChapterPalette), and a pill that resized itself on every chapter
              change would take that away. The cap only bites between about 620
              and 767px, the sliver of tablet width that is still below `md`,
              where a full-gutter capsule would stretch to 690px of mostly air.
              A phone never reaches it, so the gutter is the width there.

              zoom-flat: backdrop blur on fixed chrome flickers white while
              pinch-zoomed; the translucent paper ground stays, only the blur
              drops (see index.css). On a touch device an ordinary scroll asks
              the GPU for that same re-raster, so it stays in the flat ground
              for good — the dock's trade, made here for the dock's reason, and
              the ground firms up to carry the label contrast the blur had. */}
          <div
            className="zoom-flat relative flex h-[34px] w-full max-w-[560px] items-center gap-3 overflow-hidden rounded-full pl-3.5 pr-3"
            style={{
              background: `rgb(var(--rgb-paper) / ${touch ? 0.93 : 0.72})`,
              ...(touch
                ? null
                : {
                    backdropFilter: 'blur(20px) saturate(1.15)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.15)',
                  }),
              border: '1px solid rgb(var(--rgb-line) / 0.56)',
              // The dock's pair: ink lift, paper-tone inset glint. No neutral
              // grey or white, per the site's shadow rule.
              boxShadow:
                '0 8px 32px rgba(78,38,57,0.21), 0 0 0 1px rgba(247,244,239,0.55) inset',
            }}
          >
            {/* Keyed on the section, so crossing a chapter boundary swaps the
                name. `mode="wait"` here, unlike the copy button's swap: these
                are different words of different lengths sharing one slot, and
                crossfading them in place would overlap two labels into an
                unreadable smear. A beat of empty bar reads as a page turn. */}
            <AnimatePresence mode="wait">
              <motion.span
                key={current.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -7 }}
                transition={{ duration: 0.16, ease: EASE }}
                className="flex min-w-0 items-center gap-2"
              >
                <Drop className="h-3.5 w-auto shrink-0" gradient={current.gradient} />
                <span className="truncate font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink">
                  {current.label}
                </span>
              </motion.span>
            </AnimatePresence>

            <ChapterPalette
              index={SECTIONS.findIndex((s) => s.id === current.id)}
              scaleX={scaleX}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
