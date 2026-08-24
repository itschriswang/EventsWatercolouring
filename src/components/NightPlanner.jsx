import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import CornerBloom from './CornerBloom.jsx'
import GlassPill from './GlassPill.jsx'
import FolderCell from './FolderCell.jsx'
import { SPRING, ENQUIRE_HREF, CARD_BG, REVEAL_VIEWPORT } from '../lib/site.js'
import { PACKAGES } from '../content.js'
import { withUnderline } from './Underline.jsx'
import usePinchZoomed from '../hooks/usePinchZoom.js'

// Full-arc pigment pairs for the little keepsake thumbnails — cycled so the
// grid reads as a spread of different paintings across the whole palette
// (warm apricot/orange through chartreuse, periwinkle, lilac, blush and rose),
// that lowkey-rainbow vibe rather than one repeated hue. The oranges/warms
// stay here on purpose: these swatches stand in for real paintings, so they
// keep the pastel arc's full range, not just the site's deep anchors. Each
// pair is two arc-neighbours so a single swatch never muddies — the rainbow
// lives across the grid, not inside one card.
const THUMB_TINTS = [
  ['rgba(247,178,120,0.55)', 'rgba(232,155,99,0.38)'], // apricot → orange
  ['rgba(232,155,99,0.5)', 'rgba(240,224,138,0.4)'],   // orange → butter
  ['rgba(214,224,120,0.52)', 'rgba(138,145,67,0.35)'], // chartreuse → sage
  ['rgba(184,192,230,0.5)', 'rgba(200,172,226,0.38)'], // periwinkle → lilac
  ['rgba(210,182,230,0.5)', 'rgba(242,194,207,0.4)'],  // lilac → blush
  ['rgba(242,194,207,0.55)', 'rgba(193,96,140,0.35)'], // blush → rose
  ['rgba(176,74,118,0.5)', 'rgba(192,85,154,0.32)'],   // candy rose → magenta
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
  const zoomed = usePinchZoomed()
  const p = PACKAGES.planner
  const [hours, setHours] = useState(3)

  const pieces = PIECES_PER_HOUR * hours
  const covers = pieces * GUESTS_PER_PIECE

  const reveal = {
    // Reduced-motion resting state is visible (see CorporatePage rise()).
    initial: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 36 },
    whileInView: { opacity: 1, y: 0 },
    animate: zoomed ? { opacity: 1, y: 0 } : undefined,
    viewport: REVEAL_VIEWPORT,
    transition: SPRING,
  }

  return (
    <FolderCell
      peek
      label="Plan the night"
      gradient={['#B04A76', '#8C3656']}
      bg={CARD_BG}
      reveal={reveal}
      topGap="1.5rem"
      wrapperClassName="mt-[clamp(2.5rem,6vw,4rem)]"
      bloom={<CornerBloom from={['blush', 0.311]} to={['blush', 0.255]} />}
      contentClassName="grid grid-cols-1 gap-8 px-7 pb-7 sm:px-8 sm:pb-8 lg:grid-cols-2 lg:gap-12"
    >
        {/* Controls */}
        <div>
          <h3 className="card-title">{p.title}</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
            {withUnderline(p.lede, '8 pieces an hour', { className: 'text-terracotta' })}
          </p>

          {/* Three mutually exclusive answers, so: real radios under the pill
              styling, the same conversion the reply card's package chips got.
              A row of `aria-pressed` toggles says "three independent switches,
              any number of them on" to a screen reader, and gives a keyboard
              visitor three tab stops with no arrow keys; a radio group is one
              stop with ← / → walking the options, which is also what someone
              who has used any other set of options on the web expects. */}
          <fieldset className="mt-7 border-0 p-0">
            {/* `leading-6` is restoring, not choosing. This label was an inline
                <span>, so it sat in a line box struck at the block's own 24px
                leading; a <legend> is a block box and takes only its own 15px,
                which pulled the label 9px down onto the pills. Spelling the old
                strut back keeps the conversion invisible in the layout. */}
            <legend className="font-mono text-[0.62rem] uppercase leading-6 tracking-[0.2em] text-ink-soft">
              {p.hoursLabel}
            </legend>
            <div className="mt-3 flex gap-2.5">
              {HOURS.map((h) => (
                <label
                  key={h}
                  className="relative cursor-pointer rounded-full has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-terracotta has-[:focus-visible]:ring-offset-2"
                >
                  <input
                    type="radio"
                    name="planner-hours"
                    value={h}
                    checked={hours === h}
                    onChange={() => setHours(h)}
                    className="sr-only"
                  />
                  {hours === h ? (
                    <span className="btn-aurora inline-flex min-h-[44px] items-center rounded-full px-4 py-1.5 font-mono text-sm">
                      <span className="btn-aurora-label">{h}</span>
                    </span>
                  ) : (
                    // Unselected hours read as a plain pill without a border,
                    // easy to miss as choosable — a slowly rotating aurora ring
                    // (the hero action-surface's own hues) gives every option a
                    // visible, "press me" outline rather than only the selected
                    // one standing out. `.gradient-frame`'s mask hides its own
                    // content box, so the ring has to live on a separate, empty
                    // layer — putting the mask on the pill itself masked the
                    // number right along with it. That layer is outset a hair
                    // beyond the pill (not inset-0) so the pill's opaque fill,
                    // which is exactly the label's own box, doesn't paint
                    // straight over the ring.
                    <>
                      <span
                        aria-hidden="true"
                        className="gradient-frame absolute -inset-[1.5px] rounded-full p-[1.5px]"
                      />
                      <GlassPill
                        opaque
                        className="relative inline-flex min-h-[44px] items-center justify-center px-4 py-1.5 font-mono text-sm text-ink-soft transition-colors duration-300 hover:text-ink"
                      >
                        {h}
                      </GlassPill>
                    </>
                  )}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* The arithmetic */}
        <div className="flex flex-col justify-center border-t border-line/60 pt-7 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
          {/* Choosing an hour rewrites two numbers a column away — silently, for
              anyone not watching that column. The whole point of the planner is
              the answer, so it gets spoken as one sentence rather than left to
              live regions on the fragments: the count and the coverage arrive
              together, the way they read on screen. Visually hidden, because the
              sighted cue is the figures themselves. */}
          <p className="sr-only" role="status">
            {`${hours} hours: ${pieces} ${p.piecesUnit}. ${p.coversUnit} ${covers} ${p.coversTail}.`}
          </p>
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
                  className="relative h-7 w-5 overflow-hidden rounded-[3px] border border-line bg-paper shadow-[0_2px_6px_-2px_rgba(126,40,72,0.35)]"
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
              visitor has already done their maths; don't make them retype it.
              The readout's own numbers ride along rather than being re-derived
              at the other end, so the card reads back exactly what was on
              screen when the button was pressed. */}
          <a
            href={ENQUIRE_HREF}
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('ew:planner-enquire', { detail: { hours, pieces } }),
              )
            }
            className="group btn-hero-flow mt-6 inline-flex w-fit items-center gap-2.5 rounded-full px-5 py-2.5 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-ink"
          >
            <span className="relative z-10">{p.cta}</span>
            <span aria-hidden="true" className="relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1">
              →
            </span>
          </a>
        </div>
    </FolderCell>
  )
}
