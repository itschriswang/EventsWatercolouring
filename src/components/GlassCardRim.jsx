import { useId } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useHeavyFx } from '../hooks/useMediaQuery.js'

/**
 * A liquid-glass panel edge: the border itself refracts (an SVG stroke run
 * through feTurbulence/feDisplacementMap — the same wick-distortion primitive
 * GlassPill uses), a caustic field carries the turbulence the ground behind
 * the panel picks up on its way through the glass, and a chromatic-aberration
 * hairline marks where the pane bends light.
 *
 * WHY THE BACKDROP IS DRAWN RATHER THAN FILTERED. Real glass this thick would
 * displace what is behind it, and CSS has exactly one way to say that —
 * `backdrop-filter: url(#…)` — which Safari/iOS does not implement at all
 * (GlassPill's header records the same dead end for its fill). Half the
 * visitors would get flat panels and never know. So the layer below is the
 * refracted LIGHT rather than the refracted backdrop: thin cream caustics run
 * through a long-wavelength turbulence at a displacement big enough to break
 * them into filaments, which is what a rippled pane does to whatever is behind
 * it. It renders identically everywhere, and being SVG content filtering its
 * own source it costs one filter pass at paint, not one per frame.
 *
 * It stays LIGHT-ONLY on purpose, and that is the lesson `CARD_BG` (site.js)
 * paid for: a pastel tint across a whole card made "cards barely separated
 * from their surroundings... all read as one blurred wash". Caustics are
 * cream highlights over the card's own ground, so they add structure without
 * adding a tone — and they cannot take contrast off the copy sitting on top,
 * because every pixel they touch gets lighter, never darker.
 *
 * Sits as a decorative sibling inside a `relative` card, absolutely
 * positioned `inset-0` — the same slot CornerBloom already occupies, and
 * safe to combine with it (the caustics glaze over CornerBloom's pools rather
 * than replacing them). `radius` should match the card's own Tailwind rounding
 * in pixels (16 = rounded-2xl, the "Packages family" default).
 */
export default function GlassCardRim({ radius = 16, tint = ['#E4E6A8', '#D6DAF0'], rim = ['rgba(240,228,158,0.5)', 'rgba(201,196,232,0.4)'] }) {
  const uid = useId().replace(/:/g, '')
  const heavy = useHeavyFx()
  const reduce = useReducedMotion()
  const animated = heavy && !reduce

  return (
    <>
      {/* The refracted light behind the pane.

          Clipped by its own `overflow-hidden rounded-[inherit]` wrapper rather
          than by the card: the Packages family is overflow-hidden but the
          timeline's step cards are not, and caustics escaping a rounded corner
          onto the dusk ground would read as a rendering fault.

          The svg is oversized by 30% on every side, and the size is written as
          explicit width/height utilities rather than as a negative `inset`: an
          `<svg>` carries width="100%" height="100%" as presentation
          attributes, which satisfy the used width the way an author
          declaration would, so `inset: -30%` alone just offsets a card-sized
          layer and paints the field as a patch in one corner. The margin
          itself is load-bearing twice — the displacement below drags the
          field's own rectangular boundary inward by up to half its scale, and
          the drift slides the whole layer — so it has to stay wider than the
          two together or a hard edge walks into the panel. */}
      <span
        aria-hidden="true"
        className="zoom-mute pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        <svg
          className={
            'absolute -left-[30%] -top-[30%] h-[160%] w-[160%]' +
            (animated ? ' glass-caustics' : '')
          }
          preserveAspectRatio="none"
        >
          <defs>
            {/* Amplitude is only half of it: what decides whether this reads
                as turbulence or as a sheen is the displacement measured
                AGAINST the pitch of what it displaces. ±23px on a 53px band
                pitch throws each filament nearly half a band sideways, so the
                field shears rather than merely rippling.

                Four octaves off a low base is the other half. Started at
                0.009/3 the noise ran to one scale and every panel came out
                corduroy — evenly wavy lines. From 0.005 the octaves span
                wavelengths of about 200px down to 25px, so broad swells carry
                whole groups of filaments together while the fine octaves throw
                neighbours inside a group apart, which is what stops a
                repeating gradient reading as a repeating gradient. sRGB
                interpolation keeps the cream cream on the way through. */}
            <filter
              id={`gr-refract-${uid}`}
              x="-15%"
              y="-15%"
              width="130%"
              height="130%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.005 0.009"
                numOctaves="4"
                seed="7"
                result="swell"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="swell"
                scale="46"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            {/* Narrow bright lines with wide gaps, repeating at a pitch fixed
                in PIXELS. Two mistakes are baked out of this. A gradient that
                merely fades gets displaced into a slightly wobbly gradient and
                reads as a sheen, so it has to be lines, not a ramp. And a
                gradient in the default objectBoundingBox units has no pitch of
                its own — it stretches to the panel — so the first version's
                stops came out ~50px wide on a package card, wide enough that
                the displacement below could only ripple them, and the whole
                field rendered as a faint diagonal shine. `userSpaceOnUse` plus
                `spreadMethod="repeat"` gives every panel the same 53px pitch
                whatever its size, the way `paperHeight()` holds the sheet's
                tooth at one physical size across the site. The tint stops are
                the panel's own colour pair, so the light carries a hint of the
                glass rather than reading as bare white. */}
            <linearGradient
              id={`gr-caustic-${uid}`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="30"
              y2="44"
              spreadMethod="repeat"
            >
              <stop offset="0" stopColor="#FFFCF2" stopOpacity="0" />
              <stop offset="0.26" stopColor="#FFFCF2" stopOpacity="0.62" />
              <stop offset="0.34" stopColor="#FFFCF2" stopOpacity="0.06" />
              <stop offset="0.5" stopColor={tint[0]} stopOpacity="0.13" />
              <stop offset="0.66" stopColor="#FFFCF2" stopOpacity="0.3" />
              <stop offset="0.74" stopColor={tint[1]} stopOpacity="0.1" />
              <stop offset="1" stopColor="#FFFCF2" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={`url(#gr-caustic-${uid})`}
            filter={`url(#gr-refract-${uid})`}
            opacity="0.62"
          />
        </svg>
      </span>
      {/* zoom-mute: the displacement-warped stroke re-runs its SVG filter
          graph on every pinch-zoom re-raster and tears into white streaks on
          mobile GPUs; the plain hairline span below keeps the rim readable
          while zoomed (see index.css). */}
      <svg
        aria-hidden="true"
        className="zoom-mute pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={`gr-warp-${uid}`} x="-16%" y="-16%" width="132%" height="132%">
            {/* A lower base frequency than the old glass shimmer buys a longer
                wavelength — a few big, round undulations rather than fine
                noise — so the edge reads as a cute wobble of wet paper
                floating on water, not a shivering rim. The wider filter
                region (±16%) gives that larger swell room before it clips. */}
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
                  values="0.006 0.009;0.0032 0.005;0.006 0.009"
                  dur="12s"
                  calcMode="spline"
                  keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                  repeatCount="indefinite"
                />
              )}
            </feTurbulence>
            {/* Displacement is the whole amplitude of the effect: at 5 the
                swell was invisible, at 9 it read, and at 14 the edge actually
                wanders the way the caustics behind it do — the rim and the
                refraction have to agree about how thick this glass is or the
                panel reads as a flat card with a wobbly outline. The stroke
                below is widened to match so the wavier edge stays a continuous
                ribbon instead of pinching apart at the crests. */}
            <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" />
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
          strokeWidth="2.75"
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
