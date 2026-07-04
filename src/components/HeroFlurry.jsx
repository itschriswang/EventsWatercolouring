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

const DURATION = 3 // seconds, the whole flourish
const LAND_START = 0.5 // when survivors peel off the swirl toward the hero slots
const LAND_T = 0.84 // when the first survivor arrives
const LAND_STAGGER = 0.06 // the second survivor lands a beat later

// When (seconds after reveal) each real hero card should fade in beneath its
// survivor as it lands, so the flying card resolves into the settled card. One
// per survivor, staggered — imported by Hero to time the two card entrances
// (and their wet-bloom wicks) to the exact landings.
export const handoffDelay = (n) => DURATION * (LAND_T + n * LAND_STAGGER) - 0.15
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
const easeOut = (t) => 1 - (1 - t) * (1 - t)
const easeIn = (t) => t * t
const entrance = (t) => Math.min(1, t / 0.12)
const exit = (t) => (t < 0.74 ? 1 : Math.max(0, 1 - (t - 0.74) / 0.26))
// Dispersing cards hold their swirl, then in the back half sink and fan out
// toward the bottom-left and bottom-right edges.
const disperse = (t) => (t < 0.48 ? 0 : easeIn((t - 0.48) / 0.52))

// A warm paper veil that thickens on far cards, so the cylinder recedes into
// the page's own ground — atmospheric depth, not a grey haze.
const HAZE = 'rgb(245, 238, 227)'

/**
 * HeroFlurry — the load flourish. On the first arrival of a session the body of
 * work swirls through an angled cylinder low across the screen: pieces travel a
 * circular path in depth but always face the camera, upright. Depth reads three
 * ways — size, layering, and a warm atmospheric veil on the far pieces — and on
 * a fine pointer the whole cloud parallaxes to the cursor, near pieces sliding
 * further than far, so the volume is felt, not just implied.
 *
 * Most pieces sink and tumble out toward the bottom corners and fade. Two — the
 * character and the bouquet — instead peel off the swirl and fly to the exact
 * measured boxes of the hero's own two cards (measured from the images, so they
 * land square on them), where the real cards bloom in wet beneath: the flying
 * studies *become* the hero cards.
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

  const count = isMobile ? 8 : 12

  // Precompute each card's whole path as sampled keyframe arrays so the run is a
  // plain transform/opacity animation.
  const cards = useMemo(() => {
    const K = 40
    const W = vp.w
    const H = vp.h
    const vmin = Math.min(W, H)

    const anchorX = W * 0.5
    const anchorY = H * 0.5
    const cx = W * 0.5
    const cy = H * (isMobile ? 0.6 : 0.58)

    // The cylinder axis, tilted a few degrees off horizontal — the angled tube
    // running bottom-left to bottom-right.
    const axisRad = (isMobile ? -6 : -8) * (Math.PI / 180)
    const ax = Math.cos(axisRad)
    const ay = Math.sin(axisRad)
    const perpX = -ay
    const perpY = ax

    const AL = W * (isMobile ? 0.42 : 0.46)
    const RV = H * (isMobile ? 0.2 : 0.24)
    const FALL = H * 0.55
    const SPIN = Math.PI * 2 * (isMobile ? 1.0 : 1.15)

    const cardW = isMobile
      ? Math.min(150, Math.max(84, vmin * 0.3))
      : Math.min(158, Math.max(100, vmin * 0.15))

    // Shared swirl geometry for a card at index i and time t.
    const swirl = (i, t) => {
      const angle0 = (i / count) * Math.PI * 2 + (rand(i + 2) - 0.5) * 0.9
      const rv = RV * (0.7 + rand(i + 6) * 0.6)
      const a = angle0 + SPIN * easeOut(t)
      return { cosA: Math.cos(a), depth: Math.sin(a), rv }
    }

    const build = []

    // The dispersing crowd, drawn from the live gallery pool.
    for (let i = 0; i < count; i++) {
      const u0 = ((i / (count - 1)) * 2 - 1) * (0.6 + rand(i + 1) * 0.5)
      const sizeVar = 0.82 + rand(i + 5) * 0.42
      const tilt = (rand(i + 9) - 0.5) * 9
      const drift = (rand(i + 11) - 0.5) * 46 // tumble as it falls
      const fallK = 0.75 + rand(i + 8) * 0.6 // varied fall speed
      const startDelay = rand(i + 4) * 0.08
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
        const { cosA, depth, rv } = swirl(i, t)
        const spread = disperse(t)
        const along = u0 * (1 + 1.5 * spread)
        const px = cx + ax * (along * AL) + perpX * (cosA * rv)
        const py = cy + ay * (along * AL) + perpY * (cosA * rv) + FALL * fallK * spread
        const near = (depth + 1) / 2
        xs.push(Math.round(px - anchorX))
        ys.push(Math.round(py - anchorY))
        ss.push(+(sizeVar * (0.58 + 0.62 * near)).toFixed(3))
        zs.push(Math.round(near * 1000))
        rs.push(+(tilt + drift * spread).toFixed(2))
        hz.push(+((1 - near) * 0.55).toFixed(3))
        const fade = Math.max(0, entrance(t) - (1 - exit(t)))
        os.push(+(fade * (0.7 + 0.3 * near)).toFixed(3))
      }
      build.push({
        img: GALLERY_POOL[(i * 3) % GALLERY_POOL.length],
        ar: '3 / 4',
        pw: 1, // parallax weight — the crowd reacts to the cursor
        xs, ys, ss, os, zs, rs, hz, times, cardW, startDelay,
      })
    }

    // The survivors — one per measured hero card. They swirl among the crowd,
    // then peel off and home in on their card's image box, growing to match.
    ;(targets || []).forEach((tg, n) => {
      if (!tg) return
      const i = count + n
      const tilt = (rand(i + 9) - 0.5) * 8
      const tScale = tg.w / cardW
      const landStart = LAND_START + n * LAND_STAGGER
      const landT = LAND_T + n * LAND_STAGGER
      const fadeStart = landT + 0.02
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
        const { cosA, depth, rv } = swirl(i, t)
        const near = (depth + 1) / 2
        const swx = cx + perpX * (cosA * rv) + ax * (rand(i + 1) - 0.5) * AL * 1.1
        const swy = cy + perpY * (cosA * rv) + ay * (rand(i + 1) - 0.5) * AL * 1.1
        const swScale = 0.6 + 0.55 * near
        const w = smooth(clamp01((t - landStart) / (landT - landStart)))
        // Clean homing on position; a small settle-overshoot on scale only.
        const bump = Math.max(0, 1 - Math.abs((t - landT) / 0.06))
        xs.push(Math.round(lerp(swx, tg.cx, w) - anchorX))
        ys.push(Math.round(lerp(swy, tg.cy, w) - anchorY))
        ss.push(+(lerp(swScale, tScale, w) * (1 + 0.045 * bump)).toFixed(3))
        rs.push(+lerp(tilt, tg.tilt, w).toFixed(2))
        zs.push(1600) // above the crowd — these are the chosen pieces
        hz.push(+((1 - near) * 0.4 * (1 - w)).toFixed(3))
        const fin = Math.min(1, t / 0.1)
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
              ? 'rounded-[1.25rem] shadow-[0_28px_52px_-18px_rgba(173,98,49,0.30),0_6px_16px_-6px_rgba(173,98,49,0.12)]'
              : 'rounded-[0.9rem] shadow-[0_12px_30px_-12px_rgba(173,98,49,0.38),0_3px_10px_-4px_rgba(115,46,17,0.30)]')
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
