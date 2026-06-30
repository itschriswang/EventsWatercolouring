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
 * Props:
 *   from    — rgba() string for the warm/primary pigment (terracotta/ochre/rose)
 *   to      — rgba() string for the cool/secondary pigment (cornflower)
 *   overlay — if true, the bloom layer gets z-10 so it sits above image content
 *             rather than behind text content (default false)
 */
export default function CornerBloom({ from, to, overlay = false }) {
  return (
    <div
      aria-hidden="true"
      className={'pointer-events-none absolute inset-0' + (overlay ? ' z-10' : '')}
      style={{
        background:
          // Primary diagonal — stronger bloom
          `radial-gradient(circle at 110% 110%, ${from}, transparent 55%), ` +
          `radial-gradient(circle at -10% -10%, ${to},   transparent 50%), ` +
          // Secondary diagonal — softer, shorter reach
          `radial-gradient(circle at 110%  -10%, ${from}, transparent 42%), ` +
          `radial-gradient(circle at  -10% 110%, ${to},   transparent 42%)`,
        mixBlendMode: 'multiply',
        filter: 'blur(14px)',
      }}
    />
  )
}
