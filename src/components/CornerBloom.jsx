import { useHeavyFx } from '../hooks/useMediaQuery.js'

/**
 * CornerBloom — a soft watercolour bloom that feathers in from all four corners
 * of a card, framing the clean "unpainted paper" interior (negative space).
 *
 * Gradient centres are pushed *outside* the card bounds (-10% / 110%) so the
 * visible portion inside the card is only the soft, near-transparent outer
 * fringe of each radial gradient. The parent's overflow-hidden + rounded-*
 * clip therefore catches no hard circular edge — just imperceptible softness.
 *
 * Mirrors the pigment recipe used in BloomField (radial-gradient + multiply).
 *
 * Because the layer multiplies into the card ground, `from`/`to` must be
 * hue-adjacent on the palette arc (rose+lilac, apricot+butter,
 * butter+yellow-green…) — multiplying complements (e.g. yellow-green over
 * rose) averages into grey mud.
 *
 * Props:
 *   from    — rgba() string for the primary pigment (candy rose/apricot/butter)
 *   to      — rgba() string for the secondary pigment (lilac/periwinkle/yellow-green)
 *   overlay — if true, the bloom layer gets z-10 so it sits above image content
 *             rather than behind text content (default false)
 */
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
          `radial-gradient(circle at 110% 110%, ${from}, transparent 55%), ` +
          `radial-gradient(circle at -10% -10%, ${to},   transparent 50%), ` +
          // Secondary diagonal — softer, shorter reach
          `radial-gradient(circle at 110%  -10%, ${from}, transparent 42%), ` +
          `radial-gradient(circle at  -10% 110%, ${to},   transparent 42%)`,
        mixBlendMode: 'multiply',
        ...(heavy ? { filter: 'blur(14px)' } : null),
      }}
    />
  )
}
