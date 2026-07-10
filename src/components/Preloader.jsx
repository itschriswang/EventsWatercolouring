import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import InkSpreadReveal from './InkSpreadReveal'
import { whenFontsReady, whenImagesReady, whenInkReady } from '../lib/pageReady.js'

// The two hero paintings — the LCP art the reveal exists to unveil. They're
// <link rel="preload"> in index.html, so gating on them (rather than the whole
// page's `load`) lifts the curtain the moment the hero can paint, not after
// every below-fold asset has arrived. Keep in step with index.html's preloads.
const HERO_ART = ['/assets/art-character-boy.webp', '/assets/art-bouquet.webp']

// Session flag so the intro plays once per visit, not once per page load —
// coming back from /faq/ (or any internal navigation) skips straight to the
// page instead of replaying the curtain.
const SEEN_KEY = 'ew-intro-seen'

// Whether to skip the intro entirely. Two cases, both "navigating, not
// arriving": the visitor has already seen the intro this session, or they are
// landing on an anchor (e.g. /#offerings from the FAQ nav) and a curtain
// would only stand between them and the section they asked for.
const shouldSkip = () => {
  if (typeof window === 'undefined') return false
  try {
    if (window.sessionStorage.getItem(SEEN_KEY)) return true
  } catch {
    // Storage blocked (private mode etc.) — fall through to the hash check.
  }
  return window.location.hash.length > 1
}

/**
 * Full-viewport intro. A brief, honest one: a watercolour bloom breathes in,
 * then dissolves through a fluid clip-path mask to reveal the hero — around a
 * second, start to finish. It is an entrance, not a loading screen: it tracks
 * no progress and gates nothing, so it never pretends to a number, and it
 * plays only on the first arrival of a session (see shouldSkip above).
 */
export default function Preloader({ onDone }) {
  const done = onDone
  const reduce = useReducedMotion()
  const [skip] = useState(shouldSkip)
  const [bloom, setBloom] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    try {
      window.sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      // Best effort — without storage the intro simply replays next visit.
    }
    if (skip) {
      done?.()
      return
    }

    let cancelled = false
    const timers = []
    timers.push(window.setTimeout(() => setBloom(true), reduce ? 60 : 420))

    // Hold the reveal until the page is actually painted (window load + fonts)
    // and the ink sprite is decoded, so the curtain lifts on a finished hero
    // instead of a blank wash — and the peel runs smoothly rather than snapping
    // on a not-yet-decoded mask. A minimum dwell lets the bloom breathe, and a
    // cap means a slow asset can never leave the intro hanging.
    const start = performance.now()
    const MIN = reduce ? 140 : 950
    const CAP = reduce ? 500 : 3200
    const gates = [whenFontsReady(CAP), whenImagesReady(HERO_ART, CAP)]
    if (!reduce) gates.push(whenInkReady())
    // Race the readiness gate against a hard cap: on a slow link the sprite
    // download (or a stubborn asset) must never leave the intro hanging.
    const capped = new Promise((r) => window.setTimeout(r, CAP))
    Promise.race([Promise.all(gates), capped]).then(() => {
      if (cancelled) return
      const wait = Math.max(0, MIN - (performance.now() - start))
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return
          setGone(true)
          timers.push(window.setTimeout(() => done?.(), reduce ? 80 : 260))
        }, wait),
      )
    })

    return () => {
      cancelled = true
      timers.forEach(window.clearTimeout)
    }
  }, [skip, reduce, done])

  if (skip) return null

  return (
    <>
      <AnimatePresence>
        {!gone && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper paper-grain"
            initial={false}
            // Fade the intro sheet out (rather than a clip-path collapse) so it
            // hands off cleanly to the ink cover behind it — both are paper, so
            // there's no seam; the ink retraction then owns the reveal.
            exit={{ opacity: 0, transition: { duration: reduce ? 0.25 : 0.5 } }}
          >
            <div className="relative grid h-40 w-40 place-items-center sm:h-48 sm:w-48">
              <Bloom active={bloom} reduce={reduce} />
            </div>

            <p className="mt-8 font-sentient text-xl tracking-[-0.01em] text-ink">
              chris wang<span className="text-terracotta">.</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Motion flow only — the ink cover would trap the page under a
          non-animating sheet under reduced motion, so it's simply omitted
          there (the fade above is the reveal instead). */}
      {!reduce && <InkSpreadReveal reveal={gone} />}
    </>
  )
}

/**
 * Layered pigment bloom — overlapping multiply circles that breathe in once,
 * then flare open as the mask dissolves. No infinite loops: the whole thing
 * lives for about a second.
 */
function Bloom({ active, reduce }) {
  const blobs = [
    { c: '#C1608C', x: 0,   y: 0,   s: 1 },
    { c: '#E89B63', x: -22, y: 14,  s: 0.78 },
    { c: '#8A9143', x: 20,  y: 18,  s: 0.7 },
    { c: '#D8DC8F', x: 14,  y: -20, s: 0.6 },
    { c: '#EBAFC2', x: -16, y: -16, s: 0.66 },
  ]
  return (
    <div className="relative h-full w-full">
      {blobs.map((b, i) => {
        const rest = { x: `${b.x}%`, y: `${b.y}%`, scale: b.s, opacity: 1 }
        let initial
        let animate
        if (reduce) {
          initial = rest
          animate = active ? { ...rest, opacity: 0 } : rest
        } else if (active) {
          initial = false
          animate = { ...rest, scale: b.s * 3, opacity: 0 }
        } else {
          initial = { ...rest, scale: b.s * 0.6, opacity: 0 }
          animate = rest
        }
        return (
          <motion.span
            key={i}
            className="absolute inset-0 m-auto rounded-full mix-blend-multiply"
            style={{
              width: '62%',
              height: '62%',
              backgroundColor: b.c,
              filter: 'blur(2px)',
            }}
            initial={initial}
            animate={animate}
            transition={
              active
                ? { duration: reduce ? 0.2 : 0.55, ease: 'easeOut' }
                : { duration: 0.5, ease: [0.22, 0.61, 0.36, 1], delay: i * 0.05 }
            }
          />
        )
      })}
    </div>
  )
}
