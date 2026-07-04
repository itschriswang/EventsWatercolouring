import { useEffect, useMemo, useState } from 'react'
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

// The body of work, swirled. The hero's own two studies (character-boy,
// bouquet) are intentionally left out — this is decoration floating over the
// page, never something that lands on or becomes the two cards below. A few
// pieces repeat so the cloud reads full without more source images; at this
// speed the reprise is invisible.
const PIECES = [
  'art-couple-vows',
  'art-couple-sage',
  'art-couple-blush',
  'art-character-girl',
  'art-character-boy2',
  'art-couple-blush',
  'art-couple-vows',
  'art-couple-sage',
  'art-character-girl',
  'art-character-boy2',
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

// Timeline envelopes, t in [0,1].
const easeOut = (t) => 1 - (1 - t) * (1 - t)
const easeIn = (t) => t * t
// Fade in fast at the start, hold, then fade out as the cloud drifts off.
const entrance = (t) => Math.min(1, t / 0.12)
const exit = (t) => (t < 0.74 ? 1 : Math.max(0, 1 - (t - 0.74) / 0.26))
// Cards hold their swirl, then in the back half sink and fan outward along the
// tube — sweeping off toward the bottom-left and bottom-right edges.
const disperse = (t) => (t < 0.48 ? 0 : easeIn((t - 0.48) / 0.52))

/**
 * HeroFlurry — the load flourish. On the first arrival of a session the body
 * of work swirls through an *angled* cylinder low across the screen: pieces
 * travel a circular path in depth, but always face the camera — they never
 * rotate away. Depth reads through size and layering (near pieces larger and
 * in front, far pieces smaller and behind), the cards staying upright
 * throughout. They swirl, then sink and fan out toward the bottom corners and
 * fade, a pure overlay that floats over the page and leaves the hero's own two
 * studies untouched beneath it.
 *
 * Runs on every device (transform + opacity only) but yields entirely to
 * reduced-motion. It mounts once, plays ~3s, then unmounts so it costs nothing
 * for the rest of the visit.
 */
export default function HeroFlurry() {
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

  const count = isMobile ? 9 : 14

  // Precompute each card's whole path as sampled keyframe arrays (position,
  // scale, opacity, stacking) so the run is a plain transform/opacity animation
  // with no per-frame trig on the main thread beyond what the compositor does.
  const cards = useMemo(() => {
    const K = 36
    const W = vp.w
    const H = vp.h
    const vmin = Math.min(W, H)

    // Anchor is the viewport centre (cards sit at left/top 50%); the cloud's
    // centre is pushed low so it sweeps the bottom, not the hero.
    const anchorX = W * 0.5
    const anchorY = H * 0.5
    const cx = W * 0.5
    const cy = H * (isMobile ? 0.6 : 0.58)

    // The cylinder axis, tilted a few degrees off horizontal — the "angled"
    // tube running bottom-left to bottom-right.
    const axisRad = (isMobile ? -6 : -8) * (Math.PI / 180)
    const ax = Math.cos(axisRad)
    const ay = Math.sin(axisRad)
    const perpX = -ay
    const perpY = ax

    const AL = W * (isMobile ? 0.42 : 0.46) // axis half-length (horizontal reach)
    const RV = H * (isMobile ? 0.2 : 0.24) // vertical orbit radius on screen
    const FALL = H * 0.55
    const SPIN = Math.PI * 2 * (isMobile ? 1.0 : 1.15)

    const cardW = isMobile
      ? Math.min(150, Math.max(84, vmin * 0.3))
      : Math.min(158, Math.max(100, vmin * 0.15))

    return Array.from({ length: count }, (_, i) => {
      const u0 = ((i / (count - 1)) * 2 - 1) * (0.6 + rand(i + 1) * 0.5) // spread along tube
      const angle0 = (i / count) * Math.PI * 2 + (rand(i + 2) - 0.5) * 0.9
      const sizeVar = 0.82 + rand(i + 5) * 0.42
      const tilt = (rand(i + 9) - 0.5) * 9 // slight upright wobble, in-plane only
      const startDelay = rand(i + 4) * 0.08
      const rv = RV * (0.7 + rand(i + 6) * 0.6) // per-card orbit height, so it scatters

      const xs = []
      const ys = []
      const ss = []
      const os = []
      const zs = []
      const times = []
      for (let k = 0; k < K; k++) {
        const t = k / (K - 1)
        times.push(t)
        const a = angle0 + SPIN * easeOut(t)
        const cosA = Math.cos(a)
        const depth = Math.sin(a) // +1 nearest camera, -1 farthest
        const spread = disperse(t)
        const along = u0 * (1 + 1.5 * spread)
        const px = cx + ax * (along * AL) + perpX * (cosA * rv)
        const py = cy + ay * (along * AL) + perpY * (cosA * rv) + FALL * spread
        const near = (depth + 1) / 2 // 0..1
        xs.push(Math.round(px - anchorX))
        ys.push(Math.round(py - anchorY))
        ss.push(+(sizeVar * (0.58 + 0.62 * near)).toFixed(3))
        zs.push(Math.round(near * 1000))
        const fade = Math.max(0, entrance(t) - (1 - exit(t)))
        os.push(+(fade * (0.68 + 0.32 * near)).toFixed(3))
      }
      return { img: PIECES[i % PIECES.length], xs, ys, ss, os, zs, times, tilt, cardW, startDelay }
    })
  }, [count, isMobile, vp])

  // Retire the overlay once the last piece has left. Skip straight to done when
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
    const t = window.setTimeout(() => setDone(true), 3600)
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
          className="absolute left-1/2 top-1/2 overflow-hidden rounded-[0.9rem] border border-line bg-paper-deep shadow-[0_12px_30px_-12px_rgba(173,98,49,0.38),0_3px_10px_-4px_rgba(115,46,17,0.30)]"
          style={{ width: card.cardW, willChange: 'transform, opacity' }}
          initial={{ x: card.xs[0], y: card.ys[0], scale: card.ss[0], opacity: 0, zIndex: card.zs[0] }}
          animate={{ x: card.xs, y: card.ys, scale: card.ss, opacity: card.os, zIndex: card.zs }}
          transition={{
            duration: 3,
            delay: card.startDelay,
            ease: 'linear',
            times: card.times,
          }}
          // Centre the card on its point, then scale, tilt upright, and place —
          // a 2D transform only, so the card always faces the camera.
          transformTemplate={(latest) =>
            `translate(${latest.x}, ${latest.y}) rotate(${card.tilt}deg) scale(${latest.scale}) translate(-50%, -50%)`
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
              className="aspect-[3/4] w-full object-cover"
            />
          </picture>
        </motion.figure>
      ))}
    </div>
  )
}
