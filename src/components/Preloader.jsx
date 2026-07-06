import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

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
    const timers = [
      window.setTimeout(() => setBloom(true), reduce ? 60 : 420),
      window.setTimeout(() => setGone(true), reduce ? 140 : 820),
      window.setTimeout(() => done?.(), reduce ? 220 : 1100),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [skip, reduce, done])

  if (skip) return null

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper paper-grain"
          initial={false}
          exit={
            reduce
              ? { opacity: 0, transition: { duration: 0.25 } }
              : {
                  clipPath: 'circle(0% at 50% 45%)',
                  transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] },
                }
          }
          style={{ clipPath: 'circle(150% at 50% 45%)' }}
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
  )
}

/**
 * Layered pigment bloom — overlapping multiply circles that breathe in once,
 * then flare open as the mask dissolves. No infinite loops: the whole thing
 * lives for about a second.
 */
function Bloom({ active, reduce }) {
  const blobs = [
    { c: '#A82E6E', x: 0,   y: 0,   s: 1 },
    { c: '#C97A2E', x: -22, y: 14,  s: 0.78 },
    { c: '#1F6E7E', x: 20,  y: 18,  s: 0.7 },
    { c: '#A8BF3C', x: 14,  y: -20, s: 0.6 },
    { c: '#C97A94', x: -16, y: -16, s: 0.66 },
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
