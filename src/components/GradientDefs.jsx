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
          <stop offset="6%" stopColor="#9ED0BD" />
          <stop offset="16%" stopColor="#C18DE1" />
          <stop offset="42%" stopColor="#C18DE1" />
          <stop offset="48%" stopColor="#D8DC4B" />
          <stop offset="52%" stopColor="#D8DC4B" />
          <stop offset="58%" stopColor="#F674A2" />
          <stop offset="84%" stopColor="#F674A2" />
          <stop offset="94%" stopColor="#EB5E7F" />
          <stop offset="100%" stopColor="#EB5E7F" />
        </linearGradient>
        <linearGradient id="sparkle-gradient-a" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#C18DE1" />
          <stop offset="100%" stopColor="#D8DC4B" />
        </linearGradient>
        <linearGradient id="sparkle-gradient-b" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#D8DC4B" />
          <stop offset="100%" stopColor="#F674A2" />
        </linearGradient>
      </defs>
    </svg>
  )
}
