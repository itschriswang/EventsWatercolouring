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
 */
export default function GradientDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hero-flow-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9ED0BD" />
          <stop offset="14%" stopColor="#C18DE1" />
          <stop offset="44%" stopColor="#D8DC4B" />
          <stop offset="56%" stopColor="#D8DC4B" />
          <stop offset="86%" stopColor="#F674A2" />
          <stop offset="100%" stopColor="#EB5E7F" />
        </linearGradient>
        <linearGradient id="sparkle-gradient-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C18DE1" />
          <stop offset="100%" stopColor="#D8DC4B" />
        </linearGradient>
        <linearGradient id="sparkle-gradient-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D8DC4B" />
          <stop offset="100%" stopColor="#F674A2" />
        </linearGradient>
      </defs>
    </svg>
  )
}
