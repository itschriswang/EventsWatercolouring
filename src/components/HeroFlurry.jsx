import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import useMediaQuery from '../hooks/useMediaQuery.js'
import { asset } from '../lib/site.js'

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
const LAND_T = 0.84 // when they arrive, matched to the hero-card fade-in below
// When (seconds after reveal) the real hero cards should fade in beneath the
// survivor as it lands, so the flying card resolves into the settled card.
export const FLURRY_HANDOFF_DELAY = DURATION * LAND_T - 0.15

// The dispersing crowd. The two hero studies (character-boy, bouquet) are not
// here — they are the survivors, added separately below, and they land on the
// real hero cards rather than drifting off. A few pieces repeat so the cloud
// reads full; at this speed the reprise is invisible.
const PIECES = [
  'art-couple-vows',
  'art-couple-sage',
  'art-couple-blush',
  'art-character-girl',
  'art-couple-blush',
  'art-couple-vows',
  'art-couple-sage',
  'art-character-girl',
  'art-couple-blush',
  'art-couple-vows',
  'art-couple-sage',
  'art-character-girl',
]

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

/**
 * HeroFlurry — the load flourish. On the first arrival of a session the body of
 * work swirls through an angled cylinder low across the screen: pieces travel a
 * circular path in depth but always face the camera, upright, depth reading
 * through size and layering rather than rotation.
 *
 * Most pieces sink and fan out toward the bottom corners and fade. Two — the
 * character and the bouquet — instead peel off the swirl and fly to the exact
 * measured positions of the hero's own two cards, growing to match, where the
 * real cards fade in beneath them: the flying studies *become* the hero cards.
 *
 * Runs on every device (transform + opacity only) but yields entirely to
 * reduced-motion. Mounts once, plays ~3.5s, then unmounts.
 *
 * @param {{ref: React.RefObject<HTMLElement>, img: string, tilt: number}[]} heroTargets
 *   The hero cards to land on — a ref to each card's box, its source image, and
 *   its resting tilt in degrees.
 */
export default function HeroFlurry({ heroTargets = [] }) {
  const reduce = useReducedMotion()
  const isMobile = useMediaQuery('(max-width: 639px)')
  const [skip] = useState(shouldSkip)
  const [done, setDone] = useState(false)

  // Viewport pinned once for the run — a 3s flourish needn't chase resizes.
  const [vp] = useState(() =>
    typeof window === 'undefined'
      ? { w: 1200, h: 800 }
      : { w: window.innerWidth, h: window.innerHeight },
  )

  // Measure the real hero cards' on-screen boxes so the survivors can land on
  // them exactly. Read before paint; the cards hold their layout box from the
  // first frame (they only fade in), so the measurement is their final resting
  // position even though they're not yet visible.
  const [targets, setTargets] = useState(null)
  useLayoutEffect(() => {
    if (skip || reduce) return
    const measured = heroTargets.map((t) => {
      const el = t.ref?.current
      if (!el) return null
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) return null
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, tilt: t.tilt, img: t.img }
    })
    setTargets(measured)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, reduce])

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

    // Shared swirl position for a card at index i and time t.
    const swirl = (i, t) => {
      const angle0 = (i / count) * Math.PI * 2 + (rand(i + 2) - 0.5) * 0.9
      const rv = RV * (0.7 + rand(i + 6) * 0.6)
      const a = angle0 + SPIN * easeOut(t)
      const cosA = Math.cos(a)
      const depth = Math.sin(a)
      return { cosA, depth, rv, angle0 }
    }

    const build = []

    // The dispersing crowd.
    for (let i = 0; i < count; i++) {
      const u0 = ((i / (count - 1)) * 2 - 1) * (0.6 + rand(i + 1) * 0.5)
      const sizeVar = 0.82 + rand(i + 5) * 0.42
      const tilt = (rand(i + 9) - 0.5) * 9
      const startDelay = rand(i + 4) * 0.08
      const xs = []
      const ys = []
      const ss = []
      const os = []
      const zs = []
      const rs = []
      const times = []
      for (let k = 0; k < K; k++) {
        const t = k / (K - 1)
        times.push(t)
        const { cosA, depth, rv } = swirl(i, t)
        const spread = disperse(t)
        const along = u0 * (1 + 1.5 * spread)
        const px = cx + ax * (along * AL) + perpX * (cosA * rv)
        const py = cy + ay * (along * AL) + perpY * (cosA * rv) + FALL * spread
        const near = (depth + 1) / 2
        xs.push(Math.round(px - anchorX))
        ys.push(Math.round(py - anchorY))
        ss.push(+(sizeVar * (0.58 + 0.62 * near)).toFixed(3))
        zs.push(Math.round(near * 1000))
        rs.push(tilt)
        const fade = Math.max(0, entrance(t) - (1 - exit(t)))
        os.push(+(fade * (0.68 + 0.32 * near)).toFixed(3))
      }
      build.push({ img: PIECES[i % PIECES.length], ar: '3 / 4', xs, ys, ss, os, zs, rs, times, cardW, startDelay })
    }

    // The survivors — one per measured hero card. They swirl among the crowd,
    // then fly to their card's box and grow to fill it, always facing camera.
    ;(targets || []).forEach((tg, n) => {
      if (!tg) return
      const i = count + n // distinct swirl phase from the crowd
      const sizeVar = 1
      const tilt = (rand(i + 9) - 0.5) * 8
      const tScale = tg.w / cardW
      const xs = []
      const ys = []
      const ss = []
      const os = []
      const zs = []
      const rs = []
      const times = []
      for (let k = 0; k < K; k++) {
        const t = k / (K - 1)
        times.push(t)
        const { cosA, depth, rv } = swirl(i, t)
        const near = (depth + 1) / 2
        const swx = cx + perpX * (cosA * rv) + ax * (rand(i + 1) - 0.5) * AL * 1.1
        const swy = cy + perpY * (cosA * rv) + ay * (rand(i + 1) - 0.5) * AL * 1.1
        const swScale = sizeVar * (0.6 + 0.55 * near)
        // Peel off and home in on the hero card's box.
        const w = smooth(clamp01((t - LAND_START) / (LAND_T - LAND_START)))
        const px = lerp(swx, tg.cx, w)
        const py = lerp(swy, tg.cy, w)
        xs.push(Math.round(px - anchorX))
        ys.push(Math.round(py - anchorY))
        ss.push(+lerp(swScale, tScale, w).toFixed(3))
        rs.push(+lerp(tilt, tg.tilt, w).toFixed(2))
        zs.push(1600) // above the crowd — these are the chosen pieces
        // Hold full through the landing, then dissolve as the real card solidifies.
        const fin = Math.min(1, t / 0.1)
        const fout = t < 0.9 ? 1 : Math.max(0, 1 - (t - 0.9) / 0.1)
        os.push(+(fin * fout).toFixed(3))
      }
      build.push({ img: tg.img, ar: '4 / 5', survivor: true, xs, ys, ss, os, zs, rs, times, cardW, startDelay: 0 })
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
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      style={{ isolation: 'isolate' }}
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
          // Centre on the point, then scale, tilt upright, and place — a 2D
          // transform only, so the card always faces the camera.
          transformTemplate={(latest) =>
            `translate(${latest.x}, ${latest.y}) rotate(${latest.rotate}) scale(${latest.scale}) translate(-50%, -50%)`
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
        </motion.figure>
      ))}
    </div>
  )
}
