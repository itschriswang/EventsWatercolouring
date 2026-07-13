import { useHeavyFx } from '../hooks/useMediaQuery.js'

/**
 * GlassRibbon — a slim glass band that snakes down the whole page behind the
 * content, after the "dark ribbon over the ZOOM type" reference: the glass is
 * read through what it does to its backdrop (a real `backdrop-filter` blur
 * masked to the ribbon shape) plus chromatic-aberration fringes hugging its
 * edges — a warm orange cast off the top edge, a cool cyan cast off the
 * bottom, the way white light splits through the rim of curved glass.
 *
 * Never a painted panel ON TOP of content: the ribbon sits at z-0 inside
 * <main>, behind every section, so it refracts the washes/blooms beneath it
 * and simply dips out of sight behind the opaque deep-ground sections.
 *
 * Geometry is computed once at module scope in 0..1 space and stretched to
 * the page with `preserveAspectRatio="none"`; edge strokes use
 * `vector-effect: non-scaling-stroke` so the fringes stay crisp pixels no
 * matter the page height. The blur layer is masked with the same band path
 * via an SVG data-URI mask (masks clip backdrop-filter output; a clip-path
 * url() to an in-document SVG is flakier in Safari).
 *
 * Tiering per the site ladder: `useHeavyFx` gates the backdrop blur; touch /
 * low-end devices keep the tinted band + fringes, which are one static SVG.
 */

// Centreline: a lazy snake, two blended sine voices so the wander reads
// hand-drawn rather than metronomic. x deliberately overshoots [0,1] so the
// ribbon slips off one side of the page and re-enters lower down. Tuned so
// one full left-right-left sway spans ~0.16 of the page (~1.5 viewports on
// the homepage's height) — every screen catches a visible bend, without the
// zig-zag getting busy.
const N = 60
const CENTER = Array.from({ length: N + 1 }, (_, i) => ({
  x: 0.5 + 0.56 * Math.sin(i * 0.63 + 0.4) + 0.07 * Math.sin(i * 1.53),
  y: 0.012 + (0.976 * i) / N + 0.006 * Math.sin(i * 2.1),
}))

// Half-thickness of the band, in page-height units. Offsetting the
// centreline vertically (rather than along its normal) means the band
// visually thins through its steeper diagonals — reading like a ribbon
// twisting in space, which is the charm, not a bug.
const HALF = 0.0085

const offset = (dy) => CENTER.map((p) => ({ x: p.x, y: p.y + dy }))

// Catmull-Rom through the points -> cubic bezier path string.
const toPath = (pts) => {
  const f = (v) => v.toFixed(4)
  let d = `M ${f(pts[0].x)} ${f(pts[0].y)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(i + 2, pts.length - 1)]
    d += ` C ${f(p1.x + (p2.x - p0.x) / 6)} ${f(p1.y + (p2.y - p0.y) / 6)}, ${f(
      p2.x - (p3.x - p1.x) / 6
    )} ${f(p2.y - (p3.y - p1.y) / 6)}, ${f(p2.x)} ${f(p2.y)}`
  }
  return d
}

const TOP_EDGE = toPath(offset(-HALF))
const BOTTOM_EDGE = toPath(offset(HALF))
const BAND =
  TOP_EDGE + ' ' + toPath(offset(HALF).reverse()).replace(/^M/, 'L') + ' Z'

// The blur layer's mask: the band shape as a standalone SVG data URI.
const MASK_URL = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1' preserveAspectRatio='none'><path d='${BAND}' fill='black'/></svg>`
)}")`

// Shared stroke props for the edge fringes.
const fringe = (d, stroke, strokeWidth) => (
  <path
    key={`${stroke}-${strokeWidth}`}
    d={d}
    fill="none"
    stroke={stroke}
    strokeWidth={strokeWidth}
    vectorEffect="non-scaling-stroke"
  />
)

export default function GlassRibbon() {
  const heavyFx = useHeavyFx()

  return (
    <div
      aria-hidden="true"
      // z-[-1], not z-0: inside <main>'s stacking context a negative z child
      // paints below ALL of main's content — including the in-flow,
      // non-positioned sections, which a z-0 sibling would sit above (and
      // whose text the backdrop blur would then smear). It still paints
      // above the fixed canvases/washes at the root, because main itself is
      // z-10 there — so the blur samples only the watercolour field.
      className="pointer-events-none absolute inset-0 z-[-1] overflow-hidden"
    >
      {/* The glass itself: blur + saturate of whatever sits beneath (washes,
          blooms, grain), masked to the band. Heavy-fx only — a document-tall
          backdrop-filter region is the expensive part of this component. */}
      {heavyFx && (
        <div
          className="absolute inset-0"
          style={{
            WebkitBackdropFilter: 'blur(9px) saturate(1.45)',
            backdropFilter: 'blur(9px) saturate(1.45)',
            WebkitMaskImage: MASK_URL,
            maskImage: MASK_URL,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
          }}
        />
      )}

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Faint iridescent tint down the ribbon's length — neighbours on
              the palette arc only (chartreuse → seafoam → lavender → blossom
              → apricot), low alpha so the blur does the talking. */}
          <linearGradient id="glass-ribbon-tint" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(216,219,122,0.22)" />
            <stop offset="0.3" stopColor="rgba(191,220,209,0.2)" />
            <stop offset="0.55" stopColor="rgba(212,182,230,0.2)" />
            <stop offset="0.8" stopColor="rgba(242,166,193,0.2)" />
            <stop offset="1" stopColor="rgba(247,195,148,0.22)" />
          </linearGradient>
        </defs>

        {/* Smoked-burgundy body under the iridescent tint — over flat paper
            stretches (where the backdrop blur has nothing to grab) this is
            what keeps the band reading as one piece of glass rather than two
            floating fringe lines. Burgundy per the deep-anchor rule, whisper
            alpha so the light sections stay light. */}
        <path d={BAND} fill="rgba(78,38,57,0.07)" />
        <path d={BAND} fill="url(#glass-ribbon-tint)" />

        {/* Chromatic aberration: stepped soft strokes stand in for a true
            per-channel refraction (which CSS can't sample from the backdrop).
            Warm fringe bleeds off the top edge, cool off the bottom, plus a
            hairline white glint and a whisper of the site's chartreuse. */}
        {fringe(TOP_EDGE, 'rgba(255,255,255,0.5)', 1.2)}
        {fringe(TOP_EDGE, 'rgba(255,150,66,0.32)', 3.5)}
        {fringe(TOP_EDGE, 'rgba(255,150,66,0.14)', 7)}
        {fringe(BOTTOM_EDGE, 'rgba(216,219,122,0.28)', 1.5)}
        {fringe(BOTTOM_EDGE, 'rgba(108,210,235,0.32)', 3.5)}
        {fringe(BOTTOM_EDGE, 'rgba(108,210,235,0.14)', 7)}
      </svg>
    </div>
  )
}
