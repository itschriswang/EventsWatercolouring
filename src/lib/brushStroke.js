// A centreline turned into the outline of a brushstroke.
//
// A pen draws one width all the way along; a brush does not. It lands with a
// little weight, swells while the stroke is travelling, and thins to a point
// as it lifts — and its two edges never run quite parallel, because the hairs
// splay and gather as it moves. An SVG `stroke-width` can say none of that,
// which is why the site's underlines read as marker rather than paint.
//
// The pressure profile follows p5.brush's (Alejandro Campos Uribe, MIT):
// a flattened bell, 1 / (1 + |u|^2c), where u is the distance from the peak
// over a half-width that is wider before the peak than after it. That
// asymmetry is the point — the brush builds pressure over a long landing and
// lifts off quickly — and the exponent c around 3 gives a plateau through the
// middle of the stroke rather than a needle.
//
// Pure geometry, run once per path at module load: no DOM, no canvas, nothing
// per frame. The result is an SVG path string to be filled, nonzero, which is
// what lets a tight hairpin overlap itself without punching a hole.

/** Cubic Bézier point at t. */
const bez = (p0, p1, p2, p3, t) => {
  const u = 1 - t
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ]
}

/**
 * Points along an absolute `M … C …` path, flattened. The underline paths are
 * exactly that shape (a move, then cubic segments with the C implied after the
 * first); anything else is refused rather than guessed at.
 */
function flatten(d) {
  const tokens = d.match(/[MC]|-?\d*\.?\d+(?:e-?\d+)?/gi)
  if (!tokens || tokens[0] !== 'M') throw new Error('brushStroke: expected a path starting with M')
  const nums = []
  let mode = null
  const pts = []
  let cur = null
  const flush = () => {
    while (nums.length >= (mode === 'M' ? 2 : 6)) {
      if (mode === 'M') {
        cur = [nums.shift(), nums.shift()]
        pts.push(cur)
        mode = 'C'
      } else {
        const c1 = [nums.shift(), nums.shift()]
        const c2 = [nums.shift(), nums.shift()]
        const end = [nums.shift(), nums.shift()]
        for (let i = 1; i <= 40; i++) pts.push(bez(cur, c1, c2, end, i / 40))
        cur = end
      }
    }
  }
  for (const t of tokens) {
    if (t === 'M' || t === 'C') {
      flush()
      mode = t
    } else if (/[a-z]/i.test(t)) {
      throw new Error(`brushStroke: unsupported command ${t}`)
    } else {
      nums.push(parseFloat(t))
    }
  }
  flush()
  return pts
}

/** The same polyline, resampled to n points evenly spaced by arc length. */
function resample(pts, n) {
  const cum = [0]
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  }
  const L = cum[cum.length - 1]
  const out = []
  let j = 1
  for (let k = 0; k < n; k++) {
    const s = (k / (n - 1)) * L
    while (j < pts.length - 1 && cum[j] < s) j++
    const span = cum[j] - cum[j - 1] || 1
    const f = (s - cum[j - 1]) / span
    out.push([
      pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * f,
      pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * f,
    ])
  }
  return { pts: out, length: L }
}

/** A small deterministic generator, so a path's stroke is the same every load. */
function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}

/**
 * The outline of a brushstroke along `d`, as an SVG path to fill.
 *
 *   width     the widest the stroke gets, in the path's own units
 *   min       its narrowest, as a fraction of width, where it lands and lifts
 *   seed      varies the peak, the plateau and the edge wobble per stroke
 */
export function brushOutline(d, { width = 13, min = 0.2, seed = 1 } = {}) {
  const r = rng(seed)
  const N = 300
  const { pts } = resample(flatten(d), N)

  // p5.brush's pressure bell: peak a little ahead of centre, the landing side
  // 1.2x wider than the lifting side, exponent 2c with c in [3, 3.5].
  const peak = 0.42 + r() * 0.12
  const half = 0.42
  const c = 3 + r() * 0.5
  const pressure = (t) => {
    const hw = (t < peak ? half * 1.2 : half * 0.8) || 1e-3
    return 1 / (1 + Math.pow(Math.abs((t - peak) / hw), 2 * c))
  }

  // The two edges wander independently, a few percent of the width, on a slow
  // sum of sines — hairs splaying and gathering, not jitter.
  const phase = [r() * 6.28, r() * 6.28, r() * 6.28, r() * 6.28]
  const wobble = (t, k) => 0.06 * Math.sin(t * 9.1 + phase[k]) + 0.04 * Math.sin(t * 23.7 + phase[k + 1])

  const left = []
  const right = []
  const halfW = []
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(N - 1, i + 1)]
    let tx = b[0] - a[0]
    let ty = b[1] - a[1]
    const n = Math.hypot(tx, ty) || 1
    tx /= n
    ty /= n
    const w = (width / 2) * (min + (1 - min) * pressure(t))
    halfW.push(w)
    const [x, y] = pts[i]
    left.push([x - ty * w * (1 + wobble(t, 0)), y + tx * w * (1 + wobble(t, 0))])
    right.push([x + ty * w * (1 + wobble(t, 2)), y - tx * w * (1 + wobble(t, 2))])
  }

  // Round ends at the stroke's own width there: a brush lifting off leaves a
  // rounded tip, not a square cut.
  const cap = (centre, from, w, steps = 8) => {
    const a0 = Math.atan2(from[1] - centre[1], from[0] - centre[0])
    const out = []
    for (let k = 1; k < steps; k++) {
      const a = a0 - (Math.PI * k) / steps
      out.push([centre[0] + Math.cos(a) * w, centre[1] + Math.sin(a) * w])
    }
    return out
  }

  const ring = [
    ...left,
    ...cap(pts[N - 1], left[N - 1], halfW[N - 1]),
    ...right.reverse(),
    ...cap(pts[0], right[right.length - 1], halfW[0]),
  ]
  const f = (v) => Number(v.toFixed(2))
  return 'M' + ring.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z'
}
