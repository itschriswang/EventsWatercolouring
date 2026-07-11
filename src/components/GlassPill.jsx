import { useId } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'

/**
 * A pill or circular badge rendered as a sliver of liquid glass, in the
 * spirit of the site's existing wet-bleed language (BloomFilter's turbulence
 * + displacement) but applied as a permanent material rather than a one-shot
 * settle-in: an inline SVG fill (gradient run through
 * feTurbulence/feDisplacementMap) sits behind plain DOM text, with a
 * chromatic-aberration hairline rim where the "glass" bends light. The label
 * itself is never filtered, so it stays crisp at any size. `rx="999"` clamps
 * to the shape's own half-height, so this reads as a pill on a wide box and a
 * disc on a square one — same component either way.
 *
 * This is drawn as SVG content with the filter applied via the SVG `filter`
 * attribute — not CSS `backdrop-filter: url(#…)`, whose SVG-reference form
 * Safari/iOS doesn't support. An SVG element filtering its own SVG content
 * renders identically everywhere, so the material is visible on mobile, not
 * just heavyFx desktops. Only the slow "alive" wobble is gated: heavyFx +
 * motion-allowed devices get the turbulence seed drifting; everyone else
 * (including touch) gets the same distorted fill held still — matches the
 * site's tiering rule of never nothing, always at least the static form.
 *
 * `tint` is a [mid, end] colour pair for the fill's gradient (a cream start
 * stop is fixed, matching the site's catchlight convention) and `rim` is a
 * matching [a, b] pair for the chromatic edge. Defaults are yellow-green's
 * safe neighbours (butter, periwinkle) per the Pastel Bloom anti-mud rules —
 * pass a different pair to keep a badge in its own established hue family
 * (e.g. the mint/sage of the timeline's destination marker) rather than
 * forcing every instance through the same two colours.
 *
 * `opaque` backs the glass with a solid paper rect before the translucent
 * warp layer, for badges that sit directly on a dark or busy ground (no card
 * behind them) and need guaranteed contrast for their label regardless of
 * what the turbulence does to the translucent layers above it.
 */
export default function GlassPill({
  children,
  className = '',
  tint = ['#E4E6A8', '#D6DAF0'],
  rim = ['rgba(240,228,158,0.55)', 'rgba(201,196,232,0.4)'],
  opaque = false,
}) {
  const uid = useId().replace(/:/g, '')
  const heavy = useHeavyFx()
  const reduce = useReducedMotion()
  const animated = heavy && !reduce

  return (
    <span className={'group/pill relative isolate inline-flex items-center overflow-hidden rounded-full ' + className}>
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={`gp-warp-${uid}`} x="-30%" y="-80%" width="160%" height="260%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.09 0.24"
              numOctaves="2"
              seed="4"
              result="n"
            >
              {animated && (
                <animate
                  attributeName="baseFrequency"
                  values="0.09 0.24;0.06 0.17;0.09 0.24"
                  dur="10s"
                  calcMode="spline"
                  keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                  repeatCount="indefinite"
                />
              )}
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <linearGradient id={`gp-fill-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFCF2" stopOpacity="0.92" />
            <stop offset="48%" stopColor={tint[0]} stopOpacity="0.42" />
            <stop offset="100%" stopColor={tint[1]} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* Opaque backing so the label reads over a dark/busy section ground
            regardless of the translucent warp layers above it. */}
        {opaque && <rect x="0" y="0" width="100%" height="100%" rx="999" fill="#F7F4EF" />}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx="999"
          fill={`url(#gp-fill-${uid})`}
          filter={`url(#gp-warp-${uid})`}
        />
        {/* Specular streak — the highlight a curved glass surface catches. */}
        <rect
          x="8%"
          y="10%"
          width="30%"
          height="34%"
          rx="999"
          fill="#FFFCF2"
          opacity="0.5"
          filter={`url(#gp-warp-${uid})`}
        />
      </svg>
      {/* Chromatic-aberration rim: two hairlines offset by a pixel, the way
          a lens edge splits light. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          boxShadow:
            'inset 0 0 0 1px rgba(216,218,236,0.5), ' +
            `inset 0.5px 0.5px 0 0 ${rim[0]}, ` +
            `inset -0.5px -0.5px 0 0 ${rim[1]}`,
        }}
      />
      <span className="relative z-10">{children}</span>
    </span>
  )
}
