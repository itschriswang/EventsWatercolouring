/**
 * CLAUDE.md's first anti-mud rule as a measurement: where, in a bloom field
 * at a given rendered size, would a yellow-green and a rose both deposit
 * visibly? Used by check-wash (its ADJACENCY stage); kept apart so a spec can
 * be tried against it without rendering anything.
 */

import { glaze, fieldLobes, profileThickness, vwAxis } from '../src/lib/watercolour.js'

// Which pigments the rule keeps apart: the protected glow on one side, the
// pinks on the other.
const GREENS = new Set(['yellowgreen', 'lemonlime'])
const ROSES = new Set(['rose', 'blush', 'blossom', 'aurora_rose'])

/**
 * Both have to show for it to be mud. 3/255 is about where a single glaze of
 * either reads at all against paper (yellow-green at thickness 0.02, blush at
 * 0.05); below it the overlap is two fringes that never meet visibly.
 */
export const ADJACENT_LEVEL = 3

/**
 * The worst pixel where a green and a rose both deposit visibly.
 *
 * Checked in each tier's own footprint, since they reach different places:
 * the canvas paints each bloom's ellipse with its profile (its domain warp
 * moves every bloom at a pixel together, so it cannot carry two separated
 * washes into each other), while CSS lays each down as three lobes whose
 * satellites reach further out. Lifts count against both, as the gap the rule
 * allows: the canvas takes thickness off by their profile, CSS creams over.
 */
export function adjacency(blooms, over, { w, h, vw }) {
  const devMemo = new Map()
  const canvasDev = (name, t) => {
    const key = `${name}:${Math.round(t * 500)}`
    if (!devMemo.has(key)) {
      const r = glaze([[name, Math.round(t * 500) / 500]], over)
      devMemo.set(key, Math.max(...r.map((c, i) => Math.abs(c - over[i]))) * 255)
    }
    return devMemo.get(key)
  }

  const canvas = blooms.map((b) => {
    const ext = b.extent ?? 0.72
    const rx = (b.sizeVw ? (vwAxis(b.sizeVw, 0) * vw) / 100 : b.size[0] * w) * ext
    const ry = (b.sizeVw ? (vwAxis(b.sizeVw, 1) * vw) / 100 : b.size[1] * h) * ext
    return { b, cx: b.at[0] * w, cy: b.at[1] * h, rx, ry }
  })

  const lobes = fieldLobes(blooms, over).map((l) => {
    const rx = l.sizeVw ? (l.sizeVw[0] * vw) / 100 : (l.sizePct[0] / 100) * w
    const ry = l.sizeVw ? (l.sizeVw[1] * vw) / 100 : (l.sizePct[1] / 100) * h
    const cx = (l.atPct[0] / 100) * w + (l.offVw ? (l.offVw[0] * vw) / 100 : 0)
    const cy = (l.atPct[1] / 100) * h + (l.offVw ? (l.offVw[1] * vw) / 100 : 0)
    // Premultiplied deviation at each stop, which is what CSS interpolates.
    const stops = l.stops.map(([c, pos]) => {
      const m = c.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?/)
      const a = m ? (m[4] === undefined ? 1 : +m[4]) : 0
      const dev = m ? Math.max(...[1, 2, 3].map((k, i) => Math.abs(+m[k] / 255 - over[i]))) * a * 255 : 0
      return [pos ?? 0, dev, a]
    })
    return { l, cx, cy, rx, ry, stops }
  })
  const at = (stops, r) => {
    for (let i = 1; i < stops.length; i++) {
      if (r <= stops[i][0]) {
        const [p0, d0, a0] = stops[i - 1]
        const [p1, d1, a1] = stops[i]
        const u = p1 > p0 ? (r - p0) / (p1 - p0) : 1
        return [d0 + (d1 - d0) * u, a0 + (a1 - a0) * u]
      }
    }
    return [0, 0]
  }

  const step = Math.max(4, Math.round(Math.max(w, h) / 400))
  let worst = { level: 0 }
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      // Canvas footprint.
      let g = 0
      let r = 0
      let gn = ''
      let rn = ''
      let lift = 0
      for (const c of canvas) {
        const d = Math.hypot((x - c.cx) / c.rx, (y - c.cy) / c.ry)
        if (d >= 1) continue
        const t = profileThickness(c.b.wetness ?? 'dry', d)
        if (c.b.lift) {
          lift += c.b.lift * t
          continue
        }
        const name = c.b.pigment
        if (!GREENS.has(name) && !ROSES.has(name)) continue
        const dev = canvasDev(name, c.b.x * t)
        if (GREENS.has(name) && dev > g) [g, gn] = [dev, name]
        if (ROSES.has(name) && dev > r) [r, rn] = [dev, name]
      }
      let level = Math.min(g, r) * Math.max(0, 1 - lift)
      if (level > worst.level) worst = { level, green: gn, rose: rn, at: `${x},${y}`, tier: 'canvas' }

      // CSS footprint.
      g = r = 0
      let cream = 0
      for (const o of lobes) {
        const d = Math.hypot((x - o.cx) / o.rx, (y - o.cy) / o.ry) * 100
        const [dev, a] = at(o.stops, d)
        if (o.l.lift) {
          cream = 1 - (1 - cream) * (1 - a)
          continue
        }
        const name = o.l.pigment
        if (GREENS.has(name) && dev > g) [g, gn] = [dev, name]
        if (ROSES.has(name) && dev > r) [r, rn] = [dev, name]
      }
      level = Math.min(g, r) * (1 - cream)
      if (level > worst.level) worst = { level, green: gn, rose: rn, at: `${x},${y}`, tier: 'css' }
    }
  }
  return worst
}
