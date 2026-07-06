import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion, useTransform } from 'framer-motion'

// A hand-drawn vine, snaking down in the same wobbly-brush language as the
// Underline squiggles and Sparkles ticks — just stretched tall and given a
// little curl at the tail, like a paintbrush lifting off the page.
const STROKE_D =
  'M46 4C70 28 70 56 46 80C22 104 22 132 46 156' +
  'C70 180 70 208 46 232C22 256 22 284 46 308' +
  'C70 332 70 360 46 384C22 408 22 436 46 460' +
  'C64 476 66 494 54 506C44 516 32 510 35 498' +
  'C37 490 46 490 48 496'

const SAMPLE_COUNT = 32

/**
 * The hero title's scroll companion: a watercolour vine that draws itself in
 * behind the headline as the section scrolls past, with a bead of pigment
 * riding its tip — the scroll-driven counterpart to HeroBrush's
 * cursor-driven one. Shares the hero's own scrollYProgress so it needs no
 * extra scroll listener. Hidden under reduced-motion, where a constantly
 * drawing line is the wrong call.
 */
export default function HeroStroke({ scrollYProgress, className = '' }) {
  const reduce = useReducedMotion()
  const uid = useId().replace(/:/g, '')
  const pathRef = useRef(null)
  const [points, setPoints] = useState(null)

  useEffect(() => {
    const el = pathRef.current
    if (!el) return
    const total = el.getTotalLength()
    setPoints(
      Array.from({ length: SAMPLE_COUNT + 1 }, (_, i) => {
        const t = i / SAMPLE_COUNT
        const { x, y } = el.getPointAtLength(t * total)
        return { t, x, y }
      })
    )
  }, [])

  const tRange = points ? points.map((p) => p.t) : [0, 1]
  const dropX = useTransform(scrollYProgress, tRange, points ? points.map((p) => p.x) : [46, 46])
  const dropY = useTransform(scrollYProgress, tRange, points ? points.map((p) => p.y) : [4, 496])

  if (reduce) return null

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 92 520"
      className={'overflow-visible ' + className}
    >
      <defs>
        <linearGradient id={`hero-stroke-grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D6A63C" />
          <stop offset="55%" stopColor="#2E5C8C" />
          <stop offset="100%" stopColor="#8C2E3C" />
        </linearGradient>
      </defs>

      {/* Faint undrawn guide, always present */}
      <path
        d={STROKE_D}
        fill="none"
        stroke="#C7CAD6"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* The stroke itself, filling in as the hero scrolls past */}
      <motion.path
        ref={pathRef}
        d={STROKE_D}
        fill="none"
        stroke={`url(#hero-stroke-grad-${uid})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        style={{ pathLength: scrollYProgress }}
      />

      {/* Pigment bead riding the drawn tip */}
      {points && (
        <motion.circle
          r="6"
          fill={`url(#hero-stroke-grad-${uid})`}
          style={{
            x: dropX,
            y: dropY,
            filter: 'drop-shadow(0 2px 5px rgba(115,46,17,0.45))',
          }}
          animate={{ scale: [1, 1.16, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </svg>
  )
}
