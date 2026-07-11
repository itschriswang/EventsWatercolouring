import { useId } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'

/**
 * A pill rendered as a sliver of liquid glass, in the spirit of the site's
 * existing wet-bleed language (BloomFilter's turbulence + displacement) but
 * applied as a permanent material rather than a one-shot settle-in: an inline
 * SVG fill (gradient run through feTurbulence/feDisplacementMap) sits behind
 * plain DOM text, with a chromatic-aberration hairline rim where the "glass"
 * bends light. The label itself is never filtered, so it stays crisp at any
 * size.
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
 * Colours stay within the Pastel Bloom anti-mud rules for this pill's
 * established yellow-green identity (the fact pills' existing lime/sage
 * accent): the fill and rim only touch yellow-green's safe neighbours
 * (butter, periwinkle), never jumping straight to rose.
 */
export default function GlassPill({ children, className = '' }) {
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
            <stop offset="48%" stopColor="#E4E6A8" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#D6DAF0" stopOpacity="0.6" />
          </linearGradient>
        </defs>
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
      {/* Chromatic-aberration rim: a butter and a periwinkle hairline offset
          by a pixel, the way a lens edge splits light — both are yellow-
          green's safe neighbours on the palette arc, so the overlap never
          reads muddy. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          boxShadow:
            'inset 0 0 0 1px rgba(216,218,236,0.5), ' +
            'inset 0.5px 0.5px 0 0 rgba(240,228,158,0.55), ' +
            'inset -0.5px -0.5px 0 0 rgba(201,196,232,0.4)',
        }}
      />
      <span className="relative z-10">{children}</span>
    </span>
  )
}
