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

// The whole body of work, swirled. The hero's own two studies (character-boy,
// bouquet) are deliberately absent — they are what stays once the flurry has
// drifted off toward the gallery. A few pieces repeat so the ring reads full
// without demanding more source images; at this speed the reprise is invisible.
const PIECES = [
  'art-couple-vows',
  'art-couple-sage',
  'art-couple-blush',
  'art-character-girl',
  'art-character-boy2',
  'art-couple-sage',
  'art-couple-vows',
  'art-couple-blush',
  'art-character-girl',
  'art-character-boy2',
  'art-couple-sage',
  'art-couple-blush',
]

// Deterministic per-card jitter (height along the cylinder wall, spin phase,
// scale) so the ring reads as a scattered flurry rather than a rigid carousel.
// Seeded, not random, so the composition is the same every arrival.
const jitter = (i) => {
  const s = Math.sin(i * 12.9898) * 43758.5453
  return s - Math.floor(s)
}

/**
 * HeroFlurry — the load flourish. On the first arrival of a session the body
 * of work fans onto an invisible vertical cylinder and orbits through a
 * half-turn of layered depth, then each piece cascades downward — toward the
 * gallery waiting below the fold — and fades, leaving only the two hero
 * studies settling into place beneath.
 *
 * Runs on every device (the motion is transform + opacity only, which phones
 * handle well), but yields entirely to reduced-motion: no swirl, just the
 * hero's own quiet entrance. It mounts once, plays for ~3s, then unmounts so
 * it costs nothing for the rest of the visit.
 */
export default function HeroFlurry() {
  const reduce = useReducedMotion()
  const isMobile = useMediaQuery('(max-width: 639px)')
  const [skip] = useState(shouldSkip)
  const [done, setDone] = useState(false)

  // Fewer, tighter cards on phones — lighter to paint and better proportioned
  // to a narrow viewport. Fixed once on mount; a 3s flourish needn't chase
  // resizes mid-flight.
  const count = isMobile ? 7 : PIECES.length
  const radius = isMobile ? '30vmin' : '35vmin'

  const cards = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * 360
        const j = jitter(i)
        return {
          img: PIECES[i % PIECES.length],
          angle,
          // Scatter each piece up or down the cylinder wall, and vary size so
          // near pieces read heavier than far ones.
          lift: (j - 0.5) * 34, // % of card height, up or down the wall
          scale: 0.82 + jitter(i + 7) * 0.4,
          delay: jitter(i + 3) * 0.5, // staggered dispersal, seeded
        }
      }),
    [count],
  )

  // Retire the overlay once the last piece has fallen. Skips straight to done
  // when there's nothing to play, so no timer runs under reduced-motion / skip.
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
    const t = window.setTimeout(() => setDone(true), 3200)
    return () => window.clearTimeout(t)
  }, [skip, reduce])

  if (skip || reduce || done) return null

  const fall = typeof window !== 'undefined' ? window.innerHeight * 0.95 : 900

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 grid place-items-center overflow-hidden"
      style={{ perspective: isMobile ? '900px' : '1200px' }}
    >
      <motion.div
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
        initial={{ rotateY: -34 }}
        animate={{ rotateY: 188 }}
        transition={{ duration: 1.5, ease: [0.22, 0.61, 0.36, 1] }}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{
              // Place on the cylinder wall: face radially outward (rotateY),
              // push out to the wall (translateZ), then scatter up/down it.
              transform: `translate(-50%, -50%) rotateY(${card.angle}deg) translateZ(${radius}) translateY(${card.lift}%)`,
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
          >
            <motion.figure
              className="overflow-hidden rounded-[0.9rem] border border-line bg-paper-deep shadow-[0_12px_30px_-12px_rgba(173,98,49,0.38),0_3px_10px_-4px_rgba(115,46,17,0.30)]"
              style={{
                width: isMobile ? 'clamp(72px,24vw,116px)' : 'clamp(96px,13vmin,152px)',
                willChange: 'transform, opacity',
              }}
              initial={{ opacity: 0, y: 0, scale: card.scale * 0.6 }}
              animate={{
                opacity: [0, 1, 1, 0],
                // Orbit first, then fall toward the gallery and fade.
                y: [0, 0, 0, fall],
                scale: [card.scale * 0.6, card.scale, card.scale, card.scale * 0.78],
              }}
              transition={{
                duration: 2.1,
                delay: 0.1 + card.delay,
                times: [0, 0.16, 0.52, 1],
                ease: [0.4, 0, 0.7, 1],
              }}
            >
              <picture>
                <source srcSet={asset(`assets/${card.img}.webp`)} type="image/webp" />
                <img
                  src={asset(`assets/${card.img}.jpg`)}
                  alt=""
                  loading="eager"
                  fetchpriority="low"
                  decoding="async"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  className="aspect-[3/4] w-full object-cover"
                />
              </picture>
            </motion.figure>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
