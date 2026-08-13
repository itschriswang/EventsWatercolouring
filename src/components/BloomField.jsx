import { useEffect, useMemo, useRef } from 'react'
import { fieldCss, PAPER_REFLECTANCE } from '../lib/watercolour.js'

/**
 * A field of watercolour blooms behind a section.
 *
 * Every bloom field on the site is declared through this component so it can be
 * rendered twice: as CSS here, and — where the device can afford it — as real
 * paint by BloomCanvas, which composites the blooms optically instead of
 * letting the browser alpha-blend them.
 *
 * That difference is the reason this exists. CSS has no way to composite two
 * washes the way glazes actually combine: it averages their colours, which is
 * the mud CLAUDE.md's anti-mud rules are written to route around by hand. On
 * the canvas the blooms become one layer of several pigments, weighted by
 * relative thickness the way §5.2 prescribes, so overlaps deepen along the
 * pigments' own curves and stay luminous without anyone hand-picking which
 * hues are allowed to touch.
 *
 * Both renderings come from the same numeric spec, so they agree about where
 * the paint is and the fallback is a fallback rather than a different design.
 * The CSS layer fades out under `[data-live-blooms]` (index.css) when the
 * canvas takes over, and fades back if the canvas ever tears down.
 *
 * Props:
 *   blooms — [{ pigment, x, at: [fx, fy], size: [fx, fy], extent, wetness }]
 *            `at`/`size` are fractions of this element, matching how CSS
 *            resolves gradient percentages.
 *   over   — the backdrop the glazes composite onto, as an RGB triple. Paper by
 *            default; the nightfall sections pass their own dark ground.
 *   className / style — positioning; this renders one absolutely-placed div.
 */

// Live fields, in mount order. BloomCanvas reads this every frame — a plain Set
// rather than context or state because the canvas is outside React's tree and
// only ever reads, and re-rendering the page to tell a canvas about a rect
// would be the wrong shape entirely.
const fields = new Set()
export function bloomFields() {
  return fields
}

export default function BloomField({
  blooms,
  over = PAPER_REFLECTANCE,
  canvas = true,
  className = 'pointer-events-none absolute inset-0',
  style,
}) {
  const ref = useRef(null)

  // `canvas={false}` keeps a field on CSS. The canvas is one layer at one
  // z-index painting into one viewport, so it cannot follow a field that an
  // ancestor masks, clips to a rounded folder, blends, or stacks over a
  // photograph — the wash would escape the shape it is supposed to live in.
  // Those fields still get the model; they just get it through fieldCss.
  useEffect(() => {
    if (!canvas) return
    const entry = { el: ref.current, blooms, over }
    fields.add(entry)
    return () => fields.delete(entry)
  }, [blooms, over, canvas])

  const backgroundImage = useMemo(() => fieldCss(blooms, over), [blooms, over])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-bloom-field={canvas ? 'canvas' : 'css'}
      className={`bloom-field ${className}`}
      style={{ backgroundImage, ...style }}
    />
  )
}
