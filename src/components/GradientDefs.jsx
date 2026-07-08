/**
 * Hidden SVG defs powering `url(#hero-flow-gradient)` — the same wash as
 * `--hero-emphasis-gradient` in index.css (see that token's comment), as an
 * SVG paint server so stroke/fill-based marks (Sparkles' doodles, Underline's
 * hand-drawn strokes) can carry it too; CSS gradients only paint backgrounds,
 * not SVG strokes. `gradientUnits` defaults to objectBoundingBox, so every
 * consumer gets the wash mapped to its own bounding box automatically — no
 * per-instance sizing needed. Mounted once per page root, same pattern the
 * old StampFilters used.
 */
export default function GradientDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hero-flow-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9ED0BD" />
          <stop offset="22%" stopColor="#C18DE1" />
          <stop offset="38%" stopColor="#D8DC4B" />
          <stop offset="62%" stopColor="#D8DC4B" />
          <stop offset="78%" stopColor="#F674A2" />
          <stop offset="100%" stopColor="#EB5E7F" />
        </linearGradient>
      </defs>
    </svg>
  )
}
