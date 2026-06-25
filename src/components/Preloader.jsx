import { useEffect, useState } from 'react'
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
                : { scale: [1, 1.06, 1], y: [0, -10, 0], rotate: [0, 4, 0] }
            }
            transition={
              reduce
                ? undefined
                : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <Bloom active={bloom} reduce={reduce} />
          </motion.div>

          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <p className="eyebrow">Getting set up for you</p>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-5xl tabular-nums tracking-tighter text-ink">
                {progress}
              </span>
              <span className="font-mono text-xs text-ink-soft">/ 100</span>
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
 * Layered pigment bloom — overlapping multiply circles. Each blob drifts,
 * breathes and re-scales on its own infinite loop (unique duration + phase),
 * so the pigment keeps bleeding for the whole load rather than springing once
 * and freezing. On `active` (load complete) they push outward and swell into
 * the dissolve. Static for reduced-motion users.
 */
function Bloom({ active, reduce }) {
  // dx/dy = wander amplitude (%), dur = loop length (s). Desynced on purpose.
  const blobs = [
    { c: '#B5395B', x: 0,   y: 0,   s: 1,    dx: 5,  dy: 6,  dur: 5.2 },
    { c: '#ED8A33', x: -22, y: 14,  s: 0.78, dx: 7,  dy: -5, dur: 6.4 },
    { c: '#3A7F9D', x: 20,  y: 18,  s: 0.7,  dx: -6, dy: 6,  dur: 7.1 },
    { c: '#AEBF56', x: 14,  y: -20, s: 0.6,  dx: 6,  dy: -7, dur: 5.8 },
    { c: '#E4889C', x: -16, y: -16, s: 0.66, dx: -7, dy: 5,  dur: 6.9 },
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
          // Continuous organic wander + breathe.
          animate = {
            x: [`${b.x}%`, `${b.x + b.dx}%`, `${b.x - b.dx * 0.6}%`, `${b.x}%`],
            y: [`${b.y}%`, `${b.y + b.dy}%`, `${b.y - b.dy * 0.6}%`, `${b.y}%`],
            scale: [b.s, b.s * 1.12, b.s * 0.93, b.s],
          }
          transition = { duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }
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
              willChange: reduce ? 'auto' : 'transform',
            }}
            animate={animate}
            transition={transition}
          />
        )
      })}
    </div>
  )
}
