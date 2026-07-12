/**
 * Hidden SVG defs powering `url(#hero-flow-gradient)` — the same wash as
 * `--hero-emphasis-gradient` in index.css (see that token's comment), as an
 * SVG paint server so stroke/fill-based marks (Underline's hand-drawn
 * strokes) can carry it too; CSS gradients only paint backgrounds, not SVG
 * strokes. `gradientUnits` defaults to objectBoundingBox, so every consumer
 * gets the wash mapped to its own bounding box automatically — no
 * per-instance sizing needed. Mounted once per page root, same pattern the
 * old StampFilters used.
 *
 * `sparkle-gradient-a`/`-b` are two-stop slices of the same arc — Lavender
 * into Lemon Lime, and Lemon Lime into Blossom — for Sparkles' small doodles.
 * The full six-stop rainbow reads as busy mud at that size (same reasoning
 * Underline's `pickFlowPair` already applies to its squiggles), so each
 * sparkle only ever carries two neighbouring hues.
 *
 * These two are pinned to `userSpaceOnUse` across Sparkles' own 0–100
 * viewBox rather than the default `objectBoundingBox`. Each stroke in that
 * cluster is its own `<path>`, so objectBoundingBox was mapping the 0–1 ramp
 * onto every individual stroke's *own* tiny bounding box — for a near-vertical
 * stroke that box is only a couple of units wide, far narrower than the
 * 5.5px stroke width painted on top of it, so almost the whole visible line
 * fell outside the box and got clamped to a flat edge colour. The result
 * read as a hard left/right split down each stroke instead of a wash. Fixing
 * the gradient to one shared coordinate space makes every stroke sample the
 * same continuous diagonal, so the cluster blends as a single doodle again.
 */
export default function GradientDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hero-flow-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9ED0BD" />
          <stop offset="4%" stopColor="#C18DE1" />
          <stop offset="48%" stopColor="#D8DC4B" />
          <stop offset="52%" stopColor="#D8DC4B" />
          <stop offset="96%" stopColor="#F674A2" />
          <stop offset="100%" stopColor="#C94868" />
        </linearGradient>
        <linearGradient id="sparkle-gradient-a" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#C18DE1" />
          <stop offset="100%" stopColor="#D8DC4B" />
        </linearGradient>
        <linearGradient id="sparkle-gradient-b" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#D8DC4B" />
          <stop offset="100%" stopColor="#F674A2" />
        </linearGradient>

        {/*
          #dither-sketch — the printed-dither texture for the painted kit
          sketches in the bio (MyKit's SVG stand-ins), so they read as pigment
          stippled onto paper rather than flat vector fills, matching the
          dithered washes and background. Referenced from CSS `filter:
          url(#dither-sketch)` (the `.dither-sketch` utility), applied ONLY to
          the illustrated stand-ins — never the real portrait or any cut-out
          photograph.

          Built from robust, universally-supported primitives (no feImage/
          feTile, whose tiling is inconsistent across engines):
            1. feTurbulence lays down fine fractal noise.
            2. its R channel is moved to alpha, then feComponentTransfer's
               discrete alpha table hard-clips it to ~25%-coverage dots — the
               dither grain.
            3. the dots are flooded burgundy (the deep decorative anchor, never
               grey) and composited `in` the SourceAlpha, so they only ever
               fall on the drawn object, not the transparent gaps around it.
            4. finally multiplied back over the original art, darkening just
               those speckles.
          color-interpolation-filters=sRGB keeps the burgundy true; the graph
          is static (no animate), so it's safe on every device tier.
        */}
        <filter
          id="dither-sketch"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.55"
            numOctaves="1"
            seed="11"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    1 0 0 0 0"
            result="grain"
          />
          <feComponentTransfer in="grain" result="dots">
            <feFuncA type="discrete" tableValues="0 0 0 1" />
          </feComponentTransfer>
          <feFlood floodColor="#7E2848" floodOpacity="0.5" result="tint" />
          <feComposite in="tint" in2="dots" operator="in" result="tintedDots" />
          <feComposite in="tintedDots" in2="SourceAlpha" operator="in" result="clipped" />
          <feBlend in="SourceGraphic" in2="clipped" mode="multiply" />
        </filter>
      </defs>
    </svg>
  )
}
