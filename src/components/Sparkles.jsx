import { useRef } from 'react'
import { motion, useReducedMotion, useInView } from 'framer-motion'

// A hand-drawn sparkle cluster — one tall four-point twinkle, a smaller one
// at its shoulder, and a stray tick — sharing the Underline squiggles'
// brush language: slightly wobbly strokes, round caps, currentColor. Each
// stroke wicks in with a pathLength draw once the cluster scrolls into
// view, staggered so the cluster reads as dotted onto the page one flick
// at a time. Reduced-motion gets the static drawing.
const STROKES = [
  // Big twinkle — vertical then horizontal
  { d: 'M36 24Q37.8 39 36.2 52Q35.2 64 36.9 76', delay: 0 },
  { d: 'M11 50Q25 48.2 39 49.6Q51 50.7 62 49.7', delay: 0.1 },
  // Small twinkle, top right
  { d: 'M76 7Q77.2 15 75.8 23Q75.1 29 76.5 34', delay: 0.26 },
  { d: 'M61 21Q68 19.6 76 20.7Q84 21.7 91 20.5', delay: 0.34 },
  // Stray tick, lower right
  { d: 'M79 61Q81.6 66 83.8 72', delay: 0.48 },
]

// A second, chunkier mark for variety — a filled four-point "asteroid" star
// (the classic ✦ sparkle silhouette) paired with one small stray twinkle tick,
// so a burst still reads as part of the same hand-drawn family rather than a
// stock icon. Scales/fades in rather than drawing a stroke, since it's a
// filled shape, not a line.
const BURST_STAR =
  'M50 4C52.5 27 56 41 61 46C66 51 80 54.5 96 57C80 59.5 66 63 61 68C56 73 52.5 87 50 110C47.5 87 44 73 39 68C34 63 20 59.5 4 57C20 54.5 34 51 39 46C44 41 47.5 27 50 4Z'
const BURST_TICK = { d: 'M78 20Q80.4 25.4 82.9 31.6', delay: 0.3 }

export default function Sparkles({ className = '', delay = 0, variant = 'twinkle' }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const drawn = reduce || inView

  if (variant === 'burst') {
    return (
      <svg
        ref={ref}
        aria-hidden="true"
        viewBox="0 0 100 114"
        fill="none"
        className={'pointer-events-none ' + className}
      >
        <motion.path
          d={BURST_STAR}
          fill="currentColor"
          initial={false}
          animate={
            drawn
              ? { scale: 1, opacity: 1, rotate: 0 }
              : { scale: 0.35, opacity: 0, rotate: -18 }
          }
          transition={
            reduce
              ? { duration: 0 }
              : { type: 'spring', stiffness: 210, damping: 14, delay }
          }
          style={{ transformOrigin: '50px 57px' }}
        />
        <motion.path
          d={BURST_TICK.d}
          stroke="currentColor"
          strokeWidth="5.5"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: drawn ? 1 : 0, opacity: drawn ? 1 : 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 0.35, delay: delay + BURST_TICK.delay, ease: [0.65, 0, 0.35, 1] }
          }
        />
      </svg>
    )
  }

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      viewBox="0 0 100 100"
      fill="none"
      className={'pointer-events-none ' + className}
    >
      {STROKES.map((s, i) => (
        <motion.path
          key={i}
          d={s.d}
          stroke="currentColor"
          strokeWidth="5.5"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: drawn ? 1 : 0, opacity: drawn ? 1 : 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 0.4, delay: delay + s.delay, ease: [0.65, 0, 0.35, 1] }
          }
        />
      ))}
    </svg>
  )
}
