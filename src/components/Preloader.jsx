import { useEffect, useId, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { SPRING, SPRING_SOFT } from '../lib/site.js'

/**
 * Full-viewport preloader. Tracks a 0→100% load and floats a physics-based
 * watercolour bloom you can nudge and drag — but it is NOT a gate. The instant
 * the load completes it auto-dissolves with a fluid clip-path mask, revealing
 * the hero beneath. No click required.
 */
export default function Preloader({ onDone }) {
  const done = onDone
  const reduce = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const [bloom, setBloom] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    let frame
    const start = performance.now()
    const duration = reduce ? 350 : 1700
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(Math.round(eased * 100))
      if (t < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        // Bloom, then dissolve automatically.
        setBloom(true)
        window.setTimeout(() => setGone(true), reduce ? 120 : 620)
        window.setTimeout(() => done?.(), reduce ? 200 : 1000)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reduce, done])

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
                  transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] },
                }
          }
          style={{ clipPath: 'circle(150% at 50% 45%)' }}
        >
          {/* Floating, draggable watercolour bloom (playful, not required) */}
          <motion.div
            className="relative grid h-44 w-44 cursor-grab place-items-center active:cursor-grabbing sm:h-56 sm:w-56"
            drag={!reduce}
            dragSnapToOrigin
            dragElastic={0.4}
            dragConstraints={{ left: -60, right: 60, top: -50, bottom: 50 }}
            whileTap={{ scale: 0.96 }}
            animate={
              reduce
                ? {}
                : { scale: [1, 1.05, 1.09, 1.02, 1.07, 1], y: [0, -8, -16, -3, -11, 0], rotate: [0, 2, -1, 4, -2, 0] }
            }
            transition={
              reduce
                ? undefined
                : { duration: 10, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <Bloom active={bloom} reduce={reduce} />
          </motion.div>

          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <p className="eyebrow">Getting set up for you</p>
            <div className="flex items-baseline gap-3">
              <span className="num-wide text-5xl tabular-nums text-ink">
                {progress}
              </span>
              <span className="num-wide text-xs text-ink-soft">/ 100</span>
            </div>
            <div className="h-px w-48 overflow-hidden bg-line">
              <motion.div
                className="h-full bg-terracotta"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Layered pigment bloom — overlapping watercolour blobs, each rendered with
 * the same turbulence-displaced, edge-darkened recipe as the full-page
 * WatercolourBloom washes (see WatercolourBloom.jsx) instead of flat circles,
 * so the loading mark reads as hand-painted rather than graphic. Each blob
 * drifts, breathes and re-scales on its own infinite loop (unique duration +
 * phase), so the pigment keeps bleeding for the whole load rather than
 * springing once and freezing. Static for reduced-motion users.
 */
function Bloom({ active, reduce }) {
  // dx/dy = wander amplitude (%), dur = loop length (s), rot = max rotation (deg). Heavily desynced.
  const blobs = [
    { c: '#B5395B', rim: '#7A2A45', x: 0,   y: 0,   s: 1,    dx: 15,  dy: 12,  dur: 5.4, rot: 0,   seed: 3  },
    { c: '#ED8A33', rim: '#C0691A', x: -22, y: 14,  s: 0.78, dx: 17,  dy: -11, dur: 7.8, rot: 11,  seed: 11 },
    { c: '#3A7F9D', rim: '#285A72', x: 20,  y: 18,  s: 0.7,  dx: -13, dy: 14,  dur: 9.3, rot: -8,  seed: 19 },
    { c: '#AEBF56', rim: '#84943A', x: 14,  y: -20, s: 0.6,  dx: 12,  dy: -16, dur: 6.5, rot: 14,  seed: 27 },
    { c: '#E4889C', rim: '#C06C82', x: -16, y: -16, s: 0.66, dx: -16, dy: 11,  dur: 8.7, rot: -12, seed: 35 },
  ]
  return (
    <div className="relative h-full w-full">
      {blobs.map((b, i) => {
        let animate
        let transition

        if (reduce) {
          animate = { x: `${b.x}%`, y: `${b.y}%`, scale: b.s }
          transition = { duration: 0.4 }
        } else {
          // Six-waypoint wander so the path never feels like a simple ping-pong.
          // Each axis uses a different phase offset, giving an unpredictable figure.
          animate = {
            x: [
              `${b.x}%`,
              `${b.x + b.dx}%`,
              `${b.x + b.dx * 0.25}%`,
              `${b.x - b.dx * 0.85}%`,
              `${b.x - b.dx * 0.3}%`,
              `${b.x}%`,
            ],
            y: [
              `${b.y}%`,
              `${b.y - b.dy * 0.45}%`,
              `${b.y + b.dy}%`,
              `${b.y + b.dy * 0.35}%`,
              `${b.y - b.dy * 0.75}%`,
              `${b.y}%`,
            ],
            scale: [b.s, b.s * 1.2, b.s * 0.86, b.s * 1.16, b.s * 0.92, b.s],
            rotate: [0, b.rot, b.rot * 0.4, -b.rot * 0.65, b.rot * 0.25, 0],
          }
          // Large per-blob delay gaps (0.9s apart) so they never sync up.
          transition = { duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.9 }
        }

        return (
          <motion.span
            key={i}
            className="absolute inset-0 m-auto"
            style={{
              width: '62%',
              height: '62%',
              willChange: reduce ? 'auto' : 'transform',
            }}
            animate={animate}
            transition={transition}
          >
            <PigmentBlob color={b.c} rim={b.rim} seed={b.seed} />
          </motion.span>
        )
      })}
    </div>
  )
}

/** A single hand-painted pigment blob: turbulence-warped edge, an edge-darkened
 *  rim and fine granulation, matching WatercolourBloom's recipe at icon scale. */
function PigmentBlob({ color, rim, seed }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" style={{ mixBlendMode: 'multiply' }}>
      <defs>
        <radialGradient id={`pb-g-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.85" />
          <stop offset="55%" stopColor={color} stopOpacity="0.72" />
          <stop offset="78%" stopColor={rim} stopOpacity="0.62" />
          <stop offset="100%" stopColor={rim} stopOpacity="0" />
        </radialGradient>
        <filter id={`pb-f-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed={seed} result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="9" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="1.6" result="soft" />
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed + 5} result="grain" />
          <feComposite in="soft" in2="grain" operator="arithmetic" k1="0.1" k2="0.9" k3="0" k4="0" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#pb-g-${uid})`} filter={`url(#pb-f-${uid})`} />
    </svg>
  )
}
