import { useId } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'

/**
 * A liquid-glass edge for a content card: the border itself refracts (an SVG
 * stroke run through feTurbulence/feDisplacementMap — the same wick-
 * distortion primitive GlassPill uses) plus a chromatic-aberration hairline
 * where the "glass" bends light.
 *
 * Deliberately doesn't touch the card's interior fill. `CARD_BG` (site.js)
 * already tried a pastel tint across a whole card and rejected it — "cards
 * barely separated from their surroundings... all read as one blurred wash"
 * — so this treats the card as glass at its rim only, the way a pane sits in
 * a frame, rather than repeating that mistake at a larger scale.
 *
 * Sits as a decorative sibling inside a `relative` card, absolutely
 * positioned `inset-0` — the same slot CornerBloom already occupies, and
 * safe to combine with it (this never paints the interior CornerBloom pools
 * in). `radius` should match the card's own Tailwind rounding in pixels
 * (16 = rounded-2xl, the "Packages family" default).
 */
export default function GlassCardRim({ radius = 16, tint = ['#E4E6A8', '#D6DAF0'], rim = ['rgba(240,228,158,0.5)', 'rgba(201,196,232,0.4)'] }) {
  const uid = useId().replace(/:/g, '')
  const heavy = useHeavyFx()
  const reduce = useReducedMotion()
  const animated = heavy && !reduce

  return (
    <>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={`gr-warp-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
            {/* A lower base frequency than the old glass shimmer buys a longer
                wavelength — a few big, round undulations rather than fine
                noise — so the edge reads as a cute wobble of wet paper
                floating on water, not a shivering rim. The wider filter
                region (±10%) gives that larger swell room before it clips. */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.006 0.009"
              numOctaves="2"
              seed="9"
              result="n"
            >
              {animated && (
                <animate
                  attributeName="baseFrequency"
                  values="0.006 0.009;0.004 0.006;0.006 0.009"
                  dur="12s"
                  calcMode="spline"
                  keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                  repeatCount="indefinite"
                />
              )}
            </feTurbulence>
            {/* Bigger displacement (9 vs 5) makes the swell actually visible;
                the stroke below is widened to match so the wavier edge stays a
                continuous ribbon instead of pinching apart at the crests. */}
            <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <linearGradient id={`gr-stroke-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFCF2" stopOpacity="0.9" />
            <stop offset="50%" stopColor={tint[0]} stopOpacity="0.55" />
            <stop offset="100%" stopColor={tint[1]} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {/* x/y/width/height stay whole-percentage (no calc()) for broad SVG
            attribute support; the parent card is already overflow-hidden, so
            the half-pixel of stroke that falls outside the box is clipped
            for free rather than needing a precise inset. */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx={radius}
          fill="none"
          stroke={`url(#gr-stroke-${uid})`}
          strokeWidth="2.25"
          filter={`url(#gr-warp-${uid})`}
        />
      </svg>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          boxShadow:
            'inset 0 0 0 1px rgba(216,218,236,0.35), ' +
            `inset 0.5px 0.5px 0 0 ${rim[0]}, ` +
            `inset -0.5px -0.5px 0 0 ${rim[1]}`,
        }}
      />
    </>
  )
}
