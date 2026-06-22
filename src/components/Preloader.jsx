import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { SPRING, SPRING_SOFT } from '../lib/site.js'

/**
 * Section A — the gamified preloader.
 * Blocks the viewport, tracks a 0→100% load, and floats a draggable
 * "watercolour bloom". Once loaded the prompt reads "Paint to enter"; a click
 * blooms the pigment and wipes the loader away with a fluid clip-path reveal.
 */
export default function Preloader({ onEnter }) {
  const reduce = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const [painting, setPainting] = useState(false)
  const [gone, setGone] = useState(false)

  // Simulated load — eases toward 100, then unlocks the "paint to enter" state.
  useEffect(() => {
    let frame
    const start = performance.now()
    const duration = reduce ? 400 : 1600
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutCubic for an organic fill.
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(Math.round(eased * 100))
      if (t < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        setReady(true)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reduce])

  const enter = () => {
    if (!ready || painting) return
    setPainting(true)
    // Let the bloom expand, then unmount the overlay and reveal the hero.
    const delay = reduce ? 200 : 900
    window.setTimeout(() => setGone(true), delay)
    window.setTimeout(() => onEnter?.(), delay + (reduce ? 0 : 400))
  }

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper paper-grain"
          initial={false}
          exit={
            reduce
              ? { opacity: 0 }
              : {
                  // Fluid clip-path wipe — a soft blob iris closing upward.
                  clipPath: 'circle(0% at 50% 42%)',
                  transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] },
                }
          }
          style={{ clipPath: 'circle(150% at 50% 42%)' }}
        >
          {/* Floating, draggable watercolour bloom */}
          <motion.button
            type="button"
            onClick={enter}
            disabled={!ready}
            aria-label={ready ? 'Paint to enter the site' : 'Loading'}
            className="relative grid h-44 w-44 place-items-center rounded-full focus-visible:outline-offset-8 disabled:cursor-progress sm:h-56 sm:w-56"
            drag={!reduce && ready}
            dragSnapToOrigin
            dragElastic={0.35}
            dragConstraints={{ left: -60, right: 60, top: -50, bottom: 50 }}
            whileTap={{ scale: 0.94 }}
            animate={
              reduce
                ? {}
                : painting
                  ? { scale: 9, opacity: 0.9 }
                  : {
                      scale: [1, 1.06, 1],
                      y: [0, -10, 0],
                      rotate: [0, 4, 0],
                    }
            }
            transition={
              painting
                ? { ...SPRING_SOFT, duration: 0.9 }
                : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <Bloom active={painting} />
          </motion.button>

          {/* Prompt + progress */}
          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <AnimatePresence mode="wait">
              {ready ? (
                <motion.p
                  key="prompt"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={SPRING}
                  className="font-mono text-[0.7rem] uppercase tracking-[0.4em] text-ink-soft"
                >
                  Paint to enter
                </motion.p>
              ) : (
                <motion.p
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-[0.7rem] uppercase tracking-[0.4em] text-ink-soft"
                >
                  Mixing pigments
                </motion.p>
              )}
            </AnimatePresence>

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

/** The layered pigment bloom — overlapping multiply circles that breathe. */
function Bloom({ active }) {
  const blobs = [
    { c: '#B5395B', x: 0, y: 0, s: 1 },
    { c: '#ED8A33', x: -22, y: 14, s: 0.78 },
    { c: '#3A7F9D', x: 20, y: 18, s: 0.7 },
    { c: '#AEBF56', x: 14, y: -20, s: 0.6 },
    { c: '#E4889C', x: -16, y: -16, s: 0.66 },
  ]
  return (
    <div className="relative h-full w-full">
      {blobs.map((b, i) => (
        <motion.span
          key={i}
          // Each blob is centered by inset-0 + margin auto, then offset via x/y.
          className="absolute inset-0 m-auto rounded-full mix-blend-multiply"
          style={{
            width: '62%',
            height: '62%',
            backgroundColor: b.c,
            filter: 'blur(2px)',
          }}
          animate={{
            x: `${b.x}%`,
            y: `${b.y}%`,
            scale: active ? b.s * 1.3 : b.s,
          }}
          transition={{ ...SPRING, delay: i * 0.04 }}
        />
      ))}
      {/* Inner highlight to suggest wet paper sheen */}
      <span className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-paper/70 blur-[2px]" />
    </div>
  )
}
