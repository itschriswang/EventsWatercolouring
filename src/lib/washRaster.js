import { fieldLobes } from './watercolour.js'

/**
 * The CSS wash tier, painted once into a bitmap instead of on every tile.
 *
 * `fieldCss` hands the rasteriser a stack of ~44 `radial-gradient`s and a layer
 * thousands of pixels tall, and the browser re-evaluates that whole stack for
 * every tile it has to raster as the page scrolls. That is the single largest
 * cost on the devices that can least afford it: the phones the CSS tier exists
 * to serve are the ones paying the most for it, while capable desktops get the
 * cheap rendering (one fixed, half-resolution WebGL surface — see BloomCanvas).
 *
 * This closes that gap without touching the design. The lobes come from
 * `fieldLobes`, the same list `fieldCss` formats, so the wash is identical
 * paint in identical places; it is simply resolved once into an image the
 * rasteriser can sample, rather than re-derived from 44 gradients per tile.
 *
 * Two things make that safe, and they are the same two BloomCanvas already
 * relies on:
 *
 *   - No device pixels. A wash carries no detail at the pixel scale, so a
 *     retina backing store buys nothing and costs 4x the fill (BloomCanvas caps
 *     its own DPR at 1 for exactly this reason).
 *   - Reduced resolution. The sharpest thing in a bloom is §4.3.3's dried rim,
 *     whose ramp spans roughly a sixth of the bloom's radius — tens of CSS
 *     pixels. SCALE keeps several samples across it while cutting fill by an
 *     order of magnitude; MIN_RIM_PX below is the guard that keeps it there.
 */

// Backing store budget. The scale is solved per field against MAX_PIXELS rather
// than fixed, so a short field is not rasterised more finely than a tall one
// for no reason, and clamped so neither end degenerates.
const MAX_PIXELS = 0.26e6
const MAX_SCALE = 0.5
const MIN_SCALE = 0.2

/**
 * The rim is the feature that sets the floor: below a few samples across its
 * ramp it stops reading as a dried edge and the wash flattens into the airbrush
 * §4.3.3 exists to prevent. The ramp is ~0.16 of a bloom's radius (the profile
 * runs the rim from 0.52 to 0.74 of its span), so this is the smallest bloom
 * radius, in backing-store pixels, that still resolves it.
 */
const MIN_RIM_PX = 3
const RIM_SPAN = 0.16

/** Fraction of its radius a lobe still has paint at — its last real stop. */
function lobeExtent(lobe) {
  let e = 0
  for (const [colour, pos] of lobe.stops) {
    if (colour !== 'transparent' && pos != null) e = Math.max(e, pos)
  }
  // The transparent stop is where the wash actually stops; include it so the
  // bounding box below covers the whole ramp rather than clipping its tail.
  const last = lobe.stops[lobe.stops.length - 1]?.[1]
  return Math.max(e, last ?? 0) / 100
}

/**
 * Resolve a lobe's geometry to CSS pixels within a field of `width` x `height`.
 * vw-sized blooms resolve against the viewport on both axes so they hold their
 * shape however tall the section runs — the same rule `fieldCss` follows.
 */
function resolve(lobe, width, height, vw) {
  const rx = lobe.sizeVw ? (lobe.sizeVw[0] * vw) / 100 : (lobe.sizePct[0] / 100) * width
  const ry = lobe.sizeVw ? (lobe.sizeVw[1] * vw) / 100 : (lobe.sizePct[1] / 100) * height
  const cx = (lobe.atPct[0] / 100) * width + (lobe.offVw ? (lobe.offVw[0] * vw) / 100 : 0)
  const cy = (lobe.atPct[1] / 100) * height + (lobe.offVw ? (lobe.offVw[1] * vw) / 100 : 0)
  return { cx, cy, rx, ry }
}

/**
 * Pick the backing-store scale for a field: as coarse as the pixel budget wants,
 * but never so coarse that the smallest bloom's rim stops resolving.
 */
export function washScale(lobes, width, height, vw) {
  const area = Math.max(1, width * height)
  let scale = Math.min(MAX_SCALE, Math.sqrt(MAX_PIXELS / area))

  let smallest = Infinity
  for (const lobe of lobes) {
    const { rx, ry } = resolve(lobe, width, height, vw)
    smallest = Math.min(smallest, Math.abs(rx), Math.abs(ry))
  }
  if (Number.isFinite(smallest) && smallest > 0) {
    scale = Math.max(scale, MIN_RIM_PX / (smallest * RIM_SPAN))
  }
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale))
}

/**
 * Paint a bloom field into `canvas`. Returns false if the 2D context or the
 * field's box is unusable, so the caller can leave the CSS background up rather
 * than replacing a wash with nothing.
 *
 * The canvas never reaches the document — see `renderWash` for why.
 */
function paintWash(canvas, { blooms, over, width, height, vw }) {
  if (!canvas || width <= 0 || height <= 0) return false

  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return false

  const lobes = fieldLobes(blooms, over)
  const scale = washScale(lobes, width, height, vw)
  const bw = Math.max(1, Math.round(width * scale))
  const bh = Math.max(1, Math.round(height * scale))
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw
    canvas.height = bh
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, bw, bh)

  // CSS paints the FIRST background layer on top; canvas paints the last drawn
  // on top. Reversing here is what keeps the two stacks identical — without it
  // every overlap composites the wrong way round.
  for (let i = lobes.length - 1; i >= 0; i--) {
    const lobe = lobes[i]
    const { cx, cy, rx, ry } = resolve(lobe, width, height, vw)
    if (!(rx > 0) || !(ry > 0)) continue

    // Only fill where this lobe can actually reach. Filling the whole field for
    // every lobe would multiply the one-time cost by the lobe count for pixels
    // the gradient leaves transparent anyway.
    const e = lobeExtent(lobe)
    const x0 = Math.max(0, Math.floor((cx - rx * e) * scale))
    const y0 = Math.max(0, Math.floor((cy - ry * e) * scale))
    const x1 = Math.min(bw, Math.ceil((cx + rx * e) * scale))
    const y1 = Math.min(bh, Math.ceil((cy + ry * e) * scale))
    if (x1 <= x0 || y1 <= y0) continue

    // Draw in the lobe's own unit-circle frame: CSS resolves a radial-gradient's
    // stops against its radius, so a stop at 72% sits at 0.72 of the ellipse
    // either way and the profiles land where fieldCss puts them.
    ctx.save()
    ctx.beginPath()
    ctx.rect(x0, y0, x1 - x0, y1 - y0)
    ctx.clip()
    ctx.scale(scale, scale)
    ctx.translate(cx, cy)
    ctx.scale(rx, ry)

    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1)
    for (const [colour, pos] of lobe.stops) {
      // A null position is the lift's first stop, which CSS places at the centre.
      g.addColorStop(Math.max(0, Math.min(1, (pos ?? 0) / 100)), colour)
    }
    ctx.fillStyle = g
    // The clip is already in place, so this only has to be large enough to cover
    // it once mapped back through the unit-circle transform.
    ctx.fillRect(-cx / rx - 1, -cy / ry - 1, width / rx + 2, height / ry + 2)
    ctx.restore()
  }

  return true
}

/**
 * The field's wash as an image URL, ready to hand back to `background-image`.
 *
 * It goes back into a background rather than staying a `<canvas>` in the tree,
 * and that is the whole design rather than a detail. A canvas element is
 * composited: putting seven of them behind the page promoted every ancestor and
 * every overlapping section along with them, taking the layer count from 18 to
 * 45 and layer memory from 59MB to 173MB. Trading raster for that much memory
 * is not a win on a phone — it is the same stall arriving through texture
 * eviction instead. As a background image the wash is ordinary paint in the
 * layer that was already there, so the tree is exactly the shape it was before.
 *
 * PNG, not WebP: this is lossless by requirement, since a lossy encoder would
 * quietly move colours the KM model spent its whole pipeline landing on.
 *
 * Resolves null on any failure, so the caller keeps the CSS wash rather than
 * swapping a wash for blank paper.
 */
export function renderWash(spec) {
  if (typeof document === 'undefined') return Promise.resolve(null)
  let canvas
  try {
    canvas = document.createElement('canvas')
    if (!paintWash(canvas, spec)) return Promise.resolve(null)
  } catch {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    try {
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          resolve(blob ? URL.createObjectURL(blob) : null)
        }, 'image/png')
      } else {
        resolve(canvas.toDataURL('image/png'))
      }
    } catch {
      resolve(null)
    }
  })
}

/** Release a URL from `renderWash`; a data-URL fallback has nothing to free. */
export function releaseWash(url) {
  if (url && url.startsWith('blob:')) URL.revokeObjectURL(url)
}
