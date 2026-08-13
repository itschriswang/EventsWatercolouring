import { useHeavyFx } from '../hooks/useMediaQuery.js'
import { bloomStops, PIGMENTS, PAPER_DEEP } from '../lib/watercolour.js'

/**
 * CornerBloom — a soft watercolour bloom that feathers in from all four corners
 * of a card, framing the clean "unpainted paper" interior (negative space).
 *
 * Gradient centres are pushed *outside* the card bounds (-10% / 110%) so the
 * visible portion inside the card is only the soft, near-transparent outer
 * fringe of each radial gradient. The parent's overflow-hidden + rounded-*
 * clip therefore catches no hard circular edge — just imperceptible softness.
 *
 * Each corner is paint, not a colour: `from`/`to` name a pigment and how thick
 * the wash is, and bloomStops() supplies the colours that paint produces as it
 * thins (lib/watercolour.js). This one can't join BloomCanvas — it's a per-card
 * layer that multiplies into the card and sometimes sits over the artwork, and
 * the canvas is a single layer at a single z-index — so it gets the model
 * through CSS instead.
 *
 * Because the layer multiplies into the card ground, `from`/`to` must be
 * hue-adjacent on the palette arc (rose+lilac, apricot+butter,
 * butter+yellow-green…) — multiplying complements (e.g. yellow-green over
 * rose) averages into grey mud.
 *
 * Props:
 *   from    — [pigment, thickness] for the primary wash
 *   to      — [pigment, thickness] for the secondary wash
 *   overlay — if true, the bloom layer gets z-10 so it sits above image content
 *             rather than behind text content (default false)
 */
// The card ground these multiply into, so the stops are solved against what
// they actually sit on.
// Defensive like the rest of the effect layer: a bloom is decoration, and an
// unknown pigment should cost us the bloom, not the page.
const corner = (paint, extent) => {
  const [name, x] = Array.isArray(paint) ? paint : []
  if (!PIGMENTS[name]) {
    if (import.meta.env.DEV) console.warn('[CornerBloom] unknown pigment:', paint)
    return 'transparent, transparent'
  }
  return bloomStops(name, x, { over: PAPER_DEEP, extent })
}

export default function CornerBloom({ from, to, overlay = false }) {
  // The blur is desktop-only. A per-card blur(14px) + multiply forces the
  // whole card to render as an offscreen compositor group, and on iOS those
  // groups are the first thing WebKit sheds during a momentum-scroll re-raster
  // — entire gallery tiles pop out of existence for a few frames and pop
  // back. The gradients are already soft radials, so on touch/low-end devices
  // the blur is sub-perceptual anyway; the multiply pigment recipe stays.
  const heavy = useHeavyFx()
  return (
    <div
      aria-hidden="true"
      // zoom-mute: a blurred multiply layer the size of the card — in the
      // gallery it sits OVER the painting (`overlay`), and when a pinch-zoom
      // re-raster drops it the artwork beneath appears to vanish. The fringe
      // is imperceptible at zoom, so it sits the gesture out (see index.css).
      className={'zoom-mute pointer-events-none absolute inset-0' + (overlay ? ' z-10' : '')}
      style={{
        background:
          // Primary diagonal — stronger bloom
          `radial-gradient(circle at 110% 110%, ${corner(from, 0.55)}), ` +
          `radial-gradient(circle at -10% -10%, ${corner(to, 0.5)}), ` +
          // Secondary diagonal — softer, shorter reach
          `radial-gradient(circle at 110%  -10%, ${corner(from, 0.42)}), ` +
          `radial-gradient(circle at  -10% 110%, ${corner(to, 0.42)})`,
        mixBlendMode: 'multiply',
        ...(heavy ? { filter: 'blur(14px)' } : null),
      }}
    />
  )
}
