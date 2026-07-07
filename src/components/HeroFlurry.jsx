import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import useMediaQuery from '../hooks/useMediaQuery.js'
import { asset } from '../lib/site.js'
import { WORK } from '../content.js'

// A once-per-session flag so the flurry, like the preloader, plays on the
// first honest arrival and never replays on internal navigation.
const SEEN_KEY = 'ew-flurry-seen'

// Skip when we're navigating rather than arriving: a returning visitor this
// session, or a deep-link to an anchor (e.g. /#offerings from the FAQ nav)
// where a full-screen flourish would only stand between the visitor and the
// section they asked for. Mirrors the preloader's shouldSkip.
const shouldSkip = () => {
  if (typeof window === 'undefined') return true
  try {
    if (window.sessionStorage.getItem(SEEN_KEY)) return true
  } catch {
    // Storage blocked (private mode etc.) — fall through to the hash check.
  }
  return window.location.hash.length > 1
}

// Whether the flurry will play at all — shared with Hero so it knows whether to
// deliver its two cards via the flurry (fade them in on landing) or run its own
// fly-in entrance (reduced-motion / return visits).
export function flurryWillPlay() {
  return !shouldSkip()
}

const DURATION = 3.3 // seconds — one flowing pass, unhurried
const LAND_T = 0.62 // when the first survivor arrives on its card (near the apex)
const LAND_STAGGER = 0.05 // the second survivor lands a beat later

// When (seconds after reveal) each real hero card should fade in beneath its
// survivor as it lands, so the flying card resolves into the settled card. One
// per survivor, staggered — imported by Hero to time the two card entrances
// (and their wet-bloom wicks) to the exact landings.
export const handoffDelay = (n) => DURATION * (LAND_T + n * LAND_STAGGER) - 0.12
export const FLURRY_HANDOFF_DELAY = handoffDelay(0)
export const FLURRY_HANDOFF_DELAY_2 = handoffDelay(1)

// The dispersing crowd is drawn live from the real gallery (content.js) so the
// flurry always mirrors the current collection — add a piece to WORK and it
// joins the swirl. The two hero studies are excluded: they're the survivors,
// added separately, and they land on the hero cards rather than drifting off.
const HERO_IMGS = new Set(['art-character-boy', 'art-bouquet'])
const GALLERY_POOL = (() => {
  const imgs = []
  for (const g of WORK.groups) {
    for (const it of g.items) {
      if (it.img && !HERO_IMGS.has(it.img)) imgs.push(it.img)
    }
  }
  return imgs.length
    ? imgs
    : ['art-couple-vows', 'art-couple-sage', 'art-couple-blush', 'art-character-girl', 'art-character-boy2']
})()

// Deterministic per-card pseudo-random in [0,1) — seeded, not random, so the
// composition is identical on every arrival.
const rand = (i) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const lerp = (a, b, t) => a + (b - a) * t
const smooth = (t) => t * t * (3 - 2 * t) // smoothstep

// The flow, as waypoints [x, y, depth] in viewport fractions (depth 1 = near /
// front, 0 = far / back). One elegant pass: enter bottom-left, rise to the
// top-right apex where the hero cards sit, wrap around the back to centre, then
// sink and leave toward the gallery below. Two proportions — a wide arc biased
// to the right on landscape (headline keeps the left), a taller full-width loop
// on phones (the cards live up top).
const FLOW_DESKTOP = [
  [0.1, 0.92, 0.5],
  [0.4, 0.74, 0.85],
  [0.7, 0.5, 1.0],
  [0.9, 0.3, 0.92], // apex — top-right, near the hero cluster
  [0.74, 0.32, 0.55],
  [0.56, 0.46, 0.32],
  [0.6, 0.74, 0.3],
  [0.66, 1.12, 0.24],
]
const FLOW_MOBILE = [
  [0.08, 0.9, 0.5],
  [0.3, 0.66, 0.82],
  [0.58, 0.4, 0.96],
  [0.82, 0.18, 1.0], // apex — top, where the pair of cards sit
  [0.55, 0.24, 0.55],
  [0.4, 0.44, 0.32],
  [0.48, 0.72, 0.3],
  [0.52, 1.12, 0.24],
]
const APEX_U = 3 / 7 // the apex sits at waypoint 3 of 0…7

// Uniform Catmull-Rom through pts (each [x,y,d]); u in [0,1] → interpolated
// [x,y,d], for a smooth flowing curve through the waypoints.
const spline = (pts, u) => {
  const n = pts.length - 1
  const seg = Math.min(Math.floor(u * n), n - 1)
  const lt = u * n - seg
  const p0 = pts[Math.max(0, seg - 1)]
  const p1 = pts[seg]
  const p2 = pts[seg + 1]
  const p3 = pts[Math.min(n, seg + 2)]
  const lt2 = lt * lt
  const lt3 = lt2 * lt
  const cr = (a, b, c, d) =>
    0.5 * (2 * b + (-a + c) * lt + (2 * a - 5 * b + 4 * c - d) * lt2 + (-a + 3 * b - 3 * c + d) * lt3)
  return [cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1]), cr(p0[2], p1[2], p2[2], p3[2])]
}

// A warm paper veil that thickens on far cards, so the current recedes into
// the page's own ground — atmospheric depth, not a grey haze.
const HAZE = 'rgb(247,244,239)'

/**
 * HeroFlurry — the load flourish. On the first arrival of a session a small,
 * unhurried procession of the body of work glides across the lower screen in
 * one calm pass: pieces enter off the bottom-left, follow a single gentle arc
 * and leave off the bottom-right, always facing the camera, upright, with a
 * steady near-level tilt rather than a spin. Depth reads three ways — size,
 * layering, and a warm atmospheric veil on the far pieces — and on a fine
 * pointer the whole current parallaxes to the cursor, near pieces sliding
 * further than far. Few enough pieces are in motion at once that the arc
 * reads as one legible current, not a scatter.
 *
 * The current passes on and leaves. Two pieces — the character and the bouquet —
 * instead lift out of it and settle onto the exact measured boxes of the hero's
 * own two cards (measured from the images, so they land square on them), where
 * the real cards bloom in wet beneath: the flying studies *become* the hero
 * cards.
 *
 * Runs on every device (transform + opacity only) but yields entirely to
 * reduced-motion. Mounts once, plays ~3.5s, then unmounts.
 *
 * @param {{ref: React.RefObject<HTMLElement>, img: string, tilt: number}[]} heroTargets
 *   The hero cards to land on — a ref to each card's image, its source, and its
 *   resting tilt in degrees.
 */
export default function HeroFlurry({ heroTargets = [] }) {
  const reduce = useReducedMotion()
  const isMobile = useMediaQuery('(max-width: 639px)')
  const [skip] = useState(shouldSkip)
  const [done, setDone] = useState(false)
  const rootRef = useRef(null)

  // Viewport pinned once for the run — a 3s flourish needn't chase resizes.
  const [vp] = useState(() =>
    typeof window === 'undefined'
      ? { w: 1200, h: 800 }
      : { w: window.innerWidth, h: window.innerHeight },
  )

  // Measure the real hero cards so the survivors land square on them. Measure
  // the *image* (not the card box, which includes the caption bar): a rotated
  // element's bounding-rect centre still equals its true centre, and
  // offset{Width,Height} give the un-rotated size — so centre + size + aspect
  // all come out right despite the card's tilt.
  const [targets, setTargets] = useState(null)
  useLayoutEffect(() => {
    if (skip || reduce) return
    const measured = heroTargets.map((t) => {
      const el = t.ref?.current
      if (!el) return null
      const r = el.getBoundingClientRect()
      const w = el.offsetWidth
      const h = el.offsetHeight
      if (!w || !h) return null
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w, h, tilt: t.tilt, img: t.img }
    })
    setTargets(measured)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, reduce])

  // Depth-weighted cursor parallax: publish the pointer offset as CSS vars the
  // card transforms multiply by their own scale, so nearer (larger) pieces
  // slide further. Fine-pointer only; touch devices keep the static depth.
  useEffect(() => {
    if (skip || reduce || isMobile || typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return
    let raf = 0
    const onMove = (e) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const nx = (e.clientX / vp.w - 0.5) * 2
        const ny = (e.clientY / vp.h - 0.5) * 2
        const el = rootRef.current
        if (!el) return
        el.style.setProperty('--fx-mx', `${(nx * 16).toFixed(1)}px`)
        el.style.setProperty('--fx-my', `${(ny * 16).toFixed(1)}px`)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [skip, reduce, isMobile, vp])

  // Kept deliberately small — few enough pieces are aloft at any one moment
  // that the arc reads as a single legible current rather than a scatter.
  const count = isMobile ? 6 : 8

  // Precompute each card's whole path as sampled keyframe arrays so the run is a
  // plain transform/opacity animation.
  const cards = useMemo(() => {
    const K = 40
    const W = vp.w
    const H = vp.h
    const vmin = Math.min(W, H)

    const anchorX = W * 0.5
    const anchorY = H * 0.5
    const flow = isMobile ? FLOW_MOBILE : FLOW_DESKTOP

    const cardW = isMobile
      ? Math.min(150, Math.max(84, vmin * 0.3))
      : Math.min(158, Math.max(100, vmin * 0.15))

    const build = []

    // The current — a ribbon of gallery pieces strung along the flow, each one
    // offset in time so they stream through the arc rather than move as a block.
    for (let i = 0; i < count; i++) {
      const off = (i / count) * 0.62 // its place along the ribbon (streamed in)
      const travel = 0.42 + rand(i + 2) * 0.12
      const laneX = (rand(i + 7) - 0.5) * 0.05 * W // a tight scatter off the spine
      const laneY = (rand(i + 8) - 0.5) * 0.04 * H
      const sizeVar = 0.94 + rand(i + 5) * 0.14
      const tilt = (rand(i + 9) - 0.5) * 6
      const lean = (rand(i + 12) - 0.5) * 8 // a gentle lean, not a spin, along the flow
      const xs = []
      const ys = []
      const ss = []
      const os = []
      const zs = []
      const rs = []
      const hz = []
      const times = []
      for (let k = 0; k < K; k++) {
        const t = k / (K - 1)
        times.push(t)
        const s = clamp01((t - off) / travel)
        const u = smooth(s)
        const [fx, fy, fd] = spline(flow, u)
        const near = clamp01(fd)
        xs.push(Math.round(fx * W + laneX - anchorX))
        ys.push(Math.round(fy * H + laneY - anchorY))
        ss.push(+((0.46 + 0.62 * near) * sizeVar).toFixed(3))
        zs.push(Math.round(near * 1000))
        rs.push(+(tilt + lean * u).toFixed(2))
        hz.push(+((1 - near) * 0.5).toFixed(3))
        // Fade up as it enters, out as it sinks away at the end — long, soft
        // edges so nothing snaps in or out.
        const op = Math.min(1, s / 0.16) * (s < 0.86 ? 1 : Math.max(0, 1 - (s - 0.86) / 0.16))
        os.push(+op.toFixed(3))
      }
      build.push({
        img: GALLERY_POOL[(i * 3) % GALLERY_POOL.length],
        ar: '3 / 4',
        pw: 1, // parallax weight — the crowd reacts to the cursor
        xs, ys, ss, os, zs, rs, hz, times, cardW, startDelay: 0,
      })
    }

    // The survivors — one per measured hero card. They ride the flow up toward
    // the apex, then in the final stretch settle onto their card's image box,
    // growing to match: the two chosen pieces lift out of the current.
    ;(targets || []).forEach((tg, n) => {
      if (!tg) return
      const i = count + n
      const tilt = (rand(i + 9) - 0.5) * 8
      const tScale = tg.w / cardW
      const landT = LAND_T + n * LAND_STAGGER
      const peelStart = landT * 0.72
      const fadeStart = landT + 0.02
      const laneX = (rand(i + 7) - 0.5) * 0.05 * W
      const xs = []
      const ys = []
      const ss = []
      const os = []
      const zs = []
      const rs = []
      const hz = []
      const times = []
      for (let k = 0; k < K; k++) {
        const t = k / (K - 1)
        times.push(t)
        // Ride the flow up to the apex by landT…
        const u = smooth(clamp01(t / landT)) * APEX_U
        const [fx, fy, fd] = spline(flow, u)
        const pathX = fx * W + laneX
        const pathY = fy * H
        const pathScale = 0.5 + 0.6 * clamp01(fd)
        // …then home onto the card in the final stretch.
        const w = smooth(clamp01((t - peelStart) / (landT - peelStart)))
        const bump = Math.max(0, 1 - Math.abs((t - landT) / 0.06))
        xs.push(Math.round(lerp(pathX, tg.cx, w) - anchorX))
        ys.push(Math.round(lerp(pathY, tg.cy, w) - anchorY))
        ss.push(+(lerp(pathScale, tScale, w) * (1 + 0.045 * bump)).toFixed(3))
        rs.push(+lerp(tilt, tg.tilt, w).toFixed(2))
        zs.push(1600) // above the crowd — these are the chosen pieces
        hz.push(0)
        const fin = Math.min(1, t / 0.08)
        const fout = t < fadeStart ? 1 : Math.max(0, 1 - (t - fadeStart) / 0.1)
        os.push(+(fin * fout).toFixed(3))
      }
      build.push({
        img: tg.img,
        ar: `${tg.w} / ${tg.h}`,
        survivor: true,
        pw: 0, // survivors ignore the cursor so they land dead-on
        xs, ys, ss, os, zs, rs, hz, times, cardW, startDelay: 0,
      })
    })

    return build
  }, [count, isMobile, vp, targets])

  // Retire the overlay once the last piece has gone. Skip straight to done when
  // there's nothing to play, so no timer runs under reduced-motion / skip.
  useEffect(() => {
    if (skip || reduce) {
      setDone(true)
      return
    }
    try {
      window.sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      // Best effort — without storage the flurry simply replays next visit.
    }
    const t = window.setTimeout(() => setDone(true), (DURATION + 0.5) * 1000)
    return () => window.clearTimeout(t)
  }, [skip, reduce])

  if (skip || reduce || done) return null

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      style={{ isolation: 'isolate', '--fx-mx': '0px', '--fx-my': '0px' }}
    >
      {cards.map((card, i) => (
        <motion.figure
          key={i}
          className={
            'absolute left-1/2 top-1/2 overflow-hidden border border-line bg-paper-deep ' +
            (card.survivor
              ? 'rounded-[1.25rem] shadow-[0_28px_52px_-18px_rgba(94,74,140,0.30),0_6px_16px_-6px_rgba(94,74,140,0.12)]'
              : 'rounded-[0.9rem] shadow-[0_12px_30px_-12px_rgba(94,74,140,0.38),0_3px_10px_-4px_rgba(142,68,112,0.30)]')
          }
          style={{ width: card.cardW, willChange: 'transform, opacity' }}
          initial={{ x: card.xs[0], y: card.ys[0], scale: card.ss[0], rotate: card.rs[0], opacity: 0, zIndex: card.zs[0] }}
          animate={{ x: card.xs, y: card.ys, scale: card.ss, rotate: card.rs, opacity: card.os, zIndex: card.zs }}
          transition={{ duration: DURATION, delay: card.startDelay, ease: 'linear', times: card.times }}
          // Centre on the point, add depth-weighted cursor parallax, then scale,
          // tilt upright, and place — a 2D transform only, always facing camera.
          transformTemplate={(latest) =>
            `translate(` +
            `calc(${latest.x} + var(--fx-mx,0px) * ${card.pw} * ${latest.scale}), ` +
            `calc(${latest.y} + var(--fx-my,0px) * ${card.pw} * ${latest.scale})` +
            `) rotate(${latest.rotate}) scale(${latest.scale}) translate(-50%, -50%)`
          }
        >
          <picture>
            <source srcSet={asset(`assets/${card.img}.webp`)} type="image/webp" />
            <img
              src={asset(`assets/${card.img}.jpg`)}
              alt=""
              loading="eager"
              decoding="async"
              onError={(e) => (e.currentTarget.style.display = 'none')}
              className="w-full object-cover"
              style={{ aspectRatio: card.ar }}
            />
          </picture>
          {/* Atmospheric veil — thicker on far pieces, gone by the time a
              survivor lands. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: HAZE }}
            initial={{ opacity: card.hz[0] }}
            animate={{ opacity: card.hz }}
            transition={{ duration: DURATION, delay: card.startDelay, ease: 'linear', times: card.times }}
          />
        </motion.figure>
      ))}
    </div>
  )
}
