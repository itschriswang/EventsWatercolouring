import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { SECTIONS } from '../content.js'
import { glaze } from '../lib/watercolour.js'

const rgbHex = (r) =>
  '#' +
  r.map((c) => Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16).padStart(2, '0')).join('')

/* -------------------------------------------------------------------------- *
 * How much paint is in a pan
 * -------------------------------------------------------------------------- */

// A dried pan carries this much pigment. Everything below is solved against it
// so that wet and dry hold the SAME load — a wash redistributes its pigment, it
// never adds any (the rule the static CSS blooms were solved to as well).
const X_DRY = 0.55

// A wet wash drags pigment to its leading contact line as it sits (§4.3.3),
// which is the single effect that stops a wash reading as an airbrushed
// gradient. The rim runs 1.9x the body's thickness; the body is then whatever
// keeps the area-weighted mean at X_DRY:
//
//   mean = 0.62·xb + 0.38·(xb + 1.9·xb)/2 = 1.171·xb  ==  X_DRY
//   →  xb = 0.470,  xr = 0.892   (mean 0.550 ✓)
//
// Emitted and checked rather than assumed, because this is exactly where the
// model has silently rendered as nothing before: the rim lands 40–56/255 off
// the body and the body 54–88/255 off paper, so both reads are plainly visible
// at a 9px pan rather than being two levels of rounding.
const RIM = 1.9
const X_BODY = X_DRY / (0.62 + (0.38 * (1 + RIM)) / 2)
const X_RIM = X_BODY * RIM

// Precomputed once at module scope: five pigments × three thicknesses is a
// fixed, tiny table, and running Kubelka-Munk per frame for a scroll indicator
// would be absurd.
const PAINT = Object.fromEntries(
  SECTIONS.map((s) => [
    s.id,
    {
      dry: rgbHex(glaze([[s.pigment, X_DRY]])),
      // The rim sits at the RIGHT edge and the whole fill is scaled from its
      // left origin, so the rim travels with the wet edge exactly as a contact
      // line does — it is the leading edge, not a decoration pinned to a box.
      wet: `linear-gradient(to right, ${rgbHex(glaze([[s.pigment, X_BODY]]))} 0%, ${rgbHex(
        glaze([[s.pigment, X_BODY]])
      )} 62%, ${rgbHex(glaze([[s.pigment, X_RIM]]))} 100%)`,
    },
  ])
)

/**
 * The page as a paint palette.
 *
 * The chapter marker used to end in an abstract meter — a tinted rule filling
 * left to right. It reported one number (how far through this chapter) and it
 * could have belonged to any website.
 *
 * This reports four, and could only belong to this one. Five pans, one per
 * chapter, in the order the page runs. Chapters already read hold a dried
 * wash; the chapter being read is WET, filling as you scroll, with pigment
 * dragged to its leading edge; chapters ahead are unpainted paper. So a glance
 * gives the whole structure of the page, which chapter you are in, how far
 * through it you are, and how much is left — the things a 12.7-screen phone
 * page never says, in the material the page is actually about.
 *
 * Each pan is as wide as its chapter is long. The palette is a map of the
 * document, not a five-step progress dots row: the gallery's pan is visibly
 * the big one, the painter's visibly short. `flexGrow` carries it, so the
 * proportions come straight from measured layout with no pixel arithmetic and
 * survive any reflow.
 *
 * And the paint is real paint. Each pan's colour is its pigment run through
 * the Kubelka-Munk model at a thickness (see PAINT above), not a hex chosen to
 * look like watercolour — the same treatment every wash on the page gets. The
 * wet pan is the same load as the dry one, moved toward the rim.
 *
 * Not interactive, deliberately. Five pans across ~92px is 14px each, well
 * under the 44px touch target these would need to be honest controls, and the
 * dock already navigates. It is an indicator, and `aria-hidden` because the
 * headings and the dock carry the semantics.
 */
export default function ChapterPalette({ index, scaleX }) {
  // Pan widths track each chapter's real scroll length. Measured rather than
  // declared, so adding a section or rewriting one's copy re-proportions the
  // palette on its own.
  const [spans, setSpans] = useState(() => SECTIONS.map(() => 1))

  useEffect(() => {
    const measure = () =>
      setSpans(SECTIONS.map((s) => document.getElementById(s.id)?.offsetHeight || 1))
    measure()
    window.addEventListener('resize', measure)
    // Webfonts and lazy art both change section heights after first paint.
    if (document.fonts?.ready) document.fonts.ready.then(measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    // ml-auto: pinned to the bar's right edge rather than trailing the chapter
    // name, so the pans keep a fixed edge to read against instead of sliding
    // every time a longer or shorter name swaps in — and so they hold still
    // during the beat where the outgoing name has unmounted and the incoming
    // one has not arrived.
    <div
      aria-hidden="true"
      className="ml-auto flex h-[9px] w-[92px] shrink-0 items-stretch gap-[3px]"
    >
      {SECTIONS.map((s, i) => (
        <span
          key={s.id}
          style={{ flexGrow: spans[i], flexBasis: 0 }}
          className="relative overflow-hidden rounded-[2px] ring-1 ring-inset ring-line"
        >
          {i < index && (
            <span className="absolute inset-0" style={{ background: PAINT[s.id].dry }} />
          )}
          {i === index && (
            <motion.span
              className="absolute inset-0 origin-left"
              style={{ scaleX, background: PAINT[s.id].wet }}
            />
          )}
        </span>
      ))}
    </div>
  )
}
