import { useEffect, useMemo, useRef, useState } from 'react'
import { fieldCss, PAPER_REFLECTANCE } from '../lib/watercolour.js'
import { renderWash, releaseWash } from '../lib/washRaster.js'
import { useHeavyFx } from '../hooks/useMediaQuery.js'

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

// How far a field's height may drift before its cached wash is repainted rather
// than just restretched, and how long its box must hold still first. Both exist
// to keep the cache from re-encoding during ordinary scrolling on a phone (see
// the effect below).
const HEIGHT_TOLERANCE = 0.2
const RESETTLE_MS = 180

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
  fadeTop = 0,
  className = 'pointer-events-none absolute inset-0',
  style,
}) {
  const ref = useRef(null)

  // `fadeTop` describes a vertical ramp — transparent at the field's top edge,
  // full by this fraction of its height — that the CALLER already applies in
  // CSS. It's declared here purely so the canvas can reproduce it, because a
  // vertical ramp is the one mask shape a shader can follow, and a wash that
  // merely fades in shouldn't have to drop off the canvas for want of it.
  // Applying the mask here too would fade the CSS layer twice.
  //
  // `canvas={false}` keeps a field on CSS. The canvas is one layer at one
  // z-index painting into one viewport, so it cannot follow a field that an
  // ancestor masks, clips to a rounded folder, blends, or stacks over a
  // photograph — the wash would escape the shape it is supposed to live in.
  // Those fields still get the model; they just get it through fieldCss.
  useEffect(() => {
    if (!canvas) return
    const entry = { el: ref.current, blooms, over, fadeTop }
    fields.add(entry)
    return () => fields.delete(entry)
  }, [blooms, over, canvas, fadeTop])

  const backgroundImage = useMemo(() => fieldCss(blooms, over), [blooms, over])

  // Off the heavy tier the wash is cached as a bitmap rather than left as a
  // stack of ~44 live gradients (see lib/washRaster.js). It is the same paint
  // from the same lobe list — only resolved once, instead of re-derived for
  // every tile the browser rasters on the way down the page.
  //
  // This is deliberately the tier that does NOT run BloomCanvas: where the live
  // wash is up it already owns the pigment and these layers are faded out, so
  // rasterising them would be work for something nobody sees.
  const heavy = useHeavyFx()
  const [raster, setRaster] = useState(null)

  useEffect(() => {
    if (heavy) {
      setRaster(null)
      return
    }
    const host = ref.current
    // No ResizeObserver (very old browsers) simply means no cache: the CSS
    // gradients below are still a complete wash, so there is nothing to rescue.
    if (!host || typeof ResizeObserver === 'undefined') return

    let timer = 0
    let live = true
    let current = null
    let painted = null

    const draw = () => {
      timer = 0
      const r = host.getBoundingClientRect()
      const vw = window.innerWidth || r.width
      if (r.width <= 0 || r.height <= 0) return

      // Repaint only when the wash's SHAPE would actually change. Width and vw
      // must match: a vw-sized bloom is a circle keyed to the viewport, so
      // either one moving is a different wash. Height is the loose one on
      // purpose — `background-size: 100% 100%` restretches the existing bitmap
      // for free, and a soft field survives a few percent of that invisibly.
      //
      // Which is what makes this safe on a phone. Scrolling shows and hides the
      // URL bar, so `resize` fires mid-scroll with a viewport ~10% shorter;
      // re-encoding seven fields on that would put the cost back exactly where
      // the cache was meant to take it from.
      if (
        painted &&
        Math.abs(painted.width - r.width) < 1 &&
        Math.abs(painted.vw - vw) < 1 &&
        Math.abs(painted.height - r.height) / painted.height < HEIGHT_TOLERANCE
      ) {
        return
      }
      painted = { width: r.width, height: r.height, vw }

      renderWash({ blooms, over, width: r.width, height: r.height, vw }).then((url) => {
        // The encode is async, so another resize can land mid-flight; the last
        // one asked for wins and anything it superseded is freed here.
        if (!live || !url) return releaseWash(url)
        releaseWash(current)
        current = url
        setRaster(url)
      })
    }

    // Debounced rather than per-frame: a field's box moves repeatedly as the
    // images below it load and during an orientation change, and each repaint
    // is a full encode.
    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(draw, RESETTLE_MS)
    }

    draw()
    const ro = new ResizeObserver(schedule)
    ro.observe(host)
    // The box can hold still while `vw` changes (orientation, zoom), and the
    // vw-sized blooms are sized off that rather than off the element.
    window.addEventListener('resize', schedule)
    return () => {
      live = false
      clearTimeout(timer)
      ro.disconnect()
      window.removeEventListener('resize', schedule)
      releaseWash(current)
      setRaster(null)
    }
  }, [heavy, blooms, over])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-bloom-field={canvas ? 'canvas' : 'css'}
      className={`bloom-field ${className}`}
      style={{
        // The gradients stay declared until the bitmap is actually up, so a
        // failed encode — or the frame before the first one lands — shows the
        // wash rather than blank paper.
        backgroundImage: raster ? `url("${raster}")` : backgroundImage,
        // The raster was painted at the field's own aspect, so it stretches
        // back onto it exactly; the gradients need neither of these.
        ...(raster ? { backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' } : null),
        ...style,
      }}
    />
  )
}
